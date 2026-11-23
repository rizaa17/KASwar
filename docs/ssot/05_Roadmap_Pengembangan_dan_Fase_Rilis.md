# Modul 05: Roadmap Pengembangan, Tech Stack & SOP Diskusi

## 1. Tumpukan Teknologi Rekomendasi (*Tech Stack*)
Selaras dengan prinsip **100% Gratis Tanpa Ketergantungan API Berbayar**:
- **Frontend Core:** React + Vite + TypeScript (PWA Service Worker + Manifest).
- **Komponen UI:** Tailwind CSS + Radix UI / shadcn (desain kontras tinggi & aksesibilitas lansia).
- **Database & Offline Engine:** IndexedDB (melalui Dexie.js atau localforage) untuk offline-first + Supabase / PostgreSQL untuk sinkronisasi awan.
- **Pustaka Dokumen & Utilitas Lokal:**
  - Manipulasi Excel: `SheetJS (xlsx)` — 100% diproses di browser.
  - Scan Barcode Kamera: `@zxing/library` atau `html5-qrcode`.
  - Computer Vision Lokal: `TensorFlow.js` dengan backbone MobileNet ringan (KNN Classifier) untuk pengenalan visual barang curah.
  - OCR Nota Kulakan: `Tesseract.js` (model offline bahasa Indonesia `ind`).
  - Umpan Balik Suara: Native Browser `Web Speech API` (SpeechSynthesis & SpeechRecognition).

---

## 2. Tahapan Rilis & Milestone Pengembangan

```
[ Fase 1: MVP Kasir & Laci Inti ]
   │
   ├── Layar Kasir Ramah Orang Tua (Zero-modal, font raksasa, feedback suara)
   ├── Dual-Mode Laci (Mode Keluarga scan barcode statis vs Mode Pegawai sesi mandiri)
   ├── Input Pembayaran Lengkap (Pecahan uang pas + Keypad manual nominal)
   └── Sistem Kasbon & Pembayaran Campuran (Split: Tunai + Bon Pelanggan)
   │
[ Fase 2: Manajemen Stok & Otomasi Excel ]
   │
   ├── Multi-satuan & Konversi Stok Otomatis
   ├── Perhitungan HPP Moving Average Otomatis
   ├── Impor Stok Massal Excel & Validasi Data
   ├── Unduh 7 Laporan Finansial & Operasional ke Excel
   └── Arus Kas Laci (Beli galon, operasional harian)
   │
[ Fase 3: Fitur Pintar Lokal & Ekosistem Warung ]
   │
   ├── Scan Foto Barang Curah (Client-side visual recognition)
   ├── Modul PPOB (Pulsa/Token) & Konsinyasi (Titipan gorengan/jajanan)
   ├── Baca Nota Kulakan Lokal (Tesseract OCR draf)
   └── Mesin Wawasan Keuangan & Prioritas Kulakan Berbasis Aturan
```

---

## 3. Standar Operasional Prosedur (SOP) Diskusi & Pembaruan Dokumen
Agar diskusi kita tetap fokus, terarah, dan tidak melebar:
1. **Aturan "Diskusi -> Sepakati -> Update Dokumen":**
   - Setiap ide atau perubahan baru dibahas secara mendalam di percakapan.
   - Setelah Anda menyetujui arah solusinya, kita akan memperbarui (*update*) modul `.md` yang bersangkutan.
2. **Kemandirian Modul:**
   - Diskusi antarmuka kasir & pembayaran merujuk ke **Modul 02**.
   - Diskusi stok, HPP & akuntansi merujuk ke **Modul 03**.
   - Diskusi Excel & offline merujuk ke **Modul 04**.
   - Diskusi arsitektur dan laci merujuk ke **Modul 01**.
3. **Dokumen sebagai Sumber Kebenaran Tunggal (*Single Source of Truth*):**
   - Semua keputusan teknis dan logika bisnis yang sudah disepakati terkunci di dalam dokumen ini.
