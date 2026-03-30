package com.acme.financial.config;

import com.acme.financial.entity.Account;
import com.acme.financial.entity.AccountType;
import com.acme.financial.entity.Role;
import com.acme.financial.entity.User;
import com.acme.financial.repository.AccountRepository;
import com.acme.financial.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Random;

@Configuration
@SuppressWarnings("null")
public class AdminSetupConfig {

    @Bean
    public CommandLineRunner setupAdmin(UserRepository repository, AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                System.out.println(">>> [STARTUP] Beginning identity verification for administrative node...");
                String oldEmail = "admin@acme.com";
                String newEmail = "dshout01@gmail.com";
                
                Optional<User> adminOpt = repository.findByEmail(newEmail);
                User admin;
                if (adminOpt.isEmpty()) {
                    // Check if old admin exists and needs migration
                    Optional<User> oldAdminOpt = repository.findByEmail(oldEmail);
                    if (oldAdminOpt.isPresent()) {
                        admin = oldAdminOpt.get();
                        admin.setEmail(newEmail);
                        admin = repository.save(admin);
                        System.out.println(">>> [IDENTITY MIGRATION] Existing admin migrated to: " + newEmail);
                    } else {
                        // Create fresh admin
                        admin = User.builder()
                                .username("admin")
                                .email(newEmail)
                                .password(passwordEncoder.encode("admin123"))
                                .role(Role.ADMIN)
                                .enabled(true)
                                .build();
                        admin = repository.save(admin);
                        System.out.println(">>> [PROVISIONING] New Admin user created with: " + newEmail);
                    }
                } else {
                    admin = adminOpt.get();
                    System.out.println(">>> [VERIFIED] Administrative node detected: " + newEmail);
                }
                
                // Ensure admin has an account
                if (accountRepository.findByUser(admin).isEmpty()) {
                    Account account = Account.builder()
                            .user(admin)
                            .accountNumber(generateAccountNumber())
                            .balance(new BigDecimal("10000.00"))
                            .type(AccountType.CHECKING)
                            .frozen(false)
                            .build();
                    accountRepository.save(account);
                    System.out.println(">>> [PROVISIONING] Admin financial account established.");
                }
                System.out.println(">>> [SUCCESS] Administrative node initialization complete.");
            } catch (Exception e) {
                System.err.println(">>> [CRITICAL ERROR] Administrative node provisioning failed: " + e.getMessage());
                e.printStackTrace();
                // We do NOT rethrow here to prevent crashing the whole app
            }
        };
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
