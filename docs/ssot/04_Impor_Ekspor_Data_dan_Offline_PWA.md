# Modul 04: Impor-Ekspor Excel & Arsitektur Offline-First

## 1. Upload & Impor Stok Massal Excel (`.xlsx` / `.csv`)
Memasukkan ratusan produk satu per satu di layar HP akan membuat pemilik warung putus asa. Fitur impor Excel memungkinkan anak atau keluarga muda menyiapkan data dengan cepat di komputer/laptop.

### 1.1 Format Template Standar
Template Excel resmi menyediakan kolom:
1. `kode_barcode` (Opsional/Bisa otomatis di-generate sistem)
2. `nama_barang` (Wajib)
3. `kategori` (Makanan, Minuman, Sembako, Rokok, Sabun, dll)
4. `satuan_dasar` (Pcs, Bungkus, Btl, Kg)
5. `harga_beli_modal` (Wajib angka)
6. `harga_jual_eceran` (Wajib angka)
7. `harga_grosir_1` & `min_qty_1` (Opsional)
8. `stok_awal` (Angka)
9. `stok_minimum_peringatan` (Angka)

### 1.2 Alur Validasi Pra-Impor (*Pre-Import Validation*):
- File dibaca 100% di browser menggunakan pustaka lokal (*SheetJS/xlsx*).
- Sebelum disimpan ke database, sistem menampilkan **Layar Pratinjau & Validasi**:
  - Baris Hijau: Data valid siap diimpor.
  - Baris Kuning: Peringatan (misal nama mirip, barcode kosong sehingga dibuatkan barcode warung otomatis).
  - Baris Merah: Ditolak (misal harga jual lebih kecil dari modal, kolom wajib kosong).
- Opsi Mode Impor:
  - **Tambah Barang Baru** (lewati jika ada nama/barcode kembar).
  - **Perbarui Stok & Harga** (menimpa harga dan menambah stok barang yang sudah ada).

---

## 2. Unduh Laporan Excel Lengkap (100% Gratis di Browser)
Semua laporan dapat diunduh dalam format `.xlsx` rapi dengan pemformatan mata uang dan rumus angka tanpa membebani server backend.

### 7 Modul Laporan yang Dapat Diunduh:
1. **Laporan Laba Rugi Warung:**
   - Omzet Penjualan
   - Total HPP Barang Terjual (*Moving Average*)
   - Laba Kotor
   - Total Beban Barang Rusak/Expired
   - Total Biaya Operasional (Kas Keluar Laci)
   - Laba Bersih Warung
2. **Daftar Rincian Transaksi:** Nomor nota, tanggal/waktu, nama kasir, mode (Keluarga/Pegawai), metode bayar (Tunai, QRIS, Kasbon, Split), dan rincian item.
3. **Stok & Valuasi Inventaris:** Sisa stok fisik, HPP rata-rata, total nilai aset stok warung, dan status restock.
4. **Buku Kasbon Pelanggan:** Daftar nama pembeli yang berhutang, sisa saldo hutang, jatuh tempo, dan riwayat pembayaran.
5. **Hutang Supplier & Kulakan:** Pembelian barang ke agen/distributor, jatuh tempo hutang tempo, dan status lunas.
6. **Laporan PPOB & Konsinyasi:** Rekap transaksi digital dan rekap hitungan bagi hasil titipan gorengan/jajanan.
7. **Log Barang Rusak & Barang Kosong Dicari Pembeli.**

---

## 3. Arsitektur Offline-First (*Progressive Web App*)
Koneksi internet di warung kelontong (terutama di area pinggiran atau ruko) sering tidak stabil.

### 3.1 Mekanisme Penyimpanan Lokal
- Menggunakan **IndexedDB** browser sebagai basis data operasional lokal.
- Semua transaksi kasir, perubahan stok lokal, dan arus kas disimpan secara instan ke IndexedDB dengan latensi `< 50ms`.
- Status aplikasi menampilkan indikator visual sederhana: **Hijau (Online & Tersinkron)** atau **Kuning (Offline - Transaksi Tetap Berjalan Aman)**.

### 3.2 Siklus Sinkronisasi & Resolusi Konflik:
- Setiap mutasi data memiliki `client_transaction_id` (UUID v4) dan timestamp UTC.
- Ketika koneksi pulih, sistem secara otomatis mengirim antrean transaksi lokal ke server di latar belakang tanpa mengganggu kasir yang sedang melayani pembeli.
- Menggunakan arsitektur *event/ledger-based* untuk mutasi stok dan kas sehingga tidak terjadi *race condition* atau data tertimpa.

---

## 4. [Usulan Tambahan] Pencadangan Data Anti-HP Rusak (*Disaster Recovery*)
Perangkat HP/tablet kasir di warung rentan terjatuh ke lantai semen, terkena tumpahan minyak/air, atau rusak mendadak. Karena aplikasi menggunakan sistem *offline-first*, kehilangan perangkat tanpa pencadangan bisa melenyapkan data buku kasbon dan riwayat stok warung bertahun-tahun.

### 4.1 Mekanisme Pencadangan Ganda
1. **Pencadangan Otomatis di Latar Belakang (*Background Auto-Sync*):**
   - Setiap kali perangkat terhubung ke internet (WiFi atau kuota data seluler), mutasi transaksi kasir dan saldo kasbon otomatis tersinkronisasi ke basis data awan gratis/ringan.
2. **Tombol "1-Klik Cadangkan ke WhatsApp / Google Drive":**
   - Fitur manual yang sangat disukai pedagang: tombol di layar admin yang mengompresi seluruh basis data warung menjadi file arsip aman (`.bak` / `.json.enc`) atau ringkasan Excel, lalu otomatis membuka chat WhatsApp pribadi pemilik atau menyimpan ke Google Drive.

### 4.2 Pemulihan Data Instan (*Quick Recovery*)
- Jika HP kasir rusak total atau hilang:
  1. Pemilik warung cukup membuka browser di HP cadangan atau HP baru.
  2. Masuk menggunakan akun terdaftar atau memilih file arsip cadangan dari WhatsApp/Google Drive.
  3. Seluruh daftar barang, sisa stok, buku kasbon tetangga, dan riwayat laci kas langsung pulih 100% dalam waktu kurang dari 10 detik.
