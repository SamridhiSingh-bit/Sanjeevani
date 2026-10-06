package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.entity.HealthProfile;
import com.sanjeevani.backend.repository.HealthProfileRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class HealthProfileController {

    private final HealthProfileRepository repository;

    public HealthProfileController(HealthProfileRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public HealthProfile create(@RequestBody HealthProfile profile) {
        return repository.save(profile);
    }

    @GetMapping("/{id}")
    public HealthProfile get(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }
}