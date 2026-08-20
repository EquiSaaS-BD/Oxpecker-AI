from sqlalchemy import Column, Integer, String, Float, Text, JSON
from app.core.database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    generic = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    type = Column(String, nullable=False)
    manufacturer = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    image = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    # Store complex structures as JSON
    side_effects = Column(JSON, nullable=True)
    dosage_info = Column(JSON, nullable=True)
    alternatives = Column(JSON, nullable=True)
    price_trend = Column(JSON, nullable=True)
