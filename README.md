# SecurityNewsScraper

Sistem **threat intelligence otomatis** yang mengumpulkan berita keamanan siber dari portal terpercaya, mengekstrak kerentanan (CVE), dan menampilkannya di web dashboard — dengan notifikasi Telegram real-time untuk ancaman kritis.

---

## What It Does

- **Scraping Otomatis** — Mengambil artikel terbaru dari The Hacker News, Bleeping Computer, Krebs on Security, dan SecurityWeek via RSS feed setiap beberapa jam.
- **Deteksi CVE** — Mengidentifikasi kode CVE dan mengklasifikasikan tingkat keparahan (Critical / High / Medium / Info) dari setiap artikel secara otomatis.
- **Web Dashboard** — Antarmuka web modern untuk melihat, mencari, dan memfilter semua berita dan CVE yang tersimpan.
- **Notifikasi Telegram** — Mengirim alert instan ke Telegram ketika ada berita berkategori Critical atau High.
- **Database Lokal** — Semua artikel dan CVE disimpan di SQLite, mudah dicari ulang kapan saja.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend API | Python 3.11+, Flask 3.x (REST API) |
| Scraping | `requests`, `feedparser`, `beautifulsoup4` |
| Database | SQLite + SQLAlchemy 2.x |
| Scheduler | APScheduler 3.x |
| Notifikasi | python-telegram-bot 20.x |
| Frontend | Next.js (App Router), React, Tailwind CSS |

---

## Project Structure

```
SecurityNewsScraper/
├── docs/               ← Dokumentasi teknis (PRD, Architecture, Design, TODO)
├── backend/            ← Backend (Python REST API, Scraper, DB)
│   ├── scraper/
│   ├── extractor/
│   ├── database/
│   ├── scheduler/
│   ├── notifier/
│   ├── api/            ← Flask REST API Endpoints
│   ├── data/           ← SQLite database (tidak di-commit ke Git)
│   ├── main.py         ← Entry point backend
│   └── config.py
├── frontend/           ← Frontend (Next.js, React, Tailwind)
│   ├── src/app/        
│   └── src/components/ 
├── cli.py              ← Command-line interface
└── AGENTS.md           ← Aturan pengembangan untuk AI agent
```

---

## Setup & Installation

### 1. Clone dan Setup Backend (Python)

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

### 3. Konfigurasi Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit file `backend/.env` dan isi nilai berikut:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
SCRAPE_INTERVAL_HOURS=6
ALERT_KEYWORDS=Windows Server,OpenSSL,Linux Kernel
ALERT_MIN_SEVERITY=high
```

**Cara membuat Telegram Bot:**
1. Buka Telegram, cari `@BotFather`
2. Kirim `/newbot` dan ikuti instruksinya
3. Salin token yang diberikan ke `TELEGRAM_BOT_TOKEN`
4. Kirim pesan ke bot kamu, lalu buka `https://api.telegram.org/bot<TOKEN>/getUpdates` untuk mendapatkan `chat_id`

### 4. Inisialisasi Database

```bash
python -c "from backend.database.db import init_db; init_db()"
```

### 5. Jalankan Aplikasi

Jalankan backend dan frontend di dua terminal yang berbeda.

**Terminal 1 (Backend API + Scheduler):**
```bash
source venv/bin/activate
python backend/main.py
# Backend API berjalan di http://localhost:5000
```

**Terminal 2 (Frontend Next.js):**
```bash
cd frontend
npm run dev
# Dashboard Frontend tersedia di http://localhost:3000
```

---

## CLI Usage

```bash
# Trigger scraping manual (tanpa buka browser)
python cli.py scrape

# Cari artikel berdasarkan CVE ID
python cli.py search --cve CVE-2024-12345

# Tampilkan artikel dengan severity critical
python cli.py list --severity critical

# Tampilkan 10 artikel terbaru dari sumber tertentu
python cli.py list --source bleepingcomputer --limit 10
```

---

## Deployment (Free — 24/7)

Panduan lengkap deployment ke Render.com (gratis, persistent disk):

> Akan ditambahkan setelah Phase 7 selesai — lihat `docs/TODO.md`.

---

## Documentation

Baca dokumentasi teknis lengkap di folder `docs/`:

- [`docs/PRD.md`](docs/PRD.md) — Product requirements, fitur, dan scope
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Arsitektur sistem, skema database, dan desain komponen
- [`docs/DESIGN.md`](docs/DESIGN.md) — Panduan UI/UX dan referensi visual *(coming soon)*
- [`docs/TODO.md`](docs/TODO.md) — Progress implementasi fase per fase

---

## Ethics & Legal

- Proyek ini hanya menggunakan **RSS feed publik** yang disediakan oleh portal berita secara resmi sebagai metode scraping utama.
- Selalu hormati `robots.txt` dari setiap sumber.
- Scraping dilakukan dengan rate limiting — tidak membebani server target.
- Data yang dikumpulkan hanya untuk keperluan monitoring dan awareness, bukan untuk redistribusi komersial.
