package com.acme.financial.repository;

import com.acme.financial.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUserId(Long userId);
}
