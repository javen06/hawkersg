from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))          # backend/app
DB_PATH = os.path.join(BASE_DIR, "../../../HawkerSG.db")       # up 3 levels to reach sc2006/

# Confirm full absolute path (helps you debug)
print(f"[DEBUG] Using database at: {os.path.abspath(DB_PATH)}")

# -----------------------------------------------------------
# Database connection setup
# -----------------------------------------------------------
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 30}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -----------------------------------------------------------
# Dependency function
# -----------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()