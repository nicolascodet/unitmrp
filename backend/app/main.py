from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from . import models, schemas
from .database import SessionLocal, engine

# Drop all tables and create new ones
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to the MRP API"}

@app.get("/parts")
def get_parts(db: Session = Depends(get_db)):
    parts = db.query(models.Part).all()
    return parts

@app.get("/parts/{part_number}")
def get_part(part_number: str, db: Session = Depends(get_db)):
    part = db.query(models.Part).filter(models.Part.part_number == part_number).first()
    if part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    return part

@app.get("/production-runs")
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
        
        # Print the data for debugging
        print(f"Received check data: {check.model_dump()}")
        
        # Create quality check
        db_check = models.QualityCheck(**check.model_dump())
        db.add(db_check)
        db.commit()
        db.refresh(db_check)
        return db_check
    except Exception as e:
        db.rollback()
        # Print the full error
        print(f"Error creating quality check: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/machines", response_model=schemas.MachineResponse)
def create_machine(machine: schemas.MachineCreate, db: Session = Depends(get_db)):
    try:
        db_machine = models.Machine(**machine.model_dump())
        db.add(db_machine)
        db.commit()
        db.refresh(db_machine)
        return db_machine
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/machines", response_model=List[schemas.MachineResponse])
def get_machines(db: Session = Depends(get_db)):
    machines = db.query(models.Machine).all()
    return machines

@app.get("/machines/{machine_id}", response_model=schemas.MachineResponse)
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine

@app.put("/machines/{machine_id}", response_model=schemas.MachineResponse)
def update_machine(
    machine_id: int, 
    machine_update: schemas.MachineCreate, 
    db: Session = Depends(get_db)
):
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    for key, value in machine_update.model_dump().items():
        setattr(db_machine, key, value)
    
    db_machine.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(db_machine)
    return db_machine