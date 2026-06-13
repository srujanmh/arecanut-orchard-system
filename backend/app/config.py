import os
from typing import Optional
from pydantic_settings import BaseSettings

# Manually load .env file if it exists in the backend directory
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(_env_path):
    with open(_env_path, "r", encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _key, _val = _line.split("=", 1)
                _key = _key.strip()
                _val = _val.strip().strip('"').strip("'")
                os.environ[_key] = _val

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agrisense Pro - Arecanut Orchard Management"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "supersecretkeychangeinproduction1234567890!")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Gemini LLM Integration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)

    # Databases
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/arecanut_db")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = "arecanut_orchard"
    
    # InfluxDB
    INFLUXDB_URL: str = os.getenv("INFLUXDB_URL", "http://localhost:8086")
    INFLUXDB_TOKEN: str = os.getenv("INFLUXDB_TOKEN", "my-super-secret-token")
    INFLUXDB_ORG: str = os.getenv("INFLUXDB_ORG", "agrisense")
    INFLUXDB_BUCKET: str = os.getenv("INFLUXDB_BUCKET", "sensor_data")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # IoT & Simulation Settings
    SIMULATION_INTERVAL_SECONDS: int = 5
    NUMBER_OF_ZONES: int = 4
    TREES_PER_ZONE: int = 750  # 3000 total trees

    class Config:
        case_sensitive = True

settings = Settings()
