package com.fraudshield.ai.dto;

public class AlertStatusUpdateDTO {
    private String status; // INVESTIGATING, RESOLVED, DISMISSED
    private String assignedTo;
    private String notes;

    public AlertStatusUpdateDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
