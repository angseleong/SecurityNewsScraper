# SecurityNewsScraper — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2026-08-24

---

## 1. Overview

SecurityNewsScraper adalah sistem **threat intelligence otomatis** berbasis web yang mengumpulkan, menganalisis, dan menyajikan berita keamanan siber secara real-time. Sistem ini memonitor portal berita keamanan terpercaya, mengekstrak identifikasi kerentanan (CVE), menyimpannya ke database, menampilkannya di web dashboard, dan mengirimkan notifikasi instan ke Telegram ketika ada ancaman kritis terdeteksi.

Proyek ini dibangun sebagai **sistem monitoring keamanan siber personal** — berguna untuk siapa saja yang ingin tetap up-to-date dengan lanskap ancaman siber terkini tanpa harus memantau banyak situs secara manual.

---

## 2. Background & Motivation

Dunia keamanan siber bergerak sangat cepat. Celah keamanan zero-day, ransomware baru, dan data breach terjadi setiap hari di berbagai sektor. Memantau puluhan situs berita keamanan secara manual:

- **Menyita waktu:** Harus membuka banyak tab, scroll, dan filter secara manual.
- **Rentan terlewat:** Berita kritis bisa terlambat diketahui jika tidak memantau 24/7.
- **Tidak terstruktur:** Informasi tersebar di banyak tempat, sulit dicari ulang.

SecurityNewsScraper hadir untuk mengotomatisasi proses ini — sistem bekerja di belakang layar, mengumpulkan dan mengklasifikasikan berita, sehingga pengguna hanya perlu membuka satu dashboard atau menunggu notifikasi Telegram.

---

## 3. Scope

### 3.1 In-Scope (MVP v1.0)

- Scraping berita dari **3–4 portal berita keamanan utama** via RSS Feed dan/atau HTML parsing.
- **Ekstraksi CVE** otomatis menggunakan regex (`CVE-YYYY-XXXXX`) dari judul dan isi artikel.
- **Kategorisasi keparahan** otomatis (Critical / High / Medium / Info) berdasarkan kata kunci dan skor CVSS yang ditemukan dalam artikel.
- **Penyimpanan** semua artikel dan CVE ke **SQLite database** dengan deduplication berbasis URL.
- **Web Dashboard** (Flask + HTML/CSS/JS) yang menampilkan berita terkini, filter, dan statistik.
- **Scheduler otomatis** menggunakan APScheduler — scraping berjalan setiap beberapa jam tanpa intervensi manual.
- **Notifikasi Telegram** untuk artikel berkategori Critical atau High, serta artikel yang mengandung kata kunci target.
- **Manual trigger** — scraping bisa dijalankan kapan saja via tombol di dashboard atau perintah CLI.
- **Deployment guide** ke layanan gratis (Render / PythonAnywhere / Oracle Free Tier).

### 3.2 Out-of-Scope (v1.0)

- Autentikasi pengguna (login/register) — dashboard bersifat single-user.
- Analisis malware secara mendalam (bukan malware sandbox).
- Integrasi dengan platform SIEM (Splunk, Elastic) — mungkin dipertimbangkan di v2.
- Scraping dari Twitter/X, Reddit, atau platform media sosial.
- Machine Learning untuk klasifikasi ancaman — v2.
- Notifikasi selain Telegram (Slack, Email) — v2.

---

## 4. Target Users

**Primary User:** Developer, security enthusiast, atau mahasiswa IT yang ingin memantau berita keamanan siber terkini secara otomatis tanpa harus membuka banyak situs setiap hari.

**Secondary User:** Tim kecil yang ingin punya "radar" sederhana untuk threat awareness — tidak memerlukan SOC/SIEM yang kompleks.

---

## 5. Core Features

### F1 — Scraper Engine
Sistem mengambil konten artikel dari portal berita keamanan menggunakan dua metode:
- **RSS Feed** (prioritas utama): Lebih stabil, ringan, dan ramah server target. Setiap portal dibuatkan `parser` tersendiri.
- **HTML Scraping** (fallback): Jika RSS tidak tersedia atau tidak cukup informasi, gunakan `requests` + `BeautifulSoup4` untuk mengambil teks penuh artikel.

Portal target awal:
| Portal | Metode | URL |
|---|---|---|
| The Hacker News | RSS | `https://feeds.feedburner.com/TheHackersNews` |
| Bleeping Computer | RSS | `https://www.bleepingcomputer.com/feed/` |
| Krebs on Security | RSS | `https://krebsonsecurity.com/feed/` |
| SecurityWeek | RSS | `https://feeds.securityweek.com/securityweek/XWuA` |

### F2 — CVE Extraction Engine
Setelah konten artikel diperoleh, sistem menjalankan:
- **Regex pattern matching** untuk mengidentifikasi CVE ID (`CVE-\d{4}-\d{4,7}`).
- **Keyword extraction** untuk mendeteksi nama software/vendor terdampak (Windows, Linux, Apache, Cisco, Chrome, dll.).
- **Severity detection** berdasarkan kata kunci: `critical`, `zero-day`, `RCE`, `remote code execution`, `actively exploited`, `CVSS 9`, `CVSS 10`, dll.

### F3 — Database Storage (SQLite)
Semua data disimpan lokal di SQLite. Detail skema ada di `docs/ARCHITECTURE.md`.

- **Deduplication:** Artikel dengan URL yang sama tidak akan disimpan dua kali (`UNIQUE` constraint pada kolom `url`).
- **Relasi:** Setiap CVE yang ditemukan dikaitkan dengan artikel sumbernya via foreign key.

### F4 — Web Dashboard
Antarmuka web modern yang dibangun menggunakan **Next.js**, **React**, dan **Tailwind CSS** sebagai frontend, mengonsumsi REST API dari Flask backend:
- Feed artikel terkini dengan badge severity (🔴 Critical, 🟡 High, 🔵 Info).
- Filter interaktif (client-side rendering) berdasarkan: sumber, tanggal, tingkat keparahan, keberadaan CVE tanpa reload halaman.
- CVE Explorer: daftar semua CVE yang terdeteksi, dapat diurutkan dan dicari.
- Statistik ringkas: total artikel per sumber, total CVE terdeteksi, grafik aktivitas 7 hari terakhir.
- Tombol **"Scrape Now"** untuk trigger manual dengan status indikator.

### F5 — Scheduler
`APScheduler` menjalankan scraper secara berkala di background, default setiap **6 jam**. Interval dapat dikonfigurasi via file `.env` atau `config.py`. Scheduler berjalan sebagai bagian dari proses Flask server.

### F6 — Telegram Notifikasi
Bot Telegram mengirimkan pesan ketika:
- Artikel baru terdeteksi berkategori **Critical** atau **High**.
- Artikel menyebut kata kunci target yang telah dikonfigurasi pengguna (misal: `"Windows Server"`, `"OpenSSL"`, `"Linux Kernel"`).
- Pesan notifikasi berisi: Judul artikel, sumber, link, severity, dan daftar CVE yang ditemukan.

### F7 — CLI Interface
Alternatif bagi yang tidak mau membuka browser — perintah sederhana via terminal:
```bash
python cli.py scrape       # Jalankan scraping manual
python cli.py search --cve CVE-2024-12345  # Cari artikel berdasarkan CVE
python cli.py list --severity critical     # Tampilkan artikel kritis
```

---

## 6. Success Criteria (MVP)

Proyek dianggap selesai (MVP) jika memenuhi semua kriteria berikut:

| # | Kriteria | Verifikasi |
|---|---|---|
| C1 | Scraper berhasil mengambil artikel dari minimal 3 sumber | Artikel tersimpan di database |
| C2 | CVE terdeteksi dan tersimpan dengan benar dari artikel yang relevan | Query ke tabel `cves` menghasilkan data valid |
| C3 | Dashboard menampilkan artikel terkini dengan filter berfungsi | UI dapat diakses di browser |
| C4 | Scheduler berjalan otomatis setiap 6 jam tanpa intervensi | Log menunjukkan eksekusi terjadwal |
| C5 | Notifikasi Telegram terkirim untuk artikel Critical | Pesan masuk di Telegram |
| C6 | Tidak ada artikel duplikat di database | Query `COUNT(DISTINCT url)` sama dengan total rows |
| C7 | Aplikasi dapat di-deploy dan berjalan 24/7 di layanan gratis | URL publik dapat diakses |

---

## 7. Constraints & Known Limitations

| Batasan | Penjelasan |
|---|---|
| **Scraping ethics** | Selalu hormati `robots.txt` dan rate limit. Prioritaskan RSS feed daripada HTML scraping. Jangan overload server target. |
| **Ketergantungan HTML structure** | Jika situs target mengubah layout/HTML mereka, parser HTML perlu diupdate manual. RSS feed jauh lebih stabil untuk ini. |
| **CVE severity bergantung teks artikel** | Tidak semua artikel menyebut skor CVSS secara eksplisit. Banyak severity yang hanya bisa diestimasi dari kata kunci — bukan angka CVSS resmi dari NVD. |
| **SQLite tidak untuk skala besar** | SQLite cukup untuk penggunaan personal/tim kecil. Jika data tumbuh besar (>100k artikel), perlu migrasi ke PostgreSQL. |
| **Bot Telegram perlu setup manual** | Pengguna perlu membuat Telegram Bot sendiri via @BotFather dan mengisi token di file `.env`. |
| **Free deployment memiliki limitasi** | Layanan gratis (Render, PythonAnywhere) memiliki batasan uptime, RAM, dan CPU. Cukup untuk proyek ini. |

---

## 8. Dependencies

**Backend Libraries (Python):**
- `requests` — HTTP requests untuk scraping.
- `feedparser` — Parsing RSS/Atom feed.
- `beautifulsoup4` + `lxml` — HTML parsing.
- `flask` — REST API Server backend.
- `apscheduler` — Job scheduler otomatis.
- `python-telegram-bot` — Integrasi Telegram Bot API.
- `python-dotenv` — Manajemen konfigurasi via `.env`.

**Frontend Tech Stack:**
- **Next.js** (App Router) & **React** — UI Framework.
- **Tailwind CSS** — Styling.
- **Lucide React** — Ikon modern.

**External Services:**
- **Telegram Bot API** — Pengiriman notifikasi. Gratis, tidak ada batas pesan harian yang signifikan.
- **SQLite** — Sudah bawaan Python, tidak perlu instalasi server database terpisah.

**Target News Sources:**
- The Hacker News, Bleeping Computer, Krebs on Security, SecurityWeek — semua menyediakan RSS feed publik.

---

## 9. Risks

| # | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| R1 | Situs target memblokir IP scraper | Medium | Medium | Gunakan RSS feed sebagai prioritas, tambahkan rate limiting dan User-Agent |
| R2 | RSS feed berubah format atau mati | Medium | Low | Fallback ke HTML scraping per sumber |
| R3 | False positive pada ekstraksi CVE severity | Low | High | Buat daftar kata kunci yang spesifik, state limitasi di dokumentasi |
| R4 | Bot Telegram gagal kirim (rate limit / ban) | Medium | Low | Implementasi retry dengan exponential backoff |
| R5 | Deployment gratis mengalami cold start / downtime | Low | Medium | Dokumentasikan opsi deployment alternatif |

---

## 10. Deliverables

| # | Deliverable | Status |
|---|---|---|
| D1 | Context documents (`README`, `PRD`, `ARCHITECTURE`, `TODO`, `AGENTS`) | 🔄 In Progress |
| D2 | Scraper Engine (RSS + HTML parser untuk 3+ sumber) | ⏳ Pending |
| D3 | CVE Extraction Engine (regex + keyword classifier) | ⏳ Pending |
| D4 | SQLite Database + schema migrasi | ⏳ Pending |
| D5 | APScheduler integration | ⏳ Pending |
| D6 | Web Dashboard (Flask + frontend) | ⏳ Pending |
| D7 | Telegram Bot notifikasi | ⏳ Pending |
| D8 | CLI Interface | ⏳ Pending |
| D9 | Deployment ke layanan gratis | ⏳ Pending |
| D10 | README final + Dokumentasi setup | ⏳ Pending |

---

## 11. Glossary

| Term | Definisi |
|---|---|
| **CVE** | Common Vulnerabilities and Exposures — sistem penamaan standar untuk kerentanan keamanan yang diidentifikasi secara publik. Format: `CVE-YYYY-NNNNN`. |
| **CVSS** | Common Vulnerability Scoring System — skala 0–10 untuk mengukur keparahan kerentanan. ≥9.0 = Critical, 7.0–8.9 = High, 4.0–6.9 = Medium, <4.0 = Low. |
| **Zero-Day** | Kerentanan yang belum ada patch-nya — paling berbahaya karena vendor belum sempat memperbaiki. |
| **RSS Feed** | Format distribusi konten web (XML) yang diupdate otomatis ketika situs menerbitkan artikel baru. Cara terbaik dan paling sopan untuk scraping. |
| **RCE** | Remote Code Execution — jenis serangan di mana penyerang bisa menjalankan kode arbitrer dari jarak jauh. Termasuk kategori Critical. |
| **Deduplication** | Proses memastikan data yang sama tidak disimpan lebih dari satu kali di database. |
| **Threat Intelligence** | Informasi yang dikumpulkan dan dianalisis untuk memahami ancaman siber saat ini dan yang akan datang. |
| **APScheduler** | Advanced Python Scheduler — library Python untuk menjalankan fungsi secara terjadwal (cron-like) di dalam aplikasi Python. |
