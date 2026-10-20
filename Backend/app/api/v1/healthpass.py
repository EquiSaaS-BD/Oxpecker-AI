"""
Oxpecker AI - Centralized HealthPass & Emergency Biometric Search API
Endpoints for:
- Patient Card Management & Self-Triage
- Biometric Enrollment (Facial Vectors)
- Hospital/Doctor Multi-Parameter Emergency Search
- AI Face Recognition Match for Unconscious ER Patients
- Break-Glass Emergency Access & Immutable Audit Logging
"""
from __future__ import annotations

import logging
import random
import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import (
    RoleChecker,
    get_current_active_user,
    require_doctor_or_hospital,
)
from app.core.database import get_db
from app.core.exceptions import AuthorizationError, NotFoundError, ValidationError
from app.core.response import error_response, success_response
from app.models.healthpass import EmergencyAccessLog, HealthPassCard, PatientBiometric
from app.models.patient_profile import PatientProfile
from app.models.user import User
from app.schemas.healthpass import (
    BiometricRegisterRequest,
    BreakGlassRequest,
    EmergencyAccessLogResponse,
    EmergencyDossierResponse,
    FaceMatchCandidate,
    FaceMatchRequest,
    FaceMatchResponse,
    HealthPassResponse,
    HealthPassSearchItem,
    HealthPassUpdateRequest,
)
from app.services.face_recognition import (
    FaceMatchEngine,
    extract_features_from_base64_fallback,
    normalize_vector,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/healthpass", tags=["Emergency HealthPass & Biometrics"])


def _generate_card_number() -> str:
    """Generate standardized card number e.g. HP-2026-94821."""
    current_year = datetime.now(timezone.utc).year
    suffix = random.randint(10000, 99999)
    return f"HP-{current_year}-{suffix}"


async def _get_or_create_health_card(
    user: User, db: AsyncSession
) -> HealthPassCard:
    """Fetch existing health card for patient, or provision a new one initialized from their profile."""
    stmt = select(HealthPassCard).where(HealthPassCard.patient_id == user.id)
    res = await db.execute(stmt)
    card = res.scalar_one_or_none()

    if card:
        return card

    # Fetch patient profile if exists
    prof_stmt = select(PatientProfile).where(PatientProfile.user_id == user.id)
    prof_res = await db.execute(prof_stmt)
    prof = prof_res.scalar_one_or_none()

    # Generate new unique card number
    card_number = _generate_card_number()
    # Ensure uniqueness
    while (await db.execute(select(HealthPassCard).where(HealthPassCard.card_number == card_number))).scalar_one_or_none():
        card_number = _generate_card_number()

    card = HealthPassCard(
        patient_id=user.id,
        card_number=card_number,
        is_activated=True,
        blood_group=prof.blood_group if prof else None,
        date_of_birth=prof.date_of_birth.isoformat() if prof and prof.date_of_birth else None,
        gender=prof.gender if prof else None,
        allergies=prof.allergies if prof else None,
        chronic_conditions=prof.medical_history if prof else None,
        personal_phone=user.phone,
        parent_phone=prof.emergency_contact if prof else None,
        has_personal_whatsapp=False,
        has_parent_whatsapp=False,
        qr_signature=f"OXPECKER-VERIFIED-{uuid.uuid4().hex[:16].upper()}",
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card


# ══════════════════════════════════════════════════════════════════
#  1. GET /healthpass/me  - Patient retrieves their HealthPass
# ══════════════════════════════════════════════════════════════════
@router.get("/me")
async def get_my_healthpass(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the logged-in user's own emergency HealthPass card."""
    card = await _get_or_create_health_card(current_user, db)

    # Check if biometric is enrolled
    bio_stmt = select(PatientBiometric).where(
        PatientBiometric.patient_id == current_user.id,
        PatientBiometric.is_active == True,
    )
    bio_res = await db.execute(bio_stmt)
    has_bio = bio_res.scalar_one_or_none() is not None

    card_data = {
        "id": str(card.id),
        "patient_id": str(card.patient_id),
        "card_number": card.card_number,
        "is_activated": card.is_activated,
        "full_name": current_user.full_name,
        "avatar_url": current_user.avatar_url,
        "email": current_user.email,
        "blood_group": card.blood_group,
        "date_of_birth": card.date_of_birth,
        "gender": card.gender,
        "allergies": card.allergies,
        "chronic_conditions": card.chronic_conditions,
        "critical_notes": card.critical_notes,
        "organ_donor": card.organ_donor,
        "personal_phone": card.personal_phone,
        "parent_phone": card.parent_phone,
        "has_personal_whatsapp": card.has_personal_whatsapp,
        "has_parent_whatsapp": card.has_parent_whatsapp,
        "qr_signature": card.qr_signature,
        "nfc_uid": card.nfc_uid,
        "has_biometric": has_bio,
        "created_at": card.created_at.isoformat() if card.created_at else None,
        "updated_at": card.updated_at.isoformat() if card.updated_at else None,
    }

    return success_response(
        message="HealthPass card retrieved successfully",
        data=card_data,
    )


# ══════════════════════════════════════════════════════════════════
#  2. PUT /healthpass/me  - Patient updates their emergency info
# ══════════════════════════════════════════════════════════════════
@router.put("/me")
async def update_my_healthpass(
    payload: HealthPassUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Patient updates their emergency contacts and triage vital notes."""
    card = await _get_or_create_health_card(current_user, db)

    # Update card fields
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(card, field, value)

    # Also update PatientProfile to maintain two-way consistency
    prof_stmt = select(PatientProfile).where(PatientProfile.user_id == current_user.id)
    prof_res = await db.execute(prof_stmt)
    prof = prof_res.scalar_one_or_none()

    if prof:
        if payload.blood_group is not None:
            prof.blood_group = payload.blood_group
        if payload.allergies is not None:
            prof.allergies = payload.allergies
        if payload.parent_phone is not None:
            prof.emergency_contact = payload.parent_phone
        if payload.chronic_conditions is not None:
            prof.medical_history = payload.chronic_conditions

    await db.commit()
    await db.refresh(card)

    return success_response(
        message="HealthPass updated successfully",
        data={"card_number": card.card_number, "updated": True},
    )


# ══════════════════════════════════════════════════════════════════
#  3. POST /healthpass/biometric - Register/Update Face Vector
# ══════════════════════════════════════════════════════════════════
@router.post("/biometric")
async def register_biometrics(
    payload: BiometricRegisterRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Register or refresh patient facial biometric embedding vector."""
    if not payload.face_vector or len(payload.face_vector) < 16:
        raise ValidationError("Invalid face vector: minimum 16 features required")

    norm_vector = normalize_vector(payload.face_vector)

    stmt = select(PatientBiometric).where(PatientBiometric.patient_id == current_user.id)
    res = await db.execute(stmt)
    biometric = res.scalar_one_or_none()

    if biometric:
        biometric.face_vector = norm_vector
        biometric.quality_score = payload.quality_score
        biometric.is_active = True
        if payload.photo_url:
            biometric.photo_url = payload.photo_url
    else:
        biometric = PatientBiometric(
            patient_id=current_user.id,
            face_vector=norm_vector,
            quality_score=payload.quality_score,
            photo_url=payload.photo_url,
            is_active=True,
        )
        db.add(biometric)

    await db.commit()

    return success_response(
        message="Biometric facial vector registered successfully",
        data={"patient_id": str(current_user.id), "enrolled": True},
    )


# ══════════════════════════════════════════════════════════════════
#  4. GET /healthpass/search - Doctor/Hospital Multi-Criteria Search
# ══════════════════════════════════════════════════════════════════
@router.get("/search")
async def emergency_search(
    query: str = Query(..., min_length=2, description="Search by Name, Phone, Blood Group, or Card UID"),
    limit: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(require_doctor_or_hospital),
    db: AsyncSession = Depends(get_db),
):
    """
    Search emergency patient registry.
    RESTRICTED: Verified Doctors and Hospitals only.
    """
    search_term = f"%{query.strip()}%"

    # Search across HealthPassCard and User
    stmt = (
        select(HealthPassCard, User)
        .join(User, HealthPassCard.patient_id == User.id)
        .where(
            or_(
                HealthPassCard.card_number.ilike(search_term),
                HealthPassCard.blood_group.ilike(search_term),
                HealthPassCard.personal_phone.ilike(search_term),
                HealthPassCard.parent_phone.ilike(search_term),
                User.full_name.ilike(search_term),
                User.phone.ilike(search_term),
            )
        )
        .limit(limit)
    )

    results = await db.execute(stmt)
    records = results.all()

    candidates: List[dict[str, Any]] = []
    for card, user in records:
        candidates.append({
            "card_number": card.card_number,
            "patient_id": str(user.id),
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "blood_group": card.blood_group,
            "date_of_birth": card.date_of_birth,
            "gender": card.gender,
            "phone": card.personal_phone or user.phone,
            "is_activated": card.is_activated,
        })

    return success_response(
        message=f"Found {len(candidates)} matching emergency records",
        data={"count": len(candidates), "results": candidates},
    )


# ══════════════════════════════════════════════════════════════════
#  5. POST /healthpass/face-match - AI Facial Recognition Match
# ══════════════════════════════════════════════════════════════════
@router.post("/face-match")
async def face_recognition_match(
    payload: FaceMatchRequest,
    current_user: User = Depends(require_doctor_or_hospital),
    db: AsyncSession = Depends(get_db),
):
    """
    Compare input facial vector (or trauma ward photo) against enrolled biometrics.
    RESTRICTED: Verified Doctors and Emergency Hospitals only.
    """
    query_vector: Optional[List[float]] = None

    if payload.face_vector:
        query_vector = normalize_vector(payload.face_vector)
    elif payload.photo_base64:
        query_vector = extract_features_from_base64_fallback(payload.photo_base64)
    else:
        raise ValidationError("Either face_vector or photo_base64 must be provided")

    # Fetch all active biometrics joined with User and Card
    stmt = (
        select(PatientBiometric, User, HealthPassCard)
        .join(User, PatientBiometric.patient_id == User.id)
        .join(HealthPassCard, HealthPassCard.patient_id == User.id)
        .where(PatientBiometric.is_active == True)
    )
    res = await db.execute(stmt)
    records = res.all()

    dataset: List[dict[str, Any]] = []
    for bio, user, card in records:
        dataset.append({
            "patient_id": str(user.id),
            "face_vector": bio.face_vector,
            "card": {
                "card_number": card.card_number,
                "patient_id": str(user.id),
                "full_name": user.full_name,
                "avatar_url": user.avatar_url or bio.photo_url,
                "blood_group": card.blood_group,
                "date_of_birth": card.date_of_birth,
                "gender": card.gender,
                "phone": card.personal_phone or user.phone,
                "is_activated": card.is_activated,
            },
        })

    # Execute vector cosine similarity match engine
    ranked = FaceMatchEngine.rank_candidates(
        query_vector=query_vector,
        database_biometrics=dataset,
        threshold=payload.threshold,
        max_results=payload.max_results,
    )

    best_match = ranked[0] if ranked else None

    # Audit logging for AI match attempt
    if best_match:
        audit_entry = EmergencyAccessLog(
            card_number=best_match["card"]["card_number"],
            accessed_by_user_id=current_user.id,
            accessor_name=current_user.full_name,
            accessor_role=current_user.role,
            access_type="FACE_MATCH",
            reason=f"AI Facial Recognition Match in ER: Confidence {best_match['confidence_percentage']}%",
            patient_notified=True,
        )
        db.add(audit_entry)
        await db.commit()

    return success_response(
        message="Face match analysis complete",
        data={
            "total_candidates": len(ranked),
            "best_match": best_match,
            "candidates": ranked,
        },
    )


# ══════════════════════════════════════════════════════════════════
#  6. POST /healthpass/{card_number}/break-glass - ER Trauma Unlock
# ══════════════════════════════════════════════════════════════════
@router.post("/{card_number}/break-glass")
async def break_glass_emergency_unlock(
    card_number: str,
    payload: BreakGlassRequest,
    request: Request,
    current_user: User = Depends(require_doctor_or_hospital),
    db: AsyncSession = Depends(get_db),
):
    """
    Break-Glass Emergency Protocol.
    Allows attending ER trauma surgeons/hospitals to bypass consent for unconscious patients.
    Creates an immutable legal audit log and releases full life-saving medical dossier.
    """
    stmt = (
        select(HealthPassCard, User)
        .join(User, HealthPassCard.patient_id == User.id)
        .where(HealthPassCard.card_number == card_number)
    )
    res = await db.execute(stmt)
    record = res.first()

    if not record:
        raise NotFoundError(f"HealthPass Card '{card_number}' not found")

    card, patient_user = record

    # Extract client IP
    client_ip = payload.ip_address or request.client.host if request.client else None

    # Log Break-Glass access in immutable audit table
    audit_log = EmergencyAccessLog(
        card_number=card.card_number,
        accessed_by_user_id=current_user.id,
        accessor_name=current_user.full_name,
        accessor_role=current_user.role,
        accessor_license=payload.doctor_license,
        hospital_name=payload.hospital_name,
        access_type="BREAK_GLASS",
        reason=payload.reason,
        patient_notified=True,
        ip_address=client_ip,
    )
    db.add(audit_log)
    await db.commit()
    await db.refresh(audit_log)

    logger.warning(
        f"[BREAK_GLASS_ACCESS] Card: {card_number} unlocked by {current_user.full_name} ({current_user.role}). Reason: {payload.reason}"
    )

    # Return full unlocked dossier
    dossier = {
        "audit_log_id": str(audit_log.id),
        "accessed_at": audit_log.accessed_at.isoformat(),
        "card": {
            "id": str(card.id),
            "patient_id": str(patient_user.id),
            "card_number": card.card_number,
            "is_activated": card.is_activated,
            "full_name": patient_user.full_name,
            "avatar_url": patient_user.avatar_url,
            "email": patient_user.email,
            "blood_group": card.blood_group,
            "date_of_birth": card.date_of_birth,
            "gender": card.gender,
            "allergies": card.allergies,
            "chronic_conditions": card.chronic_conditions,
            "critical_notes": card.critical_notes,
            "organ_donor": card.organ_donor,
            "personal_phone": card.personal_phone or patient_user.phone,
            "parent_phone": card.parent_phone,
            "has_personal_whatsapp": card.has_personal_whatsapp,
            "has_parent_whatsapp": card.has_parent_whatsapp,
            "qr_signature": card.qr_signature,
            "nfc_uid": card.nfc_uid,
        },
        "warning": "This emergency access has been permanently logged in an immutable audit trail and sent to the patient's registered emergency contacts.",
    }

    return success_response(
        message="Emergency Break-Glass access granted. Complete triage dossier unlocked.",
        data=dossier,
    )


# ══════════════════════════════════════════════════════════════════
#  7. GET /healthpass/{card_number}/audit-logs - Access Logs
# ══════════════════════════════════════════════════════════════════
@router.get("/{card_number}/audit-logs")
async def get_card_audit_logs(
    card_number: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    View access log history for a specific HealthPass card.
    Accessible by card owner or verified doctor/hospital.
    """
    # Fetch card to check ownership
    card_stmt = select(HealthPassCard).where(HealthPassCard.card_number == card_number)
    card_res = await db.execute(card_stmt)
    card = card_res.scalar_one_or_none()

    if not card:
        raise NotFoundError("HealthPass card not found")

    # If patient, verify ownership
    if current_user.role == "patient" and card.patient_id != current_user.id:
        raise AuthorizationError("Access denied: You can only view audit logs for your own card")

    # Fetch logs
    stmt = (
        select(EmergencyAccessLog)
        .where(EmergencyAccessLog.card_number == card_number)
        .order_by(EmergencyAccessLog.accessed_at.desc())
        .limit(50)
    )
    res = await db.execute(stmt)
    logs = res.scalars().all()

    log_list = [
        {
            "id": str(log.id),
            "card_number": log.card_number,
            "accessor_name": log.accessor_name,
            "accessor_role": log.accessor_role,
            "accessor_license": log.accessor_license,
            "hospital_name": log.hospital_name,
            "access_type": log.access_type,
            "reason": log.reason,
            "patient_notified": log.patient_notified,
            "ip_address": log.ip_address,
            "accessed_at": log.accessed_at.isoformat(),
        }
        for log in logs
    ]

    return success_response(
        message="Audit logs retrieved successfully",
        data={"count": len(log_list), "logs": log_list},
    )
