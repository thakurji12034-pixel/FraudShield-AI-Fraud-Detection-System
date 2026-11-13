package com.fraudshield.ai.controller;

import com.fraudshield.ai.dto.AlertStatusUpdateDTO;
import com.fraudshield.ai.entity.FraudAlert;
import com.fraudshield.ai.service.AlertService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<Page<FraudAlert>> getAlerts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(alertService.getAlerts(query, status, severity, pageable));
    }

    @GetMapping("/{alertId}")
    public ResponseEntity<?> getAlertById(@PathVariable String alertId) {
        return alertService.getAlertById(alertId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{alertId}/status")
    public ResponseEntity<FraudAlert> updateAlertStatus(
            @PathVariable String alertId,
            @RequestBody AlertStatusUpdateDTO dto,
            Principal principal) {
        String username = principal != null ? principal.getName() : "ANALYST";
        return ResponseEntity.ok(alertService.updateAlert(alertId, dto, username));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAlertStats() {
        return ResponseEntity.ok(alertService.getAlertStats());
    }
}
