from ..database import engine, Base
from ..models import material, vendor, plant, inventory, movement, alert

def init_db():
    # Make sure all models are imported so Base metadata collects them
    Base.metadata.create_all(bind=engine)
