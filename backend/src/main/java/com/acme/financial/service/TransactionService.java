package com.acme.financial.service;

import com.acme.financial.dto.TransferRequest;
import com.acme.financial.entity.Account;
import com.acme.financial.entity.Transaction;
import com.acme.financial.entity.TransactionType;
import com.acme.financial.entity.User;
import com.acme.financial.repository.AccountRepository;
import com.acme.financial.repository.TransactionRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final NotificationService notificationService;

    public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository, NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void transfer(User user, TransferRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero");
        }

        Account fromAccount = accountRepository.findByAccountNumber(request.getFromAccountNumber())
                .orElseThrow(() -> new RuntimeException("Sender account not found"));
        
        if (!fromAccount.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this account");
        }
        
        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        if (fromAccount.isFrozen()) {
            System.out.println("[SECURITY] Locked Outbound: Account " + fromAccount.getAccountNumber() + " attempted transfer while FROZEN.");
            throw new RuntimeException("Transaction Vetoed: Your source account is currently locked for security.");
        }

        if (toAccount.isFrozen()) {
            System.out.println("[SECURITY] Locked Inbound: Recipient " + toAccount.getAccountNumber() + " is FROZEN. Blocking transfer.");
            throw new RuntimeException("Recipient account is currently under 'Lock Safe' protection and cannot receive funds.");
        }

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));

        Transaction transaction = Transaction.builder()
                .senderAccount(fromAccount)
                .receiverAccount(toAccount)
                .amount(request.getAmount())
                .description(request.getDescription())
                .type(TransactionType.TRANSFER)
                .build();

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
        transactionRepository.save(transaction);

        // Notify Sender
        String senderMsg = "You sent GHS " + request.getAmount() + " to " + toAccount.getAccountNumber();
        if (request.getDescription() != null) senderMsg += " (" + request.getDescription() + ")";
        notificationService.notify(user, "Transfer Sent", senderMsg);
        
        // Notify Receiver
        String receiverMsg = "You received GHS " + request.getAmount() + " from " + fromAccount.getAccountNumber();
        if (request.getDescription() != null) receiverMsg += " for " + request.getDescription();
        notificationService.notify(toAccount.getUser(), "Transfer Received", receiverMsg);
    }

    @Transactional
    public void deposit(String accountNumber, BigDecimal amount, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Deposit amount must be greater than zero");
        }

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.isFrozen()) {
            throw new RuntimeException("Security Protocol: This account is locked. Please unlock the 'Safe' before topping up.");
        }

        account.setBalance(account.getBalance().add(amount));
        
        Transaction transaction = Transaction.builder()
                .receiverAccount(account)
                .amount(amount)
                .description(description != null ? description : "Top Up / Deposit")
                .type(TransactionType.DEPOSIT)
                .build();

        accountRepository.save(account);
        transactionRepository.save(transaction);

        // Notify User
        String msg = "Your account " + account.getAccountNumber() + " was topped up with GHS " + amount;
        if (description != null) msg += " via " + description;
        notificationService.notify(account.getUser(), "Deposit Successful", msg);
    }

    @Transactional
    public void withdraw(User user, String accountNumber, BigDecimal amount, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Withdrawal amount must be greater than zero");
        }

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this account");
        }

        if (account.isFrozen()) {
            throw new RuntimeException("Transaction Blocked: This account is currently under 'Lock Safe' protection.");
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds for withdrawal");
        }

        account.setBalance(account.getBalance().subtract(amount));
        
        Transaction transaction = Transaction.builder()
                .senderAccount(account)
                .amount(amount)
                .description(description != null ? description : "Cash Withdrawal")
                .type(TransactionType.WITHDRAWAL)
                .build();

        accountRepository.save(account);
        transactionRepository.save(transaction);

        // Notify User
        String msg = "You withdrew GHS " + amount + " from account " + account.getAccountNumber();
        if (description != null) msg += " for " + description;
        notificationService.notify(user, "Withdrawal Successful", msg);
    }

    public Page<Transaction> getTransactionHistory(Account account, Pageable pageable) {
        return transactionRepository.findAllByAccount(account.getId(), pageable);
    }
}
