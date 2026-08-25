CREATE TABLE IF NOT EXISTS articles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source      TEXT NOT NULL,
    title       TEXT NOT NULL,
    url         TEXT NOT NULL UNIQUE,
    published_at DATETIME,
    summary     TEXT,
    full_text   TEXT,
    severity    TEXT,
    has_cve     BOOLEAN NOT NULL DEFAULT 0,
    notified    BOOLEAN NOT NULL DEFAULT 0,
    scraped_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cves (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id           TEXT NOT NULL,
    article_id       INTEGER NOT NULL REFERENCES articles(id),
    severity_hint    TEXT,
    affected_software TEXT,
    cvss_score       REAL
);

CREATE TABLE IF NOT EXISTS scrape_logs (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    source           TEXT NOT NULL,
    started_at       DATETIME,
    finished_at      DATETIME,
    articles_found   INTEGER DEFAULT 0,
    articles_new     INTEGER DEFAULT 0,
    articles_skipped INTEGER DEFAULT 0,
    status           TEXT NOT NULL,
    error_message    TEXT
);
