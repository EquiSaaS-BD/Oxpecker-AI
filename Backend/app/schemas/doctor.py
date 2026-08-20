from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DoctorBase(BaseModel):
    id: str
    name: str
    name_en: str
    specialty: str
    specialty_en: str
    qualification: str
    experience: int
    hospital: str
    hospital_en: str
    location: str
    location_en: str
    fee: float
    rating: float
    review_count: int
    satisfaction: int
    image: Optional[str] = None
    available: bool = True
    bio: Optional[str] = None
    
    # Complex fields stored as JSON in DB
    schedule: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    memberships: Optional[List[str]] = None

class Doctor(DoctorBase):
    class Config:
        from_attributes = True
