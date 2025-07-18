# WebMemberScraper

Aplikasi scraping member Telegram siap deploy Railway.

## Deploy ke Railway
1. Push project ke GitHub.
2. Deploy repo ke Railway.
3. Tambahkan PostgreSQL di Railway, link ke service backend.
4. Isi `TELEGRAM_API_ID` dan `TELEGRAM_API_HASH` di Environment Variables Railway.
5. Jalankan migrasi database jika perlu: `npx drizzle-kit push`.
6. Enjoy!
