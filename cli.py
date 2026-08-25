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

@cli.command()
@click.option("--limit", default=10, help="Number of articles to analyze")
def backfill_ai(limit: int) -> None:
    """Run AI analysis on existing articles that don't have AI summary yet."""
    from backend.database.db import get_session, update_article_ai
    from backend.database.models import Article
    from backend.extractor.ai_analyzer import analyze_article

    session = get_session()
    try:
        articles = session.query(Article).filter(Article.ai_summary == None).order_by(Article.published_at.desc(), Article.id.desc()).limit(limit).all()
        if not articles:
            click.echo("No articles need AI analysis.")
            return
        
        click.echo(f"Analyzing {len(articles)} articles with Gemini AI...")
        for i, a in enumerate(articles, 1):
            click.echo(f"[{i}/{len(articles)}] Analyzing: {a.title[:60]}...")
            text = f"{a.title}\n{a.summary or ''}\n{a.full_text or ''}"
            ai_data = analyze_article(text)
            if ai_data:
                update_article_ai(int(a.id), ai_data)  # type: ignore
                click.echo(f" -> Success: {ai_data.get('attack_vector')}")
            else:
                click.echo(" -> Skipped or Failed.")
        click.echo("Backfill complete.")
    finally:
        session.close()

if __name__ == "__main__":
    cli()
