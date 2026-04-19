from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from ..database import Base

class StockMovement(Base):
    __tablename__ = "stock_movements"
    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"))
    movement_type = Column(String)
    quantity = Column(Integer)
    posting_date = Column(DateTime, default=func.now())
    reference_doc = Column(String)
