from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.inventory import InventoryRecord
from ..schemas.inventory import InventoryRecordResponse, InventoryRecordCreate, InventoryRecordUpdate

router = APIRouter()

@router.get("/", response_model=List[InventoryRecordResponse])
def get_inventory_records(db: Session = Depends(get_db)):
    return db.query(InventoryRecord).all()

@router.get("/{inventory_id}", response_model=InventoryRecordResponse)
def get_inventory_record(inventory_id: int, db: Session = Depends(get_db)):
    db_obj = db.query(InventoryRecord).filter(InventoryRecord.id == inventory_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return db_obj

@router.post("/", response_model=InventoryRecordResponse)
def create_inventory_record(record: InventoryRecordCreate, db: Session = Depends(get_db)):
    db_obj = InventoryRecord(**record.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.patch("/{inventory_id}", response_model=InventoryRecordResponse)
def update_inventory_record(inventory_id: int, updates: InventoryRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(InventoryRecord).filter(InventoryRecord.id == inventory_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
        
    db.commit()
    db.refresh(db_record)
    return db_record
