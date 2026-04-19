from sqlalchemy.orm import Session
from ..models.material import Material
from ..models.vendor import Vendor
from ..models.plant import Plant
from ..models.inventory import InventoryRecord
from .analytics_service import get_stock_status, calculate_reorder_qty, get_risk_score

def generate_alv_report(
    db: Session,
    plant_code: str = None,
    vendor_code: str = None,
    material_group: str = None,
    stock_status: str = None,
    search: str = None
):
    query = db.query(InventoryRecord, Material, Vendor, Plant) \
        .join(Material, InventoryRecord.material_id == Material.id) \
        .join(Vendor, InventoryRecord.vendor_id == Vendor.id) \
        .join(Plant, InventoryRecord.plant_id == Plant.id)

    if plant_code:
        query = query.filter(Plant.plant_code == plant_code)
    if vendor_code:
        query = query.filter(Vendor.vendor_code == vendor_code)
    if material_group:
        query = query.filter(Material.material_group == material_group)
    if search:
        query = query.filter(Material.material_name.ilike(f"%{search}%"))

    results = query.all()
    report = []

    for record, material, vendor, plant in results:
        status = get_stock_status(record.current_stock, material.reorder_level)
        
        # Apply stock_status filter inside Python layer if passed, since it's dynamic
        if stock_status and status != stock_status:
            continue
            
        reorder_qty = calculate_reorder_qty(record.current_stock, record.monthly_consumption)
        risk = get_risk_score(record, material, vendor)

        report.append({
            "material_code": material.material_code,
            "material_name": material.material_name,
            "material_group": material.material_group,
            "vendor_code": vendor.vendor_code,
            "vendor_name": vendor.vendor_name,
            "plant_code": plant.plant_code,
            "plant_name": plant.plant_name,
            "storage_location": record.storage_location,
            "current_stock": record.current_stock,
            "reorder_level": material.reorder_level,
            "unit_price": material.unit_price,
            "monthly_consumption": record.monthly_consumption,
            "last_gr_date": record.last_gr_date,
            "stock_status": status,
            "recommended_reorder_qty": reorder_qty,
            "risk_score": risk["score"],
            "risk_label": risk["label"]
        })
        
    return report

def generate_alv_summary(db: Session):
    records = db.query(InventoryRecord).all()
    
    total_materials = len(records)
    healthy, low, critical, out_of_stock = 0, 0, 0, 0
    total_value = 0.0
    
    for record in records:
        material = db.query(Material).filter(Material.id == record.material_id).first()
        if material:
            status = get_stock_status(record.current_stock, material.reorder_level)
            if status == "OUT_OF_STOCK":
                out_of_stock += 1
            elif status == "CRITICAL":
                critical += 1
            elif status == "LOW":
                low += 1
            else:
                healthy += 1
                
            total_value += record.current_stock * material.unit_price

    return {
        "total_materials": total_materials,
        "healthy_count": healthy,
        "low_count": low,
        "critical_count": critical,
        "out_of_stock_count": out_of_stock,
        "total_inventory_value": total_value
    }
