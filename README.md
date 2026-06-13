# Agrisense Pro - AI-Powered Arecanut Orchard Management System

Agrisense Pro is a complete, enterprise-grade, high-fidelity AgriTech SaaS platform designed to optimize and automate commercial arecanut cultivation. The system integrates real-time IoT soil/NPK sensors, LoRaWAN mesh communication, edge computing preprocessors, YOLOv8 disease classification models, autonomous drone spray triggers, and closed-loop smart irrigation valves.

---

## System Architecture

```mermaid
graph TD
    subgraph Edge Layer (IoT Field Nodes)
        N1[LoRa Node A - Soil & NPK] -->|LoRaWAN mesh| GW[Edge Gateway Base Station]
        N2[LoRa Node B - Soil & NPK] -->|LoRaWAN mesh| GW
        N3[LoRa Node C - Soil & NPK] -->|LoRaWAN mesh| GW
    end
    
    subgraph Preprocessing (Gateway)
        GW -->|Kalman Filters & Outliers Cleaning| EP[Edge Processor]
        EP -->|Compressed Delta Payload| AP[REST API Client]
    end

    subgraph Backend & Database Layer (Cloud/On-Premises)
        AP -->|FastAPI router| FA[FastAPI Central Engine]
        FA -->|Relational Data| PG[(PostgreSQL Database)]
        FA -->|Time-Series telemetry| IF[(InfluxDB Bucket)]
        FA -->|Pest image bounding boxes| MG[(MongoDB Archive)]
    end

    subgraph AI Inference Layer
        FA -->|Prediction queries| AI[LSTM / XGBoost / YOLOv8]
        AI -->|Decision actions| FA
    end

    subgraph Client Application (Frontend Console)
        FA -->|REST JSON / JWT Auth| FE[Vite + React Dashboard]
    end
```

---

## Role-Based Access Control (RBAC) Matrix

Agrisense Pro enforces strict role-based access to safeguard orchard valves and proprietary analytics:

| Module / Operation | Super Admin | Farmer | Agronomist | Technician |
|:---|:---:|:---:|:---:|:---:|
| **Sensor Telemetry Monitor** | Yes | Yes | Yes | Yes |
| **LoRa Network Diagnostics** | Yes | No | No | Yes |
| **Edge Isolation Logs** | Yes | No | No | Yes |
| **AI Recommendation Console** | Yes | Yes | Yes | No |
| **Irrigation Solenoids Actuation** | Yes | Yes | No | No |
| **Fertigation Injector Dosing** | Yes | Yes | Yes | No |
| **YOLOv8 Disease Scanner** | Yes | Yes | Yes | No |
| **Octacopter Flight Launcher** | Yes | Yes | No | No |
| **Hardware Reboot Controls** | Yes | No | No | Yes |
| **Database Schema Viewer** | Yes | No | No | No |

---

## Installation & Setup Guide

### 1. Docker Compose Method (Recommended)

To spin up the entire microservices stack (React, FastAPI, PostgreSQL, InfluxDB, MongoDB, Redis) in one click:

```bash
# Clone the repository and enter directory
cd arecanut_orchard_system

# Build and run the docker environment
docker-compose up --build -d
```
The services will mount:
*   **Vite Frontend Dashboard**: `http://localhost:3000`
*   **FastAPI REST API Docs**: `http://localhost:8000/docs`
*   **InfluxDB Dashboard**: `http://localhost:8086`

### 2. Manual Development Setup

#### Backend (FastAPI)
1. Install Python 3.10+
2. Navigate to `./backend`:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Set environment variables (or let defaults apply for local SQLite fallback mode):
   ```bash
   $env:JWT_SECRET="mysecretkey"
   ```
4. Start development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Frontend (Vite + React)
1. Install Node.js 18+
2. Navigate to `./frontend`:
   ```bash
   cd frontend
   npm install
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```

---

## API Specifications (REST API endpoints)

Agrisense Pro exposes a rich, typed REST API documented via Swagger:

### 1. Authentication
*   `POST /api/v1/auth/login`: Accepts credentials (username/password) and returns a JWT access token.
*   `POST /api/v1/auth/register`: Create a new user with specific role permission tags.
*   `GET /api/v1/auth/me`: Returns verified token user metadata.

### 2. Telemetry & Sensor Feeds
*   `POST /api/v1/sensors/reading`: Edge gateway post uplink for NPK, moisture, battery.
*   `GET /api/v1/sensors/live`: Retrieves current soil metrics across zones.
*   `GET /api/v1/sensors/history?zone_name=Zone+Alpha`: Time-series query for chart rendering.

### 3. Smart Actuators
*   `POST /api/v1/irrigation/control`: Actuate solenoid valves (Manual, Scheduled, AI closed-loop).
*   `POST /api/v1/irrigation/fertigation`: Adjust mixing ratios for N, P, and K.

### 4. Computer Vision Disease Scanner
*   `POST /api/v1/ai/detect-pest`: Upload leaf image to perform a simulated YOLOv8 scan. Returns localized bounding boxes, classifications (e.g., Spindle Bug, Bud Rot), and severity levels.
