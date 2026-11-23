# Modul 01: Arsitektur Sistem & Prinsip Desain

## 1. Visi Produk & Sasaran Pengguna
Aplikasi Kasir Web Responsif / PWA (*Progressive Web App*) yang dirancang khusus untuk ekosistem **Warung Kelontong Keluarga Indonesia**. Menjawab kesenjangan aplikasi POS modern yang terlalu kaku dan rumit bagi pedagang lanjut usia (50–70 tahun) serta tidak mengakomodasi pola pengelolaan warung berbasis keluarga.

### Sasaran Pengguna
1. **Pemilik Warung (Lanjut Usia / 50–70 Tahun):**
   - Karakteristik: Penglihatan mulai menurun, sensitif terhadap antarmuka rumit/bertingkat, khawatir salah menekan tombol, mengutamakan kecepatan saat melayani antrean.
   - Kebutuhan: Teks dan tombol raksasa, alur satu layar, input uang nyata, konfirmasi suara kembalian.
2. **Keluarga Pengelola (Pasangan / Anak):**
   - Karakteristik: Melek teknologi, bergantian menjaga warung secara spontan (misal anak menjaga sore sepulang kerja/kuliah).
   - Kebutuhan: Akses cepat tanpa birokrasi pergantian shift, kemampuan mengelola stok massal via Excel, dan memantau laba warung.
3. **Pegawai Kasir (Karyawan Luar):**
   - Karakteristik: Penjaga warung sewaan/karyawan yang digaji.
   - Kebutuhan: Alur kerja kasir terukur dengan batasan wewenang ketat dan pertanggungjawaban uang laci shift sendiri.

---

## 2. Arsitektur Dual-Mode Laci Kasir (*Dual-Mode Cash Register*)
Sistem menerapkan pemisahan logis antara kas internal keluarga dan kas akuntabilitas pegawai.

### 2.1 Mode Keluarga (*Family Shared Drawer*)
- **Prinsip Utama:** Fleksibilitas tanpa gesekan birokrasi. Satu laci kas fisik digunakan bersama selama 24 jam siklus operasional warung.
- **Autentikasi Cepat:** Menggunakan **Barcode Statis** (dicetak pada kartu ID ber-lanyard atau stiker barcode di samping meja kasir). Anggota keluarga cukup mengarahkan kartu ke scanner atau kamera.
- **Tanpa Serah-Terima Kaku:** Tidak ada kewajiban menghitung uang fisik atau tutup kasir saat suami digantikan istri atau anak.
- **Tutup Laci Fleksibel:** Siapapun anggota keluarga yang berjaga pada jam tutup warung (malam/pagi) berhak melakukan **Tutup Laci Harian**.
- **Audit di Latar Belakang:** Sistem tetap mencatat `user_id` pada setiap struk/transaksi penjualan untuk kebutuhan pelacakan riwayat tanpa mengunci laci.

### 2.2 Mode Pegawai (*Strict Shift Drawer*)
- **Prinsip Utama:** Akuntabilitas finansial individu.
- **Aturan Kas:** 1 Pegawai = 1 Sesi Laci Kas Mandiri.
- **Alur Kerja Shift:**
  1. Login menggunakan ID dan PIN pegawai.
  2. Wajib input **Modal Awal Laci** sebelum transaksi kasir pertama dapat diproses.
  3. Berjaga selama jam kerja dengan hak akses terbatas (dilarang *void* transaksi sembarangan, dilarang mengubah harga modal/jual master, dilarang melihat laporan laba bersih warung).
  4. Melakukan **Tutup Shift**: Menghitung uang fisik di laci (*blind cash count* / input nominal fisik).
  5. Sistem menghitung selisih (Kurang/Lebih/Pas) yang melekat pada rekap sesi pegawai tersebut.

---

## 3. Pemisahan Dua Ruang Kerja (*Dual Workspace Separation*)
Untuk mencegah *cognitive overload* (kebingungan mental) pada kasir lansia, sistem membagi antarmuka menjadi dua zona terisolasi:

| Zona | Pengguna Utama | Fokus Fungsional | Karakter Visual |
| :--- | :--- | :--- | :--- |
| **Layar Kasir Warung** | Orang tua / Kasir harian | Scan barang, input jumlah/nominal, hitung kembalian, catat kasbon, arus kas laci kecil. | Zero-modal, tombol ekstra besar (>=60px), font tebal, minim navigasi, kontras tinggi. |
| **Pusat Kelola & Pembukuan** | Anak / Pengelola muda | Impor/ekspor stok Excel, penetapan HPP & harga grosir, cek laporan laba rugi, audit hutang supplier. | Antarmuka berbasis tabel desktop/tablet, filter tanggal fleksibel, grafik analitik. |

---

## 4. Prinsip Biaya 100% Gratis & Kedaulatan Data
- **Tanpa Ketergantungan API Berbayar:** Tidak ada biaya bulanan untuk AI vision, OCR, atau database berbayar per panggilan API.
- **Pemrosesan di Sisi Klien (*Client-Side Execution*):** Seluruh fitur pintar (pengenalan foto, OCR nota, voice-to-text, kalkulasi HPP, dan pembacaan/pembuatan file Excel) berjalan langsung di mesin browser perangkat pengguna.
- **Offline-First:** Warung tetap dapat bertransaksi penuh saat jaringan internet terputus, tersimpan pada penyimpanan lokal browser (*IndexedDB*), dan sinkron otomatis saat online kembali.
