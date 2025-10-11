import os
import pandas as pd
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/hawkers", tags=["Stalls"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../SFA/centres_output")

@router.get("/{hawker_id}/stalls")
def get_stalls(hawker_id: str):
    try:
        # Find the Excel file matching this hawker ID (e.g. 768867_Yishun Park Hawker Centre.xlsx)
        excel_file = None
        for file in os.listdir(DATA_DIR):
            if file.startswith(hawker_id):
                excel_file = os.path.join(DATA_DIR, file)
                break

        if not excel_file:
            raise HTTPException(status_code=404, detail="Hawker Centre not found")

        df = pd.read_excel(excel_file)
        stalls = []

        for _, row in df.iterrows():
            stalls.append({
                "license_no": str(row.get("LICENCE NUMBER", "Unknown")),
                "stall_name": row.get("STALL NAME", "Unnamed Stall"),
                "address": row.get("STALL ADDRESS", "Unknown"),
                "type": row.get("STALL TYPE", ""),
                "food_items": row.get("FOOD ITEMS SOLD", ""),
                "owner": row.get("LICENSEE NAME", ""),
            })

        return stalls

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))