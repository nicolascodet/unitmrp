from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["materials"])

@router.get("/materials", response_model=List[schemas.Material])
def get_materials(db: Session = Depends(get_db)):
    materials = db.query(models.Material).all()
    return materials

@router.post("/materials", response_model=schemas.Material)
def create_material(material: schemas.MaterialCreate, db: Session = Depends(get_db)):
    # Verify supplier exists
    supplier = db.query(models.Supplier).filter(models.Supplier.id == material.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier with id {material.supplier_id} not found")
    
    db_material = models.Material(**material.dict())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material 