"""
config.py — Central configuration loader for SecurityNewsScraper backend.
Reads all settings from the .env file via python-dotenv.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend/ directory
load_dotenv(dotenv_path=Path(__file__).parent / ".env")


# ── Alerts & Notifications ───────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")
DISCORD_WEBHOOK_URL: str = os.getenv("DISCORD_WEBHOOK_URL", "")

# ── Gemini AI ──────────────────────────────────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

# ── Scraping ───────────────────────────────────────────────────────────────────
SCRAPE_INTERVAL_HOURS: int = int(os.getenv("SCRAPE_INTERVAL_HOURS", "6"))
REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "15"))
REQUEST_DELAY_SECONDS: float = float(os.getenv("REQUEST_DELAY_SECONDS", "2"))

# ── Alert Rules ────────────────────────────────────────────────────────────────
_raw_keywords: str = os.getenv("ALERT_KEYWORDS", "")
ALERT_KEYWORDS: list[str] = [kw.strip() for kw in _raw_keywords.split(",") if kw.strip()]
ALERT_MIN_SEVERITY: str = os.getenv("ALERT_MIN_SEVERITY", "high").lower()

# ── Database ───────────────────────────────────────────────────────────────────
DATABASE_PATH: str = os.getenv("DATABASE_PATH", "data/security_news.db")

# ── Flask ──────────────────────────────────────────────────────────────────────
FLASK_SECRET_KEY: str = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
FLASK_DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"
PORT: int = int(os.getenv("PORT", "5000"))
ADMIN_SECRET: str = os.getenv("ADMIN_SECRET", "super-secret-admin-key")

# ── News Sources ───────────────────────────────────────────────────────────────
# List of active scrapers. Add/remove sources here — never hardcode in business logic.
NEWS_SOURCES: list[str] = [
    "thehackernews",
    "bleepingcomputer",
    "krebsonsecurity",
    "securityweek",
]
