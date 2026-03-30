package com.acme.financial.repository;

import com.acme.financial.entity.AutoAllocation;
import com.acme.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

public interface AutoAllocationRepository extends JpaRepository<AutoAllocation, Long> {
    List<AutoAllocation> findAllByUserOrderByCreatedAtDesc(User user);
    List<AutoAllocation> findAllByActiveTrueAndNextExecutionDateBefore(LocalDateTime now);

    @Modifying
    @Transactional
    void deleteAllByUser(User user);
}
