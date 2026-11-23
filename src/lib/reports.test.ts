import { beforeEach, describe, expect, it } from "vitest";
import { actions, getState, resetData, setState } from "./store";
import { actionsV3 } from "./store-v3";
import { dayStats } from "./operations";
import { REPORTS, buildReport, headerRowIndex, sheetToAoA } from "./reports";

const as = (id: string) => sessionStorage.setItem("employee", id);
const ALL: [number, number] = [0, Date.now() + 86_400_000];

describe("7 laporan Excel", () => {
  beforeEach(() => { resetData(); sessionStorage.clear(); as("e1"); actions.openShift("", 100000); });

  it("ada tepat 7 laporan dan semuanya bisa dibangun dari data contoh", () => {
    expect(REPORTS).toHaveLength(7);
    for (const r of REPORTS) {
      const sheets = buildReport(r.id, getState(), ALL[0], ALL[1]);
      expect(sheets.length).toBeGreaterThan(0);
      for (const sh of sheets) { expect(sh.headers).toHaveLength(sh.fmts.length); for (const row of sh.rows) expect(row).toHaveLength(sh.headers.length); }
    }
  });
  it("laba rugi konsisten dengan dayStats, prive hanya memo, pinjam cash bukan biaya", () => {
    actionsV3.lendCash("Mas Danang", 65000, "COD");
    const d = dayStats(getState(), ...ALL);
    const [sh] = buildReport("labarugi", getState(), ...ALL);
    const val = (label: string) => Number(sh.rows.find((r) => String(r[0]).startsWith(label))?.[1]);
    expect(val("Omzet")).toBe(d.omzet);
    expect(val("LABA BERSIH")).toBe(d.net);
    expect(val("LABA KOTOR")).toBe(d.gross);
    expect(val("Memo: Prive")).toBe(d.prive);
    expect(d.beban).toBe(15000); // hanya "Plastik kresek"; talangan 65.000 tidak ikut
  });
  it("barang rusak mengurangi laba bersih sebesar jumlah × HPP", () => {
    const before = dayStats(getState(), ...ALL);
    const kopi = getState().products.find((p) => p.id === "kopi")!;
    actions.adjustStock("kopi", kopi.stock - 3, "Basi / rusak / hama", "melempem");
    const after = dayStats(getState(), ...ALL);
    expect(after.rusak).toBe(Math.round(3 * kopi.hpp));
    expect(Math.round(before.net - after.net)).toBe(Math.round(3 * kopi.hpp));
    const [rusak] = buildReport("rusak", getState(), ...ALL);
    expect(rusak.rows).toHaveLength(1);
  });
  it("konsumsi rumah tangga bukan kerugian rusak (masuk prive)", () => {
    const kopi = getState().products.find((p) => p.id === "kopi")!;
    actions.adjustStock("kopi", kopi.stock - 1, "Konsumsi rumah tangga", "");
    expect(dayStats(getState(), ...ALL).rusak).toBe(0);
  });
  it("transaksi kilat tampil sebagai metode Transaksi Kilat dan ditandai di memo laba rugi", () => {
    actionsV3.quickCash(12000);
    const [t] = buildReport("transaksi", getState(), ...ALL);
    expect(t.rows.some((r) => r[5] === "Transaksi Kilat")).toBe(true);
    const [lr] = buildReport("labarugi", getState(), ...ALL);
    expect(Number(lr.rows.find((r) => String(r[0]).startsWith("Memo: Transaksi Kilat"))?.[1])).toBe(12000);
  });
  it("stok: total nilai = Σ stok × HPP dan barang digital tidak ikut", () => {
    const [sh] = buildReport("stok", getState(), ...ALL);
    const total = sh.rows.at(-1)?.[5];
    const expected = getState().products.filter((p) => !p.digital && !p.bundle).reduce((a, p) => a + Math.round(p.stock * p.hpp), 0);
    expect(total).toBe(expected);
    expect(sh.rows.some((r) => String(r[0]).includes("Pulsa"))).toBe(false);
  });
  it("kasbon: saldo sesuai buku, diurutkan hutang terbesar", () => {
    const [sh] = buildReport("kasbon", getState(), ...ALL);
    expect(sh.rows[0][0]).toBe("Pak Joko (Ojol)");
    expect(sh.rows[0][3]).toBe(135000);
  });
  it("hutang supplier: sisa dan status", () => {
    const [sh] = buildReport("hutang", getState(), ...ALL, Date.now());
    expect(sh.rows[0][6]).toBe(550000);
    expect(sh.rows[0][7]).toBe("Belum jatuh tempo");
  });
  it("barang dicari kosong dikelompokkan dan dihitung", () => {
    actionsV3.lostSale("Kecap ABC"); actionsV3.lostSale("kecap abc"); actionsV3.lostSale("Susu Kental");
    const sheets = buildReport("rusak", getState(), ...ALL);
    const kosong = sheets[1].rows;
    expect(kosong[0][0]).toBe("kecap abc");
    expect(kosong[0][1]).toBe(2);
  });
  it("AoA aman dari formula injection dan header ada di baris yang benar", () => {
    setState((s) => ({ customers: [...s.customers, { id: "cx", name: "=HYPERLINK(\"x\")", phone: "", limit: 0, payday: 1 }] }));
    const [sh] = buildReport("kasbon", getState(), ...ALL);
    const aoa = sheetToAoA(sh);
    expect(aoa[headerRowIndex(sh)]).toEqual(sh.headers);
    expect(aoa.some((r) => r.some((c) => typeof c === "string" && c.startsWith("'=HYPERLINK")))).toBe(true);
  });
});
