import logging
import threading
from flask import Flask, jsonify, request
from backend.database.db import get_session, init_db
from backend.database.models import Article, CVE, ScrapeLog

logger = logging.getLogger(__name__)


def register_routes(app: Flask) -> None:

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "SecurityNewsScraper"})

    @app.get("/api/articles")
    def get_articles():
        session = get_session()
        try:
            q = session.query(Article)

            source = request.args.get("source")
            severity = request.args.get("severity")
            has_cve = request.args.get("has_cve")
            search = request.args.get("q")
            page = max(1, int(request.args.get("page", 1)))
            per_page = 20

            if source:
                q = q.filter(Article.source == source)
            if severity:
                q = q.filter(Article.severity == severity)
            if has_cve is not None:
                q = q.filter(Article.has_cve == (has_cve.lower() == "true"))
            if search:
                like = f"%{search}%"
                q = q.filter(Article.title.ilike(like) | Article.summary.ilike(like))

            total = q.count()
            articles = q.order_by(Article.scraped_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

            return jsonify({
                "articles": [
                    {
                        "id": a.id,
                        "source": a.source,
                        "title": a.title,
                        "url": a.url,
                        "published_at": a.published_at.isoformat() if a.published_at else None,
                        "summary": a.summary,
                        "severity": a.severity,
                        "has_cve": a.has_cve,
                        "notified": a.notified,
                        "scraped_at": a.scraped_at.isoformat(),
                    }
                    for a in articles
                ],
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": (total + per_page - 1) // per_page,
            })
        finally:
            session.close()

    @app.get("/api/cves")
    def get_cves():
        session = get_session()
        try:
            q = session.query(CVE)

            search = request.args.get("q")
            severity = request.args.get("severity")
            if search:
                q = q.filter(CVE.cve_id.ilike(f"%{search}%"))
            if severity:
                q = q.filter(CVE.severity_hint == severity)

            cves = q.order_by(CVE.id.desc()).limit(200).all()
            return jsonify({
                "cves": [
                    {
                        "id": c.id,
                        "cve_id": c.cve_id,
                        "article_id": c.article_id,
                        "severity_hint": c.severity_hint,
                        "affected_software": c.affected_software,
                        "cvss_score": c.cvss_score,
                    }
                    for c in cves
                ],
                "total": q.count(),
            })
        finally:
            session.close()

    @app.get("/api/stats")
    def get_stats():
        session = get_session()
        try:
            total_articles = session.query(Article).count()
            total_cves = session.query(CVE).count()

            sources = {}
            from sqlalchemy import func
            for source, count in session.query(Article.source, func.count(Article.id)).group_by(Article.source).all():
                sources[source] = count

            severity_breakdown = {}
            for sev, count in session.query(Article.severity, func.count(Article.id)).group_by(Article.severity).all():
                severity_breakdown[sev or "info"] = count

            last_log = session.query(ScrapeLog).order_by(ScrapeLog.finished_at.desc()).first()

            return jsonify({
                "total_articles": total_articles,
                "total_cves": total_cves,
                "sources": sources,
                "severity_breakdown": severity_breakdown,
                "last_scrape": last_log.finished_at.isoformat() if last_log and last_log.finished_at else None,
            })
        finally:
            session.close()

    @app.post("/api/scrape")
    def trigger_scrape():
        def _run():
            from backend.scheduler.jobs import scrape_all_sources
            init_db()
            scrape_all_sources()

        thread = threading.Thread(target=_run, daemon=True)
        thread.start()
        logger.info("Manual scrape triggered via API")
        return jsonify({"status": "triggered", "message": "Scrape started in background."})

