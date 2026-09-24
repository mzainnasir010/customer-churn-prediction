from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import config
from app.routes import health, model, prediction
from app.services.model_service import model_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_service.load()
    yield


app = FastAPI(
    title=config.APP_TITLE,
    version=config.APP_VERSION,
    description="Predicts customer churn probability, risk tier, and the top drivers behind each prediction.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(prediction.router)
app.include_router(model.router)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "Churn Prediction API. Interactive docs at /docs"}