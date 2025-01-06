from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.post("/api/bom", response_model=schemas.BOM)
def create_bom(bom: schemas.BOMCreate, part_id: int, db: Session = Depends(get_db)):
    # Check if part exists
    part = db.query(models.Part).filter(models.Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    # Create BOM
    db_bom = models.BOM(
        part_id=part_id,
        cycle_time_seconds=bom.cycle_time_seconds,
        cavities=bom.cavities,
        scrap_rate=bom.scrap_rate,
        notes=bom.notes
    )
    db.add(db_bom)
    db.flush()  # Get the BOM ID
    
    # Create BOM items
    for material in bom.materials:
        db_material = models.BOMItem(
            bom_id=db_bom.id,
            material_name=material.material_name,
            quantity=material.quantity,
            unit=material.unit,
            notes=material.notes
        )
        db.add(db_material)
    
    # Create BOM steps
    for step in bom.steps:
        db_step = models.BOMStep(
            bom_id=db_bom.id,
            description=step.description,
            time_minutes=step.time_minutes,
            cost_per_hour=step.cost_per_hour,
            notes=step.notes
        )
        db.add(db_step)
    
    db.commit()
    db.refresh(db_bom)
    return db_bom

@router.get("/api/bom/{bom_id}", response_model=schemas.BOM)
def get_bom(bom_id: int, db: Session = Depends(get_db)):
    bom = db.query(models.BOM).filter(models.BOM.id == bom_id).first()
    if not bom:
        raise HTTPException(status_code=404, detail="BOM not found")
    return bom

@router.put("/api/bom/{bom_id}", response_model=schemas.BOM)
def update_bom(bom_id: int, bom: schemas.BOMCreate, db: Session = Depends(get_db)):
    db_bom = db.query(models.BOM).filter(models.BOM.id == bom_id).first()
    if not db_bom:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    # Update BOM fields
    for field in ["cycle_time_seconds", "cavities", "scrap_rate", "notes"]:
        if hasattr(bom, field):
            setattr(db_bom, field, getattr(bom, field))
    
    # Delete existing items and steps
    db.query(models.BOMItem).filter(models.BOMItem.bom_id == bom_id).delete()
    db.query(models.BOMStep).filter(models.BOMStep.bom_id == bom_id).delete()
    
    # Create new items
    for material in bom.materials:
        db_material = models.BOMItem(
            bom_id=bom_id,
            material_name=material.material_name,
            quantity=material.quantity,
            unit=material.unit,
            notes=material.notes
        )
        db.add(db_material)
    
    # Create new steps
    for step in bom.steps:
        db_step = models.BOMStep(
            bom_id=bom_id,
            description=step.description,
            time_minutes=step.time_minutes,
            cost_per_hour=step.cost_per_hour,
            notes=step.notes
        )
        db.add(db_step)
    
    db.commit()
    db.refresh(db_bom)
    return db_bom

@router.delete("/api/bom/{bom_id}")
def delete_bom(bom_id: int, db: Session = Depends(get_db)):
    bom = db.query(models.BOM).filter(models.BOM.id == bom_id).first()
    if not bom:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    db.delete(bom)
    db.commit()
    return {"message": "BOM deleted successfully"} 