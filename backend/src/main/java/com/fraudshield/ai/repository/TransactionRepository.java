package com.fraudshield.ai.repository;

import com.fraudshield.ai.entity.TransactionRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionRecord, Long> {
    Optional<TransactionRecord> findByTransactionId(String transactionId);

    @Query("SELECT t FROM TransactionRecord t WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(t.transactionId) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.nameOrig) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.nameDest) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:type IS NULL OR :type = 'ALL' OR t.type = :type) AND " +
           "(:riskCategory IS NULL OR :riskCategory = 'ALL' OR t.riskCategory = :riskCategory) AND " +
           "(:isFraud IS NULL OR t.isFraud = :isFraud)")
    Page<TransactionRecord> filterTransactions(
            @Param("query") String query,
            @Param("type") String type,
            @Param("riskCategory") String riskCategory,
            @Param("isFraud") Boolean isFraud,
            Pageable pageable);

    long countByIsFraudTrue();
    long countByIsFraudFalse();
    long countByRiskCategory(String riskCategory);

    @Query("SELECT SUM(t.amount) FROM TransactionRecord t")
    Double sumTotalAmount();

    @Query("SELECT SUM(t.amount) FROM TransactionRecord t WHERE t.isFraud = true")
    Double sumFraudAmount();

    @Query("SELECT t.type, COUNT(t), SUM(CASE WHEN t.isFraud = true THEN 1 ELSE 0 END), SUM(t.amount) FROM TransactionRecord t GROUP BY t.type")
    List<Object[]> getTypeDistributions();

    @Query("SELECT t.riskCategory, COUNT(t) FROM TransactionRecord t GROUP BY t.riskCategory")
    List<Object[]> getRiskCategoryDistributions();

    List<TransactionRecord> findByNameOrigOrderByCreatedAtDesc(String nameOrig);
    List<TransactionRecord> findByNameDestOrderByCreatedAtDesc(String nameDest);
    
    List<TransactionRecord> findTop10ByOrderByCreatedAtDesc();
    List<TransactionRecord> findTop10ByIsFraudTrueOrderByCreatedAtDesc();
}
