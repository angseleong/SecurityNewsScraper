import re

_CVE_PATTERN = re.compile(r"CVE-\d{4}-\d{4,7}", re.IGNORECASE)

def extract_cves(text: str) -> list[str]:
    return list(set(match.upper() for match in _CVE_PATTERN.findall(text)))
