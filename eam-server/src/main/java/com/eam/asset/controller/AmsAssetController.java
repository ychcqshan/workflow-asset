package com.eam.asset.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eam.common.Result;
import com.eam.asset.entity.AmsAsset;
import com.eam.asset.service.IAmsAssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.eam.common.utils.QRCodeUtils;

@RestController
@RequestMapping("/asset/ledger")
public class AmsAssetController {

    @Autowired
    private IAmsAssetService assetService;

    @GetMapping("/list")
    public Result<Page<AmsAsset>> list(@RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            AmsAsset asset) {
        Page<AmsAsset> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<AmsAsset> queryWrapper = new LambdaQueryWrapper<>();

        if (asset.getAssetName() != null && !asset.getAssetName().trim().isEmpty()) {
            queryWrapper.like(AmsAsset::getAssetName, asset.getAssetName());
        }
        if (asset.getStatus() != null && !asset.getStatus().trim().isEmpty()) {
            queryWrapper.eq(AmsAsset::getStatus, asset.getStatus());
        }
        if (asset.getCategoryId() != null) {
            queryWrapper.eq(AmsAsset::getCategoryId, asset.getCategoryId());
        }

        queryWrapper.orderByDesc(AmsAsset::getCreateTime);
        return Result.success(assetService.page(page, queryWrapper));
    }

    @PostMapping
    public Result<Void> add(@RequestBody AmsAsset asset) {
        // 自动生成编码
        if (asset.getAssetCode() == null) {
            asset.setAssetCode(assetService.generateAssetCode(asset.getCategoryId()));
        }
        assetService.save(asset);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<AmsAsset> getInfo(@PathVariable Long id) {
        return Result.success(assetService.getById(id));
    }

    @PutMapping
    public Result<Void> edit(@RequestBody AmsAsset asset) {
        assetService.updateById(asset);
        return Result.success();
    }

    @PostMapping("/import")
    public Result<Void> importAsset(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        com.alibaba.excel.EasyExcel.read(file.getInputStream(), com.eam.asset.entity.vo.AssetImportVo.class,
                new com.eam.asset.listener.AssetDataListener(assetService)).sheet().doRead();
        return Result.success();
    }

    @DeleteMapping("/{ids}")
    public Result<Void> remove(@PathVariable List<Long> ids) {
        assetService.removeByIds(ids);
        return Result.success();
    }

    @GetMapping("/qrcode/{id}")
    public ResponseEntity<byte[]> getQRCode(@PathVariable Long id) {
        AmsAsset asset = assetService.getById(id);
        if (asset == null || asset.getAssetCode() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            // 生成二维码，内容为资产编码（实际可能是一个资产详情H5地址）
            String qrContent = "ASSET:" + asset.getAssetCode();
            byte[] qrCodeImage = QRCodeUtils.generateQRCodeImage(qrContent, 250, 250);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            // 提示下载，或直接在浏览器展示
            // headers.setContentDispositionFormData("attachment", "QR_Asset_" +
            // asset.getAssetCode() + ".png");

            return new ResponseEntity<>(qrCodeImage, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
