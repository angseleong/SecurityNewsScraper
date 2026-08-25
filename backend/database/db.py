import logging
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker, Session

from .models import Base, Article, CVE, ScrapeLog
from backend import config

logger = logging.getLogger(__name__)

_engine = None
_SessionFactory = None

def get_engine():
    global _engine
    if _engine is None:
        db_path = Path(__file__).parent.parent / config.DATABASE_PATH
        db_path.parent.mkdir(parents=True, exist_ok=True)
        _engine = create_engine(f"sqlite:///{db_path}", echo=False)
        logger.info("Database engine created at %s", db_path)
    return _engine

def get_session() -> Session:
    global _SessionFactory
    if _SessionFactory is None:
        _SessionFactory = sessionmaker(bind=get_engine())
    return _SessionFactory()

def init_db() -> None:
    Base.metadata.create_all(get_engine())
    logger.info("Database initialized.")

def save_article(processed) -> tuple[Article | None, bool]:
    """Save article to DB. Returns (article, is_new). Handles duplicates gracefully."""
    raw = processed.raw
    session = get_session()
    try:
        article = Article(
            source=raw.source,
            title=raw.title,
            url=raw.url,
            published_at=raw.published_at,
            summary=raw.summary,
            full_text=raw.full_text,
            severity=processed.severity,
            has_cve=bool(processed.cves),
            notified=False,
            scraped_at=datetime.now(timezone.utc),
        )
        session.add(article)
        session.commit()
        session.refresh(article)
        logger.debug("Saved article: %s", raw.url)
        return article, True
    except IntegrityError:
        session.rollback()
        logger.debug("Skipped duplicate: %s", raw.url)
        return None, False
    except Exception as exc:
        session.rollback()
        logger.error("Failed to save article [%s]: %s", raw.url, exc)
        return None, False
    finally:
        session.close()

def update_article_ai(article_id: int, ai_data: dict) -> None:
    session = get_session()
    try:
        article = session.query(Article).get(article_id)
        if article:
            article.ai_summary = ai_data.get("summary")
            article.ai_mitigation = ai_data.get("mitigation")
            article.ai_attack_vector = ai_data.get("attack_vector")
            article.ai_shodan_dork = ai_data.get("shodan_dork")
            session.commit()
    except Exception as e:
        logger.error("Failed to update AI fields for article %d: %s", article_id, e)
        session.rollback()
    finally:
        session.close()

def save_cves(cves: list[str], article_id: int, severity: str, software: list[str]) -> None:
    """Save extracted CVEs linked to an article."""
    if not cves:
        return
    session = get_session()
    try:
        for cve_id in cves:
            session.add(CVE(
                cve_id=cve_id,
                article_id=article_id,
                severity_hint=severity,
                affected_software=", ".join(software) if software else None,
            ))
        session.commit()
    except Exception as exc:
        session.rollback()
        logger.error("Failed to save CVEs for article_id=%s: %s", article_id, exc)
    finally:
        session.close()

def log_scrape_run(source: str, started_at: datetime, finished_at: datetime,
                   found: int, new: int, skipped: int,
                   status: str, error: str | None = None) -> None:
    """Record a scraping run to scrape_logs table."""
    session = get_session()
    try:
        session.add(ScrapeLog(
            source=source,
            started_at=started_at,
            finished_at=finished_at,
            articles_found=found,
            articles_new=new,
            articles_skipped=skipped,
            status=status,
            error_message=error,
        ))
        session.commit()
    except Exception as exc:
        session.rollback()
        logger.error("Failed to log scrape run [%s]: %s", source, exc)
    finally:
        session.close()

def mark_notified(article_id: int) -> None:
    session = get_session()
    try:
        article = session.query(Article).get(article_id)
        if article:
            article.notified = True
            session.commit()
    except Exception as exc:
        session.rollback()
        logger.error("Failed to mark article_id=%s as notified: %s", article_id, exc)
    finally:
        session.close()
