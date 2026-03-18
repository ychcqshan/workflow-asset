package com.eam;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.eam.**.mapper")
public class EamApplication {
    public static void main(String[] args) {
        SpringApplication.run(EamApplication.class, args);
    }
}
