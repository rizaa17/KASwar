import { movingAverage, uid, type Product, type Unit } from "./store";

/** Kolom template resmi Modul 04 §1.1. */
export const TEMPLATE_COLUMNS = ["kode_barcode", "nama_barang", "kategori", "satuan_dasar", "harga_beli_modal", "harga_jual_eceran", "harga_grosir_1", "min_qty_1", "stok_awal", "stok_minimum_peringatan"] as const;
export type ImportMode = "baru" | "perbarui";
export type RowStatus = "hijau" | "kuning" | "merah";
export type ParsedItem = { barcode: string; name: string; category: Product["category"]; unit: string; cost: number; price: number; wholesale?: { minQty: number; price: number }; stock: number; minStock: number; generatedBarcode: boolean };
export type RowResult = { row: number; status: RowStatus; messages: string[]; action: "tambah" | "perbarui" | "lewati" | "tolak"; item?: ParsedItem; existingId?: string };

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const CATEGORY: Record<string, Product["category"]> = { curah: "Curah", sembako: "Sembako", minuman: "Minuman", rokok: "Rokok", makanan: "Jajan", jajan: "Jajan", snack: "Jajan", mie: "Jajan" };

/** Angka gaya Indonesia: 17.500 / Rp 17.500 / 17500 / 12,5. null bila bukan angka. */
export function parseNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  let t = v.trim().replace(/^rp\.?\s*/i, "").replace(/\s/g, "");
  if (!t) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d+,\d+$/.test(t)) t = t.replace(",", ".");
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : null;
}

/** Digit cek EAN-13. */
export function ean13Check(body12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(body12[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10;
}
/** Barcode internal warung (rentang awalan 20–29 khusus pemakaian toko): "20" + 10 digit urut + digit cek. */
export function internalBarcode(n: number): string { const body = `20${String(n).padStart(10, "0")}`; return body + ean13Check(body); }
function nextInternal(used: Set<string>, from: number): { code: string; next: number } {
  let n = from; let code = internalBarcode(n);
  while (used.has(code)) { n++; code = internalBarcode(n); }
  return { code, next: n + 1 };
}

const get = (r: Record<string, unknown>, k: string) => {
  const key = Object.keys(r).find((x) => x.trim().toLowerCase() === k);
  return key === undefined ? undefined : r[key];
};
const str = (v: unknown) => (v === undefined || v === null ? "" : typeof v === "number" ? (Number.isInteger(v) ? String(v) : String(v)) : String(v).trim());

/** Validasi baris (hijau valid, kuning peringatan, merah ditolak). Tidak mengubah data. */
export function validateRows(rows: Record<string, unknown>[], existing: Product[], mode: ImportMode): RowResult[] {
  const byBarcode = new Map(existing.filter((p) => p.barcode).map((p) => [p.barcode as string, p]));
  const byName = new Map(existing.map((p) => [norm(p.name), p]));
  const used = new Set(existing.map((p) => p.barcode).filter(Boolean) as string[]);
  const seenBarcode = new Set<string>(); const seenName = new Set<string>();
  let counter = 1;
  return rows.map((r, i): RowResult => {
    const row = i + 2; // baris 1 = judul kolom
    const msgs: string[] = []; const bad: string[] = [];
    const name = str(get(r, "nama_barang"));
    const rawBarcode = get(r, "kode_barcode");
    let barcode = str(rawBarcode);
    if (typeof rawBarcode === "number") msgs.push("Barcode terbaca sebagai angka; pastikan kolom berformat Teks agar nol di depan tidak hilang");
    if (barcode && !/^[0-9A-Za-z\-]{4,20}$/.test(barcode)) { bad.push("Barcode hanya boleh huruf/angka 4–20 karakter"); }
    if (!name) bad.push("Nama barang wajib diisi");
    const cost = parseNumber(get(r, "harga_beli_modal")); const price = parseNumber(get(r, "harga_jual_eceran"));
    if (cost === null || cost < 0) bad.push("Harga beli (modal) wajib angka");
    if (price === null || price < 0) bad.push("Harga jual wajib angka");
    if (cost !== null && price !== null && cost >= 0 && price >= 0 && price < cost) bad.push("Harga jual lebih kecil dari modal");
    const unit = str(get(r, "satuan_dasar")) || "Pcs";
    if (!str(get(r, "satuan_dasar"))) msgs.push("Satuan kosong, dipakai Pcs");
    const catRaw = str(get(r, "kategori"));
    const category = CATEGORY[norm(catRaw)] ?? (catRaw ? undefined : "Sembako");
    if (catRaw && !category) msgs.push(`Kategori "${catRaw}" tidak dikenal, dipakai Sembako`);
    const stockRaw = get(r, "stok_awal"); const minRaw = get(r, "stok_minimum_peringatan");
    const stock = stockRaw === undefined || str(stockRaw) === "" ? 0 : parseNumber(stockRaw); const minStock = minRaw === undefined || str(minRaw) === "" ? 0 : parseNumber(minRaw);
    if (stock === null || stock < 0) bad.push("Stok awal harus angka ≥ 0");
    if (minStock === null || minStock < 0) bad.push("Stok minimum harus angka ≥ 0");
    let wholesale: ParsedItem["wholesale"];
    const gp = parseNumber(get(r, "harga_grosir_1")); const gq = parseNumber(get(r, "min_qty_1"));
    const gGiven = str(get(r, "harga_grosir_1")) !== "" || str(get(r, "min_qty_1")) !== "";
    if (gGiven) {
      if (gp === null || gq === null || gq < 2 || !Number.isInteger(gq)) msgs.push("Harga grosir diabaikan: isi harga dan jumlah minimum (bilangan bulat ≥ 2) bersamaan");
      else if (price !== null && gp >= price) msgs.push("Harga grosir diabaikan: tidak lebih murah dari harga eceran");
      else wholesale = { minQty: gq, price: gp };
    }
    if (bad.length) return { row, status: "merah", messages: bad, action: "tolak" };

    const nameKey = norm(name);
    if (barcode && seenBarcode.has(barcode)) return { row, status: "merah", messages: ["Barcode kembar di dalam file"], action: "tolak" };
    if (seenName.has(nameKey) && !barcode) return { row, status: "merah", messages: ["Nama barang kembar di dalam file"], action: "tolak" };
    const match = (barcode && byBarcode.get(barcode)) || byName.get(nameKey);
    let generated = false;
    if (!barcode) {
      if (match?.barcode) barcode = match.barcode;
      else { const g = nextInternal(used, counter); barcode = g.code; counter = g.next; generated = true; msgs.push("Barcode kosong, dibuatkan barcode warung otomatis"); }
    }
    used.add(barcode); seenBarcode.add(barcode); seenName.add(nameKey);
    const item: ParsedItem = { barcode, name, category: category ?? "Sembako", unit, cost: cost as number, price: price as number, wholesale, stock: stock as number, minStock: minStock as number, generatedBarcode: generated };
    if (!match && !generated && !barcode) msgs.push("");
    if (match) {
      if (mode === "baru") return { row, status: "kuning", messages: [...msgs, `Sudah ada ("${match.name}"), dilewati`], action: "lewati", item, existingId: match.id };
      return { row, status: "kuning", messages: [...msgs, `Sudah ada ("${match.name}"): harga ditimpa, stok ditambah`], action: "perbarui", item, existingId: match.id };
    }
    const similar = existing.find((p) => { const a = norm(p.name); return a !== nameKey && (a.includes(nameKey) || nameKey.includes(a)) && Math.min(a.length, nameKey.length) >= 5; });
    if (similar) msgs.push(`Nama mirip barang yang sudah ada: "${similar.name}"`);
    return { row, status: msgs.filter(Boolean).length ? "kuning" : "hijau", messages: msgs.filter(Boolean), action: "tambah", item };
  });
}

export const summarize = (rs: RowResult[]) => ({ hijau: rs.filter((r) => r.status === "hijau").length, kuning: rs.filter((r) => r.status === "kuning").length, merah: rs.filter((r) => r.status === "merah").length, diimpor: rs.filter((r) => r.action === "tambah" || r.action === "perbarui").length });

const EMOJI: Record<Product["category"], string> = { Curah: "🌾", Sembako: "🛒", Minuman: "🥤", Rokok: "🚬", Jajan: "🍪", Digital: "📱", Paket: "📦" };

/** Terapkan hasil validasi ke daftar produk (murni). Baris merah/lewati tidak disentuh. */
export function applyImport(results: RowResult[], products: Product[]): { products: Product[]; moves: { productId: string; qty: number; reason: string }[]; added: number; updated: number } {
  const list = products.map((p) => ({ ...p }));
  const moves: { productId: string; qty: number; reason: string }[] = [];
  let added = 0; let updated = 0;
  for (const r of results) {
    const it = r.item; if (!it) continue;
    const units: Unit[] = [{ name: it.unit, factor: 1, price: it.price }];
    if (it.wholesale) units.push({ name: `Grosir ≥${it.wholesale.minQty}`, factor: it.wholesale.minQty, price: it.wholesale.price * it.wholesale.minQty });
    if (r.action === "tambah") {
      const id = uid();
      list.push({ id, name: it.name, emoji: EMOJI[it.category], category: it.category, baseUnit: it.unit, stock: it.stock, hpp: it.cost, units, minStock: it.minStock, barcode: it.barcode, createdAt: Date.now() });
      if (it.stock) moves.push({ productId: id, qty: it.stock, reason: "Stok awal · Impor Excel" });
      added++;
    } else if (r.action === "perbarui" && r.existingId) {
      const i = list.findIndex((p) => p.id === r.existingId); if (i < 0) continue;
      const old = list[i];
      const keepUnits = old.units.filter((u) => u.factor > 1 && !u.name.startsWith("Grosir"));
      list[i] = { ...old, barcode: old.barcode ?? it.barcode, baseUnit: old.baseUnit, hpp: it.stock > 0 ? movingAverage(old.stock, old.hpp, it.stock, it.cost) : it.cost, stock: old.stock + it.stock, minStock: it.minStock || old.minStock, units: [{ ...(old.units[0] ?? { name: it.unit, factor: 1, price: it.price }), price: it.price }, ...keepUnits, ...units.slice(1)] };
      if (it.stock) moves.push({ productId: old.id, qty: it.stock, reason: "Tambah stok · Impor Excel" });
      updated++;
    }
  }
  return { products: list, moves, added, updated };
}
