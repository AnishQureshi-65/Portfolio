package com.portfolio.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public String home() {
        return "Portfolio Backend is Running Successfully!";
    }

    @GetMapping("/api/health")
    public String health() {
        return "Portfolio Backend is Healthy!";
    }
}