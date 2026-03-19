package com.acme.financial.service;

import com.acme.financial.dto.ChangePasswordRequest;
import com.acme.financial.dto.UserUpdateRequest;
import com.acme.financial.entity.User;
import com.acme.financial.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
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

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        User existingUser = repository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), existingUser.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        existingUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(existingUser);
    }

    @Transactional
    public String saveAvatar(User user, MultipartFile file) {
        try {
            String fileName = "u_" + user.getId() + "_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("./uploads/avatars");
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            String imageUrl = "/uploads/avatars/" + fileName;
            
            User existingUser = repository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            existingUser.setImageUrl(imageUrl);
            repository.save(existingUser);

            return imageUrl;
        } catch (IOException e) {
            throw new RuntimeException("Could not save image file", e);
        }
    }
    @Transactional(readOnly = true)
    public List<String> getMyAvatars(User user) {
        try {
            Path uploadPath = Paths.get("./uploads/avatars");
            if (!Files.exists(uploadPath)) return Collections.emptyList();

            String prefix = "u_" + user.getId() + "_";
            try (Stream<Path> stream = Files.list(uploadPath)) {
                return stream
                        .filter(file -> !Files.isDirectory(file))
                        .map(Path::getFileName)
                        .map(Path::toString)
                        .filter(name -> {
                            // Either it's the user's prefixed file, OR it's a legacy file (no u_ prefix)
                            return name.startsWith(prefix) || !name.startsWith("u_");
                        })
                        .map(name -> "/uploads/avatars/" + name)
                        .collect(Collectors.toList());
            }
        } catch (IOException e) {
            return Collections.emptyList();
        }
    }
}
