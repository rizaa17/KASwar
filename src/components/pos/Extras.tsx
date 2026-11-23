import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/pos/inline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Keypad } from "@/components/pos/Keypad";
import { actionsV3, activeLoans } from "@/lib/store-v3";
import { useStore } from "@/lib/store";
import { buzz, chime, jam, rp } from "@/lib/format";

/** Pinjam Cash: talangan/pinjaman sementara dari laci. Bukan biaya warung. */
export function PinjamCashDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const loans = useStore((s) => s.loans);
  const [who, setWho] = useState(""); const [amount, setAmount] = useState(0); const [note, setNote] = useState("");
  const aktif = activeLoans(loans);
  const save = () => {
    try { actionsV3.lendCash(who, amount, note); chime(); toast.success(`Tercatat: ${who} ${rp(amount)}. Laci berkurang, bukan biaya.`); setWho(""); setAmount(0); setNote(""); }
    catch (e) { buzz(); toast.error(e instanceof Error ? e.message : "Gagal mencatat"); }
  };
  const back = (id: string) => { try { actionsV3.repayLoan(id); chime(); toast.success("Uang kembali ke laci"); } catch (e) { buzz(); toast.error(e instanceof Error ? e.message : "Gagal"); } };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Pinjam Cash (Talangan)</DialogTitle></DialogHeader>
        <label className="block text-lg font-semibold">Nama orang<Input aria-label="Nama orang" value={who} onChange={(e) => setWho(e.target.value)} placeholder="Mas Danang J&T, Bu RT, Pak Joko" className="h-14 text-xl" /></label>
        <div className="flex items-end justify-between rounded-xl bg-muted p-3"><span className="text-lg">Nominal uang</span><span className="num-jumbo text-4xl">{rp(amount)}</span></div>
        <Keypad value={amount} onChange={setAmount} />
        <label className="block text-lg font-semibold">Keterangan singkat<Input aria-label="Keterangan" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Talangan COD paket sepatu" className="h-14 text-xl" /></label>
        <Button className="touch-lg h-16 w-full text-2xl font-extrabold" disabled={!who.trim() || amount <= 0} onClick={save}>Catat Uang Keluar dari Laci</Button>
        <h3 className="pt-2 text-xl font-bold">Belum kembali ({aktif.length})</h3>
        {!aktif.length && <p className="text-muted-foreground">Tidak ada pinjaman aktif.</p>}
        {aktif.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-2 rounded-xl border p-3">
            <div><div className="text-lg font-bold">{l.person}</div><div className="text-sm text-muted-foreground">{jam(l.ts)} · {l.note || "tanpa keterangan"}</div></div>
            <div className="flex items-center gap-2"><b className="num-jumbo text-xl">{rp(l.amount)}</b><Button className="touch-lg" onClick={() => back(l.id)}>Kembalikan ke Laci / Lunas</Button></div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}

/** Transaksi Kilat: antrean panik, cukup ketik uang masuk. Stok dirapikan nanti. */
export function QuickCashDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [amount, setAmount] = useState(0);
  const save = () => {
    try { actionsV3.quickCash(amount); chime(); toast.success(`Masuk laci ${rp(amount)}`); setAmount(0); onOpenChange(false); }
    catch (e) { buzz(); toast.error(e instanceof Error ? e.message : "Gagal"); }
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setAmount(0); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Transaksi Kilat (tanpa pilih barang)</DialogTitle></DialogHeader>
        <div className="flex items-end justify-between rounded-xl bg-muted p-4"><span className="text-xl">Uang diterima</span><span className="num-jumbo text-5xl">{rp(amount)}</span></div>
        <Keypad value={amount} onChange={setAmount} />
        <Button className="touch-lg h-20 w-full text-2xl font-extrabold" disabled={amount <= 0} onClick={save}>Terima Tunai Masuk Laci</Button>
        <p className="text-sm text-muted-foreground">Stok barang disesuaikan nanti saat warung sepi. Penjualan ini ditandai belum dirinci per barang.</p>
      </DialogContent>
    </Dialog>
  );
}

/** Ganti data contoh dengan toko kosong milik pengguna. */
export function FreshStartDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const [shop, setShop] = useState(""); const [owner, setOwner] = useState(""); const [pin, setPin] = useState(""); const [pin2, setPin2] = useState(""); const [busy, setBusy] = useState(false);
  const go = async () => {
    if (pin !== pin2) { buzz(); toast.error("PIN dan ulangi PIN tidak sama"); return; }
    setBusy(true);
    try { await actionsV3.startFreshStore({ shopName: shop, ownerName: owner, pin }); toast.success("Toko baru siap. Mulai dengan menambah barang di Pusat Kelola."); onOpenChange(false); onDone(); }
    catch (e) { buzz(); toast.error(e instanceof Error ? e.message : "Gagal memulai toko"); }
    finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Mulai Toko Baru</DialogTitle></DialogHeader>
        <p className="text-muted-foreground">Data contoh (barang, nota, pegawai, PIN bawaan) akan dihapus dari perangkat ini. Anda menjadi pemilik dengan PIN sendiri.</p>
        <label className="block font-semibold">Nama warung<Input aria-label="Nama warung" value={shop} onChange={(e) => setShop(e.target.value)} className="h-14 text-xl" /></label>
        <label className="block font-semibold">Nama pemilik<Input aria-label="Nama pemilik" value={owner} onChange={(e) => setOwner(e.target.value)} className="h-14 text-xl" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block font-semibold">PIN pemilik (4–6 angka)<Input aria-label="PIN baru" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="h-14 text-xl" /></label>
          <label className="block font-semibold">Ulangi PIN<Input aria-label="Ulangi PIN" type="password" inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} className="h-14 text-xl" /></label>
        </div>
        <Button className="touch-lg h-16 w-full text-xl font-extrabold" disabled={busy || !shop.trim() || !owner.trim() || pin.length < 4} onClick={go}>Hapus Data Contoh & Mulai</Button>
      </DialogContent>
    </Dialog>
  );
}
