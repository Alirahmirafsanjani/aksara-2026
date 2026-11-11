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
- File `server/credentials/*.json` **tidak** ikut git. Di Render tambahkan sebagai **Secret File** (Filename `aksara-2026-514022-584b4a49f95d.json`, Contents = isi JSON) lalu set `GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/aksara-2026-514022-584b4a49f95d.json`.
- Pastikan service account tetap **Editor** pada 22 spreadsheet + folder dokumentasi/logbook. Untuk unggah file: pakai OAuth user (service account tidak punya kuota storage).

## Render Free: server "mati" dan token OAuth hilang
Render Free **mematikan service setelah 15 menit tanpa traffic** (bangun lagi ±1 menit) dan **filesystem-nya dikosongkan**. Free juga **tidak bisa** memasang Persistent Disk (`DATA_DIR` tidak awet di Free).

Yang sudah ditangani aplikasi:
- **Backup token OAuth ke Drive.** Setelah login OAuth, refresh token disalin ke folder **`Aksara Config`** (di dalam folder logbook) sebagai `aksara-oauth-token.json`. Saat server bangun/redeploy, service account membaca file itu dan `.tokens.json` dipulihkan otomatis — **tidak perlu login ulang**.
  - Login sekali: `https://<domain>/api/auth/login`
  - Cek: `https://<domain>/api/auth/status` → `{"connected":true,"token":{"restoredFromDrive":true}}` setelah bangun.
  - Jangan hapus/ubah folder `Aksara Config`; isinya menyimpan akses token (jangan dibagikan).

### Agar tidak sering tidur: ping eksternal (gratis, opsional)
1. Daftar di **cron-job.org** (atau UptimeRobot).
2. Buat job: URL `https://aksara-2026.onrender.com/api/health`, interval **10 menit**, method GET.
3. Aktifkan. Server nyaris tidak pernah tidur; cold start hilang.
4. Catatan kuota Free: 750 jam/bulan per workspace. Satu service yang selalu menyala ±730 jam/bulan (masih masuk, tapi mepet). Aktifkan ping hanya saat periode pemakaian (mis. masa kegiatan) untuk menghemat.
5. Render tidak menyarankan Free untuk produksi; bila butuh andal penuh, upgrade ke **Starter ±$7/bulan** (tidak tidur + bisa Persistent Disk).

Token backup tetap berguna walau pakai ping: redeploy/restart tidak menghapus akses lagi.

## Catatan
- Frontend dev (`npm run dev --prefix client`) memakai proxy `/api → localhost:3000`. Production tidak perlu proxy (same origin).
- Jangan deploy `server/.env` (sudah di `.gitignore`).
- `GET /api/auth/status` menampilkan metadata token (`obtainedAt`, `restoredFromDrive`) tanpa membocorkan isi token.
