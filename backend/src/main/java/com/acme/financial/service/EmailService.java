package com.acme.financial.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${mail.from}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String content) {
        System.out.println(">>> [EMAIL START] Attempting background dispatch to: " + to + " FROM: " + fromEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            System.out.println(">>> [EMAIL SUCCESS] OTP Sent to: " + to);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL ERROR] Failed to send email: " + e.getMessage());
            // Fallback for developers
            System.out.println("FALLBACK CONTENT: " + content);
        }
    }
}
