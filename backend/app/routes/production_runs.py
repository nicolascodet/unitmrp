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
    # Verify order exists
    order = db.query(models.Order).filter(models.Order.id == run.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order with id {run.order_id} not found")
    
    # Verify order item exists and belongs to the order
    order_item = db.query(models.OrderItem).filter(
        models.OrderItem.id == run.order_item_id,
        models.OrderItem.order_id == run.order_id
    ).first()
    if not order_item:
        raise HTTPException(status_code=404, detail=f"Order item with id {run.order_item_id} not found for order {run.order_id}")
    
    db_run = models.ProductionRun(**run.dict())
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    return db_run 