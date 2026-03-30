package com.acme.financial.repository;

import com.acme.financial.entity.Loan;
import com.acme.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUser_Id(Long userId);

    @Modifying
    @Transactional
    void deleteAllByUser(User user);
}
