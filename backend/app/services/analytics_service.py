from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..models.material import Material
from ..models.vendor import Vendor
from ..models.inventory import InventoryRecord

def get_stock_status(current_stock: int, reorder_level: int) -> str:
    """Returns lowercase stock status matching frontend StockStatus type."""
    if current_stock == 0:
        return "out_of_stock"
    if current_stock < (0.5 * reorder_level):
        return "critical"
    if current_stock < reorder_level:
        return "low"
    return "healthy"

def calculate_reorder_qty(current_stock: int, monthly_consumption: int) -> int:
    qty = (monthly_consumption * 2) - current_stock
    return max(qty, 0)

def get_risk_score(record: InventoryRecord, material: Material, vendor: Vendor) -> dict:
    """Returns risk_score / risk_label (lowercase) matching frontend RiskLabel type."""
    score = 0.0
    contributing = []

    # 1. Stock shortage (0-40 points)
    if record.current_stock == 0:
        score += 40
        contributing.append({"factor": "Out of stock", "weight": 0.40, "value": 0, "impact": "negative"})
    elif record.current_stock < material.reorder_level:
        shortage_ratio = (material.reorder_level - record.current_stock) / material.reorder_level
        pts = 40 * shortage_ratio
        score += pts
        contributing.append({"factor": "Below reorder level", "weight": round(pts / 100, 2),
                              "value": f"{record.current_stock} / {material.reorder_level}", "impact": "negative"})
    else:
        contributing.append({"factor": "Stock level healthy", "weight": 0.0,
                              "value": f"{record.current_stock} / {material.reorder_level}", "impact": "positive"})

    # 2. Consumption rate risk (0-20 points)
    if record.monthly_consumption > 0 and record.current_stock > 0:
        months_of_stock = record.current_stock / record.monthly_consumption
        if months_of_stock < 1:
            pts = 20 * (1 - months_of_stock)
            score += pts
            contributing.append({"factor": "Low months-of-stock coverage", "weight": round(pts / 100, 2),
                                  "value": f"{months_of_stock:.1f} months", "impact": "negative"})
        else:
            contributing.append({"factor": "Adequate consumption coverage", "weight": 0.0,
                                  "value": f"{months_of_stock:.1f} months", "impact": "positive"})

    # 3. Days since last GR (0-20 points)
    if record.last_gr_date:
        now_dt = datetime.now()
        if record.last_gr_date.tzinfo:
            now_dt = datetime.now(timezone.utc)
        days_since_gr = (now_dt - record.last_gr_date).days
        if days_since_gr > 30:
            pts = min(20, (days_since_gr - 30) * 0.5)
            score += pts
            contributing.append({"factor": "Overdue goods receipt", "weight": round(pts / 100, 2),
                                  "value": f"{days_since_gr} days since last GR", "impact": "negative"})
        else:
            contributing.append({"factor": "Recent goods receipt", "weight": 0.0,
                                  "value": f"{days_since_gr} days since last GR", "impact": "positive"})

    # 4. Vendor rating risk (0-20 points)
    if vendor and vendor.rating < 5.0:
        rating_risk = ((5.0 - vendor.rating) / 5.0) * 20
        score += rating_risk
        contributing.append({"factor": "Vendor rating risk", "weight": round(rating_risk / 100, 2),
                              "value": f"{vendor.rating}/5.0", "impact": "negative"})
    elif vendor:
        contributing.append({"factor": "Top-rated vendor", "weight": 0.0,
                              "value": f"{vendor.rating}/5.0", "impact": "positive"})

    score = min(100.0, score)

    # risk_label uses lowercase to match frontend RiskLabel type
    risk_label = "low"
    if score >= 70:
        risk_label = "critical"
    elif score >= 50:
        risk_label = "high"
    elif score >= 25:
        risk_label = "medium"

    return {
        "risk_score": round(score, 2),
        "risk_label": risk_label,
        "contributing_factors": contributing,
    }

def get_all_reorder_recommendations(db: Session) -> list:
    records = db.query(InventoryRecord).all()
    recommendations = []

    for record in records:
        material = db.query(Material).filter(Material.id == record.material_id).first()
        if not material:
            continue
        qty = calculate_reorder_qty(record.current_stock, record.monthly_consumption)

        if qty > 0:
            vendor = db.query(Vendor).filter(Vendor.id == record.vendor_id).first()
            from ..models.plant import Plant
            plant = db.query(Plant).filter(Plant.id == record.plant_id).first()
            risk = get_risk_score(record, material, vendor)
            recommendations.append({
                "material_id": record.material_id,
                "material_code": material.material_code,
                "material_name": material.material_name,
                "material_group": material.material_group,
                "vendor_code": vendor.vendor_code if vendor else None,
                "vendor_name": vendor.vendor_name if vendor else None,
                "plant_code": plant.plant_code if plant else None,
                "plant_name": plant.plant_name if plant else None,
                "current_stock": record.current_stock,
                "reorder_level": material.reorder_level,
                "monthly_consumption": record.monthly_consumption,
                "recommended_reorder_qty": qty,
                "risk_score": risk["risk_score"],
                "risk_label": risk["risk_label"],
                "reason": f"Stock ({record.current_stock}) below 2x monthly consumption ({record.monthly_consumption})",
            })

    return recommendations

def calculate_material_risk(db: Session, material_id: int) -> dict:
    record = db.query(InventoryRecord).filter(InventoryRecord.material_id == material_id).first()
    if not record:
        return None

    material = db.query(Material).filter(Material.id == record.material_id).first()
    vendor = db.query(Vendor).filter(Vendor.id == record.vendor_id).first()

    risk = get_risk_score(record, material, vendor)
    score = risk["risk_score"]
    risk_label = risk["risk_label"]

    # Build a human-readable interpretation
    if score >= 70:
        interpretation = (f"{material.material_name} is at critical risk. "
                          "Immediate restocking and vendor review are strongly recommended.")
    elif score >= 50:
        interpretation = (f"{material.material_name} carries high risk. "
                          "Consider prioritising reorder actions before stock runs out.")
    elif score >= 25:
        interpretation = (f"{material.material_name} is at moderate risk. "
                          "Monitor stock levels closely over the next few weeks.")
    else:
        interpretation = (f"{material.material_name} is in a healthy state. "
                          "No immediate action required, but continue routine monitoring.")

    # Actionable recommendations based on score
    recommendations = []
    if record.current_stock == 0:
        recommendations.append("Raise an emergency purchase order immediately.")
    elif record.current_stock < material.reorder_level:
        recommendations.append("Initiate a reorder — stock is below the reorder threshold.")
    if vendor and vendor.rating < 3.0:
        recommendations.append("Evaluate alternative vendors with a higher reliability rating.")
    if record.monthly_consumption > 0:
        months_left = record.current_stock / record.monthly_consumption
        if months_left < 1:
            recommendations.append(f"Stock will last less than 1 month at current consumption ({record.monthly_consumption} units/month).")
    if not recommendations:
        recommendations.append("Maintain current replenishment schedule.")

    return {
        "material_id": material_id,
        "material_code": material.material_code if material else None,
        "material_name": material.material_name if material else None,
        "risk_score": score,
        "risk_label": risk_label,
        "contributing_factors": risk["contributing_factors"],
        "interpretation": interpretation,
        "recommendations": recommendations,
    }
