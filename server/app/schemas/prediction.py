from typing import Literal

from pydantic import BaseModel, Field

from app.core import config
from app.schemas.customer import CustomerInput


class Driver(BaseModel):
    feature: str
    value: str
    contribution: float = Field(description="Log-odds impact on churn risk")
    direction: Literal["increases risk", "decreases risk"]


class PredictionResult(BaseModel):
    churn_probability: float
    at_risk: bool = Field(description="True when probability >= the tuned threshold")
    risk_tier: Literal["Low", "Medium", "High"]
    threshold: float
    top_drivers: list[Driver] = []


class BatchRequest(BaseModel):
    customers: list[CustomerInput] = Field(min_length=1, max_length=config.MAX_BATCH_SIZE)


class BatchResponse(BaseModel):
    count: int
    flagged: int
    results: list[PredictionResult]