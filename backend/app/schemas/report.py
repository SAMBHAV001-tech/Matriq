from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class ALVReportRow(BaseModel):
    material_id: Optional[int] = None
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

class ContributingFactor(BaseModel):
    factor: str
    weight: Optional[float] = None
    value: Optional[Any] = None
    impact: Optional[str] = None

class RiskScoreResponse(BaseModel):
    material_id: int
    material_code: Optional[str] = None
    material_name: Optional[str] = None
    risk_score: float
    risk_label: str
    contributing_factors: Optional[List[ContributingFactor]] = None
    interpretation: Optional[str] = None
    recommendations: Optional[List[str]] = None

class ReorderRecommendation(BaseModel):
    material_id: Optional[int] = None
    material_code: str
    material_name: str
    material_group: Optional[str] = None
    vendor_code: Optional[str] = None
    vendor_name: Optional[str] = None
    plant_code: Optional[str] = None
    plant_name: Optional[str] = None
    current_stock: int
    reorder_level: Optional[int] = None
    monthly_consumption: int
    recommended_reorder_qty: int
    risk_score: Optional[float] = None
    risk_label: Optional[str] = None
    reason: Optional[str] = None
