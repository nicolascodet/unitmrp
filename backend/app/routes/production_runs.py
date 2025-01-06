from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["production_runs"])

@router.get("/production-runs", response_model=List[schemas.ProductionRunResponse])
def get_production_runs(db: Session = Depends(get_db)):
    runs = db.query(models.ProductionRun).all()
    return runs

@router.post("/production-runs", response_model=schemas.ProductionRunResponse)
def create_production_run(run: schemas.ProductionRunCreate, db: Session = Depends(get_db)):
    # Verify part exists
    part = db.query(models.Part).filter(models.Part.id == run.part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail=f"Part with id {run.part_id} not found")
    
    db_run = models.ProductionRun(**run.dict())
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    return db_run 