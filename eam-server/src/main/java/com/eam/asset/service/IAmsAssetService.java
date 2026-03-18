package com.eam.asset.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.eam.asset.entity.AmsAsset;

public interface IAmsAssetService extends IService<AmsAsset> {
    /**
     * 生成资产编码
     */
    String generateAssetCode(Long categoryId);
}
