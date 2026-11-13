package com.fraudshield.ai.service;

import com.fraudshield.ai.entity.*;
import com.fraudshield.ai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DataIngestionService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataIngestionService.class);

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${fraudshield.dataset.path:d:/Fraud - Detection - System/PS_20174392719_1491204439457_log.csv}")
    private String datasetPath;

    public DataIngestionService(UserRepository userRepository,
                                TransactionRepository transactionRepository,
                                FraudAlertRepository fraudAlertRepository,
                                CustomerRepository customerRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedTransactionsFromPaySim();
    }

    private void seedUsers() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            log.info("Seeding admin account...");
            User admin = new User(
                    "admin",
                    passwordEncoder.encode("Admin@123"),
                    "System Administrator",
                    "admin@fraudshield.ai",
                    "ROLE_ADMIN"
            );
            userRepository.save(admin);
            log.info("Created demo user: admin / Admin@123");
        }

        if (userRepository.findByUsername("analyst").isEmpty()) {
            log.info("Seeding analyst account...");
            User analyst = new User(
                    "analyst",
                    passwordEncoder.encode("Analyst@123"),
                    "Financial Security Analyst",
                    "analyst@fraudshield.ai",
                    "ROLE_ANALYST"
            );
            userRepository.save(analyst);
            log.info("Created demo user: analyst / Analyst@123");
        }
    }

    private void seedTransactionsFromPaySim() {
        if (transactionRepository.count() > 0) {
            log.info("Database already contains {} transactions. Skipping PaySim seeding.", transactionRepository.count());
            return;
        }

        File file = new File(datasetPath);
        if (!file.exists()) {
            File rel1 = new File("../PS_20174392719_1491204439457_log.csv");
            File rel2 = new File("PS_20174392719_1491204439457_log.csv");
            if (rel1.exists()) {
                file = rel1;
            } else if (rel2.exists()) {
                file = rel2;
            }
        }
        if (!file.exists()) {
            log.warn("PaySim dataset file not found at: {}. Using default starter records.", datasetPath);
            createFallbackRecords();
            return;
        }

        log.info("Seeding sample transactions directly from uploaded PaySim CSV ({}) into database...", datasetPath);
        int fraudCount = 0;
        int genuineCount = 0;
        int maxFrauds = 35;
        int maxGenuine = 85;

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String headerLine = br.readLine(); // step,type,amount,nameOrig,oldbalanceOrg,newbalanceOrig,nameDest,oldbalanceDest,newbalanceDest,isFraud,isFlaggedFraud
            String line;
            while ((line = br.readLine()) != null && (fraudCount < maxFrauds || genuineCount < maxGenuine)) {
                String[] parts = line.split(",");
                if (parts.length < 10) continue;

                int step = Integer.parseInt(parts[0].trim());
                String type = parts[1].trim();
                double amount = Double.parseDouble(parts[2].trim());
                String nameOrig = parts[3].trim();
                double oldbalanceOrg = Double.parseDouble(parts[4].trim());
                double newbalanceOrig = Double.parseDouble(parts[5].trim());
                String nameDest = parts[6].trim();
                double oldbalanceDest = Double.parseDouble(parts[7].trim());
                double newbalanceDest = Double.parseDouble(parts[8].trim());
                int isFraud = Integer.parseInt(parts[9].trim());

                if (isFraud == 1 && fraudCount < maxFrauds) {
                    insertSeededTransaction(step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig, nameDest, oldbalanceDest, newbalanceDest, true);
                    fraudCount++;
                } else if (isFraud == 0 && genuineCount < maxGenuine) {
                    insertSeededTransaction(step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig, nameDest, oldbalanceDest, newbalanceDest, false);
                    genuineCount++;
                }
            }
            log.info("Successfully seeded {} genuine and {} fraudulent records from PaySim CSV into database.", genuineCount, fraudCount);
        } catch (Exception ex) {
            log.error("Error seeding from PaySim CSV: {}", ex.getMessage());
            createFallbackRecords();
        }
    }

    private void insertSeededTransaction(int step, String type, double amount, String nameOrig, double oldbalanceOrg, double newbalanceOrig,
                                        String nameDest, double oldbalanceDest, double newbalanceDest, boolean isFraud) {
        TransactionRecord record = new TransactionRecord();
        record.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        record.setStep(step);
        record.setType(type);
        record.setAmount(amount);
        record.setNameOrig(nameOrig);
        record.setOldbalanceOrg(oldbalanceOrg);
        record.setNewbalanceOrig(newbalanceOrig);
        record.setNameDest(nameDest);
        record.setOldbalanceDest(oldbalanceDest);
        record.setNewbalanceDest(newbalanceDest);
        record.setIsFraud(isFraud);

        int riskScore = isFraud ? 82 + (int) (Math.random() * 18) : (int) (Math.random() * 22);
        record.setRiskScore(riskScore);
        record.setFraudProbability(isFraud ? 0.95 : 0.02);
        record.setRiskCategory(riskScore >= 75 ? "CRITICAL RISK" : riskScore >= 50 ? "HIGH RISK" : riskScore >= 30 ? "MEDIUM RISK" : "LOW RISK");
        record.setRuleTriggered(isFraud);
        record.setModelUsed("Random Forest");
        record.setExplanation(isFraud
                ? "Flagged as " + record.getRiskCategory() + " due to high-value capital outflow with origin account drain."
                : "Classified as " + record.getRiskCategory() + ". Transaction conforms to expected baseline behavior.");
        record.setCreatedAt(LocalDateTime.now().minusHours((long) (Math.random() * 72)));

        TransactionRecord saved = transactionRepository.save(record);

        // Create alert if fraud
        if (isFraud) {
            FraudAlert alert = new FraudAlert();
            alert.setAlertId("ALT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            alert.setTransactionId(saved.getTransactionId());
            alert.setSeverity(riskScore >= 75 ? "CRITICAL" : "HIGH");
            alert.setRiskScore(riskScore);
            alert.setStatus(Math.random() > 0.4 ? "INVESTIGATING" : "PENDING");
            alert.setReason("High-value " + type + " transaction of $" + String.format("%,.2f", amount) + " with account liquidation.");
            alert.setAssignedTo(alert.getStatus().equals("INVESTIGATING") ? "analyst" : null);
            alert.setCreatedAt(saved.getCreatedAt());
            alert.setUpdatedAt(LocalDateTime.now());
            fraudAlertRepository.save(alert);
        }

        // Create customer profile if not exists
        if (!customerRepository.findByAccountId(nameOrig).isPresent()) {
            CustomerProfile cp = new CustomerProfile(nameOrig, nameOrig.startsWith("M") ? "MERCHANT" : "INDIVIDUAL");
            cp.setTotalTransactions(1 + (int) (Math.random() * 5));
            cp.setTotalVolume(amount * cp.getTotalTransactions());
            cp.setAverageAmount(amount);
            cp.setFraudCount(isFraud ? 1 : 0);
            cp.setRiskScore(riskScore);
            cp.setRiskLevel(record.getRiskCategory().replace(" RISK", ""));
            cp.setLastActivity(saved.getCreatedAt());
            customerRepository.save(cp);
        }
    }

    private void createFallbackRecords() {
        log.info("Creating starter fallback records...");
        insertSeededTransaction(1, "PAYMENT", 9839.64, "C1231006815", 170136.0, 160296.36, "M1979787155", 0.0, 0.0, false);
        insertSeededTransaction(1, "TRANSFER", 181.0, "C1305486145", 181.0, 0.0, "C553264065", 0.0, 0.0, true);
        insertSeededTransaction(1, "CASH_OUT", 181.0, "C840083671", 181.0, 0.0, "C38997010", 21182.0, 0.0, true);
        insertSeededTransaction(2, "PAYMENT", 1864.28, "C1666544295", 21249.0, 19384.72, "M2044282225", 0.0, 0.0, false);
    }
}
