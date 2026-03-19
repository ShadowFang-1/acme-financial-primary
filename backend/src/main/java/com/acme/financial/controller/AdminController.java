package com.acme.financial.controller;

import com.acme.financial.entity.Account;
import com.acme.financial.entity.Transaction;
import com.acme.financial.entity.User;
import com.acme.financial.repository.AccountRepository;
import com.acme.financial.repository.TransactionRepository;
import com.acme.financial.repository.UserRepository;
import com.acme.financial.service.AccountService;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AdminController(UserRepository userRepository, 
                           AccountService accountService, 
                           AccountRepository accountRepository,
                           TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.accountService = accountService;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @PatchMapping("/accounts/{accountNumber}/freeze")
    public ResponseEntity<Void> freezeAccount(@PathVariable String accountNumber) {
        Account account = accountService.getAccountByNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setFrozen(true);
        accountService.save(account);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/accounts/{accountNumber}/unfreeze")
    public ResponseEntity<Void> unfreezeAccount(@PathVariable String accountNumber) {
        Account account = accountService.getAccountByNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setFrozen(false);
        accountService.save(account);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/accounts/{id}")
    @Transactional
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        Account account = accountRepository.findById(id).orElse(null);
        if (account == null) return ResponseEntity.notFound().build();
        transactionRepository.deleteAllByAccount(account);
        accountRepository.delete(account);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        
        List<Account> accounts = accountRepository.findByUser(user);
        for (Account account : accounts) {
            transactionRepository.deleteAllByAccount(account);
            accountRepository.delete(account);
        }
        userRepository.delete(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Use getDisplayName() here because getUsername() is overridden to return email for Spring Security
        user.setUsername(userDetails.getDisplayName());
        user.setEmail(userDetails.getEmail());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setRole(userDetails.getRole());
        user.setEnabled(userDetails.isEnabled());
        
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/users/{id}/transactions")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        List<Account> accounts = accountRepository.findByUser(user);
        java.util.List<Transaction> transactions = new java.util.ArrayList<>();
        for (Account acc : accounts) {
            transactions.addAll(transactionRepository.findAll().stream()
                .filter(t -> (t.getSenderAccount() != null && t.getSenderAccount().getId().equals(acc.getId())) || 
                             (t.getReceiverAccount() != null && t.getReceiverAccount().getId().equals(acc.getId())))
                .collect(java.util.stream.Collectors.toList()));
        }
        transactions.sort((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(transactions.stream().limit(50).collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/stats/transactions")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getTransactionStats() {
        List<Transaction> all = transactionRepository.findAll();
        
        java.util.Map<String, java.util.Map<String, Double>> grouped = all.stream().collect(java.util.stream.Collectors.groupingBy(
            t -> t.getCreatedAt().toString().substring(0, 10),
            java.util.stream.Collectors.groupingBy(
                t -> t.getType().toString(),
                java.util.stream.Collectors.summingDouble(t -> t.getAmount().doubleValue())
            )
        ));

        List<java.util.Map<String, Object>> result = grouped.entrySet().stream()
                .map(e -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("date", e.getKey());
                    map.put("DEPOSIT", e.getValue().getOrDefault("DEPOSIT", 0.0));
                    map.put("WITHDRAWAL", e.getValue().getOrDefault("WITHDRAWAL", 0.0));
                    map.put("TRANSFER", e.getValue().getOrDefault("TRANSFER", 0.0));
                    map.put("total", e.getValue().values().stream().mapToDouble(d -> d).sum());
                    return map;
                })
                .sorted((a, b) -> a.get("date").toString().compareTo(b.get("date").toString()))
                .collect(java.util.stream.Collectors.toList());
                
        return ResponseEntity.ok(result);
    }
}
