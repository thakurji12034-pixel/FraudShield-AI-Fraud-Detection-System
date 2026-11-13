import os
import time
import json
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="FraudShield AI - Machine Learning Inference Engine",
    description="Real-time transaction fraud scoring, hybrid rule engine, and SHAP explainability service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
MODELS_DIR = os.environ.get("MODELS_DIR", os.path.join(BASE_DIR, "models"))
REPORTS_DIR = os.environ.get("REPORTS_DIR", os.path.join(BASE_DIR, "reports"))
PROFILE_PATH = os.environ.get("PROFILE_PATH", os.path.join(ROOT_DIR, "dataset_profile.json"))
if not os.path.exists(PROFILE_PATH):
    PROFILE_PATH = r"d:\Fraud - Detection - System\dataset_profile.json"

# In-memory model cache
loaded_models: Dict[str, Any] = {}
scaler = None
feature_names = []
active_model_name = "XGBoost"
explainer = None

def load_artifacts():
    global loaded_models, scaler, feature_names, active_model_name, explainer
    
    if os.path.exists(os.path.join(MODELS_DIR, "feature_names.json")):
        with open(os.path.join(MODELS_DIR, "feature_names.json"), "r") as f:
            feature_names = json.load(f)
            
    if os.path.exists(os.path.join(MODELS_DIR, "scaler.joblib")):
        scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))
        
    model_files = {
        "XGBoost": "xgboost.joblib",
        "Random Forest": "random_forest.joblib",
        "Decision Tree": "decision_tree.joblib",
        "Logistic Regression": "logistic_regression.joblib",
        "Isolation Forest": "isolation_forest.joblib"
    }
    
    for name, filename in model_files.items():
        filepath = os.path.join(MODELS_DIR, filename)
        if os.path.exists(filepath):
            try:
                loaded_models[name] = joblib.load(filepath)
            except Exception as e:
                print(f"Error loading {name}: {e}")
                
    if os.path.exists(os.path.join(MODELS_DIR, "best_model.json")):
        with open(os.path.join(MODELS_DIR, "best_model.json"), "r") as f:
            meta = json.load(f)
            active_model_name = meta.get("active_model", "XGBoost")
            
    if os.path.exists(os.path.join(MODELS_DIR, "shap_explainer.joblib")):
        try:
            explainer = joblib.load(os.path.join(MODELS_DIR, "shap_explainer.joblib"))
        except Exception as e:
            print(f"Error loading SHAP explainer: {e}")

# Call initially
try:
    load_artifacts()
except Exception as e:
    print(f"Initial artifact loading warning: {e}")

# Request / Response Schemas
class TransactionRequest(BaseModel):
    transactionId: str = Field(..., example="TXN-984210")
    step: int = Field(..., example=342, description="Simulation step / hour")
    type: str = Field(..., example="TRANSFER", description="TRANSFER, CASH_OUT, PAYMENT, CASH_IN, DEBIT")
    amount: float = Field(..., example=250000.0)
    nameOrig: str = Field(..., example="C102938475")
    oldbalanceOrg: float = Field(..., example=250000.0)
    nameDest: str = Field(..., example="C987654321")
    oldbalanceDest: float = Field(..., example=0.0)

class PredictionResponse(BaseModel):
    transactionId: str
    fraudProbability: float
    riskScore: int
    isFraudPredicted: bool
    riskCategory: str
    activeModel: str
    modelVersion: str
    predictionTimestamp: str
    suspiciousIndicators: List[str]
    ruleTriggered: bool
    featureContributions: List[Dict[str, Any]]
    explanationText: str

def compute_features(txn: TransactionRequest) -> pd.DataFrame:
    """Prepares raw features matching training pipeline without data leakage."""
    features = pd.DataFrame([{
        'step': float(txn.step),
        'hour_of_day': float(txn.step % 24),
        'day_of_month': float((txn.step // 24) + 1),
        'amount': float(txn.amount),
        'amount_log': float(np.log1p(max(0.0, txn.amount))),
        'oldbalanceOrg': float(txn.oldbalanceOrg),
        'oldbalanceDest': float(txn.oldbalanceDest),
        'amount_to_oldbalance_ratio': float(txn.amount / (txn.oldbalanceOrg + 1.0)),
        'diff_orig_balance': float(txn.oldbalanceOrg - txn.amount),
        'is_zero_orig_balance': float(1.0 if txn.oldbalanceOrg == 0 else 0.0),
        'is_zero_dest_balance': float(1.0 if txn.oldbalanceDest == 0 else 0.0),
        'is_exact_balance_drain': float(1.0 if abs(txn.oldbalanceOrg - txn.amount) < 0.01 else 0.0),
        'dest_is_merchant': float(1.0 if txn.nameDest.startswith('M') else 0.0),
        'type_CASH_OUT': float(1.0 if txn.type == 'CASH_OUT' else 0.0),
        'type_TRANSFER': float(1.0 if txn.type == 'TRANSFER' else 0.0),
        'type_PAYMENT': float(1.0 if txn.type == 'PAYMENT' else 0.0),
        'type_CASH_IN': float(1.0 if txn.type == 'CASH_IN' else 0.0),
        'type_DEBIT': float(1.0 if txn.type == 'DEBIT' else 0.0)
    }])
    
    # Ensure all feature columns exist in exact order
    if feature_names:
        for col in feature_names:
            if col not in features.columns:
                features[col] = 0.0
        features = features[feature_names]
        
    return features

def evaluate_hybrid_rules(txn: TransactionRequest) -> List[str]:
    """Domain-specific financial fraud rules."""
    triggers = []
    
    # Rule 1: Fraud type restriction
    if txn.type in ['TRANSFER', 'CASH_OUT']:
        if txn.amount > 200000.0:
            triggers.append(f"High-value {txn.type} transaction above $200,000 threshold (${txn.amount:,.2f})")
    
    # Rule 2: Origin account complete balance liquidation
    if txn.oldbalanceOrg > 0 and abs(txn.oldbalanceOrg - txn.amount) < 0.01:
        triggers.append("Exact total balance drain: origin account balance emptied entirely")
        
    # Rule 3: Zero initial balance transfer
    if txn.oldbalanceOrg == 0 and txn.amount > 50000.0 and txn.type in ['TRANSFER', 'CASH_OUT']:
        triggers.append("High-value transaction originating from an account with zero verified balance")
        
    # Rule 4: Suspicious destination with zero prior history
    if txn.oldbalanceDest == 0 and txn.amount > 300000.0 and txn.type == 'TRANSFER':
        triggers.append("Large transfer routed to destination account with zero prior balance history")
        
    # Rule 5: Extreme transaction amount
    if txn.amount >= 1000000.0:
        triggers.append(f"Extreme transaction velocity: single transfer exceeding $1,000,000 (${txn.amount:,.2f})")
        
    # Rule 6: Unusual off-peak hours
    hour = txn.step % 24
    if (hour >= 1 and hour <= 5) and txn.amount > 100000.0:
        triggers.append(f"High-value transaction conducted during unusual off-peak hours ({hour:02d}:00)")
        
    return triggers

@app.get("/health")
def health_check():
    if not loaded_models:
        load_artifacts()
    return {
        "status": "UP",
        "service": "FraudShield AI Machine Learning Engine",
        "active_model": active_model_name,
        "models_available": list(loaded_models.keys()),
        "features_loaded": len(feature_names),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_fraud(txn: TransactionRequest):
    if not loaded_models:
        load_artifacts()
        
    if active_model_name not in loaded_models:
        raise HTTPException(status_code=500, detail=f"Active model '{active_model_name}' not available. Please train models first.")
        
    model = loaded_models[active_model_name]
    df_features = compute_features(txn)
    
    # Rule evaluation
    suspicious_rules = evaluate_hybrid_rules(txn)
    rule_triggered = len(suspicious_rules) > 0
    
    # Model inference
    is_scaled_model = active_model_name in ['Logistic Regression', 'Isolation Forest']
    if is_scaled_model and scaler:
        input_data = scaler.transform(df_features)
    else:
        input_data = df_features
        
    if active_model_name == 'Isolation Forest':
        raw_pred = model.predict(input_data)[0]
        score = -model.decision_function(input_data)[0]
        prob = float(np.clip((score + 0.2) / 0.4, 0.0, 1.0))
    else:
        prob = float(model.predict_proba(input_data)[0, 1])
        
    # Hybrid risk calculation combining ML probability + Domain rules
    # If severe rules trigger, baseline risk increases
    rule_boost = min(0.35, len(suspicious_rules) * 0.12)
    final_risk_score = int(np.clip((prob * 0.75 + rule_boost * 0.25) * 100, 0, 100))
    
    # Determine risk category
    if final_risk_score >= 75:
        category = "CRITICAL RISK"
        is_fraud = True
    elif final_risk_score >= 50:
        category = "HIGH RISK"
        is_fraud = True
    elif final_risk_score >= 30:
        category = "MEDIUM RISK"
        is_fraud = False
    else:
        category = "LOW RISK"
        is_fraud = False
        
    # Feature contributions & Explainability
    contributions = []
    explanation_parts = []
    
    if explainer and active_model_name == 'XGBoost':
        try:
            shap_values = explainer.shap_values(df_features)
            # shap_values shape can be (1, n_features)
            sv = shap_values[0] if len(shap_values.shape) > 1 else shap_values
            top_indices = np.argsort(np.abs(sv))[::-1][:5]
            for idx in top_indices:
                feat = feature_names[idx]
                val = float(df_features.iloc[0, idx])
                impact = float(sv[idx])
                contributions.append({
                    "feature": feat,
                    "value": round(val, 2),
                    "impact": round(impact, 4),
                    "direction": "RISK_INCREASING" if impact > 0 else "RISK_DECREASING"
                })
        except Exception as e:
            print(f"SHAP explanation fallback: {e}")
            
    # Fallback/heuristic feature contributions if SHAP is unavailable
    if not contributions:
        heuristic_feats = [
            ("amount", txn.amount, 0.45 if txn.amount > 100000 else -0.1),
            ("oldbalanceOrg", txn.oldbalanceOrg, 0.35 if abs(txn.oldbalanceOrg - txn.amount) < 0.01 else -0.05),
            ("type", txn.type, 0.25 if txn.type in ['TRANSFER', 'CASH_OUT'] else -0.3),
            ("diff_orig_balance", txn.oldbalanceOrg - txn.amount, 0.2 if txn.oldbalanceOrg == txn.amount else 0.0),
            ("is_zero_dest_balance", 1.0 if txn.oldbalanceDest == 0 else 0.0, 0.15 if txn.oldbalanceDest == 0 else -0.05)
        ]
        for f, val, imp in heuristic_feats:
            contributions.append({
                "feature": f,
                "value": val if isinstance(val, (int, float)) else 1.0,
                "impact": round(imp, 4),
                "direction": "RISK_INCREASING" if imp > 0 else "RISK_DECREASING"
            })
            
    # Build human-readable explanation text
    if final_risk_score >= 50:
        reasons = []
        if txn.type in ['TRANSFER', 'CASH_OUT']:
            reasons.append(f"high-risk transaction type ({txn.type})")
        if txn.amount > 150000:
            reasons.append(f"elevated transfer amount (${txn.amount:,.2f})")
        if abs(txn.oldbalanceOrg - txn.amount) < 0.01 and txn.oldbalanceOrg > 0:
            reasons.append("complete liquidation of origin account balance")
        if txn.oldbalanceDest == 0:
            reasons.append("recipient account having no previous balance history")
        if suspicious_rules:
            reasons.append(f"{len(suspicious_rules)} hybrid heuristic rules triggered")
        explanation_parts.append(f"Transaction flagged as {category} due to: " + ", ".join(reasons) + ".")
    else:
        explanation_parts.append(f"Transaction classified as {category}. Transaction parameters are consistent with legitimate financial account behavior.")
        
    return PredictionResponse(
        transactionId=txn.transactionId,
        fraudProbability=round(prob, 4),
        riskScore=final_risk_score,
        isFraudPredicted=is_fraud,
        riskCategory=category,
        activeModel=active_model_name,
        modelVersion="v1.0.0-prod",
        predictionTimestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
        suspiciousIndicators=suspicious_rules,
        ruleTriggered=rule_triggered,
        featureContributions=contributions,
        explanationText=" ".join(explanation_parts)
    )

@app.post("/batch-predict")
def batch_predict(transactions: List[TransactionRequest]):
    return [predict_fraud(t) for t in transactions]

@app.get("/models")
def get_models_comparison():
    rep_path = os.path.join(REPORTS_DIR, "model_comparison.json")
    if os.path.exists(rep_path):
        with open(rep_path, "r") as f:
            comparison = json.load(f)
    else:
        comparison = {}
        
    return {
        "active_model": active_model_name,
        "models": comparison,
        "available_algorithms": list(loaded_models.keys()) if loaded_models else [
            "XGBoost", "Random Forest", "Decision Tree", "Logistic Regression", "Isolation Forest"
        ]
    }

@app.post("/models/select")
def select_active_model(model_name: str):
    global active_model_name
    if not loaded_models:
        load_artifacts()
    if model_name not in loaded_models:
        raise HTTPException(status_code=400, detail=f"Model '{model_name}' is not in trained models: {list(loaded_models.keys())}")
        
    active_model_name = model_name
    best_meta_path = os.path.join(MODELS_DIR, "best_model.json")
    if os.path.exists(best_meta_path):
        with open(best_meta_path, "r") as f:
            meta = json.load(f)
        meta["active_model"] = active_model_name
        with open(best_meta_path, "w") as f:
            json.dump(meta, f, indent=2)
            
    return {"status": "SUCCESS", "active_model": active_model_name}

@app.get("/dataset/profile")
def get_dataset_profile():
    if os.path.exists(PROFILE_PATH):
        with open(PROFILE_PATH, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Dataset profile report not found. Run dataset inspection first.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
