from fastapi import APIRouter, Depends

from app.schemas.customer import CustomerInput
from app.schemas.prediction import BatchRequest, BatchResponse, PredictionResult
from app.services.model_service import ModelService, get_model_service

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictionResult)
def predict_one(customer: CustomerInput, svc: ModelService = Depends(get_model_service)):
    return svc.predict([customer])[0]


@router.post("/batch", response_model=BatchResponse)
def predict_batch(payload: BatchRequest, svc: ModelService = Depends(get_model_service)):
    results = svc.predict(payload.customers, explain=False)
    return BatchResponse(count=len(results), flagged=sum(r.at_risk for r in results), results=results)