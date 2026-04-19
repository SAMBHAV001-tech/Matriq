from sqlalchemy import Column, Integer, String
from ..database import Base

class Plant(Base):
    __tablename__ = "plants"
    id = Column(Integer, primary_key=True, index=True)
    plant_code = Column(String, unique=True, index=True)
    plant_name = Column(String)
    location = Column(String)
