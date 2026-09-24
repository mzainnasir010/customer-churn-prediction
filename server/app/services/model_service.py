import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from fastapi import HTTPException

from app.core import config
from app.schemas.customer import CustomerInput
from app.schemas.prediction import Driver, PredictionResult

ADDON_COLS = ["OnlineSecurity", "OnlineBackup", "DeviceProtection",
              "TechSupport", "StreamingTV", "StreamingMovies"]
SERVICE_COLS = ["MultipleLines"] + ADDON_COLS
CATEGORICAL = ["gender", "Partner", "Dependents", "PhoneService", "MultipleLines",
               "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
               "TechSupport", "StreamingTV", "StreamingMovies", "Contract",
               "PaperlessBilling", "PaymentMethod", "tenure_group"]


def tenure_group(months: int) -> str:
    if months <= 12:
        return "0-12"
    if months <= 24:
        return "13-24"
    if months <= 48:
        return "25-48"
    return "49-72"


class ModelService:
    def __init__(self):
        self.pipeline = None
        self.threshold = 0.5
        self.model_name = "unknown"
        self.origins: list[str] = []

    @property
    def loaded(self) -> bool:
        return self.pipeline is not None

    def load(self) -> None:
        bundle = joblib.load(config.MODEL_PATH)
        self.pipeline = bundle["pipeline"]
        self.threshold = float(bundle["threshold"])
        self.model_name = bundle.get("model_name", "unknown")
        names = self.pipeline.named_steps["prep"].get_feature_names_out()
        self.origins = [self._origin(*n.split("__", 1)) for n in names]

    @staticmethod
    def _origin(kind: str, raw: str) -> str:
        """Map an encoded column (e.g. Contract_Two year) back to its original feature."""
        if kind != "cat":
            return raw
        return next(c for c in sorted(CATEGORICAL, key=len, reverse=True)
                    if raw.startswith(c + "_"))

    @staticmethod
    def _to_frame(customers: list[CustomerInput]) -> pd.DataFrame:
        """Rebuild the exact training features from raw input."""
        rows = []
        for customer in customers:
            r = customer.model_dump()
            for col in SERVICE_COLS:  # same cleaning as training
                if r[col].startswith("No "):
                    r[col] = "No"
            if r["TotalCharges"] is None:
                r["TotalCharges"] = round(r["tenure"] * r["MonthlyCharges"], 2)
            r["num_addons"] = sum(r[c] == "Yes" for c in ADDON_COLS)
            r["has_security_support"] = int(r["OnlineSecurity"] == "Yes" or r["TechSupport"] == "Yes")
            r["auto_pay"] = int("automatic" in r["PaymentMethod"])
            r["tenure_group"] = tenure_group(r["tenure"])
            rows.append(r)
        return pd.DataFrame(rows)

    def _tier(self, p: float) -> str:
        if p >= config.HIGH_RISK_THRESHOLD:
            return "High"
        if p >= self.threshold:
            return "Medium"
        return "Low"

    def _contributions(self, X: pd.DataFrame):
        """Per-feature SHAP-style contributions from XGBoost, grouped by original feature."""
        model = self.pipeline.named_steps["model"]
        if not hasattr(model, "get_booster"):
            return None
        Xt = np.asarray(self.pipeline.named_steps["prep"].transform(X), dtype=float)
        raw = model.get_booster().predict(xgb.DMatrix(Xt), pred_contribs=True)[:, :-1]
        return pd.DataFrame(raw, columns=self.origins).T.groupby(level=0).sum().T

    @staticmethod
    def _top_drivers(contrib: pd.Series, row: pd.Series) -> list[Driver]:
        top = contrib[contrib.abs().nlargest(config.TOP_DRIVERS).index]
        return [
            Driver(feature=f, value=str(row[f]), contribution=round(float(c), 4),
                   direction="increases risk" if c > 0 else "decreases risk")
            for f, c in top.items()
        ]

    def predict(self, customers: list[CustomerInput], explain: bool = True) -> list[PredictionResult]:
        X = self._to_frame(customers)
        proba = self.pipeline.predict_proba(X)[:, 1]
        contribs = self._contributions(X) if explain else None
        return [
            PredictionResult(
                churn_probability=round(float(p), 4),
                at_risk=bool(p >= self.threshold),
                risk_tier=self._tier(p),
                threshold=round(self.threshold, 4),
                top_drivers=self._top_drivers(contribs.iloc[i], X.iloc[i]) if contribs is not None else [],
            )
            for i, p in enumerate(proba)
        ]

    def info(self) -> dict:
        metrics = None
        if config.METRICS_PATH.exists():
            metrics = pd.read_csv(config.METRICS_PATH, index_col=0).to_dict(orient="index")
        return {
            "model": self.model_name,
            "decision_threshold": round(self.threshold, 4),
            "input_features": len(set(self.origins)),
            "risk_tiers": {
                "Low": f"probability < {self.threshold:.2f}",
                "Medium": f"{self.threshold:.2f} <= probability < {config.HIGH_RISK_THRESHOLD:.2f}",
                "High": f"probability >= {config.HIGH_RISK_THRESHOLD:.2f}",
            },
            "test_set_evaluation": metrics,
        }


model_service = ModelService()


def get_model_service() -> ModelService:
    if not model_service.loaded:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    return model_service