 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/backend/README.md b/backend/README.md
index 1c42f0694a29ec59de59e3904f1a61fc433cebfa..2a8f490e33563af7f8ad5e3e3d33abfde6927f21 100644
--- a/backend/README.md
+++ b/backend/README.md
@@ -1,65 +1,172 @@
-# HawkerSG Backend Setup
+# HawkerSG Backend
 
-### 1. Prerequisites
+FastAPI service that powers the HawkerSG platform. It exposes REST APIs for hawker centres, stalls, menus, reviews, authentication, and business management, while seeding hawker metadata from the Singapore Food Agency (SFA). SQLAlchemy models are backed by a lightweight SQLite database for local development and ship with helper scripts to refresh the dataset.
 
-* Python 3.12+
-* `pip` (Python package installer)
+---
 
-### 2. Setup and Installation
+## Key capabilities
 
-1.  **Clone the Repository (If applicable):**
-    ```bash
-    git clone [your-repo-link]
-    cd [your-repo-name]/backend
-    ```
+- Consumer APIs to browse hawker centres and stalls, save favourites, and read menus/reviews (`app/routes/hawker_route.py`, `stall_route.py`, `favourite_route.py`).
+- Business workflows for owners to update their stall profiles, menus, and gallery assets (`app/routes/business_route.py`).
+- Review pipeline with moderation helpers and guards (`app/routes/review_route.py`, `app/services/review_guard.py`).
+- Authentication helpers for hashing, JWT issuance, and OneMap geocoding integration (`app/controllers/consumer_controller.py`, `app/utils/jwt_utils.py`, `app/utils/onemap_token_manager.py`).
+- Built-in data bootstrap that hydrates the database with SFA hawker directories on startup.
 
-2.  **Create and Activate a Virtual Environment:**
-    It's crucial to use a virtual environment to isolate project dependencies.
+## Tech stack
 
-    ```bash
-    # Create the environment
-    python -m venv venv 
-    
-    # Activate the environment
-    # On Linux/macOS:
-    source venv/bin/activate
-    # On Windows (Command Prompt):
-    .\venv\Scripts\activate
-    ```
+| Layer | Tools |
+| --- | --- |
+| Runtime | Python 3.12+, Uvicorn |
+| Framework | FastAPI + Starlette |
+| Database | SQLite (`backend/HawkerSG.db` by default) via SQLAlchemy ORM |
+| Validation | Pydantic models under `app/schemas` |
+| Instrumentation | PyInstrument middleware exposed at `/__pyinstrument__` |
+| Data ingestion | Custom scripts in `backend/SFA/` for parsing official SFA dumps |
 
-3.  **Install Dependencies:**
-    Install all required packages from the generated `requirements.txt` file.
+## Directory map
 
-    ```bash
-    pip install -r requirements.txt
-    ```
+```
+backend/
+├── app/
+│   ├── assets/             # Seed images served through StaticFiles
+│   ├── controllers/        # Business logic for consumer, business, favourite, review flows
+│   ├── models/             # SQLAlchemy tables (users, stalls, menus, hawker centres, reviews, ...)
+│   ├── routes/             # FastAPI routers registered in app/main.py
+│   ├── schemas/            # Pydantic request/response definitions
+│   ├── services/           # Favourite + review stores, review guard helpers
+│   ├── utils/              # Email, JWT, OneMap, and profiling utilities
+│   ├── database.py         # SQLAlchemy engine/session creation
+│   └── main.py             # FastAPI app factory, middleware, startup events, static mounts
+├── SFA/                    # Hawker datasets (JSON/CSV) + helper scripts
+├── requirements.txt        # Locked backend dependencies
+└── README.md               # This guide
+```
+
+---
 
-### 3. Running the Application
+## Getting started
 
-1.  **Run the Server:**
-    Run the application using `uvicorn`, ensuring you are in the directory *containing* the `app` folder (e.g., the root `/backend` directory).
+### Prerequisites
 
-    ```bash
-    uvicorn app.main:app --reload --port 8001
-    ```
-    The `--reload` flag automatically restarts the server on code changes.
+1. Python **3.12 or newer**.
+2. `pip` and (optionally) `virtualenv`/`venv` for isolation.
+3. SQLite comes bundled with Python, no separate install is required for local usage.
 
-2.  **Access the API Documentation:**
-    Once the server is running, the API documentation is available at:
-    * **Swagger UI:** [http://localhost:8001/docs](http://localhost:8001/docs)
-    * **ReDoc:** [http://localhost:8001/redoc](http://localhost:8001/redoc)
+### Installation
+
+```bash
+cd backend
+python -m venv .venv
+source .venv/bin/activate   # Windows: .\.venv\Scripts\activate
+pip install --upgrade pip
+pip install -r requirements.txt
+```
 
-***
+### Environment variables & configuration
 
-## ⚙️ Architecture and Structure
+The default configuration works without extra environment variables. Customize by editing:
 
-The application follows a standard modular structure:
+| Setting | Location | Notes |
+| --- | --- | --- |
+| `SQLALCHEMY_DATABASE_URL` | `app/database.py` | Replace with PostgreSQL/MySQL URI for production. |
+| Static asset mounts | `app/main.py` | Update when serving images from S3/GCS/CDN instead of `app/assets/*`. |
+| Allowed CORS origins | `app/main.py` | Lock down before deploying publicly. |
+| JWT & email helpers | `app/utils/jwt_utils.py`, `app/utils/email_utils.py` | Plug in real secrets and transactional email providers. |
+| OneMap tokens | `app/utils/onemap_token_manager.py` | Provide credentials if you intend to call the geocoder live. |
+
+---
+
+## Running locally
+
+```bash
+uvicorn app.main:app --reload --port 8001
 ```
-/app
-├── /controllers        # Contains business logic (consumer_controller.py: hashing, user creation, retrieval).
-├── /models             # Contains SQLAlchemy definitions (user_model.py, consumer_model.py).
-├── /routes             # Contains FastAPI APIRouter definitions (consumer_route.py: API endpoints).
-├── /schemas            # Contains Pydantic data validation/serialization models (user_schema.py, consumer_schema.py).
-├── database.py         # Handles SQLAlchemy engine, session creation, and the Base object.
-└── main.py             # Initializes the FastAPI app, sets up CORS, and includes the routers.
-```
\ No newline at end of file
+
+- Swagger UI: http://localhost:8001/docs
+- ReDoc: http://localhost:8001/redoc
+- Static files: `/static/profiles`, `/static/business`, `/static/menu`, `/static/review`
+- Profiler: visit `/__pyinstrument__` while the server runs to inspect traces from `app/utils/profiler_middleware.py`.
+
+To run the API with auto-reload, keep the command above executing from the `backend/` directory so relative paths to `app/assets` resolve correctly.
+
+---
+
+## Database, models, and data seeding
+
+- The SQLite file is created at `backend/HawkerSG.db`. Delete it to reset the environment.
+- `create_db_and_tables()` in `app/database.py` runs during startup (see `app/main.py`).
+- Immediately after, `seed_sfa_data_if_empty()` hydrates hawker centres, stalls, menus, and default users if the relevant tables are empty. This makes repeated restarts idempotent.
+- Seed payloads live in [`backend/SFA/index.json`](SFA/index.json) and supporting folders such as `centres_output/` and `SFA-Scrape/`.
+
+### Refreshing SFA data
+
+1. Download/prepare updated data in `backend/SFA/SFA-Scrape/` or adjust the JSON transforms.
+2. Use the helper scripts:
+   - `python SFA/query_directory.py` – Inspect centres and stalls by name/postal code.
+   - `python SFA/fetch_stall_images.py` – Download referenced images into `app/assets`.
+   - `python SFA/geocoder.py` – Resolve addresses via OneMap if coordinates are missing.
+3. Remove `HawkerSG.db` (or the affected tables) and restart the server to trigger reseeding.
+
+### Data model highlights
+
+| Model | File | Purpose |
+| --- | --- | --- |
+| `User`, `Consumer`, `Business` | `app/models/user_model.py`, `consumer_model.py`, `business_model.py` | Authentication, profile ownership, and contact metadata. |
+| `HawkerCentre`, `Stall` | `app/models/hawker_model.py`, `stall_model.py` | Core catalogue objects, including location, cuisines, hours. |
+| `MenuItem`, `MenuCategory` | `app/models/menu_model.py` | Structured menus exposed to the frontend editors. |
+| `Review` | `app/models/review_model.py` | Ratings, comments, and moderation flags. |
+| `Favourite` | `app/models/favourite_model.py` | Many-to-many relationship linking consumers to saved stalls. |
+
+---
+
+## API surface
+
+| Router | Prefix | Description |
+| --- | --- | --- |
+| `app/routes/consumer_route.py` | `/consumers` | Sign-up/login, profile management, favourites bootstrap. |
+| `app/routes/business_route.py` | `/business` | CRUD for stall listings, menus, gallery assets. |
+| `app/routes/hawker_route.py` | `/hawkers` | Hawker centre directory, search, and detail endpoints. |
+| `app/routes/stall_route.py` | `/stalls` | Stall discovery, menu retrieval, and owner lookups. |
+| `app/routes/favourite_route.py` | `/favourites` | Save/remove/list favourite stalls for logged-in consumers. |
+| `app/routes/review_route.py` | `/reviews` | Submit reviews, fetch aggregated ratings, apply guardrails. |
+
+Routers depend on controller modules for validation and persistence logic. Authentication/authorization helpers sit in `app/controllers/consumer_controller.py` and `app/services/review_guard.py`.
+
+---
+
+## Static assets & uploads
+
+Image placeholders for profiles, menus, and reviews are stored in `app/assets/` and mounted as static directories inside `app/main.py`. When swapping to cloud storage, either update the mount paths or serve presigned URLs from the API responses.
+
+---
+
+## Tooling & developer experience
+
+- **Profiling:** PyInstrument middleware is enabled for every request; enable the toolbar via the `/__pyinstrument__` endpoint.
+- **Email stubs:** `app/utils/email_utils.py` contains placeholder functions; replace with a real SMTP/transactional provider when needed.
+- **JWT utilities:** `app/utils/jwt_utils.py` issues and verifies access tokens. Set strong secrets via environment variables before production deployment.
+- **Onemap integration:** `app/utils/onemap_token_manager.py` caches tokens for Singapore's OneMap API and is leveraged by `SFA/geocoder.py`.
+
+---
+
+## Deployment checklist
+
+1. Replace SQLite with a managed database by updating `SQLALCHEMY_DATABASE_URL` and creating the schema via Alembic or raw SQL.
+2. Configure environment secrets for JWT signing, SMTP providers, and OneMap credentials.
+3. Restrict CORS origins and HTTPS-only cookies to the production frontend domain.
+4. Move static assets to durable storage (S3/GCS) and update URL references in responses.
+5. Package the FastAPI app using Uvicorn + Gunicorn or another ASGI server, and configure a process manager (systemd, Supervisor, container orchestrator).
+6. Monitor health with structured logging (extend `app/main.py`) and consider enabling request metrics via Prometheus or OpenTelemetry.
+
+---
+
+## Troubleshooting tips
+
+| Symptom | Likely fix |
+| --- | --- |
+| `sqlite3.OperationalError: no such table ...` | Delete `HawkerSG.db` and restart to trigger `create_db_and_tables()` and seeding. |
+| Missing images in frontend | Confirm `app/assets/*` files exist and the backend is serving `/static/...` routes. |
+| 401 responses from protected endpoints | Ensure JWT headers are included; review helper functions in `app/utils/jwt_utils.py`. |
+| Geocoding failures | Provide valid OneMap credentials or run `SFA/geocoder.py` offline with cached coordinates. |
+
+For anything else, inspect the FastAPI logs (Uvicorn stdout) or instrument additional logging in the relevant controllers/routes.
 
EOF
)
