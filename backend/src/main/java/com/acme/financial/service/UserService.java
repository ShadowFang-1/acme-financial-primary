package com.acme.financial.service;

import com.acme.financial.dto.ChangePasswordRequest;
import com.acme.financial.dto.UserUpdateRequest;
import com.acme.financial.entity.User;
import com.acme.financial.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.regex.Pattern;

import java.util.Collections;
import java.util.List;

@Service
@SuppressWarnings("null")
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder, CloudinaryService cloudinaryService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinaryService = cloudinaryService;
    }

    public User getUserInfo(User user) {
        return repository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(User user, UserUpdateRequest request) {
        User existingUser = repository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null) {
            existingUser.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            existingUser.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getCountry() != null) {
            existingUser.setCountry(request.getCountry());
        }
        if (request.getImageUrl() != null) {
            existingUser.setImageUrl(request.getImageUrl());
        }
        existingUser.setPushNotifications(request.isPushNotifications());
        existingUser.setEmailAlerts(request.isEmailAlerts());
        existingUser.setLoginNotifications(request.isLoginNotifications());
        if (request.getDateOfBirth() != null) {
            existingUser.setDateOfBirth(request.getDateOfBirth());
        }

        return repository.save(existingUser);
    }

    @Transactional
    public void deactivate(User user) {
        User existingUser = repository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        existingUser.setEnabled(false);
        repository.save(existingUser);
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
    public void changePassword(User user, ChangePasswordRequest request) {
        User existingUser = repository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), existingUser.getPassword())) {
            throw new RuntimeException("Password mismatch: Your current password is incorrect. Please check and try again.");
        }

        // Validate new password strength
        validatePasswordStrength(request.getNewPassword());

        existingUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(existingUser);
    }

    @Transactional
    public String saveAvatar(User user, MultipartFile file) {
        String imageUrl = cloudinaryService.uploadImage(file, user.getId().toString());
        
        User existingUser = repository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        existingUser.setImageUrl(imageUrl);
        repository.save(existingUser);

        return imageUrl;
    }

    @Transactional(readOnly = true)
    public List<String> getMyAvatars(User user) {
        // Return current image. Cloudinary list/search requires extra complexity.
        User existingUser = repository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return existingUser.getImageUrl() != null ? List.of(existingUser.getImageUrl()) : Collections.emptyList();
    }
}
