"""HealthPass and Biometric Pydantic schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HealthPassResponse(BaseModel):
    """Full HealthPass representation for patient and authorized clinicians."""

    id: UUID
    patient_id: UUID
    card_number: str
    is_activated: bool = True
    
    # Patient Info (Joined from User)
    full_name: str
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    
    # Medical Triage Data
    blood_group: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    allergies: Optional[Any] = None
    chronic_conditions: Optional[Any] = None
    critical_notes: Optional[str] = None
    organ_donor: bool = False
    
    # Emergency Contacts
    personal_phone: Optional[str] = None
    parent_phone: Optional[str] = None
    has_personal_whatsapp: bool = False
    has_parent_whatsapp: bool = False
    
    # Identifiers
    qr_signature: Optional[str] = None
    nfc_uid: Optional[str] = None
    has_biometric: bool = False
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HealthPassUpdateRequest(BaseModel):
    """Fields allowed to be modified by the patient or attending medical staff."""

    personal_phone: Optional[str] = Field(default=None, max_length=30)
    parent_phone: Optional[str] = Field(default=None, max_length=30)
    has_personal_whatsapp: Optional[bool] = None
    has_parent_whatsapp: Optional[bool] = None
    
    blood_group: Optional[str] = Field(default=None, max_length=10)
    date_of_birth: Optional[str] = Field(default=None, max_length=30)
    gender: Optional[str] = Field(default=None, max_length=20)
    allergies: Optional[Any] = None
    chronic_conditions: Optional[Any] = None
    critical_notes: Optional[str] = None
    organ_donor: Optional[bool] = None


class HealthPassSearchItem(BaseModel):
    """Compact summary item returned in doctor/hospital emergency search."""

    card_number: str
    patient_id: UUID
    full_name: str
    avatar_url: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    is_activated: bool = True
    match_score: Optional[float] = None


class BiometricRegisterRequest(BaseModel):
    """Request to enroll or update patient facial biometric vectors."""

    face_vector: List[float] = Field(..., description="128-dimensional or 512-dimensional facial embedding vector")
    photo_url: Optional[str] = None
    quality_score: float = Field(default=1.0, ge=0.0, le=1.0)


class FaceMatchRequest(BaseModel):
    """
    Query submitted by trauma ward / ER staff to find an unconscious patient.
    Can supply either pre-computed facial embedding vector or raw base64 photo.
    """

    face_vector: Optional[List[float]] = None
    photo_base64: Optional[str] = None
    threshold: float = Field(default=0.80, ge=0.5, le=1.0, description="Minimum cosine similarity required")
    max_results: int = Field(default=5, ge=1, le=20)


class FaceMatchCandidate(BaseModel):
    """Individual face match candidate score and summary."""

    similarity_score: float
    confidence_percentage: float
    is_high_confidence: bool
    card: HealthPassSearchItem


class FaceMatchResponse(BaseModel):
    """Results returned from AI Facial Recognition engine."""

    total_candidates: int
    best_match: Optional[FaceMatchCandidate] = None
    candidates: List[FaceMatchCandidate] = []


class BreakGlassRequest(BaseModel):
    """Legal requirement: reason and doctor credentials to bypass patient consent in trauma cases."""

    reason: str = Field(..., min_length=5, description="Urgent clinical justification e.g. 'Trauma Ward ER: Unconscious accident patient in shock'")
    hospital_name: Optional[str] = None
    doctor_license: Optional[str] = None
    ip_address: Optional[str] = None


class EmergencyDossierResponse(BaseModel):
    """Full triage medical profile unlocked via Break-Glass protocol."""

    audit_log_id: UUID
    accessed_at: datetime
    card: HealthPassResponse
    warning: str = "This emergency access has been logged in an immutable audit trail and the patient's family contacts will be notified."


class EmergencyAccessLogResponse(BaseModel):
    """Audit log entry showing who retrieved the card and why."""

    id: UUID
    card_number: str
    accessor_name: str
    accessor_role: str
    accessor_license: Optional[str] = None
    hospital_name: Optional[str] = None
    access_type: str
    reason: str
    patient_notified: bool
    ip_address: Optional[str] = None
    accessed_at: datetime

    model_config = ConfigDict(from_attributes=True)
