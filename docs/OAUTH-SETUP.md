# Perbaiki Upload: OAuth user (kuota Google Drive)

## Masalah
Upload via **service account** ditolak Google: `Service Accounts do not have storage quota`. Folder dokumentasi adalah Drive biasa (Shared Drive tidak tersedia: `drives: []`), jadi satu-satunya jalur adalah **OAuth user** (upload atas nama akun Google pemilik folder → memakai kuota akun itu).

## Langkah pengguna (sekali, ~5 menit)
1. Buka Google Cloud Console untuk proyek yang sama dengan service account (`aksara-2026-514022`): https://console.cloud.google.com/
2. **APIs & Services → OAuth consent screen**: pilih **External**. Isi nama app `Aksara 2026`, email support pemohon, lalu **Scopes**: tambahkan `https://www.googleapis.com/auth/drive`. Simpan.
3. Di halaman yang sama → **Test users**: tambahkan email Google Anda (akun pemilik Drive). Simpan.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**: beri nama `Aksara Upload`, Authorized redirect URIs: `http://localhost:3000/api/auth/callback` (untuk lokal; untuk deploy publik tambahkan `https://URL-APP/api/auth/callback`).
5. Salin **Client ID** + **Client secret** ke `server/.env` sebagai `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`; `GOOGLE_OAUTH_REDIRECT_URI` samakan dengan langkah 4.
6. Jalankan backend (`PORT=3000 node server/src/index.js`), buka `http://localhost:3000/api/auth/login`, login dengan akun pemilik Drive, izinkan akses Drive. Callback menyimpan `server/.tokens.json` (mode 600, sudah di `.gitignore`).
7. Coba upload foto di aplikasi. Verifikasi `http://localhost:3000/api/auth/status` → `{"connected":true}`.

## Catatan
- Daftar & baca Sheets tetap pakai service account (tidak perlu OAuth). Hapus file `.tokens.json` untuk memutuskan OAuth.
- Jangan commit `.tokens.json` / `server/.env` / `credentials/*.json`.
- Setelah deploy publik: tambahkan redirect URI produksi + test user, lalu ulangi login OAuth di domain produksi.
