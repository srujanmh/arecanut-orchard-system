from datetime import datetime, timedelta
import random
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.database import get_db, get_mongo_db, Session
from app.models.schemas import SensorReadingCreate, Device, Alert
from app.auth import get_current_user

router = APIRouter(prefix="/sensors", tags=["Sensors & IoT"])

# Store active live readings in-memory for the simulator (fallback if InfluxDB is not running)
LIVE_READINGS_CACHE: Dict[str, Dict[str, Any]] = {}

def get_simulated_live_data(zone_name: str) -> Dict[str, Any]:
    # Ensure stable values that drift slightly
    base = {
        "Zone Alpha": {"moisture": 38.5, "temp": 24.2, "ph": 6.2, "ec": 1.2, "n": 42.0, "p": 18.0, "k": 32.0},
        "Zone Beta": {"moisture": 28.1, "temp": 26.5, "ph": 5.8, "ec": 1.5, "n": 38.0, "p": 14.0, "k": 28.0},
        "Zone Gamma": {"moisture": 42.0, "temp": 23.1, "ph": 6.5, "ec": 1.1, "n": 45.0, "p": 20.0, "k": 35.0},
        "Zone Delta": {"moisture": 19.5, "temp": 28.0, "ph": 6.8, "ec": 1.8, "n": 30.0, "p": 10.0, "k": 22.0},
    }
    
    vals = base.get(zone_name, base["Zone Alpha"]).copy()
    drift = lambda x, scale: round(x + random.uniform(-scale, scale), 2)
    
    # Calculate values
    moisture = max(0.0, min(100.0, drift(vals["moisture"], 0.8)))
    temp = drift(vals["temp"], 0.3)
    ph = max(4.0, min(9.0, drift(vals["ph"], 0.05)))
    ec = max(0.1, min(5.0, drift(vals["ec"], 0.05)))
    n = max(0.0, drift(vals["n"], 0.5))
    p = max(0.0, drift(vals["p"], 0.2))
    k = max(0.0, drift(vals["k"], 0.4))
    
    humidity = round(65.0 + random.uniform(-5, 5), 1)
    rainfall = round(max(0.0, random.choices([0.0, 1.2, 8.5], weights=[80, 15, 5])[0] + random.uniform(-0.2, 0.5)), 2)
    wind_speed = round(12.5 + random.uniform(-3, 3), 1)
    solar_rad = round(450.0 + random.uniform(-50, 50) if 6 <= datetime.now().hour <= 18 else 0.0, 1)
    
    return {
        "zone_name": zone_name,
        "soil_moisture": moisture,
        "soil_temp": temp,
        "ph": ph,
        "ec": ec,
        "nitrogen": n,
        "phosphorus": p,
        "potassium": k,
        "humidity": humidity,
        "rainfall": rainfall,
        "wind_speed": wind_speed,
        "solar_radiation": solar_rad,
        "battery_mv": random.randint(3100, 4200),
        "rssi": random.randint(-85, -50),
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/reading")
def post_sensor_reading(reading: SensorReadingCreate, db: Session = Depends(get_db)):
    # 1. Update in-memory state
    LIVE_READINGS_CACHE[reading.zone_name] = reading.model_dump()
    
    # 2. Update Device state (last seen, battery, signal)
    device = db.query(Device).filter(Device.id == reading.node_id).first()
    if device:
        device.last_seen = datetime.utcnow()
        device.battery = int((reading.battery_mv - 3000) / 1200 * 100)
        device.battery = max(0, min(100, device.battery))
        device.signal = reading.rssi
        db.commit()
    
    # 3. Time Series insertion: In a full setup, write to InfluxDB here.
    # For simulation, we log to MongoDB under "sensor_history" if available
    try:
        mongo_db = get_mongo_db()
        mongo_db.sensor_history.insert_one({
            **reading.model_dump(),
            "timestamp": datetime.utcnow()
        })
    except Exception:
        pass # Ignore db errors if MongoDB not running
        
    return {"status": "success", "message": "Reading recorded."}

@router.get("/live")
def get_live_sensors(zone_name: Optional[str] = None):
    zones = ["Zone Alpha", "Zone Beta", "Zone Gamma", "Zone Delta"]
    if zone_name:
        if zone_name not in zones:
            raise HTTPException(status_code=400, detail="Invalid zone name")
        # Return live reading (simulated)
        if zone_name in LIVE_READINGS_CACHE:
            return LIVE_READINGS_CACHE[zone_name]
        return get_simulated_live_data(zone_name)
    
    # Return all zones
    return {z: (LIVE_READINGS_CACHE[z] if z in LIVE_READINGS_CACHE else get_simulated_live_data(z)) for z in zones}

@router.get("/history")
def get_sensor_history(zone_name: str, duration_hours: int = 24):
    # Generates mock historic time-series data for chart rendering
    now = datetime.utcnow()
    points = []
    
    # Base configuration based on zone
    base_m = 35.0 if "Alpha" in zone_name else (28.0 if "Beta" in zone_name else (42.0 if "Gamma" in zone_name else 18.0))
    base_t = 24.0
    
    for i in range(duration_hours):
        time_pt = now - timedelta(hours=(duration_hours - i))
        # Add cyclic patterns (temperature hot in afternoon, cool at night)
        hour_factor = math_hour_factor(time_pt.hour)
        temp = round(base_t + hour_factor + random.uniform(-0.5, 0.5), 1)
        # Soil moisture slowly depletes unless rain/irrigation
        moisture = round(base_m - (i * 0.1) % 5 + random.uniform(-0.2, 0.2), 1)
        
        points.append({
            "timestamp": time_pt.isoformat(),
            "soil_moisture": moisture,
            "soil_temp": temp,
            "ph": round(6.2 + random.uniform(-0.1, 0.1), 2),
            "ec": round(1.2 + random.uniform(-0.05, 0.05), 2),
            "nitrogen": round(40.0 + random.uniform(-1, 1), 1),
            "phosphorus": round(15.0 + random.uniform(-0.5, 0.5), 1),
            "potassium": round(30.0 + random.uniform(-0.8, 0.8), 1),
        })
    return points

def math_hour_factor(hour: int) -> float:
    # Warmest around 14:00 (2 PM), coolest around 5:00 AM
    if 5 <= hour <= 14:
        return (hour - 5) / 9 * 6.0
    elif 14 < hour <= 23:
        return 6.0 - (hour - 14) / 9 * 5.0
    else:
        # Midnight to 5 AM
        return 1.0 - (hour / 5) * 1.0
