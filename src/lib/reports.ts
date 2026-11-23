import { dayStats, kasbonDue, spoilageLoss, SPOILAGE_REASONS, validSales } from "./operations";
import { customerBalance, type State } from "./store";
import { sanitizeCell } from "./export";

export type Cell = string | number | null;
export type ColFmt = "rp" | "qty" | "text" | "date";
export type Sheet = { name: string; headers: string[]; fmts: ColFmt[]; rows: Cell[][]; note?: string };
export type ReportId = "labarugi" | "transaksi" | "stok" | "kasbon" | "hutang" | "ppob" | "rusak";
export const REPORTS: { id: ReportId; title: string; file: string }[] = [
  { id: "labarugi", title: "1. Laporan Laba Rugi Warung", file: "laba-rugi" },
  { id: "transaksi", title: "2. Daftar Rincian Transaksi", file: "transaksi" },
  { id: "stok", title: "3. Stok & Valuasi Inventaris", file: "stok-valuasi" },
  { id: "kasbon", title: "4. Buku Kasbon Pelanggan", file: "kasbon" },
  { id: "hutang", title: "5. Hutang Supplier & Kulakan", file: "hutang-supplier" },
  { id: "ppob", title: "6. PPOB & Konsinyasi", file: "ppob-konsinyasi" },
  { id: "rusak", title: "7. Log Barang Rusak & Barang Dicari Kosong", file: "log-rusak-kosong" },
];

const iso = (ts: number) => new Date(ts).toISOString().slice(0, 10);
const waktu = (ts: number) => new Date(ts).toISOString().slice(11, 16);

function labaRugi(s: State, from: number, to: number): Sheet[] {
  const d = dayStats(s, from, to);
  const rows: Cell[][] = [
    ["Omzet Penjualan (setelah retur)", d.omzet],
    ["Total HPP Barang Terjual (Moving Average)", -d.hpp],
    ["LABA KOTOR", d.gross],
    ["Beban Kerugian Barang Rusak/Susut", -d.rusak],
    ["Biaya Operasional (kas keluar laci) & kerugian retur", -d.beban],
    ["Margin PPOB (pulsa/token)", d.ppobMargin],
    ["Komisi Konsinyasi (titipan)", d.consign],
    ["Pendapatan Lain-lain", d.lain],
    ["LABA BERSIH WARUNG", d.net],
    ["Memo: Prive pemilik (bukan biaya, tidak mengurangi laba)", d.prive],
    ["Memo: Transaksi Kilat belum dirinci per barang (HPP belum terhitung)", d.quick],
  ];
  return [{ name: "Laba Rugi", headers: ["Uraian", `Rp (${iso(from)} s.d. ${iso(to - 1)})`], fmts: ["text", "rp"], rows, note: "Pinjam Cash dan pembayaran hutang supplier bukan biaya, sehingga tidak masuk laporan ini." }];
}

function transaksi(s: State, from: number, to: number): Sheet[] {
  const modeOf = (shiftId?: string) => (s.shifts.find((x) => x.id === shiftId)?.mode === "keluarga" ? "Keluarga" : s.shifts.find((x) => x.id === shiftId) ? "Pegawai" : "");
  const rows = s.sales.filter((x) => x.ts >= from && x.ts < to).sort((a, b) => a.ts - b.ts).map((x): Cell[] => {
    const pay = (m: string) => x.payments?.filter((p) => p.method === m).reduce((a, p) => a + p.amount, 0) ?? (x.method === m ? x.total : 0);
    const metode = x.quick ? "Transaksi Kilat" : x.method === "split" ? "Split" : x.method === "tunai" ? "Tunai" : x.method === "qris" ? "QRIS" : "Kasbon";
    return [x.id, iso(x.ts), waktu(x.ts), x.cashierName ?? "", modeOf(x.shiftId), metode, x.total, pay("tunai"), pay("qris"), pay("kasbon"), x.voided ? "Batal" : "Selesai", x.items.map((i) => `${i.name} ${i.qty} ${i.unit}`).join("; ")];
  });
  return [{ name: "Transaksi", headers: ["Nota", "Tanggal", "Jam", "Kasir", "Mode", "Metode", "Total", "Tunai", "QRIS", "Kasbon", "Status", "Rincian item"], fmts: ["text", "date", "text", "text", "text", "text", "rp", "rp", "rp", "rp", "text", "text"], rows }];
}

function stok(s: State): Sheet[] {
  const rows = s.products.filter((p) => !p.digital && !p.bundle).map((p): Cell[] => [p.name, p.category, p.baseUnit, p.stock, Math.round(p.hpp), Math.round(p.stock * p.hpp), p.minStock, p.stock <= 0 ? "Habis" : p.stock <= p.minStock ? "Perlu restock" : "Aman"]);
  const total = rows.reduce((a, r) => a + (Number(r[5]) || 0), 0);
  rows.push(["TOTAL NILAI ASET STOK", null, null, null, null, total, null, null]);
  return [{ name: "Valuasi Stok", headers: ["Barang", "Kategori", "Satuan", "Stok fisik", "HPP rata-rata", "Nilai stok", "Stok minimum", "Status restock"], fmts: ["text", "text", "text", "qty", "rp", "rp", "qty", "text"], rows }];
}

function kasbon(s: State): Sheet[] {
  const rows = s.customers.map((c): Cell[] => {
    const bayar = s.ledger.filter((l) => l.customerId === c.id && l.credit > 0);
    const last = bayar.sort((a, b) => b.ts - a.ts)[0];
    const due = kasbonDue(s, c);
    return [c.name, c.phone, c.limit, customerBalance(s, c.id), due ? iso(due) : "", last ? iso(last.ts) : "", bayar.reduce((a, l) => a + l.credit, 0)];
  }).sort((a, b) => Number(b[3]) - Number(a[3]));
  return [{ name: "Buku Kasbon", headers: ["Pelanggan", "No. WhatsApp", "Limit", "Sisa hutang", "Jatuh tempo", "Bayar terakhir", "Total sudah dibayar"], fmts: ["text", "text", "rp", "rp", "date", "date", "rp"], rows }];
}

function hutang(s: State, now: number): Sheet[] {
  const rows = s.payables.map((p): Cell[] => {
    const sisa = p.amount - p.paid;
    return [s.suppliers.find((x) => x.id === p.supplierId)?.name ?? "", p.note, iso(p.ts), iso(p.due), p.amount, p.paid, sisa, sisa <= 0 ? "Lunas" : p.due < now ? "Jatuh tempo" : "Belum jatuh tempo"];
  });
  return [{ name: "Hutang Supplier", headers: ["Distributor/Sales", "Keterangan faktur", "Tanggal terima", "Jatuh tempo", "Tagihan", "Dibayar", "Sisa", "Status"], fmts: ["text", "text", "date", "date", "rp", "rp", "rp", "text"], rows }];
}

function ppobKonsinyasi(s: State, from: number, to: number): Sheet[] {
  const p = s.ppob.filter((t) => t.ts >= from && t.ts < to).map((t): Cell[] => [iso(t.ts), t.kind, t.target, t.cost, t.price, t.status === "gagal" ? 0 : t.price - t.cost, t.status]);
  const k = s.consigns.filter((c) => c.date >= from && c.date < to).map((c): Cell[] => [iso(c.date), c.owner, c.item, c.received, c.returned ?? 0, c.sold, c.sold * (c.sellPrice - c.ownerPrice), c.sold * c.ownerPrice, c.settled ? "Sudah disetor" : "Belum disetor"]);
  return [
    { name: "PPOB", headers: ["Tanggal", "Jenis", "Tujuan", "Modal", "Harga jual", "Margin", "Status"], fmts: ["date", "text", "text", "rp", "rp", "rp", "text"], rows: p },
    { name: "Konsinyasi", headers: ["Tanggal", "Penitip", "Barang", "Titip", "Sisa", "Terjual", "Komisi warung", "Setoran ke penitip", "Status"], fmts: ["date", "text", "text", "qty", "qty", "qty", "rp", "rp", "text"], rows: k },
  ];
}

function rusakKosong(s: State, from: number, to: number): Sheet[] {
  const rusak = s.stockMoves.filter((m) => m.qty < 0 && m.ts >= from && m.ts < to && (SPOILAGE_REASONS as readonly string[]).includes(m.reason)).map((m): Cell[] => {
    const pr = s.products.find((x) => x.id === m.productId);
    return [iso(m.ts), pr?.name ?? m.productId, -m.qty, pr?.baseUnit ?? "", Math.round(-m.qty * (pr?.hpp ?? 0)), m.reason.replace("Opname · ", "")];
  });
  const byName = new Map<string, { n: number; last: number }>();
  for (const l of s.lostSales.filter((x) => x.ts >= from && x.ts < to)) { const k = l.name.trim().toLowerCase(); const cur = byName.get(k) ?? { n: 0, last: 0 }; byName.set(k, { n: cur.n + 1, last: Math.max(cur.last, l.ts) }); }
  const kosong = [...byName.entries()].map(([name, v]): Cell[] => [name, v.n, iso(v.last)]).sort((a, b) => Number(b[1]) - Number(a[1]));
  return [
    { name: "Barang Rusak", headers: ["Tanggal", "Barang", "Jumlah", "Satuan", "Kerugian (HPP)", "Sebab"], fmts: ["date", "text", "qty", "text", "rp", "text"], rows: rusak },
    { name: "Dicari Tapi Kosong", headers: ["Barang yang dicari", "Berapa kali ditanya", "Terakhir ditanya"], fmts: ["text", "qty", "date"], rows: kosong },
  ];
}

export function buildReport(id: ReportId, s: State, from: number, to: number, now = Date.now()): Sheet[] {
  switch (id) {
    case "labarugi": return labaRugi(s, from, to);
    case "transaksi": return transaksi(s, from, to);
    case "stok": return stok(s);
    case "kasbon": return kasbon(s);
    case "hutang": return hutang(s, now);
    case "ppob": return ppobKonsinyasi(s, from, to);
    case "rusak": return rusakKosong(s, from, to);
  }
}

/** Array-of-arrays siap ditulis SheetJS (judul, catatan, header, baris) dengan pencegahan formula injection. */
export function sheetToAoA(sh: Sheet): Cell[][] {
  const out: Cell[][] = [[sh.name]];
  if (sh.note) out.push([sh.note]);
  out.push(sh.headers, ...sh.rows.map((r) => r.map((c) => sanitizeCell(c))));
  return out;
}
export const headerRowIndex = (sh: Sheet) => (sh.note ? 2 : 1);
/** Hindari spesifikasi "ledger kosong": laporan tanpa baris tetap berisi header. */
export const countRows = (sheets: Sheet[]) => sheets.reduce((a, x) => a + x.rows.length, 0);
export { validSales, spoilageLoss };
