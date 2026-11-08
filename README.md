# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Aplikasi Logbook dan Dokumentasi Aksara 2026

**Versi:** 1.1 – Revisi  
**Status:** Draft untuk finalisasi  
**Platform:** Android, iOS, dan Web  
**Jenis aplikasi:** Progressive Web App (PWA)

---

## 1. Latar Belakang

Kegiatan Aksara 2026 melibatkan 22 mahasiswa dari tiga program studi, yaitu Sistem Informasi, PGSD, dan Gizi.

Mahasiswa perlu mencatat aktivitas kegiatan melalui logbook dan mengumpulkan dokumentasi berupa foto. Saat ini, logbook menggunakan Google Sheets, sedangkan dokumentasi disimpan di Google Drive.

Aplikasi dikembangkan untuk mengintegrasikan pengelolaan logbook dan dokumentasi melalui satu antarmuka yang sederhana dan mudah digunakan.

Aplikasi tidak menggantikan Google Sheets maupun Google Drive. Keduanya tetap menjadi media penyimpanan utama.

## 2. Tujuan Aplikasi

1. Memudahkan mahasiswa mengisi logbook melalui Android maupun iOS.
2. Memudahkan mahasiswa melihat catatan logbook berdasarkan nama dan program studi.
3. Memudahkan pengelolaan dokumentasi berdasarkan folder.
4. Menghubungkan satu foto dokumentasi dengan setiap catatan logbook sebagai bukti kegiatan.
5. Mempertahankan struktur penyimpanan Google Sheets dan Google Drive yang sudah digunakan.

## 3. Target Pengguna

Aplikasi digunakan oleh 22 mahasiswa dari:
- Sistem Informasi.
- PGSD.
- Gizi.

Aplikasi tidak menggunakan login individual maupun PIN akses bersama.

**Catatan keamanan:** Karena tidak ada autentikasi, siapa pun yang memiliki akses ke aplikasi berpotensi mengisi, mengedit, atau menghapus data. Pemilihan nama mahasiswa bukan verifikasi identitas. Risiko ini harus diterima dan dipahami sebelum aplikasi digunakan secara luas.

## 4. Ruang Lingkup

Aplikasi memiliki dua menu utama:

1. Logbook.
2. Dokumentasi.

Fitur di luar versi awal:
- Login dan akun individual.
- PIN akses.
- Dashboard statistik.
- Penilaian mahasiswa.
- Notifikasi otomatis.
- Chat antarmahasiswa.

## 5. Menu Logbook

### 5.1 Pemilihan Program Studi

Pengguna dapat memilih:
- Sistem Informasi.
- PGSD.
- Gizi.

### 5.2 Pemilihan Mahasiswa

Setelah memilih program studi, aplikasi menampilkan daftar mahasiswa sesuai program studi tersebut.

Pengguna memilih nama mahasiswa untuk membuka logbook miliknya.

### 5.3 Daftar Logbook

Aplikasi menampilkan daftar catatan kegiatan mahasiswa yang dipilih.

Informasi ringkas:
- Tanggal kegiatan.
- Waktu kegiatan.
- Lokasi kegiatan.
- Rincian kegiatan.

Pengguna dapat membuka catatan untuk melihat seluruh informasi.

### 5.4 Formulir Logbook

Formulir mengikuti sembilan kolom pada template logbook:

| No. | Kolom | Jenis Data |
|---|---|---|
| 1 | No | Nomor urut |
| 2 | Tanggal Pelaksanaan | Tanggal |
| 3 | Waktu Pelaksanaan | Waktu |
| 4 | Durasi | Teks |
| 5 | Lokasi Pelaksanaan | Teks |
| 6 | Rincian Pelaksanaan Kegiatan | Teks |
| 7 | Hasil Pelaksanaan Kegiatan | Teks |
| 8 | Capaian Kompetensi Mahasiswa | Teks |
| 9 | Bukti Pelaksanaan Kegiatan | Satu tautan foto |

Ketentuan:
- Nomor urut mengikuti template.
- Tanggal kegiatan mengikuti jadwal yang tersedia pada template.
- Pengguna mengisi informasi kegiatan.
- Bukti kegiatan dipilih dari menu Dokumentasi.
- Setiap catatan logbook hanya dapat memiliki satu foto bukti.
- Pengguna dapat menyimpan catatan baru.
- Pengguna dapat mengedit catatan yang sudah disimpan.
- Ketika bukti foto diganti, tautan bukti pada logbook diperbarui.
- Data disimpan ke spreadsheet mahasiswa yang sedang dipilih.

### 5.5 Integrasi Google Sheets

Google Sheets menjadi penyimpanan utama logbook.

Template utama:
https://docs.google.com/spreadsheets/d/1wqk5PhRfPVcFQdV8p5AIs0S_BSKLywHfEsMq6zYFSV8/edit

Folder induk logbook:
https://drive.google.com/drive/folders/1KPltSlYvp8gboHi69aC7FzyDW98mjJPm

Struktur folder yang digunakan:
- Sistem Informasi: spreadsheet setiap mahasiswa.
- PGSD: spreadsheet setiap mahasiswa.
- Gizi: spreadsheet setiap mahasiswa.

Ketentuan:
- Gunakan spreadsheet mahasiswa yang sudah tersedia.
- Jangan membuat spreadsheet baru secara otomatis pada penggunaan normal.
- Setiap mahasiswa harus dipetakan ke ID spreadsheet yang benar.
- Struktur kolom harus sesuai template utama.
- Sistem hanya boleh mengubah spreadsheet mahasiswa yang sedang dipilih.
- Pengeditan logbook harus memperbarui catatan yang benar, bukan menambahkan duplikat.
- Kesalahan penyimpanan harus ditampilkan kepada pengguna.

## 6. Menu Dokumentasi

### 6.1 Daftar Folder

Pengguna dapat melihat folder dokumentasi kegiatan.

Contoh:
- Day 1.
- Day 2.
- Day 3.
- Day 4.

Nama folder tidak dibatasi pada contoh tersebut.

### 6.2 Membuat Folder

Pengguna dapat membuat folder dokumentasi baru.

Ketentuan:
- Pengguna memasukkan nama folder.
- Sistem membuat folder di Google Drive.
- Folder baru langsung muncul pada daftar dokumentasi.

### 6.3 Mengunggah Dokumentasi

Pengguna dapat mengunggah satu atau beberapa foto ke folder yang dipilih.

Format gambar yang diharapkan:
- JPG/JPEG.
- PNG.
- HEIC.
- WEBP.

Ketentuan:
- Pengguna dapat memilih satu atau beberapa file dalam satu proses unggah.
- Pengguna dapat melihat nama file sebelum mengunggah.
- Sistem menampilkan status unggahan.
- Sistem menampilkan pesan jika unggahan gagal.
- File disimpan di folder Google Drive yang dipilih.

### 6.4 Melihat Dokumentasi

Pengguna dapat:
- Melihat foto dalam bentuk grid.
- Membuka foto dalam tampilan penuh.
- Berpindah ke foto berikutnya atau sebelumnya.
- Melihat nama file dan folder asalnya.

Catatan teknis: pratinjau HEIC tidak selalu didukung browser. Sistem perlu menyediakan konversi untuk kebutuhan pratinjau apabila diperlukan, tanpa menghilangkan file asli.

### 6.5 Menghapus Dokumentasi

Pengguna dapat menghapus foto dokumentasi.

Ketentuan:
- Pengguna memilih foto yang ingin dihapus.
- Sistem menampilkan konfirmasi sebelum penghapusan.
- Setelah dikonfirmasi, sistem menghapus atau memindahkan file ke sampah Google Drive sesuai mekanisme API.
- Sistem memperbarui tampilan dokumentasi setelah penghapusan.
- Jika foto yang dihapus sedang digunakan sebagai bukti logbook, sistem harus menangani tautan yang sudah tidak valid dan memberi informasi kepada pengguna.
- Penghapusan foto tidak boleh menghapus catatan logbook secara otomatis.

### 6.6 Menghubungkan Dokumentasi dengan Logbook

Setiap catatan logbook hanya memiliki satu foto bukti.

Alur:
1. Pengguna membuka formulir logbook.
2. Pengguna memilih bukti kegiatan.
3. Sistem menampilkan folder dokumentasi.
4. Pengguna memilih folder.
5. Pengguna memilih satu foto.
6. Sistem memasukkan tautan foto ke catatan logbook.

Pengguna dapat mengganti foto bukti melalui proses edit logbook.

## 7. Alur Penggunaan

### 7.1 Mengisi Logbook

1. Pengguna membuka aplikasi.
2. Memilih menu Logbook.
3. Memilih program studi.
4. Memilih nama mahasiswa.
5. Melihat daftar logbook.
6. Memilih tanggal atau nomor kegiatan.
7. Mengisi formulir.
8. Memilih satu foto dokumentasi sebagai bukti.
9. Menyimpan logbook.
10. Sistem mengirim data ke spreadsheet mahasiswa terkait.
11. Sistem menampilkan status penyimpanan.

### 7.2 Mengedit Logbook

1. Pengguna membuka logbook mahasiswa.
2. Memilih catatan yang akan diedit.
3. Mengubah informasi yang diperlukan.
4. Jika diperlukan, mengganti foto bukti.
5. Menyimpan perubahan.
6. Sistem memperbarui catatan pada Google Sheets.

### 7.3 Mengunggah Dokumentasi

1. Pengguna membuka menu Dokumentasi.
2. Memilih folder yang tersedia.
3. Mengunggah foto.
4. Sistem mengirim file ke Google Drive.
5. Sistem menampilkan dokumentasi yang berhasil diunggah.

### 7.4 Menghapus Dokumentasi

1. Pengguna membuka menu Dokumentasi.
2. Memilih foto yang akan dihapus.
3. Sistem menampilkan konfirmasi.
4. Pengguna menyetujui penghapusan.
5. Sistem memproses penghapusan.
6. Sistem memperbarui tampilan.

## 8. Rekomendasi Teknologi

| Komponen | Teknologi |
|---|---|
| Frontend | React |
| Build tool | Vite |
| Backend | Node.js + Express |
| Logbook | Google Sheets API |
| Dokumentasi | Google Drive API |
| Platform | PWA |
| Bahasa | Bahasa Indonesia |

PWA dipilih agar aplikasi dapat digunakan melalui browser dan ditambahkan ke layar utama Android maupun iOS.

## 9. Arsitektur Sistem

Alur komunikasi:

Pengguna → PWA React → Backend Express → Google Sheets API / Google Drive API.

**Frontend**
- Menampilkan antarmuka.
- Menampilkan daftar program studi dan mahasiswa.
- Menampilkan formulir logbook.
- Mengelola pemilihan foto.
- Menampilkan dokumentasi.

**Backend**
- Mengelola komunikasi dengan Google API.
- Memetakan mahasiswa ke spreadsheet.
- Membaca, menyimpan, dan mengedit logbook.
- Mengelola folder dan file dokumentasi.
- Memproses penghapusan dokumentasi.
- Menangani validasi dan kesalahan.

**Google Sheets**
- Menyimpan logbook masing-masing mahasiswa.

**Google Drive**
- Menyimpan spreadsheet dan dokumentasi.

Kredensial Google API hanya boleh disimpan di backend, tidak boleh ditampilkan atau dikirim ke frontend.

## 10. Konfigurasi Google Drive dan Sheets

Sistem membutuhkan:
- ID folder induk logbook.
- ID folder induk dokumentasi.
- ID spreadsheet setiap mahasiswa.
- Nama dan program studi mahasiswa.
- Konfigurasi akses Google API.

Contoh struktur pemetaan:

| Nama Mahasiswa | Program Studi | Spreadsheet ID |
|---|---|---|
| Mahasiswa A | Sistem Informasi | ID spreadsheet A |
| Mahasiswa B | PGSD | ID spreadsheet B |
| Mahasiswa C | Gizi | ID spreadsheet C |

Nama dan ID pada tabel merupakan contoh, bukan data sebenarnya.

Backend harus mendapatkan izin yang sesuai terhadap folder dan spreadsheet. Folder tidak perlu dibuat publik hanya untuk mempermudah integrasi.

## 11. Kebutuhan Nonfungsional

### Kemudahan Penggunaan
- Antarmuka sederhana dan responsif.
- Dapat digunakan melalui ponsel.
- Formulir mudah dipahami.
- Tidak membutuhkan instalasi melalui Play Store atau App Store.

### Performa
- Daftar mahasiswa dan logbook dimuat secara efisien.
- Foto menggunakan thumbnail sebelum dibuka penuh.
- Unggahan menampilkan indikator proses.

### Keamanan dan Integritas Data
- Kredensial API disimpan di backend.
- Validasi tipe dan ukuran file dilakukan.
- Kesalahan akses Google ditangani dengan baik.
- Tindakan menghapus dokumentasi memerlukan konfirmasi.
- Pengeditan harus mengubah catatan yang tepat.
- Karena tidak ada autentikasi, aplikasi memiliki risiko penyalahgunaan oleh pihak yang memperoleh akses ke URL.

### Kompatibilitas
- Mendukung browser modern Android.
- Mendukung Safari iOS.
- Mendukung desktop.

## 12. Kriteria Penerimaan (Acceptance Criteria)

Aplikasi dinyatakan memenuhi kebutuhan MVP apabila:

1. Dapat dibuka melalui Android, iOS, dan desktop.
2. Memiliki dua menu utama: Logbook dan Dokumentasi.
3. Menampilkan tiga program studi.
4. Menampilkan mahasiswa sesuai program studi.
5. Dapat membaca logbook mahasiswa yang dipilih.
6. Dapat membuat catatan logbook.
7. Dapat mengedit catatan logbook yang sudah tersimpan.
8. Menyimpan data ke spreadsheet mahasiswa yang benar.
9. Dapat menampilkan folder dokumentasi.
10. Dapat membuat folder dokumentasi.
11. Dapat mengunggah foto ke Google Drive.
12. Dapat menampilkan foto dalam tampilan penuh.
13. Dapat menghapus dokumentasi setelah konfirmasi.
14. Dapat memilih tepat satu foto sebagai bukti setiap catatan logbook.
15. Dapat mengganti foto bukti saat mengedit logbook.
16. Menangani tautan bukti yang tidak valid akibat penghapusan foto.
17. Menampilkan pesan jika penyimpanan atau unggahan gagal.
18. Tidak mengekspos kredensial API pada frontend.

## 13. Hal yang Masih Perlu Dipastikan

1. Daftar 22 mahasiswa beserta program studinya.
2. ID spreadsheet setiap mahasiswa.
3. Apakah semua spreadsheet mahasiswa menggunakan nama sheet dan struktur yang sama dengan template.
4. Batas maksimal ukuran setiap foto.
5. Apakah folder dokumentasi boleh dihapus atau hanya file foto.
6. Apakah penghapusan foto yang sedang dipakai sebagai bukti harus ditolak atau diperbolehkan dengan peringatan.

## 14. Tahapan Pengembangan

**Tahap 1 – Persiapan**
- Mengumpulkan daftar mahasiswa.
- Mengumpulkan ID spreadsheet.
- Memastikan struktur folder Drive.
- Menyiapkan akses Google API.

**Tahap 2 – Dokumentasi**
- Menampilkan folder.
- Membuat folder.
- Mengunggah foto.
- Menampilkan foto.
- Menghapus foto.

**Tahap 3 – Logbook**
- Menampilkan program studi dan mahasiswa.
- Membaca spreadsheet.
- Membuat catatan.
- Mengedit catatan.
- Menghubungkan satu foto dokumentasi.

**Tahap 4 – Integrasi dan Pengujian**
- Menguji penyimpanan setiap mahasiswa.
- Menguji pengeditan.
- Menguji unggah, pratinjau, dan penghapusan foto.
- Menguji tautan bukti.
- Menguji perangkat Android dan iOS.

**Tahap 5 – Deployment**
- Deploy backend.
- Deploy frontend.
- Mengatur konfigurasi Google API.
- Melakukan pengujian akhir.

---

**Target akhir:** Satu aplikasi PWA sederhana untuk mengelola logbook 22 mahasiswa dan dokumentasi Aksara 2026 melalui Google Sheets dan Google Drive.