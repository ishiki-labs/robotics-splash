# robotics-splash · fern.bot

Marketing site + whitepaper for Fern. Two routes:

- `/` — minimal splash with the title and a link into the whitepaper.
- `/whitepaper` — long-form explainer with an embedded **live world-model demo**.
  The demo proxies through this Next.js app to a separate FastAPI service
  running on a GPU host (Lambda Labs).

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

For the embedded demo to function locally, copy `.env.example` → `.env.local`
and fill the three values. They must match the matching env vars on the
FastAPI GPU host.

```env
DFOT_BACKEND_URL=https://your-gpu-host.example.com
DFOT_BACKEND_TOKEN=<openssl rand -hex 32>
DFOT_SESSION_SECRET=<openssl rand -hex 32>
```

When unset, the page still renders — only the demo button is inert (the
session-mint route returns 503 with a configuration hint).

## Deploying to Vercel

The whitepaper demo is gated by two layers of authentication. **Both** secrets
must be configured on Vercel as **server-only** env vars (regular or
"Sensitive" — never as Public/Exposed-to-Browser). The browser never sees
them; the only thing leaving this site is a one-hour HMAC token minted at
`/api/gpu/session`.

| Vercel env var          | Type            | Purpose                                                                                                                          |
| ----------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `DFOT_BACKEND_URL`      | Server-only     | Base URL of the FastAPI GPU host. No trailing slash. Used by `/api/dfot/*` proxies and by `/api/gpu/session` to derive the WS URL. |
| `DFOT_BACKEND_TOKEN`    | Server-only ⚠️  | Static shared secret. Stamped onto every HTTP request to the GPU host (`Authorization: Bearer …`). Must equal the value on the GPU host. |
| `DFOT_SESSION_SECRET`   | Server-only ⚠️  | HMAC secret used to sign short-lived WebSocket session tokens. Must equal `DFOT_SESSION_SECRET` on the GPU host (`auth.py` verifies tokens with the same secret). |

> ⚠️ Mark both `DFOT_BACKEND_TOKEN` and `DFOT_SESSION_SECRET` as **Sensitive**
> in Vercel's UI so they don't appear in build logs or function output.

### Two-layer auth model

The GPU host enforces two independent gates:

1. **HTTP shared secret.** All HTTP routes (`/episodes`, `/init_frames/*`,
   `/status`, …) require `Authorization: Bearer <DFOT_BACKEND_TOKEN>`. This
   site's `lib/dfot/backend.ts` stamps that header onto every upstream
   request. Random callers who happen to know the GPU URL get a 401.

2. **WebSocket short-lived JWT.** The `/ws` endpoint requires
   `?token=<JWT>&sid=<uuid>` where the JWT is HMAC-signed with
   `DFOT_SESSION_SECRET` and bound to `aud: "dfot-ws"` with a 1-hour TTL.
   `/api/gpu/session` mints these tokens; the browser plugs the URL straight
   into `new WebSocket()`.

Both secrets must rotate together on both hosts.

## Repo layout

```
src/
├── app/
│   ├── page.tsx                          # splash (with whitepaper link)
│   ├── whitepaper/page.tsx               # whitepaper (with embedded demo)
│   └── api/
│       ├── gpu/session/route.ts          # mints signed wsUrl
│       └── dfot/{episodes,init_frames,status}/route.ts  # auth-stamped proxies
├── components/
│   ├── WhitepaperDemo.tsx                # lean rope-only WS playground
│   ├── ParticleField.tsx
│   └── CursorGlow.tsx
└── lib/
    ├── dfot/
    │   ├── backend.ts                    # backendBaseUrl + auth headers
    │   └── types.ts                      # DfotEpisode, fetchGpuSession
    └── gpu/session-token.ts              # HS256 JWT signer

public/
├── videos/rope_gt_vs_sim.mp4             # GT vs model rollout, br_0000
└── images/rope_gt_vs_sim_poster.png      # poster frame for the video
```
