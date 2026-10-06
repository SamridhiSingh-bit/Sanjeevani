package com.sanjeevani.backend.repository;

import com.sanjeevani.backend.entity.VitalLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VitalLogRepository extends JpaRepository<VitalLog, Long> {
	Optional<VitalLog> findFirstByOrderByRecordedAtDesc();
}