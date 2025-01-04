from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

# Pydantic model for Production Run
class ProductionRun(BaseModel):
    part_name: str
    quantity: int
    status: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

# In-memory storage for production runs
runs_db = []

@router.get("/production-runs", response_model=List[ProductionRun])
async def get_production_runs():
    return runs_db

@router.post("/production-runs", response_model=ProductionRun)
async def create_production_run(run: ProductionRun):
    runs_db.append(run)
    return run

@router.patch("/production-runs/{run_id}", response_model=ProductionRun)
async def update_production_run(run_id: int, run_update: ProductionRun):
    if run_id >= len(runs_db):
        raise HTTPException(status_code=404, detail="Production run not found")
    runs_db[run_id] = run_update
    return run_update

@router.delete("/production-runs/{run_id}")
async def delete_production_run(run_id: int):
    if run_id >= len(runs_db):
        raise HTTPException(status_code=404, detail="Production run not found")
    runs_db.pop(run_id)
    return {"message": "Production run deleted"} 