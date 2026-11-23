# Master Rencana Pengembangan Aplikasi Web Kasir Warung Kelontong
*(Dokumen Induk Berdasarkan 5 Sumber Kebenaran Tunggal / SSOT Mutlak)*

Dokumen ini disusun mengikat dan sepenuhnya bersumber dari kelima modul spesifikasi:
- **Modul 01:** Arsitektur Sistem & Prinsip Desain
- **Modul 02:** Layar Kasir, Transaksi & Manajemen Kasbon (v4)
- **Modul 03:** Manajemen Stok, HPP & Keuangan Warung (v3)
- **Modul 04:** Impor-Ekspor Excel & Arsitektur Offline-First (v2)
- **Modul 05:** Roadmap Pengembangan, Tech Stack & SOP Diskusi

---

## 1. Prinsip Eksekusi Mutlak (Strict Ground Rules)
1. **Aturan Single Source of Truth (SSOT):** Seluruh arsitektur, alur data, rumus perhitungan, tata letak antarmuka, dan hak akses merujuk 100% pada 5 dokumen modul. Tidak ada fitur yang boleh ditambah, dikurangi, atau diubah tanpa persetujuan eksplisit pemilik proyek.
2. **Kedaulatan Biaya 100% Gratis:** Seluruh fitur cerdas (Scan Foto Barang MobileNet, OCR Nota Tesseract, Voice Web Speech, kalkulasi HPP, impor/ekspor Excel) berjalan lokal di browser (*client-side*), tanpa ketergantungan API kecerdasan buatan berbayar.
3. **Ergonomi Ramah Orang Tua (*Senior-First UI*):** Layar kasir utama harus bebas pop-up tersembunyi (*zero-modal*), target sentuh `>= 60x60px`, tipografi kontras tinggi (`18px` hingga `48px`), tombol pecahan uang nyata, dan panduan audio bahasa Indonesia.

---

## 2. Struktur Tahapan Pembangunan (5 Milestone Terstruktur)

```
[ MILESTONE 1: PONDASI BASIS DATA & PRE-LOADED KATALOG ]
  - Skema data offline-first (IndexedDB / Dexie.js)
  - Database bawaan 1.000+ SKU barang warung Indonesia (Modul 03)
  - Mesin sinkronisasi event-based & offline ledger (Modul 04)

[ MILESTONE 2: CORE LAYAR KASIR RAMAH LANSIA ]
  - Antarmuka kasir satu layar (Zero-modal)
  - 3 Jalur input barang (Scan Foto, Barcode, Grid Cepat) & Fallback (Modul 02)
  - Barang curah, desimal, dan input nominal uang rupiah (Modul 02)
  - Input pembayaran pecahan uang fisik + keypad nominal raksasa (Modul 02)
  - Layar kembalian raksasa + umpan balik suara Web Speech (Modul 02)

[ MILESTONE 3: FITUR OPERASIONAL KHAS WARUNG ]
  - Tahan belanjaan / kesampingkan antrean (Hold/Park Cart) (Modul 02)
  - Sistem kasbon & split payment (tunai + bon) (Modul 02)
  - Fitur Pinjam Cash (talangan COD kurir / pinjaman sementara) (Modul 02)
  - Buku titipan nomor pelanggan PLN & pulsa (Modul 02)
  - Transaksi Kilat antrean panik & Kembalian Permen (Modul 02)

[ MILESTONE 4: DUAL-MODE LACI & LOGIKA KEUANGAN WARUNG ]
  - Mode Keluarga: scan barcode statis, laci 24 jam bersama, tutup laci bebas (Modul 01)
  - Mode Pegawai: modal awal laci, shift mandiri, tutup shift hitung fisik (Modul 01)
  - Formula HPP Moving Average otomatis & multi-satuan bertingkat (Modul 03)
  - Arus kas laci keluar/masuk operasional (Modul 03)
  - Cetak label kemas ulang sembako (Nama + Berat Tebal + Harga + Barcode) (Modul 03)
  - Daftar kulakan on-demand & hutang sales siap bayar (Modul 03)

[ MILESTONE 5: PUSAT KELOLA, EXCEL, PWA & KETAHANAN DATA ]
  - Impor stok massal Excel (.xlsx) dengan validasi baris & pratinjau (Modul 04)
  - Ekspor 7 modul laporan keuangan & operasional Excel di browser (Modul 04)
  - Modul PPOB & Konsinyasi titipan gorengan (Modul 03)
  - PWA Offline Service Worker (installable) (Modul 04)
  - Pencadangan data anti-HP rusak ke WhatsApp / Cloud (Modul 04)
```

---

## 3. Rincian Rencana Kerja per Milestone

### Milestone 1: Arsitektur Data, Skema Tabel & Pre-loaded Catalog
*Rujukan: Modul 01, Modul 03, Modul 04*
- **Entitas Basis Data Lokal (IndexedDB):**
  1. `stores`: Konfigurasi warung, nama, alamat, nomor WhatsApp pemilik.
  2. `users`: Anggota keluarga (dengan kode barcode statis) dan Pegawai (dengan PIN login).
  3. `master_products`: Database bawaan 1.000+ SKU barang warung terpopuler di Indonesia (Indomie, Royco, Aqua, Le Minerale, Djarum, Lifebuoy, dll) lengkap dengan barcode pabrik dan nama baku.
  4. `inventory`: Sisa stok fisik, satuan bertingkat (Dus/Renteng/Pcs), harga grosir bertingkat, HPP *Moving Average*, dan batas minimum stok.
  5. `cash_drawers`: Sesi laci kas keluarga (24 jam) dan sesi laci kas pegawai (shift mandiri).
  6. `transactions` & `transaction_items`: Riwayat transaksi, status (Lunas/Split Kasbon/Park Cart), mode kasir, dan penanda waktu.
  7. `customers_kasbon`: Daftar pelanggan hutang, batas limit, catatan rumah, dan riwayat cicilan.
  8. `cash_loans`: Buku "Pinjam Cash" (talangan COD / pinjaman sementara).
  9. `customer_saved_numbers`: Buku titipan nomor meteran PLN dan nomor HP langganan.
  10. `sales_invoices`: Faktur supplier/distributor belum lunas ("Siap Bayar").

---

### Milestone 2: Antarmuka Kasir Ramah Lansia & Transaksi Dasar
*Rujukan: Modul 02*
- **Layout Satu Layar:** Panel kiri keranjang belanja + ringkasan total; panel kanan pencarian barang + kamera scanner + keypad bayar.
- **Implementasi 3 Jalur Input:**
  - Integrasi Barcode Scanner Hardware (USB/Bluetooth *keyboard wedge*) dan kamera pemindai.
  - Modul Scan Foto Barang (*Client-Side Visual Recognition*) dengan tampilan 3 kartu foto rekomendasi teratas untuk barang curah.
  - Grid Cepat barang terlaris dan kolom pencarian teks responsif + tombol pencarian suara (*Web Speech*).
- **Penanganan Nilai Satuan & Desimal:** Input berat desimal (`0.25`, `0.5` kg) dan konversi otomatis dari nominal uang belanja (beli beras Rp 15.000).
- **Panel Pembayaran:** Tombol pecahan uang fisik (`Rp 2.000` s/d `Rp 100.000`), tombol **[UANG PAS]**, dan keypad nominal raksasa.
- **Konfirmasi Kembalian:** Angka kembalian ekstra besar kontras tinggi + suara pembaca otomatis bahasa Indonesia.

---

### Milestone 3: Fitur Penyelamat Operasional Warung
*Rujukan: Modul 02*
- **Tahan Belanjaan (*Hold / Park Cart*):** Tombol *“Kesampingkan Belanjaan”* yang menyimpan keranjang aktif ke tab antrean sementara dan tombol *“Buka Belanjaan Tadi”* untuk memulihkan tanpa scan ulang.
- **Kasbon & Pembayaran Campuran (*Split Payment*):** Logika pembayaran saat uang tunai pembeli kurang; sisa tagihan langsung dicatat sebagai piutang pada pelanggan bersangkutan dan kas laci hanya bertambah sebesar uang tunai yang diterima.
- **Modul "Pinjam Cash":** Form 3 kolom cepat (Nama, Nominal, Keterangan) dan tombol satu ketuk pelunasan kembali ke laci saat uang ditebus.
- **Buku Titipan Nomor PLN & Pulsa:** Daftar nama tetangga langganan dengan nomor meteran/HP yang langsung terisi otomatis sekali sentuh.
- **[Usulan Tambahan] Transaksi Kilat (Quick Cash):** Tombol darurat ketik nominal tunai saat antrean membludak.
- **[Usulan Tambahan] Kembalian Permen:** Tombol pemotong stok permen otomatis saat koin receh Rp 500/1.000 kosong.

---

### Milestone 4: Dual-Mode Laci Kasir, Multi-Satuan & Logika Keuangan
*Rujukan: Modul 01, Modul 03*
- **Logika Dual-Mode Laci:**
  - *Mode Keluarga:* Akses scan kartu barcode statis; laci kas fisik dipakai bersama; bebas pergantian tanpa serah-terima; salah satu anggota keluarga berhak melakukan tutup laci harian.
  - *Mode Pegawai:* Login PIN pegawai; wajib input modal awal laci; hak akses terbatas (tanpa akses laba warung atau void master); tutup shift wajib input hitung uang fisik dan rekonsiliasi selisih.
- **Manajemen Multi-Satuan & Grosir:** Konversi otomatis Dus $\rightarrow$ Renteng $\rightarrow$ Pcs saat penjualan, serta diskon grosir bertingkat otomatis.
- **Kalkulasi HPP Moving Average:** Pembaruan otomatis biaya modal setiap ada stok masuk dengan penanganan aman stok nol/negatif.
- **Cetak Label Kemas Ulang:** Template cetak termal memuat Nama Barang + Berat Tebal (1 KG vs 1/2 KG) + Harga + Barcode mini.
- **Daftar Kulakan On-Demand:** Tombol generate daftar belanja pasar/agen dari stok menipis dan barang kosong dicari pembeli, siap dicetak ke struk 58mm atau dibuka di HP.
- **Hutang Sales Siap Bayar:** Rekap faktur per distributor (Wings, Unilever, rokok) dan tombol pelunasan instan potong uang kas laci.

---

### Milestone 5: Pusat Kelola, Impor/Ekspor Excel, PWA & Ketahanan Data
*Rujukan: Modul 04, Modul 05*
- **Impor Stok Massal Excel (.xlsx / .csv):** Template resmi, pembacaan client-side via SheetJS, layar validasi baris data (hijau valid, kuning peringatan, merah tolak).
- **Unduh 7 Laporan Excel Gratis di Browser:** Laba Rugi, Rincian Transaksi, Valuasi Stok, Buku Kasbon, Hutang Supplier, PPOB & Konsinyasi, serta Log Barang Rusak.
- **Ekosistem Warung (PPOB & Konsinyasi):** Pencatatan pulsa/token (margin terpisah dari modal) dan rekap titipan barang/gorengan.
- **Offline-First PWA:** Pemasangan PWA di desktop/tablet/HP, caching aset, IndexedDB transaction queue, sinkronisasi otomatis saat online.
- **[Usulan Tambahan] Pencadangan Data Anti-HP Rusak:** Sinkronisasi awan otomatis di latar belakang + tombol manual 1-klik ekspor cadangan ke WhatsApp/Google Drive dengan mekanisme pemulihan instan di HP baru (<10 detik).

---

## 4. Matriks Validasi Keberhasilan (Acceptance Criteria)
Setiap milestone dinyatakan selesai hanya jika memenuhi kriteria berikut:
1. **Tes Lansia:** Pengguna usia 50+ tahun dapat menyelesaikan 1 transaksi biasa (termasuk kembalian) dalam <30 detik tanpa kebingungan.
2. **Tes Dual-Mode:** Anggota keluarga dapat berganti kasir hanya dengan menempelkan kartu barcode tanpa mengunci atau menghitung ulang laci; pegawai luar tidak dapat mengakses ringkasan laba bersih warung.
3. **Tes Kasbon & Pinjam Cash:** Uang fisik di laci saat tutup toko cocok 100% dengan pencatatan sistem, meskipun terjadi transaksi split kasbon, kembalian permen, dan talangan COD.
4. **Tes Offline:** Seluruh alur kasir, cetak struk, dan pencatatan laci berjalan normal saat koneksi internet dimatikan total.
5. **Kepatuhan SSOT:** Tidak ada deviasi logika dari kelima dokumen modul resmi.
