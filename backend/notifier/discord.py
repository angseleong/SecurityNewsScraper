import logging
import requests
from backend import config
from backend.database.models import Article

logger = logging.getLogger(__name__)

def send_alert(article: Article) -> bool:
    """Send an alert to Discord via Webhook. Returns True if successful."""
    if not config.DISCORD_WEBHOOK_URL:
        return False
        
    severity_colors = {
        "critical": 16711680, # Red
        "high": 16737792,     # Orange
        "medium": 16753920,   # Yellow
        "info": 3394815,      # Blue
    }
    
    color = severity_colors.get(article.severity.lower() if article.severity else "info", 3394815)
    
    embed = {
        "title": article.title,
        "url": article.url,
        "color": color,
        "author": {
            "name": article.source
        },
        "description": article.ai_summary or article.summary or "No summary available.",
        "fields": [
            {"name": "Severity", "value": (article.severity or "INFO").upper(), "inline": True},
            {"name": "Has CVE", "value": "Yes" if article.has_cve else "No", "inline": True}
        ],
        "footer": {
            "text": "SecurityNewsScraper Intel"
        }
    }
    
    payload = {
        "username": "Threat Intel Bot",
        "embeds": [embed]
    }
    
    try:
        resp = requests.post(config.DISCORD_WEBHOOK_URL, json=payload, timeout=10)
        resp.raise_for_status()
        logger.info(f"Discord alert sent for article: {article.title}")
        return True
    except Exception as e:
        logger.error(f"Failed to send Discord alert: {e}")
        return False
