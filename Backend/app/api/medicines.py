from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.medicine import Medicine as MedicineModel
from app.schemas.medicine import Medicine

router = APIRouter()

@router.get("/", response_model=List[Medicine])
def get_medicines(
    skip: int = 0, limit: int = 100, 
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    db_query = db.query(MedicineModel)
    if query:
        db_query = db_query.filter(
            (MedicineModel.name.ilike(f"%{query}%")) | 
            (MedicineModel.generic.ilike(f"%{query}%"))
        )
    medicines = db_query.offset(skip).limit(limit).all()
    return medicines

@router.get("/{medicine_id}", response_model=Medicine)
def get_medicine(medicine_id: str, db: Session = Depends(get_db)):
    medicine = db.query(MedicineModel).filter(MedicineModel.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine
