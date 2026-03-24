package com.acme.financial.controller;

import com.acme.financial.dto.AuthenticationRequest;
import com.acme.financial.dto.AuthenticationResponse;
import com.acme.financial.dto.RegisterRequest;
import com.acme.financial.dto.OtpVerificationRequest;
import com.acme.financial.dto.ResetPasswordRequest;
import com.acme.financial.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthenticationResponse> verifyOtp(
            @RequestBody OtpVerificationRequest request
    ) {
        System.out.println(">>> [CONTROLLER] Incoming verify-otp for: " + request.getIdentifier());
        return ResponseEntity.ok(service.verifyOtp(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Void> sendOtp(
            @RequestBody OtpVerificationRequest request
    ) {
        service.sendOtp(request.getIdentifier(), request.getOtp()); // Re-using OtpVerificationRequest for {identifier, email}
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @RequestBody ResetPasswordRequest request
    ) {
        service.forgotPassword(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {
        service.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthenticationResponse> refresh(
            @RequestHeader("Refresh-Token") String token
    ) {
        return ResponseEntity.ok(service.refreshToken(token));
    }
}
