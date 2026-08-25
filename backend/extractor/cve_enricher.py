import logging
import time
import requests
from datetime import datetime, timedelta
from typing import List, Set, Dict

logger = logging.getLogger(__name__)

# Global cache for CISA KEV to avoid downloading the 1MB JSON repeatedly
_cisa_kev_cache: Set[str] = set()
_cisa_kev_last_fetch: datetime = None

def get_cisa_kev_set() -> Set[str]:
    global _cisa_kev_cache, _cisa_kev_last_fetch
    now = datetime.now()
    if _cisa_kev_last_fetch and (now - _cisa_kev_last_fetch) < timedelta(hours=12):
        return _cisa_kev_cache

    try:
        logger.info("Fetching CISA KEV database...")
        resp = requests.get("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            _cisa_kev_cache = {vuln["cveID"] for vuln in data.get("vulnerabilities", [])}
            _cisa_kev_last_fetch = now
            logger.info(f"Loaded {_cisa_kev_cache.__len__()} CVEs from CISA KEV.")
    except Exception as e:
        logger.error(f"Failed to fetch CISA KEV: {e}")
    
    return _cisa_kev_cache

def fetch_epss_scores(cve_ids: List[str]) -> Dict[str, float]:
    if not cve_ids:
        return {}
    
    scores = {}
    # API allows multiple CVEs separated by comma
    chunk_size = 50
    for i in range(0, len(cve_ids), chunk_size):
        chunk = cve_ids[i:i + chunk_size]
        url = f"https://api.first.org/data/v1/epss?cve={','.join(chunk)}"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("data", []):
                    cve = item.get("cve")
                    epss = item.get("epss")
                    if cve and epss:
                        scores[cve] = float(epss)
        except Exception as e:
            logger.error(f"Failed to fetch EPSS for chunk: {e}")
    return scores

def check_github_poc(cve_id: str) -> str:
    """Returns the URL of the first PoC repository found, or None"""
    try:
        url = f"https://api.github.com/search/repositories?q={cve_id}+poc&sort=updated"
        # We use a simple request. GitHub limits unauthenticated search API to 10 req/min.
        resp = requests.get(url, timeout=5, headers={"Accept": "application/vnd.github.v3+json"})
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            if items:
                return items[0].get("html_url")
        elif resp.status_code == 403:
            logger.warning(f"GitHub API rate limit hit when checking {cve_id}")
    except Exception as e:
        logger.error(f"Failed to check GitHub for {cve_id}: {e}")
    return None

def enrich_cves_in_db(session, cves) -> None:
    """Enrich a list of CVE model instances (must be attached to the session)."""
    if not cves:
        return

    cisa_set = get_cisa_kev_set()
    cve_ids_to_fetch_epss = []

    for cve in cves:
        # 1. CISA KEV
        if cve.cve_id in cisa_set:
            cve.cisa_kev = True
        
        # 2. Collect for EPSS
        if cve.epss_score is None:
            cve_ids_to_fetch_epss.append(cve.cve_id)
            
        # 3. GitHub PoC
        if not cve.poc_url:
            poc = check_github_poc(cve.cve_id)
            if poc:
                cve.poc_url = poc
            time.sleep(2) # be nice to GitHub search API (10 req/min limit => roughly 1 per 6s, but 2s is a compromise if batch is small)

    # Fetch EPSS
    if cve_ids_to_fetch_epss:
        epss_map = fetch_epss_scores(cve_ids_to_fetch_epss)
        for cve in cves:
            if cve.cve_id in epss_map:
                cve.epss_score = epss_map[cve.cve_id]

    session.commit()
