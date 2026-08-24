"""
scheduler/jobs.py — APScheduler job definitions for SecurityNewsScraper.
"""

import logging
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)


def scrape_all_sources() -> None:
    """
    Main scraping job. Runs all source scrapers, extracts CVEs,
    saves to DB, and triggers Telegram notifications.
    Will be fully implemented in Phase 4.
    """
    logger.info("Scheduled scrape started. (stub — Phase 4)")


def start_scheduler() -> BackgroundScheduler:
    """
    Create, configure, and start the APScheduler background scheduler.
    Returns the running scheduler instance.
    """
    from backend import config

    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=scrape_all_sources,
        trigger="interval",
        hours=config.SCRAPE_INTERVAL_HOURS,
        id="scrape_all_sources",
        replace_existing=True,
        misfire_grace_time=1800,  # 30 minutes — run if server was briefly down
    )
    scheduler.start()
    logger.info(
        "Scheduler started. Scraping every %s hours.", config.SCRAPE_INTERVAL_HOURS
    )
    return scheduler
