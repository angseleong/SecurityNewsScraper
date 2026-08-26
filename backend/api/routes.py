import logging
import threading
from flask import Flask, jsonify, request
from backend.database.db import get_session, init_db
from backend.database.models import Article, CVE, ScrapeLog

logger = logging.getLogger(__name__)


def register_routes(app: Flask) -> None:

    @app.get("/")
    def index():
        return jsonify({"status": "SecurityNewsScraper API is running", "endpoints": ["/api/articles", "/api/cves", "/api/stats"]})

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "SecurityNewsScraper"})

    @app.get("/api/articles")
    def get_articles():
        from datetime import datetime, timedelta, timezone
        from backend import config
        session = get_session()
        try:
            q = session.query(Article)

            source = request.args.get("source")
            severity = request.args.get("severity")
            has_cve = request.args.get("has_cve")
            search = request.args.get("q")
            time_range = request.args.get("time_range")
            sort = request.args.get("sort", "time_desc")
            page = max(1, int(request.args.get("page", 1)))
            per_page = 20

            if source:
                q = q.filter(Article.source == source)
            if severity:
                q = q.filter(Article.severity == severity)
            if has_cve is not None:
                q = q.filter(Article.has_cve == (has_cve.lower() == "true"))
            
            if time_range:
                now = datetime.now(timezone.utc)
                if time_range == "today":
                    threshold = now - timedelta(days=1)
                    q = q.filter((Article.published_at >= threshold) | (Article.scraped_at >= threshold))
                elif time_range == "week":
                    threshold = now - timedelta(days=7)
                    q = q.filter((Article.published_at >= threshold) | (Article.scraped_at >= threshold))

            if search:
                like = f"%{search}%"
                from sqlalchemy import or_
                # Subquery to check if there's any related CVE matching the search
                has_matching_cve = session.query(CVE.article_id).filter(
                    or_(
                        CVE.cve_id.ilike(like),
                        CVE.affected_software.ilike(like)
                    )
                ).subquery()
                
                q = q.filter(
                    or_(
                        Article.title.ilike(like),
                        Article.summary.ilike(like),
                        Article.ai_summary.ilike(like),
                        Article.ai_mitigation.ilike(like),
                        Article.ai_attack_vector.ilike(like),
                        Article.id.in_(has_matching_cve)
                    )
                )

            total = q.count()
            
            if sort == "severity_desc":
                from sqlalchemy import case
                sev_order = case(
                    (Article.severity == 'critical', 4),
                    (Article.severity == 'high', 3),
                    (Article.severity == 'medium', 2),
                    (Article.severity == 'info', 1),
                    else_=0
                )
                q = q.order_by(sev_order.desc(), Article.published_at.desc(), Article.scraped_at.desc())
            elif sort == "time_asc":
                q = q.order_by(Article.published_at.asc(), Article.scraped_at.asc())
            else:
                q = q.order_by(Article.published_at.desc(), Article.scraped_at.desc())
                
            articles = q.offset((page - 1) * per_page).limit(per_page).all()

            from backend.database.models import WatchlistKeyword
            db_kws = session.query(WatchlistKeyword).all()
            active_keywords = [k.keyword.lower() for k in db_kws] or [k.lower() for k in config.ALERT_KEYWORDS]

            def is_watchlist(a: Article) -> bool:
                text_to_check = f"{a.title} {a.summary or ''} {a.ai_summary or ''}".lower()
                for kw in active_keywords:
                    if kw in text_to_check:
                        return True
                return False

            result_articles = []
            if articles:
                article_ids = [a.id for a in articles]
                cves_list = session.query(CVE).filter(CVE.article_id.in_(article_ids)).all()
                cves_by_article = {}
                cve_ids_found = set()
                for c in cves_list:
                    cves_by_article.setdefault(c.article_id, []).append(c)
                    cve_ids_found.add(c.cve_id)
                
                related_articles_by_cve = {}
                if cve_ids_found:
                    from sqlalchemy import and_
                    related_cves = session.query(CVE).filter(
                        CVE.cve_id.in_(cve_ids_found),
                        CVE.article_id.notin_(article_ids)
                    ).all()
                    
                    related_article_ids = list(set(c.article_id for c in related_cves))
                    if related_article_ids:
                        related_arts = session.query(Article).filter(Article.id.in_(related_article_ids)).all()
                        arts_by_id = {a.id: a for a in related_arts}
                        for c in related_cves:
                            if c.article_id in arts_by_id:
                                related_articles_by_cve.setdefault(c.cve_id, []).append(arts_by_id[c.article_id])

                for a in articles:
                    a_cves = cves_by_article.get(a.id, [])
                    related = []
                    seen_related_ids = set()
                    for c in a_cves:
                        for rel_a in related_articles_by_cve.get(c.cve_id, []):
                            if rel_a.id not in seen_related_ids:
                                seen_related_ids.add(rel_a.id)
                                related.append({
                                    "id": rel_a.id,
                                    "title": rel_a.title,
                                    "source": rel_a.source,
                                    "url": rel_a.url
                                })
                                
                    result_articles.append({
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
                        "ai_summary": a.ai_summary,
                        "ai_mitigation": a.ai_mitigation,
                        "ai_attack_vector": a.ai_attack_vector,
                        "ai_shodan_dork": a.ai_shodan_dork,
                        "watchlist_match": is_watchlist(a),
                        "cves_detail": [
                            {
                                "cve_id": c.cve_id,
                                "epss_score": c.epss_score,
                                "cisa_kev": c.cisa_kev,
                                "poc_url": c.poc_url,
                            } for c in a_cves
                        ],
                        "related_articles": related,
                    })

            return jsonify({
                "articles": result_articles,
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
            sort = request.args.get("sort", "time_desc")
            if search:
                q = q.filter(CVE.cve_id.ilike(f"%{search}%"))
            if severity:
                q = q.filter(CVE.severity_hint == severity)

            if sort == "severity_desc":
                from sqlalchemy import case
                sev_order = case(
                    (CVE.severity_hint == 'critical', 4),
                    (CVE.severity_hint == 'high', 3),
                    (CVE.severity_hint == 'medium', 2),
                    (CVE.severity_hint == 'info', 1),
                    else_=0
                )
                q = q.order_by(sev_order.desc(), CVE.id.desc())
            elif sort == "epss_desc":
                q = q.order_by(CVE.epss_score.desc().nulls_last(), CVE.id.desc())
            elif sort == "time_asc":
                q = q.order_by(CVE.id.asc())
            else:
                q = q.order_by(CVE.id.desc())

            cves = q.limit(200).all()
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

            # Incident Trends (Last 7 days approx, grouped by published_at)
            incident_trends = []
            try:
                date_func = func.strftime('%Y-%m-%d', func.coalesce(Article.published_at, Article.scraped_at))
                trends_data = session.query(date_func.label('day'), func.count(Article.id)).group_by('day').order_by(date_func.desc()).limit(7).all()
                for day, count in reversed(trends_data):
                    incident_trends.append({"date": day, "count": count})
            except Exception as e:
                logger.error(f"Error computing trends: {e}")

            # Top Software
            top_software = []
            try:
                cves = session.query(CVE.affected_software).filter(CVE.affected_software != None).all()
                software_counts = {}
                for c in cves:
                    sw_list = [s.strip() for s in c.affected_software.split(",") if s.strip()]
                    for sw in sw_list:
                        software_counts[sw] = software_counts.get(sw, 0) + 1
                sorted_sw = sorted(software_counts.items(), key=lambda x: x[1], reverse=True)[:5]
                for sw, count in sorted_sw:
                    top_software.append({"name": sw, "count": count})
            except Exception as e:
                logger.error(f"Error computing top software: {e}")

            last_log = session.query(ScrapeLog).order_by(ScrapeLog.finished_at.desc()).first()

            return jsonify({
                "total_articles": total_articles,
                "total_cves": total_cves,
                "sources": sources,
                "severity_breakdown": severity_breakdown,
                "incident_trends": incident_trends,
                "top_software": top_software,
                "last_scrape": last_log.finished_at.isoformat() if last_log and last_log.finished_at else None,
            })
        finally:
            session.close()

    @app.post("/api/scrape")
    def trigger_scrape():
        from backend import config
        if request.headers.get("X-Admin-Secret") != config.ADMIN_SECRET:
            return jsonify({"error": "Unauthorized"}), 401
            
        def _run():
            from backend.scheduler.jobs import scrape_all_sources
            init_db()
            scrape_all_sources()

        thread = threading.Thread(target=_run, daemon=True)
        thread.start()
        logger.info("Manual scrape triggered via API")
        return jsonify({"status": "triggered", "message": "Scrape started in background."})

    @app.post("/api/enrich")
    def trigger_enrich():
        from backend import config
        if request.headers.get("X-Admin-Secret") != config.ADMIN_SECRET:
            return jsonify({"error": "Unauthorized"}), 401
            
        def _run():
            from backend.extractor.cve_enricher import enrich_cves_in_db
            session = get_session()
            try:
                # Find CVEs that are missing EPSS
                cves = session.query(CVE).filter(CVE.epss_score.is_(None)).all()
                if cves:
                    logger.info(f"Starting background enrichment for {len(cves)} CVEs...")
                    enrich_cves_in_db(session, cves)
                    logger.info("Background enrichment completed.")
            except Exception as e:
                logger.error(f"Background enrich failed: {e}")
            finally:
                session.close()

        thread = threading.Thread(target=_run, daemon=True)
        thread.start()
        logger.info("Manual enrich triggered via API")
        return jsonify({"status": "triggered", "message": "Enrichment started in background."})

    @app.get("/api/feed.xml")
    def get_rss_feed():
        from flask import make_response
        from datetime import datetime, timedelta, timezone
        from xml.sax.saxutils import escape
        
        session = get_session()
        try:
            threshold = datetime.now(timezone.utc) - timedelta(days=7)
            articles = session.query(Article).filter(Article.published_at >= threshold).order_by(Article.published_at.desc()).limit(100).all()
            
            items = []
            for a in articles:
                pub_date = (a.published_at or a.scraped_at).strftime("%a, %d %b %Y %H:%M:%S GMT")
                desc = escape(a.summary or a.ai_summary or "")
                items.append(f"""
    <item>
      <title>{escape(a.title)}</title>
      <link>{escape(a.url)}</link>
      <description>{desc}</description>
      <pubDate>{pub_date}</pubDate>
      <guid>{escape(a.url)}</guid>
    </item>""")
            
            rss_xml = f"""<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Security News Scraper Intel</title>
    <link>http://localhost:3000</link>
    <description>Latest cybersecurity threats and vulnerabilities.</description>
    {''.join(items)}
  </channel>
</rss>"""
            response = make_response(rss_xml)
            response.headers["Content-Type"] = "application/rss+xml"
            return response
        finally:
            session.close()

    @app.get("/api/report/weekly.csv")
    def get_weekly_csv():
        from flask import make_response
        from datetime import datetime, timedelta, timezone
        import csv
        import io
        
        session = get_session()
        try:
            threshold = datetime.now(timezone.utc) - timedelta(days=7)
            articles = session.query(Article).filter(Article.published_at >= threshold).order_by(Article.published_at.desc()).all()
            
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["ID", "Source", "Title", "URL", "Severity", "Has CVE", "Published At", "AI Summary"])
            
            for a in articles:
                writer.writerow([
                    a.id, a.source, a.title, a.url, a.severity, a.has_cve,
                    a.published_at.isoformat() if a.published_at else "",
                    a.ai_summary or ""
                ])
                
            response = make_response(output.getvalue())
            response.headers["Content-Disposition"] = "attachment; filename=weekly_report.csv"
            response.headers["Content-type"] = "text/csv"
            return response
        finally:
            session.close()

    @app.get("/api/watchlist")
    def get_watchlist():
        from backend.database.db import get_watchlist_keywords
        return jsonify({"keywords": get_watchlist_keywords()})

    @app.post("/api/watchlist")
    def create_watchlist_keyword():
        from backend.database.db import add_watchlist_keyword
        data = request.get_json(silent=True) or {}
        keyword = data.get("keyword", "").strip()
        if not keyword:
            return jsonify({"error": "Keyword is required"}), 400
        
        result = add_watchlist_keyword(keyword)
        if not result:
            return jsonify({"error": "Keyword already exists or invalid"}), 409
        return jsonify({"status": "created", "keyword": result}), 201

    @app.delete("/api/watchlist/<int:kw_id>")
    def delete_watchlist_kw(kw_id: int):
        from backend.database.db import delete_watchlist_keyword
        success = delete_watchlist_keyword(kw_id)
        if not success:
            return jsonify({"error": "Keyword not found"}), 404
        return jsonify({"status": "deleted", "id": kw_id})


