from sqlalchemy import Column, Integer, String, Boolean, Float, Text, JSON
from app.core.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    specialty_en = Column(String, nullable=False)
    qualification = Column(String, nullable=False)
    experience = Column(Integer, nullable=False)
    hospital = Column(String, nullable=False)
    hospital_en = Column(String, nullable=False)
    location = Column(String, nullable=False)
    location_en = Column(String, nullable=False)
    fee = Column(Float, nullable=False)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    satisfaction = Column(Integer, default=0)
    image = Column(String, nullable=True)
    available = Column(Boolean, default=True)
    bio = Column(Text, nullable=True)
    
    # Storing complex structures as JSON for simplicity in MVP
    schedule = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    memberships = Column(JSON, nullable=True)
