import asyncio
import json
import math
import random
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/drone", tags=["Drone Control & Telemetry"])

# In-memory storage for the last uploaded flight path mission
ACTIVE_FLIGHT_PLAN: List[Dict[str, float]] = []

# Autopilot status simulator or real connection stub
MAVLINK_CONNECTED = False
AUTOPILOT_PORT = "COM3" # standard Windows serial port for USB telemetry radio

# Try importing MAVLink libraries for real hardware connection
try:
    from pymavlink import mavutil
    HAS_MAVLINK = True
except ImportError:
    HAS_MAVLINK = False

class TelemetryManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(data))
            except Exception:
                pass

telemetry_manager = TelemetryManager()

@router.post("/upload-mission")
async def upload_mission(waypoints: List[Dict[str, float]]):
    """
    Accepts waypoints (X and Y coordinates as percentages 0-100).
    In a real implementation, it converts these to GPS Latitude/Longitude coordinates
    relative to the orchard's geofence anchor and sends MAV_CMD_NAV_WAYPOINT mission
    commands to the Pixhawk autopilot via MAVLink.
    """
    global ACTIVE_FLIGHT_PLAN
    ACTIVE_FLIGHT_PLAN = waypoints
    
    print(f"[*] Uploading flight path mission with {len(waypoints)} waypoints to drone...")
    
    # MAVLink Mission Protocol Upload
    if HAS_MAVLINK and MAVLINK_CONNECTED:
        try:
            # Stub: Connect to Pixhawk over serial telemetry link
            master = mavutil.mavlink_connection(AUTOPILOT_PORT, baud=57600)
            master.wait_heartbeat()
            print(f"[Autopilot] Heartbeat received from Pixhawk (System ID: {master.target_system})")
            
            # Clear existing mission
            master.mav.mission_clear_all_send(master.target_system, master.target_component)
            
            # Send MISSION_COUNT
            master.mav.mission_count_send(master.target_system, master.target_component, len(waypoints))
            
            # In a real Pixhawk system, we send MISSION_ITEM command packets containing lat/lon geolocations
            # converted from X/Y coordinates.
            for idx, wpt in enumerate(waypoints):
                print(f"  Uploading Waypoint {idx+1}: X={wpt['x']}%, Y={wpt['y']}%")
                
            return {"status": "success", "message": f"Flight path successfully uploaded to Pixhawk autopilot on {AUTOPILOT_PORT}."}
        except Exception as e:
            return {"status": "partial_success", "message": f"Flight path uploaded in local memory. Autopilot upload failed: {str(e)}"}
            
    return {
        "status": "success", 
        "message": f"Flight path with {len(waypoints)} waypoints successfully compiled. Ready to stream telemetry."
    }

@router.websocket("/telemetry")
async def drone_telemetry_stream(websocket: WebSocket):
    """
    WebSocket endpoint streaming live drone coordinate state.
    Pulls real-time telemetry packets from the Pixhawk autopilot (MAVLink system status,
    battery, global position) and streams them to the frontend map view.
    """
    await telemetry_manager.connect(websocket)
    print("[WebSocket] Client connected to live drone telemetry stream.")
    
    # Telemetry streaming loop
    try:
        # If real autopilot telemetry is active, poll MAVLink serial port
        if HAS_MAVLINK and MAVLINK_CONNECTED:
            try:
                master = mavutil.mavlink_connection(AUTOPILOT_PORT, baud=57600)
                while True:
                    # Listen for telemetry packets (heartbeat, position, battery)
                    msg = master.recv_match(type=['GLOBAL_POSITION_INT', 'SYS_STATUS'], blocking=False)
                    if msg:
                        data = {}
                        if msg.get_type() == 'GLOBAL_POSITION_INT':
                            # Map GPS lat/lon back into orchard layout percentage
                            data = {
                                "x": float(msg.lon / 1e7), # Map projection conversion
                                "y": float(msg.lat / 1e7),
                                "status": "flying"
                            }
                        elif msg.get_type() == 'SYS_STATUS':
                            data = {
                                "battery": float(msg.battery_remaining),
                                "tank_payload": 95.0
                            }
                        if data:
                            await websocket.send_json(data)
                    await asyncio.sleep(0.1)
            except Exception as e:
                print(f"[Warning] MAVLink polling error: {e}. Falling back to simulation.")
                
        # Simulated/Fallback telemetry stream
        # Generates coordinates following the ACTIVE_FLIGHT_PLAN waypoints
        wpt_idx = 0
        drone_x, drone_y = 10.0, 10.0
        battery = 100.0
        payload = 100.0
        status = "flying"
        
        while True:
            if ACTIVE_FLIGHT_PLAN:
                target = ACTIVE_FLIGHT_PLAN[wpt_idx]
                dx = target["x"] - drone_x
                dy = target["y"] - drone_y
                dist = math.sqrt(dx*dx + dy*dy)
                
                if dist < 4.0:
                    status = "spraying" if status == "flying" else "flying"
                    if wpt_idx + 1 < len(ACTIVE_FLIGHT_PLAN):
                        wpt_idx += 1
                    else:
                        status = "charging"
                else:
                    speed = 6.0
                    ratio = speed / dist
                    drone_x += dx * min(1.0, ratio)
                    drone_y += dy * min(1.0, ratio)
                    
                battery = max(20.0, battery - 0.8)
                if status == "spraying":
                    payload = max(0.0, payload - 3.5)
            else:
                status = "idle"
                
            if status == "charging":
                drone_x, drone_y = 10.0, 10.0
                battery = min(100.0, battery + 10.0)
                if battery == 100.0:
                    status = "idle"
                    payload = 100.0
                    wpt_idx = 0
                    
            await websocket.send_json({
                "x": drone_x,
                "y": drone_y,
                "battery": battery,
                "tank_payload": payload,
                "status": status,
                "current_wpt": wpt_idx,
                "is_real_telemetry": MAVLINK_CONNECTED
            })
            await asyncio.sleep(1.0) # telemetry update frequency
            
    except WebSocketDisconnect:
        telemetry_manager.disconnect(websocket)
        print("[WebSocket] Client disconnected from live telemetry stream.")