package com.acme.financial.service;

import com.acme.financial.entity.Notification;
import com.acme.financial.entity.User;
import com.acme.financial.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository, EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void notify(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .build();
        notificationRepository.save(notification);
        
        // Mirror to Email for Omni-channel awareness
        try {
            emailService.sendEmail(user.getEmail(), title, message);
        } catch (Exception e) {
            System.err.println(">>> [NOTIFY] Email mirroring failed for " + user.getEmail() + ": " + e.getMessage());
        }
    }

    public List<Notification> getNotifications(User user) {
        return notificationRepository.findAllByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (n.getUser().getId().equals(user.getId())) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }
    
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findAllByUserOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
