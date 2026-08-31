from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    text: str
    language: Optional[str] = "bn"

class ActionPlan(BaseModel):
    text: str
    priority: str

class Symptom(BaseModel):
    name: str
    duration: Optional[str] = None
    status: Optional[str] = None

class Specialist(BaseModel):
    name: str
    specialty: str
    rating: float
    reviewCount: int

class AIAnalysisResponse(BaseModel):
    title: str
    severity: str
    description: str
    symptoms: List[Symptom]
    actionPlan: List[ActionPlan]
    recommendedSpecialist: Optional[Specialist] = None
