from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import enum

class MaterialType(enum.Enum):
    RAW = "raw"
    FINISHED = "finished"
    COMPONENT = "component"

class BOMItem(Base):
    __tablename__ = "bom_items"
    
    id = Column(Integer, primary_key=True, index=True)
    parent_part_id = Column(Integer, ForeignKey("parts.id"))
    child_part_id = Column(Integer, ForeignKey("parts.id"))
    quantity = Column(Float)
    process_step = Column(String)  # molding, assembly, cleaning, QC
    setup_time = Column(Float)
    cycle_time = Column(Float)
    notes = Column(String, nullable=True)
    
    parent_part = relationship("Part", foreign_keys=[parent_part_id], back_populates="child_components")
    child_part = relationship("Part", foreign_keys=[child_part_id], back_populates="parent_assemblies")

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact_info = Column(JSON)  # Store contact details
    lead_time_days = Column(Integer)
    rating = Column(Float)
    active = Column(Boolean, default=True)
    
    materials = relationship("Material", back_populates="supplier")

class Material(Base):
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(Enum(MaterialType))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    price = Column(Float)
    moq = Column(Float)  # Minimum Order Quantity
    lead_time_days = Column(Integer)
    reorder_point = Column(Float)
    specifications = Column(JSON)  # Technical specifications
    
    supplier = relationship("Supplier", back_populates="materials")
    inventory_items = relationship("InventoryItem", back_populates="material")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"))
    batch_number = Column(String, index=True)
    quantity = Column(Float)
    location = Column(String)
    status = Column(String)  # available, reserved, quarantine
    expiry_date = Column(DateTime, nullable=True)
    received_date = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    material = relationship("Material", back_populates="inventory_items")
    quality_checks = relationship("QualityCheck", back_populates="inventory_item")

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
    
    # Relationships
    production_runs = relationship("ProductionRun", back_populates="part")
    quality_checks = relationship("QualityCheck", back_populates="part")
    child_components = relationship("BOMItem", foreign_keys=[BOMItem.parent_part_id], back_populates="parent_part")
    parent_assemblies = relationship("BOMItem", foreign_keys=[BOMItem.child_part_id], back_populates="child_part")

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
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=True)
    check_date = Column(DateTime, default=datetime.utcnow)
    quantity_checked = Column(Integer)
    quantity_rejected = Column(Integer)
    notes = Column(String, nullable=True)
    status = Column(String)  # passed, failed, pending
    
    part = relationship("Part", back_populates="quality_checks")
    inventory_item = relationship("InventoryItem", back_populates="quality_checks")

class Machine(Base):
    __tablename__ = "machines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    status = Column(Boolean, default=False)  # False = idle, True = running
    current_shifts = Column(Integer, default=1)
    hours_per_shift = Column(Integer, default=8)
    last_updated = Column(DateTime, default=datetime.utcnow)
    current_job = Column(String, nullable=True)
    
    maintenance_records = relationship("MaintenanceRecord", back_populates="machine")

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"))
    type = Column(String)  # scheduled, unscheduled, breakdown
    description = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    technician = Column(String)
    parts_used = Column(String)
    cost = Column(Float)
    status = Column(String)  # planned, in_progress, completed
    
    machine = relationship("Machine", back_populates="maintenance_records")