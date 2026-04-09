"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -500, y: -500 });
  const rendered = useRef({ x: -500, y: -500 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      pos.current = { x: -500, y: -500 };
    };

    window.addEventListener("mousemove", onMouse);
    document.addEventListener("mouseleave", onLeave);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      rendered.current.x = lerp(rendered.current.x, pos.current.x, 0.12);
      rendered.current.y = lerp(rendered.current.y, pos.current.y, 0.12);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${rendered.current.x}px, ${rendered.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2"
      style={{
        zIndex: 1,
        width: 500,
        height: 500,
        marginLeft: -250,
        marginTop: -250,
        background:
          "radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 30%, transparent 70%)",
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
