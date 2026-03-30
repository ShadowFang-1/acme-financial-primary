package com.acme.financial.repository;

import com.acme.financial.entity.AuditLog;
import com.acme.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUsernameOrderByTimestampDesc(String username);

    @Modifying
    @Transactional
    void deleteAllByUser(User user);
}
