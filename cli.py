import sys
import logging
import click

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

@click.group()
def cli() -> None:
    pass

@cli.command()
def scrape() -> None:
    """Trigger a manual scrape of all sources."""
    from backend.scheduler.jobs import scrape_all_sources
    from backend.database.db import init_db
    init_db()
    scrape_all_sources()
    click.echo("Scrape complete.")

if __name__ == "__main__":
    cli()
