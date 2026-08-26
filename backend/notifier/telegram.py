import logging
import asyncio
from telegram import Bot
from telegram.constants import ParseMode
from telegram.error import RetryAfter, TimedOut, NetworkError
from backend import config
from backend.database.models import Article

logger = logging.getLogger(__name__)

SEV_LEVELS = {"info": 0, "medium": 1, "high": 2, "critical": 3}

def should_notify(article: Article) -> bool:
    min_level = SEV_LEVELS.get(config.ALERT_MIN_SEVERITY, 2)
    art_level = SEV_LEVELS.get(article.severity or "info", 0)
    
    if art_level >= min_level:
        return True
        
    text_to_check = f"{article.title} {article.summary or ''} {article.ai_summary or ''}".lower()
    from backend.database.db import get_watchlist_keywords
    keywords = [k["keyword"].lower() for k in get_watchlist_keywords()] or [k.lower() for k in config.ALERT_KEYWORDS]
    for kw in keywords:
        if kw in text_to_check:
            return True
            
    return False

async def _send_async(bot: Bot, text: str) -> None:
    for attempt in range(3):
        try:
            await bot.send_message(
                chat_id=config.TELEGRAM_CHAT_ID,
                text=text,
                parse_mode=ParseMode.HTML,
                disable_web_page_preview=True,
            )
            return
        except RetryAfter as e:
            logger.warning(f"Rate limited by Telegram. Waiting {e.retry_after}s...")
            await asyncio.sleep(e.retry_after)
        except (TimedOut, NetworkError) as e:
            logger.warning(f"Telegram network error: {e}. Retrying {attempt+1}/3...")
            await asyncio.sleep(2 ** attempt)
    raise Exception("Max retries exceeded sending to Telegram.")

def send_alert(article: Article, cves: list[str]) -> bool:
    if not config.TELEGRAM_BOT_TOKEN or not config.TELEGRAM_CHAT_ID:
        logger.warning("Telegram credentials not configured, skipping alert.")
        return False

    bot = Bot(token=config.TELEGRAM_BOT_TOKEN)
    
    sev_emoji = {
        "critical": "🚨",
        "high": "🔴",
        "medium": "🟠",
        "info": "ℹ️"
    }.get(article.severity or "info", "ℹ️")

    cves_text = f"\n<b>CVEs:</b> {', '.join(cves)}" if cves else ""
    sev_text = (article.severity or "info").upper()
    
    # AI Details
    ai_text = ""
    if article.ai_summary:
        ai_text += f"\n\n🤖 <b>AI Intel:</b>\n{article.ai_summary}"
        if article.ai_attack_vector:
            ai_text += f"\n<b>Attack Vector:</b> {article.ai_attack_vector}"
        if article.ai_mitigation:
            ai_text += f"\n<b>Mitigation:</b> {article.ai_mitigation}"
        if article.ai_shodan_dork:
            ai_text += f"\n<b>Shodan Dork:</b> <code>{article.ai_shodan_dork}</code>"
    
    text = f"""{sev_emoji} <b>{sev_text} Alert</b>
<b>{article.title}</b>
<b>Source:</b> {article.source}{cves_text}{ai_text}

{article.url}"""

    try:
        asyncio.run(_send_async(bot, text))
        logger.info(f"Telegram alert sent for {article.id}")
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram alert for {article.url}: {e}")
        return False
