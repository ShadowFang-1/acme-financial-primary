package com.acme.financial.controller;

import com.acme.financial.entity.AutoAllocation;
import com.acme.financial.entity.User;
import com.acme.financial.service.AutoAllocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hub/allocations")
public class AutoAllocationController {

    private final AutoAllocationService allocationService;

    public AutoAllocationController(AutoAllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping
    public ResponseEntity<?> getAllocations(@AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(allocationService.getAllocations(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAllocation(
            @AuthenticationPrincipal User user,
            @RequestParam String destinationType,
            @RequestParam(required = false) Long destinationId,
            @RequestParam BigDecimal amount,
            @RequestParam String frequency,
            @RequestParam(required = false) String label
    ) {
        try {
            AutoAllocation alloc = allocationService.createAllocation(
                    user, destinationType, destinationId, amount, frequency, label);
            return ResponseEntity.ok(alloc);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggleAllocation(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        try {
            allocationService.toggleAllocation(user, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAllocation(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        try {
            allocationService.deleteAllocation(user, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
