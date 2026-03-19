package com.acme.financial.dto;

public class UserUpdateRequest {
    private String username;
    private String phoneNumber;
    private String country;
    private String imageUrl;
    private boolean pushNotifications;
    private boolean emailAlerts;
    private boolean loginNotifications;
    private String dateOfBirth;
    private String email;

    public UserUpdateRequest() {}

    public UserUpdateRequest(String username, String email, String phoneNumber, String country, String dateOfBirth, String imageUrl, boolean pushNotifications, boolean emailAlerts, boolean loginNotifications) {
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.country = country;
        this.dateOfBirth = dateOfBirth;
        this.imageUrl = imageUrl;
        this.pushNotifications = pushNotifications;
        this.emailAlerts = emailAlerts;
        this.loginNotifications = loginNotifications;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
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
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}
