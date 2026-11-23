# DOKUMEN RENCANA PENGEMBANGAN BERTAHAP
## APLIKASI WEB KASIR & MANAJEMEN WARUNG KELONTONG (LOCAL-FIRST PWA)
### Panduan Implementasi Berbasis Prioritas (P0, P1, P2) & Ketergantungan Aturan

---

### METADATA & DEKLARASI SUMBER KEBENARAN MUTLAK (SSOT)
- **Nama Dokumen:** Dokumen Susunan Pengembangan Bertahap (Phased Implementation Roadmap)
- **Versi Dokumen:** 1.0.0
- **Status:** Approved Baseline / Siap Eksekusi
- **Arsitektur Utama:** Bertahap (Frontend Local-First PWA Terlebih Dahulu -> Backend Sync Engine)
- **Dokumen Acuan Tunggal & Mengikat (SSOT):**
  1. *Modul 01: Arsitektur Sistem & Prinsip Desain*
  2. *Modul 02: Layar Kasir, Transaksi & Manajemen Kasbon (v4)*
  3. *Modul 03: Manajemen Stok, HPP & Keuangan Warung (v3)*
  4. *Modul 04: Impor-Ekspor Excel & Arsitektur Offline-First (v2)*
  5. *Modul 05: Roadmap Pengembangan, Tech Stack & SOP Diskusi*
  6. *00 Master Rencana Pengembangan Aplikasi (Cetak Biru 5 Milestone)*

---

## 1. PRINSIP DASAR PENYUSUNAN
Dokumen ini disusun berlandaskan tiga pilar ketat:
1. **Tidak Ada Aturan Bisnis yang Dirancang Ulang:**
   Setiap butir pekerjaan merujuk langsung pada fitur dan aturan yang sudah tertulis di dalam kelima modul SSOT. Kolom "Aturan Kunci" pada matriks memuat ringkasan ketentuan mengikat dari dokumen acuan tanpa improvisasi.
2. **Definisi Skala Prioritas:**
   - **P0 (Fondasi, Keamanan & Pemblokir / Core Blocker):** Komponen prasyarat mutlak arsitektural. Jika P0 belum terwujud, fitur operasional lain tidak dapat berjalan atau data terancam korup/hilang.
   - **P1 (Inti Operasional Kasir & Warung / Primary Operations):** Fitur utama yang langsung dipakai oleh kasir lansia dan warung untuk transaksi jual-beli, input barang, uang kembalian, laci kas, dan kasbon harian.
   - **P2 (Pendukung, Ekosistem & Analitik / Secondary & Extras):** Fitur pelengkap pembukuan, integrasi eksternal, manajemen barang titipan/PPOB, laporan analitik, serta usulan tambahan penyempurna.
3. **Alur Ketergantungan Bertahap (Frontend-First -> Backend Sync):**
   - **Fase A (Frontend Local-First):** Membangun aplikasi kasir utuh yang 100% berfungsi mandiri di browser kasir menggunakan IndexedDB lokal tanpa ketergantungan server/internet. Menguji langsung kegunaan antarmuka pada pengguna lansia.
   - **Fase B (Backend & Cloud Sync Engine):** Membangun lapisan sinkronisasi awan (cloud sync) dan pencadangan terpusat di atas skema data lokal yang telah teruji stabil di lapangan.

---

## 2. MATRIKS PENGEMBANGAN BERTAHAP (ROADMAP MATRIX)

| ID Tugas | Langkah / Modul | Nama Fitur / Komponen | Prioritas | Rujukan SSOT | Ketergantungan (Prasyarat) | Aturan Kunci (Kutipan SSOT Mutlak) |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **A1-01** | Fondasi Lokal | Inisialisasi Project & PWA App Shell | **P0** | Modul 01 (§4), Modul 05 (§1) | - | React + Vite + TS + Tailwind + PWA Manifest & Service Worker; 100% bebas biaya API per panggilan. |
| **A1-02** | Fondasi Lokal | Skema IndexedDB (Dexie.js) 13 Tabel | **P0** | Modul 04 (§3), SRS (§6) | A1-01 | Latensi transaksi lokal < 50ms; arsitektur ledger/event-based; ACID transaksi lokal di browser. |
| **A1-03** | Fondasi Lokal | [Usulan] Katalog Master 1.000+ SKU | **P0** | Modul 03 (§7) | A1-02 | Database bawaan produk umum warung Indonesia; scan barcode -> isi nama/foto -> ketik harga jual (<5s). |
| **A2-01** | Layar Kasir | Tata Letak Satu Layar (*Zero-Modal Policy*) | **P1** | Modul 01 (§3), Modul 02 (§1) | A1-01 | Keranjang, scanner, dan bayar berdampingan satu layar tanpa dialog pop-up bertingkat yang menutupi alur. |
| **A2-02** | Layar Kasir | Standar Target Sentuh & Tipografi Lansia | **P1** | Modul 02 (§1) | A2-01 | Target sentuh min 60x60px; teks barang min 18px, total belanja min 28px, kembalian 36-48px; WCAG AAA. |
| **A2-03** | Input Barang | Jalur 2: Scan Barcode Hardware & Kamera | **P1** | Modul 02 (§2.2), Modul 05 (§1) | A1-02, A2-01 | Scanner USB/BT keyboard wedge langsung tangkap enter tanpa klik kolom; kamera barcode via ZXing; beep audio. |
| **A2-04** | Input Barang | Jalur 3: Quick Grid (15-25 Item) & Text/Voice | **P1** | Modul 02 (§2.3) | A1-02, A2-01 | Tombol bergambar besar barang terlaris; filter teks instan; pencarian suara Web Speech API. |
| **A2-05** | Input Barang | Jalur 1: Scan Foto Barang Curah (MobileNet) | **P1** | Modul 02 (§2.1), Modul 05 (§1) | A1-02, A2-01 | Mengenali barang tanpa kemasan/barcode (telur, beras, sayur); muncul 3 kartu foto terbesar; konfirmasi 1 ketuk. |
| **A2-06** | Input Barang | Mekanisme Fallback Mulus 3 Jalur | **P1** | Modul 02 (§2.4) | A2-03, A2-04, A2-05 | Tombol barcode dan cari manual selalu tampak di samping kamera; jika satu jalur ragu, kasir pindah seketika. |
| **A2-07** | Input Barang | Penanganan Barang Curah & Konversi Rupiah | **P1** | Modul 02 (§3) | A2-01 | Mode kuantitas desimal (0.25 kg); mode nominal uang (misal beli Rp 15rb langsung terkonversi otomatis ke kg). |
| **A3-01** | Pembayaran | Tombol Pecahan Uang Fisik Rupiah & Uang Pas | **P1** | Modul 02 (§4) | A2-01 | Tombol pecahan Rp 2rb s.d. 100rb; tombol instan [UANG PAS] langsung isi nominal sama dengan total belanja. |
| **A3-02** | Pembayaran | Keypad Manual Raksasa & Shortcut Kombinasi | **P1** | Modul 02 (§4) | A3-01 | Tombol angka besar (0-9) dan penambah cepat (+1.000, +10.000, +50.000) untuk uang kombinasi pembeli. |
| **A3-03** | Pembayaran | Layar Kembalian Raksasa & Suara (TTS) | **P1** | Modul 02 (§1, §4) | A3-01, A3-02 | Nilai kembalian 36-48px hijau cerah; pembacaan suara otomatis Web Speech Synthesis Bahasa Indonesia. |
| **A4-01** | Laci Kas | Mode Keluarga (Family Shared Drawer) | **P0** | Modul 01 (§2.1) | A1-02, A3-01 | 1 laci bersama 24 jam; login barcode statis; tanpa serah-terima/hitung kas; siapapun boleh tutup laci harian. |
| **A4-02** | Laci Kas | Mode Pegawai (Strict Shift Drawer) | **P0** | Modul 01 (§2.2) | A1-02, A3-01 | 1 pegawai = 1 laci sesi; login PIN; wajib modal awal; tutup shift dengan blind cash count & catat selisih. |
| **A5-01** | Kasbon | Pembayaran Campuran (Split: Tunai + Bon) | **P1** | Modul 02 (§5.1) | A3-01, A4-01 | Bayar sebagian tunai + sisa kasbon; kas laci masuk sesuai tunai, buku piutang bertambah sesuai sisa tagihan. |
| **A5-02** | Kasbon | Profil Pelanggan Kasbon, Limit & Cicilan | **P1** | Modul 02 (§5.2) | A5-01 | Nama, No WA, alamat, limit kredit; peringatan limit; cicilan/pelunasan otomatis masuk kas laci aktif. |
| **A5-03** | Kasbon | Kirim Rincian Kasbon via WhatsApp | **P2** | Modul 02 (§5.2) | A5-02 | Satu ketukan membuka draf rekap rincian belanja dan saldo hutang sopan ke nomor WhatsApp pelanggan. |
| **A6-01** | Situasional | Fitur "Pinjam Cash" (Talangan Sementara) | **P1** | Modul 02 (§6) | A4-01 | Form 3 kolom: Nama, Nominal, Keterangan (talangan COD, dll); potong fisik laci sementara; tombol lunas kembalian. |
| **A6-02** | Situasional | Buku Titipan Nomor Pelanggan (PLN/Pulsa) | **P1** | Modul 02 (§7) | A2-01 | Kontak cepat tetangga; simpan ID PLN/meter & No HP; 1 ketuk isi formulir transaksi tanpa ketik ulang 11-12 digit. |
| **A6-03** | Situasional | Tahan Belanjaan (Hold / Park Cart) | **P1** | Modul 02 (§8) | A2-01 | Tombol [Kesampingkan Belanjaan]; simpan antrean gantung; layar bersih layani orang lain; 1 ketuk pulihkan. |
| **A6-04** | Situasional | [Usulan] Transaksi Kilat / Quick Cash | **P2** | Modul 02 (§9) | A3-01, A4-01 | Mode antrean panik: ketik uang diterima -> terima tunai masuk laci (<3s); stok disesuaikan belakangan. |
| **A6-05** | Situasional | [Usulan] Kembalian Permen & Pembulatan Koin | **P2** | Modul 02 (§10) | A3-03, A4-01 | Tombol [Kembalian Pakai Permen] potong stok permen; tombol [Bulatkan Kembalian] untuk uang ikhlas/kotak amal. |
| **A7-01** | Stok & HPP | Multi-Satuan Bertingkat & Tiered Pricing | **P1** | Modul 03 (§1.1) | A1-02, A2-01 | Satuan dasar terkecil (Pcs) dikonversi ke Renceng/Dus; harga grosir bertingkat terhitung otomatis di keranjang. |
| **A7-02** | Stok & HPP | Cetak Label Kemas Ulang Sembako (58/80mm) | **P1** | Modul 03 (§1.2) | A1-02 | Wajib 4 unsur: Nama Barang, Berat Nyata (tebal, misal 1 KG), Harga Jual, Barcode Mini; cetak printer struk. |
| **A7-03** | Stok & HPP | Kalkulasi HPP Moving Average Otomatis | **P1** | Modul 03 (§2) | A1-02 | Formula moving average saat kulakan; proteksi stok <=0 langsung pakai harga beli baru; zero-division guard. |
| **A7-04** | Keuangan | Arus Kas Laci (Cash In / Cash Out) | **P1** | Modul 03 (§3) | A4-01 | Catat kas keluar operasional (galon, gas, iuran, prive) & kas masuk modal; laci fisik seimbang tanpa rusak omzet. |
| **A7-05** | Stok & HPP | Barang Rusak, Retur & Lost Sales Tracker | **P2** | Modul 03 (§4) | A1-02 | Catat barang expired/rusak jadi beban; tombol 1 ketuk "Barang Dicari Tapi Kosong" catat potensi jualan. |
| **A7-06** | Kulakan | Daftar Belanja Kulakan On-Demand (58mm/Web) | **P1** | Modul 03 (§4) | A1-02, A7-05 | Tombol [Buat Daftar Kulakan Sekarang]; tarik barang stok menipis + barang kosong dicari; format saku 58mm/web HP. |
| **A7-07** | Keuangan | Hutang Sales Tempo ("Siap Bayar Fleksibel") | **P1** | Modul 03 (§5) | A4-01 | Catat faktur per distributor; tombol [Bayar Tagihan Sales dari Laci] potong laci resmi saat sales tiba-tiba menagih. |
| **A7-08** | Ekosistem | Modul PPOB & Konsinyasi (Titipan Barang) | **P2** | Modul 03 (§6) | A1-02, A4-01 | PPOB: pisahkan margin laba dari uang pokok; Konsinyasi: Terjual = Titip - Sisa, hitung komisi warung & setoran. |
| **A8-01** | Data & Admin | Ruang Kerja Pusat Kelola & Pembukuan | **P1** | Modul 01 (§3) | A1-02 | Antarmuka tabel desktop/tablet terpisah khusus admin/anak muda; dilindungi PIN pemilik warung. |
| **A8-02** | Data & Admin | Impor Massal Excel (Template 9 Kolom) | **P1** | Modul 04 (§1) | A1-02, A8-01 | SheetJS lokal browser; validasi 3 warna (hijau, kuning, merah); opsi tambah baru / perbarui stok harga. |
| **A8-03** | Data & Admin | Unduh 7 Modul Laporan Excel di Browser | **P1** | Modul 04 (§2) | A8-01 | Ekspor .xlsx rapi berformula lokal: Laba Rugi, Transaksi, Valuasi Stok, Kasbon, Hutang Sales, PPOB, Rusak. |
| **A8-04** | Data & Admin | [Usulan] Pencadangan Ganda & Pemulihan <10s | **P2** | Modul 04 (§4) | A1-02, A8-01 | Tombol 1 klik kompres database ke file arsip aman kirim ke WA/Drive; pemulihan instan di HP baru < 10 detik. |
| **B1-01** | Backend Cloud | Sinkronisasi Latar Belakang (Supabase/PG) | **P1** | Modul 04 (§3), Modul 05 (§1) | Fase A (Semua) | Mutasi lokal ber-UUID & timestamp; kirim ke cloud saat online tanpa ganggu kasir; event/ledger anti-konflik. |
| **B1-02** | Backend Cloud | Manajemen Akun Terpusat & Backup Otomatis | **P2** | Modul 04 (§4), Modul 05 (§1) | B1-01 | Auto-sync multi-device untuk warung dengan lebih dari satu gawai; penyimpanan cadangan awan berkala. |

---

## 3. RINCIAN ALUR PENGEMBANGAN BERTAHAP (STEP-BY-STEP PHASING)

```
========================================================================================
TAHAP 1: FRONTEND LOCAL-FIRST PWA (100% Berfungsi Tanpa Butuh Server)
========================================================================================
[ Langkah 1: Fondasi P0 & Katalog Bawaan ]
  - PWA Shell, IndexedDB 13 tabel (Dexie.js), pre-load 1.000+ SKU warung kelontong.
      │
[ Langkah 2: Inti Layar Kasir Ramah Lansia (P1) ]
  - Zero-modal layout, tombol >=60px, 3 jalur input (Barcode, Foto 3 Kartu, Quick Grid), curah Rp.
      │
[ Langkah 3: Panel Bayar, Uang Pecahan & Suara Kembalian (P1) ]
  - Tombol pecahan Rp 2rb-100rb, tombol [Uang Pas], keypad raksasa, Web Speech TTS kembalian.
      │
[ Langkah 4: Dual-Mode Laci Kasir (P0/P1) ]
  - Mode Keluarga (barcode statis, tanpa serah-terima) vs Mode Pegawai (PIN, modal awal, blind count).
      │
[ Langkah 5: Kasbon & Situasional Warung (P1/P2) ]
  - Split tunai+kasbon, Pinjam Cash 3 kolom, buku nomor PLN, Hold Cart, transaksi kilat, permen.
      │
[ Langkah 6: Stok Multi-Satuan, HPP Moving Average & Keuangan (P1) ]
  - Konversi Dus/Sachet, HPP otomatis, label 4 unsur 58mm, kulakan on-demand, bayar sales dari laci.
      │
[ Langkah 7: Pusat Kelola, Impor/Ekspor Excel & Cadangan (P1/P2) ]
  - Workspace admin terpisah, impor Excel validasi 3 warna, unduh 7 laporan .xlsx, cadangan WA.

========================================================================================
TAHAP 2: BACKEND & CLOUD SYNC ENGINE (Pelengkap Sinkronisasi Multi-Device & Cloud Backup)
========================================================================================
[ Langkah 8: Sinkronisasi Latar Belakang & Awan (P1/P2) ]
  - Supabase/PostgreSQL, antrean mutasi UUID, disaster recovery awan otomatis.
========================================================================================
```

### 3.1 Rincian Eksekusi Fase A (Frontend Local-First PWA)

#### Langkah 1: Fondasi Penyimpanan Lokal & Shell PWA (Prioritas: P0)
- **Tujuan:** Menyiapkan struktur aplikasi web responsif berkecepatan tinggi yang dapat diakses luring (*offline*) dan menyimpan data secara andal.
- **Tugas Utama:**
  1. Inisialisasi Vite + React + TypeScript + Tailwind CSS + PWA Manifest & Service Worker (`A1-01`).
  2. Implementasi skema IndexedDB menggunakan Dexie.js mencakup 13 tabel data lengkap sesuai spesifikasi SRS (`A1-02`).
  3. Mengintegrasikan basis data bawaan *Katalog Master Warung* 1.000+ SKU produk umum Indonesia (`A1-03`).
- **Keluaran:** Aplikasi dapat dibuka di browser HP/komputer secara offline dan database lokal siap menerima transaksi.

#### Langkah 2: Layar Kasir Ramah Lansia & 3 Jalur Input Barang (Prioritas: P1)
- **Tujuan:** Membangun antarmuka kasir yang nyaman dan tidak membingungkan bagi orang tua usia 50–70 tahun.
- **Tugas Utama:**
  1. Menyusun layout satu kanvas tanpa modal popup (*Zero-Modal Policy*) (`A2-01`).
  2. Penerapan komponen UI dengan target sentuh >= 60x60 px dan teks kontras tinggi WCAG AAA (`A2-02`).
  3. Integrasi input barcode fisik USB/Bluetooth keyboard-wedge dan kamera web ZXing (`A2-03`).
  4. Penyediaan Quick-Picker Grid barang terlaris, kolom teks, dan tombol mic suara (`A2-04`).
  5. Pemasangan modul computer vision TensorFlow.js MobileNet untuk scan foto barang curah dengan 3 kartu rekomendasi konfirmasi 1-ketuk (`A2-05`).
  6. Memastikan tombol fallback barcode/manual selalu terlihat saat kamera aktif (`A2-06`).
  7. Mode barang curah berbasis kuantitas desimal dan nominal Rupiah (`A2-07`).
- **Keluaran:** Kasir lansia dapat memasukkan barang ke keranjang melalui barcode, foto objek, atau ketukan tombol manual dengan cepat.

#### Langkah 3: Panel Pembayaran, Uang Pecahan & Suara Kembalian (Prioritas: P1)
- **Tujuan:** Menghilangkan beban berhitung di kepala bagi kasir orang tua saat menerima pembayaran dan menghitung kembalian.
- **Tugas Utama:**
  1. Pembuatan tombol pecahan uang kertas Rupiah (Rp 2.000 s.d. Rp 100.000) dan tombol instan [UANG PAS] (`A3-01`).
  2. Keypad angka raksasa di layar dengan penambah cepat (+1.000, +10.000, +50.000) (`A3-02`).
  3. Layar angka kembalian raksasa (36–48px) warna hijau cerah serta pelafalan audio otomatis bahasa Indonesia melalui Web Speech Synthesis API (`A3-03`).
- **Keluaran:** Transaksi selesai dalam hitungan detik dengan konfirmasi suara nominal kembalian.

#### Langkah 4: Sistem Dual-Mode Laci Kasir (Prioritas: P0 & P1)
- **Tujuan:** Mengakomodasi fleksibilitas pergantian kasir keluarga tanpa mengorbankan akuntabilitas kasir pegawai luar.
- **Tugas Utama:**
  1. *Mode Keluarga:* Sesi laci tunggal 24 jam bersama; login cepat scan barcode statis ID; tanpa serah-terima uang fisik; tutup laci harian oleh anggota keluarga yang berjaga malam (`A4-01`).
  2. *Mode Pegawai:* 1 Pegawai = 1 Laci Sesi; login via PIN; input modal awal wajib; tutup shift dengan *blind cash count* menghitung fisik laci dan mencatat selisih (`A4-02`).
- **Keluaran:** Transaksi tercatat aman dengan atribusi kasir yang tepat sesuai aturan laci masing-masing.

#### Langkah 5: Kasbon, Pembayaran Campuran & Penanganan Situasional Warung (Prioritas: P1 & P2)
- **Tujuan:** Menyelesaikan seluruh dinamika sosial dan operasional unik warung kelontong Indonesia.
- **Tugas Utama:**
  1. Transaksi pembayaran campuran (Split: sebagian uang tunai masuk laci + sisa dicatat kasbon pelanggan) (`A5-01`).
  2. Buku kasbon pelanggan, batas kredit (credit limit), pencatatan cicilan/pelunasan laci, dan kirim rincian via WhatsApp (`A5-02`, `A5-03`).
  3. Fitur "Pinjam Cash" 3 kolom untuk talangan paket COD atau pinjaman sementara laci (`A6-01`).
  4. Buku Titipan Nomor Pelanggan (token PLN & pulsa) satu ketukan isi (`A6-02`).
  5. Fitur tahan belanjaan / antrean gantung (*Hold/Park Cart*) dan pemulihan instan (*Resume Cart*) (`A6-03`).
  6. Fitur darurat [Transaksi Kilat] untuk antrean padat dan penanganan [Kembalian Permen / Pembulatan] (`A6-04`, `A6-05`).
- **Keluaran:** Seluruh fenomena kasbon, talangan laci, antrean belanja gantung, dan nomor langganan terkelola rapi di sistem.

#### Langkah 6: Multi-Satuan, HPP Moving Average, Kulakan & Finansial (Prioritas: P1 & P2)
- **Tujuan:** Menjaga akurasi modal barang, stok fisik eceran/grosir, dan pencatatan kas keluar warung.
- **Tugas Utama:**
  1. Multi-satuan bertingkat (Dus -> Renceng -> Sachet) dengan pemotongan otomatis ke satuan dasar dan harga grosir bertingkat (*tiered pricing*) (`A7-01`).
  2. Modul cetak label kemas ulang 4 unsur wajib (Nama, Varian Berat Tebal, Harga, Barcode) ke printer struk 58mm/80mm (`A7-02`).
  3. Formula kalkulasi otomatis HPP Moving Average saat kulakan barang baru (`A7-03`).
  4. Pencatatan arus kas operasional laci (*Cash In / Cash Out*) untuk beli galon, gas, iuran, dan prive (`A7-04`).
  5. Modul barang rusak/spoilage, retur, dan tombol 1 ketuk [Buat Daftar Kulakan Sekarang] berformat saku 58mm atau tampilan web HP (`A7-05`, `A7-06`).
  6. Manajemen hutang faktur sales tempo dengan tombol [Bayar Tagihan Sales dari Laci] saat sales mendadak datang (`A7-07`).
  7. Modul PPOB (pemisahan margin laba) dan konsinyasi titipan barang (`A7-08`).
- **Keluaran:** Stok otomatis terpotong akurat, modal bergerak terhitung tepat, dan uang laci tidak mengalami selisih misterius.

#### Langkah 7: Pusat Kelola, Impor-Ekspor Excel & Pencadangan Data (Prioritas: P1 & P2)
- **Tujuan:** Menyediakan ruang kerja desktop/tablet bagi pengelola muda untuk administrasi massal dan cadangan data.
- **Tugas Utama:**
  1. Antarmuka terpisah "Pusat Kelola & Pembukuan" berbasis tabel terlindungi PIN (`A8-01`).
  2. Modul impor stok Excel template 9 kolom dengan validasi lokal 3 warna (hijau, kuning, merah) via SheetJS (`A8-02`).
  3. Modul unduh 7 laporan finansial & operasional Excel berformula rapi 100% diproses di browser (`A8-03`).
  4. Tombol 1-klik pencadangan database terenkripsi ke WhatsApp/Google Drive dan fitur pemulihan <10 detik (`A8-04`).
- **Keluaran:** Pengelola muda dapat mengimpor ratusan barang sekaligus, mencetak laporan laba rugi lengkap, dan data warung aman dari kerusakan gawai.

---

### 3.2 Rincian Eksekusi Fase B (Backend & Cloud Sync Engine)

#### Langkah 8: Sinkronisasi Awan & Ketahanan Multi-Perangkat (Prioritas: P1 & P2)
- **Tujuan:** Menyediakan replikasi data ke server awan tanpa merusak sifat kemandirian offline di warung.
- **Tugas Utama:**
  1. Penyusunan skema database server (Supabase / PostgreSQL) yang mencerminkan 13 tabel IndexedDB (`B1-01`).
  2. Implementasi antrean mutasi berbasis `client_transaction_id` (UUID v4) untuk pengiriman data saat online tanpa mengganggu kinerja layar kasir (`B1-01`).
  3. Layanan pencadangan awan otomatis dan autentikasi multi-device (`B1-02`).
- **Keluaran:** Data warung tersinkronisasi aman ke awan dan dapat diakses dari beberapa perangkat bila diperlukan.

---

## 4. KRITERIA PENERIMAAN (ACCEPTANCE CRITERIA)
Setiap langkah pengembangan dianggap selesai hanya jika memenuhi kriteria pengujian berikut:

1. **Uji Kasir Lansia (Senior-Friendly Acceptance):**
   - Kasir usia 50+ dapat memindai barang, memasukkan uang dengan tombol pecahan/uang pas, dan membaca kembalian dalam waktu **< 30 detik** tanpa bantuan orang lain.
   - Tidak ada dialog modal popup yang memblokir kanvas kasir.
2. **Uji Dual-Mode Laci Kasir:**
   - Mode Keluarga: Pergantian kasir via barcode statis berlangsung instan (< 1 detik) tanpa mereset saldo kas laci.
   - Mode Pegawai: Sistem memblokir transaksi jika modal awal belum diinput; tutup shift memicu form *blind cash count* dan mencatat selisih kas dengan benar.
3. **Uji Kasbon & Arus Laci:**
   - Pembayaran sebagian (split tunai + kasbon) tercatat tepat: kas laci bertambah senilai tunai, buku kasbon bertambah senilai sisa hutang.
   - Fitur Pinjam Cash dan Bayar Tagihan Sales memotong saldo fisik laci secara transparan.
4. **Uji Ketahanan Offline PWA:**
   - Mematikan koneksi WiFi dan data seluler: kasir tetap dapat memproses transaksi, mencetak struk, dan mengubah stok tanpa error.
   - Saat koneksi dihidupkan kembali, indikator berubah menjadi hijau tanpa reload halaman.
5. **Uji Kedaulatan Biaya:**
   - Tidak ada panggilan HTTP ke API berbayar (Vision, OCR, atau text-generation API komersial).

---
*Dokumen Rencana Pengembangan Bertahap ini terkunci sebagai Panduan Pelaksanaan Resmi.*