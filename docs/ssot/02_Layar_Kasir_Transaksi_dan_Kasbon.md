# Modul 02: Layar Kasir, Transaksi & Manajemen Kasbon

## 1. Prinsip Desain Antarmuka Ramah Orang Tua (*Senior-Friendly UI*)
1. **Aturan "Satu Layar Terbuka" (*Zero-Modal Policy*):**
   - Kolom pencarian/scanner, daftar belanjaan (keranjang), dan panel pembayaran berada pada satu kanvas pandang tanpa pop-up yang menutupi informasi penting.
2. **Ukuran Fisik & Tipografi:**
   - Target sentuh tombol utama minimal `60 x 60 px` dengan *padding* lebar untuk menghindari salah tekan jemari lansia.
   - Ukuran font teks nama barang minimal `18px`, total belanja `28px`, dan angka kembalian raksasa `36px–48px` berlatar kontras tinggi.
3. **Umpan Balik Suara & Getar (*Multimodal Feedback*):**
   - Suara *beep* instan saat barcode atau foto berhasil teridentifikasi.
   - Pembacaan suara otomatis (*Web Speech Synthesis Bahasa Indonesia*) untuk nominal kembalian, misal: *"Kembalian dua puluh lima ribu rupiah"*.

---

## 2. Sinergi 3 Jalur Input Barang & Mekanisme Cadangan (*Fallback*)
Antarmuka kasir menyediakan 3 metode input barang yang bekerja berdampingan secara fleksibel:

```
                  ┌─────────────────────────────────────────┐
                  │          INPUT BARANG KE KASIR          │
                  └────────────────────┬────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
 [ 1. SCAN FOTO BARANG ]     [ 2. SCAN BARCODE ]          [ 3. PILIH / CARI MANUAL ]
  - Khusus barang curah/      - Scanner USB/Bluetooth     - Grid tombol bergambar
    tanpa kemasan (telur,       atau kamera barcode         (barang terlaris)
    beras, kerupuk, sayur)    - Kemasan pabrik standar    - Kolom ketik nama/kode
  - 3 Rekomendasi Teratas                                 - Pencarian Suara (Mic)
        │                              │                              ▲
        │ (Jika foto gagal/ragu)       │ (Jika barcode rusak/rusak)   │
        └──────────────────────────────┴──────────────────────────────┘
```

### 2.1 Jalur 1: Scan Foto Barang (*Visual Recognition Client-Side*)
- **Fungsi Utama:** Mengenali barang curah, hasil bumi, atau barang eceran yang tidak memiliki kemasan/barcode pabrik (misal: telur kiloan, beras karungan, bawang, cabai, bumbu sachet tanpa kode, kerupuk blek).
- **Logika 3 Rekomendasi Teratas:** Kamera mengidentifikasi objek dan langsung menampilkan 3 kartu pilihan foto berukuran besar (contoh: `[Telur Ayam]` `[Telur Puyuh]` `[Telur Bebek]`).
- **Satu Ketukan Konfirmasi:** Kasir orang tua cukup mengetuk 1 kartu foto untuk memasukkan ke keranjang. Tanpa *auto-add* otomatis guna mencegah salah input.

### 2.2 Jalur 2: Scan Barcode Produk (*Hardware & Camera*)
- **Dukungan Perangkat Keras:** Langsung membaca sinyal dari barcode scanner tembak fisik (USB / Bluetooth *keyboard wedge*) tanpa perlu klik layar terlebih dahulu.
- **Kamera Barcode:** Menggunakan modul kamera bawaan HP/tablet untuk memindai barcode 1D (EAN-13, UPC) dan QR code secara instan.
- **Kasus Penggunaan:** Barang-barang pabrik standar (mie instan, sabun, sampo, minuman botol, rokok).

### 2.3 Jalur 3: Pilih Manual / Grid Cepat & Pencarian Teks/Suara (*Fallback Utama*)
- **Tombol Pintas Bergambar (*Quick-Picker Grid*):** Sederetan kartu produk berukuran besar untuk 15–25 barang paling laris (*fast-moving items*) yang selalu siap diketuk langsung di layar kasir.
- **Pencarian Manual Cepat:** Kolom pencarian teks responsif yang memfilter nama barang secara instan saat diketik.
- **Pencarian Suara (*Voice-to-Text*):** Menekan tombol mikrofon besar dan mengucapkan nama barang ("Minyakita satu liter").

### 2.4 Mekanisme Cadangan Mulus (*Seamless Fallback*)
- Jika **Scan Foto** tidak berhasil mengenali barang (misal karena pencahayaan temaram atau sudut kamera miring), tombol **[Scan Barcode]** dan **[Cari Manual]** tetap terlihat tepat di samping area pratinjau kamera.
- Jika **Barcode Produk** sobek, pudar, atau basah, kasir tidak perlu panik; cukup ketuk tombol foto atau ketik 2–3 huruf nama barang di kolom pencarian manual.

---

## 3. Penanganan Barang Curah & Input Nominal Rupiah
Warung sering melayani pembeli yang membeli berdasarkan nominal uang, bukan takaran desimal:
- **Mode Desimal:** Input kuantitas pecahan langsung (misal `0.25` kg atau `0.5` liter).
- **Mode Nominal Rupiah:** Pembeli bilang *"Beli beras Rp 15.000 ya bu"*. Kasir cukup menekan opsi Rp dan mengetik `15000` (pada harga master Rp 15.000/kg) -> sistem otomatis mengonversi kuantitas menjadi `1.00 kg`.

---

## 4. Alur Pembayaran Fleksibel & Input Nominal Uang
Panel bayar dirancang agar kasir orang tua tidak perlu berhitung di kepala:
1. **Tombol Pecahan Uang Fisik Indonesia:**
   - Tombol satu ketuk untuk pecahan: `Rp 2.000`, `Rp 5.000`, `Rp 10.000`, `Rp 20.000`, `Rp 50.000`, `Rp 100.000`.
   - Tombol cepat **[UANG PAS]** yang langsung mengisi nominal bayar sama dengan total belanja.
2. **Input Nominal Manual (Keypad Raksasa):**
   - Disediakan tombol angka besar (0–9) dan shortcut `+1.000`, `+10.000`, `+50.000` untuk uang kombinasi (misal belanja Rp 33.000, pembeli memberi uang Rp 35.000 atau Rp 53.000).
3. **Layar Konfirmasi Kembalian Raksasa:**
   - Menghitung otomatis: `Kembalian = Uang Diterima - Total Belanja`.
   - Warna teks hijau cerah dengan angka ekstra tebal.

---

## 5. Fitur Kasbon & Pembayaran Campuran (*Split Payment*)
Fitur krusial untuk warung tradisional di mana hubungan tetangga mengizinkan hutang belanja.

### 5.1 Skenario Pembayaran Sebagian Tunai & Sebagian Kasbon
Sistem mendukung penuh transaksi di mana pembeli hanya memiliki sebagian uang tunai dan sisanya dicatat sebagai hutang/bon.
- **Contoh Kasus Riil:**
  - Total Belanja: `Rp 85.000`
  - Pembeli bayar tunai: `Rp 50.000`
  - Sisa yang belum dibayar: `Rp 35.000`
  - Tombol **[Jadikan Kasbon]** aktif saat nominal bayar tunai lebih kecil dari total belanja.
  - Kasir memilih nama pelanggan terdaftar (misal: "Pak Budi - RT 03").
  - Sistem mencatat:
    - Kas Laci Masuk: `+ Rp 50.000`
    - Piutang Kasbon Pak Budi: `+ Rp 35.000`
    - Status Transaksi: `Lunas Sebagian (Split: Tunai + Kasbon)`

### 5.2 Buku Kasbon Pelanggan
1. **Profil Pelanggan Kasbon:** Nama, No. WhatsApp, Alamat/Catatan Rumah (misal: "Rumah cat hijau depan pos ronda"), dan Batas Maksimal Hutang (*Credit Limit*).
2. **Peringatan Limit:** Jika sisa hutang baru melebihi limit, sistem menampilkan peringatan kuning ramah (namun tetap dapat diizinkan pemilik warung).
3. **Alur Pelunasan / Cicilan Kasbon:**
   - Pelanggan dapat membayar cicilan kapan saja melalui menu Kasbon.
   - Uang pelunasan otomatis masuk ke kas laci aktif saat itu sebagai `Kas Masuk - Pelunasan Kasbon`.
4. **Kirim Rincian via WhatsApp:** Satu tombol untuk mengirim draf pesan rekap rincian belanjaan dan sisa hutang ke WhatsApp pembeli secara sopan.

---

## 6. Fitur "Pinjam Cash" (Talangan & Pinjaman Sementara Laci)
Fenomena nyata di mana kasir mengeluarkan uang tunai dari laci untuk kebutuhan pihak ketiga yang sifatnya sementara dan akan segera dikembalikan.
- **Form Super Sederhana (3 Kolom):**
  1. `Nama Orang` (Contoh: "Mas Danang J&T", "Bu RT", "Pak Joko")
  2. `Nominal Uang` (Contoh: `Rp 65.000`)
  3. `Keterangan Singkat` (Contoh: "Talangan COD Paket Sepatu", "Pinjam uang kembalian sayur")
- **Pengaruh pada Laci:** Saldo fisik laci berkurang dan tercatat rapi sebagai `Pinjam Cash Aktif` (bukan pengeluaran/biaya warung).
- **Pengembalian Dana:** Ketika tetangga datang menebus paket atau orangnya mengembalikan uang, kasir cukup menekan tombol **[Kembalikan ke Laci / Lunas]**. Uang kembali tercatat masuk laci dan status pinjaman ditutup.

---

## 7. Buku Titipan Nomor Pelanggan (Token PLN & Pulsa Langganan)
Terletak persis di samping menu kasir / transaksi PPOB untuk memecahkan kebiasaan tetangga yang sering lupa nomor rekening listrik atau HP.
- **Daftar Kontak Cepat Tetangga:**
  - Kasir mencari berdasarkan nama panggilan (misal: "Bu Siti RT 02", "Pak Haji Somad").
  - Menampilkan kartu ringkas berisi:
    - **ID Pelanggan PLN / No. Meteran Listrik**
    - **Nomor HP / Operator**
- **Satu Ketukan Isi (*One-Tap Fill*):** Cukup ketuk nomor yang tersimpan, sistem langsung mengisi formulir pembelian token/pulsa tanpa kasir orang tua harus mengetik ulang 11–12 digit angka yang rawan salah.

---

## 8. Fitur Tahan Belanjaan / Kesampingkan Keranjang (*Hold / Park Cart*)
Memecahkan masalah klasik warung: barang belanjaan pembeli pertama sudah di-scan sebagian, namun pembeli pamit mengambil barang lain yang tertinggal sementara antrean pembeli lain di belakang sudah menumpuk.
- **Tombol Satu Ketuk:** Kasir cukup menekan tombol besar **[Kesampingkan Belanjaan (Antrean Baru)]**.
- **Penyimpanan Slot Sementara:** Seluruh barang yang sudah di-scan disimpan ke dalam tab antrean gantung (contoh: *"Antrean #1 - 4 Barang (Rp 32.000)"*).
- **Layar Bersih Seketika:** Layar kasir langsung kosong dan siap melayani pembeli kedua di belakangnya tanpa menunda waktu.
- **Pemulihan Mulus (*Resume Cart*):** Begitu pembeli pertama kembali membawa barang tambahannya, kasir cukup mengetuk kartu *"Antrean #1"*. Semua barang sebelumnya langsung kembali ke keranjang tanpa perlu hapus atau scan ulang dari nol; kasir tinggal menambahkan barang barunya.

---

## 9. [Usulan Tambahan] Fitur Transaksi Kilat / Quick Cash (Mode Antrean Panik)
- **Tujuan:** Mencegah kasir orang tua panik dan mematikan aplikasi saat warung tiba-tiba diserbu banyak pembeli sekaligus (misal jam sibuk sore hari membeli es batu, rokok eceran, atau obat).
- **Mekanisme Kerja:**
  - Kasir menekan tombol darurat **[Transaksi Kilat (Tanpa Pilih Barang)]**.
  - Kasir hanya perlu mengetik total uang yang diterima pembeli (misal: `12000`) lalu menekan tombol besar **[Terima Tunai Masuk Laci]**.
  - Transaksi langsung selesai dalam 3 detik, uang laci fisik tercatat resmi `+Rp 12.000`, dan antrean tidak macet.
  - Penyesuaian stok barang fisik dapat dilakukan nanti saat warung kembali santai/tutup toko.

---

## 10. [Usulan Tambahan] Fitur Kembalian Permen & Pembulatan Koin
- **Masalah:** Warung sering kehabisan uang koin receh Rp 500 atau Rp 1.000, lalu menggantinya dengan permen atau pembeli merelakan uang kembalian. Hal ini menyebabkan selisih antara uang fisik di laci dan catatan pembukuan sistem di malam hari.
- **Solusi Dua Opsi Cepat:**
  1. **Tombol [Kembalian Pakai Permen]:** Nominal kembalian uang laci dianggap selesai, dan sistem secara otomatis memotong stok permen warung sebanyak 1–2 butir (stok permen tercatat resmi, uang laci tetap cocok sempurna).
  2. **Tombol [Bulatkan Kembalian]:** Digunakan saat pembeli berujar *"simpan saja kembaliannya"* atau disumbangkan ke kotak amal warung, sehingga pencatatan arus kas laci tetap seimbang.
