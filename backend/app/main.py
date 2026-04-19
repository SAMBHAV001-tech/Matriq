from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .utils.helpers import init_db
from .routers import materials, vendors, plants, inventory, reports, analytics
from .services.seed_service import router as seed_router

# Initialize the DB schema
init_db()

app = FastAPI(title=settings.app_name, description="SAP-inspired Custom ALV Report API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seed_router)
app.include_router(materials.router, prefix="/materials", tags=["Materials"])
app.include_router(vendors.router, prefix="/vendors", tags=["Vendors"])
app.include_router(plants.router, prefix="/plants", tags=["Plants"])
app.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.get("/", tags=["Base"])
def read_root():
    return {"message": f"Welcome to {settings.app_name} API"}

@app.get("/health", tags=["Base"])
def health_check():
    return {"status": "ok", "db": "configured via Supabase"}
