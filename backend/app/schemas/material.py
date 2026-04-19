from pydantic import BaseModel
from typing import Optional

class MaterialBase(BaseModel):
    material_code: str
    material_name: str
    material_group: str
    base_unit: str
    reorder_level: int
    unit_price: float

class MaterialCreate(MaterialBase):
    pass

class MaterialResponse(MaterialBase):
    id: int
    
    class Config:
        from_attributes = True
