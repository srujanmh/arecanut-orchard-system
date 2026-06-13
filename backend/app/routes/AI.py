from datetime import datetime
import uuid
import json
import urllib.request
from urllib.error import URLError, HTTPError
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.models.database import get_db, get_mongo_db, Session
from app.models.schemas import AIRecommendationResponse
from app.auth import get_current_user
from app.config import settings
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except Exception as e:
    print(f"[Warning] Failed to import google.generativeai ({e}). Chat will run in Mock/Rule-based Mode.")
    genai = None
    HAS_GEMINI = False

# Configure Gemini SDK
if HAS_GEMINI and genai and settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"[Warning] Failed to configure Gemini API key ({e}).")
        HAS_GEMINI = False

router = APIRouter(prefix="/ai", tags=["AI & Computer Vision"])

@router.get("/recommendations", response_model=List[AIRecommendationResponse])
def get_ai_recommendations(zone_name: Optional[str] = None):
    recs = [
        {
            "recommendation_id": "rec-101",
            "zone_name": "Zone Delta",
            "type": "irrigation",
            "message": "Deploy active irrigation for 25 minutes. Soil moisture has reached a dry threshold of 19.5%.",
            "confidence": 0.94,
            "model_used": "LSTM",
            "shap_values": {
                "soil_moisture": -0.65,
                "soil_temp": 0.22,
                "solar_radiation": 0.15,
                "wind_speed": 0.08
            },
            "timestamp": datetime.utcnow()
        },
        {
            "recommendation_id": "rec-102",
            "zone_name": "Zone Beta",
            "type": "NPK",
            "message": "Dose Nitrogen (N) at a ratio of 0.5 and Potassium (K) at a ratio of 0.4. Soil NPK values are below optimal levels.",
            "confidence": 0.88,
            "model_used": "XGBoost",
            "shap_values": {
                "nitrogen_level": -0.48,
                "potassium_level": -0.32,
                "ec_level": 0.12,
                "soil_temp": 0.08
            },
            "timestamp": datetime.utcnow()
        },
        {
            "recommendation_id": "rec-103",
            "zone_name": "Zone Alpha",
            "type": "pest_spray",
            "message": "Deploy drone foliar spray targeting Tree A-340. YOLOv8 detected high risk of Spindle Bug infestation.",
            "confidence": 0.91,
            "model_used": "YOLOv8",
            "shap_values": {
                "color_variance": 0.55,
                "lesion_density": 0.35,
                "humidity": 0.18,
                "temp": 0.09
            },
            "timestamp": datetime.utcnow()
        }
    ]
    if zone_name:
        return [r for r in recs if r["zone_name"] == zone_name]
    return recs

@router.post("/detect-pest")
async def detect_pest(file: UploadFile = File(...), db: Session = Depends(get_db)):
    import tempfile
    import os
    from app.ml.inference import predict_leaf_disease
    
    # Save uploaded file to a temporary location
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name

    # Execute prediction using the trained ML model
    try:
        prediction = predict_leaf_disease(temp_file_path)
    except Exception as e:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Image classification error: {str(e)}")
        
    # Check for validation errors (non-leaf/plant image)
    if "error" in prediction:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
        detail_msg = prediction["error"]
        if "detail" in prediction:
            detail_msg = f"{prediction['error']} {prediction['detail']}"
        raise HTTPException(status_code=400, detail=detail_msg)
        
    try:
        # Format the result to match the expected schema
        detection_result = {
            "id": str(uuid.uuid4()),
            "image_name": file.filename,
            "disease_detected": prediction["disease_detected"],
            "confidence": prediction["confidence"],
            "severity": prediction["severity"],
            "bounding_boxes": prediction["bounding_boxes"],
            "recommendation": prediction["recommendation"],
            "features_extracted": prediction["features_extracted"],
            "all_probabilities": prediction["all_probabilities"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Log to MongoDB if available
        try:
            mongo_db = get_mongo_db()
            mongo_db.pest_detections.insert_one(detection_result.copy())
        except Exception:
            pass
            
        return detection_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Result formatting error: {str(e)}")
        
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

@router.post("/train")
def train_model_endpoint():
    try:
        from app.ml.train import train_disease_model
        metrics = train_disease_model()
        return {
            "status": "success",
            "message": "Model trained successfully on the Arecanut leaf disease dataset.",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to train model: {str(e)}")

@router.get("/model-info")
def get_model_info():
    import os
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    metrics_path = os.path.join(current_dir, "ml", "model_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    else:
        # Train it now to populate metrics
        try:
            from app.ml.train import train_disease_model
            metrics = train_disease_model()
            return metrics
        except Exception as e:
            return {
                "status": "not_trained",
                "message": f"Model has not been trained yet. Click train to initialize. Error: {str(e)}"
            }

@router.get("/dataset-preview")
def get_dataset_preview(limit: int = 15):
    import os
    import pandas as pd
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(current_dir, "ml", "arecanut_leaf_features.csv")
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            preview = df.head(limit).to_dict(orient="records")
            total_samples = len(df)
            return {
                "total_samples": total_samples,
                "preview": preview
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read dataset: {str(e)}")
    else:
        return {
            "total_samples": 0,
            "preview": []
        }

# ====================================================
# CHATBOT SCHEMAS & ROUTE (Gemini REST Integration)
# ====================================================

class ChatMessage(BaseModel):
    role: str # user or model
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    telemetry: Optional[Dict[str, Any]] = None

def call_gemini_rest(api_key: str, message: str, history: List[ChatMessage], telemetry: Optional[Dict[str, Any]] = None) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    contents = []
    for h in history:
        contents.append({
            "role": "user" if h.role == "user" else "model",
            "parts": [{"text": h.content}]
        })
    
    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })
    
    # Construct telemetry context if available
    telemetry_summary = ""
    if telemetry:
        try:
            sensors = telemetry.get("sensors", {})
            alerts = telemetry.get("alerts", [])
            valves = telemetry.get("valves", {})
            drone = telemetry.get("drone", {})
            
            zone_details = []
            for zone_name, data in sensors.items():
                v_state = valves.get(zone_name, {})
                valve_str = "open" if v_state.get("valve_open") else "closed"
                zone_details.append(
                    f"- {zone_name}: soil moisture={data.get('soil_moisture')}% soil temp={data.get('soil_temp')}C "
                    f"pH={data.get('ph')} NPK={data.get('nitrogen')}/{data.get('phosphorus')}/{data.get('potassium')} mg/kg "
                    f"valve={valve_str}"
                )
            
            active_alerts = [a.get("message") for a in alerts if isinstance(a, dict) and not a.get("resolved")]
            drone_str = f"- Drone status={drone.get('status')}, battery={drone.get('battery')}%, payload={drone.get('tank_payload')}%"
            
            telemetry_summary = (
                "\n\nHere is the current real-time orchard telemetry and state from the dashboard to base your answer on:\n"
                + "\n".join(zone_details)
                + f"\n{drone_str}"
                + f"\n- Active Alerts: {', '.join(active_alerts) if active_alerts else 'None'}"
                + "\nAlways reference this data when asked about current status, sensor readings, levels, alerts, valves, or layout. If a zone sensor value is dry (e.g. moisture below 20%), flag it as dry. The orchard currently has exactly these 4 zones."
            )
        except Exception as e:
            telemetry_summary = f"\n\n(Error parsing real-time telemetry structure: {str(e)})"
            
    sys_instruction = (
        "You are 'Agrisense AI Copilot', an expert precision agriculture assistant specialized in commercial Arecanut (Betel Nut) cultivation, "
        "orchard irrigation control, fertigation dosing, and crop pathology. "
        "Analyze queries using scientific agronomy practices. Keep responses extremely short, direct, accurate, and action-oriented. "
        "Avoid long explanations; keep answers under 2-3 sentences where possible. "
        "If the user requests to control or set any device, valve, drone, or NPK level, you must append a command tag to the end of your response. "
        "Supported commands: "
        "- Open valve: `[CMD: {\"action\": \"open_valve\", \"zone\": \"Zone Name\"}]` "
        "- Close valve: `[CMD: {\"action\": \"close_valve\", \"zone\": \"Zone Name\"}]` "
        "- Start drone spray: `[CMD: {\"action\": \"start_drone\"}]` "
        "- Recall drone: `[CMD: {\"action\": \"recall_drone\"}]` "
        "- Set NPK levels: `[CMD: {\"action\": \"set_npk\", \"zone\": \"Zone Name\", \"nitrogen\": value, \"phosphorus\": value, \"potassium\": value}]` (only include N/P/K fields that are requested/changed). "
        "- Set auto-close moisture threshold: `[CMD: {\"action\": \"set_close_threshold\", \"zone\": \"Zone Name\", \"threshold\": value}]` (use this if the user asks to close at a specific percentage/moisture, e.g. 'close at 80%')."
    )
    if telemetry_summary:
        sys_instruction += telemetry_summary
        
    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{
                "text": sys_instruction
            }]
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = response.read().decode("utf-8")
            res_json = json.loads(res_data)
            candidates = res_json.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            return "Error: Received empty response from Gemini API."
    except HTTPError as e:
        error_content = e.read().decode("utf-8")
        try:
            err_json = json.loads(error_content)
            err_msg = err_json.get("error", {}).get("message", error_content)
        except Exception:
            err_msg = error_content
        raise HTTPException(status_code=500, detail=f"Gemini API HTTP Error {e.code}: {err_msg}")
    except URLError as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Connection Error: {e.reason}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Unexpected Error: {str(e)}")

@router.post("/chat")
def chat_with_copilot(payload: ChatRequest):
    if not settings.GEMINI_API_KEY:
        # Fallback to local rule-based helper if no API key is set
        user_msg = payload.message.lower()
        if "npk" in user_msg or "nitrogen" in user_msg:
            return {"response": "Nitrogen is currently stable in Zone Alpha (42 mg/kg), but Zone Beta is showing levels below optimal standard (38 mg/kg). I recommend fertigation dosage (0.5 - 0.2 - 0.4)."}
        elif "bug" in user_msg or "spindle" in user_msg:
            return {"response": "Spindle bug infestation typically targets young leaves and inner crown axils. Spraying Lambda-cyhalothrin (0.5 ml/L) is the primary recommendation."}
        elif "irrigation" in user_msg or "water" in user_msg:
            return {"response": "Average soil moisture is optimal across Zones Alpha, Beta, Gamma. Zone Delta is dry at 19.5%. Actuating Valve D is recommended."}
        else:
            return {"response": "I am processing orchard telemetry. [No API Key Configured] Please configure the GEMINI_API_KEY environment variable to enable full conversational intelligence."}
            
    # Use REST client
    return {"response": call_gemini_rest(settings.GEMINI_API_KEY, payload.message, payload.history, payload.telemetry)}
