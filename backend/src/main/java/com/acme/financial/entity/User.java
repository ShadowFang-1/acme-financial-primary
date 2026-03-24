package com.acme.financial.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled = true;
    
    private String phoneNumber;
    private String country;
    private String imageUrl;
    private boolean pushNotifications = true;
    private boolean emailAlerts = true;
    private boolean loginNotifications = true;
    private String oneTimePassword;
    private java.time.LocalDateTime otpExpiry;
    private String dateOfBirth;
    private LocalDateTime createdAt;
    private String refreshToken;

    public User() {}

    public User(Long id, String username, String email, String password, Role role, boolean enabled, String phoneNumber, String country, String dateOfBirth, String imageUrl, boolean pushNotifications, boolean emailAlerts, boolean loginNotifications, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.enabled = enabled;
        this.phoneNumber = phoneNumber;
        this.country = country;
        this.dateOfBirth = dateOfBirth;
        this.imageUrl = imageUrl;
        this.pushNotifications = pushNotifications;
        this.emailAlerts = emailAlerts;
        this.loginNotifications = loginNotifications;
        this.createdAt = createdAt;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    @JsonIgnore
    @Override
    public String getUsername() { return email; }
    @JsonProperty("username")
    public String getDisplayName() { return username; }
    @JsonProperty("username")
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isPushNotifications() { return pushNotifications; }
    public void setPushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; }

    public boolean isEmailAlerts() { return emailAlerts; }
    public void setEmailAlerts(boolean emailAlerts) { this.emailAlerts = emailAlerts; }

    public boolean isLoginNotifications() { return loginNotifications; }
    public void setLoginNotifications(boolean loginNotifications) { this.loginNotifications = loginNotifications; }

    public String getOneTimePassword() { return oneTimePassword; }
    public void setOneTimePassword(String oneTimePassword) { this.oneTimePassword = oneTimePassword; }

    public java.time.LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(java.time.LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public static class UserBuilder {
        private Long id;
        private String username;
        private String email;
        private String password;
        private Role role;
        private boolean enabled = true;
        private String phoneNumber;
        private String country;
        private String dateOfBirth;
        private String imageUrl;
        private boolean pushNotifications = true;
        private boolean emailAlerts = true;
        private boolean loginNotifications = true;
        private LocalDateTime createdAt;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder enabled(boolean enabled) { this.enabled = enabled; return this; }
        public UserBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public UserBuilder country(String country) { this.country = country; return this; }
        public UserBuilder dateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public UserBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public UserBuilder pushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; return this; }
        public UserBuilder emailAlerts(boolean emailAlerts) { this.emailAlerts = emailAlerts; return this; }
        public UserBuilder loginNotifications(boolean loginNotifications) { this.loginNotifications = loginNotifications; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(id, username, email, password, role, enabled, phoneNumber, country, dateOfBirth, imageUrl, pushNotifications, emailAlerts, loginNotifications, createdAt);
        }
    }
}
