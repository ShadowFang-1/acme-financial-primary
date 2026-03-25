package com.acme.financial.service;

import com.acme.financial.entity.*;
import com.acme.financial.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AutoAllocationService {

    private final AutoAllocationRepository allocationRepository;
    private final AccountRepository accountRepository;
    private final InvestmentRepository investmentRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final LoanRepository loanRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public AutoAllocationService(
            AutoAllocationRepository allocationRepository,
            AccountRepository accountRepository,
            InvestmentRepository investmentRepository,
            SavingsGoalRepository savingsGoalRepository,
            LoanRepository loanRepository,
            TransactionRepository transactionRepository,
            NotificationService notificationService,
            EmailService emailService,
            UserRepository userRepository
    ) {
        this.allocationRepository = allocationRepository;
        this.accountRepository = accountRepository;
        this.investmentRepository = investmentRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.loanRepository = loanRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @Transactional
    public AutoAllocation createAllocation(User user, String destinationType, Long destinationId,
                                           BigDecimal amount, String frequency, String label) {
        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Session Error: Identity not located."));

        AutoAllocation allocation = new AutoAllocation();
        allocation.setUser(managedUser);
        allocation.setAmount(amount);
        allocation.setFrequency(frequency);
        allocation.setDestinationType(destinationType);
        allocation.setDestinationId(destinationId);
        allocation.setLabel(label != null ? label : destinationType + " Auto-Allocation");
        allocation.setActive(true);
        allocation.setNextExecutionDate(calculateNextExecution(frequency, LocalDateTime.now()));

        notificationService.notify(managedUser, "Auto-Allocation Created",
                "Scheduled " + frequency + " allocation of GHS " + amount + " to " + destinationType);
        emailService.sendEmail(managedUser.getEmail(), "ACME: Auto-Allocation Activated",
                "Your " + frequency + " allocation of GHS " + amount + " has been activated.");

        return allocationRepository.save(allocation);
    }

    public List<AutoAllocation> getAllocations(User user) {
        User managedUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Session Error."));
        return allocationRepository.findAllByUserOrderByCreatedAtDesc(managedUser);
    }

    @Transactional
    public void toggleAllocation(User user, Long allocationId) {
        AutoAllocation alloc = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found."));
        alloc.setActive(!alloc.isActive());
        allocationRepository.save(alloc);
    }

    @Transactional
    public void deleteAllocation(User user, Long allocationId) {
        allocationRepository.deleteById(allocationId);
    }

    /**
     * Scheduled executor - runs every hour and processes all due allocations.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void processAllocations() {
        List<AutoAllocation> dueAllocations = allocationRepository
                .findAllByActiveTrueAndNextExecutionDateBefore(LocalDateTime.now());

        for (AutoAllocation alloc : dueAllocations) {
            try {
                executeAllocation(alloc);
            } catch (Exception e) {
                System.err.println("Auto-allocation failed for ID " + alloc.getId() + ": " + e.getMessage());
                notificationService.notify(alloc.getUser(), "Auto-Allocation Failed",
                        "Scheduled allocation of GHS " + alloc.getAmount() + " failed: " + e.getMessage());
            }
        }
    }

    private void executeAllocation(AutoAllocation alloc) {
        User user = alloc.getUser();

        // Find savings account as source
        Account savings = accountRepository.findByUser(user).stream()
                .filter(a -> a.getType() == AccountType.SAVINGS)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No savings account found."));

        if (savings.getBalance().compareTo(alloc.getAmount()) < 0) {
            throw new RuntimeException("Insufficient savings balance for auto-allocation.");
        }

        switch (alloc.getDestinationType()) {
            case "INVESTMENT":
                executeInvestmentAllocation(user, savings, alloc);
                break;
            case "SAVINGS_GOAL":
                executeGoalAllocation(user, savings, alloc);
                break;
            case "LOAN_PAYMENT":
                executeLoanAllocation(user, savings, alloc);
                break;
            default:
                throw new RuntimeException("Unknown destination type: " + alloc.getDestinationType());
        }

        // Update execution tracking
        alloc.setLastExecutedAt(LocalDateTime.now());
        alloc.setNextExecutionDate(calculateNextExecution(alloc.getFrequency(), LocalDateTime.now()));
        allocationRepository.save(alloc);

        // Notify
        String msg = "Auto-allocated GHS " + alloc.getAmount() + " to " + alloc.getLabel();
        notificationService.notify(user, "Auto-Allocation Executed", msg);
        emailService.sendEmail(user.getEmail(), "ACME: Auto-Allocation Complete", msg);
    }

    private void executeInvestmentAllocation(User user, Account savings, AutoAllocation alloc) {
        Account investmentAcc = accountRepository.findByUser(user).stream()
                .filter(a -> a.getType() == AccountType.INVESTMENT)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No investment account. Create one from Dashboard."));

        savings.setBalance(savings.getBalance().subtract(alloc.getAmount()));
        investmentAcc.setBalance(investmentAcc.getBalance().add(alloc.getAmount()));
        accountRepository.save(savings);
        accountRepository.save(investmentAcc);

        Transaction trans = Transaction.builder()
                .senderAccount(savings)
                .receiverAccount(investmentAcc)
                .amount(alloc.getAmount())
                .description("Auto-Allocation: " + alloc.getLabel())
                .type(TransactionType.TRANSFER)
                .build();
        transactionRepository.save(trans);
    }

    private void executeGoalAllocation(User user, Account savings, AutoAllocation alloc) {
        SavingsGoal goal = savingsGoalRepository.findById(alloc.getDestinationId())
                .orElseThrow(() -> new RuntimeException("Savings goal not found."));

        savings.setBalance(savings.getBalance().subtract(alloc.getAmount()));
        BigDecimal current = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;
        goal.setCurrentAmount(current.add(alloc.getAmount()));
        accountRepository.save(savings);
        savingsGoalRepository.save(goal);

        // Auto-deactivate if goal reached
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            alloc.setActive(false);
            notificationService.notify(user, "Goal Reached!", "Your savings goal '" + goal.getName() + "' has been fulfilled!");
        }

        Transaction trans = Transaction.builder()
                .senderAccount(savings)
                .amount(alloc.getAmount())
                .description("Auto-Allocation to Goal: " + goal.getName())
                .type(TransactionType.WITHDRAWAL)
                .build();
        transactionRepository.save(trans);
    }

    private void executeLoanAllocation(User user, Account savings, AutoAllocation alloc) {
        Loan loan = loanRepository.findById(alloc.getDestinationId())
                .orElseThrow(() -> new RuntimeException("Loan not found."));

        if (!"ACTIVE".equals(loan.getStatus())) {
            alloc.setActive(false);
            allocationRepository.save(alloc);
            return;
        }

        BigDecimal payAmount = alloc.getAmount().min(loan.getRemainingBalance());
        savings.setBalance(savings.getBalance().subtract(payAmount));
        loan.setRemainingBalance(loan.getRemainingBalance().subtract(payAmount));

        if (loan.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setStatus("COMPLETED");
            loan.setRemainingBalance(BigDecimal.ZERO);
            alloc.setActive(false);
            notificationService.notify(user, "Loan Cleared!", "Your loan has been fully repaid by auto-allocation!");
        }

        accountRepository.save(savings);
        loanRepository.save(loan);

        Transaction trans = Transaction.builder()
                .senderAccount(savings)
                .amount(payAmount)
                .description("Auto-Allocation: Loan Repayment")
                .type(TransactionType.WITHDRAWAL)
                .build();
        transactionRepository.save(trans);
    }

    private LocalDateTime calculateNextExecution(String frequency, LocalDateTime from) {
        return switch (frequency) {
            case "DAILY" -> from.plusDays(1);
            case "WEEKLY" -> from.plusWeeks(1);
            case "MONTHLY" -> from.plusMonths(1);
            case "YEARLY" -> from.plusYears(1);
            default -> from.plusMonths(1);
        };
    }
}
