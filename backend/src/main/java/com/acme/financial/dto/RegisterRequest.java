package com.acme.financial.dto;



public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String phoneNumber;
    private String country;
    private String dateOfBirth;

    public RegisterRequest() {}

    public RegisterRequest(String username, String email, String password, String phoneNumber, String country, String dateOfBirth) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.country = country;
        this.dateOfBirth = dateOfBirth;
    }

    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public static class RegisterRequestBuilder {
        private String username;
        private String email;
        private String password;
        private String phoneNumber;
        private String country;
        private String dateOfBirth;

        public RegisterRequestBuilder username(String username) { this.username = username; return this; }
        public RegisterRequestBuilder email(String email) { this.email = email; return this; }
        public RegisterRequestBuilder password(String password) { this.password = password; return this; }
        public RegisterRequestBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public RegisterRequestBuilder country(String country) { this.country = country; return this; }
        public RegisterRequestBuilder dateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }

        public RegisterRequest build() {
            return new RegisterRequest(username, email, password, phoneNumber, country, dateOfBirth);
        }
    }
}
