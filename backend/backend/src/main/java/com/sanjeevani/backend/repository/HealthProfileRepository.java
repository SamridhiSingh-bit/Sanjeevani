package com.sanjeevani.backend.repository;

import com.sanjeevani.backend.entity.HealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {
}