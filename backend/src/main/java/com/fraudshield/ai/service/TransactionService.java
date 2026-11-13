package com.fraudshield.ai.service;

import com.fraudshield.ai.dto.TransactionScoreRequest;
import com.fraudshield.ai.dto.TransactionScoreResponse;
import com.fraudshield.ai.entity.CustomerProfile;
import com.fraudshield.ai.entity.FraudAlert;
import com.fraudshield.ai.entity.TransactionRecord;
import com.fraudshield.ai.repository.CustomerRepository;
import com.fraudshield.ai.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final MlServiceIntegration mlServiceIntegration;
    private final AlertService alertService;
    private final AuditService auditService;

    public TransactionService(TransactionRepository transactionRepository,
                              CustomerRepository customerRepository,
                              MlServiceIntegration mlServiceIntegration,
                              AlertService alertService,
                              AuditService auditService) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
        this.mlServiceIntegration = mlServiceIntegration;
        this.alertService = alertService;
        this.auditService = auditService;
    }

    public Page<TransactionRecord> getTransactions(String query, String type, String riskCategory, Boolean isFraud, Pageable pageable) {
        return transactionRepository.filterTransactions(query, type, riskCategory, isFraud, pageable);
    }

    public Optional<TransactionRecord> getTransactionById(String transactionId) {
        return transactionRepository.findByTransactionId(transactionId);
    }

    @Transactional
    public TransactionScoreResponse processTransaction(TransactionScoreRequest request, String performedBy) {
        if (request.getTransactionId() == null || request.getTransactionId().isBlank()) {
            request.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // 1. Call ML Engine
        TransactionScoreResponse response = mlServiceIntegration.predict(request);

        // 2. Persist Transaction Record
        TransactionRecord record = new TransactionRecord();
        record.setTransactionId(request.getTransactionId());
        record.setStep(request.getStep());
        record.setType(request.getType());
        record.setAmount(request.getAmount());
        record.setNameOrig(request.getNameOrig());
        record.setOldbalanceOrg(request.getOldbalanceOrg());
        record.setNewbalanceOrig(request.getOldbalanceOrg() != null ? Math.max(0.0, request.getOldbalanceOrg() - request.getAmount()) : 0.0);
        record.setNameDest(request.getNameDest());
        record.setOldbalanceDest(request.getOldbalanceDest());
        record.setNewbalanceDest(request.getOldbalanceDest() != null ? request.getOldbalanceDest() + request.getAmount() : request.getAmount());

        record.setIsFraud(response.getIsFraudPredicted());
        record.setFraudProbability(response.getFraudProbability());
        record.setRiskScore(response.getRiskScore());
        record.setRiskCategory(response.getRiskCategory());
        record.setRuleTriggered(response.getRuleTriggered());
        record.setModelUsed(response.getActiveModel());
        record.setExplanation(response.getExplanationText());
        record.setCreatedAt(LocalDateTime.now());

        if (response.getSuspiciousIndicators() != null && !response.getSuspiciousIndicators().isEmpty()) {
            record.setSuspiciousIndicators(String.join(" | ", response.getSuspiciousIndicators()));
        }

        TransactionRecord savedRecord = transactionRepository.save(record);

        // 3. Auto-generate Alert if risk is High or Critical
        if (response.getRiskScore() >= 50) {
            FraudAlert alert = alertService.createAlertFromTransaction(savedRecord, response);
            response.setAlertId(alert.getAlertId());
        }

        // 4. Update Customer Profiles
        updateCustomerAccount(request.getNameOrig(), request.getAmount(), response.getIsFraudPredicted(), response.getRiskScore());

        // 5. Audit Log
        auditService.logAction(
                "PREDICT_TRANSACTION",
                performedBy != null ? performedBy : "ANONYMOUS",
                "Transaction",
                savedRecord.getTransactionId(),
                "Scored transaction: " + savedRecord.getRiskCategory() + " (Score: " + savedRecord.getRiskScore() + ")",
                "127.0.0.1"
        );

        return response;
    }

    private void updateCustomerAccount(String accountId, Double amount, Boolean isFraud, Integer riskScore) {
        if (accountId == null || accountId.isBlank()) return;
        try {
            CustomerProfile profile = customerRepository.findByAccountId(accountId)
                    .orElseGet(() -> new CustomerProfile(accountId, accountId.startsWith("M") ? "MERCHANT" : "INDIVIDUAL"));

            int txnCount = profile.getTotalTransactions() != null ? profile.getTotalTransactions() + 1 : 1;
            double vol = profile.getTotalVolume() != null ? profile.getTotalVolume() + amount : amount;
            int frauds = profile.getFraudCount() != null ? profile.getFraudCount() + (Boolean.TRUE.equals(isFraud) ? 1 : 0) : (Boolean.TRUE.equals(isFraud) ? 1 : 0);

            profile.setTotalTransactions(txnCount);
            profile.setTotalVolume(vol);
            profile.setAverageAmount(vol / txnCount);
            profile.setFraudCount(frauds);
            profile.setRiskScore(Math.max(profile.getRiskScore() != null ? profile.getRiskScore() : 0, riskScore));
            profile.setRiskLevel(profile.getRiskScore() >= 75 ? "CRITICAL" : profile.getRiskScore() >= 50 ? "HIGH" : profile.getRiskScore() >= 30 ? "MEDIUM" : "LOW");
            profile.setLastActivity(LocalDateTime.now());

            customerRepository.save(profile);
        } catch (Exception ex) {
            // Ignore customer profile errors
        }
    }

    public String exportTransactionsCsv(Pageable pageable) {
        Page<TransactionRecord> page = transactionRepository.findAll(pageable);
        StringBuilder sb = new StringBuilder();
        sb.append("transactionId,step,type,amount,nameOrig,oldbalanceOrg,nameDest,oldbalanceDest,riskScore,riskCategory,isFraud,createdAt\n");
        for (TransactionRecord t : page.getContent()) {
            sb.append(String.format("\"%s\",%d,\"%s\",%.2f,\"%s\",%.2f,\"%s\",%.2f,%d,\"%s\",%b,\"%s\"\n",
                    t.getTransactionId(),
                    t.getStep() != null ? t.getStep() : 1,
                    t.getType(),
                    t.getAmount() != null ? t.getAmount() : 0.0,
                    t.getNameOrig(),
                    t.getOldbalanceOrg() != null ? t.getOldbalanceOrg() : 0.0,
                    t.getNameDest(),
                    t.getOldbalanceDest() != null ? t.getOldbalanceDest() : 0.0,
                    t.getRiskScore() != null ? t.getRiskScore() : 0,
                    t.getRiskCategory(),
                    t.getIsFraud(),
                    t.getCreatedAt()
            ));
        }
        return sb.toString();
    }
}
