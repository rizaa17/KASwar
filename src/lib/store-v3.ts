import { applyImport, type RowResult } from "./importer";
import { validateBackupState } from "./backup";
import { CARD_PREFIX, DEFAULT_FLAGS, actions, activeShift, addCash, currentEmployee, deviceId, getState, hashPin, lastClosingCash, logAudit, notifyListeners, requireLocalRole, setState, uid, type CashLoan, type Employee, type Flags, type LostSale, type SavedNumber, type Sale } from "./store";

function need(ok: unknown, msg: string): asserts ok { if (!ok) throw new Error(msg); }
const isMoney = (n: number) => Number.isFinite(n) && n > 0 && n <= 999_999_999;

/** Pinjam Cash (talangan), Buku Titipan, Transaksi Kilat, Lost Sales, login kartu, mulai toko bersih, flag fitur. */
export const actionsV3 = {
  /** Kasir mengeluarkan uang laci untuk pihak ketiga (bukan biaya warung). Saldo laci berkurang. */
  lendCash(person: string, amount: number, note: string): CashLoan {
    const out: { loan?: CashLoan } = {};
    setState((s) => {
      const sh = activeShift(s); const e = currentEmployee(s);
      need(sh && e, "Buka shift dan masuk dahulu");
      need(person.trim(), "Nama orang wajib diisi");
      need(isMoney(amount), "Nominal tidak valid");
      const loan: CashLoan = { id: uid(), ts: Date.now(), person: person.trim(), amount: Math.round(amount), note: note.trim(), shiftId: sh.id, by: e.nickname };
      out.loan = loan;
      return { loans: [...s.loans, loan], cash: addCash(s, -loan.amount, "pinjam cash", `Pinjam Cash · ${loan.person}${loan.note ? ` · ${loan.note}` : ""}`), audit: logAudit(s, e, "Pinjam Cash", `${loan.person} Rp ${loan.amount}`) };
    });
    return out.loan as CashLoan;
  },
  /** Uang ditebus: kembali ke laci aktif, pinjaman ditutup. */
  repayLoan(id: string) {
    setState((s) => {
      const sh = activeShift(s); const e = currentEmployee(s);
      need(sh && e, "Buka shift dan masuk dahulu");
      const loan = s.loans.find((l) => l.id === id);
      need(loan, "Pinjaman tidak ditemukan");
      need(!loan.returnedAt, "Pinjaman sudah lunas");
      return { loans: s.loans.map((l) => (l.id === id ? { ...l, returnedAt: Date.now(), returnedBy: e.nickname } : l)), cash: addCash(s, loan.amount, "pinjam cash kembali", `Kembali · ${loan.person}`), audit: logAudit(s, e, "Pinjam Cash lunas", `${loan.person} Rp ${loan.amount}`) };
    });
  },

  saveNumber(n: Omit<SavedNumber, "id"> & { id?: string }): SavedNumber {
    const e = currentEmployee(); need(e, "Masuk dahulu");
    need(n.nickname.trim(), "Nama panggilan wajib diisi");
    need(n.plnId?.trim() || n.phone?.trim(), "Isi nomor meteran PLN atau nomor HP");
    const rec: SavedNumber = { id: n.id ?? uid(), nickname: n.nickname.trim(), plnId: n.plnId?.replace(/\s/g, "") || undefined, phone: n.phone?.replace(/\s/g, "") || undefined, operator: n.operator?.trim() || undefined, note: n.note?.trim() || undefined };
    setState((s) => ({ savedNumbers: s.savedNumbers.some((x) => x.id === rec.id) ? s.savedNumbers.map((x) => (x.id === rec.id ? rec : x)) : [...s.savedNumbers, rec] }));
    return rec;
  },
  deleteNumber(id: string) { need(currentEmployee(), "Masuk dahulu"); setState((s) => ({ savedNumbers: s.savedNumbers.filter((x) => x.id !== id) })); },

  /** "Barang Dicari Tapi Kosong": dicatat untuk daftar kulakan. */
  lostSale(name: string, productId?: string): LostSale {
    const rec: LostSale = { id: uid(), ts: Date.now(), name: name.trim(), productId, by: currentEmployee()?.nickname };
    need(rec.name, "Tulis nama barang");
    setState((s) => ({ lostSales: [...s.lostSales, rec] }));
    return rec;
  },

  /** Transaksi Kilat: hanya nominal tunai masuk laci, tanpa memilih barang; stok disesuaikan nanti. */
  quickCash(amount: number): Sale {
    const out: { sale?: Sale } = {};
    setState((s) => {
      const sh = activeShift(s); const e = currentEmployee(s);
      need(sh && e && (sh.participants ?? []).includes(e.id), "Pilih pegawai dan gabung shift terlebih dahulu");
      need(isMoney(amount), "Nominal tidak valid");
      const total = Math.round(amount);
      const sale: Sale = { id: uid(), ts: Date.now(), items: [], subtotal: total, adjust: 0, total, paid: total, change: 0, method: "tunai", payments: [{ method: "tunai", amount: total }], shiftId: sh.id, cashierId: e.id, cashierName: e.nickname, deviceId: deviceId(), quick: true };
      out.sale = sale;
      return { sales: [...s.sales, sale], cash: addCash(s, total, "penjualan", `Transaksi Kilat · ${e.nickname}`) };
    });
    return out.sale as Sale;
  },

  /** Kartu barcode statis anggota keluarga: ganti kasir tanpa PIN dan tanpa hitung kas. Laci 24 jam dibuka/diikuti otomatis. */
  loginByCard(raw: string): Employee {
    const code = raw.trim().toUpperCase();
    need(code.startsWith(CARD_PREFIX), "Bukan kartu kasir");
    const e = getState().employees.find((x) => x.active && !x.onLeave && x.barcode && x.barcode.trim().toUpperCase() === code);
    need(e, "Kartu tidak dikenal");
    need(e.role === "Pemilik" || e.role === "Keluarga", "Kartu hanya untuk keluarga. Pegawai masuk dengan PIN");
    sessionStorage.setItem("employee", e.id);
    if (sessionStorage.getItem("owner") !== e.id) sessionStorage.removeItem("owner"); // Pusat Kelola tetap butuh PIN
    const sh = activeShift(getState());
    if (!sh) actions.openShift("", lastClosingCash(getState()));
    else actions.joinShift();
    notifyListeners();
    return e;
  },

  /** Ganti data contoh dengan toko kosong milik pengguna (satu pemilik). */
  async startFreshStore(opts: { shopName: string; ownerName: string; pin: string }): Promise<Employee> {
    need(opts.shopName.trim() && opts.ownerName.trim(), "Nama toko dan nama pemilik wajib diisi");
    need(/^\d{4,6}$/.test(opts.pin), "PIN harus 4–6 digit");
    need(opts.pin !== "1234" && opts.pin !== "0000", "PIN terlalu mudah ditebak");
    const owner: Employee = { id: uid(), name: opts.ownerName.trim(), nickname: opts.ownerName.trim().split(/\s+/)[0] ?? "Pemilik", phone: "", role: "Pemilik", active: true, pinHash: await hashPin(opts.pin) };
    setState(() => ({
      shopName: opts.shopName.trim(), pin: opts.pin, demo: false, employees: [owner],
      products: [], sales: [], customers: [], ledger: [], suppliers: [], payables: [], consigns: [], prive: [], cash: [], shifts: [], held: [], stockMoves: [], shopping: [],
      returns: [], audit: [], deposit: 0, depositMoves: [], ppob: [], transfers: [], loans: [], savedNumbers: [], lostSales: [],
    }));
    sessionStorage.setItem("employee", owner.id); sessionStorage.setItem("owner", owner.id);
    notifyListeners();
    return owner;
  },

  /** Impor stok massal dari hasil validasi: satu penulisan, mutasi stok dan audit tercatat. */
  importProducts(results: RowResult[]): { added: number; updated: number } {
    requireLocalRole(["Pemilik", "Keluarga"]);
    const out = { added: 0, updated: 0 };
    setState((s) => {
      const r = applyImport(results, s.products);
      out.added = r.added; out.updated = r.updated;
      const e = currentEmployee(s); const now = Date.now();
      return {
        products: r.products,
        stockMoves: [...s.stockMoves, ...r.moves.map((m) => ({ id: uid(), ts: now, productId: m.productId, qty: m.qty, reason: m.reason, cashierId: e?.id }))],
        audit: logAudit(s, e, "Impor Excel", `${r.added} barang baru, ${r.updated} diperbarui`),
      };
    });
    return out;
  },

  /** Isi cadangan (sebelum dienkripsi). Sesi login tidak ikut. */
  snapshotForBackup() { return JSON.parse(JSON.stringify(getState())) as ReturnType<typeof getState>; },

  /** Pulihkan dari cadangan. Hanya pemilik, atau perangkat yang masih berisi data contoh (HP baru). Setelah pulih, login ulang dengan PIN dari cadangan. */
  restoreBackup(data: unknown): { products: number; sales: number } {
    const s0 = getState();
    need(s0.demo || currentEmployee(s0)?.role === "Pemilik", "Hanya pemilik yang dapat memulihkan cadangan");
    const bad = validateBackupState(data); need(!bad, bad ?? "");
    const d = data as Partial<ReturnType<typeof getState>> & { products: unknown[]; sales: unknown[] };
    setState(() => ({ ...(d as object), loans: d.loans ?? [], savedNumbers: d.savedNumbers ?? [], lostSales: d.lostSales ?? [], flags: { ...DEFAULT_FLAGS, ...(d.flags ?? {}) }, demo: false, savedAt: Date.now() } as Partial<ReturnType<typeof getState>>));
    sessionStorage.removeItem("employee"); sessionStorage.removeItem("owner");
    notifyListeners();
    return { products: d.products.length, sales: d.sales.length };
  },

  /** Kembalian diganti permen: stok permen warung berkurang 1 butir (tercatat sebagai mutasi stok). Mengembalikan false bila tidak ada produk permen. */
  candyChange(qty = 1): boolean {
    let ok = false;
    setState((s) => {
      const e = currentEmployee(s);
      const candy = s.products.find((p) => !p.digital && !p.bundle && /permen/i.test(p.name));
      if (!candy) return {};
      ok = true;
      return { products: s.products.map((p) => (p.id === candy.id ? { ...p, stock: p.stock - qty } : p)), stockMoves: [...s.stockMoves, { id: uid(), ts: Date.now(), productId: candy.id, qty: -qty, reason: "Kembalian permen", cashierId: e?.id }] };
    });
    return ok;
  },

  setFlag(key: keyof Flags, value: boolean) {
    requireLocalRole(["Pemilik"]);
    need(key in DEFAULT_FLAGS, "Fitur tidak dikenal");
    setState((s) => ({ flags: { ...s.flags, [key]: value }, audit: logAudit(s, currentEmployee(s), "Ubah fitur", `${key}=${value}`) }));
  },
};

/** Pinjam Cash yang belum ditebus. */
export const activeLoans = (loans: CashLoan[]) => loans.filter((l) => !l.returnedAt);

/** Barang dicari pembeli tapi kosong dalam N hari terakhir, dikelompokkan per nama (terbanyak dulu). */
export function lostSalesSummary(lostSales: LostSale[], now = Date.now(), days = 14): { name: string; count: number }[] {
  const from = now - days * 86_400_000;
  const m = new Map<string, { name: string; count: number }>();
  for (const l of lostSales.filter((x) => x.ts >= from)) {
    const k = l.name.trim().toLowerCase(); const cur = m.get(k);
    m.set(k, { name: cur?.name ?? l.name.trim(), count: (cur?.count ?? 0) + 1 });
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}
