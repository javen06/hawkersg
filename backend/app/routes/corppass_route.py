"""
CorpPass OIDC Authorization Routes with Mock Mode for Development
Supports both real CorpPass authentication and mock flow for testing
"""
import os
import secrets
import hashlib
import base64
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/auth/corppass", tags=["CorpPass Auth"])

# CorpPass Configuration from Environment Variables
CORPPASS_CLIENT_ID = os.getenv("CORPPASS_CLIENT_ID", "cd64b5b038275e5b447bf7323ef40a9d")
CORPPASS_CLIENT_SECRET = os.getenv("CORPPASS_CLIENT_SECRET", "c9fc872e9dbf6ae54fcdb728e492eab2")
CORPPASS_ISSUER = os.getenv("CORPPASS_ISSUER", "https://id.corppass.gov.sg")
CORPPASS_REDIRECT_URI = os.getenv("CORPPASS_REDIRECT_URI", "http://localhost:8001/auth/corppass/callback")
CORPPASS_SCOPES = os.getenv("CORPPASS_SCOPES", "openid authinfo")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Enable mock mode for development (always true for testing without real credentials)
MOCK_MODE = os.getenv("CORPPASS_MOCK_MODE", "true").lower() == "true"

# CorpPass Production Endpoints
CORPPASS_AUTHORIZATION_ENDPOINT = f"{CORPPASS_ISSUER}/mga/sps/oauth/oauth20/authorize"
CORPPASS_TOKEN_ENDPOINT = f"{CORPPASS_ISSUER}/mga/sps/oauth/oauth20/token"
CORPPASS_USERINFO_ENDPOINT = f"{CORPPASS_ISSUER}/userinfo"

# In-memory session storage (replace with Redis in production)
auth_sessions = {}


def generate_pkce_pair():
    """
    Generate PKCE code_verifier and code_challenge
    As per FAPI 2.0, only S256 method is supported
    """
    code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode('utf-8')).digest()
    ).decode('utf-8').rstrip('=')
    return code_verifier, code_challenge


def generate_state():
    """Generate a unique state parameter for CSRF protection"""
    return secrets.token_urlsafe(32)


def generate_nonce():
    """Generate a unique nonce parameter for replay attack prevention"""
    return secrets.token_urlsafe(32)


@router.get("/authorize")
async def corppass_authorize(request: Request):
    """
    Initiates CorpPass OIDC authorization flow
    
    In MOCK_MODE: Redirects to mock CorpPass login page
    In PRODUCTION: Redirects to real CorpPass authorization endpoint
    """
    
    # Generate security parameters
    state = generate_state()
    nonce = generate_nonce()
    code_verifier, code_challenge = generate_pkce_pair()
    
    # Store session data
    auth_sessions[state] = {
        "code_verifier": code_verifier,
        "nonce": nonce,
        "state": state
    }
    
    print(f"[CorpPass] Authorization initiated - Mode: {'MOCK' if MOCK_MODE else 'PRODUCTION'}")
    print(f"[CorpPass] State: {state}")
    
    if MOCK_MODE:
        # Mock mode: Redirect to mock CorpPass login page
        mock_auth_url = f"{FRONTEND_URL}/mock-corppass?state={state}"
        print(f"[CorpPass] MOCK MODE: Redirecting to {mock_auth_url}")
        return RedirectResponse(url=mock_auth_url, status_code=status.HTTP_302_FOUND)
    else:
        # Real CorpPass flow
        authorization_params = {
            "client_id": CORPPASS_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": CORPPASS_REDIRECT_URI,
            "scope": CORPPASS_SCOPES,
            "state": state,
            "nonce": nonce,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "acr_values": "urn:singpass:authentication:loa:2",
        }
        
        from urllib.parse import urlencode
        auth_url = f"{CORPPASS_AUTHORIZATION_ENDPOINT}?{urlencode(authorization_params)}"
        print(f"[CorpPass] PRODUCTION: Redirecting to {auth_url}")
        return RedirectResponse(url=auth_url, status_code=status.HTTP_302_FOUND)


@router.get("/callback")
async def corppass_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    CorpPass OAuth2 callback endpoint
    
    Handles the redirect from CorpPass (or mock) after user authentication.
    Extracts UEN and redirects to signup page with business data.
    """
    
    print(f"[CorpPass] Callback received - code: {code[:20] if code else None}..., state: {state}")
    
    # Handle errors from CorpPass
    if error:
        print(f"[CorpPass] Error: {error} - {error_description}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CorpPass authentication failed: {error_description or error}"
        )
    
    # Validate required parameters
    if not code or not state:
        print(f"[CorpPass] Missing parameters - code: {bool(code)}, state: {bool(state)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing authorization code or state parameter"
        )
    
    # Validate state (CSRF protection)
    session_data = auth_sessions.get(state)
    if not session_data:
        print(f"[CorpPass] Invalid state: {state}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state parameter"
        )
    
    print(f"[CorpPass] State validated successfully")
    
    # Get mock data if available
    mock_data = session_data.get("mock_data")
    
    # Clean up session
    del auth_sessions[state]
    
    if MOCK_MODE or mock_data:
        # Mock mode: Use fake business data
        if mock_data:
            uen = mock_data.get("uen", "202400001A")
            entity_name = mock_data.get("entity_name", "Demo Hawker Stall Pte Ltd")
            contact_email = mock_data.get("contact_email", "business@demo-hawker.com")
        else:
            # Default mock data
            uen = "202400001A"
            entity_name = "Demo Hawker Stall Pte Ltd"
            contact_email = "business@demo-hawker.com"
        
        business_data = {
            "uen": uen,
            "entityName": entity_name,
            "contactEmail": contact_email,
            "licenseNumber": uen  # Use UEN as license_number
        }
        
        print(f"[CorpPass] MOCK MODE: Returning business data - UEN: {uen}, Name: {entity_name}")
        
        # Redirect to signup with business data
        biz_info_encoded = json.dumps(business_data)
        redirect_url = f"{FRONTEND_URL}/signup?bizInfo={biz_info_encoded}"
        
        return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)
    else:
        # Real mode: Would exchange code for tokens and extract UEN from ID token
        # TODO: Implement token exchange with real CorpPass
        print(f"[CorpPass] PRODUCTION: Would exchange code for tokens here")
        
        redirect_url = f"{FRONTEND_URL}/signup?corppass=success&message=Authentication+successful"
        return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)


@router.post("/mock-login")
@router.get("/mock-login")
async def mock_corppass_login(
    state: Optional[str] = None,
    uen: str = "202400001A",
    entity_name: str = "Demo Hawker Stall Pte Ltd",
    contact_email: str = "business@demo-hawker.com"
):
    """
    Mock CorpPass login endpoint for development
    Simulates CorpPass authentication and generates mock authorization code
    """
    
    if not MOCK_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mock login is only available in MOCK_MODE"
        )
    
    print(f"[CorpPass] Mock login - UEN: {uen}, Name: {entity_name}")
    
    # If state is provided, use existing session
    if state and state in auth_sessions:
        # Update existing session with mock data
        auth_sessions[state]["mock_data"] = {
            "uen": uen,
            "entity_name": entity_name,
            "contact_email": contact_email
        }
        
        # Generate a mock authorization code
        mock_code = f"mock_code_{secrets.token_urlsafe(16)}"
        
        # Redirect to callback with mock code and state
        redirect_url = f"{CORPPASS_REDIRECT_URI}?code={mock_code}&state={state}"
        print(f"[CorpPass] Mock login successful, redirecting to callback")
        
        return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)
    else:
        # No state provided, create new session
        new_state = generate_state()
        
        auth_sessions[new_state] = {
            "mock_data": {
                "uen": uen,
                "entity_name": entity_name,
                "contact_email": contact_email
            },
            "state": new_state
        }
        
        mock_code = f"mock_code_{secrets.token_urlsafe(16)}"
        redirect_url = f"{CORPPASS_REDIRECT_URI}?code={mock_code}&state={new_state}"
        
        print(f"[CorpPass] Mock login with new state, redirecting to callback")
        return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)


@router.get("/status")
async def corppass_status():
    """
    Check CorpPass integration status
    Returns configuration status and current mode
    """
    return {
        "mode": "MOCK" if MOCK_MODE else "PRODUCTION",
        "configured": bool(CORPPASS_CLIENT_ID and CORPPASS_CLIENT_SECRET),
        "client_id_set": bool(CORPPASS_CLIENT_ID),
        "client_id": CORPPASS_CLIENT_ID[:10] + "..." if CORPPASS_CLIENT_ID else None,
        "mock_mode": MOCK_MODE,
        "issuer": CORPPASS_ISSUER,
        "redirect_uri": CORPPASS_REDIRECT_URI,
        "frontend_url": FRONTEND_URL,
        "scopes": CORPPASS_SCOPES,
        "active_sessions": len(auth_sessions),
        "endpoints": {
            "authorize": "/auth/corppass/authorize",
            "callback": "/auth/corppass/callback",
            "mock_login": "/auth/corppass/mock-login" if MOCK_MODE else None
        }
    }
