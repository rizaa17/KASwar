import { Delete } from "lucide-react";
import { appendDigit, backspaceAmount, SHORTCUTS } from "@/lib/money";
import { beep } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Keypad angka raksasa (tombol ≥ 60×60 px) dengan pintasan +1.000 / +10.000 / +50.000. */
export function Keypad({ value, onChange, className }: { value: number; onChange: (n: number) => void; className?: string }) {
  const press = (fn: () => number) => { beep(); onChange(fn()); };
  const key = "num-jumbo touch-lg h-16 rounded-xl bg-secondary text-3xl shadow-sm active:scale-95";
  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-3 gap-2">
        {SHORTCUTS.map((n) => (
          <button key={n} type="button" onClick={() => press(() => Math.min(999_999_999, value + n))} className="touch-lg h-14 rounded-xl border-2 border-primary text-xl font-bold text-primary active:scale-95">
            +{n.toLocaleString("id-ID")}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <button key={d} type="button" aria-label={`Angka ${d}`} onClick={() => press(() => appendDigit(value, d))} className={key}>{d}</button>)}
        <button type="button" aria-label="Dua nol" onClick={() => press(() => appendDigit(appendDigit(value, 0), 0))} className={key}>00</button>
        <button type="button" aria-label="Angka 0" onClick={() => press(() => appendDigit(value, 0))} className={key}>0</button>
        <button type="button" aria-label="Hapus satu angka" onClick={() => press(() => backspaceAmount(value))} className={cn(key, "flex items-center justify-center")}><Delete className="size-8" /></button>
      </div>
    </div>
  );
}
