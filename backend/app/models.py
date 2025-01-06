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
    bom_id = Column(Integer, ForeignKey("boms.id"))
    material_name = Column(String)
    quantity = Column(Float)
    unit = Column(String)
    notes = Column(String, nullable=True)
    
    bom = relationship("BOM", back_populates="materials")

class BOMStep(Base):
    __tablename__ = "bom_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    bom_id = Column(Integer, ForeignKey("boms.id"))
    description = Column(String)
    time_minutes = Column(Float)
    cost_per_hour = Column(Float)
    notes = Column(String, nullable=True)
    
    bom = relationship("BOM", back_populates="steps")

class BOM(Base):
    __tablename__ = "boms"
    
    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"))
    cycle_time_seconds = Column(Float, nullable=True)
    cavities = Column(Integer, nullable=True)
    scrap_rate = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    
    part = relationship("Part", back_populates="bom")
    materials = relationship("BOMItem", back_populates="bom", cascade="all, delete-orphan")
    steps = relationship("BOMStep", back_populates="bom", cascade="all, delete-orphan")

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact_info = Column(JSON)  # Store contact details
    lead_time_days = Column(Integer)
    rating = Column(Float)
    active = Column(Boolean, default=True)
    
    materials = relationship("Material", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

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
    order_items = relationship("OrderItem", back_populates="part")
    quality_checks = relationship("QualityCheck", back_populates="part")
    bom = relationship("BOM", back_populates="part", uselist=False, cascade="all, delete-orphan")

class ProductionRun(Base):
    __tablename__ = "production_runs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    order_item_id = Column(Integer, ForeignKey("order_items.id"))
    quantity = Column(Integer)
    status = Column(String)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="production_runs")
    order_item = relationship("OrderItem", back_populates="production_runs")

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

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True)
    customer = Column(String)
    due_date = Column(DateTime)
    status = Column(String)  # open, in_progress, completed, cancelled
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    production_runs = relationship("ProductionRun", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    part_id = Column(Integer, ForeignKey("parts.id"))
    quantity = Column(Integer)
    status = Column(String)  # pending, in_production, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    order = relationship("Order", back_populates="items")
    part = relationship("Part", back_populates="order_items")
    production_runs = relationship("ProductionRun", back_populates="order_item")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    order_date = Column(DateTime, default=datetime.utcnow)
    expected_delivery = Column(DateTime)
    status = Column(String)  # draft, sent, received, cancelled
    notes = Column(String, nullable=True)
    
    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"))
    material_id = Column(Integer, ForeignKey("materials.id"))
    quantity = Column(Float)
    unit_price = Column(Float)
    received_quantity = Column(Float, default=0)
    status = Column(String)  # pending, partial, received
    
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    material = relationship("Material", backref="po_items")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)