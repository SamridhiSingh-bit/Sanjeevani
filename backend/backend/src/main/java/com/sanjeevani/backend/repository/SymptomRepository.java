package com.sanjeevani.backend.repository;

import com.sanjeevani.backend.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SymptomRepository extends JpaRepository<Symptom, Long> {
}