package com.eam.asset.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eam.asset.entity.AmsCategory;
import com.eam.asset.mapper.AmsCategoryMapper;
import com.eam.asset.service.IAmsCategoryService;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmsCategoryServiceImpl extends ServiceImpl<AmsCategoryMapper, AmsCategory> implements IAmsCategoryService {

    @Override
    public List<AmsCategory> buildCategoryTree(List<AmsCategory> categories) {
        List<AmsCategory> returnList = new ArrayList<>();
        List<Long> tempList = categories.stream().map(AmsCategory::getId).collect(Collectors.toList());
        for (AmsCategory category : categories) {
            if (!tempList.contains(category.getParentId())) {
                recursionFn(categories, category);
                returnList.add(category);
            }
        }
        if (returnList.isEmpty()) {
            returnList = categories;
        }
        return returnList;
    }

    private void recursionFn(List<AmsCategory> list, AmsCategory t) {
        // FIXME: 此处为后续逻辑占位，待引入 DTO 后处理树形展开
    }
}
