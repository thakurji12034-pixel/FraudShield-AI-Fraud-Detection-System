package com.fraudshield.ai.dto;

import java.util.List;
import java.util.Map;

public class TransactionScoreResponse {
    private String transactionId;
    private Double fraudProbability;
    private Integer riskScore;
    private Boolean isFraudPredicted;
    private String riskCategory;
    private String activeModel;
    private String modelVersion;
    private String predictionTimestamp;
    private List<String> suspiciousIndicators;
    private Boolean ruleTriggered;
    private List<Map<String, Object>> featureContributions;
    private String explanationText;
    private String alertId; // if generated

    public TransactionScoreResponse() {}

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Double getFraudProbability() { return fraudProbability; }
    public void setFraudProbability(Double fraudProbability) { this.fraudProbability = fraudProbability; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public Boolean getIsFraudPredicted() { return isFraudPredicted; }
    public void setIsFraudPredicted(Boolean isFraudPredicted) { this.isFraudPredicted = isFraudPredicted; }

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

    public String getActiveModel() { return activeModel; }
    public void setActiveModel(String activeModel) { this.activeModel = activeModel; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getPredictionTimestamp() { return predictionTimestamp; }
    public void setPredictionTimestamp(String predictionTimestamp) { this.predictionTimestamp = predictionTimestamp; }

    public List<String> getSuspiciousIndicators() { return suspiciousIndicators; }
    public void setSuspiciousIndicators(List<String> suspiciousIndicators) { this.suspiciousIndicators = suspiciousIndicators; }

    public Boolean getRuleTriggered() { return ruleTriggered; }
    public void setRuleTriggered(Boolean ruleTriggered) { this.ruleTriggered = ruleTriggered; }

    public List<Map<String, Object>> getFeatureContributions() { return featureContributions; }
    public void setFeatureContributions(List<Map<String, Object>> featureContributions) { this.featureContributions = featureContributions; }

    public String getExplanationText() { return explanationText; }
    public void setExplanationText(String explanationText) { this.explanationText = explanationText; }

    public String getAlertId() { return alertId; }
    public void setAlertId(String alertId) { this.alertId = alertId; }
}
