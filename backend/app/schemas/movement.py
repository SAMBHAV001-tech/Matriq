from pydantic import BaseModel
from datetime import datetime

class StockMovementBase(BaseModel):
    material_id: int
    movement_type: str
    quantity: int
    reference_doc: str

class StockMovementCreate(StockMovementBase):
    pass

class StockMovementResponse(StockMovementBase):
    id: int
    posting_date: datetime
    
    class Config:
        from_attributes = True
