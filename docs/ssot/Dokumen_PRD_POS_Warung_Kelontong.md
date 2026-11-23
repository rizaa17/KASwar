# DOKUMEN KEBUTUHAN PRODUK (PRODUCT REQUIREMENTS DOCUMENT - PRD)
## APLIKASI WEB KASIR & MANAJEMEN WARUNG KELONTONG KELUARGA (PWA)

---

### INFORMASI DOKUMEN & METADATA
- **Nama Produk:** Aplikasi Web Kasir Warung Kelontong Keluarga (Senior-Friendly & Family-Centric POS)
- **Versi Dokumen:** 1.0.0 (Baseline SSOT Mutlak)
- **Status:** Approved Baseline / Siap Eksekusi
- **Pemilik Produk / Product Owner:** Riza Raditya
- **Dokumen Acuan Mutlak (Single Source of Truth / SSOT):**
  1. *Modul 01: Arsitektur Sistem & Prinsip Desain*
  2. *Modul 02: Layar Kasir, Transaksi & Manajemen Kasbon (v4)*
  3. *Modul 03: Manajemen Stok, HPP & Keuangan Warung (v3)*
  4. *Modul 04: Impor-Ekspor Excel & Arsitektur Offline-First (v2)*
  5. *Modul 05: Roadmap Pengembangan, Tech Stack & SOP Diskusi*
  6. *00 Master Rencana Pengembangan Aplikasi (Cetak Biru 5 Milestone)*

---

## 1. PENDAHULUAN & LATAR BELAKANG
### 1.1 Latar Belakang Masalah
Warung kelontong tradisional merupakan urat nadi ekonomi mikro Indonesia yang didominasi oleh tata kelola berbasis kekeluargaan dan dioperasikan oleh generasi lanjut usia (usia 50–70 tahun). Solusi Point of Sale (POS) modern yang beredar di pasar saat ini memiliki kelemahan mendasar:
1. **Terlalu Kaku untuk Pola Warung Keluarga:** Memaksakan prosedur ritel modern minimarket seperti serah-terima shift kasir yang ketat, tutup buku formal setiap pergantian orang, dan autentikasi login yang rumit. Pola ini gagal di warung di mana suami, istri, dan anak saling berganti menjaga meja kasir secara spontan tanpa memisahkan uang laci.
2. **Antarmuka Menyulitkan Lansia (*Cognitive Overload*):** Tombol kecil, font tipis, alur berlapis dengan pop-up (modal) bertingkat, serta tidak tersedianya input nominal uang nyata menyebabkan pedagang lansia cemas salah menekan, lambat melayani pembeli, hingga akhirnya kembali memakai buku tulis manual.
3. **Beban Biaya Berkelanjutan:** Bergantung pada biaya langganan bulanan atau penggunaan API pihak ketiga berbayar (OCR, AI Vision, database cloud) yang memberatkan warung skala mikro.
4. **Ketergantungan Sinyal Internet:** Gangguan koneksi internet melumpuhkan proses transaksi kasir di lapangan.

### 1.2 Pernyataan Visi Produk
Menciptakan aplikasi kasir berbasis web (Progressive Web App) yang **100% bebas biaya API berkelanjutan**, **beroperasi penuh secara offline**, serta dirancang dengan filosofi **Dual-Mode Laci Kasir** dan antarmuka **Senior-Friendly (Ramah Orang Tua)** yang menghilangkan kecemasan teknologi bagi pedagang lanjut usia.

---

## 2. TARGET PENGGUNA & PERSONA
Produk melayani 3 profil pengguna berbeda dalam satu ekosistem:

### 2.1 Persona 1: Pemilik Warung / Penjaga Kasir Lansia (50–70 Tahun)
- **Karakteristik Fisik & Mental:** Penurunan ketajaman visual, getaran jemari, keengganan berhadapan dengan menu rumit, fokus penuh pada kecepatan melayani antrean tetangga.
- **Kebutuhan Utama:**
  - Antarmuka satu layar penuh tanpa pop-up bertingkat (*Zero-Modal Policy*).
  - Tombol fisik sentuh raksasa (minimal 60x60 px) dengan teks ekstra kontras.
  - Opsi scan foto visual untuk barang curah tanpa barcode (telur, beras, sayur, kerupuk).
  - Pilihan pecahan uang Rupiah nyata, tombol "Uang Pas", dan layar kembalian raksasa dengan panduan suara Bahasa Indonesia.
  - Ruang kerja terisolasi: **Layar Kasir Warung**.

### 2.2 Persona 2: Keluarga Pengelola / Generasi Muda (Anak / Pasangan)
- **Karakteristik:** Cepat beradaptasi dengan gawai digital, memegang kendali pembukuan, stok, dan strategi harga.
- **Kebutuhan Utama:**
  - Fleksibilitas pergantian kasir tanpa hitung kas kaku (Mode Keluarga).
  - Manajemen impor/ekspor stok massal menggunakan file Excel (.xlsx / .csv).
  - Pemantauan HPP otomatis, laba rugi bersih, serta manajemen hutang sales tempo.
  - Ruang kerja terisolasi: **Pusat Kelola & Pembukuan**.

### 2.3 Persona 3: Pegawai Kasir Luar (Karyawan Harian/Shift)
- **Karakteristik:** Tenaga kerja eksternal yang dipekerjakan untuk jam jaga tertentu.
- **Kebutuhan Utama:**
  - Akuntabilitas kas per shift (1 Pegawai = 1 Laci Kas).
  - Input modal awal wajib dan rekonsiliasi kas fisik saat tutup shift (*blind cash count*).
  - Batasan hak akses: dilarang menghapus transaksi sembarangan, dilarang mengubah HPP master, dan dilarang melihat laporan laba bersih.

---

## 3. PRINSIP DASAR PRODUK (PRODUCT GUIDING PRINCIPLES)
1. **Aturan Satu Layar Terbuka (*Zero-Modal Policy*):** Seluruh proses transaksi mulai dari pemindaian barang, penyesuaian jumlah, hingga pembayaran berlangsung pada satu tampilan tanpa modal popup yang menutupi alur kerja utama.
2. **Kedaulatan Finansial & 100% Bebas Biaya API:** Seluruh kemampuan cerdas (pengenalan foto, OCR nota, voice-to-text, manipulasi Excel) dieksekusi murni di sisi klien (*client-side* browser).
3. **Dual-Mode Laci Kasir Terintegrasi:** Menghargai kebiasaan laci kas keluarga (Mode Keluarga) sekaligus menyediakan akuntabilitas ketat saat mempekerjakan karyawan luar (Mode Pegawai).
4. **Toleransi Operasional Warung Nyata:** Mengakomodasi transaksi kasbon, pinjaman uang laci sementara, kembalian permen, pelanggan yang lupa nomor PLN, serta barang belanjaan yang ditinggal memilih barang lain.

---

## 4. SPESIFIKASI FITUR PRODUK (PRODUCT FEATURES & EPICS)

### EPIC 1: SISTEM ARSITEKTUR LACI GANDA (DUAL-MODE REGISTER)
- **FR-EPIC1-01: Mode Keluarga (Family Shared Drawer)**
  - Satu laci kas digunakan bersama selama 24 jam operasional warung.
  - Autentikasi kilat menggunakan pemindaian **Barcode Statis** (dicetak pada kartu ID/stiker kasir).
  - Pergantian antar-anggota keluarga bebas tanpa hitung kas fisik (*zero-friction handoff*).
  - Siapapun anggota keluarga yang berjaga pada jam tutup berhak melakukan Tutup Laci Harian.
  - Setiap struk/transaksi tetap mencatat `user_id` kasir di latar belakang untuk jejak audit.
- **FR-EPIC1-02: Mode Pegawai (Strict Shift Drawer)**
  - 1 Pegawai = 1 Sesi Laci Kas Mandiri.
  - Login via ID & PIN. Wajib input modal awal kas sebelum melayani transaksi pertama.
  - Tutup shift wajib dengan hitung kas fisik mandiri (*blind cash count*).
  - Sistem menampilkan selisih (Kurang/Lebih/Pas) yang terkunci pada sesi pegawai.
- **FR-EPIC1-03: Pemisahan Dua Ruang Kerja (Dual Workspace)**
  - Pembatasan visual tegas antara **Layar Kasir Warung** (lansia) dan **Pusat Kelola & Pembukuan** (pengelola muda).

### EPIC 2: LAYAR KASIR RAMAH LANSIA & 3 JALUR INPUT BARANG
- **FR-EPIC2-01: Desain Senior-Friendly UI**
  - Target sentuh minimal 60 x 60 px dengan jarak aman antar-tombol.
  - Tipografi kontras tinggi: Nama barang >=18px, total belanja >=28px, angka kembalian 36px–48px.
  - Indikator status laci dan koneksi jelas tanpa ikon tersembunyi.
- **FR-EPIC2-02: Sinergi 3 Jalur Input & Fallback Mulus**
  - *Jalur 1: Scan Foto Barang (Curah):* Kamera mendeteksi objek curah/tanpa kemasan, menampilkan 3 kartu rekomendasi foto terbesar, konfirmasi satu ketukan (tanpa auto-add).
  - *Jalur 2: Scan Barcode Pabrik:* Integrasi scanner USB/Bluetooth hardware (*keyboard wedge*) dan kamera bawaan HP/tablet (EAN-13, UPC, QR).
  - *Jalur 3: Pilih Manual / Grid Cepat:* Grid 15–25 barang terlaris (*fast-moving*), kolom pencarian teks instan, dan pencarian suara (*Web Speech API*).
  - *Mekanisme Fallback:* Tombol barcode dan cari manual selalu tersedia di samping kamera jika scan foto ragu; tombol foto/manual siap jika barcode rusak/pudar.
- **FR-EPIC2-03: Penanganan Barang Curah & Konversi Rupiah**
  - Mode kuantitas desimal (0.25 kg, 0.5 liter).
  - Mode nominal Rupiah: kasir mengetik nominal uang (misal Rp 15.000) dan sistem otomatis menghitung berat/takaran berdasarkan harga master.

### EPIC 3: ALUR PEMBAYARAN, KEMBALIAN & MULTIMODAL FEEDBACK
- **FR-EPIC3-01: Tombol Pecahan Uang Fisik Rupiah**
  - Tombol pecahan cepat: Rp 2.000, Rp 5.000, Rp 10.000, Rp 20.000, Rp 50.000, Rp 100.000.
  - Tombol instan **[UANG PAS]** yang mengisi nominal sama persis dengan total belanja.
- **FR-EPIC3-02: Keypad Manual Raksasa & Shortcut Kombinasi**
  - Keypad numerik angka besar dengan tombol penambah cepat (+1.000, +10.000, +50.000).
- **FR-EPIC3-03: Layar Kembalian Raksasa & Umpan Balik Suara (Text-to-Speech)**
  - Tampilan nilai kembalian warna hijau cerah ukuran 36px–48px.
  - Suara *beep* saat pemindaian barang berhasil.
  - Pengucapan otomatis kembalian dalam Bahasa Indonesia via *Web Speech Synthesis* (misal: "Kembalian dua puluh lima ribu rupiah").

### EPIC 4: MANAJEMEN KASBON & PEMBAYARAN CAMPURAN (SPLIT PAYMENT)
- **FR-EPIC4-01: Pembayaran Campuran (Split: Tunai + Kasbon)**
  - Dukungan transaksi sebagian tunai dan sisanya dicatat sebagai hutang/bon.
  - Tombol [Jadikan Kasbon] otomatis aktif saat uang tunai diterima kurang dari total belanja.
  - Pemilihan pelanggan terdaftar: kas laci bertambah senilai uang tunai, piutang bertambah senilai sisa tagihan.
- **FR-EPIC4-02: Buku Kasbon Pelanggan & Limit Kredit**
  - Profil pelanggan memuat nama, nomor WhatsApp, catatan alamat/rumah, dan batas hutang.
  - Peringatan ramah jika hutang baru melampaui limit kredit.
  - Alur cicilan/pelunasan kasbon fleksibel yang langsung mencatat uang masuk ke kas laci aktif.
  - Fitur kirim rincian belanja dan saldo hutang ke WhatsApp pelanggan dengan satu ketukan.

### EPIC 5: OPERASIONAL LACI WARUNG & TOLERANSI SITUASIONAL
- **FR-EPIC5-01: Fitur "Pinjam Cash" (Talangan Sementara)**
  - Form ringkas 3 kolom: Nama Peminjam, Nominal Uang, dan Keterangan Singkat (misal talangan COD kurir).
  - Mengurangi saldo fisik laci aktif dan tercatat sebagai pinjaman aktif (bukan biaya warung).
  - Tombol [Kembalikan ke Laci / Lunas] saat dana dikembalikan.
- **FR-EPIC5-02: Buku Titipan Nomor Pelanggan (PLN & Pulsa)**
  - Letak berdampingan dengan menu kasir/transaksi digital.
  - Menyimpan nama panggilan tetangga, nomor meteran listrik PLN, dan nomor HP/operator.
  - Satu ketukan untuk mengisi formulir pembelian tanpa ketik ulang 11–12 digit angka.
- **FR-EPIC5-03: Tahan Belanjaan / Kesampingkan Keranjang (Hold/Park Cart)**
  - Tombol [Kesampingkan Belanjaan] untuk menyimpan transaksi pembeli yang masih memilih barang lain.
  - Layar kasir bersih seketika untuk melayani antrean pembeli berikutnya.
  - Tombol pemulihan (*Resume Cart*) untuk memanggil kembali keranjang tanpa scan ulang.
- **FR-EPIC5-04: [Usulan Tambahan] Transaksi Kilat / Quick Cash (Mode Antrean Panik)**
  - Tombol darurat untuk menerima uang tunai langsung tanpa memilih item produk.
  - Transaksi tuntas dalam 3 detik, uang laci bertambah resmi, stok fisik disesuaikan kemudian.
- **FR-EPIC5-05: [Usulan Tambahan] Kembalian Permen & Pembulatan Koin**
  - Tombol [Kembalian Pakai Permen]: memotong stok permen sistem tanpa menimbulkan selisih kas fisik.
  - Tombol [Bulatkan Kembalian]: mencatat kembalian yang diikhlaskan pembeli/amal.

### EPIC 6: MANAJEMEN STOK, HPP, KULAKAN & KEUANGAN
- **FR-EPIC6-01: Multi-Satuan & Harga Grosir Bertingkat**
  - Satuan dasar terkecil (Pcs/Bungkus/Butir) dengan hierarki bertingkat (Dus -> Renceng -> Sachet).
  - Pemotongan stok otomatis ke satuan dasar.
  - Skema harga grosir otomatis (*tiered pricing*) berdasarkan kuantitas keranjang belanja.
- **FR-EPIC6-02: Cetak Label & Barcode Kemas Ulang (Re-Packing)**
  - Mencetak label 58mm/80mm untuk sembako curah kemasan mandiri.
  - Wajib memuat 4 unsur: Nama Barang Lengkap, Varian Berat/Ukuran Nyata (tebal), Harga Jual Rupiah, dan Barcode Toko.
- **FR-EPIC6-03: Perhitungan HPP Otomatis (Moving Average)**
  - Perhitungan HPP modal bergerak otomatis saat barang masuk:
    `HPP Baru = ((Stok Lama * HPP Lama) + (Qty Beli * Harga Beli)) / (Stok Lama + Qty Beli)`.
  - Proteksi stok minus dan proteksi pembagian dengan nol.
- **FR-EPIC6-04: Arus Kas Laci (Cash In & Cash Out)**
  - Pencatatan biaya operasional harian (beli galon, gas, iuran kebersihan, prive pemilik).
  - Kas masuk non-penjualan (tambah modal kembalian laci).
- **FR-EPIC6-05: Retur, Spoilage & Daftar Belanja Kulakan On-Demand**
  - Pencatatan barang rusak/expired sebagai beban pengurang laba.
  - Log barang kosong dicari pembeli (*lost sales tracker*).
  - Tombol [Buat Daftar Kulakan Sekarang] fleksibel: menarik barang menipis (*low stock*) dan barang kosong yang sering ditanyakan. Format cetak struk 58mm saku atau web responsif di HP.
- **FR-EPIC6-06: Manajemen Hutang Sales & Distributor ("Siap Bayar Fleksibel")**
  - Pencatatan faktur tempo per nama distributor/sales keliling.
  - Fitur [Bayar Tagihan Sales dari Laci] saat sales mendadak datang menagih; memotong kas laci aktif secara resmi.
- **FR-EPIC6-07: Ekosistem Warung: PPOB & Konsinyasi**
  - PPOB: Pencatatan omzet terpisah dari margin laba; uang tunai masuk laci kasir.
  - Konsinyasi: Formula `Terjual = Titip Pagi - Sisa Sore/Malam`, pembagian komisi warung dan nilai setoran.
- **FR-EPIC6-08: [Usulan Tambahan] Katalog Master Warung Bawaan (Pre-loaded Catalog)**
  - Database bawaan 1.000+ SKU barang umum warung Indonesia (Indomie, bumbu, rokok, sabun, sembako).
  - Pendaftaran barang baru < 5 detik: scan barcode pabrik -> nama dan foto terisi otomatis -> pemilik hanya mengetik harga jual.

### EPIC 7: IMPOR-EKSPOR EXCEL & ARSITEKTUR DATA
- **FR-EPIC7-01: Upload & Impor Stok Massal Excel**
  - Template resmi (.xlsx / .csv) 9 kolom standar.
  - Pemrosesan 100% lokal di browser via *SheetJS*.
  - Layar validasi pra-impor 3 warna: Hijau (valid), Kuning (peringatan), Merah (ditolak).
  - Opsi: Tambah barang baru atau perbarui stok/harga barang lama.
- **FR-EPIC7-02: Unduh 7 Modul Laporan Excel Gratis**
  - Laporan Laba Rugi Warung (Omzet, HPP moving average, laba kotor, beban rusak, biaya kas keluar, laba bersih).
  - Daftar Rincian Transaksi per kasir dan metode bayar.
  - Stok & Valuasi Inventaris warung.
  - Buku Kasbon Pelanggan & jatuh tempo.
  - Hutang Supplier & Pembelian Tempo.
  - Laporan PPOB & Konsinyasi.
  - Log Barang Rusak & Barang Kosong.

### EPIC 8: OFFLINE-FIRST, PWA & PENCADANGAN DATA
- **FR-EPIC8-01: Operasional Penuh Offline (IndexedDB)**
  - Penyimpanan operasional lokal di browser dengan latensi transaksi < 50ms.
  - Indikator status koneksi: Hijau (Online & Tersinkron) dan Kuning (Offline - Berjalan Aman).
  - Sinkronisasi otomatis ke server awan saat internet terhubung kembali tanpa mengganggu kasir.
- **FR-EPIC8-02: [Usulan Tambahan] Pencadangan Ganda & Pemulihan Cepat**
  - Sinkronisasi otomatis di latar belakang saat online.
  - Tombol 1-klik cadangkan ke file arsip terenkripsi / ringkasan Excel langsung ke WhatsApp / Google Drive.
  - Pemulihan data instan di HP baru dalam < 10 detik.

---

## 5. METRIK KEBERHASILAN PRODUK (KEY SUCCESS METRICS)
1. **Kecepatan Transaksi Lansia:** Waktu rata-rata satu sesi transaksi (3 item barang + bayar uang pas/pecahan) selesai dalam kurun waktu **< 30 detik** oleh pengguna usia 50+.
2. **Nol Selisih Kas Harian:** Tingkat rekonsiliasi kas laci mencapai akurasi **> 98%** berkat pencatatan Pinjam Cash, kasbon split, bayar sales dari laci, dan kembalian permen.
3. **Waktu Onboarding Toko Baru:** Pendataan 300 item toko selesai dalam **< 2 jam** memanfaatkan integrasi Katalog Master Bawaan dan Impor Excel.
4. **Ketahanan Offline:** **0% transaksi gagal** akibat pemadaman jaringan internet lokal.

---

## 6. BATASAN PRODUK & RUANG LINGKUP EKSKLUSIF (OUT OF SCOPE)
1. **Tidak Ada Ketergantungan API Berbayar:** Tidak menggunakan layanan cloud vision pihak ketiga (Google Cloud Vision, AWS Rekognition) atau OpenAI API per transaksi.
2. **Tidak Memaksakan Prosedur Korporasi:** Sistem tidak membatasi kasir keluarga untuk melakukan pergantian shift di tengah hari.
3. **Tidak Mengharuskan Instalasi Melalui Toko Aplikasi:** Berjalan sebagai Progressive Web App (PWA) langsung dari browser dengan opsi pasang di layar utama HP.

---
*Dokumen PRD ini mengikat dan terkunci sebagai Baseline Resmi Pengembangan Aplikasi.*