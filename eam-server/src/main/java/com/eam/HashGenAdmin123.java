package com.eam;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenAdmin123 {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("NEW_HASH_ADMIN123: " + encodedPassword);
        System.out.println("CURRENT_DB_HASH_MATCHES: "
                + encoder.matches(rawPassword, "$2a$10$tZ2R8M.z./4WjL61Wk8NquP5g.7oO/mP3JIZ7o2AOL5iHl7h8x/."));
    }
}
