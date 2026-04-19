from pydantic import BaseModel
from datetime import datetime

class AlertBase(BaseModel):
    material_id: int
    alert_type: str
    severity: str
    message: str

class AlertResponse(AlertBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
