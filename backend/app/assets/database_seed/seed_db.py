import os
import sys
import json
from sqlalchemy.orm import Session
import pandas as pd
from sqlalchemy import select

# ----------------------------------------------------
# Pathing to allow model imports
# ----------------------------------------------------

# Get the path to the directory containing this script (database_seed)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Add the project root (backend) to sys.path for internal imports to work
PROJECT_ROOT = os.path.join(SCRIPT_DIR, '..', '..', '..')
sys.path.append(PROJECT_ROOT) 

# Import necessary models
from app.models.hawker_centre_model import HawkerCentre
from app.models.business_model import Business
from app.models.operating_hour_model import OperatingHour
from app.models.menu_item_model import MenuItem


def seed_sfa_data_if_empty(db: Session, index_file_path: str):
    """
    Checks if the HawkerCentre table is empty. If so, seeds SFA data 
    from the specified index file and corresponding Excel files, using 
    manual commit/rollback to avoid transactional conflicts on startup.
    """
    
    # 1. Check if the database has already been seeded (using the session's state)
    # Using db.scalars().first() is the correct way to execute a select statement for a single result.
    if db.scalars(select(HawkerCentre).limit(1)).first():
        print("Database already contains Hawker Centres. Skipping seeding.")
        return

    print("Database is empty. Starting SFA data seeding...")
    print(f"Attempting to load index file from: {index_file_path}")

    # Load the index file
    try:
        with open(index_file_path, 'r') as f:
            index_data = json.load(f)
    except FileNotFoundError:
        print(f"FATAL ERROR: Index file not found at {index_file_path}. Aborting seeding.")
        return
    except Exception as e:
        print(f"FATAL ERROR: Failed to read or parse index.json: {e}. Aborting seeding.")
        return

    SFA_DIR = os.path.dirname(index_file_path) 

    # Use manual db.commit() and db.rollback() 
    # since the session is already in an active transaction state.
    try:
        for entry in index_data:
            hawker_centre_name = entry.get('hawker_centre')
            file_path_relative_to_SFA = entry.get('file')
            
            if not hawker_centre_name or not file_path_relative_to_SFA:
                print(f"Skipping malformed entry in index: {entry}")
                continue
                
            print(f"  Processing Hawker Centre: {hawker_centre_name}")

            excel_file_path = os.path.join(SFA_DIR, file_path_relative_to_SFA)

            try:
                # Read the Excel file into a DataFrame
                df = pd.read_excel(excel_file_path)
            except FileNotFoundError:
                print(f"  Skipping: Excel file not found at {excel_file_path}")
                continue
            except Exception as e:
                 print(f"  Skipping: Error reading Excel file {excel_file_path}: {e}")
                 continue
                
            # Find or Create HawkerCentre record
            hawker_centre = db.scalar(
                select(HawkerCentre).where(HawkerCentre.name == hawker_centre_name)
            )
            
            if not hawker_centre:
                hawker_centre = HawkerCentre(name=hawker_centre_name)
                db.add(hawker_centre)
                db.flush() 
            
            # Seed Business (Stall) records
            for _, row in df.iterrows():
                license_no = str(row.get('Licence Number', row.get('license_number', row.get('License_No', '')))).strip() 
                if not license_no: continue

                existing_business = db.scalar(
                    select(Business).where(Business.license_number == license_no)
                )
                if existing_business:
                    continue
                
                new_business_stall = Business(
                    email=f"sfa_placeholder_{license_no}@example.com",
                    hashed_password="placeholder",
                    user_type="business",
                    username="",
                    
                    license_number=license_no,
                    stall_name=row.get('Business Name', row.get('Stall_Name', row.get('stall_name'))),
                    licensee_name=row.get('Licensee Name', row.get('Licensee_Name', row.get('licensee_name'))),
                    establishment_address=row.get('Establishment Address', row.get('Establishment_Address', row.get('establishment_address'))),
                    postal_code=row.get('Postal Code', row.get('Postal_Code', row.get('postal_code'))),
                    hawker_centre=hawker_centre_name,

                    description="",
                    photo="",
                    status=""

                    # Can consider adding a new field such that only the real owner of the business claim the hawker stall when signing up
                    # All stalls in every hawker centre are preloaded but can't be edited till it is claimed
                    # is_claimed = false
                )
                db.add(new_business_stall)

        # Commit all changes to the database
        db.commit()
        print("SFA data seeding complete.")
        
    except Exception as e:
        # Rollback all changes if an error occurred
        db.rollback()
        print(f"An unexpected error occurred during seeding: {e}")
        raise # Re-raise the exception to be handled by the caller (main.py)
