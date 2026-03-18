package com.eam;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "password";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("HASH: " + encodedPassword);
        System.out.println("MATCHES: "
                + encoder.matches(rawPassword, "$2a$10$7JB720yubVSZvUIWvT.G2.24tY2rS9p8u7.L4f.jV1z.R1q.K.2S6"));
    }
}
