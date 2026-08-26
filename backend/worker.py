import logging
import logging.handlers
from pathlib import Path
import time

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
            _log_dir / "worker.log", maxBytes=5_000_000, backupCount=3
        ),
    ],
)
logger = logging.getLogger(__name__)

def main() -> None:
    logger.info("SecurityNewsScraper worker starting...")
    init_db()
    scheduler = start_scheduler()
    
    try:
        # Keep the main thread alive so the background scheduler continues running.
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Worker interrupted. Shutting down...")
    finally:
        if scheduler.running:
            scheduler.shutdown(wait=True)
            logger.info("Scheduler shut down.")

if __name__ == "__main__":
    main()
