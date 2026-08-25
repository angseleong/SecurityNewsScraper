from backend.scraper.rss_parser import RSSParser

class SecurityWeekScraper(RSSParser):
    source_name = "securityweek"
    feed_url = "https://feeds.feedburner.com/securityweek"
