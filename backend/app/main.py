from fastapi import FastAPI, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas
from .database import SessionLocal, engine

# Drop all tables and create new ones
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize test data
def init_test_data(db: Session):
    # Create test parts
    test_parts = [
        models.Part(
            part_number="P001",
            description="Test Part 1",
            customer="Customer A",
            material="Steel",
            cycle_time=10.5,
            price=100.00,
            compatible_machines=["Machine 1", "Machine 2"],
            setup_time=15.0
        ),
        models.Part(
            part_number="P002",
            description="Test Part 2",
            customer="Customer B",
            material="Aluminum",
            cycle_time=8.0,
            price=75.50,
            compatible_machines=["Machine 2", "Machine 3"],
            setup_time=12.0
        )
    ]
    
    for part in test_parts:
        db.add(part)
    
    db.commit()
    
    # Refresh to get the IDs
    for part in test_parts:
        db.refresh(part)
    
    # Create test production runs
    test_runs = [
        models.ProductionRun(
            part_id=test_parts[0].id,
            quantity=100,
            start_time=datetime.utcnow(),
            status="in_progress"
        ),
        models.ProductionRun(
            part_id=test_parts[1].id,
            quantity=50,
            start_time=datetime.utcnow(),
            status="pending"
        )
    ]
    
    for run in test_runs:
        db.add(run)
    
    db.commit()

# Initialize test data on startup
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    init_test_data(db)
    db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to the MRP API"}

@app.get("/parts", response_model=List[schemas.PartResponse])
def get_parts(db: Session = Depends(get_db)):
    parts = db.query(models.Part).all()
    return parts

@app.get("/parts/{part_number}", response_model=schemas.PartResponse)
def get_part(part_number: str, db: Session = Depends(get_db)):
    part = db.query(models.Part).filter(models.Part.part_number == part_number).first()
    if part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    return part

@app.get("/production-runs", response_model=List[schemas.ProductionRunResponse])
def get_production_runs(db: Session = Depends(get_db)):
    runs = db.query(models.ProductionRun).all()
    return runs

@app.get("/quality-checks", response_model=List[schemas.QualityCheckResponse])
def get_quality_checks(db: Session = Depends(get_db)):
    checks = db.query(models.QualityCheck).all()
    return checks

@app.get("/quality-checks/{check_id}", response_model=schemas.QualityCheckResponse)
def get_quality_check(check_id: int, db: Session = Depends(get_db)):
    check = db.query(models.QualityCheck).filter(models.QualityCheck.id == check_id).first()
    if check is None:
        raise HTTPException(status_code=404, detail="Quality check not found")
    return check

@app.get("/parts/{part_id}/quality-checks", response_model=List[schemas.QualityCheckResponse])
def get_part_quality_checks(part_id: int, db: Session = Depends(get_db)):
    checks = db.query(models.QualityCheck).filter(models.QualityCheck.part_id == part_id).all()
    return checks

@app.post("/parts", response_model=schemas.PartResponse)
def create_part(part: schemas.PartCreate, db: Session = Depends(get_db)):
    try:
        db_part = models.Part(**part.model_dump())
        db.add(db_part)
        db.commit()
        db.refresh(db_part)
        return db_part
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/production-runs", response_model=schemas.ProductionRunResponse)
def create_production_run(run: schemas.ProductionRunCreate, db: Session = Depends(get_db)):
    try:
        # Check if part exists
        part = db.query(models.Part).filter(models.Part.id == run.part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")
        
        # Create production run
        db_run = models.ProductionRun(**run.model_dump())
        db.add(db_run)
        db.commit()
        db.refresh(db_run)
        return db_run
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/quality-checks", response_model=schemas.QualityCheckResponse)
def create_quality_check(check: schemas.QualityCheckCreate, db: Session = Depends(get_db)):
    try:
        # Verify part exists
        part = db.query(models.Part).filter(models.Part.id == check.part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")
        
        # Create quality check
        db_check = models.QualityCheck(**check.model_dump())
        db.add(db_check)
        db.commit()
        db.refresh(db_check)
        return db_check
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/parts/{part_id}", response_model=schemas.PartResponse)
def update_part(part_id: int, part: schemas.PartCreate, db: Session = Depends(get_db)):
    db_part = db.query(models.Part).filter(models.Part.id == part_id).first()
    if db_part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    
    for key, value in part.model_dump().items():
        setattr(db_part, key, value)
    
    db.commit()
    db.refresh(db_part)
    return db_part

# BOM Management Endpoints
@app.post("/bom-items/", response_model=schemas.BOMItem)
def create_bom_item(bom_item: schemas.BOMItemCreate, db: Session = Depends(get_db)):
    db_bom_item = models.BOMItem(**bom_item.dict())
    db.add(db_bom_item)
    db.commit()
    db.refresh(db_bom_item)
    return db_bom_item

@app.get("/bom-items/{bom_item_id}", response_model=schemas.BOMItem)
def read_bom_item(bom_item_id: int, db: Session = Depends(get_db)):
    db_bom_item = db.query(models.BOMItem).filter(models.BOMItem.id == bom_item_id).first()
    if db_bom_item is None:
        raise HTTPException(status_code=404, detail="BOM item not found")
    return db_bom_item

@app.get("/parts/{part_id}/bom", response_model=List[schemas.BOMItem])
def read_part_bom(part_id: int, db: Session = Depends(get_db)):
    return db.query(models.BOMItem).filter(models.BOMItem.parent_part_id == part_id).all()

# Supplier Management Endpoints
@app.post("/suppliers/", response_model=schemas.Supplier)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@app.get("/suppliers/", response_model=List[schemas.Supplier])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Supplier).offset(skip).limit(limit).all()

# Material Management Endpoints
@app.post("/materials/", response_model=schemas.Material)
def create_material(material: schemas.MaterialCreate, db: Session = Depends(get_db)):
    db_material = models.Material(**material.dict())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@app.get("/materials/", response_model=List[schemas.Material])
def read_materials(
    skip: int = 0,
    limit: int = 100,
    material_type: Optional[schemas.MaterialType] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Material)
    if material_type:
        query = query.filter(models.Material.type == material_type)
    return query.offset(skip).limit(limit).all()

# Inventory Management Endpoints
@app.post("/inventory/", response_model=schemas.InventoryItem)
def create_inventory_item(item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    db_item = models.InventoryItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/inventory/", response_model=List[schemas.InventoryItem])
def read_inventory(
    skip: int = 0,
    limit: int = 100,
    location: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.InventoryItem)
    if location:
        query = query.filter(models.InventoryItem.location == location)
    if status:
        query = query.filter(models.InventoryItem.status == status)
    return query.offset(skip).limit(limit).all()

@app.put("/inventory/{item_id}", response_model=schemas.InventoryItem)
def update_inventory_item(
    item_id: int,
    item_update: schemas.InventoryItemUpdate,
    db: Session = Depends(get_db)
):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    for field, value in item_update.dict(exclude_unset=True).items():
        setattr(db_item, field, value)
    
    db_item.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    return db_item

# Material Requirements Planning Endpoints
@app.get("/materials/{material_id}/requirements")
def get_material_requirements(
    material_id: int,
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if material is None:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Get current inventory level
    current_inventory = db.query(models.InventoryItem)\
        .filter(models.InventoryItem.material_id == material_id)\
        .filter(models.InventoryItem.status == "available")\
        .with_entities(func.sum(models.InventoryItem.quantity))\
        .scalar() or 0
    
    return {
        "material_id": material_id,
        "current_inventory": current_inventory,
        "reorder_point": material.reorder_point,
        "moq": material.moq,
        "lead_time_days": material.lead_time_days,
        "days_until_reorder": max(0, (current_inventory - material.reorder_point) / (material.moq / days))
    }

# Machine Management Endpoints
@app.post("/machines/", response_model=schemas.Machine)
def create_machine(machine: schemas.MachineCreate, db: Session = Depends(get_db)):
    db_machine = models.Machine(**machine.dict())
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

@app.get("/machines/", response_model=List[schemas.Machine])
def read_machines(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Machine).offset(skip).limit(limit).all()

@app.get("/machines/{machine_id}", response_model=schemas.Machine)
def read_machine(machine_id: int, db: Session = Depends(get_db)):
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    return db_machine

@app.put("/machines/{machine_id}", response_model=schemas.Machine)
def update_machine(machine_id: int, machine: schemas.MachineUpdate, db: Session = Depends(get_db)):
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    for key, value in machine.dict(exclude_unset=True).items():
        setattr(db_machine, key, value)
    
    db.commit()
    db.refresh(db_machine)
    return db_machine

# Maintenance Record Endpoints
@app.post("/maintenance-records/", response_model=schemas.MaintenanceRecord)
def create_maintenance_record(record: schemas.MaintenanceRecordCreate, db: Session = Depends(get_db)):
    db_record = models.MaintenanceRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/maintenance-records/", response_model=List[schemas.MaintenanceRecord])
def read_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    machine_id: Optional[int] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.MaintenanceRecord)
    if machine_id:
        query = query.filter(models.MaintenanceRecord.machine_id == machine_id)
    if type:
        query = query.filter(models.MaintenanceRecord.type == type)
    if status:
        query = query.filter(models.MaintenanceRecord.status == status)
    return query.offset(skip).limit(limit).all()

@app.get("/maintenance-records/{record_id}", response_model=schemas.MaintenanceRecord)
def read_maintenance_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(models.MaintenanceRecord).filter(models.MaintenanceRecord.id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return db_record

@app.put("/maintenance-records/{record_id}", response_model=schemas.MaintenanceRecord)
def update_maintenance_record(record_id: int, record: schemas.MaintenanceRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(models.MaintenanceRecord).filter(models.MaintenanceRecord.id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    for key, value in record.dict(exclude_unset=True).items():
        setattr(db_record, key, value)
    
    db.commit()
    db.refresh(db_record)
    return db_record