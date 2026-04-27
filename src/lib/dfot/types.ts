export type DfotEpisode = {
  split: string;
  name: string;
  scene: string;
  action0: number[];
  n_actions: number;
};

export type GpuSessionHandoff = {
  ok: boolean;
  /** Signed ws://… or wss://… URL with `?token=…&sid=…` appended. */
  wsUrl: string | null;
  expiresAt: number;
  error?: string;
};

/** Hits POST /api/gpu/session on this Next.js app. */
export async function fetchGpuSession(
  opts: { ttlSeconds?: number; signal?: AbortSignal } = {}
): Promise<GpuSessionHandoff> {
  const r = await fetch("/api/gpu/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ttlSeconds: opts.ttlSeconds }),
    signal: opts.signal,
  });
  const json = (await r.json().catch(() => ({}))) as GpuSessionHandoff;
  if (!r.ok || !json.ok) {
    throw new Error(json?.error || `GPU session request failed (${r.status})`);
  }
  return json;
}
