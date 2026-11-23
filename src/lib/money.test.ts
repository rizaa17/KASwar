import { describe, expect, it } from "vitest";
import { appendDigit, backspaceAmount, formatQty, kalimatKembalian, nominalToQty, roundRupiah, terbilang } from "./money";

describe("terbilang", () => {
  const cases: [number, string][] = [
    [0, "nol"], [1, "satu"], [10, "sepuluh"], [11, "sebelas"], [12, "dua belas"], [19, "sembilan belas"], [20, "dua puluh"], [21, "dua puluh satu"],
    [100, "seratus"], [101, "seratus satu"], [111, "seratus sebelas"], [200, "dua ratus"], [999, "sembilan ratus sembilan puluh sembilan"],
    [1000, "seribu"], [1500, "seribu lima ratus"], [2000, "dua ribu"], [11000, "sebelas ribu"], [25000, "dua puluh lima ribu"], [100000, "seratus ribu"],
    [101000, "seratus satu ribu"], [1000000, "satu juta"], [1250000, "satu juta dua ratus lima puluh ribu"], [2000000000, "dua miliar"],
  ];
  for (const [n, kata] of cases) it(`${n} → ${kata}`, () => expect(terbilang(n)).toBe(kata));
  it("negatif, pecahan dibulatkan, bukan angka kosong", () => {
    expect(terbilang(-500)).toBe("minus lima ratus");
    expect(terbilang(1499.6)).toBe("seribu lima ratus");
    expect(terbilang(NaN)).toBe("");
  });
  it("kalimat kembalian", () => {
    expect(kalimatKembalian(25000)).toBe("Kembalian dua puluh lima ribu rupiah");
    expect(kalimatKembalian(0)).toBe("Uang pas. Terima kasih");
  });
});

describe("nominal ke kuantitas", () => {
  it("harga pas menghasilkan 1", () => expect(nominalToQty(15000, 15000)).toBe(1));
  it("subtotal tetap sama dengan nominal walau qty tidak bulat", () => {
    const qty = nominalToQty(15000, 13000);
    expect(Math.round(qty * 13000)).toBe(15000);
    expect(formatQty(qty)).toBe("1,154");
  });
  it("masukan tidak valid menghasilkan 0", () => {
    expect(nominalToQty(0, 1000)).toBe(0);
    expect(nominalToQty(1000, 0)).toBe(0);
    expect(nominalToQty(-5, 1000)).toBe(0);
  });
  it("format kuantitas", () => { expect(formatQty(0.25)).toBe("0,25"); expect(formatQty(2)).toBe("2"); expect(formatQty(0.5)).toBe("0,5"); });
});

describe("keypad dan pembulatan", () => {
  it("menambah digit dan menghapus", () => {
    let n = 0; for (const d of [5, 0, 0, 0, 0]) n = appendDigit(n, d);
    expect(n).toBe(50000);
    expect(backspaceAmount(n)).toBe(5000);
    expect(backspaceAmount(0)).toBe(0);
  });
  it("batas nominal", () => { expect(appendDigit(999_999_999, 1)).toBe(999_999_999); expect(appendDigit(5, 12)).toBe(5); });
  it("pembulatan ke kelipatan", () => { expect(roundRupiah(1740, 500)).toBe(1500); expect(roundRupiah(1760, 500)).toBe(2000); expect(roundRupiah(1740.4)).toBe(1740); });
});
