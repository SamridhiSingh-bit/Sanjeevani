package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.entity.WellnessLog;
import com.sanjeevani.backend.repository.WellnessLogRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wellness")
public class WellnessController {

    private final WellnessLogRepository repository;

    public WellnessController(WellnessLogRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public WellnessLog create(@RequestBody WellnessLog log) {
        return repository.save(log);
    }

    @GetMapping
    public java.util.List<WellnessLog> getAll() {
        return repository.findAll();
    }
}