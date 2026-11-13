package com.fraudshield.ai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers", indexes = {
    @Index(name = "idx_cust_account", columnList = "accountId")
})
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String accountId;

    @Column(nullable = false, length = 30)
    private String customerType = "INDIVIDUAL"; // INDIVIDUAL, MERCHANT

    private Integer totalTransactions = 0;

    private Double totalVolume = 0.0;

    private Double averageAmount = 0.0;

    private Integer fraudCount = 0;

    private Integer riskScore = 0;

    @Column(length = 30)
    private String riskLevel = "LOW";

    private LocalDateTime lastActivity = LocalDateTime.now();

    public CustomerProfile() {}

    public CustomerProfile(String accountId, String customerType) {
        this.accountId = accountId;
        this.customerType = customerType;
        this.lastActivity = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getCustomerType() { return customerType; }
    public void setCustomerType(String customerType) { this.customerType = customerType; }

    public Integer getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(Integer totalTransactions) { this.totalTransactions = totalTransactions; }

    public Double getTotalVolume() { return totalVolume; }
    public void setTotalVolume(Double totalVolume) { this.totalVolume = totalVolume; }

    public Double getAverageAmount() { return averageAmount; }
    public void setAverageAmount(Double averageAmount) { this.averageAmount = averageAmount; }

    public Integer getFraudCount() { return fraudCount; }
    public void setFraudCount(Integer fraudCount) { this.fraudCount = fraudCount; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
}
