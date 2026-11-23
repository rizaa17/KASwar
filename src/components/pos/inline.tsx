import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Dialog as RDialog, DialogContent as RContent, DialogHeader as RHeader, DialogTitle as RTitle } from "@/components/ui/dialog";

/**
 * Pengganti Dialog untuk layar kasir (Zero-Modal Policy): isi dialog ditampilkan sebagai panel di dalam
 * halaman (menggantikan kolom barang) sehingga keranjang dan total tetap terlihat; tidak ada lapisan gelap.
 * API sama dengan komponen Dialog sebelumnya. Bila halaman tidak menyediakan #kasir-panel-slot
 * (mis. di area pemilik), otomatis memakai Dialog biasa.
 */
export const SLOT_ID = "kasir-panel-slot";
type Ctx = { slot: HTMLElement; open: boolean; onOpenChange: (o: boolean) => void };
const C = createContext<Ctx | null>(null);

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (o: boolean) => void; children?: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById(SLOT_ID)); }, [open]);
  const change = onOpenChange ?? (() => undefined);
  if (slot) return <C.Provider value={{ slot, open, onOpenChange: change }}>{children}</C.Provider>;
  return <RDialog open={open} onOpenChange={change}>{children}</RDialog>;
}

export function DialogContent({ children, className }: { children?: ReactNode; className?: string }) {
  const c = useContext(C);
  if (!c) return <RContent className={className}>{children}</RContent>;
  if (!c.open) return null;
  return createPortal(
    <div role="region" className="mx-auto w-full max-w-2xl space-y-3 rounded-2xl border-2 border-primary/30 bg-card p-4 shadow-sm">
      <div className="flex justify-end">
        <button type="button" onClick={() => c.onOpenChange(false)} aria-label="Tutup panel" className="touch-lg rounded-xl bg-secondary px-4 text-lg font-bold">
          <X className="mr-1 inline size-5" />Tutup
        </button>
      </div>
      {children}
    </div>,
    c.slot,
  );
}

export function DialogHeader({ children, className }: { children?: ReactNode; className?: string }) {
  return useContext(C) ? <div className="mb-1">{children}</div> : <RHeader className={className}>{children}</RHeader>;
}
export function DialogTitle({ children, className }: { children?: ReactNode; className?: string }) {
  return useContext(C) ? <h2 className="text-2xl font-bold">{children}</h2> : <RTitle className={className}>{children}</RTitle>;
}
