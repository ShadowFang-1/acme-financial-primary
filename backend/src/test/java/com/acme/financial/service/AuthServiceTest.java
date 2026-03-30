package com.acme.financial.service;

import com.acme.financial.dto.RegisterRequest;
import com.acme.financial.entity.User;
import com.acme.financial.repository.AccountRepository;
import com.acme.financial.repository.UserRepository;
import com.acme.financial.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_Successful() {
        RegisterRequest request = RegisterRequest.builder()
                .username("testuser")
                .email("test@acme.com")
                .password("password123")
                .build();

        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");
        when(userRepository.save(any())).thenReturn(User.builder().username("testuser").build());
        when(jwtService.generateToken(any())).thenReturn("mockToken");

        var response = authService.register(request);

        assertNotNull(response);
        assertEquals("mockToken", response.getToken());
        verify(userRepository, times(1)).save(any());
        verify(accountRepository, times(1)).save(any());
    }
}
