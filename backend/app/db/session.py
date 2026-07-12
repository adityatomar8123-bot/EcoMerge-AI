import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

# Determine target database url
database_url = os.getenv("DATABASE_URL", settings.database_url)

# Setup engine with fallback to SQLite if PostgreSQL/MySQL connection fails or isn't running
try:
    if "postgresql" in database_url or "mysql" in database_url:
        # Check connection using a quick timeout
        engine = create_engine(database_url, future=True, connect_args={"connect_timeout": 3})
        with engine.connect() as conn:
            pass
        logger.info(f"Database connection successful to: {database_url.split('@')[-1]}")
    else:
        raise ValueError("Non-Postgres/MySQL URL detected, using SQLite fallback.")
except Exception as e:
    logger.warning(f"Failed to connect to primary database: {e}. Falling back to SQLite local database.")
    database_url = "sqlite:///./ecosphere.db"
    engine = create_engine(database_url, future=True, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


