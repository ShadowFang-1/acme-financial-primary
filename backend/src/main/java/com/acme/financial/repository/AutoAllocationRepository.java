package com.acme.financial.repository;

import com.acme.financial.entity.AutoAllocation;
import com.acme.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AutoAllocationRepository extends JpaRepository<AutoAllocation, Long> {
    List<AutoAllocation> findAllByUserOrderByCreatedAtDesc(User user);
    List<AutoAllocation> findAllByActiveTrueAndNextExecutionDateBefore(LocalDateTime now);
}
