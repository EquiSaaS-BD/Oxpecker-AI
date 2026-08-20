from __future__ import annotations

import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, Any

from app.core.database import get_db
from app.core.response import success_response, error_response
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.patient_profile import PatientProfile
from app.models.doctor_profile import DoctorProfile
from app.models.hospital_profile import HospitalProfile

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile", tags=["Profile"])

# ── Schemas ────────────────────────────────────────────────────────

class ProfileUpdateRequest(BaseModel):
    # Common fields (updates User table)
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Patient fields
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    allergies: Optional[Any] = None
    medical_history: Optional[Any] = None
    emergency_contact: Optional[str] = None
    
    # Doctor fields
    specialty: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    bio: Optional[str] = None
    license_number: Optional[str] = None
    hospital_name: Optional[str] = None
    location: Optional[str] = None
    
    # Hospital fields
    address: Optional[str] = None
    city: Optional[str] = None
    bed_count: Optional[int] = None
    website: Optional[str] = None


# ══════════════════════════════════════════════════════════════════
#   GET /profile/me
# ══════════════════════════════════════════════════════════════════
@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the currently authenticated user's full profile."""
    
    profile_data = {
        "id": str(current_user.id),
        "email": current_user.email,
        "phone": current_user.phone,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
    }

    if current_user.role == "patient":
        result = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        prof = result.scalar_one_or_none()
        if prof:
            profile_data.update({
                "date_of_birth": prof.date_of_birth.isoformat() if prof.date_of_birth else None,
                "gender": prof.gender,
                "blood_group": prof.blood_group,
                "height": prof.height,
                "weight": prof.weight,
                "allergies": prof.allergies,
                "medical_history": prof.medical_history,
                "emergency_contact": prof.emergency_contact,
            })
            
    elif current_user.role == "doctor":
        result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        prof = result.scalar_one_or_none()
        if prof:
            profile_data.update({
                "specialty": prof.specialty,
                "qualification": prof.qualification,
                "experience_years": prof.experience_years,
                "hospital_name": prof.hospital_name,
                "location": prof.location,
                "consultation_fee": prof.consultation_fee,
                "bio": prof.bio,
                "license_number": prof.license_number,
                "rating": prof.rating,
                "review_count": prof.review_count,
            })
            
    elif current_user.role == "hospital":
        result = await db.execute(select(HospitalProfile).where(HospitalProfile.user_id == current_user.id))
        prof = result.scalar_one_or_none()
        if prof:
            profile_data.update({
                "hospital_name": prof.hospital_name,
                "license_number": prof.license_number,
                "address": prof.address,
                "city": prof.city,
                "bed_count": prof.bed_count,
                "website": prof.website,
                "departments": prof.departments,
            })

    return success_response(message="Profile fetched", data={"profile": profile_data})


# ══════════════════════════════════════════════════════════════════
#   PUT /profile/me
# ══════════════════════════════════════════════════════════════════
@router.put("/me")
async def update_my_profile(
    body: ProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the currently authenticated user's profile."""
    from datetime import datetime
    
    # Update common user fields
    if body.full_name is not None: current_user.full_name = body.full_name
    if body.phone is not None: current_user.phone = body.phone
    if body.avatar_url is not None: current_user.avatar_url = body.avatar_url
    
    # Update Role Specific Fields
    if current_user.role == "patient":
        result = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        prof = result.scalar_one_or_none()
        if prof:
            if body.date_of_birth is not None:
                try:
                    prof.date_of_birth = datetime.strptime(body.date_of_birth, "%Y-%m-%d").date()
                except ValueError:
                    pass
            if body.gender is not None: prof.gender = body.gender
            if body.blood_group is not None: prof.blood_group = body.blood_group
            if body.height is not None: prof.height = body.height
            if body.weight is not None: prof.weight = body.weight
            if body.allergies is not None: prof.allergies = body.allergies
            if body.medical_history is not None: prof.medical_history = body.medical_history
            if body.emergency_contact is not None: prof.emergency_contact = body.emergency_contact

    elif current_user.role == "doctor":
        result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        prof = result.scalar_one_or_none()
        if prof:
            if body.specialty is not None: prof.specialty = body.specialty
            if body.qualification is not None: prof.qualification = body.qualification
            if body.experience_years is not None: prof.experience_years = body.experience_years
            if body.consultation_fee is not None: prof.consultation_fee = body.consultation_fee
            if body.bio is not None: prof.bio = body.bio
            if body.license_number is not None: prof.license_number = body.license_number
            if body.hospital_name is not None: prof.hospital_name = body.hospital_name
            if body.location is not None: prof.location = body.location

    elif current_user.role == "hospital":
        result = await db.execute(select(HospitalProfile).where(HospitalProfile.user_id == current_user.id))
        prof = result.scalar_one_or_none()
        if prof:
            if body.hospital_name is not None: prof.hospital_name = body.hospital_name
            if body.license_number is not None: prof.license_number = body.license_number
            if body.address is not None: prof.address = body.address
            if body.city is not None: prof.city = body.city
            if body.bed_count is not None: prof.bed_count = body.bed_count
            if body.website is not None: prof.website = body.website

    await db.commit()
    
    return success_response(message="Profile updated successfully")
