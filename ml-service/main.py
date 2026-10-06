import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_VERSION = os.getenv("MODEL_VERSION", "logistic-v1")
FEATURE_NAMES = joblib.load(BASE_DIR / "models" / "feature_names.pkl")
MODEL = joblib.load(BASE_DIR / "models" / "logistic_model.pkl")

if len(FEATURE_NAMES) != MODEL.n_features_in_:
    raise RuntimeError("The model feature count does not match feature_names.pkl")


def normalize_symptom(value: str) -> str:
    return value.strip().lower().replace(" ", "_").replace("-", "_")


FEATURE_INDEX = {normalize_symptom(name): index for index, name in enumerate(FEATURE_NAMES)}

app = FastAPI(
    title="Sanjeevani Pattern Service",
    description="Classifies symptom patterns from the training dataset; it does not diagnose disease.",
    version=MODEL_VERSION,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("CORS_ALLOWED_ORIGIN", "http://localhost:5173").split(",")
        if origin.strip()
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    symptoms: list[str] = Field(default_factory=list)


class PredictionResponse(BaseModel):
    prediction: str | None
    confidence: float | None
    model_version: str
    unknown_symptoms: list[str] = Field(default_factory=list)
    message: str | None = None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model_version": MODEL_VERSION}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    vector = np.zeros((1, len(FEATURE_NAMES)), dtype=np.int8)
    unknown_symptoms: list[str] = []
    matched = False

    for symptom in request.symptoms:
        index = FEATURE_INDEX.get(normalize_symptom(symptom))
        if index is None:
            unknown_symptoms.append(symptom)
        else:
            vector[0, index] = 1
            matched = True

    if not matched:
        return PredictionResponse(
            prediction=None,
            confidence=None,
            model_version=MODEL_VERSION,
            unknown_symptoms=unknown_symptoms,
            message="No recognized symptom features were provided.",
        )

    model_input = vector
    if hasattr(MODEL, "feature_names_in_"):
        model_input = pd.DataFrame(vector, columns=FEATURE_NAMES)

    prediction = str(MODEL.predict(model_input)[0])
    confidence = None
    if hasattr(MODEL, "predict_proba"):
        confidence = round(float(np.max(MODEL.predict_proba(model_input)[0])), 4)

    return PredictionResponse(
        prediction=prediction,
        confidence=confidence,
        model_version=MODEL_VERSION,
        unknown_symptoms=unknown_symptoms,
        message="Pattern classification based on the training dataset; not a diagnosis.",
    )