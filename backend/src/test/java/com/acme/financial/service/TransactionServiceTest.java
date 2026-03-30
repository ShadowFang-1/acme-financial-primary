package com.acme.financial.service;

import com.acme.financial.dto.TransferRequest;
import com.acme.financial.entity.Account;
import com.acme.financial.entity.User;
import com.acme.financial.repository.AccountRepository;
import com.acme.financial.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private TransactionService transactionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void transfer_Successful() {
        User user = User.builder().id(1L).build();
        Account fromAccount = Account.builder()
                .accountNumber("1234567890")
                .balance(new BigDecimal("1000.00"))
                .user(user)
                .frozen(false)
                .build();
        Account toAccount = Account.builder()
                .accountNumber("0987654321")
                .balance(new BigDecimal("500.00"))
                .build();
 
        TransferRequest request = TransferRequest.builder()
                .fromAccountNumber("1234567890")
                .toAccountNumber("0987654321")
                .amount(new BigDecimal("200.00"))
                .description("Test Transfer")
                .build();
 
        when(accountRepository.findByAccountNumber("1234567890")).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByAccountNumber("0987654321")).thenReturn(Optional.of(toAccount));
 
        transactionService.transfer(user, request);
 
        assertEquals(new BigDecimal("800.00"), fromAccount.getBalance());
        assertEquals(new BigDecimal("700.00"), toAccount.getBalance());
        verify(accountRepository, times(1)).save(fromAccount);
        verify(accountRepository, times(1)).save(toAccount);
        verify(transactionRepository, times(1)).save(any());
    }

    @Test
    void transfer_InsufficientFunds_ThrowsException() {
        User user = User.builder().id(1L).build();
        Account fromAccount = Account.builder()
                .accountNumber("1234567890")
                .balance(new BigDecimal("100.00"))
                .user(user)
                .frozen(false)
                .build();
        Account toAccount = Account.builder()
                .accountNumber("0987654321")
                .balance(new BigDecimal("500.00"))
                .build();
 
        TransferRequest request = TransferRequest.builder()
                .fromAccountNumber("1234567890")
                .toAccountNumber("0987654321")
                .amount(new BigDecimal("200.00"))
                .build();
 
        when(accountRepository.findByAccountNumber("1234567890")).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByAccountNumber("0987654321")).thenReturn(Optional.of(toAccount));
 
        assertThrows(RuntimeException.class, () -> transactionService.transfer(user, request));
    }

    @Test
    void transfer_FrozenAccount_ThrowsException() {
        User user = User.builder().id(1L).build();
        Account fromAccount = Account.builder()
                .accountNumber("1234567890")
                .balance(new BigDecimal("1000.00"))
                .user(user)
                .frozen(true)
                .build();
        
        TransferRequest request = TransferRequest.builder()
                .fromAccountNumber("1234567890")
                .toAccountNumber("0987654321")
                .amount(new BigDecimal("200.00"))
                .build();
 
        when(accountRepository.findByAccountNumber("1234567890")).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByAccountNumber("0987654321")).thenReturn(Optional.of(Account.builder().build()));
 
        assertThrows(RuntimeException.class, () -> transactionService.transfer(user, request));
    }
}
