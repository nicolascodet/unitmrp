from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from sqlalchemy import or_

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["orders"])

@router.get("/orders/search", response_model=List[schemas.Order])
def search_orders(query: Optional[str] = None, db: Session = Depends(get_db)):
    if not query:
        return []
    
    # Search in order_number and customer
    orders = db.query(models.Order).filter(
        or_(
            models.Order.order_number.ilike(f"%{query}%"),
            models.Order.customer.ilike(f"%{query}%")
        )
    ).all()
    return orders

@router.get("/orders", response_model=List[schemas.Order])
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    return orders

@router.post("/orders", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Generate order number (you might want to customize this)
    order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
    
    db_order = models.Order(
        order_number=order_number,
        customer=order.customer,
        due_date=order.due_date,
        status=order.status,
        notes=order.notes
    )
    db.add(db_order)
    db.flush()  # Get the order ID
    
    # Create order items
    for item in order.items:
        # Verify part exists
        part = db.query(models.Part).filter(models.Part.id == item.part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail=f"Part with id {item.part_id} not found")
        
        db_item = models.OrderItem(
            order_id=db_order.id,
            part_id=item.part_id,
            quantity=item.quantity,
            status=item.status
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/orders/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/orders/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order fields
    for field in ["customer", "due_date", "status", "notes"]:
        if hasattr(order, field):
            setattr(db_order, field, getattr(order, field))
    
    # Delete existing items
    db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).delete()
    
    # Create new items
    for item in order.items:
        # Verify part exists
        part = db.query(models.Part).filter(models.Part.id == item.part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail=f"Part with id {item.part_id} not found")
        
        db_item = models.OrderItem(
            order_id=order_id,
            part_id=item.part_id,
            quantity=item.quantity,
            status=item.status
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"} 