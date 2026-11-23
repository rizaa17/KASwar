/**
 * Master Katalog SKU Warung Indonesia (Offline Synchronous Lookup)
 * Berisi 1.154 data produk ritel/FMCG populer warung Indonesia.
 */
import rawCatalog from "./master-catalog.json";
import type { Product } from "@/lib/store";

export type CatalogItem = {
  barcode: string;
  name: string;
  category: string;
  baseUnit: string;
};

const catalogMap = new Map<string, CatalogItem>();

// Build map on module load for instant synchronous zero-latency lookup
(rawCatalog as CatalogItem[]).forEach((item) => {
  if (item.barcode) {
    catalogMap.set(item.barcode, item);
    // Dukung juga varian scanner tanpa leading zero (misal barcode scanner membaca tanpa awalan 0)
    if (item.barcode.startsWith("0")) {
      catalogMap.set(item.barcode.replace(/^0+/, ""), item);
    }
  }
});

export function lookupBarcode(barcode: string): CatalogItem | undefined {
  if (!barcode) return undefined;
  const cleaned = barcode.trim();
  return (
    catalogMap.get(cleaned) ||
    catalogMap.get(cleaned.replace(/^0+/, "")) ||
    catalogMap.get("0" + cleaned)
  );
}

export function getAllCatalogItems(): CatalogItem[] {
  return rawCatalog as CatalogItem[];
}

export function toProductCategory(cat: string): Product["category"] {
  const c = cat.toLowerCase();
  if (c.includes("rokok")) return "Rokok";
  if (c.includes("minuman") || c.includes("kopi") || c.includes("susu")) return "Minuman";
  if (c.includes("jajan") || c.includes("snack") || c.includes("biskuit")) return "Jajan";
  if (c.includes("curah")) return "Curah";
  return "Sembako";
}

export function getCatalogEmoji(name: string, category: string): string {
  const n = name.toUpperCase();
  const c = category.toUpperCase();
  if (n.includes("INDOMIE") || n.includes("MIE") || n.includes("SEDAAP") || n.includes("SARIMI") || n.includes("POP MIE")) return "🍜";
  if (n.includes("KOPI") || n.includes("COFFEE") || n.includes("KAPAL API") || n.includes("TORABIKA") || n.includes("GOOD DAY") || n.includes("LUWAK")) return "☕";
  if (n.includes("AQUA") || n.includes("MINERALE") || n.includes("AIR")) return "💧";
  if (n.includes("TEH") || n.includes("PUCUK") || n.includes("SOSRO")) return "🧃";
  if (n.includes("SUSU") || n.includes("BEAR BRAND") || n.includes("ULTRA MILK") || n.includes("MILO") || n.includes("BENDERA")) return "🥛";
  if (n.includes("ROKOK") || n.includes("SURYA") || n.includes("SAMPOERNA") || n.includes("DJARUM") || n.includes("MARLBORO") || n.includes("DJI SAM SOE")) return "🚬";
  if (n.includes("MINYAK") || n.includes("BIMOLI") || n.includes("SANIA") || n.includes("MINYAKITA")) return "🫗";
  if (n.includes("GULA")) return "🍬";
  if (n.includes("BERAS")) return "🌾";
  if (n.includes("BODREX") || n.includes("PARAMEX") || n.includes("PANADOL") || n.includes("PROMAG") || n.includes("TOLAK ANGIN") || n.includes("OBAT") || n.includes("TABLET")) return "💊";
  if (n.includes("SABUN") || n.includes("SUNLIGHT") || n.includes("RINSO") || n.includes("LIFEBUOY") || n.includes("DAIA") || n.includes("SO KLIN")) return "🧼";
  if (n.includes("SHAMPO") || n.includes("PANTENE") || n.includes("CLEAR") || n.includes("SUNSILK")) return "🧴";
  if (n.includes("ODOL") || n.includes("PEPSODENT") || n.includes("CIPTADENT") || n.includes("FORMULA")) return "🪥";
  if (n.includes("BENG-BENG") || n.includes("ROMA") || n.includes("OREO") || n.includes("BISKUIT") || n.includes("CHITATO") || n.includes("QTELA") || n.includes("NABATI") || n.includes("WAFER")) return "🍪";
  if (n.includes("PERMEN") || n.includes("KOPIKO") || n.includes("RELAXA") || n.includes("KIS") || n.includes("YUPI")) return "🍬";
  if (c.includes("MINUMAN")) return "🧃";
  if (c.includes("ROKOK")) return "🚬";
  if (c.includes("JAJAN")) return "🍪";
  return "📦";
}
