package com.fraudshield.ai.service;

import com.fraudshield.ai.entity.AuditLog;
import com.fraudshield.ai.repository.AuditLogRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void logAction(String action, String performedBy, String entityType, String entityId, String details, String ipAddress) {
        try {
            AuditLog log = new AuditLog(action, performedBy, entityType, entityId, details, ipAddress);
            auditLogRepository.save(log);
        } catch (Exception ex) {
            // Silently prevent audit failures from failing business operations
        }
    }
}
