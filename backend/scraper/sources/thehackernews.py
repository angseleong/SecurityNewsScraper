from backend.scraper.rss_parser import RSSParser

class TheHackerNewsScraper(RSSParser):
    source_name = "thehackernews"
    feed_url = "https://feeds.feedburner.com/TheHackersNews"
