import { NextResponse } from "next/server";
import { backendBaseUrl, backendHeaders } from "@/lib/dfot/backend";

export async function GET() {
  const base = backendBaseUrl();
  if (!base) {
    return NextResponse.json(
      { backend: "unconfigured", model_loaded: false },
      { status: 503 }
    );
  }
  try {
    const r = await fetch(`${base}/status`, {
      cache: "no-store",
      headers: backendHeaders(),
    });
    if (!r.ok) {
      return NextResponse.json(
        { backend: "error", error: `Upstream ${r.status}` },
        { status: 502 }
      );
    }
    return NextResponse.json(await r.json());
  } catch (e) {
    return NextResponse.json(
      { backend: "error", error: String(e) },
      { status: 502 }
    );
  }
}
