package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.entity.SymptomLog;
import com.sanjeevani.backend.repository.SymptomLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/symptom-logs")
public class SymptomLogController {

    private final SymptomLogRepository repository;

    public SymptomLogController(SymptomLogRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public SymptomLog create(@RequestBody SymptomLog log) {
        return repository.save(log);
    }

    @GetMapping
    public List<SymptomLog> getAll() {
        return repository.findAll();
    }
}