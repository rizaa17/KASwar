import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { actionsV3 } from "@/lib/store-v3";
import { TEMPLATE_COLUMNS, summarize, validateRows, type ImportMode, type RowResult, type RowStatus } from "@/lib/importer";
import { useStore } from "@/lib/store";
import { Card } from "./ui";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 5000;
const WARNA: Record<RowStatus, string> = { hijau: "bg-success/15", kuning: "bg-warning/25", merah: "bg-destructive/10" };
const LABEL: Record<RowStatus, string> = { hijau: "Valid", kuning: "Peringatan", merah: "Ditolak" };

/** Impor stok massal .xlsx/.csv. File dibaca 100% di browser (SheetJS); ada layar pratinjau 3 warna sebelum disimpan. */
export function ImportExcel() {
  const products = useStore((s) => s.products);
  const [mode, setMode] = useState<ImportMode>("baru");
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [name, setName] = useState("");
  const [filter, setFilter] = useState<RowStatus | "semua">("semua");
  const results: RowResult[] = useMemo(() => (rows ? validateRows(rows, products, mode) : []), [rows, products, mode]);
  const sum = summarize(results);
  const shown = results.filter((r) => filter === "semua" || r.status === filter).slice(0, 300);

  async function template() {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([
      [...TEMPLATE_COLUMNS],
      ["8999999000011", "Indomie Goreng", "Sembako", "Bungkus", 2800, 3500, 3300, 10, 40, 10],
      ["", "Gula Pasir Curah", "Curah", "Kg", 15000, 17500, "", "", 20, 5],
    ]);
    ws["!cols"] = TEMPLATE_COLUMNS.map((c) => ({ wch: Math.max(14, c.length + 2) }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Stok");
    XLSX.writeFile(wb, "template-impor-stok.xlsx");
  }

  async function pick(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_BYTES) { toast.error("File terlalu besar (maks 5 MB)"); return; }
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) throw new Error("File kosong");
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: true });
      if (!data.length) throw new Error("Tidak ada baris data");
      if (data.length > MAX_ROWS) throw new Error(`Maksimal ${MAX_ROWS} baris per file`);
      setRows(data); setName(file.name); setFilter("semua");
    } catch (e) { setRows(null); toast.error(e instanceof Error ? e.message : "File tidak dapat dibaca"); }
  }

  function run() {
    try {
      const r = actionsV3.importProducts(results);
      toast.success(`Impor selesai: ${r.added} barang baru, ${r.updated} diperbarui`);
      setRows(null); setName("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Impor gagal"); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Impor Stok Massal dari Excel</h2>
      <Card title="1. Siapkan file">
        <p className="text-sm text-muted-foreground">Isi di laptop memakai template resmi lalu unggah di sini. Kolom wajib: nama_barang, harga_beli_modal, harga_jual_eceran. Barcode kosong akan dibuatkan barcode warung otomatis.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => void template()}>Unduh Template .xlsx</Button>
          <input aria-label="Pilih file Excel" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => void pick(e.target.files?.[0])} />
        </div>
        <fieldset className="mt-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2"><input type="radio" name="mode" checked={mode === "baru"} onChange={() => setMode("baru")} />Tambah barang baru (lewati yang sudah ada)</label>
          <label className="flex items-center gap-2"><input type="radio" name="mode" checked={mode === "perbarui"} onChange={() => setMode("perbarui")} />Perbarui stok & harga (harga ditimpa, stok ditambah)</label>
        </fieldset>
      </Card>
      {rows && (
        <Card title={`2. Pratinjau & validasi · ${name}`}>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {(["semua", "hijau", "kuning", "merah"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3 py-1", filter === f && "border-primary bg-primary/10")}>
                {f === "semua" ? `Semua (${results.length})` : `${LABEL[f]} (${sum[f]})`}
              </button>
            ))}
          </div>
          <div className="mt-3 max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left"><th className="p-1">Baris</th><th>Status</th><th>Barang</th><th>Aksi</th><th>Catatan</th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.row} className={cn("border-b", WARNA[r.status])}>
                    <td className="p-1">{r.row}</td><td><b>{LABEL[r.status]}</b></td><td>{r.item?.name ?? "—"}</td><td>{r.action}</td><td>{r.messages.join("; ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > shown.length && <p className="mt-2 text-xs text-muted-foreground">Menampilkan {shown.length} baris pertama dari filter ini.</p>}
          </div>
          <Button className="mt-3 w-full" size="lg" disabled={!sum.diimpor} onClick={run}>Impor {sum.diimpor} baris (merah tidak ikut)</Button>
        </Card>
      )}
    </div>
  );
}
