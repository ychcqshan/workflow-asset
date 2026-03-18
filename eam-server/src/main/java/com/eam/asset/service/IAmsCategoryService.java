package com.eam.asset.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.eam.asset.entity.AmsCategory;
import java.util.List;

public interface IAmsCategoryService extends IService<AmsCategory> {
    /**
     * 构建资产分类树
     */
    List<AmsCategory> buildCategoryTree(List<AmsCategory> categories);
}
