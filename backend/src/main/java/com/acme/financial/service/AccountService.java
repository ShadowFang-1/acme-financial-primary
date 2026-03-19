package com.acme.financial.service;

import com.acme.financial.entity.Account;
import com.acme.financial.entity.User;
import com.acme.financial.entity.AccountType;
import com.acme.financial.repository.AccountRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import com.acme.financial.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {

    private final AccountRepository repository;
    private final UserRepository userRepository;

    public AccountService(AccountRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Account> getAccountsByUser(User user) {
        return repository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Optional<Account> getAccountByNumber(String accountNumber) {
        return repository.findByAccountNumber(accountNumber);
    }

    public Account createAccount(User user, AccountType type) {
        Account account = Account.builder()
                .user(user)
                .accountNumber(generateAccountNumber())
                .balance(new BigDecimal("100.00")) // Small bonus for new account
                .type(type)
                .frozen(false)
                .build();
        return repository.save(account);
    }

    private String generateAccountNumber() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    public List<Account> getAllAccounts() {
        return repository.findAll();
    }

    public Account save(Account account) {
        return repository.save(account);
    }

    @Transactional(readOnly = true)
    public Optional<Account> getAccountByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .flatMap(user -> repository.findByUser(user).stream().findFirst());
    }
}
