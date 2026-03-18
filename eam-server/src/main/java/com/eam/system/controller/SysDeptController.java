package com.eam.system.controller;

import com.eam.common.Result;
import com.eam.system.entity.SysDept;
import com.eam.system.service.ISysDeptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/system/dept")
public class SysDeptController {

    @Autowired
    private ISysDeptService deptService;

    @GetMapping("/list")
    public Result<List<SysDept>> list() {
        List<SysDept> depts = deptService.list();
        return Result.success(depts);
    }

    @GetMapping("/tree")
    public Result<List<SysDept>> tree() {
        List<SysDept> depts = deptService.list();
        return Result.success(deptService.buildDeptTree(depts));
    }

    @PostMapping
    public Result<Void> add(@RequestBody SysDept dept) {
        deptService.save(dept);
        return Result.success();
    }

    @PutMapping
    public Result<Void> edit(@RequestBody SysDept dept) {
        deptService.updateById(dept);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        deptService.removeById(id);
        return Result.success();
    }
}
