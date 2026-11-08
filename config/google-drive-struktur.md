# Struktur Google Drive & Sheets – Tahap 1

## ID yang sudah diketahui
- Spreadsheet template utama (README.md): `1wqk5PhRfPVcFQdV8p5AIs0S_BSKLywHfEsMq6zYFSV8`
  https://docs.google.com/spreadsheets/d/1wqk5PhRfPVcFQdV8p5AIs0S_BSKLywHfEsMq6zYFSV8/edit
- Folder induk logbook (README.md): `1KPltSlYvp8gboHi69aC7FzyDW98mjJPm`
  https://drive.google.com/drive/folders/1KPltSlYvp8gboHi69aC7FzyDW98mjJPm
- Folder induk dokumentasi (dikonfirmasi pengguna 2026-11-08): `1T3Ll14UO5ux7fsG9XmHnMimPMb9qW0Ce`
  https://drive.google.com/drive/folders/1T3Ll14UO5ux7fsG9XmHnMimPMb9qW0Ce
- Daftar ID spreadsheet per mahasiswa: `config/mahasiswa.json` (22 ID unik, diimpor dari `Data Mahasiswa.xlsx`)

## Pemetaan prodi (dari Data Mahasiswa.xlsx)
- Sistem Informasi: 11 mahasiswa
- Gizi: 8 mahasiswa
- PGSD: 3 mahasiswa
- Total: 22

## Akses API
- Service account: `server/credentials/aksara-2026-514022-584b4a49f95d.json` (ada, valid)
- Per pengguna (2026-11-08): service account sudah ditambahkan sebagai **Editor** → folder/spreadsheet dapat diakses backend.

## Aturan Tahap 1
- Service account diberi izin eksplisit (tidak wajib publik).
- Jangan membuat spreadsheet/folder baru otomatis pada penggunaan normal.
- Sisa keputusan open item README §13 (boleh hapus folder atau hanya file; tolak vs peringatan bila foto dipakai bukti) → diputuskan di Tahap 2/4.
