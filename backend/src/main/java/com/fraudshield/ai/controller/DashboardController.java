package com.fraudshield.ai.controller;

import com.fraudshield.ai.dto.DashboardSummaryDTO;
import com.fraudshield.ai.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AnalyticsService analyticsService;

    public DashboardController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardSummaryDTO> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }
}
