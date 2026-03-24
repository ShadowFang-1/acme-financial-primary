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
        return ResponseEntity.ok(hubService.getFinancialSummary(user));
    }

    @PostMapping("/savings/create")
    public ResponseEntity<SavingsGoal> createGoal(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        String name = body.get("name");
        BigDecimal target = new BigDecimal(body.get("targetAmount"));
        String icon = body.get("icon");
        return ResponseEntity.ok(hubService.createGoal(user, name, target, icon));
    }

    @PostMapping("/loans/apply")
    public ResponseEntity<Loan> applyForLoan(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        BigDecimal amount = new BigDecimal(body.get("amount"));
        Integer months = Integer.parseInt(body.get("months"));
        return ResponseEntity.ok(hubService.requestLoan(user, amount, months));
    }

    @GetMapping("/calculator/compound")
    public ResponseEntity<Map<String, BigDecimal>> calculateCompound(@RequestParam BigDecimal principal, @RequestParam BigDecimal rate, @RequestParam Integer years) {
        // Simple formula: A = P(1 + r/n)^(nt)
        // For simplicity: A = P * (1 + rate)^years
        BigDecimal base = BigDecimal.ONE.add(rate);
        BigDecimal result = principal.multiply(base.pow(years));
        return ResponseEntity.ok(Map.of("futureValue", result));
    }

    @PostMapping("/audit/log")
    public ResponseEntity<Void> logAction(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        String action = body.get("action");
        String details = body.get("details");
        hubService.recordAction(action, user.getUsername(), details, "UI_TRIGGER");
        return ResponseEntity.ok().build();
    }
}
