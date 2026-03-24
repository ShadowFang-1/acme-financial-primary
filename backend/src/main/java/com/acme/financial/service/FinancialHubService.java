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
    public void invest(User user, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Investment amount must be positive");
        }

        User managedUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Capital relocation requires active session matching."));

        List<Account> accounts = accountRepository.findByUser_Id(managedUser.getId());
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
