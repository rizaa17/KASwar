import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decryptBackup, encryptBackup } from "@/lib/backup";
import { actionsV3 } from "@/lib/store-v3";
import { Card, Field } from "./ui";

const KEY = "pp-last-backup";
const lastBackup = () => { try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; } };

/** Cadangan terenkripsi (AES-GCM) ke berkas; bisa dibagikan ke WhatsApp/Google Drive lewat menu Bagikan HP. Pemulihan di HP baru. */
export function BackupPanel() {
  const [pass, setPass] = useState(""); const [busy, setBusy] = useState(false);
  const [rpass, setRpass] = useState(""); const [rfile, setRfile] = useState<File | null>(null);
  const [last, setLast] = useState(lastBackup());
  const days = last ? Math.floor((Date.now() - last) / 86_400_000) : null;

  async function make(share: boolean) {
    setBusy(true);
    try {
      const enc = await encryptBackup(actionsV3.snapshotForBackup(), pass);
      const name = `cadangan-warung-${new Date().toISOString().slice(0, 10)}.ppbak`;
      const file = new File([enc], name, { type: "application/octet-stream" });
      if (share && navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: "Cadangan data warung" }); }
      else {
        if (share) toast.message("Menu Bagikan belum didukung di perangkat ini. Berkas diunduh; kirim manual ke WhatsApp/Google Drive.");
        const url = URL.createObjectURL(file); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
      }
      try { localStorage.setItem(KEY, String(Date.now())); } catch { /* abaikan */ }
      setLast(Date.now()); toast.success("Cadangan dibuat. Simpan kata sandinya baik-baik; tanpa itu cadangan tidak bisa dibuka.");
    } catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) toast.error(e instanceof Error ? e.message : "Gagal membuat cadangan"); }
    finally { setBusy(false); }
  }

  async function restore() {
    if (!rfile) return;
    setBusy(true);
    try {
      const data = await decryptBackup(await rfile.text(), rpass);
      if (!confirm("Data di perangkat ini akan DIGANTI dengan isi cadangan. Lanjutkan?")) return;
      const r = actionsV3.restoreBackup(data);
      toast.success(`Pulih: ${r.products} barang, ${r.sales} nota. Silakan masuk lagi dengan PIN dari cadangan.`);
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal memulihkan"); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="💾 Buat Cadangan">
        <p className="text-sm text-muted-foreground">{days === null ? "Belum pernah mencadangkan di perangkat ini." : `Cadangan terakhir ${days} hari lalu.`} {days !== null && days > 7 && <b className="text-destructive">Sudah lebih dari seminggu, segera cadangkan.</b>}</p>
        <Field label="Kata sandi cadangan (min. 6 karakter)"><Input aria-label="Kata sandi cadangan" type="password" value={pass} onChange={(e) => setPass(e.target.value)} /></Field>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled={busy || pass.length < 6} onClick={() => void make(true)}>Cadangkan & Bagikan (WhatsApp / Drive)</Button>
          <Button variant="outline" disabled={busy || pass.length < 6} onClick={() => void make(false)}>Unduh Berkas</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Berkas terenkripsi di perangkat ini; hanya yang tahu kata sandi yang bisa membukanya. Jangan jadikan cloud gratis satu-satunya salinan.</p>
      </Card>
      <Card title="♻️ Pulihkan di HP Baru">
        <p className="text-sm text-muted-foreground">Pilih berkas .ppbak dan masukkan kata sandinya. Hanya pemilik, atau perangkat yang masih berisi data contoh, yang dapat memulihkan.</p>
        <input aria-label="Pilih berkas cadangan" className="mt-2" type="file" accept=".ppbak,application/octet-stream" onChange={(e) => setRfile(e.target.files?.[0] ?? null)} />
        <Field label="Kata sandi cadangan"><Input aria-label="Kata sandi pemulihan" type="password" value={rpass} onChange={(e) => setRpass(e.target.value)} /></Field>
        <Button className="mt-3" variant="destructive" disabled={busy || !rfile || rpass.length < 6} onClick={() => void restore()}>Pulihkan Data</Button>
      </Card>
    </div>
  );
}
