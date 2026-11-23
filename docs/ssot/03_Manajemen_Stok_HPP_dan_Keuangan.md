# Modul 03: Manajemen Stok, HPP & Keuangan Warung

## 1. Manajemen Produk, Satuan Bertingkat & Label Kemas Ulang
Warung kelontong membeli dalam jumlah besar (dus/bal/slop) dan menjual dalam satuan eceran yang bervariasi.

### 1.1 Multi-Satuan & Konversi Otomatis
- Setiap produk memiliki **Satuan Dasar Terkecil** (misal: `Pcs / Bungkus / Butir`).
- Mendukung hierarki satuan:
  - Contoh Kopi Instan: `1 Dus = 10 Renceng = 100 Sachet`.
  - Kasir dapat menjual per `Sachet`, per `Renceng`, atau per `Dus`. Sistem otomatis memotong stok dasar sachet secara akurat.
- **Harga Grosir Bertingkat (*Tiered Pricing*):**
  - Pembelian 1–2 pcs: Rp 3.500 / pcs
  - Pembelian 3–9 pcs: Rp 3.200 / pcs
  - Pembelian >= 10 pcs: Rp 3.000 / pcs
  - Kasir tidak perlu mengingat diskon grosir; sistem menghitung otomatis berdasarkan kuantitas di keranjang.

### 1.2 Cetak Label & Barcode Kemas Ulang (*Re-Packing Sembako*)
Warung sering mengemas sendiri komoditas curah (gula pasir, minyak goreng plastik, terigu, kerupuk, kacang).
- **Aturan Wajib Label Harga & Barcode:**
  Untuk mencegah kerugian akibat salah tempel atau salah ambil (misal kemasan 1 kg tertukar dengan 1/2 kg), label wajib memuat 4 unsur jelas:
  1. **Nama Barang Lengkap** (contoh: "Gula Pasir Gulaku")
  2. **Varian Berat / Ukuran Nyata** (contoh: **1 KG** atau **1/2 KG** dengan cetakan ekstra tebal)
  3. **Harga Jual Rupiah** (contoh: "Rp 17.500")
  4. **Barcode Mini Warung** (bisa dipindai langsung dengan scanner kasir)
- **Kompatibilitas Cetak:** Dapat langsung dicetak ke kertas struk termal atau stiker label mini ukuran 58mm / 80mm menggunakan printer kasir warung tanpa perlu printer kantor mahal.

---

## 2. Perhitungan HPP Otomatis (*Moving Average*)
Harga kulakan barang di pasar/agen sering berfluktuasi. Sistem menggunakan metode **Rata-Rata Bergerak (*Moving Average*)** untuk menghitung modal dasar secara akurat.

### Rumus Matematis:
$$\text{HPP Baru} = \frac{(\text{Stok Lama} \times \text{HPP Lama}) + (\text{Qty Beli Baru} \times \text{Harga Beli Baru})}{\text{Stok Lama} + \text{Qty Beli Baru}}$$

### Penanganan Kondisi Khusus:
- Jika stok lama `<= 0` (akibat penjualan mendahului input kulakan), HPP baru langsung disetel ke `Harga Beli Baru`.
- Tidak ada pembagian dengan nol (*zero division protection*).

---

## 3. Arus Kas Laci (*Cash In / Cash Out*)
Di warung, uang di laci kasir sering terpakai untuk keperluan operasional mendadak. Jika tidak dicatat, rekonsiliasi tutup laci akan selalu mengalami selisih.
- **Kategori Kas Keluar (*Cash Out*):**
  - Pembelian air galon / gas LPG warung.
  - Bayar iuran kebersihan / keamanan lingkungan.
  - Pengambilan pribadi (*Prive*) pemilik warung.
- **Kategori Kas Masuk (*Cash In*):**
  - Tambah modal kembalian di laci.
  - Pelunasan kasbon pelanggan.
  - Pendapatan lain-lain warung.
- **Pengaruh pada Laci:** Semua arus kas ini mempengaruhi saldo akhir fisik laci tanpa tercampur dengan laba kotor penjualan barang.

---

## 4. Retur, Barang Rusak & Daftar Belanja Kulakan Fleksibel
1. **Pencatatan Barang Rusak / Kedaluwarsa (*Waste & Spoilage*):**
   - Barang pecah, bocor, melempem, atau kedaluwarsa dicatat khusus.
   - Sistem memotong stok dan membukukannya sebagai **Beban Kerugian Barang Rusak** (mengurangi laba bersih).
2. **Retur & Tukar Barang:**
   - Pelanggan menukar barang salah atau rusak dengan barang baru atau uang tunai.
3. **Catatan Barang Kosong (*Lost Sales Tracker*):**
   - Tombol satu ketuk *"Barang Dicari Tapi Kosong"* saat pembeli menanyakan barang yang belum dijual atau habis stok.
4. **Daftar Belanja Kulakan Fleksibel (*On-Demand Shopping List*):**
   - Pemilik warung tidak belanja setiap hari. Tombol **[Buat Daftar Kulakan Sekarang]** dapat ditekan kapan pun pemilik berniat pergi ke pasar induk atau agen grosir.
   - Sistem otomatis menarik data:
     - Barang dengan sisa stok di bawah batas minimum (*low stock*).
     - Barang kosong yang sering ditanyakan pembeli dalam beberapa hari terakhir.
   - **Format Output:** Dapat langsung dicetak ke printer struk 58mm (seperti kertas bon kecil yang masuk saku baju) atau dibuka dalam tampilan web ringkas di HP selama di pasar.

---

## 5. Manajemen Hutang Sales & Distributor ("Siap Bayar Fleksibel")
Sales keliling distributor (Wings, Unilever, Indofood, Mayora, rokok) memiliki jadwal kedatangan yang tidak pasti (bisa seminggu sekali, bisa dua minggu atau sebulan sekali).

### 5.1 Pencatatan Faktur Sales per Distributor
- Sistem mencatat nota kulakan tempo berdasarkan **Nama Distributor / Sales** (contoh: "Sales Roda Mas - Wings", "Sales Rokok Sampoerna").
- Mencatat: Nomor Nota/Faktur, Tanggal Terima Barang, dan Total Tagihan Belum Lunas.

### 5.2 Alur Pembayaran Cepat Saat Sales Tiba-Tiba Datang
- Ketika sales mendadak datang ke warung untuk menagih:
  1. Kasir / pemilik cukup memilih nama distributor di layar ringkas.
  2. Layar langsung memunculkan **Total Tagihan Siap Bayar** beserta rincian faktur yang belum lunas.
  3. Pemilik dapat membayar penuh atau mencicil menggunakan uang kas laci aktif dengan tombol **[Bayar Tagihan Sales dari Laci]**.
  4. Uang laci otomatis terpotong resmi sehingga saat tutup laci malam hari kas tidak mengalami selisih misterius.

---

## 6. Ekosistem Warung: PPOB & Konsinyasi
1. **PPOB (Produk Digital Tanpa Stok Fisik):**
   - Penjualan pulsa, token listrik, paket data, dan top-up e-wallet.
   - Pemisahan margin: Omzet tidak dihitung dari total nominal token (misal token 100rb modal 100.500 jual 102.500 -> laba Rp 2.000). Uang fisik tetap masuk laci kasir.
2. **Barang Titipan / Konsinyasi:**
   - Warung sering dititipi gorengan, kerupuk kaleng, jajanan pasar.
   - Pencatatan: `Jumlah Titip Pagi`, `Sisa Sore/Malam`, `Terjual = Titip - Sisa`.
   - Sistem menghitung komisi pemilik warung dan jumlah setoran yang wajib diserahkan ke penitip barang.

---

## 7. [Usulan Tambahan] Katalog Master Warung Bawaan (*Pre-loaded Catalog*)
Memecahkan "Jebakan Hari Pertama" (*Day 0 Trap*) di mana pemilik warung menyerah karena harus mengetik 300–800 jenis barang satu per satu.
- **Basis Data Bawaan (1.000+ SKU Produk Umum Indonesia):**
  - Sudah memuat produk terlaris warung kelontong: mie instan (Indomie, Mie Sedaap), bumbu dapur (Royco, Masako, Sasa), sembako pabrikan (Minyakita, Gulaku, Terigu Segitiga Biru), air mineral (Aqua, Le Minerale), rokok umum (Djarum Super, Sampoerna Mild), dan perlengkapan mandi (Lifebuoy, Pantene, Sunlight).
  - Dilengkapi kode barcode pabrik standar, nama produk resmi, kategori, dan gambar contoh.
- **Alur Pendaftaran Cepat (< 5 Detik per Barang):**
  1. Pemilik warung baru cukup mengarahkan scanner ke barcode produk di rak warung.
  2. Sistem otomatis mengenali produk, memunculkan foto, dan mengisi nama barang secara instan.
  3. Pemilik warung **HANYA PERLU mengetik harga jual** di warungnya saja lalu tekan simpan.
- **Dampak Operasional:** Memangkas waktu pendataan awal warung dari 3–5 hari menjadi hanya 1–2 jam.
