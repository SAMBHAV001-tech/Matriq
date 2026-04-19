from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ALVReportRow(BaseModel):
    material_code: str
    material_name: str
    material_group: str
    vendor_code: str
    vendor_name: str
    plant_code: str
    plant_name: str
    storage_location: str
    current_stock: int
    reorder_level: int
    unit_price: float
    monthly_consumption: int
    last_gr_date: Optional[datetime] = None
    stock_status: str
    recommended_reorder_qty: int
    risk_score: float
    risk_label: str

class ALVSummary(BaseModel):
    total_materials: int
    healthy_count: int
    low_count: int
    critical_count: int
    out_of_stock_count: int
    total_inventory_value: float

class RiskScoreResponse(BaseModel):
    material_id: int
    score: float
    label: str

class ReorderRecommendation(BaseModel):
    material_code: str
    material_name: str
    current_stock: int
    monthly_consumption: int
    recommended_qty: int
