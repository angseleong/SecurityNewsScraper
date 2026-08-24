"""
api/routes.py — REST API route definitions for SecurityNewsScraper.
All endpoints return JSON and are consumed by the Next.js frontend.
"""

import logging
from flask import Flask, jsonify

logger = logging.getLogger(__name__)


def register_routes(app: Flask) -> None:
    """Register all API routes on the Flask app."""

    @app.get("/api/health")
    def health():
        """Health check endpoint."""
        return jsonify({"status": "ok", "service": "SecurityNewsScraper"})

    # ── Articles ───────────────────────────────────────────────────────────────
    @app.get("/api/articles")
    def get_articles():
        """Return paginated list of articles. (stub — Phase 5)"""
        return jsonify({"articles": [], "total": 0})

    # ── CVEs ───────────────────────────────────────────────────────────────────
    @app.get("/api/cves")
    def get_cves():
        """Return list of detected CVEs. (stub — Phase 5)"""
        return jsonify({"cves": [], "total": 0})

    # ── Stats ──────────────────────────────────────────────────────────────────
    @app.get("/api/stats")
    def get_stats():
        """Return aggregate statistics for the dashboard. (stub — Phase 5)"""
        return jsonify({
            "total_articles": 0,
            "total_cves": 0,
            "sources": {},
            "severity_breakdown": {},
        })

    # ── Manual Scrape Trigger ──────────────────────────────────────────────────
    @app.post("/api/scrape")
    def trigger_scrape():
        """Manually trigger a scraping run. (stub — Phase 5)"""
        logger.info("Manual scrape triggered via API")
        return jsonify({"status": "triggered", "message": "Scrape started in background."})
