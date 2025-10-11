from app.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class HawkerCentre(Base):
    __tablename__ = "hawker_centres"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False) # e.g., "Tiong Bahru Market"
    
    # # Relationship to the businesses located here (One-to-Many)
    # businesses = relationship("Business", back_populates="hawker_centre_rel")