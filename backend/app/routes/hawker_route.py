from fastapi import APIRouter
import os
import glob
import pandas as pd

router = APIRouter(
    prefix="/api/hawkers",
    tags=["hawkers"]
)

@router.get("/")
def get_hawker_centres():
    folder_path = os.path.join(os.path.dirname(__file__), "../../SFA/centres_output")
    hawker_data = []

    for file in glob.glob(os.path.join(folder_path, "*.xlsx")):
        try:
            df = pd.read_excel(file)

            file_name = os.path.basename(file)
            hawker_id, hawker_name = file_name.split("_", 1)
            hawker_name = hawker_name.replace(".xlsx", "")

            address = df.get("Address", ["Unknown"])[0] if "Address" in df.columns else "Unknown"

            hawker_data.append({
                "id": hawker_id,
                "name": hawker_name,
                "address": address,
                "stallCount": len(df),
                "description": f"{hawker_name} has {len(df)} stalls listed.",
                "rating": None,
                "image": "/placeholder.jpg"
            })

        except Exception as e:
            print(f"Error reading {file}: {e}")

    return hawker_data