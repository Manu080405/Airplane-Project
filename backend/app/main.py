from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PredictionRequest
from app.predictor import predict_ticket_purchase

app = FastAPI(
    title="Digital Ad Targeting API",
    version="1.0.0",
    description="Predict whether a customer is likely to purchase an airline ticket.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your React URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Digital Ad Targeting API is running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/predict")
def predict(data: PredictionRequest):
    return predict_ticket_purchase(data)