from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

# Pydantic model for Quality Check
class QualityCheck(BaseModel):
    part_name: str
    result: str
    check_date: Optional[datetime] = None
    notes: Optional[str] = None

# In-memory storage for quality checks
checks_db = []

@router.get("/quality-checks", response_model=List[QualityCheck])
async def get_quality_checks():
    return checks_db

@router.post("/quality-checks", response_model=QualityCheck)
async def create_quality_check(check: QualityCheck):
    checks_db.append(check)
    return check

@router.patch("/quality-checks/{check_id}", response_model=QualityCheck)
async def update_quality_check(check_id: int, check_update: QualityCheck):
    if check_id >= len(checks_db):
        raise HTTPException(status_code=404, detail="Quality check not found")
    checks_db[check_id] = check_update
    return check_update

@router.delete("/quality-checks/{check_id}")
async def delete_quality_check(check_id: int):
    if check_id >= len(checks_db):
        raise HTTPException(status_code=404, detail="Quality check not found")
    checks_db.pop(check_id)
    return {"message": "Quality check deleted"} 