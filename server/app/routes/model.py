from fastapi import APIRouter, Depends

from app.schemas.customer import field_options
from app.services.model_service import ModelService, get_model_service

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/info")
def model_info(svc: ModelService = Depends(get_model_service)):
    return svc.info()


@router.get("/options")
def model_options():
    return field_options()