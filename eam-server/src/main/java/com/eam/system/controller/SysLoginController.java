package com.eam.system.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eam.common.Result;
import com.eam.common.utils.JwtUtils;
import com.eam.system.entity.SysUser;
import com.eam.system.entity.dto.LoginRequest;
import com.eam.system.service.ISysUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
public class SysLoginController {

    private static final Logger log = LoggerFactory.getLogger(SysLoginController.class);

    @Autowired
    private ISysUserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        log.debug("Login attempt for user: {}", loginRequest.getUsername());

        SysUser user = userService.getOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, loginRequest.getUsername()));

        if (user == null) {
            log.warn("User not found: {}", loginRequest.getUsername());
            return Result.error("用户名或密码错误");
        }

        boolean matches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        log.debug("User found: {}, Password matches: {}", user.getUsername(), matches);

        if (!matches) {
            return Result.error("用户名或密码错误");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("user_id", user.getId());
        claims.put("username", user.getUsername());

        String token = jwtUtils.createToken(claims);
        Map<String, Object> map = new HashMap<>();
        map.put("token", token);
        return Result.success(map);
    }
}
