/** Utilitas uang dan angka murni (tanpa state) untuk kasir. Rupiah selalu bilangan bulat. */

const SATUAN = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];

function bawahSeribu(n: number): string {
  if (n < 12) return SATUAN[n] ?? "";
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) return `${SATUAN[Math.floor(n / 10)]} puluh${n % 10 ? ` ${SATUAN[n % 10]}` : ""}`;
  const r = Math.floor(n / 100);
  const head = r === 1 ? "seratus" : `${SATUAN[r]} ratus`;
  return n % 100 ? `${head} ${bawahSeribu(n % 100)}` : head;
}

/** Angka bulat ke kata Bahasa Indonesia, mis. 25000 → "dua puluh lima ribu". Dipakai untuk suara kembalian. */
export function terbilang(input: number): string {
  if (!Number.isFinite(input)) return "";
  const n = Math.round(input);
  if (n === 0) return "nol";
  if (n < 0) return `minus ${terbilang(-n)}`;
  const grup: [number, string][] = [[1e12, "triliun"], [1e9, "miliar"], [1e6, "juta"], [1e3, "ribu"]];
  let sisa = n;
  const out: string[] = [];
  for (const [nilai, nama] of grup) {
    const q = Math.floor(sisa / nilai);
    if (q > 0) {
      out.push(nama === "ribu" && q === 1 ? "seribu" : `${bawahSeribu(q)} ${nama}`);
      sisa -= q * nilai;
    }
  }
  if (sisa > 0) out.push(bawahSeribu(sisa));
  return out.join(" ").replace(/\s+/g, " ").trim();
}

/** Kalimat suara kembalian. */
export const kalimatKembalian = (kembalian: number) => (kembalian > 0 ? `Kembalian ${terbilang(kembalian)} rupiah` : "Uang pas. Terima kasih");

/**
 * Pembeli menyebut nominal ("beras Rp 15.000"): kuantitas = nominal / harga satuan.
 * Subtotal dijaga TEPAT sama dengan nominal (qty tidak dibulatkan agar qty × harga = nominal);
 * hanya tampilan yang dibulatkan lewat {@link formatQty}.
 */
export function nominalToQty(nominal: number, hargaSatuan: number): number {
  if (!Number.isFinite(nominal) || !Number.isFinite(hargaSatuan) || nominal <= 0 || hargaSatuan <= 0) return 0;
  return nominal / hargaSatuan;
}

/** Tampilan kuantitas maksimal 3 desimal tanpa nol di ujung (1.154, 0.25, 2). */
export function formatQty(q: number): string {
  if (!Number.isFinite(q)) return "0";
  return String(Math.round(q * 1000) / 1000).replace(".", ",");
}

/** Pembulatan rupiah ke kelipatan step (mis. 500). step ≤ 1 berarti tanpa pembulatan. */
export function roundRupiah(n: number, step = 1): number {
  if (!Number.isFinite(n)) return 0;
  return step > 1 ? Math.round(n / step) * step : Math.round(n);
}

/** Tombol "+" cepat pada keypad: menambah nominal bayar. */
export const SHORTCUTS = [1000, 10000, 50000] as const;

/** Tambah satu digit ke nominal yang sedang diketik, dengan batas wajar (maks Rp 999.999.999). */
export function appendDigit(current: number, digit: number): number {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) return current;
  const next = current * 10 + digit;
  return next > 999_999_999 ? current : next;
}
export const backspaceAmount = (n: number) => Math.floor(Math.max(0, n) / 10);
