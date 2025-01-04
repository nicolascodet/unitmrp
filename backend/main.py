from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import parts, production_runs, quality_checks

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(parts.router)
app.include_router(production_runs.router)
app.include_router(quality_checks.router)

@app.get("/")
async def root():
    return {"message": "MRP System API"} 