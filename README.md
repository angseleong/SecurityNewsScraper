# SecurityNewsScraper

An **automated threat intelligence system** that aggregates cybersecurity news from trusted portals, extracts vulnerabilities (CVEs), and presents them on a web dashboard — with real-time Telegram notifications for critical threats.

---

## What It Does

- **Automated Scraping** — Fetches the latest articles from The Hacker News, Bleeping Computer, Krebs on Security, and SecurityWeek via RSS feeds every few hours.
- **CVE Detection** — Automatically identifies CVE codes and classifies the severity (Critical / High / Medium / Info) of each article using AI.
- **Web Dashboard** — A modern web interface to view, search, and filter all saved news and CVEs.
- **Telegram Notifications** — Sends instant alerts to Telegram when Critical or High-severity news is found.
- **Local Database** — All articles and CVEs are stored in SQLite, making them easily searchable at any time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11+, Flask 3.x (REST API) |
| Scraping | `requests`, `feedparser`, `beautifulsoup4` |
| Database | SQLite + SQLAlchemy 2.x |
| Scheduler | APScheduler 3.x |
| Notifications | python-telegram-bot 20.x |
| Frontend | Next.js (App Router), React, Tailwind CSS |

---

## Project Structure

```
SecurityNewsScraper/
├── docs/               ← Technical documentation (PRD, Architecture, Design, TODO)
├── backend/            ← Backend (Python REST API, Scraper, DB)
│   ├── scraper/
│   ├── extractor/
│   ├── database/
│   ├── scheduler/
│   ├── notifier/
│   ├── api/            ← Flask REST API Endpoints
│   ├── data/           ← SQLite database (not committed to Git)
│   ├── main.py         ← Backend web server entry point
│   ├── worker.py       ← Background scraper worker entry point
│   └── config.py
├── frontend/           ← Frontend (Next.js, React, Tailwind)
│   ├── src/app/        
│   └── src/components/ 
├── cli.py              ← Command-line interface
└── AGENTS.md           ← Development rules for AI agents
```

---

## Setup & Installation (Local)

### 1. Clone and Setup Backend (Python)

```bash
git clone https://github.com/angseleong/SecurityNewsScraper.git
cd SecurityNewsScraper

# Setup Virtual Environment
python -m venv venv
source venv/bin/activate      # macOS/Linux
# venv\Scripts\activate       # Windows

pip install -r backend/requirements.txt
```

### 2. Setup Frontend (Next.js)

```bash
cd frontend
npm install
cd ..
```

### 3. Environment Configuration

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit the `backend/.env` file and fill in the following values:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
SCRAPE_INTERVAL_HOURS=6
ALERT_KEYWORDS=Windows Server,OpenSSL,Linux Kernel
ALERT_MIN_SEVERITY=high
ADMIN_SECRET=your_super_secret_key
```

**How to create a Telegram Bot:**
1. Open Telegram, search for `@BotFather`
2. Send `/newbot` and follow the instructions
3. Copy the provided token to `TELEGRAM_BOT_TOKEN`
4. Send a message to your bot, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` to get your `chat_id`

### 4. Initialize Database

```bash
python -c "from backend.database.db import init_db; init_db()"
```

### 5. Run the Application

Run the backend web API, background worker, and frontend in three different terminals.

**Terminal 1 (Backend API):**
```bash
source venv/bin/activate
PORT=5000 python -m backend.main
# Backend API runs at http://localhost:5000
```

**Terminal 2 (Background Scraper Worker):**
```bash
source venv/bin/activate
python -m backend.worker
# Quietly scrapes articles in the background
```

**Terminal 3 (Frontend Next.js):**
```bash
cd frontend
npm run dev
# Frontend Dashboard available at http://localhost:3000
```

---

## Deployment (Production)

The architecture is fully optimized for production with SQLite WAL mode and a separated background worker to prevent database locks and API rate limits.

### Backend (Render.com)

We use Render's Free Tier with a persistent disk to host both the API and the Worker simultaneously using a startup script.

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` blueprint in the repository.
4. Go to the **Environment** tab and add your secrets (e.g., `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `ADMIN_SECRET`).
5. Render will execute `start.sh` which boots both the API and the background scraper while sharing the persistent `/var/data` disk for SQLite.

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Set the **Framework Preset** to `Next.js`.
4. Set the **Root Directory** to `frontend`.
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://sns-api.onrender.com`)
   - `NEXT_PUBLIC_ADMIN_SECRET`: The exact same secret you set in the backend for `ADMIN_SECRET`.
6. Deploy!

---

## CLI Usage

```bash
# Manually trigger scraping (without opening the browser)
python cli.py scrape

# Search articles by CVE ID
python cli.py search --cve CVE-2024-12345

# List articles with critical severity
python cli.py list --severity critical

# List the 10 newest articles from a specific source
python cli.py list --source bleepingcomputer --limit 10
```

---

## Documentation

Read the full technical documentation in the `docs/` folder:

- [`docs/PRD.md`](docs/PRD.md) — Product requirements, features, and scope
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture, database schema, and component design
- [`docs/DESIGN.md`](docs/DESIGN.md) — UI/UX guidelines and visual references
- [`docs/TODO.md`](docs/TODO.md) — Implementation progress phase by phase

---

## Ethics & Legal

- This project only uses **public RSS feeds** officially provided by news portals as the primary scraping method.
- Always respect the `robots.txt` of each source.
- Scraping is strictly rate-limited and avoids overloading target servers.
- The collected data is solely for monitoring and security awareness, not for commercial redistribution.
