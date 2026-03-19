package com.acme.financial.controller;

import com.acme.financial.dto.ChangePasswordRequest;
import com.acme.financial.dto.UserUpdateRequest;
import com.acme.financial.entity.User;
import com.acme.financial.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getUserInfo(user));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMe(
            @AuthenticationPrincipal User user,
            @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(service.updateProfile(user, request));
    }

    @PostMapping("/deactivate")
    public ResponseEntity<Void> deactivate(@AuthenticationPrincipal User user) {
        service.deactivate(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequest request
    ) {
        service.changePassword(user, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = service.saveAvatar(user, file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @GetMapping("/my-avatars")
    public ResponseEntity<List<String>> getMyAvatars(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getMyAvatars(user));
    }
}
