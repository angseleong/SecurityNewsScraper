"""
database/db.py — Database connection and session management.
All database operations must go through this module.
"""

import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from .models import Base
from backend import config

logger = logging.getLogger(__name__)

_engine = None
_SessionFactory = None


def get_engine():
    """Return the SQLAlchemy engine, creating it on first call."""
    global _engine
    if _engine is None:
        db_path = Path(__file__).parent.parent / config.DATABASE_PATH
        db_path.parent.mkdir(parents=True, exist_ok=True)
        _engine = create_engine(f"sqlite:///{db_path}", echo=False)
        logger.info("Database engine created at %s", db_path)
    return _engine


def get_session() -> Session:
    """Return a new database session."""
    global _SessionFactory
    if _SessionFactory is None:
        _SessionFactory = sessionmaker(bind=get_engine())
    return _SessionFactory()


def init_db() -> None:
    """Create all tables if they don't exist yet."""
    Base.metadata.create_all(get_engine())
    logger.info("Database initialized — all tables created.")
