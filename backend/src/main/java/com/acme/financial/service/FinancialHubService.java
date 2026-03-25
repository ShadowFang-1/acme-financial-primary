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
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AutoAllocationRepository autoAllocationRepository;

    public FinancialHubService(SavingsGoalRepository savingsGoalRepository,
                               InvestmentRepository investmentRepository,
                               LoanRepository loanRepository,
                               AuditLogRepository auditLogRepository,
                               AccountRepository accountRepository,
                               UserRepository userRepository,
                               TransactionRepository transactionRepository,
                               NotificationService notificationService,
                               EmailService emailService,
                               AutoAllocationRepository autoAllocationRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.investmentRepository = investmentRepository;
        this.loanRepository = loanRepository;
        this.auditLogRepository = auditLogRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.autoAllocationRepository = autoAllocationRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFinancialSummary(User user) {
        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Vault Error: Identity not located in current session."));

        Map<String, Object> summary = new HashMap<>();
        summary.put("savingsGoals", savingsGoalRepository.findByUser_Id(managedUser.getId()));
        summary.put("investments", investmentRepository.findByUser_Id(managedUser.getId()));
        summary.put("loans", loanRepository.findByUser_Id(managedUser.getId()));
        summary.put("auditLogs", auditLogRepository.findByUsernameOrderByTimestampDesc(managedUser.getUsername()));
        summary.put("allocations", autoAllocationRepository.findAllByUserOrderByCreatedAtDesc(managedUser));
        
        BigDecimal totalSavings = savingsGoalRepository.findByUser_Id(managedUser.getId()).stream()
            .map(SavingsGoal::getCurrentAmount)
            .filter(java.util.Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("totalSavingsProgress", totalSavings);

        return summary;
    }

    @Transactional
    public void invest(User user, BigDecimal amount, String interval) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Operational Fault: Investment amount must be positive.");
        }

        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Session not located."));

        List<Account> accounts = accountRepository.findByUser(managedUser);
        Account savings = accounts.stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No source Savings account identified."));
        
        Account investmentAcc = accounts.stream()
            .filter(a -> a.getType() == AccountType.INVESTMENT)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Operational Fault: No ACME Investment account located. Please open one first."));

        if (savings.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient Liquidity: Your Savings account does not have enough capital.");
        }

        savings.setBalance(savings.getBalance().subtract(amount));
        investmentAcc.setBalance(investmentAcc.getBalance().add(amount));
        accountRepository.save(savings);
        accountRepository.save(investmentAcc);

        // Record for tracking
        Investment inv = new Investment();
        inv.setUser(managedUser);
        inv.setAssetName("ACME Strategic Yield Portfolio");
        inv.setAssetType("HIGH_YIELD_INSTITUTIONAL");
        inv.setAmount(amount);
        inv.setGrowthInterval(interval != null ? interval : "MONTHLY");
        inv.setInterestRate(interval != null && interval.equals("ANNUALLY") ? new BigDecimal("12.0") : new BigDecimal("5.0"));
        inv.setStatus("GROWING");
        inv.setLastUpdated(LocalDateTime.now());
        investmentRepository.save(inv);

        // Record Transaction History
        Transaction trans = Transaction.builder()
            .senderAccount(savings)
            .receiverAccount(investmentAcc)
            .amount(amount)
            .description("Capital Relocation to " + inv.getGrowthInterval() + " Yield Portfolio")
            .type(TransactionType.TRANSFER)
            .build();
        transactionRepository.save(trans);

        // Notify
        String logMsg = "Invested " + amount + " into ACME High-Yield (" + inv.getGrowthInterval() + ")";
        notificationService.notify(managedUser, "Wealth Hub: Investment Successful", logMsg);
        emailService.sendEmail(managedUser.getEmail(), "ACME Financial Hub: Investment Alert", logMsg);
        recordAction("ASSET_INVEST", managedUser.getUsername(), logMsg, "INTERNAL_SYSTEM");
    }

    @Transactional
    public void withdrawInvestment(User user, Long investmentId, BigDecimal amount) {
        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Session not located."));

        List<Account> accounts = accountRepository.findByUser(managedUser);
        Account investmentAcc = accounts.stream()
            .filter(a -> a.getType() == AccountType.INVESTMENT)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No Investment vault identified."));

        if (investmentAcc.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Liquidity Insufficient: Investment balance too low.");
        }

        Account savings = accounts.stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No primary Savings account identified."));

        investmentAcc.setBalance(investmentAcc.getBalance().subtract(amount));
        savings.setBalance(savings.getBalance().add(amount));
        accountRepository.save(investmentAcc);
        accountRepository.save(savings);

        // Transaction History
        Transaction trans = Transaction.builder()
            .senderAccount(investmentAcc)
            .receiverAccount(savings)
            .amount(amount)
            .description("Investment Liquidation to Savings")
            .type(TransactionType.TRANSFER)
            .build();
        transactionRepository.save(trans);

        // Notify
        String logMsg = "Liquidated " + amount + " from Investment back to Savings.";
        notificationService.notify(managedUser, "Wealth Hub: Asset Liquidated", logMsg);
        emailService.sendEmail(managedUser.getEmail(), "ACME Financial Hub: Liquidation Alert", logMsg);
        recordAction("ASSET_WITHDRAW", managedUser.getUsername(), logMsg, "INTERNAL_SYSTEM");
    }

    @Transactional
    public void payOffLoan(User user, Long loanId, BigDecimal amount) {
        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Session not located."));

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Operational Fault: Loan instrument not found."));

        Account savings = accountRepository.findByUser(managedUser).stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No source account to clear debt."));

        if (savings.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Liquidity Insufficient: Savings balance too low for repayment.");
        }

        savings.setBalance(savings.getBalance().subtract(amount));
        loan.setRemainingBalance(loan.getRemainingBalance().subtract(amount));
        if (loan.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setStatus("COMPLETED");
            loan.setRemainingBalance(BigDecimal.ZERO);
        }
        accountRepository.save(savings);
        loanRepository.save(loan);

        // Transaction History
        Transaction trans = Transaction.builder()
            .senderAccount(savings)
            .amount(amount)
            .description("Repayment for Loan L-" + (loan.getId() % 1000))
            .type(TransactionType.WITHDRAWAL)
            .build();
        transactionRepository.save(trans);

        // Notify
        String logMsg = "Paid " + amount + " towards Loan L-" + (loan.getId() % 1000);
        notificationService.notify(managedUser, "Credit Hub: Debt Repayment", logMsg);
        emailService.sendEmail(managedUser.getEmail(), "ACME Financial Hub: Debt Payment Alert", logMsg);
        recordAction("DEBT_PAYMENT", managedUser.getUsername(), logMsg, "CREDIT_POOL");
    }

    @Transactional
    public SavingsGoal createGoal(User user, String name, BigDecimal target, String icon) {
        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Session integrity failed."));

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
    public void contributeToGoal(User user, Long goalId, BigDecimal amount) {
        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Session Error: Identity not located."));

        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found."));

        Account savings = accountRepository.findByUser(managedUser).stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No Savings account found."));

        if (savings.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds in Savings to contribute.");
        }

        savings.setBalance(savings.getBalance().subtract(amount));
        BigDecimal currentGoalAmount = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;
        goal.setCurrentAmount(currentGoalAmount.add(amount));
        accountRepository.save(savings);
        savingsGoalRepository.save(goal);

        // Transaction History
        Transaction trans = Transaction.builder()
            .senderAccount(savings)
            .amount(amount)
            .description("Contribution to Goal: " + goal.getName())
            .type(TransactionType.WITHDRAWAL)
            .build();
        transactionRepository.save(trans);

        // Notify
        String logMsg = "Contributed GHS " + amount + " to savings goal '" + goal.getName() + "'";
        notificationService.notify(managedUser, "Goal Contribution", logMsg);
        emailService.sendEmail(managedUser.getEmail(), "ACME Financial Hub: Goal Contribution", logMsg);
        recordAction("GOAL_CONTRIBUTION", managedUser.getUsername(), logMsg, "HUB_SYSTEM");
    }

    @Transactional
    public Loan requestLoan(User user, BigDecimal amount, Integer months) {
        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Institutional Fault: Session integrity failed."));

        BigDecimal totalBalance = accountRepository.findByUser(managedUser).stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalBalance.compareTo(new BigDecimal("500.00")) < 0) {
            throw new RuntimeException("Liquidity Insufficient: A $500 total reserve is required for credit authorization.");
        }

        Loan loan = new Loan();
        loan.setUser(managedUser);
        loan.setPrincipalAmount(amount);
        loan.setRemainingBalance(amount);
        loan.setInterestRate(new BigDecimal("0.08"));
        loan.setStartDate(LocalDateTime.now());
        loan.setDurationInMonths(months);
        loan.setStatus("ACTIVE");
        Loan savedLoan = loanRepository.save(loan);

        Account savings = accountRepository.findByUser(managedUser).stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Vault Error: No primary Savings account to receive institutional credit."));
        
        savings.setBalance(savings.getBalance().add(amount));
        accountRepository.save(savings);

        // Transaction History
        Transaction trans = Transaction.builder()
            .receiverAccount(savings)
            .amount(amount)
            .description("Institutional Loan Disbursement L-" + (savedLoan.getId() % 1000))
            .type(TransactionType.DEPOSIT)
            .build();
        transactionRepository.save(trans);

        // Notify
        String logMsg = "Loan of " + amount + " authorized and credited to Savings vault.";
        notificationService.notify(managedUser, "Credit Hub: Loan Authorized", logMsg);
        emailService.sendEmail(managedUser.getEmail(), "ACME Financial Hub: Loan Alert", logMsg);
        recordAction("CREDIT_AUTHORIZED", managedUser.getUsername(), logMsg, "CREDIT_POOL");
        
        return savedLoan;
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
