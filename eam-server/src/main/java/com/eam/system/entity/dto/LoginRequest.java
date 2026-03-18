package com.eam.system.entity.dto;

/**
 * 登录请求 DTO，仅包含用户名和密码字段。
 * 避免直接使用实体类接收请求体导致的序列化问题。
 */
public class LoginRequest {
    private String username;
    private String password;

    public LoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
