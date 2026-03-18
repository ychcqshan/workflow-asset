package com.eam.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.eam.system.entity.SysDept;
import java.util.List;

public interface ISysDeptService extends IService<SysDept> {
    /**
     * 构建部门树结构
     */
    List<SysDept> buildDeptTree(List<SysDept> depts);
}
