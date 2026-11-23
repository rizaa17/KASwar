import { describe, it, expect } from "vitest";
import { runKeepAlive, shouldPing, DAY_MS, RETRY_MS, KEEPALIVE_OK_KEY, KEEPALIVE_TRY_KEY, type KeepAliveDeps } from "./keepalive";

const base = { url: "https://x.supabase.co/", anonKey: "anon" };
function mem(init: Record<string, string> = {}) { const m = new Map(Object.entries(init)); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m }; }
function deps(over: Partial<KeepAliveDeps> & { calls?: string[] } = {}): KeepAliveDeps {
  const calls = over.calls ?? [];
  return { fetch: async (u) => { calls.push(u); return { ok: true, status: 200, json: async () => ({ ok: true }) }; }, now: () => 1_000_000_000, storage: mem(), online: () => true, ...over };
}

describe("keepalive", () => {
  it("tanpa cloud atau offline tidak memanggil jaringan", async () => {
    const calls: string[] = [];
    expect(await runKeepAlive(null, deps({ calls }))).toBe("skipped-no-cloud");
    expect(await runKeepAlive(base, deps({ calls, online: () => false }))).toBe("skipped-offline");
    expect(calls.length).toBe(0);
  });
  it("memanggil /rest/v1/rpc/ping dan mencatat keberhasilan", async () => {
    const calls: string[] = []; const st = mem();
    expect(await runKeepAlive(base, deps({ calls, storage: st }))).toBe("ok");
    expect(calls).toEqual(["https://x.supabase.co/rest/v1/rpc/ping"]);
    expect(st.m.get(KEEPALIVE_OK_KEY)).toBe("1000000000");
  });
  it("sekali sehari saja", async () => {
    const calls: string[] = []; const st = mem({ [KEEPALIVE_OK_KEY]: String(1_000_000_000 - DAY_MS + 1) });
    expect(await runKeepAlive(base, deps({ calls, storage: st }))).toBe("skipped-recent");
    const st2 = mem({ [KEEPALIVE_OK_KEY]: String(1_000_000_000 - DAY_MS) });
    expect(await runKeepAlive(base, deps({ calls, storage: st2 }))).toBe("ok");
    expect(calls.length).toBe(1);
  });
  it("gagal tidak melempar, tidak mencatat sukses, dan menunggu sebelum mencoba lagi", async () => {
    const st = mem(); let n = 0;
    const failing = deps({ storage: st, fetch: async () => { n++; throw new Error("jaringan"); } });
    expect(await runKeepAlive(base, failing)).toBe("failed");
    expect(st.m.get(KEEPALIVE_OK_KEY)).toBeUndefined();
    expect(await runKeepAlive(base, failing)).toBe("skipped-retry-wait");
    expect(n).toBe(1);
    expect(shouldPing(null, 1_000_000_000 - RETRY_MS, 1_000_000_000)).toBe("yes");
  });
  it("respons non-200 atau tanpa ok=true dianggap gagal", async () => {
    expect(await runKeepAlive(base, deps({ fetch: async () => ({ ok: false, status: 540, json: async () => ({}) }) }))).toBe("failed");
    expect(await runKeepAlive(base, deps({ storage: mem(), fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: false }) }) }))).toBe("failed");
  });
  it("jam mundur (waktu di masa depan) tidak membekukan ping", () => {
    expect(shouldPing(2_000_000_000, null, 1_000_000_000)).toBe("yes");
  });
  it("storage rusak tidak melempar", async () => {
    const bad = { getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("x"); } };
    expect(await runKeepAlive(base, deps({ storage: bad }))).toBe("ok");
  });
});
void KEEPALIVE_TRY_KEY;
