# Pasar Pintar Kasir v3

Aplikasi kasir web (PWA, offline-first) untuk warung kelontong keluarga: layar kasir ramah lansia, laci keluarga/pegawai, kasbon, Pinjam Cash, stok dan HPP, impor/ekspor Excel, cadangan terenkripsi.

**Sumber kebenaran:** [`docs/ssot/`](docs/ssot/) · **Keputusan, status, keterlacakan:** [`docs/V3-KEPUTUSAN-DAN-KETERLACAKAN.md`](docs/V3-KEPUTUSAN-DAN-KETERLACAKAN.md)

## Mulai
```sh
bun install
bun run dev          # pengembangan
bun run build        # produksi
bun run test         # tes logika (vitest)
```
Instalasi baru berisi **data contoh** (PIN pemilik 1234). Tekan **Mulai Toko Baru** di layar kasir untuk menghapusnya dan membuat pemilik sendiri.

## Deploy (GitHub)
1. Unggah folder ini ke repositori GitHub.
2. Hubungkan ke Lovable (sinkron GitHub) atau host di penyedia yang mendukung TanStack Start/Cloudflare.
3. Opsional awan: isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` (lihat `.env.example`) dan jalankan seluruh migrasi backend. Tanpa itu aplikasi berjalan penuh secara lokal.

## Dokumentasi

Blueprint, spesifikasi WMS, panduan alur, setup, dan roadmap lengkap ada di [`docs/`](docs/README.md). Status Fase 1 ringkas ada di [`roadmap.md`](roadmap.md).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5538c215-1aff-45cf-893c-5597a981cb22).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Menjalankan dan deploy

```bash
bun install && bun dev        # pengembangan lokal (atau npm install && npm run dev)
bun run test                     # tes
bun run build                 # build produksi
```

- **Mode lokal** tidak butuh konfigurasi apa pun.
- **Mode cloud**: salin `.env.example` menjadi `.env`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`, lalu bangun ulang. Backend ada di zip/repo terpisah `pasar-pintar-backend` (lihat README-nya).
- Deploy sebagai situs statis/SSR sesuai konfigurasi Lovable/Vite proyek ini. PWA, printer Bluetooth/USB/Serial, dan kamera hanya bekerja lewat **HTTPS** di Chrome/Edge.
- Panduan uji coba: `docs/UJI-COBA.md`. Status pembangunan: `docs/STATUS-PEMBANGUNAN.md`.
