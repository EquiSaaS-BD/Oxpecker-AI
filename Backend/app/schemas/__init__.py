from app.schemas.user import User, UserCreate, Token, TokenData
from app.schemas.doctor import Doctor
from app.schemas.medicine import Medicine
from app.schemas.chat import ChatMessage, AIAnalysisResponse
from app.schemas.healthpass import (
    HealthPassResponse,
    HealthPassUpdateRequest,
    HealthPassSearchItem,
    BiometricRegisterRequest,
    FaceMatchRequest,
    FaceMatchResponse,
    BreakGlassRequest,
    EmergencyDossierResponse,
    EmergencyAccessLogResponse,
)
