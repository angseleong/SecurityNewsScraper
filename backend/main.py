import logging
import logging.handlers
from pathlib import Path
from backend.api import create_app
from backend.database.db import init_db
from backend.scheduler.jobs import start_scheduler
import backend.config as config

_log_dir = Path(__file__).parent / "logs"
_log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(),
        logging.handlers.RotatingFileHandler(
            _log_dir / "scraper.log", maxBytes=5_000_000, backupCount=3
        ),
    ],
)
logger = logging.getLogger(__name__)

def main() -> None:
    init_db()
    app = create_app()
    scheduler = start_scheduler()
    logger.info("SecurityNewsScraper backend starting on port %s", config.PORT)
    try:
        app.run(host="0.0.0.0", port=config.PORT, debug=config.FLASK_DEBUG)
    finally:
        if scheduler.running:
            scheduler.shutdown()
            logger.info("Scheduler shut down.")

if __name__ == "__main__":
    main()
