from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import or_

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["parts"])

@router.get("/parts/search", response_model=List[schemas.PartResponse])
def search_parts(query: Optional[str] = None, db: Session = Depends(get_db)):
    if not query:
        return []
    
    # Search in part_number and description
    parts = db.query(models.Part).filter(
        or_(
            models.Part.part_number.ilike(f"%{query}%"),
            models.Part.description.ilike(f"%{query}%")
        )
    ).all()
    return parts

@router.get("/parts", response_model=List[schemas.PartResponse])
def get_parts(db: Session = Depends(get_db)):
    parts = db.query(models.Part).all()
    return parts

@router.post("/parts", response_model=schemas.PartResponse)
def create_part(part: schemas.PartCreate, db: Session = Depends(get_db)):
    try:
        db_part = models.Part(
            part_number=part.part_number,
            description=part.description,
            customer=part.customer,
            material=part.material,
            cycle_time=part.cycle_time,
            price=part.price,
            compatible_machines=part.compatible_machines,
            setup_time=part.setup_time
        )
        db.add(db_part)
        db.commit()
        db.refresh(db_part)
        return db_part
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/parts/{part_id}")
def delete_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(models.Part).filter(models.Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    db.delete(part)
    db.commit()
    return {"message": "Part deleted successfully"} 