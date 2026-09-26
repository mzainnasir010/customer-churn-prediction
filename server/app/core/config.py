import os
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parents[2]  # server/
ROOT_DIR = SERVER_DIR.parent                      # churn-prediction/

def _resolve(server_rel: str, notebook_rel: str) -> Path:
    server_path = SERVER_DIR / server_rel
    if server_path.exists():
        return server_path
    return ROOT_DIR / notebook_rel

MODEL_PATH = Path(os.getenv("MODEL_PATH", _resolve("models/churn_model.joblib", "notebook/models/churn_model.joblib")))
METRICS_PATH = Path(os.getenv("METRICS_PATH", _resolve("models/final_test_results.csv", "notebook/reports/final_test_results.csv")))

APP_TITLE = "Customer Churn Prediction API"
APP_VERSION = "1.0.0"
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:4173,http://127.0.0.1:5173"
).split(",")

HIGH_RISK_THRESHOLD = 0.50  # High tier: churn is more likely than not
MAX_BATCH_SIZE = 500
TOP_DRIVERS = 5