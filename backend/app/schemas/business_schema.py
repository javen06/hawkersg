from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.models.business_model import CuisineType
from typing import Literal, Optional, List
from datetime import datetime, time
from decimal import Decimal
from fastapi import UploadFile, File

# Business-specific Input Schema for Signup
class BusinessCreate(BaseModel):
    email: EmailStr
    password: str
    username: str
    user_type: Literal['business'] = 'business'
    license_number: str  # Required from SFA data
    stall_name: Optional[str] = None #Optional as some of our data don't have stall name. business name = stall name
    cuisine_type: Optional[CuisineType] = None
    licensee_name: str #Do we need this?
    establishment_address: str #stall_location
    hawker_centre: str
    postal_code: str
    description: Optional[str] = None
    #photo: Optional[str] = None
    
    @field_validator('description')
    def validate_description_length(cls, v):
        if v and len(v.split()) > 100:
            raise ValueError('Description must not exceed 100 words')
        return v

# Business-specific Output Schema
class BusinessOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    user_type: Literal['business']
    license_number: str
    stall_name: Optional[str] = None
    cuisine_type: Optional[CuisineType] = None
    status: str  # 'open' or 'closed'
    description: Optional[str] = None
    photo: Optional[str] = None
    establishment_address: Optional[str] = None
    hawker_centre: str
    postal_code: str
    created_at: Optional[datetime] = None
    operating_hours: Optional[List['OperatingHourOut']] = []
    menu_items: Optional[List['MenuItemOut']] = []
    
    model_config = ConfigDict(from_attributes=True)

# Business Update Schema (for Manage Stall Profile) - excludes license_number
class BusinessUpdate(BaseModel):
    stall_name: Optional[str] = None
    cuisine_type: Optional[CuisineType] = None
    establishment_address: Optional[str] = None
    description: Optional[str] = None
    photo: Optional[str] = None
    
    @field_validator('description')
    def validate_description_length(cls, v):
        if v and len(v.split()) > 100:
            raise ValueError('Description must not exceed 500 characters')
        return v

# Token response for business login
class Business_Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: BusinessOut

# Operating Hours Schema
class OperatingHourIn(BaseModel):
    day: Literal['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    start_time: time
    end_time: time
    

class OperatingHourOut(BaseModel):
    id: int
    day: str
    start_time: time
    end_time: time
    
    model_config = ConfigDict(from_attributes=True)

# Menu Item Schemas
class MenuItemIn(BaseModel):
    name: str = Field(..., max_length=50)
    description: Optional[str] = None
    price: Decimal = Field(..., decimal_places=2, ge=0)
    photo: Optional[str] = None

class MenuItemOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    photo: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class MenuItemPatch(BaseModel):
    name: str = Field(..., max_length=50)
    description: Optional[str] = None
    price: Decimal = Field(..., decimal_places=2, ge=0)
    photo: Optional[str] = None,
    remove_photo: Optional[bool] = False

# Bulk update for operating hours
class OperatingHoursUpdate(BaseModel):
    operating_hours: List[OperatingHourIn]

# Bulk update for menu items
class MenuItemsUpdate(BaseModel):
    menu_items: List[MenuItemIn]