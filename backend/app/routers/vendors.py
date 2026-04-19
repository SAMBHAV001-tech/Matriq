from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.vendor import Vendor
from ..schemas.vendor import VendorResponse, VendorCreate

router = APIRouter()

@router.get("/", response_model=List[VendorResponse])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()

@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    db_obj = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return db_obj

@router.post("/", response_model=VendorResponse)
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    db_obj = Vendor(**vendor.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
