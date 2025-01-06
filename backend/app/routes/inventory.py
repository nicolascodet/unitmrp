from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["inventory"])

@router.get("/inventory", response_model=List[schemas.InventoryItem])
def get_inventory(db: Session = Depends(get_db)):
    inventory = db.query(models.InventoryItem).all()
    return inventory

@router.post("/inventory", response_model=schemas.InventoryItem)
def create_inventory_item(item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    # Verify material exists
    material = db.query(models.Material).filter(models.Material.id == item.material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail=f"Material with id {item.material_id} not found")
    
    db_item = models.InventoryItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/inventory/{item_id}", response_model=schemas.InventoryItem)
def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.put("/inventory/{item_id}", response_model=schemas.InventoryItem)
def update_inventory_item(item_id: int, item: schemas.InventoryItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    for field, value in item.dict(exclude_unset=True).items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/inventory/{item_id}")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Inventory item deleted successfully"} 