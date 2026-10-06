package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.entity.VitalLog;
import com.sanjeevani.backend.repository.VitalLogRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vitals")
public class VitalController {

    private final VitalLogRepository repository;

    public VitalController(VitalLogRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public VitalLog create(@RequestBody VitalLog vital) {
        return repository.save(vital);
    }

    @GetMapping
    public java.util.List<VitalLog> getAll() {
        return repository.findAll();
    }
}