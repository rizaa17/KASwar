/** Pencadangan terenkripsi (AES-GCM 256, kunci dari kata sandi via PBKDF2-SHA256). Semua di browser, tanpa server. */
export const BACKUP_VERSION = 1;
export const PBKDF2_ITER = 250_000;
type Envelope = { app: "pasar-pintar"; v: number; kdf: "PBKDF2-SHA256"; iter: number; salt: string; iv: string; data: string; at: string };

const b64 = (u: Uint8Array) => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (t: string) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));

async function key(pass: string, salt: Uint8Array, iter: number) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt as BufferSource, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptBackup(data: unknown, passphrase: string, iter = PBKDF2_ITER): Promise<string> {
  if (passphrase.length < 6) throw new Error("Kata sandi cadangan minimal 6 karakter");
  const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await key(passphrase, salt, iter);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, k, new TextEncoder().encode(JSON.stringify(data))));
  const env: Envelope = { app: "pasar-pintar", v: BACKUP_VERSION, kdf: "PBKDF2-SHA256", iter, salt: b64(salt), iv: b64(iv), data: b64(ct), at: new Date().toISOString() };
  return JSON.stringify(env);
}

export async function decryptBackup<T = unknown>(text: string, passphrase: string): Promise<T> {
  let env: Envelope;
  try { env = JSON.parse(text) as Envelope; } catch { throw new Error("File cadangan tidak dikenali"); }
  if (env?.app !== "pasar-pintar" || env.v !== BACKUP_VERSION || !env.salt || !env.iv || !env.data) throw new Error("File cadangan tidak dikenali");
  if (!Number.isInteger(env.iter) || env.iter < 10_000 || env.iter > 5_000_000) throw new Error("File cadangan tidak valid");
  try {
    const k = await key(passphrase, unb64(env.salt), env.iter);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(env.iv) as BufferSource }, k, unb64(env.data) as BufferSource);
    return JSON.parse(new TextDecoder().decode(pt)) as T;
  } catch { throw new Error("Kata sandi salah atau file rusak"); }
}

/** Pemeriksaan bentuk minimal sebelum data cadangan menimpa data lokal. Mengembalikan pesan galat atau null. */
export function validateBackupState(x: unknown): string | null {
  if (!x || typeof x !== "object") return "Isi cadangan tidak valid";
  const o = x as Record<string, unknown>;
  for (const k of ["products", "sales", "employees", "cash", "shifts", "customers", "ledger"]) if (!Array.isArray(o[k])) return `Cadangan tidak lengkap (${k})`;
  if (typeof o["shopName"] !== "string") return "Cadangan tidak lengkap (shopName)";
  if (!(o["employees"] as { role?: string; active?: boolean }[]).some((e) => e?.role === "Pemilik" && e.active)) return "Cadangan tidak berisi pemilik aktif";
  return null;
}
