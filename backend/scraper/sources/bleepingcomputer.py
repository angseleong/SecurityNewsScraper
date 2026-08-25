from backend.scraper.rss_parser import RSSParser

class BleepingComputerScraper(RSSParser):
    source_name = "bleepingcomputer"
    feed_url = "https://www.bleepingcomputer.com/feed/"
