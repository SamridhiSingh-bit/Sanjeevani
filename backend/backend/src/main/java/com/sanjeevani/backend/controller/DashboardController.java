package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.entity.SymptomLog;
import com.sanjeevani.backend.entity.VitalLog;
import com.sanjeevani.backend.entity.WellnessLog;
import com.sanjeevani.backend.repository.SymptomLogRepository;
import com.sanjeevani.backend.repository.VitalLogRepository;
import com.sanjeevani.backend.repository.WellnessLogRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final WellnessLogRepository wellnessLogs;
    private final VitalLogRepository vitalLogs;
    private final SymptomLogRepository symptomLogs;

    public DashboardController(
            WellnessLogRepository wellnessLogs,
            VitalLogRepository vitalLogs,
            SymptomLogRepository symptomLogs) {
        this.wellnessLogs = wellnessLogs;
        this.vitalLogs = vitalLogs;
        this.symptomLogs = symptomLogs;
    }

    @GetMapping
    public DashboardSummary getSummary() {
        return new DashboardSummary(
                wellnessLogs.count(),
                vitalLogs.count(),
                symptomLogs.count(),
                wellnessLogs.findFirstByOrderByLogDateDesc().orElse(null),
                vitalLogs.findFirstByOrderByRecordedAtDesc().orElse(null),
                symptomLogs.findFirstByOrderByStartedAtDesc().orElse(null));
    }

    public record DashboardSummary(
            long totalWellnessLogs,
            long totalVitalLogs,
            long totalSymptomLogs,
            WellnessLog latestWellnessLog,
            VitalLog latestVitalLog,
            SymptomLog latestSymptomLog) {
    }
}