from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..models.material import Material
from ..models.vendor import Vendor
from ..models.plant import Plant
from ..models.inventory import InventoryRecord
from ..models.alert import Alert

router = APIRouter()

@router.post("/seed", tags=["Seed"])
def seed_database(db: Session = Depends(get_db), force: bool = False):
    if db.query(Material).first() and not force:
        return {"message": "Database already seeded. Use ?force=true to reseed."}

    if force:
        db.query(Alert).delete()
        db.query(InventoryRecord).delete()
        db.query(Material).delete()
        db.query(Vendor).delete()
        db.query(Plant).delete()
        db.commit()

    # Realistic Seed Data
    materials = [
        Material(material_code="MAT-100", material_name="Steel Rod", material_group="RAW", base_unit="KG", reorder_level=500, unit_price=2.50),
        Material(material_code="MAT-101", material_name="Copper Wire", material_group="RAW", base_unit="M", reorder_level=1000, unit_price=1.20),
        Material(material_code="MAT-102", material_name="Lubricant Oil", material_group="CONS", base_unit="L", reorder_level=200, unit_price=15.00),
        Material(material_code="MAT-103", material_name="Packing Box", material_group="PACK", base_unit="PC", reorder_level=5000, unit_price=0.50),
        Material(material_code="MAT-104", material_name="Plastic Granules", material_group="RAW", base_unit="KG", reorder_level=800, unit_price=3.00),
        Material(material_code="MAT-105", material_name="Circuit Board", material_group="ELEC", base_unit="PC", reorder_level=100, unit_price=45.00),
        Material(material_code="MAT-106", material_name="Motor Shaft", material_group="COMP", base_unit="PC", reorder_level=50, unit_price=120.00),
        Material(material_code="MAT-107", material_name="Industrial Tape", material_group="CONS", base_unit="ROLL", reorder_level=300, unit_price=5.00),
        Material(material_code="MAT-108", material_name="Sensor Module", material_group="ELEC", base_unit="PC", reorder_level=60, unit_price=85.00),
        Material(material_code="MAT-109", material_name="Aluminum Heat Sink", material_group="COMP", base_unit="PC", reorder_level=150, unit_price=12.00),
    ]
    db.add_all(materials)
    db.commit()

    vendors = [
        Vendor(vendor_code="VEND-001", vendor_name="Global Metals Ltd", city="New York", country="USA", rating=4.8),
        Vendor(vendor_code="VEND-002", vendor_name="ElectroTech Supplies", city="Berlin", country="Germany", rating=3.5),
        Vendor(vendor_code="VEND-003", vendor_name="PetroLube Global", city="Houston", country="USA", rating=4.2),
        Vendor(vendor_code="VEND-004", vendor_name="PackRight Corp", city="Toronto", country="Canada", rating=4.9),
        Vendor(vendor_code="VEND-005", vendor_name="SinoPlast Ind", city="Shanghai", country="China", rating=3.9),
    ]
    db.add_all(vendors)
    db.commit()

    plants = [
        Plant(plant_code="PL-1000", plant_name="Main Assembly Plant", location="Chicago"),
        Plant(plant_code="PL-2000", plant_name="Secondary Electronics Plant", location="Austin"),
    ]
    db.add_all(plants)
    db.commit()

    now = datetime.now()
    
    # Inventory records for ALL 10 materials — mix of statuses
    records = [
        InventoryRecord(material_id=materials[0].id, vendor_id=vendors[0].id, plant_id=plants[0].id, storage_location="SLOC-01", current_stock=600,  monthly_consumption=200, last_gr_date=now - timedelta(days=10)),   # Healthy
        InventoryRecord(material_id=materials[1].id, vendor_id=vendors[1].id, plant_id=plants[1].id, storage_location="SLOC-02", current_stock=0,    monthly_consumption=500, last_gr_date=now - timedelta(days=120)),  # Out of Stock
        InventoryRecord(material_id=materials[2].id, vendor_id=vendors[2].id, plant_id=plants[0].id, storage_location="SLOC-01", current_stock=180,  monthly_consumption=100, last_gr_date=now - timedelta(days=45)),   # Low
        InventoryRecord(material_id=materials[3].id, vendor_id=vendors[3].id, plant_id=plants[0].id, storage_location="SLOC-03", current_stock=6500, monthly_consumption=1000, last_gr_date=now - timedelta(days=5)),   # Healthy
        InventoryRecord(material_id=materials[4].id, vendor_id=vendors[4].id, plant_id=plants[1].id, storage_location="SLOC-04", current_stock=200,  monthly_consumption=300, last_gr_date=now - timedelta(days=20)),   # Low
        InventoryRecord(material_id=materials[5].id, vendor_id=vendors[1].id, plant_id=plants[1].id, storage_location="SLOC-E1", current_stock=40,   monthly_consumption=80,  last_gr_date=now - timedelta(days=60)),   # Critical
        InventoryRecord(material_id=materials[6].id, vendor_id=vendors[0].id, plant_id=plants[0].id, storage_location="SLOC-05", current_stock=0,    monthly_consumption=20,  last_gr_date=now - timedelta(days=90)),   # Out of Stock
        InventoryRecord(material_id=materials[7].id, vendor_id=vendors[2].id, plant_id=plants[0].id, storage_location="SLOC-06", current_stock=400,  monthly_consumption=80,  last_gr_date=now - timedelta(days=15)),   # Healthy
        InventoryRecord(material_id=materials[8].id, vendor_id=vendors[1].id, plant_id=plants[1].id, storage_location="SLOC-E2", current_stock=30,   monthly_consumption=40,  last_gr_date=now - timedelta(days=50)),   # Critical
        InventoryRecord(material_id=materials[9].id, vendor_id=vendors[0].id, plant_id=plants[0].id, storage_location="SLOC-07", current_stock=220,  monthly_consumption=60,  last_gr_date=now - timedelta(days=8)),    # Healthy
    ]
    db.add_all(records)
    db.commit()

    alerts = [
        Alert(material_id=materials[1].id, alert_type="OUT_OF_STOCK", severity="CRITICAL", message="Copper Wire is completely out of stock!"),
        Alert(material_id=materials[5].id, alert_type="STOCK_CRITICAL", severity="HIGH", message="Circuit board stock is critically low. Production delay risk."),
    ]
    db.add_all(alerts)
    db.commit()

    return {"message": "Supabase PostgreSQL Database successfully seeded with diverse realistic SAP data."}
