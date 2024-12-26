from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String, unique=True, index=True)
    description = Column(String)
    customer = Column(String)
    material = Column(String)
    cycle_time = Column(Float)
    price = Column(Float)
    compatible_machines = Column(JSON)
    setup_time = Column(Float)
    
    # Relationship with ProductionRun
    production_runs = relationship("ProductionRun", back_populates="part")

    # Add this to your relationships
    quality_checks = relationship("QualityCheck", back_populates="part")

class ProductionRun(Base):
    __tablename__ = "production_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"))
    quantity = Column(Integer)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String)
    
    # Relationship with Part
    part = relationship("Part", back_populates="production_runs")

class QualityCheck(Base):
    __tablename__ = "quality_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"))
    check_date = Column(DateTime, default=datetime.utcnow)
    quantity_checked = Column(Integer)
    quantity_rejected = Column(Integer)
    notes = Column(String, nullable=True)
    status = Column(String)  # e.g., "passed", "failed", "pending"
    
    # Relationship with Part
    part = relationship("Part", back_populates="quality_checks")

class Machine(Base):
    __tablename__ = "machines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    status = Column(Boolean, default=False)  # False = idle, True = running
    current_shifts = Column(Integer, default=1)
    hours_per_shift = Column(Integer, default=8)
    last_updated = Column(DateTime, default=datetime.utcnow)
    current_job = Column(String, nullable=True)