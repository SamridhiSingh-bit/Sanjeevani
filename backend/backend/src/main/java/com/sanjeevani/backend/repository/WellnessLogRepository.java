package com.sanjeevani.backend.repository;

import com.sanjeevani.backend.entity.WellnessLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WellnessLogRepository extends JpaRepository<WellnessLog, Long> {
	Optional<WellnessLog> findFirstByOrderByLogDateDesc();
}