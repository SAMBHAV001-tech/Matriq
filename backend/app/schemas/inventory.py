from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InventoryRecordBase(BaseModel):
    material_id: int
    vendor_id: int
    plant_id: int
    storage_location: str
    current_stock: int
    monthly_consumption: int
    last_gr_date: Optional[datetime] = None

class InventoryRecordCreate(InventoryRecordBase):
    pass

class InventoryRecordUpdate(BaseModel):
    storage_location: Optional[str] = None
    current_stock: Optional[int] = None
    monthly_consumption: Optional[int] = None
    last_gr_date: Optional[datetime] = None

class InventoryRecordResponse(InventoryRecordBase):
    id: int
    
    class Config:
        from_attributes = True
