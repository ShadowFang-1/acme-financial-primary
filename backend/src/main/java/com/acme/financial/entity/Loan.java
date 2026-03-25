package com.acme.financial.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BigDecimal principalAmount;
    private BigDecimal remainingBalance;
    private BigDecimal interestRate; // e.g., 0.08 for 8%
    private LocalDateTime startDate;
    private Integer durationInMonths;
    private String status; // "PENDING", "ACTIVE", "COMPLETED"

    // Auto-repayment schedule
    private String repaymentFrequency; // DAILY, WEEKLY, MONTHLY, YEARLY
    private LocalDateTime nextRepaymentDate;
    private LocalDateTime closingDate; // Final deadline for full repayment
    private BigDecimal repaymentAmount; // Amount per scheduled payment

    public Loan() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }
    public BigDecimal getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(BigDecimal remainingBalance) { this.remainingBalance = remainingBalance; }
    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public Integer getDurationInMonths() { return durationInMonths; }
    public void setDurationInMonths(Integer durationInMonths) { this.durationInMonths = durationInMonths; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRepaymentFrequency() { return repaymentFrequency; }
    public void setRepaymentFrequency(String repaymentFrequency) { this.repaymentFrequency = repaymentFrequency; }
    public LocalDateTime getNextRepaymentDate() { return nextRepaymentDate; }
    public void setNextRepaymentDate(LocalDateTime nextRepaymentDate) { this.nextRepaymentDate = nextRepaymentDate; }
    public LocalDateTime getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDateTime closingDate) { this.closingDate = closingDate; }
    public BigDecimal getRepaymentAmount() { return repaymentAmount; }
    public void setRepaymentAmount(BigDecimal repaymentAmount) { this.repaymentAmount = repaymentAmount; }
}
