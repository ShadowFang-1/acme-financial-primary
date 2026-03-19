package com.acme.financial.repository;

import com.acme.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u LEFT JOIN Account a ON a.user = u WHERE u.phoneNumber = :id OR a.accountNumber = :id OR u.email = :id OR u.username = :id")
    java.util.List<User> findByIdentifier(@Param("id") String id);
}
