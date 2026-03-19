package com.acme.financial.repository;

import com.acme.financial.entity.Account;
import com.acme.financial.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT t FROM Transaction t WHERE (t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId) ORDER BY t.createdAt DESC")
    Page<Transaction> findAllByAccount(@org.springframework.data.repository.query.Param("accountId") Long accountId, Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM Transaction t WHERE t.senderAccount = :account OR t.receiverAccount = :account")
    void deleteAllByAccount(@org.springframework.data.repository.query.Param("account") Account account);
}
