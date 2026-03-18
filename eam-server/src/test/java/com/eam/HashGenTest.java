package com.eam;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenTest {

    @Test
    public void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashed = encoder.encode("admin123");
        System.out.println("@@@HASH_START@@@" + hashed + "@@@HASH_END@@@");
    }
}
