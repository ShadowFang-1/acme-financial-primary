package com.acme.financial.dto;

import com.acme.financial.entity.Role;
import com.fasterxml.jackson.annotation.JsonProperty;


public class AuthenticationResponse {
    private String token;
    private String username;
    private String email;
    private Role role;
    private String imageUrl;
    private boolean pushNotifications;
    private boolean emailAlerts;
    private boolean loginNotifications;
    @JsonProperty("requiresOtp")
    private boolean requiresOtp;
    @JsonProperty("identifier")
    private String identifier;

    public AuthenticationResponse() {}

    public AuthenticationResponse(String token, String username, String email, Role role, String imageUrl, boolean pushNotifications, boolean emailAlerts, boolean loginNotifications, boolean requiresOtp, String identifier) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.imageUrl = imageUrl;
        this.pushNotifications = pushNotifications;
        this.emailAlerts = emailAlerts;
        this.loginNotifications = loginNotifications;
        this.requiresOtp = requiresOtp;
        this.identifier = identifier;
    }

    public static AuthenticationResponseBuilder builder() {
        return new AuthenticationResponseBuilder();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isPushNotifications() { return pushNotifications; }
    public void setPushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; }
    public boolean isEmailAlerts() { return emailAlerts; }
    public void setEmailAlerts(boolean emailAlerts) { this.emailAlerts = emailAlerts; }
    public boolean isLoginNotifications() { return loginNotifications; }
    public void setLoginNotifications(boolean loginNotifications) { this.loginNotifications = loginNotifications; }
    public boolean isRequiresOtp() { return requiresOtp; }
    public void setRequiresOtp(boolean requiresOtp) { this.requiresOtp = requiresOtp; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public static class AuthenticationResponseBuilder {
        private String token;
        private String username;
        private String email;
        private Role role;
        private String imageUrl;
        private boolean pushNotifications;
        private boolean emailAlerts;
        private boolean loginNotifications;
        private boolean requiresOtp;
        private String identifier;

        public AuthenticationResponseBuilder token(String token) { this.token = token; return this; }
        public AuthenticationResponseBuilder username(String username) { this.username = username; return this; }
        public AuthenticationResponseBuilder email(String email) { this.email = email; return this; }
        public AuthenticationResponseBuilder role(Role role) { this.role = role; return this; }
        public AuthenticationResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public AuthenticationResponseBuilder pushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; return this; }
        public AuthenticationResponseBuilder emailAlerts(boolean emailAlerts) { this.emailAlerts = emailAlerts; return this; }
        public AuthenticationResponseBuilder loginNotifications(boolean loginNotifications) { this.loginNotifications = loginNotifications; return this; }
        public AuthenticationResponseBuilder requiresOtp(boolean requiresOtp) { this.requiresOtp = requiresOtp; return this; }
        public AuthenticationResponseBuilder identifier(String identifier) { this.identifier = identifier; return this; }

        public AuthenticationResponse build() {
            return new AuthenticationResponse(token, username, email, role, imageUrl, pushNotifications, emailAlerts, loginNotifications, requiresOtp, identifier);
        }
    }
}
