package com.acme.financial.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/status")
public class SystemStatusController {

    /**
     * Lightweight endpoint for the Antigravity Agent to check server health.
     * Returns a 200 OK with a current timestamp to help identify wake-up latency.
     */
    @GetMapping
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", Instant.now().toString());
        status.put("message", "SecurePay Backend is awake and responsive.");
        return status;
    }
}
