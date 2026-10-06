package com.sanjeevani.backend.controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class HealthController {
    
    @GetMapping("/api/health")
    public String healthCheck() {
        return "Backend is running smoothly!";
    }
    
}             
