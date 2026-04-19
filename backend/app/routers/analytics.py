from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.report import RiskScoreResponse, ReorderRecommendation
from ..services import analytics_service

router = APIRouter()

@router.get("/reorder-recommendations", response_model=List[ReorderRecommendation])
def get_reorder_recommendations(db: Session = Depends(get_db)):
    return analytics_service.get_all_reorder_recommendations(db)

@router.get("/material-risk/{material_id}", response_model=RiskScoreResponse)
def get_material_risk(material_id: int, db: Session = Depends(get_db)):
    score_data = analytics_service.calculate_material_risk(db, material_id)
    if not score_data:
        raise HTTPException(status_code=404, detail="Material or Inventory record not found")
    return score_data
