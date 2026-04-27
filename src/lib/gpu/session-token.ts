/**
 * Minimal HS256 JWTs for handing the browser a short-lived ticket it can
 * spend on a single WebSocket upgrade against the GPU host. No third-party
 * deps — Node's built-in `crypto`.
 *
 * The same contract is implemented on the Python side in the world-model
 * repo (`diffusion-forcing-transformer/deploy/auth.py`); both sides MUST
 * read `DFOT_SESSION_SECRET` from the environment, and the secret has to
 * match exactly. If you rotate it in one place you have to rotate it in
 * the other.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionTokenClaims = {
  /** Caller id. We don't have auth on this site, so this is always "demo". */
  sub: string;
  /** Opaque per-handoff session id. Used for log correlation only. */
  sid: string;
  /** Provider externalId — kept for parity with the app repo; we set "manual". */
  gpu: string;
  provider: "lambda" | "modal" | "mock" | "manual";
  iat: number;
  exp: number;
  /** Bound to the WS audience so tokens can't be reused on other endpoints. */
  aud: "dfot-ws";
};

const TEXT = new TextEncoder();

function base64url(buf: Buffer | Uint8Array): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(s: string): Buffer {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

function sign(body: string, secret: string): string {
  return base64url(createHmac("sha256", secret).update(body).digest());
}

export const DEFAULT_TTL_SECONDS = 60 * 60;

export function getSessionSecret(): string {
  const s = process.env.DFOT_SESSION_SECRET?.trim();
  if (!s) {
    throw new Error(
      "DFOT_SESSION_SECRET is not set — cannot sign GPU session tokens. " +
        "Generate one with `openssl rand -hex 32` and set it in .env.local " +
        "(and on the FastAPI GPU host as DFOT_SESSION_SECRET)."
    );
  }
  if (s.length < 16) {
    throw new Error("DFOT_SESSION_SECRET must be at least 16 characters.");
  }
  return s;
}

export function signSessionToken(
  claims: Omit<SessionTokenClaims, "iat" | "exp" | "aud"> & {
    ttlSeconds?: number;
  }
): { token: string; expiresAt: number } {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (claims.ttlSeconds ?? DEFAULT_TTL_SECONDS);
  const payload: SessionTokenClaims = {
    sub: claims.sub,
    sid: claims.sid,
    gpu: claims.gpu,
    provider: claims.provider,
    iat: now,
    exp,
    aud: "dfot-ws",
  };
  const header = base64url(
    TEXT.encode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  );
  const body = base64url(TEXT.encode(JSON.stringify(payload)));
  const signing = `${header}.${body}`;
  const sig = sign(signing, secret);
  return { token: `${signing}.${sig}`, expiresAt: exp };
}

export function verifySessionToken(token: string): SessionTokenClaims {
  const secret = getSessionSecret();
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");
  const [header64, body64, sig64] = parts;
  const expected = sign(`${header64}.${body64}`, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig64);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid signature");
  }
  const claims = JSON.parse(
    base64urlDecode(body64).toString("utf8")
  ) as SessionTokenClaims;
  const now = Math.floor(Date.now() / 1000);
  if (claims.exp <= now) throw new Error("Token expired");
  if (claims.aud !== "dfot-ws") throw new Error("Wrong audience");
  return claims;
}
