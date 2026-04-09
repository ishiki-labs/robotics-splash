"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  restX: number;
  restY: number;
  vx: number;
  vy: number;
  radius: number;
  baseOpacity: number;
  phaseX: number;
  phaseY: number;
  freqX: number;
  freqY: number;
  ampX: number;
  ampY: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);
  const timeRef = useRef(0);

  const createParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const spacing = 40;
    const cols = Math.ceil(w / spacing) + 2;
    const rows = Math.ceil(h / spacing) + 2;
    const offsetX = (w - (cols - 1) * spacing) / 2;
    const offsetY = (h - (rows - 1) * spacing) / 2;

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const jitterX = (Math.random() - 0.5) * spacing * 0.4;
        const jitterY = (Math.random() - 0.5) * spacing * 0.4;
        const x = offsetX + col * spacing + jitterX;
        const y = offsetY + row * spacing + jitterY;

        particles.push({
          x,
          y,
          restX: x,
          restY: y,
          vx: 0,
          vy: 0,
          radius: 0.8 + Math.random() * 0.8,
          baseOpacity: 0.015 + Math.random() * 0.025,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          freqX: 0.15 + Math.random() * 0.2,
          freqY: 0.12 + Math.random() * 0.18,
          ampX: 8 + Math.random() * 12,
          ampY: 8 + Math.random() * 12,
        });
      }
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = createParticles(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchend", onLeave);

    const connectionDist = 65;
    const connectionDistSq = connectionDist * connectionDist;
    const attractRadius = 200;
    const attractStrength = 8;
    const deadZone = 20;
    const spring = 0.03;
    const damping = 0.86;

    const animate = () => {
      timeRef.current += 0.008;
      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      const len = particles.length;
      const t = timeRef.current;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < attractRadius && dist > deadZone) {
          const normalized = (dist - deadZone) / (attractRadius - deadZone);
          const force = (1 - normalized) * attractStrength;
          const invDist = 1 / dist;
          p.vx += dx * invDist * force * 0.04;
          p.vy += dy * invDist * force * 0.04;
        }

        const driftX = Math.sin(t * p.freqX + p.phaseX) * p.ampX
                     + Math.sin(t * p.freqX * 0.4 + p.phaseY) * p.ampX * 0.5;
        const driftY = Math.cos(t * p.freqY + p.phaseY) * p.ampY
                     + Math.cos(t * p.freqY * 0.3 + p.phaseX) * p.ampY * 0.5;

        p.vx += (p.restX + driftX - p.x) * spring;
        p.vy += (p.restY + driftY - p.y) * spring;
        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw connections — use a wider radius near the cursor since particles cluster
      ctx.lineWidth = 0.5;
      for (let i = 0; i < len; i++) {
        const a = particles[i];
        for (let j = i + 1; j < len; j++) {
          const b = particles[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const dSq = ddx * ddx + ddy * ddy;

          if (dSq < connectionDistSq) {
            const proximity = 1 - Math.sqrt(dSq) / connectionDist;

            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const mDx = midX - mouse.x;
            const mDy = midY - mouse.y;
            const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
            const nearCursor = mDist < attractRadius;

            const baseAlpha = proximity * 0.025;
            const cursorInfluence = nearCursor
              ? (1 - mDist / attractRadius) * 0.07
              : 0;
            const alpha = baseAlpha + cursorInfluence;

            ctx.strokeStyle = `rgba(0,0,0,${alpha})`;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        const displacementSq =
          (p.x - p.restX) ** 2 + (p.y - p.restY) ** 2;
        const displacement = Math.sqrt(displacementSq);

        const glow = Math.min(displacement * 0.004, 0.05);
        const opacity = p.baseOpacity + glow;

        ctx.fillStyle = `rgba(0,0,0,${opacity})`;

        const r = displacement > 3 ? p.radius * 1.15 : p.radius;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchend", onLeave);
    };
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
