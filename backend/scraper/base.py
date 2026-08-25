import time
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime

from backend import config

logger = logging.getLogger(__name__)

@dataclass
class RawArticle:
    source: str
    title: str
    url: str
    published_at: datetime | None = None
    summary: str = ""
    full_text: str = ""

class BaseScraper(ABC):
    source_name: str = ""
    feed_url: str = ""

    def fetch(self) -> list[RawArticle]:
        raise NotImplementedError

    def fetch_full_text(self, url: str) -> str:
        return ""

    def _delay(self) -> None:
        time.sleep(config.REQUEST_DELAY_SECONDS)
