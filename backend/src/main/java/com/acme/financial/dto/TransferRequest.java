package com.acme.financial.dto;



import java.math.BigDecimal;

public class TransferRequest {
    private String fromAccountNumber;
    private String toAccountNumber;
    private BigDecimal amount;
    private String description;

    public TransferRequest() {}

    public TransferRequest(String fromAccountNumber, String toAccountNumber, BigDecimal amount, String description) {
        this.fromAccountNumber = fromAccountNumber;
        this.toAccountNumber = toAccountNumber;
        this.amount = amount;
        this.description = description;
    }

    public static TransferRequestBuilder builder() {
        return new TransferRequestBuilder();
    }

    public String getFromAccountNumber() { return fromAccountNumber; }
    public void setFromAccountNumber(String fromAccountNumber) { this.fromAccountNumber = fromAccountNumber; }
    public String getToAccountNumber() { return toAccountNumber; }
    public void setToAccountNumber(String toAccountNumber) { this.toAccountNumber = toAccountNumber; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static class TransferRequestBuilder {
        private String fromAccountNumber;
        private String toAccountNumber;
        private BigDecimal amount;
        private String description;

        public TransferRequestBuilder fromAccountNumber(String fromAccountNumber) { this.fromAccountNumber = fromAccountNumber; return this; }
        public TransferRequestBuilder toAccountNumber(String toAccountNumber) { this.toAccountNumber = toAccountNumber; return this; }
        public TransferRequestBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public TransferRequestBuilder description(String description) { this.description = description; return this; }

        public TransferRequest build() {
            return new TransferRequest(fromAccountNumber, toAccountNumber, amount, description);
        }
    }
}
