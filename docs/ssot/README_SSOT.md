# 🛒 Aplikasi Web Kasir Warung Kelontong (Local-First PWA)
> **Sistem Kasir Web Responsif Ramah Lansia (*Senior-Friendly UI*) & Terintegrasi Pengelolaan Laci Keluarga (*Family-Centric*) Berbasis Offline-First.**

[![Status](https://img.shields.io/badge/Status-Approved%20Baseline%20(SSOT)-success.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Progressive%20Web%20App%20(PWA)-blue.svg)]()
[![Cost](https://img.shields.io/badge/API%20Cost-100%25%20Free%20Client--Side-brightgreen.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Offline--First%20(IndexedDB)-orange.svg)]()

---

## 📌 1. Latar Belakang & Visi Produk
Aplikasi ini lahir dari fakta lapangan warung kelontong tradisional Indonesia yang sebagian besar dikelola oleh generasi lanjut usia (usia 50–70 tahun) dengan pola kerja gotong-royong keluarga. Sistem POS ritel modern yang ada saat ini terbukti terlalu rumit, memaksakan prosedur pergantian shift kaku, membebani biaya langganan/API bulanan, dan rentan macet ketika koneksi internet terputus.

Aplikasi ini hadir dengan prinsip pembeda utama:
1. **Antarmuka Ramah Orang Tua (*Senior-Friendly UI*):** Aturan Satu Layar Terbuka (*Zero-Modal Policy*), tombol fisik sentuh raksasa (≥ 60x60 px), font ekstra kontras, tombol pecahan uang Rupiah nyata, dan panduan suara kembalian otomatis Bahasa Indonesia.
2. **Arsitektur Dual-Mode Laci Kasir:**
   - **Mode Keluarga (*Family Shared Drawer*):** Satu laci bersama 24 jam, pergantian kasir instan via barcode statis tanpa serah-terima/hitung kas kaku, dan siapapun anggota keluarga boleh menutup laci harian.
   - **Mode Pegawai (*Strict Shift Drawer*):** Akuntabilitas individu (1 pegawai = 1 laci sesi), login ID + PIN, wajib modal awal, dan tutup shift dengan *blind cash count*.
3. **100% Bebas Biaya API Berkelanjutan (*Client-Side Execution*):** Pengenalan foto barang curah, pembacaan barcode, voice-to-text, kalkulasi HPP, dan olah data Excel berjalan murni di peramban (*browser*) gawai pengguna.
4. **Offline-First Nyata (IndexedDB):** Beroperasi normal tanpa gangguan saat internet padam dengan latensi transaksi lokal < 50ms.

---

## ✨ 2. Fitur Utama Sistem

### 🎯 A. Layar Kasir Ramah Lansia & 3 Jalur Input Barang
- **Zero-Modal Canvas:** Kolom pencarian/kamera, keranjang belanja, dan panel pembayaran berada berdampingan pada satu layar pandang tanpa dialog pop-up bertingkat.
- **Sinergi 3 Jalur Input:**
  1. *Scan Foto Barang Curah:* Klasifikasi visual lokal (*TensorFlow.js MobileNet*) untuk telur, beras, cabai, sayur, kerupuk; memunculkan 3 kartu rekomendasi terbesar untuk konfirmasi 1-ketuk.
  2. *Scan Barcode Pabrik:* Membaca barcode scanner tembak fisik (USB/Bluetooth *keyboard wedge*) dan kamera bawaan HP (*ZXing*).
  3. *Quick-Picker Grid & Suara:* 15–25 item terlaris siap ketuk, pencarian teks instan, dan pencarian suara (*Web Speech API*).
- **Fallback Mulus:** Tombol barcode dan pencarian manual selalu tampak di samping kamera jika pengenalan foto ragu atau barcode produk rusak.
- **Konversi Curah Nominal Rupiah:** Pembeli bilang *"Beli beras Rp 15.000"* -> kasir ketik 15000 -> sistem otomatis mengonversi kuantitas desimal (misal 1.00 kg).

### 💵 B. Alur Pembayaran, Kembalian & Suara
- **Tombol Pecahan Uang Fisik Rupiah:** Tombol cepat Rp 2.000 s.d. Rp 100.000.
- **Tombol Instan [UANG PAS]:** Satu ketukan untuk menyelesaikan transaksi jika uang pas diterima.
- **Keypad Manual Raksasa:** Tombol angka besar dengan penambah cepat (`+1.000`, `+10.000`, `+50.000`).
- **Kembalian Raksasa & Audio TTS:** Angka kembalian 36–48px hijau terang dengan pelafalan suara otomatis Bahasa Indonesia (*Web Speech Synthesis*).

### 🤝 C. Manajemen Kasbon & Pembayaran Campuran (Split Payment)
- **Split Payment (Tunai + Bon):** Bayar sebagian tunai (masuk laci) dan sisanya otomatis dibukukan ke piutang pelanggan.
- **Buku Kasbon Tetangga:** Profil pelanggan, riwayat belanja, batas kredit (*credit limit*), dan pencatatan cicilan/pelunasan langsung ke laci kas.
- **Tagihan WhatsApp 1-Klik:** Draf rincian transaksi dan sisa hutang tersusun otomatis menuju aplikasi WhatsApp pelanggan.

### 🏪 D. Operasional Khusus Warung Kelontong
- **Fitur "Pinjam Cash":** Form ringkas 3 kolom (Nama, Nominal, Keterangan) untuk talangan kurir COD atau pinjaman uang laci sementara tanpa merusak pembukuan laba.
- **Buku Titipan Nomor Pelanggan:** Menyimpan ID meteran listrik PLN dan nomor HP tetangga langganan dekat menu kasir untuk pengisian token/pulsa satu ketukan.
- **Tahan Belanjaan (*Hold / Park Cart*):** Mengesampingkan keranjang pembeli yang pamit mengambil barang lain; layar kasir bersih melayani antrean di belakang; pulihkan keranjang kapan saja tanpa scan ulang.
- **[Usulan Tambahan] Transaksi Kilat / Quick Cash:** Mode antrean panik jam sibuk: ketik nominal uang masuk laci dalam < 3 detik tanpa pilih barang.
- **[Usulan Tambahan] Kembalian Permen & Pembulatan Koin:** Tombol potong stok permen atau pembulatan amal saat warung kehabisan koin receh.

### 📦 E. Manajemen Stok, HPP & Keuangan
- **Multi-Satuan Bertingkat:** Hierarki satuan (Dus -> Renceng -> Sachet) dengan pemotongan stok otomatis ke satuan dasar terkecil.
- **Harga Grosir Bertingkat (*Tiered Pricing*):** Diskon kuantitas terhitung otomatis di keranjang.
- **Cetak Label Kemas Ulang Sembako (58mm/80mm):** Wajib 4 unsur (Nama Barang, Berat Nyata Tebal, Harga, Barcode Toko).
- **HPP Moving Average Otomatis:** Perhitungan modal dasar bergerak saat kulakan baru dengan proteksi stok minus.
- **Arus Kas Laci (*Cash In / Cash Out*):** Beli air galon, tabung gas, iuran lingkungan, dan prive pemilik warung.
- **Daftar Belanja Kulakan On-Demand:** Tombol fleksibel menarik barang menipis dan barang kosong dicari pembeli; format cetak struk saku 58mm atau tampilan web HP.
- **Hutang Sales Tempo ("Siap Bayar Fleksibel"):** Bayar faktur distributor mendadak langsung dari laci aktif saat sales menagih.
- **PPOB & Konsinyasi:** Pemisahan margin pulsa/token dan bagi hasil titipan gorengan/jajanan pasar.
- **[Usulan Tambahan] Katalog Master Warung Bawaan:** Basis data 1.000+ SKU barang umum Indonesia; daftarkan produk baru < 5 detik cukup masukkan harga jual.

### 📊 F. Impor-Ekspor Excel & Arsitektur Data
- **Impor Massal Excel (.xlsx / .csv):** Template 9 kolom resmi; pembacaan lokal di browser via *SheetJS*; validasi visual 3 warna (hijau, kuning, merah).
- **Unduh 7 Modul Laporan Excel:** Laba Rugi, Rincian Transaksi, Valuasi Stok, Buku Kasbon, Hutang Sales, PPOB & Konsinyasi, serta Log Rusak/Hilang.
- **[Usulan Tambahan] Pencadangan Ganda & Pemulihan Instan:** Tombol kompresi database ke arsip aman kirim ke WhatsApp / Google Drive; pemulihan di HP baru < 10 detik.

---

## 🛠️ 3. Tumpukan Teknologi (Tech Stack)

| Lapisan Sistem | Teknologi / Pustaka | Peran & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite + TypeScript | Performa cepat, bundle ringan, dan keandalan tipe data (*strict mode*). |
| **Styling & Komponen** | Tailwind CSS + Radix UI / shadcn | Desain kontras tinggi (WCAG AAA) dan target sentuh besar untuk lansia. |
| **Penyimpanan Lokal** | IndexedDB via **Dexie.js** | Basis data transaksi lokal NoSQL berkecepatan tinggi (latensi < 50ms). |
| **PWA & Offline** | Service Worker + Web App Manifest | Berjalan tanpa internet dan dapat dipasang di layar utama smartphone/tablet. |
| **Pemrosesan Excel** | **SheetJS (xlsx)** | Baca dan tulis file Excel 100% di browser tanpa dependensi server backend. |
| **Pemindai Barcode** | **@zxing/library** & Keyboard Wedge | Pemindaian barcode 1D (EAN-13, UPC) & QR via kamera dan scanner tembak USB/BT. |
| **Klasifikasi Visual** | **TensorFlow.js + MobileNet** | Model klasifikasi lokal ringan untuk mendeteksi barang curah tanpa API cloud. |
| **Umpan Balik Suara** | Native **Web Speech API** | Suara Text-to-Speech kembalian berbahasa Indonesia dan Speech Recognition. |
| **Cetak Struk/Label** | Web Bluetooth / Web USB ESC-POS | Mencetak struk transaksi, daftar kulakan, dan label barcode 58mm/80mm. |
| **Backend & Sync (Fase B)** | **Supabase (PostgreSQL)** | Sinkronisasi data latar belakang dan pencadangan awan terpusat saat online. |

---

## 📁 4. Struktur Direktori Proyek (Project Structure)

```text
pos-warung-kelontong/
├── public/
│   ├── favicon.ico
│   ├── manifest.json              # Konfigurasi PWA installable
│   ├── models/                    # Model TensorFlow.js lokal (MobileNet)
│   └── sounds/                    # Efek audio scanner beep
├── src/
│   ├── assets/                    # Ikon dan ilustrasi grafis
│   ├── components/                # Komponen antarmuka (UI Components)
│   │   ├── common/                # Tombol raksasa, keypad, badge status
│   │   ├── cashier/               # Zero-modal canvas, cart, scanner view
│   │   ├── payment/               # Pecahan rupiah, kembalian TTS, split kasbon
│   │   ├── drawer/                # Mode keluarga vs mode pegawai, blind cash count
│   │   ├── stock/                 # Multi-satuan, label kemas ulang, kulakan list
│   │   └── admin/                 # Pusat kelola, impor/ekspor Excel
│   ├── db/                        # Lapisan Penyimpanan Lokal (IndexedDB)
│   │   ├── schema.ts              # Definisi 13 tabel Dexie.js
│   │   ├── database.ts            # Inisialisasi basis data Dexie
│   │   └── masterCatalogSeed.ts   # Data bawaan 1.000+ SKU barang umum
│   ├── hooks/                     # Custom React Hooks
│   │   ├── useBarcodeScanner.ts   # Listener hardware wedge & kamera
│   │   ├── useSpeechSynthesis.ts  # Pelafalan suara kembalian bahasa Indonesia
│   │   ├── useOfflineSync.ts      # Status koneksi & antrean sinkronisasi
│   │   └── useCart.ts             # Logika keranjang & hold/park cart
│   ├── services/                  # Modul Komputasi Sisi Klien
│   │   ├── excelService.ts        # Impor & ekspor 7 modul laporan via SheetJS
│   │   ├── visualModelService.ts  # Inferensi TensorFlow.js barang curah
│   │   ├── hppCalculation.ts      # Rumus HPP moving average otomatis
│   │   └── printerService.ts      # Format cetak ESC/POS 58mm/80mm
│   ├── types/                     # Definisi tipe TypeScript
│   │   ├── product.ts
│   │   ├── transaction.ts
│   │   ├── drawer.ts
│   │   └── kasbon.ts
│   ├── App.tsx                    # Rute & Pembagian Ruang Kerja Kasir / Admin
│   ├── main.tsx                   # Titik masuk aplikasi
│   └── service-worker.ts          # Cache offline PWA & background sync
├── docs/                          # Dokumen Acuan Sumber Kebenaran Mutlak (SSOT)
│   ├── 00_Master_Rencana_Pengembangan_Aplikasi.md
│   ├── 01_Arsitektur_dan_Prinsip_Desain.md
│   ├── 02_Layar_Kasir_Transaksi_dan_Kasbon.md
│   ├── 03_Manajemen_Stok_HPP_dan_Keuangan.md
│   ├── 04_Impor_Ekspor_Data_dan_Offline_PWA.md
│   ├── 05_Roadmap_Pengembangan_dan_Fase_Rilis.md
│   ├── Dokumen_PRD_POS_Warung_Kelontong.md
│   ├── Dokumen_SRS_POS_Warung_Kelontong.md
│   └── Dokumen_Rencana_Pengembangan_Bertahap_POS_Warung.md
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 5. Panduan Menjalankan Proyek (Quick Start Guide)

### Prasyarat Sistem
- **Node.js:** Versi 18.x atau lebih baru.
- **Manajer Paket:** `npm` atau `pnpm`.
- **Peramban Rekomendasi:** Google Chrome / Edge (Chromium) versi terbaru untuk mendukung Web Speech API, Web Bluetooth/USB, dan PWA.

### Langkah Instalasi & Menjalankan Mode Development
```bash
# 1. Masuk ke direktori proyek
cd pos-warung-kelontong

# 2. Pasang seluruh dependensi proyek
npm install

# 3. Jalankan server pengembangan lokal (Vite)
npm run dev
```
Setelah dijalankan, buka peramban di alamat: `http://localhost:5173`.

### Pengujian Mode Offline PWA
1. Buka *Chrome DevTools* (`F12`) -> Tab **Application**.
2. Masuk ke menu **Service Workers**.
3. Centang opsi **Offline**.
4. Lakukan penambahan item barang, pencatatan transaksi kasir, dan pengecekan stok: seluruh fitur tetap berjalan lancar melalui IndexedDB lokal.

### Membangun Versi Produksi (*Production Build*)
```bash
npm run build
npm run preview
```

---

## 📋 6. Kriteria Pengujian & Keberhasilan (Acceptance Criteria)

1. **Uji Pengguna Lansia (Usia 50–70 Tahun):**
   - Transaksi 3 barang belanjaan dengan pembayaran uang pas/pecahan dapat diselesaikan dalam waktu **< 30 detik**.
   - Target tombol fisik minimal 60x60 px dan bebas dari dialog modal pop-up bertumpuk.
   - Angka kembalian terbaca jelas (36–48px hijau) dan terdengar suara konfirmasi nominal dalam Bahasa Indonesia.
2. **Uji Rekonsiliasi Laci Kasir:**
   - Mode Keluarga dapat berganti penjaga secara instan menggunakan kartu barcode statis tanpa mengunci laci kas.
   - Mode Pegawai mewajibkan input modal awal dan rekonsiliasi *blind cash count* saat tutup shift.
   - Seluruh mutasi kas bon split, pinjam cash, dan bayar sales dari laci tercatat transparan dengan selisih kas fisik nihil.
3. **Uji Kemandirian Offline & Biaya:**
   - 0% kegagalan transaksi saat internet mati.
   - 0 panggilan API berbayar eksternal.

---

## 📚 7. Daftar Dokumen Spesifikasi Resmi (SSOT)
Setiap keputusan fungsional dan teknis mengacu secara ketat pada dokumen-dokumen resmi berikut:
- **Dokumen PRD:** `Dokumen_PRD_POS_Warung_Kelontong.md`
- **Dokumen SRS:** `Dokumen_SRS_POS_Warung_Kelontong.md` (Standar IEEE 830)
- **Rencana Bertahap:** `Dokumen_Rencana_Pengembangan_Bertahap_POS_Warung.md`
- **Dokumen Master:** `00_Master_Rencana_Pengembangan_Aplikasi.md`
- **Modul 01:** `01_Arsitektur_dan_Prinsip_Desain.md`
- **Modul 02:** `02_Layar_Kasir_Transaksi_dan_Kasbon.md`
- **Modul 03:** `03_Manajemen_Stok_HPP_dan_Keuangan.md`
- **Modul 04:** `04_Impor_Ekspor_Data_dan_Offline_PWA.md`
- **Modul 05:** `05_Roadmap_Pengembangan_dan_Fase_Rilis.md`

---

## 👤 Pemilik Proyek (Project Owner)
- **Nama:** Riza Raditya
- **Lisensi:** Kepemilikan Penuh & Mandiri (*Private Proprietary*)

---
*Dokumen README ini mengikat sebagai gambaran komprehensif implementasi proyek.*