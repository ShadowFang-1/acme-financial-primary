package com.acme.financial.exception;

import com.acme.financial.dto.ErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        String msg = "Bad credentials".equalsIgnoreCase(ex.getMessage()) 
                ? "Invalid username or password. Please try again." 
                : ex.getMessage();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse(msg, "AUTH_FAILED"));
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabled(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse("Your account has been disabled. Please contact support.", "ACCOUNT_DISABLED"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        String msg = ex.getMessage() != null && ex.getMessage().contains("email")
                ? "An account with this email already exists."
                : "Database integrity violation occurred.";
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse(msg, "DATA_CONFLICT"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(ex.getMessage(), "INVALID_REQUEST"));
    }

    @ExceptionHandler(RuntimeException.class)
    @Transactional
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ex.printStackTrace(); // Core System Logs
        String message = ex.getMessage() != null ? ex.getMessage() : "Institutional Execution Fault";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("System Fault: " + message, "RUNTIME_FAILURE"));
    }

    @ExceptionHandler(Exception.class)
    @Transactional
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        ex.printStackTrace(); 
        String detail = "Institutional Integrity Fault: " + (ex.getMessage() != null ? ex.getMessage() : "Unknown Handshake Failure");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse(detail, "SYSTEM_FAILURE"));
    }
}
