package com.fraudshield.ai.service;

import com.fraudshield.ai.dto.DashboardSummaryDTO;
import com.fraudshield.ai.repository.FraudAlertRepository;
import com.fraudshield.ai.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final MlServiceIntegration mlServiceIntegration;

    public AnalyticsService(TransactionRepository transactionRepository,
                            FraudAlertRepository fraudAlertRepository,
                            MlServiceIntegration mlServiceIntegration) {
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
        this.mlServiceIntegration = mlServiceIntegration;
    }

    public DashboardSummaryDTO getDashboardSummary() {
        DashboardSummaryDTO dto = new DashboardSummaryDTO();

        long total = transactionRepository.count();
        long fraud = transactionRepository.countByIsFraudTrue();
        long genuine = transactionRepository.countByIsFraudFalse();
        long criticalAlerts = fraudAlertRepository.countBySeverity("CRITICAL");
        long highRisk = transactionRepository.countByRiskCategory("HIGH RISK") + transactionRepository.countByRiskCategory("CRITICAL RISK");

        Double totalAmount = transactionRepository.sumTotalAmount();
        Double fraudAmount = transactionRepository.sumFraudAmount();

        dto.setTotalTransactions(total);
        dto.setFraudulentTransactions(fraud);
        dto.setGenuineTransactions(genuine);
        dto.setFraudDetectionRate(total > 0 ? ((double) fraud / total) * 100.0 : 0.0);
        dto.setCriticalAlerts(criticalAlerts);
        dto.setHighRiskTransactions(highRisk);
        dto.setTotalTransactionAmount(totalAmount != null ? totalAmount : 0.0);
        dto.setFraudTransactionAmount(fraudAmount != null ? fraudAmount : 0.0);

        dto.setRecentTransactions(transactionRepository.findTop10ByOrderByCreatedAtDesc());
        dto.setLatestAlerts(fraudAlertRepository.findTop10ByOrderByCreatedAtDesc());

        // Type Distribution
        List<Map<String, Object>> typeDist = new ArrayList<>();
        List<Object[]> rawTypes = transactionRepository.getTypeDistributions();
        for (Object[] r : rawTypes) {
            Map<String, Object> m = new HashMap<>();
            m.put("type", r[0]);
            m.put("count", r[1]);
            m.put("fraudCount", r[2]);
            m.put("totalAmount", r[3]);
            typeDist.add(m);
        }
        dto.setTypeDistribution(typeDist);

        // Risk Distribution
        List<Map<String, Object>> riskDist = new ArrayList<>();
        List<Object[]> rawRisks = transactionRepository.getRiskCategoryDistributions();
        for (Object[] r : rawRisks) {
            Map<String, Object> m = new HashMap<>();
            m.put("category", r[0]);
            m.put("count", r[1]);
            riskDist.add(m);
        }
        dto.setRiskDistribution(riskDist);

        // ML model & Dataset profile
        Map<String, Object> modelsInfo = mlServiceIntegration.getModelsComparison();
        dto.setActiveModel((String) modelsInfo.getOrDefault("active_model", "Random Forest"));
        dto.setDatasetProfile(mlServiceIntegration.getDatasetProfile());

        return dto;
    }
}
