from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from app.models.database import Base, Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, relationship

# ====================================================
# SQLALCHEMY RELATIONAL MODELS (PostgreSQL)
# ====================================================

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # super_admin, farmer, technician, agronomist
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Farm(Base):
    __tablename__ = "farms"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_area_hectares = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    zones = relationship("Zone", back_populates="farm", cascade="all, delete-orphan")

class Zone(Base):
    __tablename__ = "zones"
    id = Column(String, primary_key=True, index=True)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    name = Column(String, nullable=False) # Zone Alpha, Zone Beta...
    soil_type = Column(String, nullable=False)
    boundary_polygon = Column(JSON, nullable=True) # GeoJSON coordinates
    farm = relationship("Farm", back_populates="zones")
    trees = relationship("Tree", back_populates="zone", cascade="all, delete-orphan")

class Tree(Base):
    __tablename__ = "trees"
    id = Column(String, primary_key=True, index=True)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=False)
    row_number = Column(Integer, nullable=False)
    tree_number = Column(Integer, nullable=False)
    planted_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="healthy") # healthy, dry, diseased, low_nutrient
    zone = relationship("Zone", back_populates="trees")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True, index=True)
    tree_id = Column(String, nullable=True)
    zone_name = Column(String, nullable=False)
    type = Column(String, nullable=False) # soil_moisture_low, pest_detected, battery_low, comm_loss
    severity = Column(String, nullable=False) # critical, warning, info
    message = Column(Text, nullable=False)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class IrrigationLog(Base):
    __tablename__ = "irrigation_logs"
    id = Column(String, primary_key=True, index=True)
    zone_name = Column(String, nullable=False)
    valve_id = Column(String, nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    volume_liters = Column(Float, nullable=False)
    mode = Column(String, nullable=False) # manual, scheduled, AI

class Device(Base):
    __tablename__ = "devices"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # ESP32, LoRa Node, Gateway
    status = Column(String, default="online") # online, offline
    battery = Column(Integer, default=100) # percentage
    signal = Column(Integer, default=-65) # RSSI dBm
    firmware_version = Column(String, default="1.0.0")
    last_seen = Column(DateTime, default=datetime.utcnow)

# ====================================================
# PYDANTIC SCHEMAS (Request & Response validation)
# ====================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "farmer" # super_admin, farmer, technician, agronomist
    full_name: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# IoT Sensor Data Schemas
class SensorReadingCreate(BaseModel):
    node_id: str
    zone_name: str
    soil_moisture: float
    soil_temp: float
    ph: float
    ec: float
    nitrogen: float
    phosphorus: float
    potassium: float
    humidity: float
    rainfall: float
    wind_speed: float
    solar_radiation: float
    battery_mv: int
    rssi: int

class DeviceControl(BaseModel):
    device_id: str
    action: str # reboot, update_firmware

class IrrigationControl(BaseModel):
    zone_name: str
    action: str # open, close
    mode: str # manual, auto, AI
    duration_minutes: Optional[int] = None

class FertigationControl(BaseModel):
    zone_name: str
    action: str # start, stop
    n_ratio: float
    p_ratio: float
    k_ratio: float
    flow_rate: float # L/min

class AlertCreate(BaseModel):
    tree_id: Optional[str] = None
    zone_name: str
    type: str
    severity: str
    message: str

class AlertResponse(BaseModel):
    id: str
    tree_id: Optional[str]
    zone_name: str
    type: str
    severity: str
    message: str
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AIRecommendationResponse(BaseModel):
    recommendation_id: str
    zone_name: str
    type: str # irrigation, NPK, pest_spray
    message: str
    confidence: float # percentage 0-1
    model_used: str # XGBoost, LSTM, YOLOv8, etc.
    shap_values: Dict[str, float] # Feature importances for XAI
    timestamp: datetime
