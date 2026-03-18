package com.eam.asset.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eam.asset.entity.AmsAsset;
import com.eam.asset.entity.AmsCategory;
import com.eam.asset.mapper.AmsAssetMapper;
import com.eam.asset.service.IAmsAssetService;
import com.eam.asset.service.IAmsCategoryService;
import com.eam.asset.service.IAmsAssetRecordService;
import com.eam.asset.entity.AmsAssetRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AmsAssetServiceImpl extends ServiceImpl<AmsAssetMapper, AmsAsset> implements IAmsAssetService {

    @Autowired
    private IAmsCategoryService categoryService;

    @Autowired
    private IAmsAssetRecordService recordService;

    @Override
    public String generateAssetCode(Long categoryId) {
        AmsCategory category = categoryService.getById(categoryId);
        String prefix = (category != null && category.getCategoryPrefix() != null) ? category.getCategoryPrefix()
                : "AST";

        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // 查询当天该前缀的资产数量，生成流水号 (示例逻辑，实际生产需 Redis 原子计数)
        long count = this.count(new LambdaQueryWrapper<AmsAsset>()
                .likeRight(AmsAsset::getAssetCode, prefix + dateStr));

        return String.format("%s%s%04d", prefix, dateStr, count + 1);
    }

    @Override
    public boolean save(AmsAsset entity) {
        boolean result = super.save(entity);
        if (result) {
            AmsAssetRecord record = new AmsAssetRecord();
            record.setAssetId(entity.getId());
            record.setRecordType("入库");
            record.setContent("资产初始入库登记");
            record.setCreateTime(LocalDateTime.now());
            // 这里应该从 SecurityContext 中获取当前用户 ID，为简化暂且用 1L 或者实体自带
            record.setOperatorId(1L);
            recordService.save(record);
        }
        return result;
    }

    @Override
    public boolean updateById(AmsAsset entity) {
        // 可以获取旧数据，对比差异详细记录
        AmsAsset oldAsset = this.getById(entity.getId());
        boolean result = super.updateById(entity);
        if (result) {
            AmsAssetRecord record = new AmsAssetRecord();
            record.setAssetId(entity.getId());
            record.setRecordType("信息变更");
            record.setContent("更新资产基础信息");
            record.setCreateTime(LocalDateTime.now());
            record.setOperatorId(1L);
            recordService.save(record);
        }
        return result;
    }
}
