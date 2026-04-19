from sqlalchemy import Column, Integer, String, Float
from ..database import Base

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    vendor_code = Column(String, unique=True, index=True)
    vendor_name = Column(String)
    city = Column(String)
    country = Column(String)
    rating = Column(Float)
