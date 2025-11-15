# HawkerSG Backend

FastAPI backend powering the HawkerSG platform. It provides REST APIs for hawker centres, stalls, menus, reviews, authentication, and business management. The backend uses SQLite for local development and includes scripts to seed hawker data from the Singapore Food Agency (SFA).

---

## Key Capabilities

- Browse hawker centres, stalls, menus, and reviews  
- Manage stall profiles, menus, and gallery images (business owners)  
- Review submission with moderation guards  
- JWT authentication + OneMap geocoding  
- Automatic database creation and SFA data seeding on startup  

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Runtime | Python 3.12+, Uvicorn |
| Framework | FastAPI + Starlette |
| Database | SQLite via SQLAlchemy ORM |
| Validation | Pydantic models |
| Instrumentation | PyInstrument |
| Data ingestion | SFA dataset scripts under `backend/SFA/` |

---

## Directory Overview

```text
backend/
├── app/
│   ├── controllers/     # Business logic
│   ├── models/          # SQLAlchemy tables
│   ├── routes/          # API routers
│   ├── schemas/         # Pydantic models
│   ├── services/        # Favourites, reviews, guards
│   ├── utils/           # JWT, email, OneMap, profiling
│   ├── assets/          # Seed images
│   └── main.py          # App factory + middleware
├── SFA/                 # Hawker datasets + scripts
├── requirements.txt
└── README.md
```
Getting Started
Prerequisites

- Python 3.12+

- pip / venv

- SQLite (bundled with Python)

Installation
```
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```
