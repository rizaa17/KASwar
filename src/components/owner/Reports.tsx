import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REPORTS, buildReport, headerRowIndex, sheetToAoA, type ReportId, type Sheet } from "@/lib/reports";
import { Field, selectCls } from "./ui";
import { rp } from "@/lib/format";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** 7 laporan Excel (.xlsx) dibuat sepenuhnya di browser. */
export function Reports() {
  const s = useStore((s) => s);
  const now = new Date();
  const [id, setId] = useState<ReportId>("labarugi");
  const [from, setFrom] = useState(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(iso(now));
  const range = useMemo(() => {
    const a = new Date(`${from}T00:00:00`).getTime(); const b = new Date(`${to}T00:00:00`).getTime() + 86_400_000;
    return { a: Number.isFinite(a) ? a : 0, b: Number.isFinite(b) ? b : Date.now() };
  }, [from, to]);
  const def = REPORTS.find((r) => r.id === id) ?? REPORTS[0];
  const sheets: Sheet[] = useMemo(() => buildReport(id, s, range.a, range.b), [id, s, range]);

  async function download() {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      for (const sh of sheets) {
        const ws = XLSX.utils.aoa_to_sheet(sheetToAoA(sh));
        const hr = headerRowIndex(sh);
        ws["!cols"] = sh.headers.map((h, i) => ({ wch: Math.min(60, Math.max(h.length + 2, 12, ...sh.rows.slice(0, 200).map((r) => String(r[i] ?? "").length + 2))) }));
        sh.rows.forEach((row, ri) => row.forEach((_, ci) => {
          const cell = ws[XLSX.utils.encode_cell({ r: hr + 1 + ri, c: ci })];
          if (cell && typeof cell.v === "number") cell.z = sh.fmts[ci] === "rp" ? '"Rp" #,##0' : sh.fmts[ci] === "qty" ? "#,##0.###" : cell.z;
        }));
        XLSX.utils.book_append_sheet(wb, ws, sh.name.slice(0, 31));
      }
      XLSX.writeFile(wb, `warung-${def.file}-${iso(now)}.xlsx`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal membuat file Excel"); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Unduh Laporan Excel</h2>
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Laporan"><select aria-label="Jenis laporan" className={selectCls} value={id} onChange={(e) => setId(e.target.value as ReportId)}>{REPORTS.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select></Field>
        <Field label="Dari tanggal"><Input aria-label="Dari tanggal" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Sampai tanggal"><Input aria-label="Sampai tanggal" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        <div className="flex items-end"><Button className="w-full" onClick={() => void download()}><Download />Unduh .xlsx</Button></div>
      </div>
      {sheets.map((sh) => (
        <section key={sh.name} className="rounded-xl border p-3">
          <h3 className="font-bold">{sh.name} · {sh.rows.length} baris</h3>
          {sh.note && <p className="text-xs text-muted-foreground">{sh.note}</p>}
          <div className="mt-2 max-h-72 overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left">{sh.headers.map((h) => <th key={h} className="p-1">{h}</th>)}</tr></thead>
              <tbody>{sh.rows.slice(0, 30).map((r, i) => <tr key={i} className="border-b">{r.map((c, j) => <td key={j} className="p-1">{typeof c === "number" && sh.fmts[j] === "rp" ? rp(c) : String(c ?? "")}</td>)}</tr>)}</tbody>
            </table>
            {sh.rows.length > 30 && <p className="mt-1 text-xs text-muted-foreground">Pratinjau 30 baris pertama; file Excel memuat semuanya.</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
