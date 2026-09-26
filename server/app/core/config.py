import os
from pathlib import Path
from dotenv import load_dotenv

SERVER_DIR = Path(__file__).resolve().parents[2]  # server/
ROOT_DIR = SERVER_DIR.parent                      # churn-prediction/

# Load local .env file if present
load_dotenv(SERVER_DIR / ".env")

def _resolve(server_rel: str, notebook_rel: str) -> Path:
    server_path = SERVER_DIR / server_rel
    if server_path.exists():
        return server_path
    return ROOT_DIR / notebook_rel

MODEL_PATH = Path(os.getenv("MODEL_PATH", _resolve("models/churn_model.joblib", "notebook/models/churn_model.joblib")))
METRICS_PATH = Path(os.getenv("METRICS_PATH", _resolve("models/final_test_results.csv", "notebook/reports/final_test_results.csv")))

APP_TITLE = "Customer Churn Prediction API"
APP_VERSION = "1.0.0"
def _parse_cors(raw: str | None) -> list[str]:
    if not raw or not raw.strip():
        return []
    origins = set()
    for item in raw.split(","):
        cleaned = item.strip().rstrip("/")
        if not cleaned:
            continue
        if cleaned == "*":
            return ["*"]
        origins.add(cleaned)
        if "localhost" in cleaned:
            origins.add(cleaned.replace("localhost", "127.0.0.1"))
        elif "127.0.0.1" in cleaned:
            origins.add(cleaned.replace("127.0.0.1", "localhost"))
    return list(origins)

CORS_ORIGINS = _parse_cors(os.getenv("CORS_ORIGINS"))

HIGH_RISK_THRESHOLD = 0.50  # High tier: churn is more likely than not
MAX_BATCH_SIZE = 500
TOP_DRIVERS = 5