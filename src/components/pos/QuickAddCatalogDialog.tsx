import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/pos/inline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { chime, buzz, rp } from "@/lib/format";
import { actions, uid, type Product } from "@/lib/store";
import { getCatalogEmoji, toProductCategory, type CatalogItem } from "@/data/catalog";
import { Sparkles, Check, X } from "lucide-react";

interface Props {
  open: boolean;
  item: CatalogItem | null;
  onClose: () => void;
  onSuccess: (p: Product) => void;
}

export function QuickAddCatalogDialog({ open, item, onClose, onSuccess }: Props) {
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("12");
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && item) {
      setPrice("");
      setCost("");
      setStock("12");
      // Auto-focus ke input harga jual
      setTimeout(() => {
        priceInputRef.current?.focus();
      }, 100);
    }
  }, [open, item]);

  if (!item) return null;

  const emoji = getCatalogEmoji(item.name, item.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jual = Number(price);
    if (!Number.isFinite(jual) || jual <= 0) {
      buzz();
      toast.error("Masukkan harga jual yang valid");
      priceInputRef.current?.focus();
      return;
    }

    const modal = Number(cost) || 0;
    const stokAwal = Number(stock) || 0;

    const newProduct: Product = {
      id: uid(),
      name: item.name,
      emoji,
      category: toProductCategory(item.category),
      baseUnit: item.baseUnit || "pcs",
      stock: stokAwal,
      hpp: modal > 0 ? modal : Math.round(jual * 0.85), // estimasi HPP jika tidak diisi
      minStock: 5,
      barcode: item.barcode,
      quick: true, // otomatis tampil di tombol cepat kasir
      units: [
        {
          name: item.baseUnit || "pcs",
          factor: 1,
          price: jual,
        },
      ],
    };

    try {
      actions.saveProduct(newProduct);
      chime();
      toast.success(`${item.name} berhasil disimpan ke toko!`);
      onSuccess(newProduct);
      onClose();
    } catch (err) {
      buzz();
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan produk baru");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-5 animate-pulse text-amber-500" />
            <DialogTitle>Barang Dikenali dari Katalog!</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Info Barang */}
          <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/20">
            <span className="text-3xl">{emoji}</span>
            <div className="flex-1">
              <h3 className="font-bold text-base leading-tight text-foreground">{item.name}</h3>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                <span className="rounded bg-background/80 px-1.5 py-0.5 font-mono font-medium">
                  {item.barcode}
                </span>
                <span className="rounded bg-background/80 px-1.5 py-0.5">
                  Satuan: <b>{item.baseUnit}</b>
                </span>
                <span className="rounded bg-background/80 px-1.5 py-0.5">
                  Kategori: <b>{item.category}</b>
                </span>
              </div>
            </div>
          </div>

          {/* Form Input Sederhana */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>Harga Jual Toko (Rp) <span className="text-destructive">*</span></span>
                {price && Number(price) > 0 && (
                  <span className="text-xs text-primary font-bold">{rp(Number(price))}</span>
                )}
              </label>
              <Input
                ref={priceInputRef}
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 3500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 text-lg font-bold h-12"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Stok Awal ({item.baseUnit})
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="mt-1 h-10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Harga Beli / Modal (opsional)
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Opsional"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="mt-1 h-10"
                />
              </div>
            </div>
          </div>

          {/* Tombol Aksi Lega */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-base font-semibold"
            >
              <X className="mr-1.5 size-4" /> Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 text-base font-bold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Check className="mr-1.5 size-5" /> Simpan & Jual
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
