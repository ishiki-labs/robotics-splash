/**
 * Server-only helpers shared by every `/api/dfot/*` proxy route.
 *
 * The whitepaper page on this site embeds a live world-model demo that
 * proxies HTTP/WebSocket traffic through this Next.js app to a separate
 * FastAPI service running on a GPU host (Lambda Labs). Two env vars
 * configure the link:
 *
 *   DFOT_BACKEND_URL    Base URL of the FastAPI GPU host (no trailing
 *                       slash). Server-only — never prefix with
 *                       NEXT_PUBLIC_, the browser does not need it.
 *
 *   DFOT_BACKEND_TOKEN  Static shared secret. When set, this module
 *                       stamps every upstream request with
 *                       `Authorization: Bearer <token>` and the matching
 *                       FastAPI middleware on the GPU host rejects
 *                       anything else with 401. Must mirror the value
 *                       configured on the GPU host.
 *
 * The WebSocket has its own short-lived HMAC tokens (see
 * `lib/gpu/session-token.ts` + `DFOT_SESSION_SECRET`); this file does
 * not touch them — proxy routes are HTTP only.
 */

export function backendBaseUrl(): string | null {
  const u = process.env.DFOT_BACKEND_URL?.trim();
  return u ? u.replace(/\/$/, "") : null;
}

/**
 * Compose the headers we want to send on every upstream request:
 *
 *   - `ngrok-skip-browser-warning`: bypasses the ngrok free-dev
 *     interstitial. Harmless on non-ngrok hosts.
 *   - `Authorization: Bearer …` if `DFOT_BACKEND_TOKEN` is set.
 *
 * Caller-supplied headers win on collision (e.g. `content-type` for POSTs).
 */
export function backendHeaders(
  extra?: Record<string, string>
): Record<string, string> {
  const token = process.env.DFOT_BACKEND_TOKEN?.trim();
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v != null) headers[k] = v;
    }
  }
  return headers;
}

/** Convert the configured HTTPS base URL into the matching WebSocket URL. */
export function backendWsUrl(): string | null {
  const base = backendBaseUrl();
  if (!base) return null;
  if (base.startsWith("https://")) return "wss://" + base.slice("https://".length) + "/ws";
  if (base.startsWith("http://")) return "ws://" + base.slice("http://".length) + "/ws";
  return null;
}
