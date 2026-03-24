package com.acme.financial.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_transactions")
public class RecurringTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id", nullable = false)
    private Account fromAccount;

    private String toEmailOrPhone; // Supports P2P email/phone logic
    private BigDecimal amount;
    private String category; // e.g., "RENT", "SUBSCRIPTION", "UTILITIES"
    private String frequency; // "MONTHLY", "WEEKLY"
    private LocalDateTime nextExecutionDate;
    private boolean active = true;

    public RecurringTransaction() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Account getFromAccount() { return fromAccount; }
    public void setFromAccount(Account fromAccount) { this.fromAccount = fromAccount; }
    public String getToEmailOrPhone() { return toEmailOrPhone; }
    public void setToEmailOrPhone(String toEmailOrPhone) { this.toEmailOrPhone = toEmailOrPhone; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public LocalDateTime getNextExecutionDate() { return nextExecutionDate; }
    public void setNextExecutionDate(LocalDateTime nextExecutionDate) { this.nextExecutionDate = nextExecutionDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
