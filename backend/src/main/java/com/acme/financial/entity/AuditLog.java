package com.acme.financial.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action; // e.g., "LOGIN_ATTEMPT", "TRANSFER_EXEC", "PWD_CHANGE"
    private String username;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public AuditLog() {}
    public AuditLog(String action, String username, String details, String ipAddress) {
        this.action = action;
        this.username = username;
        this.details = details;
        this.ipAddress = ipAddress;
    }

    // Getters
    public Long getId() { return id; }
    public String getAction() { return action; }
    public String getUsername() { return username; }
    public String getDetails() { return details; }
    public String getIpAddress() { return ipAddress; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
