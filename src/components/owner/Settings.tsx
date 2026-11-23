import { toast } from "sonner";
import { Sun, Moon, Contrast } from "lucide-react";
import { currentEmployee, setState, useStore, type Flags } from "@/lib/store";
import { actionsV3 } from "@/lib/store-v3";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const FLAGS: { key: keyof Flags; title: string; desc: string }[] = [
  { key: "qris", title: "Pembayaran QRIS", desc: "Menambah tombol QRIS di kasir (butuh akun penyedia pembayaran). Di luar baseline: matikan bila hanya tunai dan kasbon." },
  { key: "ppobProvider", title: "PPOB otomatis lewat penyedia", desc: "Pulsa/token diproses otomatis lewat penyedia berbayar. Mati = PPOB hanya dicatat manual." },
  { key: "aiCloud", title: "Penasihat AI cloud", desc: "Mengirim ringkasan angka ke layanan AI. Mati = saran lokal tanpa internet (baseline 100% gratis, client-side)." },
  { key: "multiCabang", title: "Multi-cabang & surat jalan", desc: "Tab Cabang untuk beberapa toko. Tidak diperlukan warung tunggal." },
  { key: "gudang", title: "Gudang & WMS", desc: "Tab Gudang (ROP, ABC) untuk gudang atau grosir." },
];

export function Settings() {
  const s = useStore((s) => s);
  const isOwner = currentEmployee(s)?.role === "Pemilik";
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Pengaturan Toko</h2>
      <div className="flex items-center justify-between gap-3 border-b pb-4"><Label htmlFor="advisor">Penasihat bisnis (saran lokal)</Label><Switch id="advisor" checked={s.advisorEnabled} onCheckedChange={(v) => setState(() => ({ advisorEnabled: v }))} /></div>
      <div>
        <Label>Tema layar</Label>
        <ToggleGroup className="mt-3 justify-start" type="single" value={s.theme} onValueChange={(v) => { if (v === "light" || v === "dark" || v === "contrast") setState(() => ({ theme: v })); }}>
          <ToggleGroupItem value="light"><Sun />Terang</ToggleGroupItem><ToggleGroupItem value="dark"><Moon />Gelap</ToggleGroupItem><ToggleGroupItem value="contrast"><Contrast />Kontras Tinggi</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <section className="space-y-3 border-t pt-4">
        <h3 className="text-lg font-bold">Fitur tambahan (mati secara bawaan)</h3>
        <p className="text-sm text-muted-foreground">Fitur di luar inti warung keluarga. Hanya pemilik yang bisa mengubahnya.</p>
        {FLAGS.map((f) => (
          <div key={f.key} className="flex items-start justify-between gap-4 border-b pb-3">
            <div><Label htmlFor={`flag-${f.key}`} className="text-base font-semibold">{f.title}</Label><p className="text-sm text-muted-foreground">{f.desc}</p></div>
            <Switch id={`flag-${f.key}`} checked={s.flags[f.key]} disabled={!isOwner} onCheckedChange={(v) => { try { actionsV3.setFlag(f.key, v); } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal"); } }} />
          </div>
        ))}
      </section>
    </div>
  );
}
