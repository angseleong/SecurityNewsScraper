"""
database/models.py — SQLAlchemy ORM table definitions.
Schema: articles, cves, scrape_logs.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Article(Base):
    """Stores scraped news articles from security portals."""

    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(100), nullable=False)
    title = Column(Text, nullable=False)
    url = Column(Text, nullable=False, unique=True)   # UNIQUE — basis deduplication
    published_at = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=True)
    full_text = Column(Text, nullable=True)
    severity = Column(String(20), nullable=True)       # critical / high / medium / info
    has_cve = Column(Boolean, default=False, nullable=False)
    notified = Column(Boolean, default=False, nullable=False)  # Telegram sent?
    scraped_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    cves = relationship("CVE", back_populates="article", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("url", name="uq_article_url"),)

    def __repr__(self) -> str:
        return f"<Article id={self.id} source={self.source!r} severity={self.severity!r}>"


class CVE(Base):
    """Stores CVE identifiers extracted from articles."""

    __tablename__ = "cves"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cve_id = Column(String(30), nullable=False)        # e.g. CVE-2024-12345
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    severity_hint = Column(String(20), nullable=True)  # Estimated from article context
    affected_software = Column(Text, nullable=True)    # Comma-separated software names
    cvss_score = Column(Float, nullable=True)

    article = relationship("Article", back_populates="cves")

    def __repr__(self) -> str:
        return f"<CVE {self.cve_id} article_id={self.article_id}>"


class ScrapeLog(Base):
    """Records the outcome of every scraping run — success or failure."""

    __tablename__ = "scrape_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(100), nullable=False)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    articles_found = Column(Integer, default=0)
    articles_new = Column(Integer, default=0)
    articles_skipped = Column(Integer, default=0)      # Duplicates
    status = Column(String(20), nullable=False)        # success / failed
    error_message = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<ScrapeLog source={self.source!r} status={self.status!r}>"
