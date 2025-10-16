import os
import glob
import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List

from app.schemas.hawker_centre_schema import HawkerCentreResponse 
from app.models.hawker_centre_model import HawkerCentre
from app.database import get_db

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


@router.get("/retrieve-all-hawkers", response_model=List[HawkerCentreResponse])
def get_all_hawker_centres(db: Session = Depends(get_db)):
    """
    Retrieves a list of all hawker centres, setting stallCount to 0 
    since the stall relationship is currently ignored.
    """
    
    # Query: Select all HawkerCentre objects, ordered by name.
    stmt = select(HawkerCentre).order_by(HawkerCentre.name)

    results = db.scalars(stmt).all() # Use scalars to get ORM objects directly

    # Map the ORM results to the custom Pydantic response format
    hawker_centres_data = []
    
    for hawker_centre in results:
        image_url = hawker_centre.image if hawker_centre.image is not None else ""

        data = HawkerCentreResponse(
            id=hawker_centre.id,
            name=hawker_centre.name,
            address=hawker_centre.address,
            description=hawker_centre.description,
            image=image_url,
            rating=hawker_centre.rating,
            # Stall count is set to 0 for now as relationship with business class is not yet established
            stallCount=0,
            coordinates={
                'lat': hawker_centre.latitude,
                'lng': hawker_centre.longitude
            }
        )
        hawker_centres_data.append(data)
        
    return hawker_centres_data