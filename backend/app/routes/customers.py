from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from sqlalchemy import or_

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["customers"])

@router.get("/customers/search", response_model=List[schemas.CustomerResponse])
def search_customers(query: Optional[str] = None, db: Session = Depends(get_db)):
    if not query:
        return []
    query = query.lower()
    return db.query(models.Customer).filter(
        or_(
            models.Customer.name.ilike(f"%{query}%"),
            models.Customer.email.ilike(f"%{query}%")
        )
    ).all()

@router.get("/customers", response_model=List[schemas.CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()

@router.get("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/customers", response_model=schemas.CustomerResponse)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    try:
        db_customer = models.Customer(
            name=customer.name,
            email=customer.email,
            phone=customer.phone,
            address=customer.address,
            notes=customer.notes
        )
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) 