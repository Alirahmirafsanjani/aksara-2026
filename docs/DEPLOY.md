# Deploy Aksara 2026 (Tahap 5)

## Arsitektur jalan
Backend Express (`server/src/index.js`) menyajikan API `/api/*` **dan** frontend statik `client/dist/` di satu port (default 3000). Satu service deploy cukup (Dockerfile di root).

## Lokal (cepat)
```bash
npm install --prefix server
npm install --prefix client
npm run build --prefix client
PORT=3000 node server/src/index.js
# buka http://localhost:3000/
```

## Docker / Render / Railway / Fly
- Build: `docker build -t aksara .`
- Jalankan: `docker run -p 3000:3000 aksara`
- Env (di dashboard, bukan git): `GOOGLE_DRIVE_DOC_PARENT_FOLDER_ID`, `GOOGLE_DRIVE_LOG_BOOK_PARENT_FOLDER_ID`, `PORT=3000`.

## Kredensial Google di hosting
- File `server/credentials/*.json` **tidak** ikut git. Di Render tambahkan sebagai **Secret File** di `/app/server/credentials/aksara-2026-514022-584b4a49f95d.json`, atau naikkan `GOOGLE_APPLICATION_CREDENTIALS` ke path secret tersebut.
- Pastikan service account tetap **Editor** pada 22 spreadsheet + 4 folder dokumentasi. Untuk unggah file: jadikan folder dokumentasi **Shared Drive** (kuota service account nol di folder biasa) atau ganti OAuth user.

## Catatan
- Frontend dev (`npm run dev --prefix client`) memakai proxy `/api → localhost:3000`. Production tidak perlu proxy (same origin).
- Jangan deploy `server/.env` (sudah di `.gitignore`).
