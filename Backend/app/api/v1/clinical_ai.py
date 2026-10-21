from __future__ import annotations
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.ai.clinical_engine import clinical_engine

router = APIRouter(prefix="/clinical-ai", tags=["Clinical AI"])

class DiagnosisRequest(BaseModel):
    symptoms: str = Field(..., description="Comma-separated or free-text description of patient symptoms in English or Bengali")
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    vitals: Optional[Dict[str, Any]] = None
    category: Optional[str] = None

class DiagnosisResponse(BaseModel):
    status: str
    diagnosis: Dict[str, Any]
    timestamp: str

@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose_symptoms(payload: DiagnosisRequest):
    """
    Diagnose patient symptoms using fine-tuned Qwen clinical AI model / DGHS 150-disease clinical protocols.
    """
    if not payload.symptoms or len(payload.symptoms.strip()) < 2:
        raise HTTPException(status_code=400, detail="Symptoms description is required")

    result = clinical_engine.diagnose(
        symptoms_query=payload.symptoms,
        age=payload.age,
        vitals=payload.vitals,
        category=payload.category
    )

    return DiagnosisResponse(
        status="success",
        diagnosis=result,
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@router.get("/diseases")
async def list_supported_diseases():
    """
    List all 150 common diseases in Bangladesh supported by the clinical model.
    """
    diseases = clinical_engine.get_supported_diseases()
    return {
        "status": "success",
        "total": len(diseases),
        "diseases": diseases
    }

@router.get("/model-status")
async def get_model_status():
    """
    Check current clinical model engine status (GGUF loaded or DGHS Rule-Based).
    """
    return {
        "status": "healthy",
        "model_loaded": clinical_engine.model_loaded,
        "active_engine": "Qwen-2.5-0.5B-GGUF" if clinical_engine.model_loaded else "Oxpecker-Clinical-DGHS-150",
        "dataset_diseases_count": len(clinical_engine.diseases_data),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
