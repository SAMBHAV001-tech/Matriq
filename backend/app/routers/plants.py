from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.plant import Plant
from ..schemas.plant import PlantResponse, PlantCreate

router = APIRouter()

@router.get("/", response_model=List[PlantResponse])
def get_plants(db: Session = Depends(get_db)):
    return db.query(Plant).all()

@router.get("/{plant_id}", response_model=PlantResponse)
def get_plant(plant_id: int, db: Session = Depends(get_db)):
    db_obj = db.query(Plant).filter(Plant.id == plant_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Plant not found")
    return db_obj

@router.post("/", response_model=PlantResponse)
def create_plant(plant: PlantCreate, db: Session = Depends(get_db)):
    db_obj = Plant(**plant.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
