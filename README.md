# Tugas Teknis Developer: Dashboard Full-Stack & Penggelaran Kontainer (Docker/Podman)

Selamat datang di tugas teknis ini! Dalam tugas ini, Anda diminta untuk membangun aplikasi web dashboard yang terintegrasi dengan layanan Go REST API yang sudah ada. Aplikasi ini memiliki fitur autentikasi JWT, manajemen tabel data dengan kemampuan tambah/hapus, grafik analitik interaktif untuk pendapatan (revenue) dan pengguna (user), serta penggelaran terwadahi (containerized) menggunakan Docker atau Podman. **Untuk API source berada di paling bawah dokumen ini**

---

## 🎯 Tujuan Tugas

Membangun **Aplikasi Dashboard Frontend** yang modern dan responsif serta men-containerize aplikasi tersebut bersama dengan (atau terkonfigurasi dengan) layanan backend API yang disediakan di repositori ini.

### Ringkasan Persyaratan Utama:
1. **Autentikasi JWT & Manajemen Sesi**: Halaman/tampilan login, penyimpanan token, logout, serta akses rute terproteksi.
2. **Tabel Manajemen Data**: Menampilkan data record dari API dengan pencarian/filter, **Tambah Record** (formulir/modal), dan fungsi **Hapus Record**.
3. **Dashboard Analitik & Grafik**: Visualisasi grafik **Pendapatan (Revenue)** dan distribusi/metrik **Pengguna (User)**, beserta statistik sistem.
4. **Containerization & Penggelaran**: Pengaturan Dockerfile/Containerfile dan orkestrasi (Docker/Podman) untuk membangun dan menjalankan solusi secara bersih dan efisien.

---

## 📡 Spesifikasi & Referensi Arsitektur API

Backend Go REST API berjalan secara lokal pada `http://localhost:8080` (atau melalui konfigurasi lingkungan).

### 🔑 Kredensial & Keamanan Autentikasi
- **Username Default**: `user`
- **Password Default**: `pass`
- **Tipe Autentikasi**: JWT Bearer Token (Masa berlaku 24 jam).
- **Format Header untuk Endpoint Terproteksi**: `Authorization: Bearer <JWT_TOKEN>`
- **Perlindungan DDoS / Pembatasan Laju (Rate Limiting)**: 10 request/detik per IP dengan kapasitas burst 30. Memicu `HTTP 429` jika terlampaui.
- **Batas Ukuran Payload Maksimum**: Batas ukuran body request maksimum 1MB.

---

### 📋 Endpoint Backend API

| Metode | Endpoint | Butuh Auth | Deskripsi | Body Request / Parameter |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/` | ❌ Tidak | Endpoint pemeriksaan kesehatan (Health check) | N/A |
| `POST` | `/api/login` | ❌ Tidak | Otentikasi dan dapatkan JWT token | `{"username": "user", "password": "pass"}` |
| `GET` | `/swagger/` | ❌ Tidak | Dokumentasi Swagger UI interaktif | N/A |
| `GET` | `/api/records` | 🔒 **JWT** | Ambil semua data records | Query params: `?limit=N` |
| `GET` | `/api/records/{id}` | 🔒 **JWT** | Ambil satu record berdasarkan ID | Path param: `id` (integer) |
| `POST` | `/api/records` | 🔒 **JWT** | Buat record baru (kustom atau dummy) | Payload JSON kustom (lihat Skema) atau `{}` |
| `DELETE` | `/api/records/{id}` | 🔒 **JWT** | Hapus record berdasarkan ID | Path param: `id` (integer > 0) |
| `POST` | `/api/seed` | 🔒 **JWT** | Isi (seed) data dummy | Query params: `?count=5` (default 5) |
| `GET` | `/api/stats` | 🔒 **JWT** | Ambil metrik sistem & database | N/A |

---

### 💾 Skema Data

#### 1. Struktur Data `Record`
```json
{
  "id": 1,
  "site_name": "alpha-hub.io",
  "revenue": 5432.10,
  "user": "alice_dev",
  "payload": "{\"status\":\"active\",\"region\":\"us-east-1\",\"ping_ms\":25,\"views\":12500}",
  "created_at": "2026-08-03 12:00:00"
}
```

**Aturan Validasi Input untuk Menambah Record (`POST /api/records`):**
- `site_name` (string): Maksimal 100 karakter.
- `revenue` (float): Angka positif antara `0` hingga `1.000.000.000`.
- `user` (string): Maksimal 50 karakter.
- `payload` (string): Harus berupa string objek JSON yang valid (maksimal 50KB).
- *Catatan*: Mengirimkan body kosong `{}` akan membuat data dummy yang valid secara otomatis.

#### 2. Struktur Data `Stats`
```json
{
  "total_records": 10,
  "total_revenue": 54321.50,
  "alloc_memory_mb": 4.12,
  "sys_memory_mb": 12.45,
  "num_goroutines": 8,
  "uptime": "1h 15m 30s"
}
```

---

## 🛠️ Persyaratan Fungsional Detail

### Fitur 1: Autentikasi & Sesi Pengguna
- [ ] **Tampilan Login**: Sediakan halaman/modal login yang menerima Username & Password.
- [ ] **Proses JWT**: Panggil `POST /api/login` saat formulir dikirimkan. Simpan `token` yang dikembalikan secara aman.
- [ ] **Status Sesi**: Lampirkan `Authorization: Bearer <token>` secara otomatis pada setiap panggilan API yang terproteksi.
- [ ] **Logout**: Sediakan tombol Logout yang jelas untuk menghapus token dan mengembalikan pengguna ke halaman login.
- [ ] **Penanganan Kesalahan**: Tampilkan pesan kesalahan login secara informatif (misalnya kredensial tidak valid `401`).

### Fitur 2: Tabel Manajemen Data (Tambah & Hapus)
- [ ] **Tabel Records**: Tampilkan semua record yang diambil dari `GET /api/records` dengan kolom yang terformat (`ID`, `Site Name`, `Revenue`, `User`, `Detail Payload`, `Created At`, `Aksi`).
- [ ] **Tambah Record**:
  - Implementasikan modal/formulir "Tambah Record" untuk menginput `site_name`, `revenue`, `user`, dan `payload`.
  - Validasi input di sisi frontend sebelum mengirimkan ke `POST /api/records`.
  - Sediakan juga tombol cepat "Generate Seed Data" yang memanggil `POST /api/seed` atau mengirim `{}`.
- [ ] **Hapus Record**:
  - Tambahkan tombol aksi "Hapus" pada setiap baris tabel.
  - Jalankan `DELETE /api/records/{id}` setelah konfirmasi dari pengguna.
  - Perbarui data tabel secara mulus setelah penghapusan.
- [ ] **Cari / Filter**: Fitur bilah pencarian opsional untuk memfilter record tabel berdasarkan nama situs atau pengguna.

### Fitur 3: Dashboard Analitik & Grafik
- [ ] **Grafik Pendapatan (Revenue)**:
  - Grafik visual (misalnya Bar chart atau Pie chart) yang menampilkan **Pendapatan per Situs** atau **Distribusi Pendapatan antar Pengguna**.
  - Kartu metrik Total Pendapatan yang tersinkronisasi dengan `GET /api/stats` atau diakumulasikan dari data record.
- [ ] **Grafik & Metrik Pengguna (User)**:
  - Grafik visual yang menampilkan **Jumlah Record per Pengguna** atau **Rincian Pengguna Aktif**.
  - Kartu ringkasan metrik (Total Record, Total Pendapatan, Penggunaan RAM / Statistik Sistem dari `/api/stats`).
- [ ] **Pembaruan Real-time / Otomatis**: Kemampuan untuk memperbarui secara manual atau menyinkronkan data grafik secara berkala saat ada record baru yang ditambahkan atau dihapus.

### Fitur 4: UI/UX & Ketahanan Aplikasi
- [ ] **Desain Responsif**: Tata letak yang bersih dan adaptif untuk ukuran layar desktop maupun seluler (mobile).
- [ ] **Umpan Balik Loading & Error**: Tangani status pemuatan (loading state), pembatasan laju (`429`), dan kesalahan otorisasi (`401`) dengan toast atau notifikasi visual yang jelas.

### Fitur 5: Containerization & Penggelaran (Docker / Podman)
- [ ] **Build Kontainer**: Buat `Dockerfile` (atau `Containerfile`) untuk aplikasi dashboard Anda.
- [ ] **Orchestration**: Sediakan file `docker-compose.yml` atau `podman-compose.yml` (atau skrip jalankan) yang menjalankan keduanya:
  1. Kontainer backend Go REST API.
  2. Kontainer frontend dashboard Anda.
- [ ] **Verifikasi Penggelaran**: Pastikan dashboard dapat berkomunikasi dengan backend API di dalam jaringan kontainer.

---

## 📂 Hasil Kerja (Deliverables) & Daftar Periksa Pengiriman

1. **Kode Sumber Dashboard Frontend**: Diunggah ke repositori solusi atau direktori yang diserahkan.
2. **File Kontainer**: `Dockerfile` / `Containerfile` dan `docker-compose.yml` (atau `podman-compose.yml` / skrip penggelaran).
3. **Dokumentasi `README.md`**: Panduan penyiapan yang jelas dan menjelaskan:
   - Cara membangun dan menjalankan aplikasi secara lokal.
   - Cara menjalankan penyiapan kontainer dengan Docker atau Podman.
   - Kredensial yang digunakan untuk login (`user` / `pass`).

---

## 🧪 Kriteria Evaluasi

- **Kelengkapan Fungsional**: Semua persyaratan CRUD (Tambah/Hapus/Lihat tabel, autentikasi JWT, Grafik) berfungsi sesuai harapan.
- **Kualitas Kode & Arsitektur**: Struktur komponen yang bersih, manajemen status yang tangguh, integrasi API yang tepat.
- **Estetika UI/UX**: Desain modern, interaksi yang mulus, penanganan edge cases yang baik (tampilan kosong, kesalahan).
- **Containerization**: Penyiapan Docker/Podman yang bersih dengan peluncuran satu perintah yang mudah. (Optimasi resource, karena kadang server tidak ada internet, jadi build dari local, upload ke server)

## 🔗 API Resource
[Dockerhub](https://hub.docker.com/r/bektigalan/test)
