# SecurityNewsScraper — Agent Rules

**Kamu sedang bekerja di proyek SecurityNewsScraper**, sebuah sistem threat intelligence otomatis yang mengumpulkan berita keamanan siber, mengekstrak CVE, dan menampilkannya di web dashboard dengan notifikasi Telegram.  
**Ikuti semua aturan di bawah ini tanpa pengecualian selama bekerja di proyek ini.**

---

## Context Documents

Sebelum membuat keputusan arsitektur atau memulai task apapun, **SELALU baca dokumen berikut** di folder `docs/`:

- **`docs/PRD.md`** — Sumber kebenaran tunggal untuk fitur, scope, dan requirement produk.
- **`docs/ARCHITECTURE.md`** — Detail tech stack, struktur folder, skema database, dan desain komponen.
- **`docs/TODO.md`** — Daftar task aktif. **Jangan kerjakan apapun yang tidak ada di task aktif saat ini.**
- **`docs/DESIGN.md`** — Panduan UI/UX dan referensi visual (baca sebelum menyentuh file frontend).

---

## 1. Tech Stack & Environment

- **Backend:** Python 3.11+. API framework menggunakan `Flask` 3.x (hanya sebagai REST API).
- **Web Scraping:** `requests` + `feedparser` + `beautifulsoup4` + `lxml`. Jangan gunakan `Scrapy` atau `Selenium`.
- **Database:** SQLite via `SQLAlchemy` 2.x ORM.
- **Scheduler:** `APScheduler` 3.x dengan mode `BackgroundScheduler`.
- **Telegram:** `python-telegram-bot` 20.x.
- **Frontend:** `Next.js` (App Router), `React`, `TypeScript`, dan `Tailwind CSS`.
- **Config:** Nilai backend dari `.env` via `python-dotenv`. Nilai frontend dari `.env.local` Next.js.

---

## 2. Strict Constraints

- **JANGAN commit file `.env`** ke Git dalam kondisi apapun. File ini berisi credential sensitif.
- **JANGAN simpan file database (`*.db`) di Git.** Folder `data/` ada di `.gitignore`.
- **JANGAN scrape secara agresif.** Selalu hormati `robots.txt` dan terapkan delay antar request (`REQUEST_DELAY_SECONDS` dari config). Gunakan RSS feed sebagai prioritas utama — lebih sopan dan lebih stabil.
- **JANGAN gunakan Accessibility API atau permission berbahaya** — proyek ini hanya butuh akses HTTP biasa.
- **JANGAN hardcode URL sumber berita** langsung di kode business logic. Konfigurasi sumber ada di `config.py` atau masing-masing file scraper sumber di `scraper/sources/`.

---

## 3. Workflow & Scope

- **Ikuti TODO.md:** Hanya kerjakan task yang sedang aktif (`[/]`). Jangan lompat ke phase berikutnya sebelum phase aktif mencapai checkpoint-nya.
- **Simplicity over Abstraction:** Pilih implementasi paling sederhana yang memenuhi requirement saat ini. Hindari over-engineering.
- **Verifikasi Checkpoint:** Setelah menyelesaikan setiap phase, pastikan kondisi checkpoint di `TODO.md` terpenuhi sebelum menandai phase tersebut selesai.
- **No Scope Creep:** Jangan buat file, folder, UI screen, atau logika di luar task aktif saat ini. Ide bagus untuk fitur baru → masukkan ke bagian `BACKLOG` di `TODO.md`, jangan langsung implementasi.
- **No Premature Refactoring:** Jangan refactor kode yang sudah berjalan dengan baik hanya demi "kebersihan". Speed dan correctness lebih penting dari perfect abstraction di fase awal.

---

## 4. Code Style & Quality

- **Gunakan type hints** di semua function signature: `def extract_cves(text: str) -> list[str]:`
- **Gunakan docstring** di semua class dan function publik — minimal satu baris yang menjelaskan tujuannya.
- **Error handling eksplisit:** Setiap request HTTP dan operasi database harus dibungkus `try/except` yang spesifik (jangan `except Exception` yang generik tanpa logging).
- **Logging** bukan `print()`: Gunakan modul `logging` Python standar untuk semua output diagnostik. Level: `DEBUG` untuk detail, `INFO` untuk flow normal, `WARNING` untuk kondisi tidak ideal, `ERROR` untuk kegagalan.
- **Ikuti struktur folder** di `docs/ARCHITECTURE.md §3` secara tepat. Jangan buat folder atau file di lokasi yang tidak terdaftar kecuali ada alasan yang jelas dan didokumentasikan.

---

## 5. Database Rules

- **Semua operasi DB** harus menggunakan session dari `database/db.py` — jangan buka koneksi SQLite secara langsung di luar layer `database/`.
- **Deduplication wajib:** Artikel dengan URL yang sama tidak boleh tersimpan lebih dari satu kali. Tangkap `IntegrityError` dari constraint UNIQUE dan catat sebagai artikel yang di-skip.
- **Catat setiap scraping run** ke tabel `scrape_logs` — termasuk yang gagal. Ini penting untuk debugging dan monitoring.

---

## 6. Frontend Rules

- **Tech Stack:** Gunakan **Next.js**, **React**, **TypeScript**, dan **Tailwind CSS**.
- **Desain UI/UX:** Buat tampilan yang sangat modern, dinamis, dan interaktif bergaya cybersecurity (dark mode, glassmorphism, animasi halus). Gunakan **Lucide React** untuk ikon.
- **Komponen UI:** Gunakan pendekatan *Component-based architecture*. Komponen harus rapi di `frontend/src/components/`.
- **API Integration:** Frontend harus mengambil data dari backend Python melalui REST API (endpoint `/api/*`).
- **State Management:** Kelola state dengan React Hooks yang efisien. Hindari re-render yang tidak perlu.

---

## 7. Telegram Notifier Rules

- **Jangan kirim notifikasi duplikat** untuk artikel yang sama — tandai artikel yang sudah dinotifikasi.
- **Rate limiting:** Jangan kirim lebih dari 1 pesan per detik ke Telegram API (batas Telegram Bot API).
- **Semua credential Telegram** (BOT_TOKEN, CHAT_ID) wajib dari `.env`, tidak boleh hardcoded.
- **Jika notifikasi gagal,** log error dan lanjutkan — jangan biarkan kegagalan notifikasi menghentikan proses scraping.

---

## 8. Efficiency Rules (Caveman & Ponytail)

- **Caveman (Terse Prose):** Jangan bertele-tele. Berikan jawaban langsung *to the point*. Hindari basa-basi panjang, intro, atau kesimpulan yang tidak perlu. *"Why use many token when few token do trick"*.
- **Ponytail (Minimalist Code):** Bertindaklah seperti *"lazy senior developer"*. Tulis kode seminimal mungkin untuk menyelesaikan tugas (prinsip YAGNI). Jangan lakukan *over-engineering* atau menambahkan abstraksi/fitur yang belum diminta saat ini. Gunakan pendekatan paling simpel dan efisien.

</RULE[/Users/axeleon/Documents/vscode/SecurityNewsScraper/AGENTS.md]>
