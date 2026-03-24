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
    private final UserRepository userRepository;

    public FinancialHubService(SavingsGoalRepository savingsGoalRepository,
                               InvestmentRepository investmentRepository,
                               LoanRepository loanRepository,
                               AuditLogRepository auditLogRepository,
                               AccountRepository accountRepository,
                               UserRepository userRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.investmentRepository = investmentRepository;
        this.loanRepository = loanRepository;
        this.auditLogRepository = auditLogRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFinancialSummary(User user) {
        if (user == null) {
            throw new RuntimeException("Operational Fault: Institutional link lost. Please re-authenticate.");
        }
        
        // Ensure user is managed and Has ID
        User managedUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Vault Error: Identity not located in current session."));

        Map<String, Object> summary = new HashMap<>();
        summary.put("savingsGoals", savingsGoalRepository.findByUser_Id(managedUser.getId()));
        summary.put("investments", investmentRepository.findByUser_Id(managedUser.getId()));
        summary.put("loans", loanRepository.findByUser_Id(managedUser.getId()));
        summary.put("auditLogs", auditLogRepository.findByUsernameOrderByTimestampDesc(managedUser.getUsername()));
        
        // Total stats
        BigDecimal totalSavings = savingsGoalRepository.findByUser_Id(managedUser.getId()).stream()
            .map(SavingsGoal::getCurrentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("totalSavingsProgress", totalSavings);

        return summary;
    }

    @Transactional
    public void invest(User user, BigDecimal amount, String interval) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Operational Fault: Investment amount must be positive.");
        }

        User managedUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Session not located."));

        List<Account> accounts = accountRepository.findByUser(managedUser);
        Account savings = accounts.stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No source Savings account identified."));

        if (savings.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Liquidity Insufficient: Savings reserve is below the relocation threshold.");
        }

        Account investmentAcc = accounts.stream()
            .filter(a -> a.getType() == AccountType.INVESTMENT)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Operational Limit: Initialize your High-Yield Vault first."));

        // Deduct from Savings
        savings.setBalance(savings.getBalance().subtract(amount));
        accountRepository.save(savings);

        // Add to Managed Investment Account
        investmentAcc.setBalance(investmentAcc.getBalance().add(amount));
        accountRepository.save(investmentAcc);

        // Record in Asset Map
        Investment inv = new Investment();
        inv.setUser(managedUser);
        inv.setAmount(amount);
        inv.setAssetName("ACME Strategic Yield Portfolio");
        inv.setAssetType("HIGH_YIELD_INSTITUTIONAL");
        inv.setStatus("GROWING");
        inv.setGrowthInterval(interval != null ? interval : "MONTHLY");
        inv.setInterestRate(interval != null && interval.equals("ANNUALLY") ? new BigDecimal("12.0") : new BigDecimal("5.0"));
        inv.setLastUpdated(LocalDateTime.now());
        investmentRepository.save(inv);

        recordAction("ASSET_RELOCATION", managedUser.getUsername(), 
            "Relocated " + amount + " to " + inv.getGrowthInterval() + " yield portfolio.", "INTERNAL_ENGINE");
    }

    @Transactional
    public void withdrawInvestment(User user, Long investmentId, BigDecimal amount) {
        User managedUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Session not located."));

        Account investmentAcc = accountRepository.findByUser(managedUser).stream()
            .filter(a -> a.getType() == AccountType.INVESTMENT)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No active Investment vault identified."));

        if (investmentAcc.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Liquidity Insufficient: Investment balance too low for withdrawal.");
        }

        Account savings = accountRepository.findByUser(managedUser).stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No primary Savings account to receive liquidity."));

        investmentAcc.setBalance(investmentAcc.getBalance().subtract(amount));
        savings.setBalance(savings.getBalance().add(amount));
        
        accountRepository.save(investmentAcc);
        accountRepository.save(savings);

        recordAction("INVESTMENT_LIQUIDATION", managedUser.getUsername(), "Withdrew " + amount + " from investment to savings.", "INTERNAL_ENGINE");
    }

    @Transactional
    public void payOffLoan(User user, Long loanId, BigDecimal amount) {
        User managedUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Session not located."));

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Operational Fault: Loan instrument not found."));

        Account savings = accountRepository.findByUser(managedUser).stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No primary Savings account identified for debt clearance."));

        if (savings.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Liquidity Insufficient: Savings balance cannot cover this debt repayment.");
        }

        savings.setBalance(savings.getBalance().subtract(amount));
        loan.setRemainingBalance(loan.getRemainingBalance().subtract(amount));
        
        if (loan.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setStatus("COMPLETED");
            loan.setRemainingBalance(BigDecimal.ZERO);
        }

        accountRepository.save(savings);
        loanRepository.save(loan);

        recordAction("DEBT_CLEARANCE", managedUser.getUsername(), "Paid " + amount + " towards loan principal.", "CREDIT_POOL");
    }

    @Transactional
    public SavingsGoal createGoal(User user, String name, BigDecimal target, String icon) {
        User managedUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Operational Fault: Session integrity failed."));

        SavingsGoal goal = new SavingsGoal();
        goal.setUser(managedUser);
        goal.setName(name);
        goal.setTargetAmount(target);
        goal.setCurrentAmount(BigDecimal.ZERO);
        goal.setIcon(icon != null ? icon : "target");
        
        recordAction("GOAL_ESTABLISHMENT", managedUser.getUsername(), "Initialized wealth goal: " + name, "HUB_SYSTEM");
        return savingsGoalRepository.save(goal);
    }

    @Transactional
    public Loan requestLoan(User user, BigDecimal amount, Integer months) {
        User managedUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Operational Fault: Session integrity failed."));

        // Institutional Credit Check: Minimum $500 total capital required
        BigDecimal totalBalance = accountRepository.findByUser(managedUser).stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalBalance.compareTo(new BigDecimal("500.00")) < 0) {
            throw new RuntimeException("Liquidity Insufficient: A $500 total reserve is required for credit authorization. Consult Academy for accumulation strategies.");
        }

        Loan loan = new Loan();
        loan.setUser(managedUser);
        loan.setPrincipalAmount(amount);
        loan.setRemainingBalance(amount);
        loan.setInterestRate(new BigDecimal("0.08"));
        loan.setStartDate(LocalDateTime.now());
        loan.setDurationInMonths(months);
        loan.setStatus("ACTIVE");
        
        // CREDIT THE SAVINGS ACCOUNT
        Account savings = accountRepository.findByUser(managedUser).stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No primary Savings account to receive institutional credit."));
        
        savings.setBalance(savings.getBalance().add(amount));
        accountRepository.save(savings);

        recordAction("CREDIT_AUTHORIZED", managedUser.getUsername(), "Loan of " + amount + " authorized and credited to Savings vault.", "CREDIT_POOL");
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
