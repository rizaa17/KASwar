# Pasar Pintar v3 · Keputusan penyelarasan & keterlacakan

Versi 3 menggabungkan kode v2 (logika stok, HPP, kasbon, void/retur, outbox sinkronisasi, audit) dengan dokumen baru di `docs/ssot/` (PRD, SRS, Rencana Bertahap, Master 00, Modul 01–05). Dokumen baru adalah sumber kebenaran; dokumen lama hanya sejarah.

## Status verifikasi (jujur)
| Pemeriksaan | Hasil |
|---|---|
| 142 tes logika (`src/lib/*.test.ts`) dijalankan dengan pelari `node:test` + shim `vitest` | Lulus |
| Pemeriksaan tipe TypeScript `strict` seluruh `src/` dengan stub untuk paket pihak ketiga | Lolos, kecuali galat artefak stub |
| `bun run build`, `vitest` asli, tampilan di browser, perangkat keras, Supabase, GitHub Actions | **Belum dijalankan** (sandbox tanpa jaringan). Wajib dicoba di mesin Anda. |

Urutan uji pertama: `bun install && bun run build && bun run test`, buka di browser (tablet landscape ≥ 10 inci), lalu jalankan migrasi dan `supabase/tests/smoke.sql`.

## Keputusan yang diambil
1. **Dokumen baru menggantikan dokumen lama.** `AGENTS.md` diperbarui.
2. **Fitur di luar dokumen baru tidak dihapus, tetapi dimatikan** lewat `state.flags` (Pengaturan, hanya pemilik): `qris`, `ppobProvider`, `aiCloud`, `multiCabang`, `gudang`. Gemini AI cloud mati; penasihat lokal tetap.
3. **Peran:** Pemilik, **Keluarga** (baru), Supervisor, Kasir. Keluarga setara pemilik di kasir dan Pusat Kelola (PIN tetap wajib), tanpa kelola pegawai. Kasir/Supervisor = Mode Pegawai.
4. **Mode Keluarga:** kartu barcode statis berawalan `USR-` (kode unik per anggota) → ganti kasir tanpa PIN dan tanpa hitung kas. Laci dibuka otomatis dengan saldo tutup terakhir. Siapa pun anggota yang berjaga boleh Tutup Laci Harian; hitung fisik opsional. Kartu **tidak** membuka Pusat Kelola.
5. **Mode Pegawai:** modal awal wajib, selisih tutup shift wajib dijelaskan, hanya penanggung jawab menutup. Pegawai tidak dapat bergabung ke laci keluarga (satu laci fisik).
6. **[UANG PAS] hanya mengisi nominal** (Modul 02), tidak menyelesaikan transaksi (SRS berbeda; dipilih yang lebih aman untuk lansia).
7. **Prive, Pinjam Cash, dan bayar hutang sales bukan biaya** di Laba Rugi (prive hanya memo). **Barang rusak/susut** (opname "Basi / rusak / hama", "Susut timbangan") kini mengurangi laba bersih sebesar jumlah × HPP. (Perbaikan terhadap v2 dan dokumen.)
8. **Pinjam Cash** = uang keluar laci (`kind: "pinjam cash"`), pelunasan = uang masuk ke laci yang aktif saat itu. Saldo harapan laci otomatis benar.
9. **Transaksi Kilat** = penjualan tanpa item (`quick: true`); ditandai di laporan "belum dirinci per barang", HPP belum terhitung (laba kotor dari transaksi ini belum ada).
10. **Nominal ke kuantitas:** qty = nominal ÷ harga (tidak dibulatkan), subtotal tepat sama dengan nominal; tampilan 3 desimal.
11. **Impor Excel:** harga jual < modal = merah (sesuai Modul 04). Mode "Perbarui": harga ditimpa, stok ditambah, HPP dihitung moving average bila stok_awal > 0. Grosir tingkat-1 menjadi satuan "Grosir ≥N".
12. **Pencarian suara** memakai Web Speech dan **butuh internet** (di Chrome diproses server Google). Ditandai di UI.
13. **Cadangan:** berkas terenkripsi AES-GCM (PBKDF2-SHA256) `.ppbak`, bagikan lewat menu Bagikan HP (WhatsApp/Drive) bila didukung. Kata sandi tidak dapat dipulihkan.
14. **Data v2 yang sudah ada** dianggap data nyata (`demo=false`); instalasi baru berisi data contoh dengan banner "Mulai Toko Baru".
15. **Keep-alive Supabase** tiga lapis (aplikasi, GitHub Actions, saran cron eksternal). Lihat README backend.

## Keterlacakan terhadap dokumen baru
Legenda: ✅ selesai dan diuji logikanya · 🟡 sebagian · ⬜ belum · 🚫 ditunda karena butuh data/pustaka/perangkat

| Area | Butir | Status | Catatan |
|---|---|---|---|
| Modul 01 | Mode Keluarga (kartu, laci 24 jam, tutup fleksibel) | ✅ | `loginByCard`, `closeShift` mode keluarga |
| | Mode Pegawai (PIN, modal awal, blind count) | ✅ | sudah ada di v2, aturan diperketat |
| | Dua ruang kerja (Kasir / Pusat Kelola) | ✅ | |
| | Biaya 100% gratis, client-side | 🟡 | ekstra berbayar dimatikan; Supabase gratis (Fase B) |
| | Offline-first IndexedDB | 🟡 | snapshot IDB + localStorage (bukan Dexie 13 tabel) |
| Modul 02 | Zero-modal | 🟡 | semua dialog kasir menjadi panel inline; area pemilik masih dialog |
| | Target sentuh ≥ 60px, tipografi | 🟡 | kelas `touch-lg` pada toolbar/bayar/keypad; belum diaudit seluruhnya |
| | Suara kembalian (kata Indonesia) | ✅ | `terbilang()` |
| | Scan Barcode (USB + kamera) | ✅ | ada di v2 |
| | Grid cepat, cari teks, cari suara | ✅ | suara online-only |
| | **Scan Foto (MobileNet)** | 🚫 | butuh TensorFlow.js + alur pelatihan per toko |
| | Curah desimal + nominal Rupiah | ✅ | |
| | Pecahan, Uang Pas, keypad raksasa + shortcut | ✅ | |
| | Kasbon split, limit, WhatsApp | ✅ | |
| | Pinjam Cash | ✅ | |
| | Buku Titipan Nomor (PLN/pulsa) | ✅ | |
| | Hold/Park cart | ✅ | 5 slot (v2) |
| | Transaksi Kilat | ✅ | |
| | Kembalian permen / bulatkan | ✅ | stok permen dipotong; belum memisahkan selisih koin dalam akuntansi |
| Modul 03 | Multi-satuan, grosir bertingkat, HPP moving average | ✅ | v2 |
| | Arus kas laci, hutang sales dari laci, PPOB, konsinyasi | ✅ | v2 |
| | Barang rusak mengurangi laba | ✅ | diperbaiki di v3 |
| | Barang dicari tapi kosong + daftar kulakan | ✅ | masuk daftar kulakan dan teks WhatsApp |
| | Cetak daftar kulakan 58mm | ⬜ | baru WhatsApp/tampilan web |
| | Cetak label kemas ulang 4 unsur | ⬜ | kemas ulang stok ada; label belum |
| | **Katalog 1.000+ SKU** | 🚫 | butuh sumber data barcode yang sah; saluran impor Excel sudah siap |
| Modul 04 | Impor Excel + validasi 3 warna | ✅ | template resmi |
| | 7 laporan Excel | ✅ | SheetJS CE: format angka, tanpa warna sel |
| | PWA offline | 🟡 | ada dari v2; buka-ulang saat offline harus diuji |
| | Cadangan terenkripsi + pemulihan | ✅ | |
| | Cadangan awan otomatis | 🟡 | sinkronisasi Supabase v2; pemulihan akun awan belum diuji |
| Modul 05 | OCR nota (Tesseract), Mesin Wawasan | 🚫 | tidak ada spesifikasi FR |
| | Dexie sebagai penyimpanan | ⬜ | keputusan: tunda; lihat Risiko |

## Risiko dan pekerjaan lanjutan
- **Penyimpanan:** seluruh state disalin ke localStorage (±5 MB) dan snapshot IndexedDB. Untuk data bertahun-tahun, migrasi ke tabel per entitas (Dexie) adalah pekerjaan berikutnya.
- **Printer:** Web Bluetooth hanya BLE; banyak printer 58mm memakai Bluetooth Classic. Siapkan cadangan `window.print()`.
- **iOS Safari:** tanpa Web Bluetooth/USB dan Background Sync; pasang PWA ke layar utama.
- **Sinkronisasi:** migrasi `20261122000005_sync_v3_entities.sql` wajib dijalankan sebelum entitas baru (`loans`, `saved_numbers`, `lost_sales`) disinkronkan.
- **PIN contoh 1234** hanya ada pada data contoh; gunakan "Mulai Toko Baru" sebelum dipakai nyata.
