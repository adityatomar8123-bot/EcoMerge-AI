import os
import shutil
import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

# Determine target database url
database_url = os.getenv("DATABASE_URL", settings.database_url)

# Check if running in a serverless environment (Vercel/Lambda)
is_serverless = os.getenv("VERCEL") == "1" or os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None

try:
    if database_url and ("postgresql" in database_url or "mysql" in database_url):
        # Check connection using a quick timeout
        engine = create_engine(database_url, future=True, connect_args={"connect_timeout": 3})
        with engine.connect() as conn:
            pass
        logger.info(f"Database connection successful to: {database_url.split('@')[-1]}")
    else:
        raise ValueError("Non-Postgres/MySQL URL detected, using SQLite fallback.")
except Exception as e:
    logger.warning(f"Failed to connect to primary database: {e}. Falling back to SQLite local database.")
    
    # Resolve the absolute path of ecosphere.db inside backend/app/
    local_db_path = Path(__file__).resolve().parent / "ecosphere.db"
    
    if is_serverless:
        # Vercel filesystem is read-only, copy seeded DB to /tmp
        tmp_db_path = "/tmp/ecosphere.db"
        if not os.path.exists(tmp_db_path):
            if local_db_path.exists():
                shutil.copy2(local_db_path, tmp_db_path)
                logger.info(f"Seeded SQLite DB copied to {tmp_db_path}")
            else:
                logger.warning(f"Seeded SQLite DB not found at {local_db_path}. Creating empty DB at {tmp_db_path}.")
        else:
            logger.info(f"Using existing SQLite DB at {tmp_db_path}")
            
        database_url = f"sqlite:///{tmp_db_path}"
    else:
        # Local development uses absolute path to backend/app/ecosphere.db
        database_url = f"sqlite:///{local_db_path}"
        
    engine = create_engine(database_url, future=True, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
