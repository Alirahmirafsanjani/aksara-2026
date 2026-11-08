# Tahap 3 – Logbook: Checklist & Hasil Pengujian

Tanggal: 2026-11-08
Dasar: README.md §5 + §14 Tahap 3.

## Hasil verifikasi (live ke Sheets asli, spreadsheet no=1)
- `GET /api/logbook/prodi` → `["Sistem Informasi","PGSD","Gizi"]` OK
- `GET /api/logbook/mahasiswa?prodi=Sistem Informasi` → 11 mahasiswa OK
- `GET /api/logbook/1/entries` → sheet "Defrin", 40 entries, row2 filled (contoh pre-test), row3+ kosong sesuai template OK
- `POST /api/logbook/1/entries` No=40 → rowIndex 41, terbaca kembali OK
- `POST` lagi No=40 → tetap 1 baris (anti-duplikat: update baris sesuai No) OK
- `PUT /api/logbook/1/entries/41` → edit tepat OK
- Restore baris 40 kembali kosong (hanya No+Tanggal) OK, data asli dipulihkan
- `npm run build --prefix client` → OK

## Per item Tahap 3
1. Menampilkan program studi dan mahasiswa — **PASS** (3 prodi, 22 dari config/mahasiswa.json)
2. Membaca spreadsheet — **PASS** (sheet-title dinamis per mahasiswa, header 9 kolom terkonfirmasi dari 3 prodi berbeda)
3. Membuat catatan — **PASS** (POST, mengikuti No/Tanggal template)
4. Mengedit catatan — **PASS** (PUT per rowIndex, teruji live)
5. Menghubungkan satu foto dokumentasi — **PASS kode+UI** (picker folder→file, bukti = webViewLink satu tautan; ganti saat edit dengan mengubah field bukti)

## File Tahap 3
- `server/src/drive.js` (tambah Sheets client + whitelist mahasiswa), `server/src/routes/logbook.js`, `server/src/index.js` (mount)
- `client/src/api.js` (logbook API), `client/src/Logbook.jsx` (baru), `client/src/App.jsx`, `client/src/styles.css`
