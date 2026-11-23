# SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SOFTWARE REQUIREMENTS SPECIFICATION - SRS)
## SISTEM APLIKASI WEB KASIR & MANAJEMEN WARUNG KELONTONG (PWA)
### Standar Acuan: IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018

---

### INFORMASI DOKUMEN & KENDALI VERSI
- **Kode Dokumen:** SRS-WARUNG-POS-01
- **Versi Dokumen:** 1.0.0 (Baseline SSOT Mutlak)
- **Status:** Approved Baseline / Siap Implementasi
- **Pemilik Sistem:** Riza Raditya
- **Dokumen Acuan Mutlak (Single Source of Truth / SSOT):**
  1. *Modul 01: Arsitektur Sistem & Prinsip Desain*
  2. *Modul 02: Layar Kasir, Transaksi & Manajemen Kasbon (v4)*
  3. *Modul 03: Manajemen Stok, HPP & Keuangan Warung (v3)*
  4. *Modul 04: Impor-Ekspor Excel & Arsitektur Offline-First (v2)*
  5. *Modul 05: Roadmap Pengembangan, Tech Stack & SOP Diskusi*
  6. *00 Master Rencana Pengembangan Aplikasi (Cetak Biru 5 Milestone)*

---

## 1. PENDAHULUAN
### 1.1 Tujuan Dokumen
Dokumen Spesifikasi Kebutuhan Perangkat Lunak (*Software Requirements Specification* - SRS) ini menjabarkan seluruh spesifikasi fungsional, non-fungsional, antarmuka eksternal, arsitektur data, dan batasan teknis dari Aplikasi Web Kasir Warung Kelontong. Dokumen ini bersifat mengikat sebagai spesifikasi teknis tunggal pengembangan perangkat lunak tanpa mengubah atau mengurangi keputusan bisnis yang tertuang dalam 5 dokumen SSOT.

### 1.2 Ruang Lingkup Sistem
Aplikasi yang dikembangkan adalah sistem *Progressive Web App* (PWA) kasir dan tata kelola warung kelontong berbasis *offline-first*. Sistem mencakup:
1. Antarmuka kasir satu kanvas (*zero-modal*) yang dioptimalkan untuk lansia (50–70 tahun).
2. Mekanisme laci ganda (*Dual-Mode Cash Register*): Mode Keluarga tanpa serah-terima vs Mode Pegawai dengan sesi mandiri terisolasi.
3. Tiga jalur input barang sinergis (Scan Foto Curah, Barcode Hardware/Kamera, dan Manual Quick-Grid/Voice).
4. Penanganan pembayaran realistis (tombol pecahan Rupiah, Uang Pas, kembalian suara, dan split kasbon).
5. Arus kas harian warung (Pinjam Cash, Buku Nomor Pelanggan, Tahan Belanjaan/Hold Cart, [Usulan] Transaksi Kilat, [Usulan] Kembalian Permen).
6. Pengelolaan inventaris, multi-satuan, HPP moving average, label kemas ulang, kulakan on-demand, hutang sales distributor, PPOB, dan konsinyasi.
7. Pemrosesan data mandiri bebas biaya API: Impor/ekspor Excel di browser, IndexedDB lokal, dan [Usulan] pencadangan ganda.

### 1.3 Definisi, Akronim, dan Singkatan
- **PWA (Progressive Web App):** Aplikasi web yang memiliki kapabilitas seperti aplikasi native (offline, service worker, installable).
- **SSOT (Single Source of Truth):** Dokumen acuan tunggal yang menjadi rujukan kebenaran mutlak.
- **Zero-Modal Policy:** Kebijakan antarmuka pengguna tanpa jendela *pop-up* dialog bertingkat guna mencegah kebingungan lansia.
- **HPP (Harga Pokok Penjualan):** Nilai modal rata-rata perolehan barang dihitung dengan metode *Moving Average*.
- **IndexedDB:** Basis data transaksional NoSQL lokal bawaan peramban (*browser*).
- **Client-Side Processing:** Pemrosesan komputasi murni pada mesin perangkat pengguna tanpa bergantung pada server API berbayar.
- **Park/Hold Cart:** Kemampuan menyimpan keranjang belanja sementara di antrean gantung dan memanggilnya kembali.
- **Blind Cash Count:** Prosedur tutup shift pegawai di mana kasir menghitung uang fisik tanpa melihat estimasi sistem terlebih dahulu.

### 1.4 Referensi Normatif
1. IEEE Std 830-1998: Recommended Practice for Software Requirements Specifications.
2. W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AAA untuk antarmuka lansia.
3. 5 Dokumen Modul Spesifikasi Warung Kelontong (Modul 01 s.d. 05).

---

## 2. DESKRIPSI UMUM SISTEM (OVERALL DESCRIPTION)
### 2.1 Perspektif Produk & Diagram Konteks Arsitektur
Sistem beroperasi pada arsitektur hibrida *Offline-First Client-Centric*. Seluruh logika bisnis operasional kasir harian dieksekusi secara lokal di dalam browser gawai kasir.

```
+-----------------------------------------------------------------------------------+
|                            GELANGGANG PERANGKAT KASIR (PWA)                       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                  ANTARMUKA PENGGUNA (REACT + TAILWIND + SHADCN)             |  |
|  |  [ Layar Kasir Warung (Lansia) ]    |    [ Pusat Kelola & Buku (Admin Muda) ] |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------+---------------------------------------+  |
|  |               MODUL KOMPUTASI SISI KLIEN (100% BEBAS BIAYA API)             |  |
|  |  - Barcode Scanner (ZXing)          - Visual Foto Curah (TF.js MobileNet)  |  |
|  |  - Voice Synthesis & Mic (WebSpeech)- Pemroses Excel Lokal (SheetJS)        |  |
|  |  - Mesin Hitung HPP Moving Average  - Generator Barcode & Label Termal     |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------+---------------------------------------+  |
|  |          LAPISAN PENYIMPANAN DATA LOKAL (OFFLINE-FIRST ENGINE)              |  |
|  |  - IndexedDB (Dexie.js) : Transaksi, Stok, Kasbon, Sesi Laci, Arus Kas     |  |
|  |  - Service Worker Cache : Aset Statis, App Shell, Suara & Model AI Lokal  |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         | (Koneksi Pulih / Auto-Sync Background)
                                         v
+-----------------------------------------------------------------------------------+
|                        BASIS DATA AWAN (SUPABASE POSTGRESQL)                      |
|             (Sinkronisasi Latar Belakang & [Usulan] Pencadangan Eksternal)         |
+-----------------------------------------------------------------------------------+
```

### 2.2 Karakteristik Pengguna & Matriks Hak Akses (RBAC)
Sistem membagi peran pengguna secara tegas untuk melindungi data sensitif:

| Fitur / Modul Operasional | Pemilik Warung (Owner) | Keluarga Pengelola (Family) | Pegawai Kasir Luar (Employee) |
| :--- | :---: | :---: | :---: |
| Autentikasi | Barcode Statis / PIN | Barcode Statis / PIN | ID & PIN Pribadi |
| Transaksi Kasir & Scan Barang | Ya | Ya | Ya |
| Akses Laci Kas | Mode Keluarga (Bebas) | Mode Keluarga (Bebas) | Mode Pegawai (Sesi Sendiri) |
| Tutup Laci Harian | Ya | Ya | Hanya Tutup Shift Pribadi |
| Pinjam Cash & Arus Kas Kecil | Ya | Ya | Hanya jika diizinkan |
| Lihat Saldo Kasbon & Tagih WA | Ya | Ya | Hanya lihat saat bayar |
| Ubah Harga Jual / HPP Master | Ya | Ya | **Dilarang (Terkunci)** |
| Impor / Ekspor Excel | Ya | Ya | **Dilarang (Terkunci)** |
| Akses Laporan Laba Rugi Bersih | Ya | Ya | **Dilarang (Terkunci)** |
| Void Transaksi Sembarangan | Ya | Ya | **Dilarang (Perlu Supervisor)** |

### 2.3 Batasan Perangkat Keras & Lingkungan Operasional
1. **Perangkat:** Tablet Android/iPad (layar 8–11 inci) atau Ponsel Pintar Android (layar min. 6 inci), Komputer/Laptop untuk impor Excel.
2. **Peramban Target:** Google Chrome (v100+), Safari iOS (v15+), Edge (v100+).
3. **Periferal Perangkat Keras:**
   - Barcode Scanner Tembak (USB HID / Bluetooth HID Keyboard Wedge).
   - Kamera Belakang gawai (autofokus, min. 5 MP) untuk scan barcode dan foto barang.
   - Printer Struk Termal 58mm / 80mm (Bluetooth ESC/POS atau USB).

---

## 3. KEBUTUHAN ANTARMUKA EKSTERNAL (EXTERNAL INTERFACE REQUIREMENTS)
### 3.1 Antarmuka Pengguna (UI Requirements)
- **UI-01 (Zero-Modal Mandate):** Sistem tidak boleh menggunakan dialog popup bertumpuk pada alur kasir utama. Informasi keranjang, metode bayar, dan kembalian harus tampil berdampingan dalam satu kanvas pandang.
- **UI-02 (Touch Target Standard):** Seluruh elemen interaktif utama kasir memiliki target sentuh berukuran minimal `60 x 60 px` dengan jarak bebas horizontal/vertikal minimal `12 px`.
- **UI-03 (Tipografi & Kontras):**
  - Teks nama item keranjang: minimal `18 px` tebal.
  - Teks total belanja: minimal `28 px` ekstra tebal.
  - Teks kembalian raksasa: rentang `36 px – 48 px` dengan latar belakang kontras tinggi (rasio kontras > 7:1 sesuai WCAG AAA).

### 3.2 Antarmuka Perangkat Keras (Hardware Interfaces)
- **HW-01 (Barcode Scanner Keyboard Wedge):** Sistem harus mampu menangkap event penekanan tombol cepat (`keydown` dengan terminator Enter) dari pemindai fisik USB/Bluetooth tanpa mewajibkan pengguna memfokuskan kursor secara manual pada kolom input teks.
- **HW-02 (Kamera Pemindai):** Antarmuka akses kamera web standard (`navigator.mediaDevices.getUserMedia`) untuk pengenalan barcode via pustaka ZXing dan tangkapan frame foto objek via Canvas API.
- **HW-03 (Printer Termal Bluetooth/USB):** Dukungan perintah cetak ESC/POS standar untuk pencetakan struk transaksi, daftar belanja kulakan 58mm, dan cetak label barcode kemas ulang 4-unsur.

### 3.3 Antarmuka Perangkat Lunak (Software Interfaces)
- **SW-01 (Web Speech API):**
  - *SpeechSynthesis:* Memanggil modul suara bawaan peramban berbahasa Indonesia (`id-ID`) untuk melafalkan nominal uang kembalian.
  - *SpeechRecognition:* Menangkap suara nama barang pada pencarian manual saat tombol mikrofon ditekan.
- **SW-02 (IndexedDB & Dexie.js):** Antarmuka penyimpanan lokal terstruktur berkecepatan tinggi dengan skema reaktif.
- **SW-03 (SheetJS / xlsx):** Mesin baca-tulis file Excel lokal di browser tanpa dependensi server.
- **SW-04 (TensorFlow.js & MobileNet):** Mesin klasifikasi gambar lokal untuk identifikasi barang curah.
- **SW-05 (Web Share API / WhatsApp URI):** Skema `whatsapp://send` atau `https://wa.me/` untuk pengiriman rincian kasbon secara instan.

---

## 4. KEBUTUHAN FUNGSIONAL SISTEM (SYSTEM FUNCTIONAL REQUIREMENTS)

### 4.1 Manajemen Pengguna & Laci Kas (User & Cash Drawer)
- **FR-AUTH-01: Autentikasi Barcode Statis (Mode Keluarga)**
  - *Deskripsi:* Anggota keluarga dapat masuk ke sesi kasir dengan memindai kartu barcode statis yang dikalungkan atau ditempel di meja kasir.
  - *Input:* String barcode ID kasir keluarga.
  - *Proses:* Sistem mencocokkan string dengan tabel pengguna keluarga. Sesi aktif langsung berpindah nama kasir tanpa mereset atau mengunci laci kas.
  - *Output:* Nama kasir aktif berganti di pojok atas layar; audit transaksi selanjutnya mencatat `user_id` kasir tersebut.
- **FR-AUTH-02: Autentikasi Pegawai & Modal Awal (Mode Pegawai)**
  - *Deskripsi:* Kasir luar wajib login menggunakan ID dan PIN rahasia serta menginput modal kas laci.
  - *Input:* ID Pegawai, PIN numerik 4–6 digit, Nominal Modal Awal Laci (Rupiah).
  - *Proses:* Validasi kredensial. Jika valid, sistem membuka sesi laci kas mandiri dengan saldo awal tercatat.
  - *Output:* Laci kas pegawai aktif; transaksi pertama diizinkan.
- **FR-AUTH-03: Tutup Sesi & Rekonsiliasi Kas (Tutup Shift Pegawai vs Tutup Laci Keluarga)**
  - *Deskripsi:*
    - *Mode Pegawai:* Pegawai wajib melakukan *blind cash count* (menghitung uang fisik di laci tanpa melihat angka sistem). Sistem membandingkan saldo akhir sistem vs fisik, mencatat selisih (Pas/Lebih/Kurang), lalu mengunci sesi.
    - *Mode Keluarga:* Anggota keluarga manapun yang berjaga di akhir hari dapat menekan [Tutup Laci Harian] untuk mencetak rekap kas masuk/keluar dan mereset laci ke hari berikutnya.
  - *Output:* Cetak rekap penutupan laci (ESC/POS) dan penyimpanan log rekonsiliasi.

### 4.2 Layar Kasir & 3 Jalur Input Barang
- **FR-KSR-01: Jalur 1 - Scan Foto Barang Curah (Client-Side Visual Recognition)**
  - *Deskripsi:* Mengenali komoditas tanpa barcode pabrik (telur, beras, cabai, kerupuk, sayur) menggunakan kamera gawai.
  - *Proses:* Frame kamera diekstraksi ke Canvas, diproses oleh model TensorFlow.js MobileNet lokal, menghasilkan probabilitas kelas objek.
  - *Output:* Sistem menampilkan **3 Kartu Rekomendasi Foto Terbesar**. Penjaga kasir mengetuk 1 kartu untuk memasukkan item ke keranjang. Tidak ada auto-add otomatis.
- **FR-KSR-02: Jalur 2 - Scan Barcode Produk**
  - *Deskripsi:* Memindai barcode produk pabrikan melalui hardware scanner (USB/Bluetooth) atau kamera.
  - *Proses:* Pustaka ZXing membaca kode EAN-13, UPC, atau QR. Sistem mencari SKU di IndexedDB.
  - *Output:* Bunyi *beep* audio, item bertambah ke keranjang belanja dalam tempo < 100ms.
- **FR-KSR-03: Jalur 3 - Quick-Picker Grid & Pencarian Manual (Fallback Utama)**
  - *Deskripsi:* Panel berisi 15–25 item terlaris (*fast-moving items*) berupa kartu bergambar besar yang selalu siap diketuk, dilengkapi kolom teks instan dan tombol pencarian suara (*Web Speech API*).
- **FR-KSR-04: Mekanisme Cadangan Mulus (Seamless Fallback)**
  - *Deskripsi:* Tombol [Scan Barcode] dan [Cari Manual] tetap terlihat berdampingan saat kamera aktif. Jika foto gagal atau barcode rusak, kasir dapat berpindah metode tanpa me-refresh layar.
- **FR-KSR-05: Konversi Barang Curah Berbasis Nominal Rupiah**
  - *Deskripsi:* Mendukung pembelian barang curah berdasarkan uang tunai pembeli (misal: "Beli beras 15.000").
  - *Formula:* $	ext{Qty Terhitung} = rac{	ext{Nominal Uang Diberikan}}{	ext{Harga Jual Dasar per Satuan}}$
  - *Output:* Sistem otomatis mengisi kuantitas desimal (misal 1.00 kg pada harga Rp 15.000/kg) ke keranjang.

### 4.3 Pembayaran, Kembalian & Multimodal Feedback
- **FR-PAY-01: Tombol Pecahan Uang Kertas Rupiah**
  - *Deskripsi:* Tombol pintas pecahan nominal: Rp 2.000, Rp 5.000, Rp 10.000, Rp 20.000, Rp 50.000, Rp 100.000.
  - *Aksi:* Mengetuk tombol pecahan menjumlahkan nominal ke kolom uang bayar diterima.
- **FR-PAY-02: Tombol Cepat [UANG PAS]**
  - *Deskripsi:* Tombol satu ketuk yang langsung mengisi nominal bayar sama persis dengan total belanjaan keranjang dan memicu penyelesaian transaksi instan.
- **FR-PAY-03: Keypad Numerik Manual Raksasa**
  - *Deskripsi:* Keypad angka (0–9) berukuran besar di layar dengan tombol penambah cepat (`+1.000`, `+10.000`, `+50.000`) untuk penanganan uang kombinasi.
- **FR-PAY-04: Kalkulasi Kembalian & Tampilan Ekstra Kontras**
  - *Formula:* $	ext{Kembalian} = 	ext{Nominal Bayar Diterima} - 	ext{Total Belanja}$
  - *Tampilan:* Angka nominal kembalian berukuran raksasa (36–48px) warna hijau cerah dengan latar kontras tinggi.
- **FR-PAY-05: Pelafalan Suara Kembalian (Speech Synthesis)**
  - *Deskripsi:* Begitu transaksi selesai, sistem memicu suara sintetis Bahasa Indonesia melalui Web Speech API: *"Kembalian [nominal] rupiah"*.

### 4.4 Manajemen Kasbon & Pembayaran Campuran (Split Payment)
- **FR-BON-01: Transaksi Pembayaran Sebagian (Split: Tunai + Kasbon)**
  - *Deskripsi:* Mengakomodasi pembeli yang membayar sebagian uang tunai dan sisanya dicatat sebagai hutang.
  - *Kondisi:* Nominal Tunai Diterima < Total Belanja.
  - *Aksi:* Tombol [Jadikan Kasbon] aktif. Kasir memilih nama pelanggan.
  - *Pencatatan:*
    - Kas Laci Masuk = `Nominal Tunai Diterima`.
    - Buku Piutang Pelanggan bertambah = `Total Belanja - Nominal Tunai Diterima`.
    - Status Transaksi = `Lunas Sebagian (Split)`.
- **FR-BON-02: Profil Pelanggan Kasbon & Batas Kredit (Credit Limit)**
  - *Entitas:* ID, Nama, No. WhatsApp, Catatan Alamat Rumah, Batas Maksimal Hutang (Limit), Saldo Hutang Berjalan.
  - *Peringatan:* Jika transaksi baru menyebabkan Saldo Hutang > Limit, sistem menampilkan peringatan visual kuning ramah (tetap dapat diizinkan pemilik).
- **FR-BON-03: Pembayaran Cicilan & Pelunasan Kasbon**
  - *Deskripsi:* Pelanggan dapat menyetor uang cicilan hutang sewaktu-waktu.
  - *Pencatatan:* Saldo hutang pelanggan berkurang, kas laci aktif bertambah otomatis sebagai `Kas Masuk - Pelunasan Kasbon`.
- **FR-BON-04: Rincian Tagihan via WhatsApp**
  - *Deskripsi:* Tombol satu ketuk yang menyusun draf pesan sopan berisi rincian item belanja, tanggal, total, dan sisa hutang, lalu membuka aplikasi WhatsApp menuju nomor pelanggan.

### 4.5 Fitur Situasional Laci & Pelengkap Warung
- **FR-SIT-01: Fitur "Pinjam Cash" (Talangan Sementara)**
  - *Deskripsi:* Pengeluaran uang laci sementara untuk pihak ketiga (misal: talangan paket kurir COD, pinjaman uang kembalian tetangga).
  - *Form:* 3 kolom sederhana: `Nama Orang`, `Nominal Uang (Rp)`, `Keterangan Singkat`.
  - *Status:* Tercatat sebagai `Pinjam Cash Aktif`, saldo fisik laci berkurang.
  - *Pelunasan:* Tombol [Kembalikan ke Laci / Lunas] menutup status pinjaman dan mengembalikan saldo fisik laci.
- **FR-SIT-02: Buku Titipan Nomor Pelanggan (PLN & Pulsa)**
  - *Deskripsi:* Basis data kontak cepat tetangga yang sering menitipkan nomor ID listrik / nomor handphone di warung.
  - *Atribut:* Nama Panggilan, ID Pelanggan PLN / No. Meter, Nomor Handphone / Operator.
  - *Aksi:* Satu ketukan langsung mengisi formulir transaksi PPOB tanpa mengetik ulang digit angka.
- **FR-SIT-03: Tahan Belanjaan / Kesampingkan Keranjang (Hold/Park Cart)**
  - *Deskripsi:* Menyimpan transaksi pembeli yang pamit mengambil barang lain sementara antrean di belakang menumpuk.
  - *Aksi:*
    - Tekan tombol [Kesampingkan Belanjaan]: Keranjang aktif dipindahkan ke daftar slot antrean gantung (memuat ID slot, jumlah barang, subtotal).
    - Layar kasir langsung dikosongkan untuk melayani pembeli berikutnya.
    - Tekan kartu [Antrean Terparkir]: Seluruh item dipulihkan kembali ke keranjang kasir secara utuh untuk dilanjutkan.
- **FR-SIT-04: [Usulan Tambahan] Transaksi Kilat / Quick Cash (Mode Antrean Panik)**
  - *Deskripsi:* Menghindari kepanikan kasir lansia saat warung diserbu antrean padat mendadak.
  - *Aksi:* Tombol darurat [Transaksi Kilat]. Kasir hanya menginput nominal uang tunai diterima -> Tekan [Terima Tunai].
  - *Pencatatan:* Transaksi tuntas < 3 detik, uang kas laci bertambah resmi, penyesuaian stok fisik dapat dilakukan belakangan.
- **FR-SIT-05: [Usulan Tambahan] Kembalian Permen & Pembulatan Koin**
  - *Deskripsi:* Mengatasi ketiadaan uang koin receh Rp 500 / Rp 1.000 di laci.
  - *Tombol [Kembalian Pakai Permen]:* Kembalian tunai laci tuntas, stok permen sistem terpotong otomatis (selisih fisik kas nihil).
  - *Tombol [Bulatkan Kembalian]:* Mengalokasikan sisa receh ke pos pembulatan/kotak amal atas persetujuan pembeli.

### 4.6 Manajemen Stok, Multi-Satuan & HPP Moving Average
- **FR-STK-01: Multi-Satuan & Konversi Stok Otomatis**
  - *Deskripsi:* Mendukung pembelian grosir (Dus/Bal/Slop) dan penjualan eceran (Renceng/Pcs/Sachet).
  - *Struktur Data:* Mengikat produk pada `Satuan Dasar Terkecil`. Seluruh penjualan satuan yang lebih besar otomatis dikalikan faktor konversi dan memotong kuantitas satuan dasar.
- **FR-STK-02: Skema Harga Grosir Bertingkat (Tiered Pricing)**
  - *Deskripsi:* Penetapan harga jual lebih murah otomatis berdasarkan ambang batas kuantitas belanja (misal: 1–2 pcs Rp 3.500; >= 10 pcs Rp 3.000). Sistem menghitung diskon otomatis di keranjang.
- **FR-STK-03: Cetak Label & Barcode Kemas Ulang (Re-Packing Sembako)**
  - *Deskripsi:* Mencetak label mini untuk sembako curah kemasan sendiri ke printer termal 58mm/80mm.
  - *Elemen Wajib Label (4 Unsur):*
    1. Nama Barang Lengkap.
    2. Varian Berat / Ukuran Nyata (Dicetak Ekstra Tebal, misal **1 KG** vs **1/2 KG**).
    3. Harga Jual Rupiah.
    4. Barcode Mini Warung.
- **FR-STK-04: Kalkulasi HPP Moving Average Otomatis**
  - *Formula:*
    $$	ext{HPP Baru} = rac{(	ext{Stok Lama} 	imes 	ext{HPP Lama}) + (	ext{Qty Kulakan Baru} 	imes 	ext{Harga Beli Baru})}{	ext{Stok Lama} + 	ext{Qty Kulakan Baru}}$$
  - *Aturan Khusus:* Jika Stok Lama <= 0, HPP Baru langsung disetel sama dengan Harga Beli Baru. Dilengkapi pencegahan pembagian dengan nol.
- **FR-STK-05: Arus Kas Keluar/Masuk Laci (Cash In & Cash Out)**
  - *Deskripsi:* Pencatatan pengeluaran harian laci (beli air galon, tabung gas warung, iuran kebersihan, uang jajan/prive) dan kas masuk modal kembalian. Mempengaruhi rekonsiliasi laci tanpa merusak perhitungan omzet penjualan.
- **FR-STK-06: Barang Rusak, Retur & Lost Sales Tracker**
  - *Pencatatan Spoilage:* Memotong stok dan mencatat beban kerugian barang rusak/kedaluwarsa.
  - *Pencatatan Lost Sales:* Tombol satu ketuk "Barang Dicari Tapi Kosong" saat pembeli menanyakan barang yang tidak tersedia.
- **FR-STK-07: Daftar Belanja Kulakan Fleksibel (On-Demand Shopping List)**
  - *Deskripsi:* Pemilik warung dapat menekan tombol [Buat Daftar Kulakan Sekarang] kapan saja sebelum berangkat ke agen/pasar.
  - *Komposisi Otomatis:* Menggabungkan barang dengan stok < batas minimum dan barang kosong yang sering dicari pembeli.
  - *Format Output:* Tampilan web responsif saku HP dan format cetak struk saku 58mm.
- **FR-STK-08: Manajemen Hutang Sales Distributor ("Siap Bayar Fleksibel")**
  - *Deskripsi:* Pencatatan nota tempo kulakan per nama distributor/sales keliling (misal: Wings, Unilever, Sampoerna).
  - *Fitur Bayar dari Laci:* Ketika sales mendadak datang menagih, kasir membuka profil distributor, melihat total tagihan jatuh tempo, lalu menekan [Bayar Tagihan Sales dari Laci]. Kas laci terpotong resmi dan saldo hutang faktur diperbarui.
- **FR-STK-09: PPOB & Barang Konsinyasi (Titipan)**
  - *PPOB:* Pemisahan margin keuntungan dari nilai pokok token/pulsa; uang tunai pembeli masuk laci fisik.
  - *Konsinyasi:* Menghitung `Terjual = Titip Pagi - Sisa Sore/Malam`, komisi warung, dan uang setoran pemilik barang.
- **FR-STK-10: [Usulan Tambahan] Katalog Master Warung Bawaan (Pre-loaded Catalog)**
  - *Deskripsi:* Basis data lokal bawaan memuat 1.000+ SKU barang umum warung kelontong Indonesia lengkap dengan barcode, nama resmi, dan kategori.
  - *Alur Cepat:* Scan barcode rak -> sistem mengisi nama dan foto -> kasir hanya memasukkan harga jual -> simpan (< 5 detik per barang).

### 4.7 Impor-Ekspor Excel & Data Manajemen
- **FR-EXC-01: Unggah & Impor Stok Massal Excel**
  - *Deskripsi:* Pembacaan file template Excel (`.xlsx` / `.csv`) 9 kolom secara lokal menggunakan *SheetJS*.
  - *Validasi 3 Warna:*
    - Hijau: Data valid siap simpan.
    - Kuning: Peringatan (barcode kosong digenerate otomatis, nama mirip).
    - Merah: Ditolak (harga jual < modal, kolom wajib kosong).
  - *Mode Impor:* Tambah barang baru saja atau perbarui stok/harga barang eksisting.
- **FR-EXC-02: Ekspor 7 Modul Laporan Excel Gratis di Browser**
  - *Format:* File `.xlsx` dengan pemformatan angka dan formula akuntansi rapi, diproses 100% di browser.
  - *Daftar 7 Laporan:*
    1. Laporan Laba Rugi Warung (Omzet, HPP moving average, laba kotor, beban rusak, kas keluar, laba bersih).
    2. Daftar Rincian Transaksi Penjualan.
    3. Stok & Valuasi Inventaris Aset Warung.
    4. Buku Kasbon Pelanggan & Piutang Berjalan.
    5. Hutang Supplier & Faktur Sales Tempo.
    6. Laporan PPOB & Konsinyasi Titipan.
    7. Log Barang Rusak & Log Barang Kosong Dicari.

### 4.8 Arsitektur Offline-First & Pencadangan Data
- **FR-OFF-01: Penyimpanan Operasional Penuh Offline (IndexedDB Engine)**
  - *Deskripsi:* Semua operasi kasir (scan, transaksi, potong stok, catat kasbon, laci kas) tersimpan secara instan di IndexedDB browser lokal.
  - *Indikator Status:* Visual status di pojok layar: Hijau (Online & Tersinkron) atau Kuning (Offline - Beroperasi Aman).
- **FR-OFF-02: Sinkronisasi Latar Belakang & Anti-Konflik**
  - *Deskripsi:* Setiap mutasi lokal diberi tag `client_transaction_id` (UUID v4) dan timestamp UTC. Saat internet pulih, antrean mutasi dikirim otomatis ke backend database tanpa mengganggu layar kasir.
- **FR-OFF-03: [Usulan Tambahan] Pencadangan Ganda & Pemulihan Cepat**
  - *Pencadangan Otomatis:* Sinkronisasi background saat terhubung internet.
  - *Pencadangan 1-Klik:* Tombol kompresi seluruh basis data menjadi file arsip aman (`.bak` / `.json.enc`) yang langsung dapat dibagikan ke WhatsApp pribadi pemilik atau Google Drive.
  - *Pemulihan Instan:* Buka aplikasi di gawai baru, unggah file arsip, seluruh data pulih 100% dalam waktu < 10 detik.

---

## 5. KEBUTUHAN NON-FUNGSIONAL (NON-FUNCTIONAL REQUIREMENTS)
### 5.1 Kinerja & Latensi (Performance)
- **NFR-PERF-01:** Waktu simpan transaksi ke IndexedDB lokal tidak boleh melebihi `50 ms`.
- **NFR-PERF-02:** Pemindaian barcode fisik melalui keyboard wedge harus diproses dan merender item di keranjang dalam waktu `< 100 ms`.
- **NFR-PERF-03:** Pelafalan audio Text-to-Speech kembalian harus dimulai maksimal `200 ms` setelah tombol bayar ditekan.
- **NFR-PERF-04:** Pemrosesan impor Excel 1.000 baris produk di browser selesai dalam waktu `< 3 detik`.
- **NFR-PERF-05:** Frame rate antarmuka kasir stabil pada `60 FPS` tanpa lagging saat menggulir daftar belanjaan.

### 5.2 Keandalan & Ketersediaan (Reliability & Availability)
- **NFR-REL-01:** Aplikasi harus memiliki tingkat ketersediaan fungsional `100%` saat gawai tidak memiliki akses internet (fitur kasir, stok, kasbon, dan laporan tetap berjalan normal).
- **NFR-REL-02:** Integritas transaksi lokal dijamin menggunakan mekanisme transaksi atomik IndexedDB (*ACID guarantees* di level peramban) sehingga tidak terjadi mutasi data separuh jalan saat baterai gawai mati mendadak.

### 5.3 Aksesibilitas & Usabilitas (Senior-Friendly Usability)
- **NFR-USE-01:** Rasio kontras warna tombol dan teks minimal memenuhi standar WCAG 2.1 AAA (rasio kontras 7:1) untuk memastikan teks terbaca jelas di bawah pencahayaan lampu warung.
- **NFR-USE-02:** Target sentuh tombol minimal `60 x 60 px` untuk mengakomodasi akurasi motorik kasar lansia.
- **NFR-USE-03:** Waktu yang dibutuhkan kasir pemula lansia (usia 50+) untuk menyelesaikan satu alur transaksi standar (3 item + bayar uang pas/pecahan) adalah `< 30 detik`.

### 5.4 Keamanan Data & Privasi (Security & Privacy)
- **NFR-SEC-01:** Seluruh PIN kasir pegawai disimpan dalam bentuk hash kriptografis (*bcrypt/PBKDF2*) di penyimpanan lokal.
- **NFR-SEC-02:** File pencadangan data eksternal ([Usulan Tambahan]) dilindungi dengan enkripsi simetris AES-GCM 256-bit sebelum diunggah ke WhatsApp atau Google Drive.
- **NFR-SEC-03:** Akses ke menu "Pusat Kelola & Pembukuan" (laporan laba, ubah HPP, ekspor) dilindungi PIN Pemilik Warung.

---

## 6. SPESIFIKASI SKEMA DATA (DATA SCHEMA & MODELS)
Berikut adalah struktur entitas basis data relasional/IndexedDB:

### 6.1 Tabel: `users`
- `id` (UUID, Primary Key)
- `name` (String, Nama Lengkap / Panggilan)
- `role` (Enum: 'owner', 'family', 'employee')
- `static_barcode_id` (String, Unique, Nullable - untuk Mode Keluarga)
- `pin_hash` (String, Nullable - untuk Mode Pegawai & Akses Admin)
- `is_active` (Boolean, Default True)

### 6.2 Tabel: `drawer_sessions`
- `id` (UUID, Primary Key)
- `mode` (Enum: 'family_shared', 'employee_shift')
- `user_id` (UUID, Foreign Key -> `users.id`)
- `opened_at` (Timestamp UTC)
- `closed_at` (Timestamp UTC, Nullable)
- `initial_cash_amount` (Decimal / BigInt, Modal Awal)
- `system_expected_cash` (Decimal / BigInt, Estimasi Kas Sistem)
- `physical_counted_cash` (Decimal / BigInt, Kas Fisik Dihitung)
- `cash_difference` (Decimal / BigInt, Selisih)
- `status` (Enum: 'open', 'closed')

### 6.3 Tabel: `products`
- `id` (UUID, Primary Key)
- `barcode` (String, Indexed, Barcode Toko/Pabrik)
- `name` (String, Nama Produk)
- `category` (String, Kategori)
- `base_unit` (String, Satuan Dasar Terkecil, misal: Pcs/Bungkus/Kg)
- `cost_price_hpp` (Decimal, HPP Moving Average)
- `selling_price_retail` (Decimal, Harga Jual Eceran)
- `current_stock` (Decimal, Sisa Stok dalam Satuan Dasar)
- `min_stock_alert` (Decimal, Batas Peringatan Stok Menipis)
- `image_url` (String, Path/Data URI Foto Produk)
- `is_bulk_commodity` (Boolean, True jika komoditas curah)

### 6.4 Tabel: `product_units` (Multi-Satuan)
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key -> `products.id`)
- `unit_name` (String, misal: Dus, Renceng, Slop)
- `conversion_factor` (Decimal, Jumlah Satuan Dasar, misal 1 Dus = 100 Pcs)
- `selling_price` (Decimal, Harga Jual Khusus Satuan Ini)

### 6.5 Tabel: `product_tiered_prices` (Grosir Bertingkat)
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key -> `products.id`)
- `min_quantity` (Decimal, Jumlah Minimum Belanja)
- `unit_price` (Decimal, Harga Satuan Khusus)

### 6.6 Tabel: `transactions`
- `id` (UUID, Primary Key)
- `receipt_number` (String, Nomor Nota Unik)
- `drawer_session_id` (UUID, Foreign Key -> `drawer_sessions.id`)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `transaction_time` (Timestamp UTC)
- `total_gross_amount` (Decimal, Total Belanja Kotor)
- `discount_amount` (Decimal, Diskon Grosir/Potongan)
- `total_net_amount` (Decimal, Total Bersih yang Harus Dibayar)
- `cash_received_amount` (Decimal, Uang Tunai Diterima)
- `cash_change_amount` (Decimal, Kembalian Diberikan)
- `payment_status` (Enum: 'cash_full', 'split_kasbon', 'kasbon_full', 'quick_cash')
- `customer_kasbon_id` (UUID, Foreign Key -> `customers_kasbon.id`, Nullable)
- `kasbon_amount` (Decimal, Porsi Hutang Belanja)
- `candy_change_count` (Integer, Jumlah permen sebagai kembalian)
- `rounded_change_amount` (Decimal, Pembulatan koin kembalian)
- `sync_status` (Enum: 'local_pending', 'synced')

### 6.7 Tabel: `transaction_items`
- `id` (UUID, Primary Key)
- `transaction_id` (UUID, Foreign Key -> `transactions.id`)
- `product_id` (UUID, Foreign Key -> `products.id`)
- `unit_name` (String, Satuan yang Dipilih Saat Kasir)
- `quantity` (Decimal, Kuantitas Belanja)
- `base_unit_quantity` (Decimal, Kuantitas dalam Satuan Dasar)
- `cost_price_at_sale` (Decimal, HPP Moving Average saat Transaksi)
- `unit_price` (Decimal, Harga Jual Satuan Terapan)
- `subtotal_amount` (Decimal, Total Harga Item)

### 6.8 Tabel: `customers_kasbon`
- `id` (UUID, Primary Key)
- `name` (String, Nama Pelanggan)
- `phone_whatsapp` (String, Nomor Kontak WhatsApp)
- `address_notes` (Text, Patokan Rumah / Catatan)
- `credit_limit` (Decimal, Batas Maksimal Hutang)
- `current_debt_balance` (Decimal, Saldo Hutang Berjalan)

### 6.9 Tabel: `kasbon_ledgers` (Buku Mutasi Kasbon)
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key -> `customers_kasbon.id`)
- `transaction_id` (UUID, Foreign Key -> `transactions.id`, Nullable)
- `drawer_session_id` (UUID, Foreign Key -> `drawer_sessions.id`)
- `entry_type` (Enum: 'debt_increase', 'repayment')
- `amount` (Decimal, Nominal Mutasi)
- `balance_after` (Decimal, Sisa Saldo Setelah Mutasi)
- `notes` (String, Keterangan)
- `created_at` (Timestamp UTC)

### 6.10 Tabel: `pinjam_cash` (Talangan Laci Sementara)
- `id` (UUID, Primary Key)
- `drawer_session_id` (UUID, Foreign Key -> `drawer_sessions.id`)
- `borrower_name` (String, Nama Peminjam / Kurir COD / Tetangga)
- `amount` (Decimal, Nominal Uang Laci Keluar)
- `purpose_notes` (String, Keterangan Singkat)
- `status` (Enum: 'active_borrowed', 'repaid_to_drawer')
- `created_at` (Timestamp UTC)
- `repaid_at` (Timestamp UTC, Nullable)

### 6.11 Tabel: `customer_service_numbers` (Buku Titipan Nomor Pelanggan)
- `id` (UUID, Primary Key)
- `customer_nickname` (String, Nama Panggilan Tetangga)
- `pln_customer_id` (String, Nullable, ID Meteran Listrik PLN)
- `phone_number` (String, Nullable, Nomor HP / Operator)
- `notes` (String, Nullable)

### 6.12 Tabel: `cash_flows` (Arus Kas Laci Harian)
- `id` (UUID, Primary Key)
- `drawer_session_id` (UUID, Foreign Key -> `drawer_sessions.id`)
- `flow_type` (Enum: 'cash_in', 'cash_out')
- `category` (Enum: 'galon_gas', 'iuran_lingkungan', 'prive_owner', 'modal_tambahan', 'lain_lain')
- `amount` (Decimal, Nominal Kas)
- `notes` (String, Keterangan)
- `created_at` (Timestamp UTC)

### 6.13 Tabel: `distributor_invoices` (Hutang Sales Tempo)
- `id` (UUID, Primary Key)
- `distributor_name` (String, Nama Distributor / Sales, misal: Wings / Unilever)
- `invoice_number` (String, Nomor Faktur/Nota)
- `invoice_date` (Date, Tanggal Terima Barang)
- `total_invoice_amount` (Decimal, Total Tagihan)
- `paid_amount` (Decimal, Jumlah yang Sudah Dibayar)
- `remaining_amount` (Decimal, Sisa Tagihan Siap Bayar)
- `status` (Enum: 'unpaid', 'partially_paid', 'settled')

---

## 7. MATRIKS KETERLACAKAN KEBUTUHAN (REQUIREMENTS TRACEABILITY MATRIX - RTM)
Memastikan setiap ketentuan dalam 5 Dokumen Modul SSOT terpetakan secara utuh ke SRS:

| Klausul Modul SSOT | Deskripsi Ketentuan Bisnis SSOT | Pemetaan Kebutuhan Fungsional SRS |
| :--- | :--- | :--- |
| **Modul 01 (§2.1)** | Mode Keluarga (1 Laci, Barcode Statis, Tutup Bebas) | `FR-AUTH-01`, `FR-AUTH-03` |
| **Modul 01 (§2.2)** | Mode Pegawai (1 Pegawai = 1 Laci, Modal, Blind Cash Count) | `FR-AUTH-02`, `FR-AUTH-03` |
| **Modul 01 (§3)** | Pemisahan Dua Ruang Kerja (Kasir Lansia vs Pusat Kelola) | `FR-EPIC1-03`, `UI-01`, Matriks RBAC |
| **Modul 01 (§4)** | 100% Bebas Biaya API & Kedaulatan Klien | `SW-01` s.d. `SW-05`, `NFR-REL-01` |
| **Modul 02 (§1)** | Senior-Friendly UI (Zero-Modal, Target >=60px, Suara) | `UI-01`, `UI-02`, `UI-03`, `FR-PAY-05` |
| **Modul 02 (§2)** | 3 Jalur Input (Foto Curah 3 Kartu, Barcode, Manual/Voice) | `FR-KSR-01`, `FR-KSR-02`, `FR-KSR-03`, `FR-KSR-04` |
| **Modul 02 (§3)** | Penanganan Barang Curah & Konversi Nominal Rupiah | `FR-KSR-05` |
| **Modul 02 (§4)** | Pecahan Uang Fisik, Uang Pas, Keypad Raksasa & Kembalian | `FR-PAY-01`, `FR-PAY-02`, `FR-PAY-03`, `FR-PAY-04` |
| **Modul 02 (§5)** | Kasbon & Pembayaran Campuran (Split Payment, WA, Limit) | `FR-BON-01`, `FR-BON-02`, `FR-BON-03`, `FR-BON-04` |
| **Modul 02 (§6)** | Pinjam Cash (Talangan Sementara 3 Kolom) | `FR-SIT-01` |
| **Modul 02 (§7)** | Buku Titipan Nomor Pelanggan (PLN & Pulsa One-Tap) | `FR-SIT-02` |
| **Modul 02 (§8)** | Tahan Belanjaan / Kesampingkan Keranjang (Hold/Park Cart) | `FR-SIT-03` |
| **Modul 02 (§9)** | [Usulan Tambahan] Transaksi Kilat / Quick Cash | `FR-SIT-04` |
| **Modul 02 (§10)** | [Usulan Tambahan] Kembalian Permen & Pembulatan Koin | `FR-SIT-05` |
| **Modul 03 (§1.1)**| Multi-Satuan & Skema Harga Grosir Bertingkat | `FR-STK-01`, `FR-STK-02` |
| **Modul 03 (§1.2)**| Cetak Label & Barcode Kemas Ulang (4 Unsur Wajib, 58/80mm) | `FR-STK-03`, `HW-03` |
| **Modul 03 (§2)** | Perhitungan HPP Moving Average Otomatis | `FR-STK-04` |
| **Modul 03 (§3)** | Arus Kas Keluar/Masuk Laci (Beli Galon, Operasional) | `FR-STK-05` |
| **Modul 03 (§4)** | Spoilage, Retur, Lost Sales & Kulakan On-Demand 58mm/Web | `FR-STK-06`, `FR-STK-07` |
| **Modul 03 (§5)** | Hutang Sales Distributor ("Siap Bayar Fleksibel" dari Laci) | `FR-STK-08` |
| **Modul 03 (§6)** | Ekosistem Warung: PPOB & Konsinyasi Titipan | `FR-STK-09` |
| **Modul 03 (§7)** | [Usulan Tambahan] Katalog Master Warung Bawaan (1.000+ SKU) | `FR-STK-10` |
| **Modul 04 (§1)** | Upload & Impor Stok Massal Excel (Validasi 3 Warna SheetJS)| `FR-EXC-01` |
| **Modul 04 (§2)** | Unduh 7 Modul Laporan Excel Gratis di Browser | `FR-EXC-02` |
| **Modul 04 (§3)** | Arsitektur Offline-First (IndexedDB Latensi <50ms, Anti-Konflik) | `FR-OFF-01`, `FR-OFF-02`, `NFR-PERF-01` |
| **Modul 04 (§4)** | [Usulan Tambahan] Pencadangan Ganda & Pemulihan Cepat | `FR-OFF-03`, `NFR-SEC-02` |
| **Modul 05 (§1)** | Tech Stack 100% Gratis Tanpa API Berbayar | Seluruh Bagian 2 & 3 |
| **Modul 05 (§2)** | 5 Milestone Rencana Pengembangan | Konsisten dengan Dokumen Induk 00 |

---
*Dokumen SRS ini mengikat dan terkunci sebagai Baseline Spesifikasi Teknis Resmi Pengembangan Aplikasi.*