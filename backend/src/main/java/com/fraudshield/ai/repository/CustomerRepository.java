package com.fraudshield.ai.repository;

import com.fraudshield.ai.entity.CustomerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerProfile, Long> {
    Optional<CustomerProfile> findByAccountId(String accountId);

    @Query("SELECT c FROM CustomerProfile c WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(c.accountId) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:customerType IS NULL OR :customerType = 'ALL' OR c.customerType = :customerType) AND " +
           "(:riskLevel IS NULL OR :riskLevel = 'ALL' OR c.riskLevel = :riskLevel)")
    Page<CustomerProfile> filterCustomers(
            @Param("query") String query,
            @Param("customerType") String customerType,
            @Param("riskLevel") String riskLevel,
            Pageable pageable);
}
