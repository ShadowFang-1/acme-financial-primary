package com.acme.financial.repository;

import com.acme.financial.entity.Notification;
import com.acme.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByUserOrderByCreatedAtDesc(User user);
    long countByUserAndReadFalse(User user);

    @Modifying
    @Transactional
    void deleteAllByUser(User user);
}
