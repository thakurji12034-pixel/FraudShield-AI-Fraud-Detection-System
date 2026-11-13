package com.fraudshield.ai.service;

import com.fraudshield.ai.dto.TransactionScoreRequest;
import com.fraudshield.ai.dto.TransactionScoreResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

@Service
public class MlServiceIntegration {

    private static final Logger log = LoggerFactory.getLogger(MlServiceIntegration.class);

    private final RestTemplate restTemplate;

    @Value("${fraudshield.ml-service.url:http://127.0.0.1:8000}")
    private String mlServiceUrl;

    public MlServiceIntegration(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(6))
                .build();
    }

    public TransactionScoreResponse predict(TransactionScoreRequest request) {
        String url = mlServiceUrl + "/predict";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<TransactionScoreRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<TransactionScoreResponse> response = restTemplate.postForEntity(url, entity, TransactionScoreResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception ex) {
            log.warn("FastAPI ML service call failed ({}), activating internal fallback scoring: {}", url, ex.getMessage());
        }

        return fallbackScoring(request);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getModelsComparison() {
        String url = mlServiceUrl + "/models";
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception ex) {
            log.warn("Failed to fetch models from ML service: {}", ex.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("active_model", "Random Forest");
            fallback.put("available_algorithms", List.of("XGBoost", "Random Forest", "Decision Tree", "Logistic Regression", "Isolation Forest"));
            fallback.put("models", Collections.emptyMap());
            return fallback;
        }
    }

    public boolean selectActiveModel(String modelName) {
        try {
            String encodedModel = java.net.URLEncoder.encode(modelName, java.nio.charset.StandardCharsets.UTF_8);
            String url = mlServiceUrl + "/models/select?model_name=" + encodedModel;
            ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception ex) {
            log.warn("Failed to select active model in ML service: {}", ex.getMessage());
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getDatasetProfile() {
        String url = mlServiceUrl + "/dataset/profile";
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception ex) {
            log.warn("Failed to fetch dataset profile: {}", ex.getMessage());
            return Collections.emptyMap();
        }
    }

    private TransactionScoreResponse fallbackScoring(TransactionScoreRequest req) {
        TransactionScoreResponse resp = new TransactionScoreResponse();
        resp.setTransactionId(req.getTransactionId());

        boolean isHighRiskType = "TRANSFER".equalsIgnoreCase(req.getType()) || "CASH_OUT".equalsIgnoreCase(req.getType());
        boolean isLargeAmount = req.getAmount() != null && req.getAmount() > 200000.0;
        boolean isBalanceDrain = req.getOldbalanceOrg() != null && req.getAmount() != null &&
                Math.abs(req.getOldbalanceOrg() - req.getAmount()) < 0.01;

        List<String> indicators = new ArrayList<>();
        int score = 5;

        if (isHighRiskType) {
            score += 25;
            if (isLargeAmount) {
                score += 35;
                indicators.add("High-value transaction above $200,000 threshold (" + req.getType() + ")");
            }
            if (isBalanceDrain && req.getOldbalanceOrg() > 0) {
                score += 30;
                indicators.add("Exact total balance drain: origin balance completely wiped");
            }
        }

        resp.setRiskScore(Math.min(100, score));
        resp.setFraudProbability(score / 100.0);
        resp.setRuleTriggered(!indicators.isEmpty());
        resp.setSuspiciousIndicators(indicators);
        resp.setActiveModel("Random Forest (Hybrid Fallback)");
        resp.setModelVersion("v1.0.0-prod");
        resp.setPredictionTimestamp(java.time.LocalDateTime.now().toString());

        if (score >= 75) {
            resp.setRiskCategory("CRITICAL RISK");
            resp.setIsFraudPredicted(true);
            resp.setExplanationText("Transaction flagged as CRITICAL RISK due to suspicious balance drain and large capital movement.");
        } else if (score >= 50) {
            resp.setRiskCategory("HIGH RISK");
            resp.setIsFraudPredicted(true);
            resp.setExplanationText("Transaction flagged as HIGH RISK due to elevated transaction value.");
        } else if (score >= 30) {
            resp.setRiskCategory("MEDIUM RISK");
            resp.setIsFraudPredicted(false);
            resp.setExplanationText("Transaction flagged as MEDIUM RISK. Moderate alert thresholds met.");
        } else {
            resp.setRiskCategory("LOW RISK");
            resp.setIsFraudPredicted(false);
            resp.setExplanationText("Transaction categorized as LOW RISK. Within normal baseline behavior.");
        }

        return resp;
    }
}
