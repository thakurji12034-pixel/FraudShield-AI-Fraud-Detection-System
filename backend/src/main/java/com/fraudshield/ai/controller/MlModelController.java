package com.fraudshield.ai.controller;

import com.fraudshield.ai.service.AuditService;
import com.fraudshield.ai.service.MlServiceIntegration;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
public class MlModelController {

    private final MlServiceIntegration mlServiceIntegration;
    private final AuditService auditService;

    public MlModelController(MlServiceIntegration mlServiceIntegration, AuditService auditService) {
        this.mlServiceIntegration = mlServiceIntegration;
        this.auditService = auditService;
    }

    @GetMapping("/models")
    public ResponseEntity<Map<String, Object>> getModels() {
        return ResponseEntity.ok(mlServiceIntegration.getModelsComparison());
    }

    @PostMapping("/models/select")
    public ResponseEntity<?> selectModel(@RequestParam String modelName, Principal principal) {
        boolean success = mlServiceIntegration.selectActiveModel(modelName);
        if (success) {
            String user = principal != null ? principal.getName() : "ADMIN";
            auditService.logAction(
                    "CHANGE_ACTIVE_ML_MODEL",
                    user,
                    "MlModel",
                    modelName,
                    "Switched active production model to " + modelName,
                    "127.0.0.1"
            );
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "activeModel", modelName));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to switch active model"));
        }
    }

    @GetMapping("/dataset/profile")
    public ResponseEntity<Map<String, Object>> getDatasetProfile() {
        return ResponseEntity.ok(mlServiceIntegration.getDatasetProfile());
    }
}
