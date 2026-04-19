from pydantic import BaseModel

class VendorBase(BaseModel):
    vendor_code: str
    vendor_name: str
    city: str
    country: str
    rating: float

class VendorCreate(VendorBase):
    pass

class VendorResponse(VendorBase):
    id: int
    
    class Config:
        from_attributes = True
