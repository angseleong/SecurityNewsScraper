import logging
import logging.handlers
from pathlib import Path
from backend.api import create_app
from backend.database.db import init_db
from backend.database.db import init_db
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

init_db()
app = create_app()

def main() -> None:
    logger.info("SecurityNewsScraper backend starting on port %s", config.PORT)
    app.run(host="0.0.0.0", port=config.PORT, debug=config.FLASK_DEBUG)

if __name__ == "__main__":
    main()
