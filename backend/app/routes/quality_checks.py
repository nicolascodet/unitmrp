from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["quality_checks"])

@router.get("/quality-checks", response_model=List[schemas.QualityCheckResponse])
def get_quality_checks(db: Session = Depends(get_db)):
    checks = db.query(models.QualityCheck).all()
    return checks

@router.post("/quality-checks", response_model=schemas.QualityCheckResponse)
def create_quality_check(check: schemas.QualityCheckCreate, db: Session = Depends(get_db)):
    # Verify part exists
    part = db.query(models.Part).filter(models.Part.id == check.part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail=f"Part with id {check.part_id} not found")
    
    db_check = models.QualityCheck(**check.dict())
    db.add(db_check)
    db.commit()
    db.refresh(db_check)
    return db_check 