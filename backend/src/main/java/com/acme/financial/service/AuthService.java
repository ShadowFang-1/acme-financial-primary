package com.acme.financial.service;

import com.acme.financial.dto.AuthenticationRequest;
import com.acme.financial.dto.AuthenticationResponse;
import com.acme.financial.dto.OtpVerificationRequest;
import com.acme.financial.dto.RegisterRequest;
import com.acme.financial.entity.Role;
import com.acme.financial.entity.User;
import com.acme.financial.repository.UserRepository;
import com.acme.financial.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.regex.Pattern;

@Service
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // Memory storage for unverified registrations (as requested: do not save to DB before verification)
    private static class PendingUser {
        com.acme.financial.dto.RegisterRequest request;
        String otp;
        java.time.LocalDateTime expiry;
        PendingUser(com.acme.financial.dto.RegisterRequest request, String otp, java.time.LocalDateTime expiry) {
            this.request = request;
            this.otp = otp;
            this.expiry = expiry;
        }
    }
    private final java.util.Map<String, PendingUser> pendingRegistrations = new java.util.concurrent.ConcurrentHashMap<>();

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, EmailService emailService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }
        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            throw new RuntimeException("Password must contain at least one uppercase letter");
        }
        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            throw new RuntimeException("Password must contain at least one lowercase letter");
        }
        if (!Pattern.compile("[0-9]").matcher(password).find()) {
            throw new RuntimeException("Password must contain at least one number");
        }
        if (!Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\\\\|,.<>/?`~]").matcher(password).find()) {
            throw new RuntimeException("Password must contain at least one special symbol (!@#$%^&*...)");
        }
    }

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        // Validate password strength
        validatePasswordStrength(request.getPassword());

        if (repository.existsByEmail(request.getEmail())) {
            throw new org.springframework.dao.DataIntegrityViolationException("Credential Node Overflow: This email identity is already anchored to a verified account.");
        }

        // Generate challenge code
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        
        // Protocol 7: Store in memory only (Do NOT persist to database until verified)
        pendingRegistrations.put(request.getEmail(), new PendingUser(
            request, 
            otp, 
            java.time.LocalDateTime.now().plusMinutes(10)
        ));

        // Dispatch Challenge
        System.out.println("========================================");
        System.out.println(">>> [ANTIGRAVITY] PENDING REGISTRATION CODE");
        System.out.println(">>> TARGET: " + request.getEmail());
        System.out.println(">>> ACCESS CODE: " + otp);
        System.out.println("========================================");

        emailService.sendEmail(
            request.getEmail(), 
            "Verify Your ACME Collective Node",
            "Your registration code is [" + otp + "]. Valid for 10 minutes. Your credentials are held in transition security until verification."
        );

        return AuthenticationResponse.builder()
                .requiresOtp(true)
                .identifier(request.getEmail())
                .username(request.getUsername())
                .email(request.getEmail())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String identifier = request.getIdentifier();
        System.out.println("Processing login identifier: [" + identifier + "]");
        
        // Find user by either phoneNumber, account number, email or username
        User user = repository.findByIdentifier(identifier).stream()
                .findFirst()
                .orElseThrow(() -> new BadCredentialsException("No account found with this Email, Username or Account Number"));

        // Validate password BEFORE asking for phone number
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        request.getPassword()
                )
        );

        // Use getDisplayName() for the username field to avoid returning the email (which getUsername() returns for auth)
        return AuthenticationResponse.builder()
                .requiresOtp(true)
                .identifier(identifier)
                .username(user.getDisplayName())
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public void sendOtp(String identifier, String email) {
        // Case A: Is it a pending memory registration?
        PendingUser pending = pendingRegistrations.get(email);
        if (pending != null) {
            String newOtp = String.format("%06d", new java.util.Random().nextInt(1000000));
            pending.otp = newOtp;
            pending.expiry = java.time.LocalDateTime.now().plusMinutes(5);
            
            System.out.println(">>> [RESEND PENDING] " + email + " -> " + newOtp);
            emailService.sendEmail(email, "ACME Security Alert: New Code", "Your new registration code is [" + newOtp + "]");
            return;
        }

        // Case B: Database User (Login or Forgot)
        User user = repository.findByIdentifier(identifier).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found during OTP initiation"));
        
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setOneTimePassword(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        repository.saveAndFlush(user);

        System.out.println(">>> [SEND DB USER] " + email + " -> " + otp);
        emailService.sendEmail(email, "ACME Security Alert", "Your access code is [" + otp + "]");
    }


    @Transactional
    public AuthenticationResponse verifyOtp(OtpVerificationRequest request) {
        String identifier = request.getIdentifier();
        String otp = request.getOtp();

        // 1. Check Pending Memory Registrations First
        PendingUser pending = pendingRegistrations.get(identifier);
        if (pending != null) {
            if (!pending.otp.equals(otp)) {
                throw new BadCredentialsException("Invalid registration code mismatch");
            }
            if (pending.expiry.isBefore(java.time.LocalDateTime.now())) {
                pendingRegistrations.remove(identifier);
                throw new BadCredentialsException("Registration link expired. Please sign up again.");
            }

            // SUCCESS: Persist to DB now
            RegisterRequest reg = pending.request;
            User user = User.builder()
                    .username(reg.getUsername())
                    .email(reg.getEmail())
                    .password(passwordEncoder.encode(reg.getPassword()))
                    .role(Role.USER)
                    .enabled(true)
                    .phoneNumber(reg.getPhoneNumber())
                    .country(reg.getCountry())
                    .dateOfBirth(reg.getDateOfBirth())
                    .build();
            
            repository.saveAndFlush(user);
            pendingRegistrations.remove(identifier);
            System.out.println(">>> [DATABASE PERSISTENCE SUCCESS] Node verified and stored: " + user.getEmail());
            return generateTokens(user);
        }

        // 2. Fallback: Database Verification (Login / Reset)
        User user = repository.findByIdentifier(identifier).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Active identifier not found in node registry"));

        if (user.getOneTimePassword() == null || !user.getOneTimePassword().equals(otp)) {
            throw new BadCredentialsException("Invalid challenge response");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadCredentialsException("Challenge window closed (Time Expired)");
        }

        // Clear OTP after successful use
        user.setOneTimePassword(null);
        user.setOtpExpiry(null);
        if (!user.isEnabled()) {
            user.setEnabled(true);
        }
        repository.saveAndFlush(user);
        System.out.println(">>> [DATABASE VERIFY SUCCESS] Persistence validated for existing node: " + user.getUsername());

        // Login alerts if enabled
        if (user.isLoginNotifications()) {
            String timestamp = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(java.time.LocalDateTime.now());
            emailService.sendEmail(user.getEmail(), "ACME Access Alert", "Successful login at " + timestamp);
        }

        return generateTokens(user);
    }

    private AuthenticationResponse generateTokens(User user) {
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        repository.save(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .username(user.getDisplayName())
                .email(user.getEmail())
                .role(user.getRole())
                .imageUrl(user.getImageUrl())
                .pushNotifications(user.isPushNotifications())
                .emailAlerts(user.isEmailAlerts())
                .loginNotifications(user.isLoginNotifications())
                .build();
    }

    public AuthenticationResponse refreshToken(String refreshToken) {
        final String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = repository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found during token refresh"));
            
            if (jwtService.isTokenValid(refreshToken, user) && refreshToken.equals(user.getRefreshToken())) {
                var accessToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                        .token(accessToken)
                        .refreshToken(refreshToken)
                        .username(user.getDisplayName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build();
            }
        }
        throw new RuntimeException("Refresh token is invalid or expired");
    }

    public void forgotPassword(String email) {
        if (!repository.existsByEmail(email)) {
            throw new RuntimeException("No account found with this email");
        }
        
        System.out.println(">>> [FORGOT PASSWORD] Resending OTP for: " + email);
        sendOtp(email, email);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        // Validate new password strength
        validatePasswordStrength(newPassword);

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        if (user.getOneTimePassword() == null || !user.getOneTimePassword().equals(otp)) {
            throw new BadCredentialsException("Invalid reset code");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadCredentialsException("Reset code has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOneTimePassword(null);
        user.setOtpExpiry(null);
        repository.save(user);
        System.out.println(">>> [RESET SUCCESS] Password updated for: " + email);
    }
}
