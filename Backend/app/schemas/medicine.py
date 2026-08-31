from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class MedicineBase(BaseModel):
    id: str
    name: str
    generic: str
    dosage: str
    type: str
    manufacturer: str
    price: float
    unit: str
    image: Optional[str] = None
    description: Optional[str] = None
    
    side_effects: Optional[List[str]] = None
    dosage_info: Optional[Dict[str, Any]] = None
    alternatives: Optional[List[Dict[str, Any]]] = None
    price_trend: Optional[Dict[str, Any]] = None

class Medicine(MedicineBase):
    class Config:
        from_attributes = True
