import { beforeEach, describe, expect, it } from "vitest";
import { lookupBarcode, getCatalogEmoji, toProductCategory, getAllCatalogItems } from "../data/catalog";
import { actions, getState, resetData, type Product, uid } from "./store";

describe("Integrasi Master Katalog 1.154 SKU", () => {
  beforeEach(() => {
    resetData();
    sessionStorage.clear();
    sessionStorage.setItem("employee", "e1"); // Login sebagai Pemilik
  });

  it("memuat seluruh 1.154 item katalog dengan valid", () => {
    const all = getAllCatalogItems();
    expect(all.length).toBeGreaterThanOrEqual(1150);
  });

  it("mengenali barcode populer dengan dan tanpa leading zero", () => {
    // Indomie Goreng
    const indomie1 = lookupBarcode("089686010947");
    const indomie2 = lookupBarcode("89686010947");
    expect(indomie1).toBeDefined();
    expect(indomie1?.name).toContain("Indomie");
    expect(indomie2?.name).toBe(indomie1?.name);

    // Aqua 600ml
    const aqua = lookupBarcode("8886008101053");
    expect(aqua).toBeDefined();
    expect(aqua?.name).toContain("Aqua");

    // Kopi Kapal Api
    const kopi = lookupBarcode("8991002105423");
    expect(kopi).toBeDefined();
    expect(kopi?.name).toContain("Kapal Api");

    // Rokok Surya
    const surya = lookupBarcode("8998989100168");
    expect(surya).toBeDefined();
    expect(surya?.name).toContain("Surya");

    // Bodrex
    const bodrex = lookupBarcode("8999908000200");
    expect(bodrex).toBeDefined();
    expect(bodrex?.name).toContain("Bodrex");

    // Sunlight
    const sunlight = lookupBarcode("8999999000721");
    expect(sunlight).toBeDefined();
    expect(sunlight?.name).toContain("SUNLIGHT");
  });

  it("memetakan kategori katalog ke 7 kategori produk warung", () => {
    expect(toProductCategory("Mi Instan")).toBe("Sembako");
    expect(toProductCategory("Rokok")).toBe("Rokok");
    expect(toProductCategory("Minuman Dingin & Susu")).toBe("Minuman");
    expect(toProductCategory("Kopi & Minuman Sachet")).toBe("Minuman");
    expect(toProductCategory("Jajan & Snack")).toBe("Jajan");
    expect(toProductCategory("Obat Warung / P3K")).toBe("Sembako");
  });

  it("memberikan emoji yang sesuai", () => {
    expect(getCatalogEmoji("Indomie Goreng", "Mi Instan")).toBe("🍜");
    expect(getCatalogEmoji("Kopi Kapal Api", "Kopi")).toBe("☕");
    expect(getCatalogEmoji("Gudang Garam Surya", "Rokok")).toBe("🚬");
    expect(getCatalogEmoji("Aqua Botol", "Minuman")).toBe("💧");
  });

  it("dapat mendaftarkan produk baru dari katalog langsung ke inventaris toko", () => {
    const item = lookupBarcode("089686010947");
    expect(item).toBeDefined();

    const newProd: Product = {
      id: uid(),
      name: item!.name,
      emoji: getCatalogEmoji(item!.name, item!.category),
      category: toProductCategory(item!.category),
      baseUnit: item!.baseUnit,
      stock: 24,
      hpp: 3000,
      minStock: 5,
      barcode: item!.barcode,
      units: [{ name: item!.baseUnit, factor: 1, price: 3500 }],
    };

    actions.saveProduct(newProd);

    const s = getState();
    const saved = s.products.find((p) => p.barcode === "089686010947");
    expect(saved).toBeDefined();
    expect(saved?.name).toContain("Indomie");
    expect(saved?.units[0].price).toBe(3500);
    expect(saved?.stock).toBe(24);
  });
});
