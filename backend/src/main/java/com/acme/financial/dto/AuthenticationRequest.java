package com.acme.financial.dto;



public class AuthenticationRequest {
    private String identifier;
    private String password;

    public AuthenticationRequest() {}

    public AuthenticationRequest(String identifier, String password) {
        this.identifier = identifier;
        this.password = password;
    }

    public static AuthenticationRequestBuilder builder() {
        return new AuthenticationRequestBuilder();
    }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public static class AuthenticationRequestBuilder {
        private String identifier;
        private String password;

        public AuthenticationRequestBuilder identifier(String identifier) { this.identifier = identifier; return this; }
        public AuthenticationRequestBuilder password(String password) { this.password = password; return this; }

        public AuthenticationRequest build() {
            return new AuthenticationRequest(identifier, password);
        }
    }
}
