package com.acme.financial.repository;

import com.acme.financial.entity.SavingsGoal;
import com.acme.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    List<SavingsGoal> findByUser_Id(Long userId);

    @Modifying
    @Transactional
    void deleteAllByUser(User user);
}
