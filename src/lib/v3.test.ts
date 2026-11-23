import { beforeEach, describe, expect, it } from "vitest";
import { actions, activeShift, currentEmployee, expectedCash, getState, lastClosingCash, loginEmployee, fromPersisted, resetData, saveEmployee, setState, type Employee } from "./store";
import { actionsV3, activeLoans, lostSalesSummary } from "./store-v3";
import { validateRows } from "./importer";
import { decryptBackup, encryptBackup } from "./backup";

const as = (id: string) => sessionStorage.setItem("employee", id);
const giveCard = (id: string, code: string) => setState((s) => ({ employees: s.employees.map((e): Employee => (e.id === id ? { ...e, barcode: code } : e)) }));
const addFamily = () => setState((s) => ({ employees: [...s.employees, { id: "e4", name: "Rina", nickname: "Rina", phone: "", role: "Keluarga", active: true, pinHash: "x", barcode: "USR-RINA" }] }));

describe("Mode Keluarga (laci bersama 24 jam)", () => {
  beforeEach(() => { resetData(); sessionStorage.clear(); giveCard("e1", "USR-SRI"); addFamily(); });

  it("scan kartu membuka laci keluarga otomatis dan anggota lain bergabung tanpa hitung kas", () => {
    actionsV3.loginByCard("usr-sri");
    const sh = activeShift(getState());
    expect(sh?.mode).toBe("keluarga");
    expect(sh?.opening).toBe(0);
    expect(currentEmployee()?.id).toBe("e1");
    actionsV3.loginByCard("USR-RINA");
    expect(currentEmployee()?.id).toBe("e4");
    expect(getState().shifts).toHaveLength(1);
    expect(activeShift(getState())?.participants).toEqual(["e1", "e4"]);
  });
  it("kartu tidak mengaktifkan Pusat Kelola (tetap butuh PIN)", () => {
    actionsV3.loginByCard("USR-SRI");
    expect(sessionStorage.getItem("owner")).toBe(null);
  });
  it("kartu pegawai ditolak, kartu tidak dikenal ditolak, barcode barang bukan kartu", () => {
    setState((s) => ({ employees: s.employees.map((e) => (e.id === "e2" ? { ...e, barcode: "USR-SITI" } : e)) }));
    expect(() => actionsV3.loginByCard("USR-SITI")).toThrow();
    expect(() => actionsV3.loginByCard("USR-XXX")).toThrow();
    expect(() => actionsV3.loginByCard("8998866200318")).toThrow();
  });
  it("pegawai tidak boleh bergabung ke laci keluarga", () => {
    actionsV3.loginByCard("USR-SRI");
    as("e2");
    expect(() => actions.joinShift()).toThrow();
  });
  it("tutup laci harian: siapa pun anggota keluarga, hitung fisik opsional, tanpa alasan selisih", () => {
    actionsV3.loginByCard("USR-SRI");
    actionsV3.loginByCard("USR-RINA");
    actions.closeShift(NaN, 0);
    const sh = getState().shifts[0];
    expect(sh.closedAt !== undefined).toBe(true);
    expect(sh.counted).toBe(sh.expected);
    expect(activeShift(getState())).toBeUndefined();
  });
  it("tutup laci keluarga dengan hitung fisik berbeda tetap sah dan dicatat", () => {
    actionsV3.loginByCard("USR-SRI");
    actionsV3.quickCash(50000);
    actions.closeShift(49000, 50000);
    expect(getState().shifts[0].counted).toBe(49000);
    expect(getState().shifts[0].expected).toBe(50000);
  });
  it("saldo awal laci berikutnya = kas hasil tutup terakhir", () => {
    actionsV3.loginByCard("USR-SRI");
    actionsV3.quickCash(80000);
    actions.closeShift(80000, 80000);
    expect(lastClosingCash(getState())).toBe(80000);
    actionsV3.loginByCard("USR-RINA");
    expect(activeShift(getState())?.opening).toBe(80000);
  });
  it("mode pegawai: tidak ada penutupan oleh anggota selain penanggung jawab, selisih wajib alasan", async () => {
    as("e3"); actions.openShift("", 100000);
    expect(activeShift(getState())?.mode).toBe("pegawai");
    as("e2"); actions.joinShift();
    expect(() => actions.closeShift(100000, 100000)).toThrow();
    as("e3");
    expect(() => actions.closeShift(90000, 100000)).toThrow();
    actions.closeShift(90000, 100000, "kembalian salah");
    expect(getState().shifts[0].note).toBe("kembalian salah");
    void loginEmployee;
  });
});

describe("Pinjam Cash", () => {
  beforeEach(() => { resetData(); sessionStorage.clear(); as("e1"); actions.openShift("", 100000); });
  it("mengurangi laci, bukan biaya; tebus mengembalikan ke laci", () => {
    const loan = actionsV3.lendCash("Mas Danang J&T", 65000, "Talangan COD sepatu");
    const sh = activeShift(getState())!;
    expect(expectedCash(getState(), sh)).toBe(35000);
    expect(activeLoans(getState().loans)).toHaveLength(1);
    expect(getState().cash.at(-1)?.kind).toBe("pinjam cash");
    actionsV3.repayLoan(loan.id);
    expect(expectedCash(getState(), sh)).toBe(100000);
    expect(activeLoans(getState().loans)).toHaveLength(0);
    expect(() => actionsV3.repayLoan(loan.id)).toThrow();
  });
  it("validasi masukan", () => {
    expect(() => actionsV3.lendCash("", 1000, "")).toThrow();
    expect(() => actionsV3.lendCash("Bu RT", 0, "")).toThrow();
    expect(() => actionsV3.lendCash("Bu RT", -5, "")).toThrow();
    expect(() => actionsV3.lendCash("Bu RT", NaN, "")).toThrow();
  });
  it("tebus di shift berikutnya masuk ke laci yang aktif saat itu", () => {
    const loan = actionsV3.lendCash("Pak Joko", 20000, "pinjam kembalian");
    actions.closeShift(80000, 80000);
    as("e1"); actions.openShift("", 80000);
    actionsV3.repayLoan(loan.id);
    expect(expectedCash(getState(), activeShift(getState())!)).toBe(100000);
  });
  it("wajib ada shift aktif", () => {
    actions.closeShift(100000, 100000);
    expect(() => actionsV3.lendCash("Bu RT", 1000, "")).toThrow();
  });
});

describe("Transaksi Kilat, Buku Titipan, Lost Sales", () => {
  beforeEach(() => { resetData(); sessionStorage.clear(); as("e1"); actions.openShift("", 0); });
  it("transaksi kilat menambah kas laci, tercatat sebagai penjualan tanpa item", () => {
    const sale = actionsV3.quickCash(12000);
    expect(sale.quick).toBe(true);
    expect(sale.items).toHaveLength(0);
    expect(expectedCash(getState(), activeShift(getState())!)).toBe(12000);
    expect(getState().sales.at(-1)?.id).toBe(sale.id);
    expect(() => actionsV3.quickCash(0)).toThrow();
  });
  it("buku titipan: simpan, ubah, hapus; wajib nama dan satu nomor", () => {
    const n = actionsV3.saveNumber({ nickname: "Bu Ani", plnId: "1401 2345 6789" });
    expect(getState().savedNumbers.find((x) => x.id === n.id)?.plnId).toBe("140123456789");
    expect(() => actionsV3.saveNumber({ nickname: "", plnId: "1" })).toThrow();
    expect(() => actionsV3.saveNumber({ nickname: "X" })).toThrow();
    actionsV3.saveNumber({ id: n.id, nickname: "Bu Ani RT 1", phone: "0812" });
    expect(getState().savedNumbers.find((x) => x.id === n.id)?.nickname).toBe("Bu Ani RT 1");
    actionsV3.deleteNumber(n.id);
    expect(getState().savedNumbers.some((x) => x.id === n.id)).toBe(false);
  });
  it("lost sales tercatat", () => {
    actionsV3.lostSale("Kecap ABC"); expect(getState().lostSales).toHaveLength(1);
    expect(() => actionsV3.lostSale("  ")).toThrow();
  });
});

describe("Mulai toko bersih dan flag fitur", () => {
  beforeEach(() => { resetData(); sessionStorage.clear(); });
  it("mengganti data contoh dengan toko kosong dan satu pemilik", async () => {
    expect(getState().demo).toBe(true);
    await expect(actionsV3.startFreshStore({ shopName: "Warung Pak Dedi", ownerName: "Dedi Kurnia", pin: "1234" })).rejects.toThrow();
    const o = await actionsV3.startFreshStore({ shopName: "Warung Pak Dedi", ownerName: "Dedi Kurnia", pin: "468024" });
    const s = getState();
    expect(s.demo).toBe(false);
    expect(s.products).toHaveLength(0);
    expect(s.sales).toHaveLength(0);
    expect(s.employees).toHaveLength(1);
    expect(s.employees[0].id).toBe(o.id);
    expect(s.shopName).toBe("Warung Pak Dedi");
    expect(sessionStorage.getItem("owner")).toBe(o.id);
  });
  it("flag fitur ekstra mati secara bawaan dan hanya pemilik yang mengubah", () => {
    const f = getState().flags;
    expect(f.multiCabang || f.gudang || f.qris || f.ppobProvider || f.aiCloud).toBe(false);
    as("e2");
    expect(() => actionsV3.setFlag("qris", true)).toThrow();
    as("e1");
    actionsV3.setFlag("qris", true);
    expect(getState().flags.qris).toBe(true);
  });
});

describe("Impor Excel dan pemulihan cadangan", () => {
  beforeEach(() => { resetData(); sessionStorage.clear(); });
  const baris = (o: Record<string, unknown>) => ({ kode_barcode: "", nama_barang: "Kecap Manis Bango", kategori: "Minuman", satuan_dasar: "Btl", harga_beli_modal: 3500, harga_jual_eceran: 5000, stok_awal: 10, stok_minimum_peringatan: 3, ...o });
  it("impor menulis produk, mutasi stok, dan audit sekali; kasir biasa ditolak", () => {
    const rs = validateRows([baris({ kode_barcode: "8990001" }), baris({ nama_barang: "" })], getState().products, "baru");
    as("e2");
    expect(() => actionsV3.importProducts(rs)).toThrow();
    as("e1");
    const n0 = getState().products.length; const m0 = getState().stockMoves.length;
    expect(actionsV3.importProducts(rs)).toEqual({ added: 1, updated: 0 });
    expect(getState().products).toHaveLength(n0 + 1);
    expect(getState().stockMoves).toHaveLength(m0 + 1);
    expect(getState().audit.at(-1)?.action).toBe("Impor Excel");
  });
  it("cadangan → pulihkan di perangkat baru mengembalikan data dan memaksa login ulang", async () => {
    as("e1"); actions.openShift("", 50000); actionsV3.quickCash(7000);
    const snap = actionsV3.snapshotForBackup();
    const enc = await encryptBackup(snap, "sandi-rahasia", 10_000);
    resetData(); sessionStorage.clear();
    expect(getState().sales.length).toBeGreaterThan(0);
    await actionsV3.startFreshStore({ shopName: "Toko Lain", ownerName: "Orang Lain", pin: "468024" });
    expect(getState().shopName).toBe("Toko Lain");
    const data = await decryptBackup(enc, "sandi-rahasia");
    expect(() => actionsV3.restoreBackup(data)).not.toThrow();
    expect(getState().shopName).toBe("Warung Bu Sri");
    expect(getState().shifts).toHaveLength(1);
    expect(getState().demo).toBe(false);
    expect(currentEmployee()).toBeUndefined();
    await loginEmployee("e1", "1234");
    expect(currentEmployee()?.id).toBe("e1");
  });
  it("pemulihan ditolak bila bukan pemilik dan toko sudah nyata; cadangan rusak ditolak", async () => {
    await actionsV3.startFreshStore({ shopName: "Toko Nyata", ownerName: "Dedi", pin: "468024" });
    as("nobody");
    expect(() => actionsV3.restoreBackup(actionsV3.snapshotForBackup())).toThrow();
    resetData();
    expect(() => actionsV3.restoreBackup({ products: [] })).toThrow();
  });
});

describe("Kartu kasir, permen, dan ringkasan barang dicari", () => {
  beforeEach(() => { resetData(); sessionStorage.clear(); as("e1"); });
  const keluarga = (o: Partial<Employee>): Employee => ({ id: "n1", name: "Rina Anak", nickname: "Rina", phone: "", role: "Keluarga", active: true, pinHash: "", ...o });
  it("kode kartu divalidasi: awalan, unik, bukan untuk pegawai", async () => {
    await saveEmployee(keluarga({ barcode: "usr-rina" }), "482913");
    expect(getState().employees.find((e) => e.id === "n1")?.barcode).toBe("USR-RINA");
    await expect(saveEmployee(keluarga({ id: "n2", name: "Dedi", nickname: "Dedi", barcode: "USR-RINA" }), "590218")).rejects.toThrow();
    await expect(saveEmployee(keluarga({ id: "n3", name: "Eko", nickname: "Eko", barcode: "RINA" }), "671204")).rejects.toThrow();
    await expect(saveEmployee(keluarga({ id: "n4", name: "Gita", nickname: "Gita", role: "Kasir", barcode: "USR-GITA" }), "712345")).rejects.toThrow();
  });
  it("kembalian permen mengurangi stok permen dan menulis mutasi stok", () => {
    const before = getState().products.find((p) => /permen/i.test(p.name))!.stock;
    expect(actionsV3.candyChange(2)).toBe(true);
    expect(getState().products.find((p) => /permen/i.test(p.name))!.stock).toBe(before - 2);
    expect(getState().stockMoves.at(-1)?.reason).toBe("Kembalian permen");
    setState((s) => ({ products: s.products.filter((p) => !/permen/i.test(p.name)) }));
    expect(actionsV3.candyChange()).toBe(false);
  });
  it("ringkasan barang dicari: 14 hari, per nama tanpa beda huruf besar", () => {
    const now = Date.now();
    const rs = lostSalesSummary([{ id: "1", ts: now, name: "Kecap ABC" }, { id: "2", ts: now - 1000, name: "kecap abc" }, { id: "3", ts: now - 20 * 86_400_000, name: "Lama" }, { id: "4", ts: now, name: "Susu" }], now, 14);
    expect(rs).toEqual([{ name: "Kecap ABC", count: 2 }, { name: "Susu", count: 1 }]);
  });
});

describe("Migrasi data v2", () => {
  it("data lama tanpa kunci baru dianggap nyata, kunci baru terisi bawaan, flag ekstra mati", () => {
    const { loans, savedNumbers, lostSales, flags, demo, ...lama } = JSON.parse(JSON.stringify(getState()));
    void loans; void savedNumbers; void lostSales; void flags; void demo;
    const s = fromPersisted(lama);
    expect(s.demo).toBe(false);
    expect(s.loans).toEqual([]);
    expect(s.flags.qris).toBe(false);
    expect(s.products.length).toBe(lama.products.length);
  });
  it("flag sebagian digabung dengan bawaan; demo tersimpan dipertahankan", () => {
    const s = fromPersisted({ demo: true, flags: { qris: true } });
    expect(s.demo).toBe(true);
    expect(s.flags.qris).toBe(true);
    expect(s.flags.gudang).toBe(false);
  });
});
