package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.entity.Symptom;
import com.sanjeevani.backend.repository.SymptomRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    private final SymptomRepository repository;

    public SymptomController(SymptomRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Symptom create(@RequestBody Symptom symptom) {
        return repository.save(symptom);
    }

    @GetMapping
    public List<Symptom> getAll() {
        return repository.findAll();
    }
}