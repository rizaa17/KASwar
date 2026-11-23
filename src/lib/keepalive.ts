/**
 * Ping harian ke Supabase agar proyek gratis tidak di-pause karena tidak aktif.
 * Murni: semua ketergantungan (fetch, jam, penyimpanan, status online) disuntikkan sehingga mudah diuji.
 * Tidak pernah melempar galat dan tidak mengganggu kasir: kegagalan diam-diam dicoba ulang nanti.
 */
export const KEEPALIVE_OK_KEY = "pp-keepalive-ok";
export const KEEPALIVE_TRY_KEY = "pp-keepalive-try";
export const DAY_MS = 86_400_000;
export const RETRY_MS = 30 * 60_000;

export type KeepAliveBase = { url: string; anonKey: string };
export type KeepAliveStorage = { getItem(k: string): string | null; setItem(k: string, v: string): void };
export type KeepAliveDeps = {
  fetch: (input: string, init?: { method?: string; headers?: Record<string, string>; body?: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
  now: () => number;
  storage: KeepAliveStorage | null;
  online: () => boolean;
  timeoutMs?: number;
};
export type KeepAliveResult = "skipped-no-cloud" | "skipped-offline" | "skipped-recent" | "skipped-retry-wait" | "ok" | "failed";

const read = (s: KeepAliveStorage | null, k: string): number | null => {
  try { const v = s?.getItem(k); const n = v == null ? NaN : Number(v); return Number.isFinite(n) ? n : null; } catch { return null; }
};
const write = (s: KeepAliveStorage | null, k: string, v: number) => { try { s?.setItem(k, String(v)); } catch { /* penyimpanan penuh/tidak ada */ } };

export function shouldPing(lastOk: number | null, lastTry: number | null, now: number): "yes" | "recent" | "retry-wait" {
  if (lastOk !== null && now - lastOk >= 0 && now - lastOk < DAY_MS) return "recent";
  if (lastTry !== null && now - lastTry >= 0 && now - lastTry < RETRY_MS) return "retry-wait";
  return "yes";
}

export async function runKeepAlive(base: KeepAliveBase | null, deps: KeepAliveDeps): Promise<KeepAliveResult> {
  if (!base) return "skipped-no-cloud";
  if (!deps.online()) return "skipped-offline";
  const now = deps.now();
  const decision = shouldPing(read(deps.storage, KEEPALIVE_OK_KEY), read(deps.storage, KEEPALIVE_TRY_KEY), now);
  if (decision === "recent") return "skipped-recent";
  if (decision === "retry-wait") return "skipped-retry-wait";
  write(deps.storage, KEEPALIVE_TRY_KEY, now);
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), deps.timeoutMs ?? 10_000) : undefined;
  try {
    const res = await deps.fetch(`${base.url.replace(/\/$/, "")}/rest/v1/rpc/ping`, {
      method: "POST", headers: { apikey: base.anonKey, "Content-Type": "application/json" }, body: "{}", signal: ctl?.signal,
    });
    const body = res.ok ? ((await res.json().catch(() => null)) as { ok?: boolean } | null) : null;
    if (res.ok && body?.ok === true) { write(deps.storage, KEEPALIVE_OK_KEY, now); return "ok"; }
    return "failed";
  } catch { return "failed"; }
  finally { if (timer) clearTimeout(timer); }
}

/** Jalankan saat aplikasi dibuka, saat kembali online, dan tiap 6 jam selama aplikasi terbuka. Mengembalikan fungsi pembersih. */
export function startKeepAlive(base: KeepAliveBase | null): () => void {
  if (!base || typeof window === "undefined") return () => undefined;
  const deps: KeepAliveDeps = {
    fetch: (u, i) => fetch(u, i),
    now: () => Date.now(),
    storage: (() => { try { return window.localStorage; } catch { return null; } })(),
    online: () => (typeof navigator === "undefined" ? true : navigator.onLine),
  };
  const tick = () => { void runKeepAlive(base, deps); };
  tick();
  window.addEventListener("online", tick);
  const id = window.setInterval(tick, 6 * 3_600_000);
  return () => { window.removeEventListener("online", tick); window.clearInterval(id); };
}
