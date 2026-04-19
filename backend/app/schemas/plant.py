from pydantic import BaseModel

class PlantBase(BaseModel):
    plant_code: str
    plant_name: str
    location: str

class PlantCreate(PlantBase):
    pass

class PlantResponse(PlantBase):
    id: int
    
    class Config:
        from_attributes = True
