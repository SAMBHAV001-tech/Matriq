from sqlalchemy import Column, Integer, String, Float
from ..database import Base

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    material_code = Column(String, unique=True, index=True)
    material_name = Column(String)
    material_group = Column(String)
    base_unit = Column(String)
    reorder_level = Column(Integer)
    unit_price = Column(Float)
