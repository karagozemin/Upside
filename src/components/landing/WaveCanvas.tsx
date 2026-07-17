"use client";

import { useEffect, useRef } from "react";

/**
 * Liquidation Wave — hand-written Canvas 2D simulation.
 * A live price line drifts into the red liquidation zone; the Upside shield
 * intercepts, pulls it back into safety. Loops forever. Mouse disturbs the field.
 * Zero dependencies, respects prefers-reduced-motion.
 */
export function WaveCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let W = 0;
    let H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // --- simulation state ---
    const N = 140; // points on the price line
    const pts = new Float32Array(N); // deviation from center, in px
    const vel = new Float32Array(N);
    let t = 0;
    // phase machine: 0=calm 1=danger builds 2=shield intercepts 3=recovery
    let phase = 0;
    let phaseT = 0;
    let shield = 0; // 0..1 shield strength
    const PHASE_LEN = [260, 200, 130, 200];

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - r.left;
      mouse.current.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const noise = (i: number, tt: number) =>
      Math.sin(i * 0.31 + tt * 0.023) * 0.6 +
      Math.sin(i * 0.13 - tt * 0.017) * 0.9 +
      Math.sin(i * 0.53 + tt * 0.041) * 0.35;

    const draw = () => {
      t++;
      phaseT++;
      if (phaseT > PHASE_LEN[phase]) {
        phase = (phase + 1) % 4;
        phaseT = 0;
      }
      // shield engages in phase 2, releases slowly in 3
      const shieldTarget = phase === 2 ? 1 : phase === 3 ? 0.55 : 0;
      shield += (shieldTarget - shield) * 0.035;

      // danger pull: in phase 1 the line is dragged toward liquidation zone
      const danger =
        phase === 1 ? Math.min(1, phaseT / 110) : phase === 2 ? Math.max(0, 1 - phaseT / 60) : 0;

      const mid = H * 0.52;
      const liqY = H * 0.82; // liquidation line

      // physics
      for (let i = 0; i < N; i++) {
        const target =
          noise(i, t) * 14 +
          danger * (liqY - mid) * 0.72 * Math.pow(i / N, 1.6) -
          shield * 26 * Math.pow(i / N, 1.4);
        // mouse repulsion
        const px = (i / (N - 1)) * W;
        const py = mid + pts[i];
        const dx = px - mouse.current.x;
        const dy = py - mouse.current.y;
        const d2 = dx * dx + dy * dy;
        let repel = 0;
        if (d2 < 16000) repel = ((16000 - d2) / 16000) * (dy > 0 ? 18 : -18);
        vel[i] += (target + repel - pts[i]) * 0.018;
        vel[i] *= 0.92;
        pts[i] += vel[i];
      }

      // --- render ---
      ctx.clearRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let gy = 0; gy < H; gy += 36) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // liquidation zone
      const zone = ctx.createLinearGradient(0, liqY - 20, 0, H);
      zone.addColorStop(0, "rgba(251,113,133,0)");
      zone.addColorStop(1, `rgba(251,113,133,${0.10 + danger * 0.14})`);
      ctx.fillStyle = zone;
      ctx.fillRect(0, liqY - 20, W, H - liqY + 20);
      ctx.strokeStyle = `rgba(251,113,133,${0.35 + danger * 0.4})`;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, liqY);
      ctx.lineTo(W, liqY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(251,113,133,0.75)";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("LIQUIDATION", 12, liqY + 16);

      // shield field (when active)
      if (shield > 0.03) {
        const sx = W * 0.66;
        const grad = ctx.createRadialGradient(sx, mid, 0, sx, mid, W * 0.4);
        grad.addColorStop(0, `rgba(52,211,153,${0.10 * shield})`);
        grad.addColorStop(1, "rgba(52,211,153,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        // shield arc
        ctx.strokeStyle = `rgba(52,211,153,${0.55 * shield})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, mid + 10, 70 + Math.sin(t * 0.05) * 4, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        ctx.fillStyle = `rgba(52,211,153,${0.8 * shield})`;
        ctx.fillText("UPSIDE SHIELD", sx - 38, mid + 100);
      }

      // price line — color blends cyan → red with danger, → green with shield
      const r = Math.round(34 + danger * 217 - shield * 0);
      const g = Math.round(211 - danger * 98 + shield * 0);
      const b = Math.round(238 - danger * 105 - shield * 85);
      const lineColor = shield > 0.4 ? "52,211,153" : `${r},${g},${b}`;

      // area under line
      ctx.beginPath();
      ctx.moveTo(0, mid + pts[0]);
      for (let i = 1; i < N; i++) ctx.lineTo((i / (N - 1)) * W, mid + pts[i]);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      const area = ctx.createLinearGradient(0, mid - 40, 0, H);
      area.addColorStop(0, `rgba(${lineColor},0.14)`);
      area.addColorStop(1, `rgba(${lineColor},0)`);
      ctx.fillStyle = area;
      ctx.fill();

      // the line itself with glow
      ctx.shadowColor = `rgba(${lineColor},0.6)`;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(${lineColor},0.95)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, mid + pts[0]);
      for (let i = 1; i < N; i++) ctx.lineTo((i / (N - 1)) * W, mid + pts[i]);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // head dot
      const hx = W - 2;
      const hy = mid + pts[N - 1];
      ctx.fillStyle = `rgba(${lineColor},1)`;
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${lineColor},0.35)`;
      ctx.beginPath();
      ctx.arc(hx, hy, 9 + Math.sin(t * 0.1) * 2, 0, Math.PI * 2);
      ctx.stroke();

      // status chip
      const label =
        phase === 0 ? "MONITORING" : phase === 1 ? "RISK RISING" : phase === 2 ? "INTERVENTION" : "PROTECTED";
      const chipColor =
        phase === 0 ? "100,116,139" : phase === 1 ? "251,113,133" : phase === 2 ? "251,146,60" : "52,211,153";
      ctx.fillStyle = `rgba(${chipColor},0.15)`;
      ctx.strokeStyle = `rgba(${chipColor},0.5)`;
      const cw = ctx.measureText(label).width + 26;
      roundRect(ctx, 12, 14, cw, 22, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `rgba(${chipColor},1)`;
      ctx.beginPath();
      ctx.arc(24, 25, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(label, 32, 28.5);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      // render a single static frame mid-protection
      phase = 3;
      shield = 0.6;
      for (let k = 0; k < 60; k++) {
        t++;
        for (let i = 0; i < N; i++) {
          const target = noise(i, t) * 14 - shield * 26 * Math.pow(i / N, 1.4);
          vel[i] += (target - pts[i]) * 0.018;
          vel[i] *= 0.92;
          pts[i] += vel[i];
        }
      }
      draw();
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
