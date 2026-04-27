import { NextResponse } from "next/server";
import { backendBaseUrl, backendHeaders } from "@/lib/dfot/backend";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  const base = backendBaseUrl();
  if (!base) {
    return new NextResponse("DFOT_BACKEND_URL not configured", { status: 503 });
  }
  const { path } = await ctx.params;
  const rel = path.join("/");
  try {
    const r = await fetch(`${base}/init_frames/${rel}`, {
      cache: "no-store",
      headers: backendHeaders(),
    });
    if (!r.ok) {
      return new NextResponse("Upstream error", { status: r.status });
    }
    const buf = await r.arrayBuffer();
    const ct = r.headers.get("content-type") || "image/png";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new NextResponse("Fetch failed", { status: 502 });
  }
}
