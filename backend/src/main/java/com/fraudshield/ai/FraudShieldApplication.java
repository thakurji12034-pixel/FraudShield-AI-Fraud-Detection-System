package com.fraudshield.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FraudShieldApplication {
    public static void main(String[] args) {
        SpringApplication.run(FraudShieldApplication.class, args);
    }
}
