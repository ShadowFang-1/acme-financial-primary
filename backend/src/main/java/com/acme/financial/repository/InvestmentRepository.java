package com.acme.financial.repository;

import com.acme.financial.entity.Investment;
import com.acme.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUser_Id(Long userId);

    @Modifying
    @Transactional
    void deleteAllByUser(User user);
}
