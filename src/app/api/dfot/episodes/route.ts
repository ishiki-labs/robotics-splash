import { NextResponse } from "next/server";
import { backendBaseUrl, backendHeaders } from "@/lib/dfot/backend";

export async function GET() {
  const base = backendBaseUrl();
  if (!base) {
    return NextResponse.json(
      {
        error:
          "DFOT_BACKEND_URL is not set on this Next.js host. Configure it as a server-only env var to enable the embedded demo.",
        episodes: [] as unknown[],
      },
      { status: 503 }
    );
  }
  try {
    const r = await fetch(`${base}/episodes`, {
      cache: "no-store",
      headers: backendHeaders(),
    });
    if (!r.ok) {
      return NextResponse.json(
        { error: `Upstream ${r.status}`, episodes: [] },
        { status: 502 }
      );
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: String(e), episodes: [] },
      { status: 502 }
    );
  }
}
