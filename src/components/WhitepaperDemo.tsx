"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGpuSession } from "@/lib/dfot/types";

/**
 * Embedded interactive demo for the whitepaper page.
 *
 * Single-task (rope) manual-mode world-model playground. Strips out
 * everything from the full app's playground that isn't needed in this
 * context: no oracle replay, no episode picker, no ratings, no sidebar,
 * no resize-aware drawer. The whole UI is a square canvas with a
 * connect button and a key-state overlay.
 *
 * Network shape:
 *
 *   1. POST /api/gpu/session   →  signed `wss://gpu/ws?token=…&sid=…`
 *   2. WebSocket open          →  send {type:"init", split, episode}
 *   3. Keypresses              →  send {type:"action", ...} every 50ms
 *   4. Server streams binary frames: [t_client:f64 BE][step:u32 BE][PNG]
 *
 * The init PNG is fetched separately (HTTP, with bearer auth on the
 * proxy) so we have something to render before the WS opens. Once any
 * frame arrives we stop rendering the splash.
 */

const EPISODE = { split: "validation", name: "br_0000" };

// Only WASD + IJKL are wired through to the model. Earlier drafts also
// forwarded arrow keys + UOPL hoping they'd drive the second arm, but in
// the current checkpoint those keys don't translate to meaningful action
// dimensions, so we keep the surface honest.
const KEY_MAP: Record<string, string> = {
  KeyW: "w",
  KeyS: "s",
  KeyA: "a",
  KeyD: "d",
  KeyI: "i",
  KeyK: "k",
  KeyJ: "j",
  KeyL: "l",
};

const PREVENT_DEFAULT = new Set(Object.keys(KEY_MAP));

type ConnState = "idle" | "connecting" | "open" | "error" | "closed";

export default function WhitepaperDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const keyStateRef = useRef<Record<string, boolean>>({});
  const lastPayloadJsonRef = useRef<string | null>(null);
  const lastSendMsRef = useRef(0);
  const splashImgRef = useRef<HTMLImageElement | null>(null);
  const hasFrameRef = useRef(false);

  const [conn, setConn] = useState<ConnState>("idle");
  const [statusNote, setStatusNote] = useState<string>("");
  const [latencyMs, setLatencyMs] = useState<string>("—");
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isHovered, setIsHovered] = useState(false);

  const drawSplash = useCallback((subtitle: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (hasFrameRef.current) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);
    const img = splashImgRef.current;
    if (img?.complete && img.naturalWidth) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, H - 64, W, 64);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "600 14px ui-monospace, SF Mono, monospace";
    ctx.fillText("Bimanual rope · world model", 16, H - 38);
    ctx.fillStyle = "rgba(170,190,240,0.75)";
    ctx.font = "11px ui-monospace, SF Mono, monospace";
    ctx.fillText(subtitle, 16, H - 16);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      splashImgRef.current = img;
      drawSplash("Ready · click connect to start");
    };
    img.onerror = () => {
      splashImgRef.current = null;
      drawSplash("Init frame unavailable — connect to load");
    };
    img.src = `/api/dfot/init_frames/${EPISODE.split}_${EPISODE.name}.png`;
  }, [drawSplash]);

  const sendCtrl = useCallback((msg: object) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  }, []);

  const disconnect = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws) {
      try {
        ws.close();
      } catch {
        /* noop */
      }
    }
    setConn("closed");
    setStatusNote("Disconnected.");
  }, []);

  const connect = useCallback(async () => {
    setConn("connecting");
    setStatusNote("Requesting GPU session…");
    let wsUrl: string;
    try {
      const handoff = await fetchGpuSession({ ttlSeconds: 30 * 60 });
      if (!handoff.wsUrl) throw new Error("No WS URL in session response");
      wsUrl = handoff.wsUrl;
    } catch (e) {
      setConn("error");
      setStatusNote(
        e instanceof Error ? e.message : "Could not reach the GPU host."
      );
      return;
    }

    setStatusNote("Opening connection…");
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      setConn("open");
      setStatusNote("Live — press WASD / IJKL to drive.");
      sendCtrl({ type: "init", split: EPISODE.split, episode: EPISODE.name });
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") return;
      const buf = event.data as ArrayBuffer;
      if (buf.byteLength < 12) return;
      const imgData = buf.slice(12);

      if (lastSendMsRef.current > 0) {
        setLatencyMs(String(Math.round(Date.now() - lastSendMsRef.current)));
      }

      const blob = new Blob([imgData], { type: "image/png" });
      const bitmap = await createImageBitmap(blob);
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (c && ctx) ctx.drawImage(bitmap, 0, 0, c.width, c.height);
      hasFrameRef.current = true;
      bitmap.close();
    };

    ws.onerror = () => setConn("error");

    ws.onclose = (ev) => {
      if (wsRef.current === ws) {
        setConn("closed");
        setStatusNote(
          ev.code === 4401
            ? "Session token rejected — refresh to try again."
            : `Connection closed (code ${ev.code}).`
        );
        wsRef.current = null;
      }
    };
  }, [sendCtrl]);

  const reset = useCallback(() => {
    sendCtrl({ type: "set_episode", split: EPISODE.split, episode: EPISODE.name });
    hasFrameRef.current = false;
    drawSplash("Resetting…");
  }, [drawSplash, sendCtrl]);

  // Keyboard listeners — only attached while the demo is the active focus
  // target so the page's normal scroll keys aren't hijacked when the user
  // is reading the rest of the whitepaper.
  useEffect(() => {
    if (conn !== "open" || !isHovered) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (PREVENT_DEFAULT.has(e.code)) e.preventDefault();
      if (!(e.code in KEY_MAP)) return;
      if (keyStateRef.current[e.code]) return;
      keyStateRef.current[e.code] = true;
      setPressedKeys(
        new Set(
          Object.keys(keyStateRef.current).filter((k) => keyStateRef.current[k])
        )
      );
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!(e.code in KEY_MAP)) return;
      keyStateRef.current[e.code] = false;
      setPressedKeys(
        new Set(
          Object.keys(keyStateRef.current).filter((k) => keyStateRef.current[k])
        )
      );
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [conn, isHovered]);

  // Action sender — runs at 20 Hz only while live, debounced against
  // the last-sent JSON so an idle hand doesn't spam the GPU with
  // identical zero-action frames.
  useEffect(() => {
    if (conn !== "open") return;
    const id = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const action: Record<string, number> = {};
      for (const [code, name] of Object.entries(KEY_MAP)) {
        action[name] = keyStateRef.current[code] ? 1 : 0;
      }
      const msg = {
        type: "action",
        action,
        n_frames: 4,
        n_steps: 20,
        t_client: performance.now(),
      };
      const json = JSON.stringify(msg);
      if (json === lastPayloadJsonRef.current) return;
      lastSendMsRef.current = Date.now();
      ws.send(json);
      lastPayloadJsonRef.current = json;
    }, 50);
    return () => clearInterval(id);
  }, [conn]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const dotColor =
    conn === "open"
      ? "#0c0"
      : conn === "connecting"
        ? "#e8a43a"
        : conn === "error"
          ? "#c33"
          : "#888";

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-black ring-1 ring-black/10"
        style={{ aspectRatio: "1 / 1", maxWidth: 560 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        tabIndex={0}
      >
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          style={{
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
            display: "block",
          }}
        />

        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: dotColor,
              boxShadow: `0 0 6px ${dotColor}`,
            }}
          />
          {conn === "connecting"
            ? "Connecting…"
            : conn === "open"
              ? "Live"
              : conn === "error"
                ? "Error"
                : conn === "closed"
                  ? "Disconnected"
                  : "Idle"}
        </div>

        {conn === "open" && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/55 px-2.5 py-1 font-mono text-[10px] text-white/80">
            LAT {latencyMs} ms
          </div>
        )}

        {conn !== "open" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
            <button
              type="button"
              onClick={connect}
              disabled={conn === "connecting"}
              className="rounded-lg bg-white/95 px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
            >
              {conn === "connecting"
                ? "Connecting…"
                : conn === "error"
                  ? "Try again"
                  : conn === "closed"
                    ? "Reconnect"
                    : "Start the demo"}
            </button>
          </div>
        )}

        {conn === "open" && (
          <KeyOverlay pressed={pressedKeys} />
        )}
      </div>

      <div className="flex w-full max-w-[560px] flex-col items-center gap-2 text-center">
        <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
          {statusNote || "Click the canvas, then drive the rope."}
        </p>

        {conn === "open" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Reset rollout
            </button>
            <button
              type="button"
              onClick={disconnect}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KeyOverlay({ pressed }: { pressed: Set<string> }) {
  const items: Array<{ code: string; label: string }> = [
    { code: "KeyW", label: "W" },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyI", label: "I" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex gap-1">
      {items.map((it) => (
        <span
          key={it.code}
          className="grid h-6 w-6 place-items-center rounded font-mono text-[10px]"
          style={{
            background: pressed.has(it.code)
              ? "rgba(91,140,255,0.85)"
              : "rgba(0,0,0,0.45)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {it.label}
        </span>
      ))}
    </div>
  );
}
