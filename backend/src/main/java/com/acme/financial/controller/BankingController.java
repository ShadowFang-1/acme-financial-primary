package com.acme.financial.controller;

import com.acme.financial.dto.TransferRequest;
import com.acme.financial.entity.Account;
import com.acme.financial.entity.AccountType;
import com.acme.financial.entity.Transaction;
import com.acme.financial.entity.User;
import com.acme.financial.service.AccountService;
import com.acme.financial.service.TransactionService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/banking")
public class BankingController {

    private final AccountService accountService;
    private final TransactionService transactionService;

    public BankingController(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAccounts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(accountService.getAccountsByUser(user));
    }

    @Transactional(readOnly = true)
    @GetMapping("/accounts/search/{accountNumber}")
    public ResponseEntity<Map<String, String>> searchAccount(@PathVariable String accountNumber) {
        Account account = accountService.getAccountByNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        return ResponseEntity.ok(convertToSearchResponse(account));
    }

    @Transactional(readOnly = true)
    @GetMapping("/accounts/search-phone/{phoneNumber}")
    public ResponseEntity<Map<String, String>> searchByPhone(@PathVariable String phoneNumber) {
        Account account = accountService.getAccountByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("No user found with this phone number or user has no accounts."));
        
        return ResponseEntity.ok(convertToSearchResponse(account));
    }

    private Map<String, String> convertToSearchResponse(Account account) {
        Map<String, String> response = new HashMap<>();
        response.put("accountNumber", account.getAccountNumber());
        
        String displayName = "Unknown User";
        if (account.getUser() != null) {
            displayName = account.getUser().getDisplayName();
            if (displayName == null) displayName = account.getUser().getEmail();
            response.put("imageUrl", account.getUser().getImageUrl());
        }
        response.put("ownerName", displayName);
        response.put("type", account.getType().toString());
        response.put("isFrozen", String.valueOf(account.isFrozen()));
        
        return response;
    }

    @PostMapping("/accounts")
    public ResponseEntity<Account> createAccount(
            @AuthenticationPrincipal User user,
            @RequestParam AccountType type
    ) {
        return ResponseEntity.ok(accountService.createAccount(user, type));
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(@AuthenticationPrincipal User user, @RequestBody TransferRequest request) {
        transactionService.transfer(user, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/deposit")
    public ResponseEntity<Void> deposit(
            @RequestParam String accountNumber,
            @RequestParam java.math.BigDecimal amount,
            @RequestParam(required = false) String description) {
        transactionService.deposit(accountNumber, amount, description);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Void> withdraw(
            @AuthenticationPrincipal User user,
            @RequestParam String accountNumber,
            @RequestParam java.math.BigDecimal amount,
            @RequestParam(required = false) String description) {
        transactionService.withdraw(user, accountNumber, amount, description);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/accounts/{accountNumber}/transactions")
    public ResponseEntity<Page<Transaction>> getTransactions(
            @PathVariable String accountNumber,
            Pageable pageable
    ) {
        Account account = accountService.getAccountByNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return ResponseEntity.ok(transactionService.getTransactionHistory(account, pageable));
    }

    @PostMapping("/p2p-transfer")
    public ResponseEntity<Void> p2pTransfer(
            @AuthenticationPrincipal User user,
            @RequestParam String identifier,
            @RequestParam java.math.BigDecimal amount,
            @RequestParam(required = false) String description) {
        transactionService.p2pTransfer(user, identifier, amount, description);
        return ResponseEntity.ok().build();
    }
}
