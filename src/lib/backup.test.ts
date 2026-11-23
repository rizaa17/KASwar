import { describe, expect, it } from "vitest";
import { decryptBackup, encryptBackup, validateBackupState } from "./backup";
import { makeSeed } from "./store";

describe("cadangan terenkripsi", () => {
  it("bolak-balik data utuh, ciphertext tidak memuat teks asli", async () => {
    const s = makeSeed();
    const enc = await encryptBackup(s, "rahasia123", 10_000);
    expect(enc.includes("Warung Bu Sri")).toBe(false);
    const dec = await decryptBackup<typeof s>(enc, "rahasia123");
    expect(dec.shopName).toBe("Warung Bu Sri");
    expect(dec.products).toHaveLength(s.products.length);
    expect(validateBackupState(dec)).toBe(null);
  });
  it("kata sandi salah, file rusak, dan file asing ditolak", async () => {
    const enc = await encryptBackup({ a: 1 }, "rahasia123", 10_000);
    await expect(decryptBackup(enc, "salah-sandi")).rejects.toThrow();
    const env = JSON.parse(enc); env.data = env.data.slice(0, -8) + "AAAAAAAA";
    await expect(decryptBackup(JSON.stringify(env), "rahasia123")).rejects.toThrow();
    await expect(decryptBackup("bukan json", "x")).rejects.toThrow();
    await expect(decryptBackup(JSON.stringify({ app: "lain" }), "x")).rejects.toThrow();
  });
  it("kata sandi pendek ditolak; dua enkripsi berbeda (salt/iv acak)", async () => {
    await expect(encryptBackup({}, "123", 10_000)).rejects.toThrow();
    expect((await encryptBackup({ a: 1 }, "rahasia123", 10_000)) === (await encryptBackup({ a: 1 }, "rahasia123", 10_000))).toBe(false);
  });
  it("validasi bentuk cadangan", () => {
    expect(validateBackupState(null)).toBe("Isi cadangan tidak valid");
    expect(validateBackupState({})?.includes("tidak lengkap")).toBe(true);
    const s = makeSeed(); expect(validateBackupState({ ...s, employees: [] })).toBe("Cadangan tidak berisi pemilik aktif");
  });
});
