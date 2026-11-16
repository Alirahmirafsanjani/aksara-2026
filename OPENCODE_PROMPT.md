# OPENCODE PROMPT — APLIKASI LOGBOOK AKSARA

## 1. Peran

Bertindak sebagai Full-Stack Developer yang membangun aplikasi sederhana, responsif, mudah digunakan, dan mudah dipelihara.

Bangun aplikasi Logbook dan Dokumentasi untuk kegiatan Aksara Mahasiswa Berdampak 2026.

Ikuti instruksi dalam README.md sebagai acuan utama proyek.

## 2. Gambaran Aplikasi

Aplikasi memiliki dua menu utama:

### A. Logbook

Digunakan mahasiswa untuk mengisi dan mengelola catatan kegiatan harian.

Fitur:
- Pilih program studi.
- Pilih nama mahasiswa.
- Tampilkan daftar logbook mahasiswa.
- Tambah dan edit logbook.
- Formulir mengikuti struktur spreadsheet yang sudah tersedia.
- Pilih satu foto dokumentasi dari menu Dokumentasi sebagai bukti kegiatan.
- Tampilkan status apakah aktivitas sudah memiliki bukti dokumentasi.

Data logbook disimpan langsung ke Google Spreadsheet masing-masing mahasiswa yang sudah tersedia.

Jangan membuat spreadsheet baru.

### B. Dokumentasi

Digunakan untuk mengelola foto kegiatan.

Fitur:
- Menampilkan folder dokumentasi Google Drive.
- Membuat folder baru.
- Mengunggah beberapa foto sekaligus.
- Menampilkan foto dalam bentuk grid.
- Melihat foto dalam ukuran besar.
- Menghapus foto dengan konfirmasi.
- Menggunakan Google Drive Trash, bukan penghapusan permanen.
- Mencegah penghapusan foto yang masih digunakan sebagai bukti logbook.

Format foto yang didukung:
- JPG/JPEG
- PNG
- HEIC
- WEBP

## 3. Teknologi

Frontend:
- React
- Vite
- CSS responsif

Backend:
- Node.js
- Express

Integrasi:
- Google Sheets API
- Google Drive API
- Google Service Account

Aplikasi dirancang sebagai Progressive Web App (PWA).

Tidak perlu menggunakan database tambahan untuk versi awal.

## 4. Aturan Penting

- Tidak menggunakan fitur login.
- Tidak menggunakan data mahasiswa dummy.
- Gunakan data mahasiswa asli dari students.json.
- Jangan membuat spreadsheet baru.
- Jangan mengubah struktur spreadsheet yang sudah ada.
- Jangan menghapus data lama.
- Jangan membuat duplikasi aktivitas ketika mengedit logbook.
- Jangan menyimpan kredensial Google di frontend.
- Jangan memasukkan file kredensial ke Git.
- Jangan membuat fitur di luar kebutuhan utama tanpa alasan yang jelas.
- Prioritaskan kesederhanaan dan kemudahan penggunaan.

## 5. Struktur Spreadsheet Logbook

Nama sheet: Sheet1

Baris pertama merupakan header.

Kolom:
A. No
B. Tanggal Pelaksanaan
C. Waktu Pelaksanaan
D. Durasi
E. Lokasi Pelaksanaan
F. Rincian Pelaksanaan Kegiatan
G. Hasil Pelaksanaan Kegiatan
H. Capaian Kompetensi Mahasiswa
I. Bukti Pelaksanaan Kegiatan

Baris 2–41 digunakan untuk 40 aktivitas.

Nomor aktivitas 1 berada pada baris spreadsheet 2, aktivitas 2 pada baris 3, dan seterusnya.

Ketika mengedit aktivitas, perbarui baris yang sesuai. Jangan menambahkan baris baru secara sembarangan.

## 6. Desain Antarmuka

Gunakan desain:
- Modern dan minimalis.
- Profesional, tetapi tidak kaku.
- Dominan warna yang bersih dan nyaman.
- Navigasi sederhana.
- Responsif untuk HP, tablet, dan desktop.
- Formulir mudah digunakan.
- Tidak terlalu banyak animasi.
- Tidak menggunakan komponen dekoratif yang tidak diperlukan.

Prioritaskan pengalaman pengguna mahasiswa dan pengelola kegiatan.

## 7. Rencana Tahapan Pengerjaan

### Tahap 1 — Fondasi Proyek

Kerjakan:
- Periksa workspace.
- Buat struktur frontend dan backend.
- Siapkan React + Vite.
- Siapkan Express.
- Buat endpoint health-check.
- Buat endpoint daftar mahasiswa.
- Gunakan students.json.
- Buat tampilan awal dengan dua menu utama.
- Siapkan konfigurasi environment.
- Siapkan .gitignore.
- Jalankan pengujian dasar.

Jangan implementasikan Google API pada tahap ini.

### Tahap 2 — Antarmuka Logbook

Kerjakan:
- Halaman daftar program studi.
- Daftar mahasiswa.
- Daftar aktivitas logbook.
- Formulir tambah dan edit aktivitas.
- Pemilihan dokumentasi.
- Tampilan bukti dokumentasi.

Gunakan data sementara hanya untuk kebutuhan pengembangan UI dan beri label jelas bahwa data tersebut bukan data produksi.

### Tahap 3 — Antarmuka Dokumentasi

Kerjakan:
- Tampilan folder.
- Grid foto.
- Preview foto.
- Formulir upload.
- Pembuatan folder.
- Konfirmasi penghapusan.

### Tahap 4 — Integrasi Google

Kerjakan:
- Konfigurasi Google Service Account di backend.
- Integrasi Google Sheets API.
- Integrasi Google Drive API.
- Pembacaan dan pembaruan spreadsheet.
- Upload dan pengelolaan dokumentasi.
- Pengecekan relasi bukti dokumentasi dengan logbook.

Pastikan seluruh akses menggunakan Shared Drive dan mendukung parameter yang diperlukan Google API.

### Tahap 5 — Pengujian

Uji:
- Seluruh mahasiswa dapat ditemukan.
- Spreadsheet yang benar digunakan.
- Data lama tidak berubah.
- Aktivitas baru masuk ke baris yang benar.
- Edit aktivitas tidak membuat duplikasi.
- Foto dapat diunggah.
- Foto dapat dipilih sebagai bukti.
- Foto yang masih digunakan tidak dapat dihapus.
- Aplikasi responsif di HP dan desktop.

## 8. Instruksi untuk OpenCode

Jangan langsung mengerjakan seluruh aplikasi.

Mulai dari Tahap 1 saja.

Sebelum coding:
1. Baca README.md.
2. Periksa seluruh file konfigurasi yang tersedia.
3. Periksa struktur data mahasiswa.
4. Identifikasi informasi yang belum tersedia.
5. Jangan mengarang konfigurasi Google.

Setelah coding:
1. Jalankan aplikasi.
2. Jalankan pengujian.
3. Perbaiki error yang ditemukan.
4. Laporkan pekerjaan yang sudah selesai.
5. Laporkan pekerjaan yang belum selesai.
6. Berikan instruksi menjalankan aplikasi secara lokal.

Jika terdapat informasi penting yang belum tersedia, tanyakan terlebih dahulu daripada membuat asumsi yang berisiko.