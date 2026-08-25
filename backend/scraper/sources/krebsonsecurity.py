from backend.scraper.rss_parser import RSSParser

class KrebsOnSecurityScraper(RSSParser):
    source_name = "krebsonsecurity"
    feed_url = "https://krebsonsecurity.com/feed/"
