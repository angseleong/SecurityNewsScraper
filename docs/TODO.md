# SecurityNewsScraper — Implementation TODO

**Status Update Convention:**
- `[ ]` — Belum dikerjakan
- `[/]` — Sedang dikerjakan (aktif)
- `[x]` — Selesai dan terverifikasi

Gunakan file ini sebagai panduan kerja utama. **Jangan mulai tahap selanjutnya sebelum tahap aktif selesai.**

---

## Phase 0 — Project Foundation

- [x] Inisialisasi virtual environment Python (`python -m venv venv`)
- [x] Buat `backend/requirements.txt` dengan semua dependensi awal
- [x] Buat `backend/config.py` — central config reader dari `.env`
- [x] Buat `backend/.env.example` — template env vars tanpa nilai sensitif
- [x] Update `.gitignore` — `.env`, `data/`, `venv/`, `*.db` tidak ter-commit
- [x] `README.md` sudah ada
- [x] Buat struktur folder sesuai `docs/ARCHITECTURE.md §3`

**Checkpoint Phase 0:** Struktur folder berdiri, `python -c "import flask, feedparser, bs4, apscheduler"` tidak error.

---

## Phase 1 — Scraper Engine

- [ ] Buat `scraper/base.py` — abstract base class `BaseScraper` dengan method `fetch()` dan `fetch_full_text()`
- [ ] Buat `scraper/rss_parser.py` — generic RSS parser menggunakan `feedparser`, bisa dipakai oleh semua sumber
- [ ] Buat `scraper/sources/thehackernews.py` — parser untuk The Hacker News RSS
- [ ] Buat `scraper/sources/bleepingcomputer.py` — parser untuk Bleeping Computer RSS
- [ ] Buat `scraper/sources/krebsonsecurity.py` — parser untuk Krebs on Security RSS
- [ ] Buat `scraper/sources/securityweek.py` — parser untuk SecurityWeek RSS
- [ ] Buat `scraper/html_parser.py` — HTML fallback scraper (BeautifulSoup) untuk mengambil `full_text` artikel
- [ ] Test manual: jalankan setiap scraper sumber dan pastikan data `title, url, published_at, summary` berhasil di-parse
- [ ] Implementasi rate limiting (delay antar request) di base scraper

**Checkpoint Phase 1:** Menjalankan `python -c "from scraper.sources.bleepingcomputer import BleepingComputerScraper; print(BleepingComputerScraper().fetch()[:2])"` menghasilkan 2 artikel valid.

---

## Phase 2 — CVE Extraction Engine

- [ ] Buat `extractor/cve_extractor.py` — fungsi `extract_cves(text: str) -> list[str]` dengan regex `CVE-\d{4}-\d{4,7}`
- [ ] Buat `extractor/severity_classifier.py` — fungsi `classify_severity(text: str) -> str` dengan keyword-based scoring
  - [ ] Definisikan keyword list untuk Critical, High, Medium
  - [ ] Pastikan mengembalikan salah satu dari: `"critical"`, `"high"`, `"medium"`, `"info"`
- [ ] Buat `extractor/keyword_extractor.py` — fungsi `extract_affected_software(text: str) -> list[str]` dari preset daftar software
- [ ] Buat `extractor/__init__.py` — wrapper `process_article(raw_article) -> ProcessedArticle` yang memanggil ketiga extractor di atas
- [ ] Test unit untuk masing-masing extractor dengan teks artikel contoh

**Checkpoint Phase 2:** Memberikan teks artikel yang menyebut `CVE-2024-12345` dan kata `critical RCE` → extractor menghasilkan CVE list yang benar dan severity `"critical"`.

---

## Phase 3 — Database Layer

- [ ] Buat folder `data/` (kosong, di-gitignore)
- [ ] Buat `database/models.py` — definisi tabel menggunakan SQLAlchemy ORM: `Article`, `CVE`, `ScrapeLog`
- [ ] Buat `database/db.py` — koneksi database, session factory, fungsi `init_db()` untuk membuat tabel
- [ ] Buat `database/migrations/init_schema.sql` — SQL schema mentah sebagai referensi / fallback
- [ ] Implementasi `save_article(article)` — simpan artikel dengan pengecekan duplikat (handle `IntegrityError`)
- [ ] Implementasi `save_cves(cves, article_id)` — simpan daftar CVE yang terkait ke artikel
- [ ] Implementasi `log_scrape_run(source, stats)` — simpan hasil setiap scraping ke `scrape_logs`
- [ ] Test: pastikan article dengan URL yang sama tidak bisa disimpan dua kali (constraint UNIQUE berfungsi)
- [ ] Test: pastikan foreign key antara `cves.article_id` dan `articles.id` berfungsi benar

**Checkpoint Phase 3:** Jalankan full pipeline (scrape → extract → save) untuk satu sumber, query database menghasilkan data yang benar, running kedua kali tidak menghasilkan duplikat.

---

## Phase 4 — Scheduler & Pipeline Integration

- [ ] Buat `scheduler/jobs.py` — definisi job `scrape_all_sources()` yang memanggil semua scraper, extractor, dan database save secara berurutan
- [ ] Integrasi APScheduler ke `main.py` — `BackgroundScheduler` berjalan bersamaan dengan Flask
- [ ] Konfigurasi interval scraping dari `.env` (`SCRAPE_INTERVAL_HOURS`)
- [ ] Tambahkan logging ke setiap tahap pipeline — output ke console dan/atau file `logs/scraper.log`
- [ ] Test: jalankan `python main.py`, tunggu interval pertama, verifikasi artikel baru tersimpan di DB
- [ ] Implementasi `cli.py` dengan command `scrape` untuk trigger manual tanpa buka browser

**Checkpoint Phase 4:** Server berjalan, setelah 1 siklus scraping (atau dipicu manual via CLI), database terisi dengan artikel baru dari semua sumber.

---

## Phase 5 — Backend REST API (Flask)

- [ ] Buat `backend/api/app.py` — Flask application factory dengan support CORS
- [ ] Buat `backend/api/routes.py` — definisi semua JSON endpoint:
  - [ ] `GET /api/articles` — Endpoint data artikel dengan support query params: `?source=`, `?severity=`, `?q=`, `?has_cve=`, `?page=`
  - [ ] `GET /api/cves` — Endpoint data CVE dengan support query params: `?q=`, `?severity=`
  - [ ] `GET /api/stats` — Endpoint untuk statistik agregat dashboard
  - [ ] `POST /api/scrape` — Endpoint trigger manual scraping
- [ ] Test: jalankan server Flask, request ke semua endpoint menggunakan cURL/Postman, pastikan JSON responsenya valid.

**Checkpoint Phase 5:** REST API dapat diakses di `http://localhost:5000/api/*` dan memberikan JSON response dengan struktur data yang benar.

---

## Phase 6 — Frontend Dashboard (Next.js)

- [ ] Inisialisasi Next.js (`npx create-next-app@latest frontend`) dengan Tailwind CSS, TypeScript, dan App Router
- [ ] Install dependencies tambahan: `lucide-react`, `date-fns`
- [ ] Konfigurasi `frontend/.env.local` untuk menyimpan `NEXT_PUBLIC_API_URL`
- [ ] Buat `frontend/src/components/ArticleCard.tsx` — komponen untuk me-render satu berita dengan badge severity
- [ ] Buat `frontend/src/components/FilterBar.tsx` — komponen interaktif untuk filter kategori dan search bar
- [ ] Buat `frontend/src/app/page.tsx` — Halaman dashboard utama (fetching `GET /api/articles`)
- [ ] Buat `frontend/src/app/cves/page.tsx` — Halaman CVE Explorer
- [ ] Implementasi integrasi tombol "Scrape Now" yang memanggil `POST /api/scrape`
- [ ] Test: jalankan `npm run dev`, pastikan tampilan merender sempurna, state filter berfungsi, dan mengambil data asli dari Flask backend.

**Checkpoint Phase 6:** Dashboard Next.js dapat diakses di `http://localhost:3000`, interaktif, menampilkan artikel dari SQLite, dan pencarian instan bekerja.

---

## Phase 7 — Telegram Notifier

- [ ] Setup Telegram Bot via @BotFather — dokumentasikan langkah-langkahnya di README
- [ ] Buat `notifier/telegram.py` — fungsi `send_alert(article, cves)` yang memformat dan mengirim pesan ke Telegram
- [ ] Implementasi filter sebelum kirim notifikasi:
  - [ ] Cek `article.severity` apakah `>= ALERT_MIN_SEVERITY` dari `.env`
  - [ ] Cek apakah judul/teks mengandung keyword dari `ALERT_KEYWORDS` di `.env`
- [ ] Implementasi retry logic (3x dengan backoff) untuk request yang gagal ke Telegram API
- [ ] Integrasi notifier ke pipeline di `scheduler/jobs.py` — panggil notifier setelah artikel baru disimpan
- [ ] Test: publish artikel test dengan severity critical → pesan notifikasi masuk di Telegram

**Checkpoint Phase 7:** Setelah scraping menemukan artikel baru berkategori Critical, pesan Telegram terkirim dalam waktu <30 detik setelah artikel disimpan ke DB.

---

## Phase 8 — Deployment

- [ ] Pastikan semua secret ada di `.env` dan tidak di-commit ke Git
- [ ] Buat `Procfile` atau `render.yaml` untuk konfigurasi deployment di Render
- [ ] Buat `runtime.txt` dengan versi Python yang digunakan
- [ ] Test deployment di Render free tier:
  - [ ] Backend API dapat diakses via public URL
  - [ ] Next.js Frontend terdeploy (misal di Vercel atau Render) dan berhasil call Backend API
  - [ ] Scheduler berjalan di background
  - [ ] SQLite database persisten (tidak terhapus saat restart)
  - [ ] Telegram notifikasi terkirim dari server backend
- [ ] Update `README.md` dengan instruksi deployment lengkap

**Checkpoint Phase 8:** Dashboard dapat diakses dari internet via URL publik. Tanpa membuka laptop, setelah interval waktu tertentu, artikel baru muncul di dashboard dan notifikasi Telegram terkirim.

---

## BACKLOG — Post-MVP

### Filter Notifikasi Lanjutan
- [ ] Tambahkan konfigurasi keyword target software spesifik per user
- [ ] Tambahkan minimum CVSS score filter (jika skor tersedia di artikel)

### UI Enhancements
- [ ] Dark/Light mode toggle
- [ ] Grafik interaktif: jumlah CVE per minggu menggunakan Chart.js
- [ ] Export data ke CSV dari dashboard

### Data Enrichment
- [ ] Integrasi dengan NVD API untuk mengambil detail CVE resmi (CVSS score, deskripsi resmi) berdasarkan CVE ID yang ditemukan

### Multi-Notification Channel
- [ ] Support notifikasi via Email (SMTP)
- [ ] Support notifikasi via Discord Webhook

### Database Migration
- [ ] Migrasi dari SQLite ke PostgreSQL untuk skalabilitas lebih besar
