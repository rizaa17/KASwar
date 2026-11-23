import { describe, expect, it } from "vitest";
import { applyImport, ean13Check, internalBarcode, parseNumber, summarize, validateRows } from "./importer";
import { makeSeed, type Product } from "./store";

const existing = (): Product[] => makeSeed().products;
const row = (o: Record<string, unknown>) => ({ kode_barcode: "", nama_barang: "Kecap Manis Bango", kategori: "Minuman", satuan_dasar: "Btl", harga_beli_modal: 3500, harga_jual_eceran: 5000, stok_awal: 10, stok_minimum_peringatan: 3, ...o });

describe("parseNumber gaya Indonesia", () => {
  it("angka dan teks", () => {
    expect(parseNumber(17500)).toBe(17500); expect(parseNumber("17.500")).toBe(17500); expect(parseNumber("Rp 17.500")).toBe(17500);
    expect(parseNumber("1.250.000")).toBe(1250000); expect(parseNumber("12,5")).toBe(12.5); expect(parseNumber("abc")).toBe(null); expect(parseNumber("")).toBe(null);
    expect(parseNumber(NaN)).toBe(null);
  });
});

describe("validasi pra-impor 3 warna", () => {
  it("baris valid → hijau (barcode kosong → kuning dan dibuatkan barcode warung)", () => {
    const [a, b] = validateRows([row({ kode_barcode: "8991234567890" }), row({ nama_barang: "Kopi Baru Enak" })], existing(), "baru");
    expect(a.status).toBe("hijau"); expect(a.action).toBe("tambah");
    expect(b.status).toBe("kuning"); expect(b.item?.generatedBarcode).toBe(true); expect(b.item?.barcode.startsWith("20")).toBe(true); expect(b.item?.barcode).toHaveLength(13);
  });
  it("merah: kolom wajib kosong, harga jual < modal, angka salah, barcode kembar di file", () => {
    const rs = validateRows([
      row({ nama_barang: "" }), row({ harga_jual_eceran: 3000 }), row({ harga_beli_modal: "abc" }), row({ stok_awal: -1 }),
      row({ nama_barang: "A1 Satu", kode_barcode: "111222" }), row({ nama_barang: "A2 Dua", kode_barcode: "111222" }),
    ], existing(), "baru");
    expect(rs.slice(0, 4).map((r) => r.status)).toEqual(["merah", "merah", "merah", "merah"]);
    expect(rs[1].messages).toContain("Harga jual lebih kecil dari modal");
    expect(rs[4].status).toBe("hijau"); expect(rs[5].status).toBe("merah");
    expect(rs.slice(0, 4).every((r) => r.action === "tolak")).toBe(true);
  });
  it("mode Tambah Baru melewati yang sudah ada; mode Perbarui menimpa harga dan menambah stok", () => {
    const pr = existing()[0];
    const r = row({ nama_barang: pr.name, kode_barcode: pr.barcode ?? "", harga_beli_modal: 1000, harga_jual_eceran: 2000, stok_awal: 5 });
    expect(validateRows([r], existing(), "baru")[0].action).toBe("lewati");
    const [u] = validateRows([r], existing(), "perbarui");
    expect(u.action).toBe("perbarui");
    const out = applyImport([u], existing());
    const after = out.products.find((p) => p.id === pr.id)!;
    expect(after.stock).toBe(pr.stock + 5);
    expect(after.units[0].price).toBe(2000);
    expect(out.updated).toBe(1); expect(out.moves[0].qty).toBe(5);
  });
  it("grosir valid menambah satuan grosir; grosir tidak valid diabaikan dengan peringatan", () => {
    const [ok, bad, same] = validateRows([row({ harga_grosir_1: 4500, min_qty_1: 10, kode_barcode: "999001" }), row({ nama_barang: "B Dua", harga_grosir_1: 4500, kode_barcode: "999002" }), row({ nama_barang: "C Tiga", harga_grosir_1: 6000, min_qty_1: 5, kode_barcode: "999003" })], existing(), "baru");
    expect(ok.item?.wholesale).toEqual({ minQty: 10, price: 4500 });
    expect(bad.status).toBe("kuning"); expect(bad.item?.wholesale).toBeUndefined();
    expect(same.item?.wholesale).toBeUndefined();
    const out = applyImport([ok], []);
    expect(out.products[0].units).toHaveLength(2);
    expect(out.products[0].units[1].price).toBe(45000);
  });
  it("kategori tidak dikenal → kuning dan Sembako; angka berformat Indonesia diterima", () => {
    const [r] = validateRows([row({ kategori: "Sabun", harga_beli_modal: "Rp 3.500", harga_jual_eceran: "5.000", kode_barcode: "777001" })], [], "baru");
    expect(r.status).toBe("kuning"); expect(r.item?.category).toBe("Sembako"); expect(r.item?.price).toBe(5000);
  });
  it("ringkasan dan penerapan: baris merah tidak ikut", () => {
    const rs = validateRows([row({ kode_barcode: "555001" }), row({ nama_barang: "" })], [], "baru");
    expect(summarize(rs)).toEqual({ hijau: 1, kuning: 0, merah: 1, diimpor: 1 });
    const out = applyImport(rs, []);
    expect(out.products).toHaveLength(1); expect(out.added).toBe(1); expect(out.moves).toHaveLength(1);
  });
  it("barcode otomatis unik walau banyak baris tanpa barcode, dan digit cek EAN-13 benar", () => {
    const rs = validateRows([1, 2, 3, 4, 5].map((n) => row({ nama_barang: `Barang Tanpa Kode ${n}` })), [], "baru");
    const codes = rs.map((r) => r.item?.barcode);
    expect(new Set(codes).size).toBe(5);
    expect(ean13Check("400638133393")).toBe(1); // EAN-13 sah: 4006381333931
    expect(internalBarcode(1)).toBe("2000000000010".slice(0, 12) + ean13Check("200000000001"));
  });
});
