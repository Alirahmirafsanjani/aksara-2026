# Tahap 4 – Integrasi dan Pengujian: Laporan

Tanggal: 2026-11-08
Dasar: README.md §14 Tahap 4.

## §4.1 Menguji penyimpanan setiap mahasiswa — PASS 22/22
Untuk tiap no 1–22: `POST /api/logbook/:no/entries` (No=40, baris kosong template) → baca kembali (tepat 1 baris, rincian cocok) → `PUT` ganti bukti → `PUT` restore kosong (hanya No+Tanggal) → verifikasi `filled=false`.
- Putaran 1 (cepat): 15 PASS; 7 gagal di tengah karena **kuota Sheets API (read per menit)** proyek tier rendah, bukan data. Baris 40 untuk 7 itu diverifikasi bersih/kosong.
- Putaran 2 (jeda 2–4 dtk, batch 3+4): 7/7 PASS.
- Total: **22/22 PASS** tulis+edit+restore. Batch yang lambat tetap lolos; tidak ada duplikat No.
- Baca semua 22: masing-masing 40 entries, header 9 kolom sama (terkonfirmasi 3 prodi + semua sheet). Sheet-title bervariasi (mis. Defrin/Efansyah/sheet/Logbook/Dini) dan 2 anomali nama (no=3 sheet “Ali Rahmi”, no=6/21 “Logbook”) — backend memakai sheet pertama sehingga tidak berdampak.

## §4.2 Menguji pengeditan — PASS 22/22
Bagian dari §4.1 (PUT mengganti bukti `...#edit` lalu restore). Edit mengubah baris tepat, bukan menambah duplikat.

## §4.3 Menguji unggah, pratinjau, dan penghapusan foto — SEBAGIAN (blokir kuota upload)
- Unggah: kode + validasi JPG/PNG/HEIC/WEBP 15MB siap; uji live gagal `Service Accounts do not have storage quota` (butuh Shared Drive / OAuth user). Pesan error tampil di UI. Bukan bug kode.
- Pratinjau: Drive asli terbaca (Day 1 78 file 64 HEIC+14 MOV; Day 2 198 file 188 HEIC+9 MOV; Pra 24 file HEIC/HEIF/JPEG; Contoh 1 JPEG). Grid thumbnail Google; HEIC full tetap thumbnail+link Drive (file asli tak diubah); MOV diputar via `/content`. `GET /content` → 200.
- Penghapusan: endpoint trash + konfirmasi + peringatan bukti di UI siap; jalur error benar (`DELETE` file tak ada → `File not found`). Penghapusan file asli pengguna **tidak diuji** agar data aman; folder uji Tahap 2 berhasil di-trash dengan mekanisme yang sama.

## §4.4 Menguji tautan bukti — PASS
Selama §4.1, `bukti` diisi tautan Drive asli (`drive.google.com/file/d/...`) dan diganti via edit; tersimpan & terbaca. Hapus foto tidak menghapus catatan logbook (UI memperingatkan; backend dokumentasi tidak menyentuh Sheets).

## §4.5 Menguji perangkat Android dan iOS — BELUM DIUJI FISIK
Build client OK (`vite build` exit 0, manifest.webmanifest + viewport + grid responsif 2→4 kolom). Pengujian fisik di ponsel Safari/Chrome menunggu perangkat pengguna.

## Jalur error (semua JSON {error})
- Mahasiswa tak dikenal → 404 “Mahasiswa tidak ditemukan”
- Nama folder kosong → 400 “Nama folder wajib diisi”
- File tak ada (DELETE) → “File not found: …”

## Catatan kuota
Sheets API tier rendah memiliki batas read/menit; test batch cepat menembus batas. Pemakaian normal satu pengguna tidak masalah. Jika perlu, naikkan kuota di Google Cloud Console.
