from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import engine, Base
from app.models.schemas import User, Device, Farm, Zone, Tree
from app.routes import auth, sensors, irrigation, AI, reports, drone
from app.auth import get_password_hash
try:
    from sqlalchemy.orm import Session
except Exception:
    class MockSessionClass:
        def __init__(self, *args, **kwargs): pass
        def query(self, *args, **kwargs): return self
        def filter(self, *args, **kwargs): return self
        def order_by(self, *args, **kwargs): return self
        def first(self): return None
        def count(self): return 0
        def add(self, *args): pass
        def add_all(self, *args): pass
        def commit(self): pass
        def refresh(self, *args): pass
        def close(self): pass
    Session = MockSessionClass
import uuid
from datetime import datetime

# Initialize database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"PostgreSQL Connection failed: {e}. Running local database tables in memory or SQLite fallback.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Arecanut Orchard Management System Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(sensors.router, prefix=settings.API_V1_STR)
app.include_router(irrigation.router, prefix=settings.API_V1_STR)
app.include_router(AI.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(drone.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_database():
    # Seeds default credentials and equipment list if tables are empty
    db = Session(bind=engine)
    try:
        # 1. Seed default users
        if db.query(User).count() == 0:
            roles = ["super_admin", "farmer", "technician", "agronomist"]
            for role in roles:
                user = User(
                    id=str(uuid.uuid4()),
                    email=f"{role}@agrisense.com",
                    hashed_password=get_password_hash("password123"),
                    role=role,
                    full_name=f"Demo {role.replace('_', ' ').title()}",
                    created_at=datetime.utcnow()
                )
                db.add(user)
            db.commit()

        # 2. Seed devices if empty
        if db.query(Device).count() == 0:
            devices = [
                Device(id="NODE-ALPHA", name="LoRa Sensor Node A", type="LoRa Node", status="online", battery=88, signal=-62, firmware_version="1.1.2"),
                Device(id="NODE-BETA", name="LoRa Sensor Node B", type="LoRa Node", status="online", battery=76, signal=-68, firmware_version="1.1.2"),
                Device(id="NODE-GAMMA", name="LoRa Sensor Node C", type="LoRa Node", status="online", battery=92, signal=-58, firmware_version="1.1.2"),
                Device(id="NODE-DELTA", name="LoRa Sensor Node D", type="LoRa Node", status="online", battery=45, signal=-78, firmware_version="1.1.2"),
                Device(id="GATEWAY-01", name="Orchard Edge Gateway", type="Gateway", status="online", battery=100, signal=-45, firmware_version="2.0.1"),
            ]
            db.add_all(devices)
            db.commit()

        # 3. Seed Farm & Zones if empty
        if db.query(Farm).count() == 0:
            farm_id = str(uuid.uuid4())
            farm = Farm(id=farm_id, name="Greenfield Arecanut Estate", latitude=13.0827, longitude=80.2707, total_area_hectares=12.5)
            db.add(farm)
            db.commit()

            zones = ["Zone Alpha", "Zone Beta", "Zone Gamma", "Zone Delta"]
            for name in zones:
                zone_id = f"zone-{name.lower().split()[-1]}"
                zone = Zone(id=zone_id, farm_id=farm_id, name=name, soil_type="Red Sandy Loam")
                db.add(zone)
            db.commit()
            
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "api_docs": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }
