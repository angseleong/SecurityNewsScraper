from dataclasses import dataclass
from backend.scraper.base import RawArticle
from .cve_extractor import extract_cves
from .severity_classifier import classify_severity
from .keyword_extractor import extract_affected_software

@dataclass
class ProcessedArticle:
    raw: RawArticle
    cves: list[str]
    severity: str
    affected_software: list[str]

def process_article(raw: RawArticle) -> ProcessedArticle:
    text = f"{raw.title} {raw.summary} {raw.full_text}"
    return ProcessedArticle(
        raw=raw,
        cves=extract_cves(text),
        severity=classify_severity(text),
        affected_software=extract_affected_software(text)
    )
