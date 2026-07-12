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
    
    # 1. Start with the default expected location: backend/app/db/ecosphere.db
    local_db_path = Path(__file__).resolve().parent / "ecosphere.db"
    
    # 2. Traverse up and search recursively if the file isn't found at the default path
    if not local_db_path.exists():
        logger.info(f"DB not found at default: {local_db_path}. Searching parent directories...")
        search_dir = Path(__file__).resolve().parent
        found = False
        # Search up to 5 levels up for any 'ecosphere.db'
        for i in range(5):
            # Check direct candidate: search_dir / "ecosphere.db"
            candidate = search_dir / "ecosphere.db"
            if candidate.exists():
                local_db_path = candidate
                found = True
                logger.info(f"Found DB at candidate path: {local_db_path}")
                break
            
            # Check nested candidates
            for sub in ["backend/app/db/ecosphere.db", "app/db/ecosphere.db"]:
                candidate_nested = search_dir / sub
                if candidate_nested.exists():
                    local_db_path = candidate_nested
                    found = True
                    logger.info(f"Found DB at nested candidate path: {local_db_path}")
                    break
            
            if found:
                break
            search_dir = search_dir.parent
            
    # 3. Handle serverless environment copy or normal local path
    if is_serverless:
        tmp_db_path = "/tmp/ecosphere.db"
        if not os.path.exists(tmp_db_path):
            if local_db_path.exists():
                shutil.copy2(local_db_path, tmp_db_path)
                logger.info(f"Seeded SQLite DB successfully copied from {local_db_path} to {tmp_db_path}")
            else:
                logger.error(f"CRITICAL: Seeded SQLite DB not found anywhere! Looked up to parent dirs. Creating empty DB at {tmp_db_path}")
        else:
            logger.info(f"Using existing SQLite DB at {tmp_db_path}")
            
        database_url = f"sqlite:///{tmp_db_path}"
    else:
        database_url = f"sqlite:///{local_db_path}"
        logger.info(f"Connecting to local SQLite DB at: {local_db_path}")
        
    engine = create_engine(database_url, future=True, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
