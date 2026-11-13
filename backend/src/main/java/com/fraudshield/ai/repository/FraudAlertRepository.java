package com.fraudshield.ai.repository;

import com.fraudshield.ai.entity.FraudAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    Optional<FraudAlert> findByAlertId(String alertId);
    Optional<FraudAlert> findByTransactionId(String transactionId);

    @Query("SELECT a FROM FraudAlert a WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(a.alertId) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.transactionId) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR :status = 'ALL' OR a.status = :status) AND " +
           "(:severity IS NULL OR :severity = 'ALL' OR a.severity = :severity)")
    Page<FraudAlert> filterAlerts(
            @Param("query") String query,
            @Param("status") String status,
            @Param("severity") String severity,
            Pageable pageable);

    long countByStatus(String status);
    long countBySeverity(String severity);

    @Query("SELECT a.severity, COUNT(a) FROM FraudAlert a GROUP BY a.severity")
    List<Object[]> getSeverityCounts();

    @Query("SELECT a.status, COUNT(a) FROM FraudAlert a GROUP BY a.status")
    List<Object[]> getStatusCounts();

    List<FraudAlert> findTop10ByOrderByCreatedAtDesc();
}
