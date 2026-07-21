from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Find any environment variable that looks like database_url (case-insensitive)
db_url_env = os.getenv("DATABASE_URL") or os.getenv("database_url") or os.getenv("Database_URL")

if db_url_env and db_url_env.startswith("postgres://"):
    db_url_env = db_url_env.replace("postgres://", "postgresql://", 1)

if os.getenv("RENDER") == "true" and not db_url_env:
    raise ValueError("FATAL: We are on Render but no DATABASE_URL environment variable was found! Please add it to your Render Environment Variables.")

SQLALCHEMY_DATABASE_URL = db_url_env if db_url_env else "sqlite:///./momentum.db"

# SQLite requires this connect_args to avoid threading issues
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
