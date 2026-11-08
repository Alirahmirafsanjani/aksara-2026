# Tahap 2 – Dokumentasi: Checklist & Hasil Pengujian

Tanggal: 2026-11-08
Dasar: README.md §6 + §14 Tahap 2.

## Hasil verifikasi
- `npm run build --prefix client` → OK (exit 0)
- Backend live `PORT=3001 node server/src/index.js`:
  - `GET /api/health` → `{"ok":true}`
  - `GET /api/docs/folders` → 6 folder ("Contoh", "Day 1 Ceremony" 78 file: 64 HEIC+14 MOV, "Day 2 (Riset Komoditas)" 198 file: 188 HEIC+9 MOV+1 JPEG, "Day 3..." 0, "day 4" 0, "Pra" 24 file: HEIF/JPEG/HEIC)
  - `GET /api/docs/folders/:id/files` → folder+files (thumbnailLink Google, webViewLink)
  - `GET /api/docs/files/:id/content` → 200 (proxy Drive, cache 86400)
  - `POST /api/docs/folders` → 201 "Tahap2-Test-20261108" (kemudian di-trash kembali agar tidak mengotori Drive)
  - `POST /api/docs/folders/:id/upload` → **terblokir arsitektur Google**: `Service Accounts do not have storage quota` (butuh Shared Drive / OAuth user). Endpoint + validasi JPG/PNG/HEIC/WEBP 15MB siap; pesan error diteruskan ke UI. Bukan bug kode.
  - `DELETE /api/docs/files/:id` → trash (belum diuji menghapus file asli pengguna, hanya verifikasi kode + folder uji yang di-trash).

## Per item Tahap 2
1. Menampilkan folder — **PASS** (hidup ke Drive asli)
2. Membuat folder — **PASS** (terbukti di Drive asli)
3. Mengunggah foto — **BLOCKED luar kode**: kode siap, Google menolak upload service-account ke folder biasa. Solusi: jadikan dokumentasi folder sebagai Shared Drive ATAU pakai OAuth pengguna, lalu uji ulang.
4. Menampilkan foto — **PASS dengan catatan HEIC**: grid thumbnail Google; video ditampilkan terbedakan; HEIC full-view memakai thumbnail + tautan Google Drive (browser tidak mendukung HEIC asli, file asli tidak diubah — sesuai catatan teknis README §6.4).
5. Menghapus foto — **PASS kode, belum diuji pada file asli** (trash + konfirmasi + peringatan bukti logbook di UI; logbook tidak ikut terhapus).

## File Tahap 2
- `server/package.json`, `server/src/index.js`, `server/src/drive.js`, `server/src/routes/docs.js`
- `client/package.json`, `client/vite.config.js`, `client/index.html`, `client/public/manifest.webmanifest`, `client/src/api.js`, `client/src/App.jsx`, `client/src/main.jsx`, `client/src/styles.css`
