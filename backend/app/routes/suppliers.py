from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class Supplier(BaseModel):
    id: Optional[int] = None
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

# In-memory storage for suppliers
suppliers_db = []
current_id = 1

@router.get("/suppliers/search", response_model=List[Supplier])
async def search_suppliers(query: Optional[str] = None):
    if not query:
        return []
    query = query.lower()
    return [s for s in suppliers_db if query in s.name.lower()]

@router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers():
    return suppliers_db

@router.get("/suppliers/{supplier_id}", response_model=Supplier)
async def get_supplier(supplier_id: int):
    for supplier in suppliers_db:
        if supplier.id == supplier_id:
            return supplier
    raise HTTPException(status_code=404, detail="Supplier not found")

@router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier: Supplier):
    global current_id
    new_supplier = Supplier(
        id=current_id,
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        notes=supplier.notes
    )
    suppliers_db.append(new_supplier)
    current_id += 1
    return new_supplier 