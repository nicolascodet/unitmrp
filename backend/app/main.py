from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import parts, inventory, production_runs, quality_checks, orders, purchase_orders, suppliers, customers, bom
from .database import create_tables

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
create_tables()

# Include routers
app.include_router(parts.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(production_runs.router, prefix="/api")
app.include_router(quality_checks.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(purchase_orders.router, prefix="/api")
app.include_router(suppliers.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(bom.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "MRP API is running"}