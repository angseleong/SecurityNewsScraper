import logging
from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler

from backend import config
from backend.database.db import init_db, save_article, save_cves, log_scrape_run
from backend.extractor import process_article
from backend.scraper.sources.bleepingcomputer import BleepingComputerScraper
from backend.scraper.sources.thehackernews import TheHackerNewsScraper
from backend.scraper.sources.krebsonsecurity import KrebsOnSecurityScraper
from backend.scraper.sources.securityweek import SecurityWeekScraper

logger = logging.getLogger(__name__)

_SCRAPERS = [
    BleepingComputerScraper,
    TheHackerNewsScraper,
    KrebsOnSecurityScraper,
    SecurityWeekScraper,
]

def scrape_all_sources() -> None:
    logger.info("Scrape job started.")
    init_db()
    for ScraperCls in _SCRAPERS:
        scraper = ScraperCls()
        started = datetime.now(timezone.utc)
        new = skipped = 0
        status = "success"
        error_msg = None
        try:
            raw_articles = scraper.fetch()
            for raw in raw_articles:
                processed = process_article(raw)
                article, is_new = save_article(processed)
                if is_new and article:
                    cve_models = save_cves(processed.cves, article.id, processed.severity, processed.affected_software)
                    if cve_models:
                        from backend.database.db import get_session
                        from backend.extractor.cve_enricher import enrich_cves_in_db
                        s = get_session()
                        try:
                            # Refetch models in current session
                            from backend.database.models import CVE
                            cves_in_db = s.query(CVE).filter(CVE.id.in_([c.id for c in cve_models])).all()
                            enrich_cves_in_db(s, cves_in_db)
                        finally:
                            s.close()
                    
                    # ── AI Analysis ──
                    import time
                    from backend.extractor.ai_analyzer import analyze_article
                    from backend.database.db import update_article_ai
                    
                    text_to_analyze = f"{raw.title}\n{raw.summary}\n{raw.full_text}"
                    
                    # Be nice to Gemini (Free Tier = 15 RPM). Delay 5s per article.
                    time.sleep(5)
                    
                    ai_data = analyze_article(text_to_analyze)
                    if ai_data:
                        update_article_ai(article.id, ai_data)
                    
                    new += 1
                    
                    from backend.notifier.telegram import should_notify, send_alert as send_telegram
                    from backend.notifier.discord import send_alert as send_discord
                    from backend.database.db import mark_notified
                    if should_notify(article):
                        notified_tg = send_telegram(article, processed.cves)
                        notified_dc = send_discord(article)
                        if notified_tg or notified_dc:
                            mark_notified(article.id)
                else:
                    skipped += 1
            logger.info("[%s] new=%d skipped=%d", scraper.source_name, new, skipped)
        except Exception as exc:
            status = "failed"
            error_msg = str(exc)
            logger.error("[%s] scrape failed: %s", scraper.source_name, exc)
        finally:
            log_scrape_run(
                source=scraper.source_name,
                started_at=started,
                finished_at=datetime.now(timezone.utc),
                found=new + skipped,
                new=new,
                skipped=skipped,
                status=status,
                error=error_msg,
            )
    logger.info("Scrape job finished.")

def start_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=scrape_all_sources,
        trigger="interval",
        hours=config.SCRAPE_INTERVAL_HOURS,
        id="scrape_all_sources",
        replace_existing=True,
        misfire_grace_time=1800,
    )
    scheduler.start()
    logger.info("Scheduler started. Interval: every %s hours.", config.SCRAPE_INTERVAL_HOURS)
    return scheduler
