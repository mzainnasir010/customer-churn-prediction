from fastapi import APIRouter

from app.services.model_service import model_service

router = APIRouter(tags=["Health"])


@router.get("/health")
def health():
    return {"status": "ok", "model_loaded": model_service.loaded}