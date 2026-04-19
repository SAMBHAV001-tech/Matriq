from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..schemas.report import ALVReportRow, ALVSummary
from ..schemas.alert import AlertResponse
from ..models.alert import Alert
from ..services import report_service

router = APIRouter()

@router.get("/alv", response_model=List[ALVReportRow])
def get_alv_report(
    plant_code: Optional[str] = None,
    vendor_code: Optional[str] = None,
    material_group: Optional[str] = None,
    stock_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return report_service.generate_alv_report(
        db=db,
        plant_code=plant_code,
        vendor_code=vendor_code,
        material_group=material_group,
        stock_status=stock_status,
        search=search
    )

@router.get("/alv/summary", response_model=ALVSummary)
def get_alv_summary(db: Session = Depends(get_db)):
    return report_service.generate_alv_summary(db)

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    # Returns all alerts sorted by most recent
    return db.query(Alert).order_by(Alert.created_at.desc()).all()
