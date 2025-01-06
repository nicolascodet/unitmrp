from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["purchase_orders"])

@router.get("/purchase-orders", response_model=List[schemas.PurchaseOrder])
def get_purchase_orders(db: Session = Depends(get_db)):
    purchase_orders = db.query(models.PurchaseOrder).all()
    return purchase_orders

@router.post("/purchase-orders", response_model=schemas.PurchaseOrder)
def create_purchase_order(po: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    # Generate PO number
    po_number = f"PO-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
    
    # Verify supplier exists
    supplier = db.query(models.Supplier).filter(models.Supplier.id == po.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier with id {po.supplier_id} not found")
    
    db_po = models.PurchaseOrder(
        po_number=po_number,
        supplier_id=po.supplier_id,
        expected_delivery=po.expected_delivery,
        status=po.status,
        notes=po.notes
    )
    db.add(db_po)
    db.flush()
    
    # Create PO items
    for item in po.items:
        # Verify material exists
        material = db.query(models.Material).filter(models.Material.id == item.material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail=f"Material with id {item.material_id} not found")
        
        db_item = models.PurchaseOrderItem(
            po_id=db_po.id,
            material_id=item.material_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            status="pending"
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_po)
    return db_po

@router.get("/purchase-orders/{po_id}", response_model=schemas.PurchaseOrder)
def get_purchase_order(po_id: int, db: Session = Depends(get_db)):
    po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po

@router.put("/purchase-orders/{po_id}", response_model=schemas.PurchaseOrder)
def update_purchase_order(po_id: int, po: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    # Update PO fields
    for field in ["supplier_id", "expected_delivery", "status", "notes"]:
        if hasattr(po, field):
            setattr(db_po, field, getattr(po, field))
    
    # Delete existing items
    db.query(models.PurchaseOrderItem).filter(models.PurchaseOrderItem.po_id == po_id).delete()
    
    # Create new items
    for item in po.items:
        # Verify material exists
        material = db.query(models.Material).filter(models.Material.id == item.material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail=f"Material with id {item.material_id} not found")
        
        db_item = models.PurchaseOrderItem(
            po_id=po_id,
            material_id=item.material_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            status="pending"
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_po)
    return db_po

@router.delete("/purchase-orders/{po_id}")
def delete_purchase_order(po_id: int, db: Session = Depends(get_db)):
    po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    db.delete(po)
    db.commit()
    return {"message": "Purchase order deleted successfully"} 