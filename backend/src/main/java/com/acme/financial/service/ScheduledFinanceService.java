package com.acme.financial.service;

import com.acme.financial.entity.*;
import com.acme.financial.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduledFinanceService {

    private final InvestmentRepository investmentRepository;
    private final LoanRepository loanRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ScheduledFinanceService(
            InvestmentRepository investmentRepository,
            LoanRepository loanRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            NotificationService notificationService,
            EmailService emailService
    ) {
        this.investmentRepository = investmentRepository;
        this.loanRepository = loanRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    /**
     * INVESTMENT INTEREST COMPOUNDING
     * Runs every hour — checks each active investment's growthInterval and lastUpdated.
     * If interest is due, compounds it onto the principal and reflects in the investment account.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void compoundInvestmentInterest() {
        List<Investment> investments = investmentRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Investment inv : investments) {
            if (!"ACTIVE".equals(inv.getStatus()) && !"GROWING".equals(inv.getStatus())) continue;
            if (inv.getLastUpdated() == null) {
                inv.setLastUpdated(now);
                investmentRepository.save(inv);
                continue;
            }

            boolean isDue = false;
            String interval = inv.getGrowthInterval();
            if (interval == null) interval = "MONTHLY";

            switch (interval) {
                case "DAILY":
                    isDue = inv.getLastUpdated().plusDays(1).isBefore(now);
                    break;
                case "WEEKLY":
                    isDue = inv.getLastUpdated().plusWeeks(1).isBefore(now);
                    break;
                case "MONTHLY":
                    isDue = inv.getLastUpdated().plusMonths(1).isBefore(now);
                    break;
                case "ANNUALLY":
                    isDue = inv.getLastUpdated().plusYears(1).isBefore(now);
                    break;
            }

            if (isDue) {
                try {
                    applyInterest(inv, now);
                } catch (Exception e) {
                    System.err.println("Interest compounding failed for investment " + inv.getId() + ": " + e.getMessage());
                }
            }
        }
    }

    private void applyInterest(Investment inv, LocalDateTime now) {
        BigDecimal rate = inv.getInterestRate();
        if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) return;

        // Periodic rate is already stored in inv.getInterestRate() (0.5, 1, 5, or 12)
        BigDecimal periodRate = rate.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP);
        String interval = inv.getGrowthInterval() != null ? inv.getGrowthInterval() : "MONTHLY";

        BigDecimal interest = inv.getAmount().multiply(periodRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal newAmount = inv.getAmount().add(interest);

        inv.setAmount(newAmount);
        inv.setLastUpdated(now);
        investmentRepository.save(inv);

        // Also update the investment account balance
        User user = inv.getUser();
        accountRepository.findByUser(user).stream()
            .filter(a -> a.getType() == AccountType.INVESTMENT)
            .findFirst()
            .ifPresent(acc -> {
                acc.setBalance(acc.getBalance().add(interest));
                accountRepository.save(acc);
            });

        // Record transaction
        accountRepository.findByUser(user).stream()
            .filter(a -> a.getType() == AccountType.INVESTMENT)
            .findFirst()
            .ifPresent(acc -> {
                Transaction trans = Transaction.builder()
                    .receiverAccount(acc)
                    .amount(interest)
                    .description("Interest Earned (" + interval + "): " + (inv.getAssetName() != null ? inv.getAssetName() : "Investment"))
                    .type(TransactionType.DEPOSIT)
                    .build();
                transactionRepository.save(trans);
            });

        // Notify
        String msg = "Your investment earned GHS " + interest + " in interest. New balance: GHS " + newAmount;
        notificationService.notify(user, "Investment Interest Credited", msg);
        
        // Target Reached check
        if (inv.getTargetAmount() != null && newAmount.compareTo(inv.getTargetAmount()) >= 0 
            && inv.getAmount().subtract(interest).compareTo(inv.getTargetAmount()) < 0) {
            String targetMsg = "Congratulations! Your investment '" + inv.getAssetName() + "' has reached its target of GHS " + inv.getTargetAmount();
            notificationService.notify(user, "Investment Target Reached", targetMsg);
            emailService.sendEmail(user.getEmail(), "ACME: Investment Target Reached", targetMsg);
        }

        emailService.sendEmail(user.getEmail(), "ACME: Investment Interest Credited", msg);
    }

    /**
     * LOAN AUTO-REPAYMENT
     * Runs every hour — checks loans with upcoming repayment dates.
     * Auto-deducts from savings until the loan is fully repaid or the closing date is reached.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void processLoanRepayments() {
        List<Loan> loans = loanRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Loan loan : loans) {
            if (!"ACTIVE".equals(loan.getStatus())) continue;
            if (loan.getRepaymentFrequency() == null) continue;
            if (loan.getNextRepaymentDate() == null) continue;
            if (loan.getNextRepaymentDate().isAfter(now)) continue;

            try {
                processLoanPayment(loan, now);
            } catch (Exception e) {
                System.err.println("Loan auto-repayment failed for loan " + loan.getId() + ": " + e.getMessage());
                notificationService.notify(loan.getUser(), "Loan Repayment Failed",
                    "Auto-repayment of GHS " + loan.getRepaymentAmount() + " failed: " + e.getMessage());
            }
        }
    }

    private void processLoanPayment(Loan loan, LocalDateTime now) {
        User user = loan.getUser();

        Account savings = accountRepository.findByUser(user).stream()
            .filter(a -> a.getType() == AccountType.SAVINGS)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No savings account found for auto-repayment."));

        BigDecimal payAmount = loan.getRepaymentAmount();
        if (payAmount == null || payAmount.compareTo(BigDecimal.ZERO) <= 0) return;

        // Don't overpay — cap at remaining balance
        payAmount = payAmount.min(loan.getRemainingBalance());

        if (savings.getBalance().compareTo(payAmount) < 0) {
            notificationService.notify(user, "Insufficient Funds for Loan Repayment",
                "Auto-repayment of GHS " + payAmount + " could not be processed. Savings balance: GHS " + savings.getBalance());
            emailService.sendEmail(user.getEmail(), "ACME: Loan Repayment Warning",
                "Your scheduled loan repayment of GHS " + payAmount + " failed due to insufficient savings. Please fund your account.");
            // Still advance the next date to avoid infinite retries
            loan.setNextRepaymentDate(calculateNextDate(loan.getRepaymentFrequency(), now));
            loanRepository.save(loan);
            return;
        }

        // Deduct from savings
        savings.setBalance(savings.getBalance().subtract(payAmount));
        loan.setRemainingBalance(loan.getRemainingBalance().subtract(payAmount));
        accountRepository.save(savings);

        // Check if fully paid
        if (loan.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setRemainingBalance(BigDecimal.ZERO);
            loan.setStatus("COMPLETED");
            loan.setNextRepaymentDate(null);
            notificationService.notify(user, "Loan Fully Repaid!",
                "Your loan of GHS " + loan.getPrincipalAmount() + " has been fully cleared by auto-repayment!");
            emailService.sendEmail(user.getEmail(), "ACME: Loan Fully Cleared",
                "Congratulations! Your loan has been fully repaid through scheduled payments.");
        } else {
            // Check closing date — if past, force full deduction
            if (loan.getClosingDate() != null && now.isAfter(loan.getClosingDate())) {
                BigDecimal remaining = loan.getRemainingBalance();
                if (savings.getBalance().compareTo(remaining) >= 0) {
                    savings.setBalance(savings.getBalance().subtract(remaining));
                    loan.setRemainingBalance(BigDecimal.ZERO);
                    loan.setStatus("COMPLETED");
                    loan.setNextRepaymentDate(null);
                    accountRepository.save(savings);
                    notificationService.notify(user, "Loan Closed at Deadline",
                        "Remaining GHS " + remaining + " was deducted at closing date.");
                } else {
                    notificationService.notify(user, "Loan Closing Date Passed",
                        "Insufficient funds to clear remaining GHS " + remaining + " at closing. Please fund your account immediately.");
                }
            } else {
                loan.setNextRepaymentDate(calculateNextDate(loan.getRepaymentFrequency(), now));
            }
        }

        loanRepository.save(loan);

        // Transaction record
        Transaction trans = Transaction.builder()
            .senderAccount(savings)
            .amount(payAmount)
            .description("Auto Loan Repayment (Scheduled " + loan.getRepaymentFrequency() + ")")
            .type(TransactionType.WITHDRAWAL)
            .build();
        transactionRepository.save(trans);

        String msg = "Auto-repayment of GHS " + payAmount + " processed. Remaining: GHS " + loan.getRemainingBalance();
        notificationService.notify(user, "Loan Repayment Processed", msg);
        emailService.sendEmail(user.getEmail(), "ACME: Loan Repayment Processed", msg);
    }

    private LocalDateTime calculateNextDate(String frequency, LocalDateTime from) {
        return switch (frequency) {
            case "DAILY" -> from.plusDays(1);
            case "WEEKLY" -> from.plusWeeks(1);
            case "MONTHLY" -> from.plusMonths(1);
            case "YEARLY" -> from.plusYears(1);
            default -> from.plusMonths(1);
        };
    }
}
