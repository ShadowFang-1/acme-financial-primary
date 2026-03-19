package com.acme.financial.service;

import com.acme.financial.dto.AuthenticationRequest;
import com.acme.financial.dto.AuthenticationResponse;
import com.acme.financial.dto.OtpVerificationRequest;
import com.acme.financial.dto.RegisterRequest;
import com.acme.financial.entity.Account;
import com.acme.financial.entity.AccountType;
import com.acme.financial.entity.Role;
import com.acme.financial.entity.User;
import com.acme.financial.repository.AccountRepository;
import com.acme.financial.repository.UserRepository;
import com.acme.financial.security.JwtService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository repository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public AuthService(UserRepository repository, AccountRepository accountRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, NotificationService notificationService, EmailService emailService) {
        this.repository = repository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        Optional<User> existingUser = repository.findByEmail(request.getEmail());
        
        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            if (user.isEnabled()) {
                throw new DataIntegrityViolationException("An account with this email already exists.");
            }
            // User exists but is unverified: update details to match latest attempt
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhoneNumber(request.getPhoneNumber());
            user.setCountry(request.getCountry());
            user.setDateOfBirth(request.getDateOfBirth());
        } else {
            user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.USER)
                    .enabled(false) // Account starts as disabled until email is verified
                    .phoneNumber(request.getPhoneNumber())
                    .country(request.getCountry())
                    .dateOfBirth(request.getDateOfBirth())
                    .build();
        }

        User savedUser = repository.saveAndFlush(user);
        
        // Dispatch Initial Verification Challenge
        sendOtp(savedUser.getEmail(), savedUser.getEmail());

        // Return response with OTP requirement
        // Use getDisplayName() for the username field to avoid returning the email (which getUsername() returns for auth)
        return AuthenticationResponse.builder()
                .requiresOtp(true)
                .identifier(savedUser.getEmail())
                .username(savedUser.getDisplayName())
                .email(savedUser.getEmail())
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
        User user = repository.findByIdentifier(identifier).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found during OTP initiation"));
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setOneTimePassword(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        repository.saveAndFlush(user);

        // Production dispatch via Email (100% Free)
        emailService.sendEmail(
            email, 
            "ACME Financial Security Alert",
            "Your ACME Financial login code is [" + otp + "]. Valid for 5 minutes."
        );
    }

    @Transactional
    public AuthenticationResponse verifyOtp(OtpVerificationRequest request) {
        System.out.println(">>> [OTP VERIFY] Identifier: " + request.getIdentifier() + " | Code: " + request.getOtp());
        
        User user = repository.findByIdentifier(request.getIdentifier()).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found during OTP verification: " + request.getIdentifier()));

        if (user.getOneTimePassword() == null) {
            System.err.println(">>> [OTP FAIL] No OTP on record for user: " + user.getUsername());
            throw new BadCredentialsException("Invalid OTP code");
        }

        if (!user.getOneTimePassword().equals(request.getOtp())) {
            System.err.println(">>> [OTP FAIL] Code mismatch. Expected: " + user.getOneTimePassword() + " | Got: " + request.getOtp());
            throw new BadCredentialsException("Invalid OTP code");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            System.err.println(">>> [OTP FAIL] Code expired at: " + user.getOtpExpiry());
            throw new BadCredentialsException("OTP has expired");
        }

        // Clear OTP after successful use
        user.setOneTimePassword(null);
        user.setOtpExpiry(null);
        if (!user.isEnabled()) {
            user.setEnabled(true);
            
            // Create a default account ONLY after first verification
            Account account = Account.builder()
                    .user(user)
                    .accountNumber(generateAccountNumber())
                    .balance(new BigDecimal("1000.00")) 
                    .type(AccountType.SAVINGS)
                    .build();
            accountRepository.saveAndFlush(account);
            System.out.println(">>> [REGISTRATION SUCCESS] Account activated: " + user.getUsername());
        }
        repository.saveAndFlush(user);
        System.out.println(">>> [OTP SUCCESS] User verified: " + user.getUsername());

        // If login notifications are enabled, send a notification
        if (user.isLoginNotifications()) {
            String timestamp = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(java.time.LocalDateTime.now());
            String alertMessage = "A new login session was initiated for your account at " + timestamp + 
                                  ". If this wasn't you, please secure your account immediately.";
            
            // App notification
            notificationService.notify(user, "Security Alert: New Login Detected", alertMessage);
            
            // Email notification
            emailService.sendEmail(user.getEmail(), "Security Alert: ACME Login Detected", alertMessage);
            System.out.println(">>> [SECURITY ALERT] Login notification dispatched to: " + user.getEmail());
        }

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .imageUrl(user.getImageUrl())
                .pushNotifications(user.isPushNotifications())
                .emailAlerts(user.isEmailAlerts())
                .loginNotifications(user.isLoginNotifications())
                .build();
    }

    public void forgotPassword(String email) {
        if (!repository.existsByEmail(email)) {
            throw new RuntimeException("No account found with this email");
        }
        
        System.out.println(">>> [FORGOT PASSWORD] Resending OTP for: " + email);
        sendOtp(email, email);
    }

    public void resetPassword(String email, String otp, String newPassword) {
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

    private String generateAccountNumber() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
