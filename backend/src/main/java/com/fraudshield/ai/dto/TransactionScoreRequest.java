package com.fraudshield.ai.dto;

public class TransactionScoreRequest {
    private String transactionId;
    private Integer step = 1;
    private String type; // TRANSFER, CASH_OUT, PAYMENT, etc.
    private Double amount;
    private String nameOrig;
    private Double oldbalanceOrg = 0.0;
    private String nameDest;
    private Double oldbalanceDest = 0.0;

    public TransactionScoreRequest() {}

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

    public String getNameDest() { return nameDest; }
    public void setNameDest(String nameDest) { this.nameDest = nameDest; }

    public Double getOldbalanceDest() { return oldbalanceDest; }
    public void setOldbalanceDest(Double oldbalanceDest) { this.oldbalanceDest = oldbalanceDest; }
}
