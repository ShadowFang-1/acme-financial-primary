package com.acme.financial.controller;

import com.acme.financial.entity.*;
import com.acme.financial.service.FinancialHubService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hub")
public class FinancialHubController {

    private final FinancialHubService hubService;

    public FinancialHubController(FinancialHubService hubService) {
        this.hubService = hubService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(hubService.getFinancialSummary(user));
    }

    @PostMapping("/invest")
    public ResponseEntity<Void> invest(
            @AuthenticationPrincipal User user,
            @RequestParam BigDecimal amount,
            @RequestParam(defaultValue = "MONTHLY") String interval
    ) {
        hubService.invest(user, amount, interval);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invest/withdraw")
    public ResponseEntity<Void> withdrawInvestment(
            @AuthenticationPrincipal User user,
            @RequestParam Long investmentId,
            @RequestParam BigDecimal amount
    ) {
        hubService.withdrawInvestment(user, investmentId, amount);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/loans/pay")
    public ResponseEntity<Void> payOffLoan(
            @AuthenticationPrincipal User user,
            @RequestParam Long loanId,
            @RequestParam BigDecimal amount
    ) {
        hubService.payOffLoan(user, loanId, amount);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/savings/create")
    public ResponseEntity<SavingsGoal> createGoal(
            @AuthenticationPrincipal User user,
            @RequestParam String name,
            @RequestParam BigDecimal target,
            @RequestParam(required = false) String icon
    ) {
        return ResponseEntity.ok(hubService.createGoal(user, name, target, icon));
    }

    @PostMapping("/loans/apply")
    public ResponseEntity<Loan> applyForLoan(
            @AuthenticationPrincipal User user,
            @RequestParam BigDecimal amount,
            @RequestParam Integer months
    ) {
        return ResponseEntity.ok(hubService.requestLoan(user, amount, months));
    }

    @GetMapping("/calculator/compound")
    public ResponseEntity<Map<String, String>> calculateCompound(
            @RequestParam BigDecimal principal, 
            @RequestParam BigDecimal rate, 
            @RequestParam Integer years
    ) {
        // A = P(1 + r)^t
        double p = principal.doubleValue();
        double r = rate.doubleValue();
        double t = years.doubleValue();
        double a = p * Math.pow(1 + r, t);
        
        return ResponseEntity.ok(Map.of("futureValue", String.format("%.2f", a)));
    }

    @PostMapping("/audit/log")
    public ResponseEntity<Void> logAction(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        String action = body.get("action");
        String details = body.get("details");
        hubService.recordAction(action, user.getUsername(), details, "UI_TRIGGER");
        return ResponseEntity.ok().build();
    }
}
