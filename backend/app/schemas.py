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
    material_name: str
    quantity: float = Field(ge=0)
    unit: str
    notes: Optional[str] = None

class BOMStepBase(BaseModel):
    description: str
    time_minutes: float = Field(ge=0)
    cost_per_hour: float = Field(ge=0)
    notes: Optional[str] = None

class BOMBase(BaseModel):
    steps: List[BOMStepBase]
    materials: List[BOMItemBase]
    cycle_time_seconds: Optional[float] = Field(None, ge=0)
    cavities: Optional[int] = Field(None, ge=1)
    scrap_rate: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None

# Create Schemas
class SupplierCreate(SupplierBase):
    pass

class MaterialCreate(MaterialBase):
    pass

class InventoryItemCreate(InventoryItemBase):
    pass

class BOMCreate(BOMBase):
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

class BOMStep(BOMStepBase):
    id: int
    
    class Config:
        orm_mode = True

class BOM(BOMBase):
    id: int
    materials: List[BOMItem]
    steps: List[BOMStep]
    
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
    bom: Optional[BOM] = None
    
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
    bom: Optional[BOM] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ProductionRunBase(BaseModel):
    quantity: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str

class ProductionRunCreate(BaseModel):
    order_id: int
    order_item_id: int
    quantity: int
    status: str

class ProductionRunResponse(BaseModel):
    id: int
    order_id: int
    order_item_id: int
    quantity: int
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

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

class OrderItemBase(BaseModel):
    part_id: int
    quantity: int = Field(ge=1)
    status: str = "pending"

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    part: Part

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer: str
    due_date: datetime
    status: str = "open"
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    order_number: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True

class PurchaseOrderItemBase(BaseModel):
    material_id: int
    quantity: float = Field(ge=0)
    unit_price: float = Field(ge=0)
    status: str = "pending"
    received_quantity: float = Field(default=0, ge=0)

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    po_id: int
    material: Material

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    supplier_id: int
    expected_delivery: datetime
    status: str = "draft"
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

class PurchaseOrder(PurchaseOrderBase):
    id: int
    po_number: str
    order_date: datetime
    supplier: Supplier
    items: List[PurchaseOrderItem]

    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True