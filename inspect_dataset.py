import os
import sys
import json
import pandas as pd
import numpy as np

csv_path = os.environ.get("DATASET_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "PS_20174392719_1491204439457_log.csv"))
if not os.path.exists(csv_path):
    csv_path = r"d:\Fraud - Detection - System\PS_20174392719_1491204439457_log.csv"

print(f"File exists: {os.path.exists(csv_path)}")
file_size_bytes = os.path.getsize(csv_path)
print(f"File size: {file_size_bytes} bytes ({file_size_bytes / (1024*1024):.2f} MB)")

# Read first 5 rows to get header and sample
df_sample = pd.read_csv(csv_path, nrows=10)
print("\n--- Columns and Types (first 10 rows) ---")
print(df_sample.dtypes)
print("\n--- Sample Record ---")
print(df_sample.head(2).to_dict(orient='records'))

# Now chunk process to compute exact statistics across the full dataset
total_rows = 0
genuine_count = 0
fraud_count = 0
flagged_fraud_count = 0
missing_counts = {col: 0 for col in df_sample.columns}
type_counts = {}
fraud_by_type = {}
genuine_by_type = {}

amount_sum = 0.0
amount_sq_sum = 0.0
amount_min = float('inf')
amount_max = float('-inf')

fraud_amount_sum = 0.0
fraud_amount_min = float('inf')
fraud_amount_max = float('-inf')

chunk_size = 500_000
print(f"\nProcessing full dataset in chunks of {chunk_size}...")

for chunk_idx, chunk in enumerate(pd.read_csv(csv_path, chunksize=chunk_size)):
    nrows = len(chunk)
    total_rows += nrows
    
    # Missing values
    for col in chunk.columns:
        missing_counts[col] += int(chunk[col].isnull().sum())
    
    # Target counts
    f_mask = chunk['isFraud'] == 1
    chunk_fraud = int(f_mask.sum())
    chunk_genuine = nrows - chunk_fraud
    fraud_count += chunk_fraud
    genuine_count += chunk_genuine
    
    if 'isFlaggedFraud' in chunk.columns:
        flagged_fraud_count += int((chunk['isFlaggedFraud'] == 1).sum())
        
    # Transaction type
    type_vc = chunk['type'].value_counts()
    for t, c in type_vc.items():
        type_counts[t] = type_counts.get(t, 0) + int(c)
        
    fraud_type_vc = chunk[f_mask]['type'].value_counts()
    for t, c in fraud_type_vc.items():
        fraud_by_type[t] = fraud_by_type.get(t, 0) + int(c)
        
    # Amount statistics
    amounts = chunk['amount']
    amount_sum += float(amounts.sum())
    amount_min = min(amount_min, float(amounts.min()))
    amount_max = max(amount_max, float(amounts.max()))
    
    fraud_amounts = chunk[f_mask]['amount']
    if len(fraud_amounts) > 0:
        fraud_amount_sum += float(fraud_amounts.sum())
        fraud_amount_min = min(fraud_amount_min, float(fraud_amounts.min()))
        fraud_amount_max = max(fraud_amount_max, float(fraud_amounts.max()))
        
    print(f"Processed chunk {chunk_idx + 1} ({total_rows:,} rows so far)...")

mean_amount = amount_sum / total_rows if total_rows > 0 else 0
mean_fraud_amount = fraud_amount_sum / fraud_count if fraud_count > 0 else 0
fraud_percentage = (fraud_count / total_rows * 100) if total_rows > 0 else 0

profile = {
    "filename": "PS_20174392719_1491204439457_log.csv",
    "filepath": csv_path,
    "file_size_bytes": file_size_bytes,
    "file_size_mb": round(file_size_bytes / (1024 * 1024), 2),
    "total_records": total_rows,
    "genuine_transactions": genuine_count,
    "fraudulent_transactions": fraud_count,
    "fraud_percentage": round(fraud_percentage, 4),
    "isFlaggedFraud_count": flagged_fraud_count,
    "missing_values": missing_counts,
    "transaction_type_distribution": type_counts,
    "fraud_by_type": fraud_by_type,
    "amount_statistics": {
        "min": amount_min,
        "max": amount_max,
        "mean": round(mean_amount, 2),
        "total_volume": round(amount_sum, 2)
    },
    "fraud_amount_statistics": {
        "min": fraud_amount_min,
        "max": fraud_amount_max,
        "mean": round(mean_fraud_amount, 2),
        "total_fraud_volume": round(fraud_amount_sum, 2)
    },
    "columns": list(df_sample.columns),
    "dtypes": {k: str(v) for k, v in df_sample.dtypes.items()}
}

output_path = r"d:\Fraud - Detection - System\dataset_profile.json"
with open(output_path, "w") as f:
    json.dump(profile, f, indent=2)

print("\n--- DATASET PROFILE SUMMARY ---")
print(json.dumps(profile, indent=2))
