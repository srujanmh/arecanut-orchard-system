import io
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from app.models.database import get_db, Session
from app.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/export")
def export_report(
    report_type: str = Query("sensor", description="Type of report: sensor, yield, irrigation, pest"),
    format: str = Query("csv", description="Format: csv, xlsx, pdf"),
    zone_name: Optional[str] = None
):
    # Generates custom-made streams representing reports
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"agrisense_{report_type}_report_{timestamp}.{format}"
    
    if format == "csv":
        # Generate CSV stream
        csv_data = generate_mock_csv(report_type, zone_name)
        stream = io.BytesIO(csv_data.encode("utf-8"))
        media_type = "text/csv"
    elif format == "xlsx":
        # Generate raw Excel format (simulated in byte stream)
        xlsx_data = generate_mock_xlsx(report_type, zone_name)
        stream = io.BytesIO(xlsx_data)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif format == "pdf":
        # Generate a simulated PDF byte stream
        pdf_data = generate_mock_pdf(report_type, zone_name)
        stream = io.BytesIO(pdf_data)
        media_type = "application/pdf"
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")
        
    return StreamingResponse(
        stream,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def generate_mock_csv(report_type: str, zone_name: Optional[str]) -> str:
    zone = zone_name or "All Zones"
    if report_type == "sensor":
        csv = "Timestamp,Zone,Soil Moisture (%),Soil Temp (C),pH,EC (dS/m),Nitrogen (mg/kg),Phosphorus (mg/kg),Potassium (mg/kg)\n"
        now = datetime.utcnow()
        for i in range(24):
            t = (now - timedelta(hours=i)).isoformat()
            csv += f"{t},{zone},34.2,23.5,6.1,1.2,40,15,30\n"
        return csv
    elif report_type == "yield":
        return "Season,Zone,Grade A Yield (tons),Grade B Yield (tons),Total Production (tons),Estimated Revenue (USD)\n" \
               f"2023,{zone},12.5,4.2,16.7,50100\n" \
               f"2024,{zone},14.1,3.8,17.9,53700\n" \
               f"2025 (Forecast),{zone},15.8,3.5,19.3,57900\n"
    elif report_type == "irrigation":
        return "Timestamp,Zone,Valve ID,Action,Volume Liters,Mode,Operator\n" \
               f"2026-06-12T08:00:00,{zone},VALVE-A,OPEN,2500,Scheduled,System_Daemon\n" \
               f"2026-06-12T12:00:00,{zone},VALVE-B,OPEN,1800,AI_Model,System_Daemon\n"
    else:
        return "Timestamp,Tree ID,Zone,Pest Type,Severity,Confidence,Action Taken\n" \
               f"2026-06-11T14:35:10,Tree A-340,{zone},Spindle Bug,High,0.92,Drone Spray Dispatched\n"

def generate_mock_xlsx(report_type: str, zone_name: Optional[str]) -> bytes:
    # Simulates an Excel file by generating dummy bytes
    return b"PK\x03\x04\n\x00\x00\x00\x00\x00[Simulated Excel XLSX Binary Stream for " + report_type.encode("utf-8") + b" in " + (zone_name or "All Zones").encode("utf-8") + b"]"

def generate_mock_pdf(report_type: str, zone_name: Optional[str]) -> bytes:
    # Return a basic valid PDF header and dummy byte data representing a PDF report
    return b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n" \
           b"[Simulated AgriSense PDF Report Document for " + report_type.encode("utf-8") + b" in " + (zone_name or "All Zones").encode("utf-8") + b"]"
