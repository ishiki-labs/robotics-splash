import { NextResponse } from "next/server";
import { backendWsUrl } from "@/lib/dfot/backend";
import {
  signSessionToken,
  DEFAULT_TTL_SECONDS,
} from "@/lib/gpu/session-token";
import { randomUUID } from "node:crypto";

/**
 * Mint a short-lived signed WebSocket URL for the embedded whitepaper
 * demo. Unlike the full app's session route, this one has no Supabase,
 * no Lambda Labs provisioning, no provider switching — just:
 *
 *   1. read DFOT_BACKEND_URL → derive `wss://gpu-host/ws`
 *   2. mint an HMAC-signed token (DFOT_SESSION_SECRET) with TTL
 *   3. append `?token=…&sid=…` and return the URL
 *
 * The browser plugs the URL straight into `new WebSocket()`. The token
 * never touches the rendered HTML/JS — it's only in the JSON response,
 * scoped to this single fetch, expiring in an hour by default.
 *
 * Public endpoint by design (the whitepaper is a public page). The
 * mitigation against abuse is the TTL + the GPU host's own auth: every
 * issued token is bound to `aud: "dfot-ws"` and signed with a secret
 * that only this server and the GPU host know.
 */
export async function POST(request: Request) {
  const wsBase = backendWsUrl();
  if (!wsBase) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "DFOT_BACKEND_URL is not set on this Next.js host. Configure it as a server-only env var (e.g. https://gpu-host.example.com).",
      },
      { status: 503 }
    );
  }

  let body: { ttlSeconds?: number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  try {
    const ttl = Math.min(
      Math.max(body.ttlSeconds ?? DEFAULT_TTL_SECONDS, 60),
      60 * 60 * 6
    );
    const sid = randomUUID();
    const { token, expiresAt } = signSessionToken({
      sub: "demo",
      sid,
      gpu: "manual",
      provider: "manual",
      ttlSeconds: ttl,
    });
    const url = new URL(wsBase);
    url.searchParams.set("token", token);
    url.searchParams.set("sid", sid);
    return NextResponse.json({
      ok: true,
      wsUrl: url.toString(),
      expiresAt,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
