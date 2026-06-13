import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.models.database import get_db, Session
from app.models.schemas import IrrigationControl, FertigationControl, IrrigationLog
from app.auth import get_current_user

router = APIRouter(prefix="/irrigation", tags=["Irrigation & Fertigation"])

# Store current system states
IRRIGATION_STATES: Dict[str, Dict[str, Any]] = {
    "Zone Alpha": {"valve_open": False, "mode": "auto", "flow_rate": 0.0, "tank_level": 85.0},
    "Zone Beta": {"valve_open": False, "mode": "auto", "flow_rate": 0.0, "tank_level": 82.0},
    "Zone Gamma": {"valve_open": False, "mode": "auto", "flow_rate": 0.0, "tank_level": 88.0},
    "Zone Delta": {"valve_open": False, "mode": "auto", "flow_rate": 0.0, "tank_level": 74.0},
}

FERTIGATION_STATES: Dict[str, Dict[str, Any]] = {
    "Zone Alpha": {"injecting": False, "n_ratio": 0.4, "p_ratio": 0.2, "k_ratio": 0.4, "flow_rate": 0.0},
    "Zone Beta": {"injecting": False, "n_ratio": 0.4, "p_ratio": 0.2, "k_ratio": 0.4, "flow_rate": 0.0},
    "Zone Gamma": {"injecting": False, "n_ratio": 0.4, "p_ratio": 0.2, "k_ratio": 0.4, "flow_rate": 0.0},
    "Zone Delta": {"injecting": False, "n_ratio": 0.4, "p_ratio": 0.2, "k_ratio": 0.4, "flow_rate": 0.0},
}

@router.post("/control")
def control_irrigation(control: IrrigationControl, db: Session = Depends(get_db)):
    if control.zone_name not in IRRIGATION_STATES:
        raise HTTPException(status_code=400, detail="Invalid zone name")
        
    state = IRRIGATION_STATES[control.zone_name]
    
    # Check what changed
    is_opening = control.action == "open"
    was_open = state["valve_open"]
    
    state["valve_open"] = is_opening
    state["mode"] = control.mode
    state["flow_rate"] = 45.2 if is_opening else 0.0
    
    # Log to DB if we switched state
    if is_opening and not was_open:
        log = IrrigationLog(
            id=str(uuid.uuid4()),
            zone_name=control.zone_name,
            valve_id=f"VALVE-{control.zone_name[-1].upper()}",
            start_time=datetime.utcnow(),
            end_time=None,
            volume_liters=0.0,
            mode=control.mode
        )
        db.add(log)
        db.commit()
    elif not is_opening and was_open:
        # Update active log
        active_log = db.query(IrrigationLog)\
            .filter(IrrigationLog.zone_name == control.zone_name, IrrigationLog.end_time == None)\
            .order_by(IrrigationLog.start_time.desc())\
            .first()
        if active_log:
            active_log.end_time = datetime.utcnow()
            duration = (active_log.end_time - active_log.start_time).total_seconds() / 60
            active_log.volume_liters = round(duration * 45.2, 1) # 45.2 L/min
            db.commit()
            
    return {"status": "success", "current_state": state}

@router.post("/fertigation")
def control_fertigation(control: FertigationControl):
    if control.zone_name not in FERTIGATION_STATES:
        raise HTTPException(status_code=400, detail="Invalid zone name")
        
    state = FERTIGATION_STATES[control.zone_name]
    state["injecting"] = control.action == "start"
    state["n_ratio"] = control.n_ratio
    state["p_ratio"] = control.p_ratio
    state["k_ratio"] = control.k_ratio
    state["flow_rate"] = control.flow_rate if control.action == "start" else 0.0
    
    return {"status": "success", "current_state": state}

@router.get("/status")
def get_irrigation_status(zone_name: Optional[str] = None):
    if zone_name:
        if zone_name not in IRRIGATION_STATES:
            raise HTTPException(status_code=400, detail="Invalid zone name")
        return {
            "irrigation": IRRIGATION_STATES[zone_name],
            "fertigation": FERTIGATION_STATES[zone_name]
        }
    return {
        "irrigation": IRRIGATION_STATES,
        "fertigation": FERTIGATION_STATES
    }
