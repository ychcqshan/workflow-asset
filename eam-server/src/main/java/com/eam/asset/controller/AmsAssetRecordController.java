package com.eam.asset.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eam.common.Result;
import com.eam.asset.entity.AmsAssetRecord;
import com.eam.asset.service.IAmsAssetRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/asset/record")
public class AmsAssetRecordController {

    @Autowired
    private IAmsAssetRecordService recordService;

    @GetMapping("/list/{assetId}")
    public Result<List<AmsAssetRecord>> getRecordsByAssetId(@PathVariable Long assetId) {
        LambdaQueryWrapper<AmsAssetRecord> query = new LambdaQueryWrapper<>();
        query.eq(AmsAssetRecord::getAssetId, assetId);
        query.orderByDesc(AmsAssetRecord::getCreateTime);
        return Result.success(recordService.list(query));
    }
}
