package com.eam.system.controller;

import com.eam.common.Result;
import com.eam.system.entity.SysUser;
import com.eam.system.service.ISysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/system/user")
public class SysUserController {

    @Autowired
    private ISysUserService userService;

    @GetMapping("/list")
    public Result<List<SysUser>> list() {
        return Result.success(userService.list());
    }

    @GetMapping("/{id}")
    public Result<SysUser> getInfo(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @PostMapping
    public Result<Void> add(@RequestBody SysUser user) {
        userService.save(user);
        return Result.success();
    }

    @PutMapping
    public Result<Void> edit(@RequestBody SysUser user) {
        userService.updateById(user);
        return Result.success();
    }

    @DeleteMapping("/{ids}")
    public Result<Void> remove(@PathVariable List<Long> ids) {
        userService.removeByIds(ids);
        return Result.success();
    }
}
