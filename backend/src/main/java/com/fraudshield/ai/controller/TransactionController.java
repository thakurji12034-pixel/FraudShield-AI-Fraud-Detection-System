package com.fraudshield.ai.controller;

import com.fraudshield.ai.dto.TransactionScoreRequest;
import com.fraudshield.ai.dto.TransactionScoreResponse;
import com.fraudshield.ai.entity.TransactionRecord;
import com.fraudshield.ai.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<Page<TransactionRecord>> getTransactions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String riskCategory,
            @RequestParam(required = false) Boolean isFraud,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(transactionService.getTransactions(query, type, riskCategory, isFraud, pageable));
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getTransactionById(@PathVariable String transactionId) {
        return transactionService.getTransactionById(transactionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/predict")
    public ResponseEntity<TransactionScoreResponse> predictAndProcess(
            @RequestBody TransactionScoreRequest request,
            Principal principal) {
        String user = principal != null ? principal.getName() : "ANALYST";
        return ResponseEntity.ok(transactionService.processTransaction(request, user));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportCsv(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "500") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String csvData = transactionService.exportTransactionsCsv(pageable);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fraudshield_transactions.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
