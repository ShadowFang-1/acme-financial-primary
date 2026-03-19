package com.acme.financial.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String accountNumber;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    private AccountType type;

    private boolean frozen = false;

    private LocalDateTime createdAt;

    public Account() {}

    public Account(Long id, String accountNumber, User user, BigDecimal balance, AccountType type, boolean frozen, LocalDateTime createdAt) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.user = user;
        this.balance = balance;
        this.type = type;
        this.frozen = frozen;
        this.createdAt = createdAt;
    }

    public static AccountBuilder builder() {
        return new AccountBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    @JsonProperty("userId")
    public Long getUserId() { return user != null ? user.getId() : null; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public AccountType getType() { return type; }
    public void setType(AccountType type) { this.type = type; }
    public boolean isFrozen() { return frozen; }
    public void setFrozen(boolean frozen) { this.frozen = frozen; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (balance == null) balance = BigDecimal.ZERO;
    }

    public static class AccountBuilder {
        private Long id;
        private String accountNumber;
        private User user;
        private BigDecimal balance;
        private AccountType type;
        private boolean frozen;
        private LocalDateTime createdAt;

        public AccountBuilder id(Long id) { this.id = id; return this; }
        public AccountBuilder accountNumber(String accountNumber) { this.accountNumber = accountNumber; return this; }
        public AccountBuilder user(User user) { this.user = user; return this; }
        public AccountBuilder balance(BigDecimal balance) { this.balance = balance; return this; }
        public AccountBuilder type(AccountType type) { this.type = type; return this; }
        public AccountBuilder frozen(boolean frozen) { this.frozen = frozen; return this; }
        public AccountBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Account build() {
            return new Account(id, accountNumber, user, balance, type, frozen, createdAt);
        }
    }
}
