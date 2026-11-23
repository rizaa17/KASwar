import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/pos/inline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { actionsPlus } from "@/lib/store-extra";
import { cloudConfig, getSession, purchasePpob } from "@/lib/cloud";
import { useStore, type PpobTx, type SavedNumber } from "@/lib/store";
import { actionsV3 } from "@/lib/store-v3";
import { rp } from "@/lib/format";
import { cn } from "@/lib/utils";

const KINDS: { v: PpobTx["kind"]; label: string; fee: number; target: string; passThrough: boolean }[] = [
  { v: "pulsa", label: "Pulsa", fee: 2000, target: "Nomor HP", passThrough: false },
  { v: "data", label: "Paket Data", fee: 2000, target: "Nomor HP", passThrough: false },
  { v: "token", label: "Token PLN", fee: 2500, target: "No. meter / ID pelanggan", passThrough: false },
  { v: "ewallet", label: "Top-up E-Wallet", fee: 2000, target: "Nomor e-wallet", passThrough: true },
  { v: "transfer", label: "Transfer Tunai", fee: 5000, target: "Bank + no. rekening", passThrough: true },
  { v: "tagihan", label: "Tagihan (PDAM/BPJS)", fee: 3000, target: "No. pelanggan", passThrough: false },
];
const PRESETS = [5000, 10000, 20000, 25000, 50000, 100000];

/** Layanan PPOB dan transfer tunai di kasir. Mode otomatis lewat penyedia (cloud) atau manual (kasir memproses di aplikasi penyedia). */
export function PpobDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const deposit = useStore((s) => s.deposit);
  const providerOn = useStore((s) => s.flags.ppobProvider);
  const saved = useStore((s) => s.savedNumbers);
  const [book, setBook] = useState(false);
  const [nn, setNn] = useState({ nickname: "", plnId: "", phone: "", operator: "" });
  const cloud = providerOn && !!cloudConfig() && !!getSession();
  const [kind, setKind] = useState<PpobTx["kind"]>("pulsa");
  const k = KINDS.find((x) => x.v === kind)!;
  const [target, setTarget] = useState("");
  const [nominal, setNominal] = useState(10000);
  const [fee, setFee] = useState(k.fee);
  const [cost, setCost] = useState(10000);
  const [sku, setSku] = useState("");
  const [auto, setAuto] = useState(true);
  const [busy, setBusy] = useState(false);
  const price = nominal + fee;
  const useAuto = cloud && auto && kind !== "transfer";

  const pick = (v: PpobTx["kind"]) => { const x = KINDS.find((q) => q.v === v)!; setKind(v); setFee(x.fee); setCost(x.passThrough ? nominal : Math.max(0, nominal - 200)); };
  const setNom = (n: number) => { setNominal(n); setCost(k.passThrough ? n : Math.max(0, n - 200)); };

  const submit = async () => {
    setBusy(true);
    try {
      if (useAuto) {
        if (!sku.trim()) throw new Error("Isi kode produk penyedia (SKU)");
        const refId = `pp${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        const r = await purchasePpob({ kind, sku: sku.trim(), target: target.trim(), refId });
        if (r.status === "gagal") throw new Error(r.message ?? "Penyedia menolak transaksi");
        const tx = actionsPlus.recordPpob({ kind, target: target.trim(), nominal, fee, cost: r.price ?? cost, price, status: r.status, sn: r.sn, ref: refId });
        toast.success(tx.status === "sukses" ? `Berhasil. SN ${tx.sn ?? "-"}` : "Transaksi diproses penyedia (tertunda). Pantau di tab Layanan pemilik.");
      } else {
        actionsPlus.recordPpob({ kind, target: target.trim(), nominal, fee, cost, price, status: "manual" });
        toast.success("Tercatat. Pastikan transaksi sudah diproses di aplikasi penyedia.");
      }
      setTarget(""); onOpenChange(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Transaksi gagal"); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle className="text-2xl">Layanan PPOB & Transfer</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((x) => <button key={x.v} onClick={() => pick(x.v)} className={cn("rounded-xl border-2 p-3 font-bold", kind === x.v && "border-primary bg-primary/10")}>{x.label}</button>)}
        </div>
        <div className="space-y-2 rounded-xl border p-3">
          <div className="flex items-center justify-between"><b className="text-lg">Buku Titipan Nomor</b><button type="button" onClick={() => setBook(!book)} className="touch-lg rounded-xl px-3 text-base font-semibold text-primary">{book ? "Selesai" : "Tambah / Hapus"}</button></div>
          {!saved.length && <p className="text-sm text-muted-foreground">Belum ada nomor tersimpan.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {saved.map((n: SavedNumber) => {
              const number = (kind === "token" ? n.plnId : n.phone) ?? n.plnId ?? n.phone ?? "";
              return (
                <div key={n.id} className="flex gap-1">
                  <button type="button" onClick={() => setTarget(number)} className="touch-lg flex-1 rounded-xl border-2 p-2 text-left hover:border-primary">
                    <div className="text-lg font-bold leading-tight">{n.nickname}</div>
                    <div className="text-sm text-muted-foreground">{kind === "token" ? `PLN ${n.plnId ?? "-"}` : `${n.phone ?? "-"}${n.operator ? ` · ${n.operator}` : ""}`}</div>
                  </button>
                  {book && <button type="button" aria-label={`Hapus ${n.nickname}`} onClick={() => actionsV3.deleteNumber(n.id)} className="touch-lg rounded-xl bg-destructive/15 px-3 text-destructive">Hapus</button>}
                </div>
              );
            })}
          </div>
          {book && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input aria-label="Nama panggilan" placeholder="Nama panggilan (Bu Siti RT 02)" value={nn.nickname} onChange={(e) => setNn({ ...nn, nickname: e.target.value })} className="h-12" />
              <Input aria-label="No. meteran PLN" placeholder="No. meteran / ID PLN" inputMode="numeric" value={nn.plnId} onChange={(e) => setNn({ ...nn, plnId: e.target.value })} className="h-12" />
              <Input aria-label="Nomor HP" placeholder="Nomor HP" inputMode="numeric" value={nn.phone} onChange={(e) => setNn({ ...nn, phone: e.target.value })} className="h-12" />
              <Input aria-label="Operator" placeholder="Operator (Telkomsel, XL…)" value={nn.operator} onChange={(e) => setNn({ ...nn, operator: e.target.value })} className="h-12" />
              <Button className="touch-lg sm:col-span-2" onClick={() => { try { actionsV3.saveNumber(nn); setNn({ nickname: "", plnId: "", phone: "", operator: "" }); toast.success("Nomor disimpan"); } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menyimpan"); } }}>Simpan Nomor</Button>
            </div>
          )}
        </div>
        <label className="block font-semibold">{k.target}<Input aria-label="Nomor tujuan" value={target} onChange={(e) => setTarget(e.target.value)} className="h-12 text-lg" /></label>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((n) => <button key={n} onClick={() => setNom(n)} className={cn("rounded-lg border py-2 font-bold", nominal === n && "border-primary bg-primary/10")}>{rp(n)}</button>)}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm font-semibold">Nominal<Input aria-label="Nominal" type="number" min={0} value={nominal} onChange={(e) => setNom(Number(e.target.value))} /></label>
          <label className="text-sm font-semibold">Biaya admin<Input aria-label="Biaya admin" type="number" min={0} value={fee} onChange={(e) => setFee(Number(e.target.value))} /></label>
          <label className="text-sm font-semibold">Modal dari deposit<Input aria-label="Modal" type="number" min={0} value={cost} onChange={(e) => setCost(Number(e.target.value))} /></label>
        </div>
        {cloud && kind !== "transfer" && (
          <div className="space-y-2 rounded-xl border p-3">
            <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Proses otomatis lewat penyedia</label>
            {auto && <Input aria-label="Kode produk penyedia" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Kode produk penyedia, mis. xld10" />}
          </div>
        )}
        <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm"><span>Saldo deposit {rp(deposit)}</span><span>Pelanggan bayar <b className="num-jumbo text-xl">{rp(price)}</b></span></div>
        <Button className="h-14 w-full text-xl font-extrabold" disabled={busy || target.trim().length < 3 || nominal <= 0} onClick={submit}>{busy ? "Memproses…" : `Terima ${rp(price)} & Proses`}</Button>
      </DialogContent>
    </Dialog>
  );
}
