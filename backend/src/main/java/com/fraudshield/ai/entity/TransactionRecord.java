package com.fraudshield.ai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_txn_id", columnList = "transactionId"),
    @Index(name = "idx_txn_orig", columnList = "nameOrig"),
    @Index(name = "idx_txn_dest", columnList = "nameDest"),
    @Index(name = "idx_txn_type", columnList = "type"),
    @Index(name = "idx_txn_risk", columnList = "riskCategory"),
    @Index(name = "idx_txn_fraud", columnList = "isFraud")
})
public class TransactionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String transactionId;

    private Integer step;

    @Column(nullable = false, length = 20)
    private String type; // CASH_OUT, PAYMENT, CASH_IN, TRANSFER, DEBIT

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 64)
    private String nameOrig;

    private Double oldbalanceOrg;

    private Double newbalanceOrig;

    @Column(nullable = false, length = 64)
    private String nameDest;

    private Double oldbalanceDest;

    private Double newbalanceDest;

    private Boolean isFraud = false;

    private Boolean isFlaggedFraud = false;

    private Double fraudProbability = 0.0;

    private Integer riskScore = 0; // 0 - 100

    @Column(length = 30)
    private String riskCategory = "LOW RISK"; // LOW RISK, MEDIUM RISK, HIGH RISK, CRITICAL RISK

    private Boolean ruleTriggered = false;

    @Column(length = 2000)
    private String suspiciousIndicators; // JSON or comma-delimited

    @Column(length = 50)
    private String modelUsed = "Random Forest";

    @Column(length = 2000)
    private String explanation;

    private LocalDateTime createdAt = LocalDateTime.now();

    public TransactionRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Integer getStep() { return step; }
    public void setStep(Integer step) { this.step = step; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getNameOrig() { return nameOrig; }
    public void setNameOrig(String nameOrig) { this.nameOrig = nameOrig; }

    public Double getOldbalanceOrg() { return oldbalanceOrg; }
    public void setOldbalanceOrg(Double oldbalanceOrg) { this.oldbalanceOrg = oldbalanceOrg; }

    public Double getNewbalanceOrig() { return newbalanceOrig; }
    public void setNewbalanceOrig(Double newbalanceOrig) { this.newbalanceOrig = newbalanceOrig; }

    public String getNameDest() { return nameDest; }
    public void setNameDest(String nameDest) { this.nameDest = nameDest; }

    public Double getOldbalanceDest() { return oldbalanceDest; }
    public void setOldbalanceDest(Double oldbalanceDest) { this.oldbalanceDest = oldbalanceDest; }

    public Double getNewbalanceDest() { return newbalanceDest; }
    public void setNewbalanceDest(Double newbalanceDest) { this.newbalanceDest = newbalanceDest; }

    public Boolean getIsFraud() { return isFraud; }
    public void setIsFraud(Boolean isFraud) { this.isFraud = isFraud; }

    public Boolean getIsFlaggedFraud() { return isFlaggedFraud; }
    public void setIsFlaggedFraud(Boolean isFlaggedFraud) { this.isFlaggedFraud = isFlaggedFraud; }

    public Double getFraudProbability() { return fraudProbability; }
    public void setFraudProbability(Double fraudProbability) { this.fraudProbability = fraudProbability; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

    public Boolean getRuleTriggered() { return ruleTriggered; }
    public void setRuleTriggered(Boolean ruleTriggered) { this.ruleTriggered = ruleTriggered; }

    public String getSuspiciousIndicators() { return suspiciousIndicators; }
    public void setSuspiciousIndicators(String suspiciousIndicators) { this.suspiciousIndicators = suspiciousIndicators; }

    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
