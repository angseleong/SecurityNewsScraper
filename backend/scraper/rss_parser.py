"""
rss_parser.py — Generic RSS fetcher menggunakan feedparser.
Dipakai oleh semua source scraper.
"""

import logging
from datetime import datetime, timezone

import feedparser
import requests

from backend import config
from backend.scraper.base import BaseScraper, RawArticle

logger = logging.getLogger(__name__)


def _parse_time(entry: feedparser.FeedParserDict) -> datetime | None:
    t = entry.get("published_parsed") or entry.get("updated_parsed")
    if t is None:
        return None
    try:
        v = list(t)
        return datetime(int(v[0]), int(v[1]), int(v[2]), int(v[3]), int(v[4]), int(v[5]), tzinfo=timezone.utc)
    except Exception:
        return None


class RSSParser(BaseScraper):
    def fetch(self) -> list[RawArticle]:
        logger.info("Fetching RSS: %s (%s)", self.source_name, self.feed_url)
        try:
            resp = requests.get(
                self.feed_url,
                timeout=config.REQUEST_TIMEOUT_SECONDS,
                headers={"User-Agent": "SecurityNewsScraper/1.0"},
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            logger.error("RSS fetch failed [%s]: %s", self.source_name, exc)
            return []

        feed = feedparser.parse(resp.content)
        articles: list[RawArticle] = []

        for entry in feed.entries:
            url = str(entry.get("link", "")).strip()
            title = str(entry.get("title", "")).strip()
            if not url or not title:
                continue

            summary = str(entry.get("summary", "") or entry.get("description", ""))
            import re
            summary = re.sub(r"<[^>]+>", " ", summary).strip()

            articles.append(
                RawArticle(
                    source=self.source_name,
                    title=title,
                    url=url,
                    published_at=_parse_time(entry),
                    summary=summary[:2000],
                )
            )

        logger.info("Fetched %d articles from %s", len(articles), self.source_name)
        return articles
