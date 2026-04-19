from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.material import Material
from ..schemas.material import MaterialResponse, MaterialCreate

router = APIRouter()

@router.get("/", response_model=List[MaterialResponse])
def get_materials(db: Session = Depends(get_db)):
    return db.query(Material).all()

@router.get("/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db)):
    db_obj = db.query(Material).filter(Material.id == material_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Material not found")
    return db_obj

@router.post("/", response_model=MaterialResponse)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    db_obj = Material(**material.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
