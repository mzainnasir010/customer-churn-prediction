import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]  # churn-prediction/
MODEL_PATH = Path(os.getenv("MODEL_PATH", ROOT_DIR / "notebook" / "models" / "churn_model.joblib"))
METRICS_PATH = ROOT_DIR / "notebook" / "reports" / "final_test_results.csv"

APP_TITLE = "Customer Churn Prediction API"
APP_VERSION = "1.0.0"
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173"
).split(",")

HIGH_RISK_THRESHOLD = 0.50  # High tier: churn is more likely than not
MAX_BATCH_SIZE = 500
TOP_DRIVERS = 5