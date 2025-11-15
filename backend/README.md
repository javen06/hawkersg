# HawkerSG Backend

FastAPI service that powers the HawkerSG platform. It exposes REST APIs for hawker centres, stalls, menus, reviews, authentication, and business management, while seeding hawker metadata from the Singapore Food Agency (SFA). SQLAlchemy models are backed by a lightweight SQLite database for local development and ship with helper scripts to refresh the dataset.

---

## Key capabilities

- Consumer APIs to browse hawker centres and stalls, save favourites, and read menus/reviews (`app/routes/hawker_route.py`, `stall_route.py`, `favourite_route.py`).
- Business workflows for owners to update their stall profiles, menus, and gallery assets (`app/routes/business_route.py`).
- Review pipeline with moderation helpers and guards (`app/routes/review_route.py`, `app/services/review_guard.py`).
- Authentication helpers for hashing, JWT issuance, and OneMap geocoding integration (`app/controllers/consumer_controller.py`, `app/utils/jwt_utils.py`, `app/utils/onemap_token_manager.py`).
- Built-in data bootstrap that hydrates the database with SFA hawker directories on startup.

## Tech stack

| Layer        | Tools                                                                 |
| ------------ | --------------------------------------------------------------------- |
| Runtime      | Python 3.12+, Uvicorn                                                 |
| Framework    | FastAPI + Starlette                                                   |
| Database     | SQLite (`backend/HawkerSG.db` by default) via SQLAlchemy ORM          |
| Validation   | Pydantic models under `app/schemas`                                   |
| Instrumentation | PyInstrument middleware exposed at `/__pyinstrument__`            |
| Data ingestion | Custom scripts in `backend/SFA/` for parsing official SFA dumps    |

## Directory map

```text
backend/
├── app/
│   ├── assets/             # Seed images served through StaticFiles
│   ├── controllers/        # Business logic for consumer, business, favourite, review flows
│   ├── models/             # SQLAlchemy tables (users, stalls, menus, hawker centres, reviews, ...)
│   ├── routes/             # FastAPI routers registered in app/main.py
│   ├── schemas/            # Pydantic request/response definitions
│   ├── services/           # Favourite + review stores, review guard helpers
│   ├── utils/              # Email, JWT, OneMap, and profiling utilities
│   ├── database.py         # SQLAlchemy engine/session creation
│   └── main.py             # FastAPI app factory, middleware, startup events, static mounts
├── SFA/                    # Hawker datasets (JSON/CSV) + helper scripts
├── requirements.txt        # Locked backend dependencies
└── README.md               # This guide
```

Getting started
Prerequisites

Python 3.12 or newer.

pip and (optionally) virtualenv/venv for isolation.

SQLite comes bundled with Python, no separate install is required for local usage.

Installation

```
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

```
