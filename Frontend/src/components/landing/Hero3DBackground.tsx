"use client";

import React, { useEffect, useRef } from "react";

const DECAY_MS = 360;
const LERP_MS = 55;

interface CellState {
  col: number;
  row: number;
  intensity: number;
}

const VIGNETTE_MASK_STYLE: React.CSSProperties = {
  maskImage:
    "radial-gradient(ellipse 60% 52% at 50% 36%, #000 45%, rgba(0,0,0,0.45) 72%, transparent 100%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 60% 52% at 50% 36%, #000 45%, rgba(0,0,0,0.45) 72%, transparent 100%)",
};

export function Hero3DBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const gridEl = gridRef.current;
    const canvas = canvasRef.current;
    const host = wrapper?.parentElement;
    if (!wrapper || !gridEl || !canvas || !host) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");

    const cells = new Map<string, CellState>();
    let rafId: number | null = null;
    let lastTime = performance.now();
    let width = wrapper.clientWidth;
    let height = wrapper.clientHeight;
    let cellSize = width < 640 ? 40 : 48;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let pointerInside = false;
    let targetX = -9999;
    let targetY = -9999;
    let smoothX = -9999;
    let smoothY = -9999;
    let glowStrength = 0;

    const syncDimensions = () => {
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      cellSize = width < 640 ? 40 : 48;
      gridEl.style.backgroundSize = `${cellSize}px ${cellSize}px`;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    syncDimensions();

    const startLoop = () => {
      if (rafId !== null || prefersReducedMotion || !ctx) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(() => {
      syncDimensions();
      if ((cells.size > 0 || glowStrength > 0.004) && rafId === null) {
        startLoop();
      }
    });
    resizeObserver.observe(wrapper);

    if (prefersReducedMotion || !ctx) {
      return () => {
        resizeObserver.disconnect();
      };
    }

    function render(now: number) {
      const dt = Math.min(64, Math.max(1, now - lastTime));
      lastTime = now;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      const lerpAlpha = 1 - Math.exp(-dt / LERP_MS);
      const decayFactor = Math.exp(-dt / DECAY_MS);

      if (pointerInside) {
        smoothX += (targetX - smoothX) * lerpAlpha;
        smoothY += (targetY - smoothY) * lerpAlpha;
        glowStrength += (1 - glowStrength) * lerpAlpha;
      } else {
        glowStrength *= decayFactor;
      }

      for (const [key, cell] of cells.entries()) {
        cell.intensity *= decayFactor;
        if (cell.intensity < 0.004) {
          cells.delete(key);
        }
      }

      if (pointerInside || glowStrength > 0.02) {
        const proximityRadius = cellSize * 2.6;
        const minCol = Math.max(0, Math.floor((smoothX - proximityRadius) / cellSize));
        const maxCol = Math.min(
          Math.floor(width / cellSize),
          Math.floor((smoothX + proximityRadius) / cellSize)
        );
        const minRow = Math.max(0, Math.floor((smoothY - proximityRadius) / cellSize));
        const maxRow = Math.min(
          Math.floor(height / cellSize),
          Math.floor((smoothY + proximityRadius) / cellSize)
        );

        const activeScale = pointerInside ? 1 : glowStrength;
        for (let col = minCol; col <= maxCol; col++) {
          const cx = (col + 0.5) * cellSize;
          for (let row = minRow; row <= maxRow; row++) {
            const cy = (row + 0.5) * cellSize;
            const dist = Math.hypot(cx - smoothX, cy - smoothY);
            if (dist >= proximityRadius) continue;
            const u = 1 - dist / proximityRadius;
            const smoothWeight = u * u * (3 - 2 * u) * activeScale;
            if (smoothWeight < 0.004) continue;

            const key = `${col}:${row}`;
            const existing = cells.get(key);
            if (existing) {
              existing.intensity = Math.max(existing.intensity, smoothWeight);
            } else {
              cells.set(key, { col, row, intensity: smoothWeight });
            }
          }
        }
      }

      // 1. Soft borderless neutral slate cell wash strictly inside 1px grid lines
      const fillSize = cellSize - 1;
      for (const cell of cells.values()) {
        const x = cell.col * cellSize + 1;
        const y = cell.row * cellSize + 1;
        ctx!.fillStyle = `rgba(15, 23, 42, ${(0.048 * cell.intensity).toFixed(4)})`;
        ctx!.fillRect(x, y, fillSize, fillSize);
      }

      // 2. Soft diffused radial cursor aura + softly illuminated neutral grid hairlines
      if (glowStrength > 0.004 && smoothX > -9000) {
        const auraRadius = 180;
        const auraGrad = ctx!.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, auraRadius);
        auraGrad.addColorStop(0, `rgba(15, 23, 42, ${(0.025 * glowStrength).toFixed(4)})`);
        auraGrad.addColorStop(0.6, `rgba(15, 23, 42, ${(0.008 * glowStrength).toFixed(4)})`);
        auraGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
        ctx!.fillStyle = auraGrad;
        ctx!.beginPath();
        ctx!.arc(smoothX, smoothY, auraRadius, 0, Math.PI * 2);
        ctx!.fill();

        const lineRadius = 160;
        const lineGrad = ctx!.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, lineRadius);
        lineGrad.addColorStop(0, `rgba(15, 23, 42, ${(0.055 * glowStrength).toFixed(4)})`);
        lineGrad.addColorStop(0.65, `rgba(15, 23, 42, ${(0.02 * glowStrength).toFixed(4)})`);
        lineGrad.addColorStop(1, "rgba(15, 23, 42, 0)");

        ctx!.save();
        ctx!.strokeStyle = lineGrad;
        ctx!.lineWidth = 1;
        ctx!.beginPath();

        const startX = Math.max(0, Math.floor((smoothX - lineRadius) / cellSize) * cellSize);
        const endX = Math.min(width, Math.ceil((smoothX + lineRadius) / cellSize) * cellSize);
        const startY = Math.max(0, Math.floor((smoothY - lineRadius) / cellSize) * cellSize);
        const endY = Math.min(height, Math.ceil((smoothY + lineRadius) / cellSize) * cellSize);

        for (let gx = startX; gx <= endX; gx += cellSize) {
          ctx!.moveTo(gx + 0.5, startY);
          ctx!.lineTo(gx + 0.5, endY);
        }
        for (let gy = startY; gy <= endY; gy += cellSize) {
          ctx!.moveTo(startX, gy + 0.5);
          ctx!.lineTo(endX, gy + 0.5);
        }
        ctx!.stroke();
        ctx!.restore();
      }

      if (pointerInside || cells.size > 0 || glowStrength > 0.004) {
        rafId = requestAnimationFrame(render);
      } else {
        ctx!.clearRect(0, 0, width, height);
        rafId = null;
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        pointerInside = false;
        return;
      }
      if (!pointerInside && glowStrength <= 0.004) {
        smoothX = x;
        smoothY = y;
      }
      pointerInside = true;
      targetX = x;
      targetY = y;
      startLoop();
    };

    const handlePointerLeave = () => {
      pointerInside = false;
    };

    host.addEventListener("pointermove", handlePointerMove, { passive: true });
    host.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Neutral hairline grid gently framed by center radial vignette */}
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-[0.038]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          ...VIGNETTE_MASK_STYLE,
        }}
      />

      {/* Smooth borderless neutral slate interactive surface + subtle cursor light */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={VIGNETTE_MASK_STYLE}
      />

      {/* Subtle neutral pearl ambient haze at top center */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(100, 116, 139, 0.07) 0%, rgba(248, 250, 252, 0) 70%)",
        }}
      />
    </div>
  );
}

export default Hero3DBackground;
