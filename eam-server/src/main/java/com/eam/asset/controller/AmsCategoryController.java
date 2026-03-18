package com.eam.asset.controller;

import com.eam.common.Result;
import com.eam.asset.entity.AmsCategory;
import com.eam.asset.service.IAmsCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/asset/category")
public class AmsCategoryController {

    @Autowired
    private IAmsCategoryService categoryService;

    @GetMapping("/list")
    public Result<List<AmsCategory>> list() {
        return Result.success(categoryService.list());
    }

    @GetMapping("/tree")
    public Result<List<AmsCategory>> tree() {
        List<AmsCategory> list = categoryService.list();
        return Result.success(categoryService.buildCategoryTree(list));
    }

    @PostMapping
    public Result<Void> add(@RequestBody AmsCategory category) {
        categoryService.save(category);
        return Result.success();
    }

    @PutMapping
    public Result<Void> edit(@RequestBody AmsCategory category) {
        categoryService.updateById(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        categoryService.removeById(id);
        return Result.success();
    }
}
