from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.doctor import Doctor as DoctorModel
from app.schemas.doctor import Doctor

router = APIRouter()

@router.get("/", response_model=List[Doctor])
def get_doctors(
    skip: int = 0, limit: int = 100, 
    specialty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DoctorModel).filter(DoctorModel.available == True)
    if specialty:
        query = query.filter(DoctorModel.specialty.ilike(f"%{specialty}%"))
    doctors = query.offset(skip).limit(limit).all()
    return doctors

@router.get("/{doctor_id}", response_model=Doctor)
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(DoctorModel).filter(DoctorModel.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor
