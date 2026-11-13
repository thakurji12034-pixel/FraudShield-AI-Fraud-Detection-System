package com.fraudshield.ai.controller;

import com.fraudshield.ai.entity.CustomerProfile;
import com.fraudshield.ai.entity.TransactionRecord;
import com.fraudshield.ai.repository.CustomerRepository;
import com.fraudshield.ai.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public CustomerController(CustomerRepository customerRepository, TransactionRepository transactionRepository) {
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    public ResponseEntity<Page<CustomerProfile>> getCustomers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String customerType,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("lastActivity").descending());
        return ResponseEntity.ok(customerRepository.filterCustomers(query, customerType, riskLevel, pageable));
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<?> getCustomerAnalytics(@PathVariable String accountId) {
        return customerRepository.findByAccountId(accountId)
                .map(cust -> {
                    List<TransactionRecord> origHistory = transactionRepository.findByNameOrigOrderByCreatedAtDesc(accountId);
                    List<TransactionRecord> destHistory = transactionRepository.findByNameDestOrderByCreatedAtDesc(accountId);

                    Map<String, Object> details = new HashMap<>();
                    details.put("profile", cust);
                    details.put("outgoingTransactions", origHistory);
                    details.put("incomingTransactions", destHistory);
                    return ResponseEntity.ok(details);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
