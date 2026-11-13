package com.fraudshield.ai.service;

import com.fraudshield.ai.dto.AlertStatusUpdateDTO;
import com.fraudshield.ai.dto.TransactionScoreResponse;
import com.fraudshield.ai.entity.FraudAlert;
import com.fraudshield.ai.entity.TransactionRecord;
import com.fraudshield.ai.repository.FraudAlertRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AlertService {

    private final FraudAlertRepository alertRepository;
    private final AuditService auditService;

    public AlertService(FraudAlertRepository alertRepository, AuditService auditService) {
        this.alertRepository = alertRepository;
        this.auditService = auditService;
    }

    public Page<FraudAlert> getAlerts(String query, String status, String severity, Pageable pageable) {
        return alertRepository.filterAlerts(query, status, severity, pageable);
    }

    public Optional<FraudAlert> getAlertById(String alertId) {
        return alertRepository.findByAlertId(alertId);
    }

    @Transactional
    public FraudAlert updateAlert(String alertId, AlertStatusUpdateDTO dto, String performedBy) {
        FraudAlert alert = alertRepository.findByAlertId(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));

        String oldStatus = alert.getStatus();
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            alert.setStatus(dto.getStatus().toUpperCase());
        }
        if (dto.getAssignedTo() != null) {
            alert.setAssignedTo(dto.getAssignedTo());
        }
        if (dto.getNotes() != null && !dto.getNotes().isBlank()) {
            String existingNotes = alert.getInvestigationNotes() != null ? alert.getInvestigationNotes() + "\n---\n" : "";
            alert.setInvestigationNotes(existingNotes + "[" + LocalDateTime.now() + " - " + performedBy + "]: " + dto.getNotes());
        }
        alert.setUpdatedAt(LocalDateTime.now());
        FraudAlert saved = alertRepository.save(alert);

        auditService.logAction(
                "UPDATE_ALERT_STATUS",
                performedBy,
                "FraudAlert",
                alertId,
                "Status changed from " + oldStatus + " to " + saved.getStatus(),
                "127.0.0.1"
        );

        return saved;
    }

    @Transactional
    public FraudAlert createAlertFromTransaction(TransactionRecord txn, TransactionScoreResponse scoreResp) {
        String alertId = "ALT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        FraudAlert alert = new FraudAlert();
        alert.setAlertId(alertId);
        alert.setTransactionId(txn.getTransactionId());
        alert.setRiskScore(txn.getRiskScore());

        if (txn.getRiskScore() >= 75) {
            alert.setSeverity("CRITICAL");
        } else if (txn.getRiskScore() >= 50) {
            alert.setSeverity("HIGH");
        } else {
            alert.setSeverity("MEDIUM");
        }

        alert.setStatus("PENDING");
        alert.setReason(scoreResp.getExplanationText() != null ? scoreResp.getExplanationText() : "Flagged by ML hybrid detection engine");
        alert.setCreatedAt(LocalDateTime.now());
        alert.setUpdatedAt(LocalDateTime.now());

        return alertRepository.save(alert);
    }

    public Map<String, Object> getAlertStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", alertRepository.count());
        stats.put("pending", alertRepository.countByStatus("PENDING"));
        stats.put("investigating", alertRepository.countByStatus("INVESTIGATING"));
        stats.put("resolved", alertRepository.countByStatus("RESOLVED"));
        stats.put("dismissed", alertRepository.countByStatus("DISMISSED"));
        stats.put("critical", alertRepository.countBySeverity("CRITICAL"));
        stats.put("high", alertRepository.countBySeverity("HIGH"));
        stats.put("medium", alertRepository.countBySeverity("MEDIUM"));
        return stats;
    }
}
