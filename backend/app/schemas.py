from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MaterialType(str, Enum):
    RAW = "raw"
    FINISHED = "finished"
    COMPONENT = "component"

# Base Schemas
class SupplierBase(BaseModel):
    name: str
    contact_info: Dict[str, Any]
    lead_time_days: int
    rating: float = Field(ge=0, le=5)
    active: bool = True

class MaterialBase(BaseModel):
    name: str
    type: MaterialType
    supplier_id: int
    price: float = Field(ge=0)
    moq: float = Field(ge=0)
    lead_time_days: int = Field(ge=0)
    reorder_point: float = Field(ge=0)
    specifications: Dict[str, Any]

class InventoryItemBase(BaseModel):
    material_id: int
    batch_number: str
    quantity: float = Field(ge=0)
    location: str
    status: str
    expiry_date: Optional[datetime] = None

class BOMItemBase(BaseModel):
    parent_part_id: int
    child_part_id: int
    quantity: float = Field(ge=0)
    process_step: str
    setup_time: float = Field(ge=0)
    cycle_time: float = Field(ge=0)
    notes: Optional[str] = None

# Create Schemas
class SupplierCreate(SupplierBase):
    pass

class MaterialCreate(MaterialBase):
    pass

class InventoryItemCreate(InventoryItemBase):
    pass

class BOMItemCreate(BOMItemBase):
    pass

# Read Schemas
class Supplier(SupplierBase):
    id: int
    
    class Config:
        orm_mode = True

class Material(MaterialBase):
    id: int
    supplier: Supplier
    
    class Config:
        orm_mode = True

class InventoryItem(InventoryItemBase):
    id: int
    received_date: datetime
    last_updated: datetime
    material: Material
    
    class Config:
        orm_mode = True

class BOMItem(BOMItemBase):
    id: int
    
    class Config:
        orm_mode = True

# Update existing Part schema with BOM relationships
class Part(BaseModel):
    id: int
    part_number: str
    description: str
    customer: str
    material: str
    cycle_time: float
    price: float
    compatible_machines: List[str]
    setup_time: float
    child_components: List[BOMItem] = []
    parent_assemblies: List[BOMItem] = []
    
    class Config:
        orm_mode = True

# Update Schemas
class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_info: Optional[Dict[str, Any]] = None
    lead_time_days: Optional[int] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    active: Optional[bool] = None

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[MaterialType] = None
    supplier_id: Optional[int] = None
    price: Optional[float] = Field(None, ge=0)
    moq: Optional[float] = Field(None, ge=0)
    lead_time_days: Optional[int] = Field(None, ge=0)
    reorder_point: Optional[float] = Field(None, ge=0)
    specifications: Optional[Dict[str, Any]] = None

class InventoryItemUpdate(BaseModel):
    quantity: Optional[float] = Field(None, ge=0)
    location: Optional[str] = None
    status: Optional[str] = None
    expiry_date: Optional[datetime] = None

class BOMItemUpdate(BaseModel):
    quantity: Optional[float] = Field(None, ge=0)
    process_step: Optional[str] = None
    setup_time: Optional[float] = Field(None, ge=0)
    cycle_time: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None

class PartBase(BaseModel):
    part_number: str
    description: str
    customer: str
    material: str
    cycle_time: float
    price: float
    compatible_machines: List[str]
    setup_time: float

class PartCreate(PartBase):
    pass

class PartResponse(PartBase):
    id: int

    class Config:
        from_attributes = True

class ProductionRunBase(BaseModel):
    quantity: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str

class ProductionRunCreate(ProductionRunBase):
    part_id: int

class ProductionRunResponse(ProductionRunBase):
    id: int
    part_id: int

    class Config:
        from_attributes = True

class QualityCheckBase(BaseModel):
    quantity_checked: int
    quantity_rejected: int
    notes: Optional[str] = None
    status: str

class QualityCheckCreate(QualityCheckBase):
    part_id: int
    check_date: Optional[datetime] = None

class QualityCheckResponse(QualityCheckBase):
    id: int
    part_id: int
    check_date: datetime

    class Config:
        from_attributes = True

class MachineBase(BaseModel):
    name: str
    status: bool = False
    current_shifts: int = 1
    hours_per_shift: int = 8
    current_job: Optional[str] = None

class MachineCreate(MachineBase):
    pass

class MachineResponse(MachineBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True

class MaintenanceRecordBase(BaseModel):
    machine_id: int
    type: str  # scheduled, unscheduled, breakdown
    description: str
    start_time: datetime
    end_time: Optional[datetime] = None
    technician: str
    parts_used: str
    cost: float = Field(ge=0)
    status: str  # planned, in_progress, completed

class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass

class MaintenanceRecord(MaintenanceRecordBase):
    id: int
    machine: MachineResponse
    duration_minutes: Optional[int] = None

    class Config:
        from_attributes = True

class MaintenanceRecordUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    technician: Optional[str] = None
    parts_used: Optional[str] = None
    cost: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None

class MachineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[bool] = None
    current_shifts: Optional[int] = None
    hours_per_shift: Optional[int] = None
    current_job: Optional[str] = None