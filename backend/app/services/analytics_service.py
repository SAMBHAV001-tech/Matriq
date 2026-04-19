from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..models.material import Material
from ..models.vendor import Vendor
from ..models.inventory import InventoryRecord

def get_stock_status(current_stock: int, reorder_level: int) -> str:
    if current_stock == 0:
        return "OUT_OF_STOCK"
    if current_stock < (0.5 * reorder_level):
        return "CRITICAL"
    if current_stock < reorder_level:
        return "LOW"
    return "HEALTHY"

def calculate_reorder_qty(current_stock: int, monthly_consumption: int) -> int:
    qty = (monthly_consumption * 2) - current_stock
    return max(qty, 0)

def get_risk_score(record: InventoryRecord, material: Material, vendor: Vendor) -> dict:
    score = 0.0
    
    # 1. Stock shortage (0-40 points)
    if record.current_stock == 0:
        score += 40
    elif record.current_stock < material.reorder_level:
        shortage_ratio = (material.reorder_level - record.current_stock) / material.reorder_level
        score += 40 * shortage_ratio

    # 2. Consumption rate risk (0-20 points)
    if record.monthly_consumption > 0 and record.current_stock > 0:
        months_of_stock = record.current_stock / record.monthly_consumption
        if months_of_stock < 1:
            score += 20 * (1 - months_of_stock)
    
    # 3. Days since last GR (0-20 points)
    if record.last_gr_date:
        # Convert record to aware datetime if naive, or just assume UTC naive depending on db.
        # But simply subtracting dates is sufficient.
        now_dt = datetime.now()
        # Fallback simplistic subtraction handles most DB mappings gracefully
        # If last_gr_date is timezone aware, we make now aware
        if record.last_gr_date.tzinfo:
            now_dt = datetime.now(timezone.utc)
            
        days_since_gr = (now_dt - record.last_gr_date).days
        if days_since_gr > 30:
            score += min(20, (days_since_gr - 30) * 0.5)
            
    # 4. Vendor rating risk (0-20 points)
    if vendor and vendor.rating < 5.0:
        rating_risk = ((5.0 - vendor.rating) / 5.0) * 20
        score += rating_risk

    score = min(100.0, score)

    label = "LOW"
    if score >= 70:
        label = "HIGH"
    elif score >= 40:
        label = "MEDIUM"

    return {
        "score": round(score, 2),
        "label": label
    }

def get_all_reorder_recommendations(db: Session) -> list:
    records = db.query(InventoryRecord).all()
    recommendations = []
    
    for record in records:
        material = db.query(Material).filter(Material.id == record.material_id).first()
        qty = calculate_reorder_qty(record.current_stock, record.monthly_consumption)
        
        if qty > 0:
            recommendations.append({
                "material_code": material.material_code,
                "material_name": material.material_name,
                "current_stock": record.current_stock,
                "monthly_consumption": record.monthly_consumption,
                "recommended_qty": qty
            })
            
    return recommendations

def calculate_material_risk(db: Session, material_id: int) -> dict:
    record = db.query(InventoryRecord).filter(InventoryRecord.material_id == material_id).first()
    if not record:
        return None
        
    material = db.query(Material).filter(Material.id == record.material_id).first()
    vendor = db.query(Vendor).filter(Vendor.id == record.vendor_id).first()
    
    risk = get_risk_score(record, material, vendor)
    return {
        "material_id": material_id,
        "score": risk["score"],
        "label": risk["label"]
    }
