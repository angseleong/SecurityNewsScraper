"""
main.py — Entry point for SecurityNewsScraper backend.
Starts the Flask REST API and the APScheduler background job.
"""

import logging
from backend.api import create_app
from backend.scheduler.jobs import start_scheduler
import backend.config as config

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)


def main() -> None:
    """Initialize and run the Flask app and background scheduler."""
    app = create_app()
    scheduler = start_scheduler()

    logger.info("SecurityNewsScraper backend starting on port %s", config.PORT)

    try:
        app.run(host="0.0.0.0", port=config.PORT, debug=config.FLASK_DEBUG)
    finally:
        if scheduler.running:
            scheduler.shutdown()
            logger.info("Scheduler shut down cleanly.")


if __name__ == "__main__":
    main()
