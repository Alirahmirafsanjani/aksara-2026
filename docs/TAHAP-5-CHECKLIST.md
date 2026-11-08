# Tahap 5 – Deployment & Pengujian Akhir (README §12)

Tanggal: 2026-11-08
- Aplikasi sudah dibuat: backend `server/` + frontend `client/` (Tahap 2–3, teruji live Tahap 4).
- Kini satu proses (`PORT=3000 node server/src/index.js`) menyajikan API + `client/dist/`. Terbukti: `GET /` → HTML + assets 200, `GET /api/health` → `{"ok":true}`, `GET /api/logbook/prodi` via port sama OK. Build client exit 0.

## Kriteria penerimaan §12 (18)
1. Android/iOS/desktop — **UI+build siap** (manifest, viewport, grid responsif); uji fisik menunggu perangkat pengguna.
2. Dua menu — **PASS** (tab Dokumentasi + Logbook).
3. Tiga prodi — **PASS**.
4. Mahasiswa sesuai prodi — **PASS** (22).
5. Baca logbook — **PASS** (22/22, 40 entries tiap sheet).
6. Buat catatan — **PASS** (POST teruji 22/22).
7. Edit — **PASS** (PUT 22/22).
8. Spreadsheet benar — **PASS** (whitelist `config/mahasiswa.json` + sheet dinamis).
9. Folder dokumentasi — **PASS** (6 folder live).
10. Buat folder — **PASS** (201 live).
11. Upload foto — **BLOCKED kuota Google** (`Service Accounts do not have storage quota`); kode+validasi siap, butuh Shared Drive/OAuth.
12. Foto penuh — **PASS** (grid + lightbox; HEIC thumbnail+link, video diputar).
13. Hapus konfirmasi — **PASS kode+jalur error** (trash; file asli tidak diuji demi keamanan).
14. Satu foto bukti — **PASS** (picker satu file + satu field).
15. Ganti bukti saat edit — **PASS** (PUT bukti teruji).
16. Tautan tidak valid — **PASS** (peringatan di UI hapus; logbook tidak ikut terhapus; bukti bisa diganti).
17. Pesan gagal — **PASS** (JSON `{error}` → UI).
18. Kredensial tidak di frontend — **PASS** (hanya server; `.env.example` bersih; `.gitignore`).

## File deployment
`Dockerfile`, `render.yaml`, `.dockerignore`, `server/.env`, `docs/DEPLOY.md`. Lihat DEPLOY.md untuk perintah deploy + Secret File kredensial.
