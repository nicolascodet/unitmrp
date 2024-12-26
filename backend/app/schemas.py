from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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