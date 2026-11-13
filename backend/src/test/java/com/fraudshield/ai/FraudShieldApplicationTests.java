package com.fraudshield.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fraudshield.ai.dto.AuthRequest;
import com.fraudshield.ai.dto.TransactionScoreRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FraudShieldApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Context Loads & Spring Boot Starts Successfully")
    void contextLoads() {
    }

    @Test
    @DisplayName("Authentication: Login with valid admin credentials succeeds with JWT")
    void testAdminLoginSuccess() throws Exception {
        AuthRequest req = new AuthRequest("admin", "Admin@123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Authentication: Login with invalid password returns 401/403")
    void testLoginFailure() throws Exception {
        AuthRequest req = new AuthRequest("admin", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Dashboard: Real-time telemetry summary endpoint returns populated metrics")
    void testDashboardTelemetry() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTransactions").isNumber())
                .andExpect(jsonPath("$.genuineTransactions").isNumber())
                .andExpect(jsonPath("$.fraudulentTransactions").isNumber())
                .andExpect(jsonPath("$.activeModel").isNotEmpty());
    }

    @Test
    @DisplayName("Prediction: High-risk liquidation transfer is intercepted and generates alert")
    void testHighRiskTransactionScoring() throws Exception {
        String testTxnId = "TXN-TEST-" + UUID.randomUUID().toString().substring(0, 8);
        TransactionScoreRequest req = new TransactionScoreRequest();
        req.setTransactionId(testTxnId);
        req.setStep(340);
        req.setType("TRANSFER");
        req.setAmount(750000.0);
        req.setNameOrig("C192837465");
        req.setOldbalanceOrg(750000.0);
        req.setNameDest("C991122334");
        req.setOldbalanceDest(0.0);

        mockMvc.perform(post("/api/transactions/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value(testTxnId))
                .andExpect(jsonPath("$.riskScore").isNumber())
                .andExpect(jsonPath("$.isFraudPredicted").value(true))
                .andExpect(jsonPath("$.alertId").isNotEmpty());
    }

    @Test
    @DisplayName("Prediction: Low-risk legitimate merchant purchase is cleared")
    void testLowRiskTransactionScoring() throws Exception {
        String testTxnId = "TXN-TEST-" + UUID.randomUUID().toString().substring(0, 8);
        TransactionScoreRequest req = new TransactionScoreRequest();
        req.setTransactionId(testTxnId);
        req.setStep(24);
        req.setType("PAYMENT");
        req.setAmount(42.50);
        req.setNameOrig("C778899001");
        req.setOldbalanceOrg(2500.0);
        req.setNameDest("M123456789");
        req.setOldbalanceDest(0.0);

        mockMvc.perform(post("/api/transactions/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value(testTxnId))
                .andExpect(jsonPath("$.riskCategory").value("LOW RISK"))
                .andExpect(jsonPath("$.isFraudPredicted").value(false));
    }
}
