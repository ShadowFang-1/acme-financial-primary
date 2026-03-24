package com.acme.financial.service;

import com.acme.financial.entity.*;
import com.acme.financial.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancialHubService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final InvestmentRepository investmentRepository;
    private final LoanRepository loanRepository;
    private final AuditLogRepository auditLogRepository;
    private final AccountRepository accountRepository;

    public FinancialHubService(SavingsGoalRepository savingsGoalRepository,
                               InvestmentRepository investmentRepository,
                               LoanRepository loanRepository,
                               AuditLogRepository auditLogRepository,
                               AccountRepository accountRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.investmentRepository = investmentRepository;
        this.loanRepository = loanRepository;
        this.auditLogRepository = auditLogRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFinancialSummary(User user) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("savingsGoals", savingsGoalRepository.findByUser_Id(user.getId()));
        summary.put("investments", investmentRepository.findByUser_Id(user.getId()));
        summary.put("loans", loanRepository.findByUser_Id(user.getId()));
        summary.put("auditLogs", auditLogRepository.findByUsernameOrderByTimestampDesc(user.getUsername()));
        
        // Total stats
        BigDecimal totalSavings = savingsGoalRepository.findByUser_Id(user.getId()).stream()
            .map(SavingsGoal::getCurrentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("totalSavingsProgress", totalSavings);

        return summary;
    }

    @Transactional
    public void invest(User user, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Investment amount must be positive");
        }

        List<Account> accounts = accountRepository.findByUser_Id(user.getId());
        Account savings = accounts.stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Operational Fault: No ACME Savings account located to source funds."));
        
        Account investmentAcc = accounts.stream()
            .filter(a -> a.getType() == AccountType.INVESTMENT)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Operational Fault: No ACME Investment account located. Please open one first."));

        if (savings.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient Liquidity: Your Savings account does not Have enough capital.");
        }

        savings.setBalance(savings.getBalance().subtract(amount));
        investmentAcc.setBalance(investmentAcc.getBalance().add(amount));

        accountRepository.save(savings);
        accountRepository.save(investmentAcc);

        // Record for tracking
        Investment inv = new Investment();
        inv.setUser(user);
        inv.setAmount(amount);
        inv.setAssetType("ACME_HIGH_YIELD_FUNDS");
        inv.setStatus("GROWING");
        investmentRepository.save(inv);

        auditLogRepository.save(new AuditLog("ASSET_INVEST", user.getUsername(), "Invested $" + amount + " from savings", "Internal"));
    }

    @Transactional
    public SavingsGoal createGoal(User user, String name, BigDecimal target, String icon) {
        SavingsGoal goal = new SavingsGoal();
        goal.setUser(user);
        goal.setName(name);
        goal.setTargetAmount(target);
        goal.setCurrentAmount(BigDecimal.ZERO);
        goal.setIcon(icon != null ? icon : "target");
        return savingsGoalRepository.save(goal);
    }

    @Transactional
    public Loan requestLoan(User user, BigDecimal amount, Integer months) {
        Loan loan = new Loan();
        loan.setUser(user);
        loan.setPrincipalAmount(amount);
        loan.setRemainingBalance(amount);
        loan.setInterestRate(new BigDecimal("0.08"));
        loan.setStartDate(LocalDateTime.now());
        loan.setDurationInMonths(months);
        loan.setStatus("ACTIVE");
        auditLogRepository.save(new AuditLog("LOAN_REQUEST", user.getUsername(), "Requested $" + amount, "Internal"));
        return loanRepository.save(loan);
    }

    @Transactional
    public void recordAction(String action, String username, String details, String ip) {
        auditLogRepository.save(new AuditLog(action, username, details, ip));
    }

    @Transactional
    public void processGlobalInterest() {
        List<Account> investments = accountRepository.findAll().stream()
            .filter(a -> a.getType() == AccountType.INVESTMENT)
            .collect(Collectors.toList());

        for (Account acc : investments) {
            BigDecimal rate = new BigDecimal("0.05");
            if (acc.getBalance().compareTo(new BigDecimal("1000")) > 0) rate = new BigDecimal("0.08");
            BigDecimal growth = acc.getBalance().multiply(rate).divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
            acc.setBalance(acc.getBalance().add(growth));
            accountRepository.save(acc);
        }
    }
}
