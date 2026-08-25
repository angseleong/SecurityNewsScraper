from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, relationship

class Base(DeclarativeBase):
    pass

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(100), nullable=False)
    title = Column(Text, nullable=False)
    url = Column(Text, nullable=False, unique=True)
    published_at = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=True)
    full_text = Column(Text, nullable=True)
    severity = Column(String(20), nullable=True)
    has_cve = Column(Boolean, default=False, nullable=False)
    notified = Column(Boolean, default=False, nullable=False)
    scraped_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    ai_summary = Column(Text, nullable=True)
    ai_mitigation = Column(Text, nullable=True)
    ai_attack_vector = Column(Text, nullable=True)
    ai_shodan_dork = Column(Text, nullable=True)

    cves = relationship("CVE", back_populates="article", cascade="all, delete-orphan")
    __table_args__ = (UniqueConstraint("url", name="uq_article_url"),)

class CVE(Base):
    __tablename__ = "cves"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cve_id = Column(String(30), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    severity_hint = Column(String(20), nullable=True)
    affected_software = Column(Text, nullable=True)
    cvss_score = Column(Float, nullable=True)

    article = relationship("Article", back_populates="cves")

class ScrapeLog(Base):
    __tablename__ = "scrape_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(100), nullable=False)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    articles_found = Column(Integer, default=0)
    articles_new = Column(Integer, default=0)
    articles_skipped = Column(Integer, default=0)
    status = Column(String(20), nullable=False)
    error_message = Column(Text, nullable=True)
