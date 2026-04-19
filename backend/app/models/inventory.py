from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from ..database import Base

class InventoryRecord(Base):
    __tablename__ = "inventory_records"
    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    plant_id = Column(Integer, ForeignKey("plants.id"))
    storage_location = Column(String)
    current_stock = Column(Integer)
    monthly_consumption = Column(Integer)
    last_gr_date = Column(DateTime, nullable=True)
