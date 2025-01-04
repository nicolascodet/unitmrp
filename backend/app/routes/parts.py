from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

# Pydantic model for Part
class Part(BaseModel):
    name: str
    quantity: int
    description: Optional[str] = None

# In-memory storage for parts (replace with database later)
parts_db = []

@router.get("/parts", response_model=List[Part])
async def get_parts():
    return parts_db

@router.post("/parts", response_model=Part)
async def create_part(part: Part):
    parts_db.append(part)
    return part

@router.patch("/parts/{part_id}", response_model=Part)
async def update_part(part_id: int, part_update: Part):
    if part_id >= len(parts_db):
        raise HTTPException(status_code=404, detail="Part not found")
    parts_db[part_id] = part_update
    return part_update

@router.delete("/parts/{part_id}")
async def delete_part(part_id: int):
    if part_id >= len(parts_db):
        raise HTTPException(status_code=404, detail="Part not found")
    parts_db.pop(part_id)
    return {"message": "Part deleted"} 