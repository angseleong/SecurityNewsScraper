import logging
import requests
from bs4 import BeautifulSoup
from backend import config

logger = logging.getLogger(__name__)

_CONTENT_TAGS = ["article", "main", "div"]
_CONTENT_IDS = ["article-body", "article-content", "post-content", "entry-content", "content"]

def fetch_full_text(url: str) -> str:
    try:
        resp = requests.get(
            url,
            timeout=config.REQUEST_TIMEOUT_SECONDS,
            headers={"User-Agent": "SecurityNewsScraper/1.0"},
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.warning("HTML fetch failed [%s]: %s", url, exc)
        return ""

    soup = BeautifulSoup(resp.text, "lxml")

    for tag in soup(["script", "style", "nav", "footer", "aside", "header"]):
        tag.decompose()

    content_el = None
    for id_ in _CONTENT_IDS:
        content_el = soup.find(id=id_)
        if content_el:
            break

    if not content_el:
        content_el = soup.find("article") or soup.find("main")

    if not content_el:
        content_el = soup.body

    if not content_el:
        return ""

    text = content_el.get_text(separator=" ", strip=True)
    import re
    text = re.sub(r"\s{2,}", " ", text)
    return text[:10000]
