package com.sanjeevani.backend.repository;

import com.sanjeevani.backend.entity.SymptomLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SymptomLogRepository extends JpaRepository<SymptomLog, Long> {
	Optional<SymptomLog> findFirstByOrderByStartedAtDesc();
}