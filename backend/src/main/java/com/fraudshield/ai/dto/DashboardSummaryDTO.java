package com.fraudshield.ai.dto;

import com.fraudshield.ai.entity.FraudAlert;
import com.fraudshield.ai.entity.TransactionRecord;

import java.util.List;
import java.util.Map;

public class DashboardSummaryDTO {
    private long totalTransactions;
    private long genuineTransactions;
    private long fraudulentTransactions;
    private double fraudDetectionRate;
    private long highRiskTransactions;
    private long criticalAlerts;
    private double totalTransactionAmount;
    private double fraudTransactionAmount;
    private String activeModel;
    private List<TransactionRecord> recentTransactions;
    private List<FraudAlert> latestAlerts;
    private List<Map<String, Object>> typeDistribution;
    private List<Map<String, Object>> riskDistribution;
    private Map<String, Object> datasetProfile;

    public DashboardSummaryDTO() {}

    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }

    public long getGenuineTransactions() { return genuineTransactions; }
    public void setGenuineTransactions(long genuineTransactions) { this.genuineTransactions = genuineTransactions; }

    public long getFraudulentTransactions() { return fraudulentTransactions; }
    public void setFraudulentTransactions(long fraudulentTransactions) { this.fraudulentTransactions = fraudulentTransactions; }

    public double getFraudDetectionRate() { return fraudDetectionRate; }
    public void setFraudDetectionRate(double fraudDetectionRate) { this.fraudDetectionRate = fraudDetectionRate; }

    public long getHighRiskTransactions() { return highRiskTransactions; }
    public void setHighRiskTransactions(long highRiskTransactions) { this.highRiskTransactions = highRiskTransactions; }

    public long getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; }

    public double getTotalTransactionAmount() { return totalTransactionAmount; }
    public void setTotalTransactionAmount(double totalTransactionAmount) { this.totalTransactionAmount = totalTransactionAmount; }

    public double getFraudTransactionAmount() { return fraudTransactionAmount; }
    public void setFraudTransactionAmount(double fraudTransactionAmount) { this.fraudTransactionAmount = fraudTransactionAmount; }

    public String getActiveModel() { return activeModel; }
    public void setActiveModel(String activeModel) { this.activeModel = activeModel; }

    public List<TransactionRecord> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<TransactionRecord> recentTransactions) { this.recentTransactions = recentTransactions; }

    public List<FraudAlert> getLatestAlerts() { return latestAlerts; }
    public void setLatestAlerts(List<FraudAlert> latestAlerts) { this.latestAlerts = latestAlerts; }

    public List<Map<String, Object>> getTypeDistribution() { return typeDistribution; }
    public void setTypeDistribution(List<Map<String, Object>> typeDistribution) { this.typeDistribution = typeDistribution; }

    public List<Map<String, Object>> getRiskDistribution() { return riskDistribution; }
    public void setRiskDistribution(List<Map<String, Object>> riskDistribution) { this.riskDistribution = riskDistribution; }

    public Map<String, Object> getDatasetProfile() { return datasetProfile; }
    public void setDatasetProfile(Map<String, Object> datasetProfile) { this.datasetProfile = datasetProfile; }
}
