_CRITICAL_KWS = {"zero-day", "0-day", "actively exploited", "rce", "remote code execution", "cvss 9", "cvss 10", "critical"}
_HIGH_KWS = {"high severity", "privilege escalation", "authentication bypass", "cvss 7", "cvss 8"}
_MEDIUM_KWS = {"medium severity", "denial of service", "dos", "information disclosure"}

def classify_severity(text: str) -> str:
    text_lower = text.lower()
    if any(kw in text_lower for kw in _CRITICAL_KWS):
        return "critical"
    if any(kw in text_lower for kw in _HIGH_KWS):
        return "high"
    if any(kw in text_lower for kw in _MEDIUM_KWS):
        return "medium"
    return "info"
