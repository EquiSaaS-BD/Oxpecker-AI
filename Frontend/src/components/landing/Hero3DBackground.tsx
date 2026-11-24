"use client";

import React, { useEffect, useRef } from "react";

const CELL_SIZE = 48;
const TILE_INSET = 1.5;
const TILE_RADIUS = 6;
const DECAY_MS = 480;

interface CellState {
  col: number;
  row: number;
  intensity: number;
  peak: number;
}

const GRID_MASK_STYLE: React.CSSProperties = {
  maskImage: "radial-gradient(ellipse 82% 72% at 50% 42%, #000 60%, transparent 100%)",
  WebkitMaskImage: "radial-gradient(ellipse 82% 72% at 50% 42%, #000 60%, transparent 100%)",
};

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function Hero3DBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const host = wrapper?.parentElement;
    if (!wrapper || !canvas || !host) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReducedMotion || !hasFinePointer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cells = new Map<string, CellState>();
    let activeKey: string | null = null;
    let rafId: number | null = null;
    let lastTime = performance.now();
    let width = wrapper.clientWidth;
    let height = wrapper.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const syncCanvasSize = () => {
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    syncCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasSize();
      if (cells.size > 0 && rafId === null) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(render);
      }
    });
    resizeObserver.observe(wrapper);

    const boostCell = (col: number, row: number, intensity: number) => {
      if (col < 0 || row < 0) return;
      if (col * CELL_SIZE >= width || row * CELL_SIZE >= height) return;
      const key = `${col}:${row}`;
      const existing = cells.get(key);
      if (existing) {
        existing.intensity = Math.max(existing.intensity, intensity);
        existing.peak = Math.max(existing.peak, intensity);
      } else {
        cells.set(key, { col, row, intensity, peak: intensity });
      }
    };

    const startLoop = () => {
      if (rafId !== null) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(render);
    };

    function render(now: number) {
      const dt = Math.min(64, Math.max(0, now - lastTime));
      lastTime = now;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      const decayFactor = Math.exp(-dt / DECAY_MS);

      for (const [key, cell] of cells.entries()) {
        if (key === activeKey) {
          cell.intensity = Math.max(1, cell.intensity * decayFactor);
        } else {
          cell.intensity *= decayFactor;
        }

        if (cell.intensity < 0.015) {
          cells.delete(key);
          continue;
        }

        const alpha = Math.min(1, cell.intensity);
        const lift = 1 * alpha;
        const x = cell.col * CELL_SIZE + TILE_INSET;
        const y = cell.row * CELL_SIZE + TILE_INSET - lift;
        const tileSize = CELL_SIZE - TILE_INSET * 2;

        // Multi-layered tactile elevation shadow & sky-tinted surface fill
        ctx!.save();
        ctx!.shadowColor = `rgba(15, 23, 42, ${(0.11 * alpha).toFixed(4)})`;
        ctx!.shadowBlur = 14 * alpha;
        ctx!.shadowOffsetX = 0;
        ctx!.shadowOffsetY = 4 * alpha;

        traceRoundedRect(ctx!, x, y, tileSize, tileSize, TILE_RADIUS);
        const grad = ctx!.createLinearGradient(x, y, x, y + tileSize);
        grad.addColorStop(0, `rgba(255, 255, 255, ${(0.96 * alpha).toFixed(4)})`);
        grad.addColorStop(1, `rgba(224, 242, 254, ${(0.68 * alpha).toFixed(4)})`);
        ctx!.fillStyle = grad;
        ctx!.fill();
        ctx!.restore();

        // Crisp medical-sky selection border + ambient secondary glow
        ctx!.save();
        ctx!.shadowColor = `rgba(2, 132, 199, ${(0.12 * alpha).toFixed(4)})`;
        ctx!.shadowBlur = 8 * alpha;
        traceRoundedRect(ctx!, x, y, tileSize, tileSize, TILE_RADIUS);
        ctx!.strokeStyle = `rgba(2, 132, 199, ${(0.36 * alpha).toFixed(4)})`;
        ctx!.lineWidth = 1.15;
        ctx!.stroke();
        ctx!.restore();

        // Subtle inner top edge highlight for tactile finish
        ctx!.save();
        ctx!.beginPath();
        ctx!.moveTo(x + TILE_RADIUS, y + 1);
        ctx!.lineTo(x + tileSize - TILE_RADIUS, y + 1);
        ctx!.strokeStyle = `rgba(255, 255, 255, ${(0.85 * alpha).toFixed(4)})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
        ctx!.restore();
      }

      if (cells.size > 0 || activeKey !== null) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    }

    const isInteractiveTarget = (target: EventTarget | null) =>
      Boolean((target as Element | null)?.closest?.("form, button, a, input, select, textarea"));

    const getCellFromPointer = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
      return {
        col: Math.floor(x / CELL_SIZE),
        row: Math.floor(y / CELL_SIZE),
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isInteractiveTarget(e.target)) {
        activeKey = null;
        return;
      }
      const pos = getCellFromPointer(e);
      if (!pos) {
        activeKey = null;
        return;
      }
      const nextKey = `${pos.col}:${pos.row}`;
      if (activeKey === nextKey && cells.has(nextKey)) return;

      activeKey = nextKey;
      boostCell(pos.col, pos.row, 1);
      boostCell(pos.col - 1, pos.row, 0.22);
      boostCell(pos.col + 1, pos.row, 0.22);
      boostCell(pos.col, pos.row - 1, 0.22);
      boostCell(pos.col, pos.row + 1, 0.22);
      startLoop();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isInteractiveTarget(e.target)) return;
      const pos = getCellFromPointer(e);
      if (!pos) return;
      boostCell(pos.col, pos.row, 1.22);
      boostCell(pos.col - 1, pos.row, 0.3);
      boostCell(pos.col + 1, pos.row, 0.3);
      boostCell(pos.col, pos.row - 1, 0.3);
      boostCell(pos.col, pos.row + 1, 0.3);
      startLoop();
    };

    const handlePointerLeave = () => {
      activeKey = null;
    };

    host.addEventListener("pointermove", handlePointerMove, { passive: true });
    host.addEventListener("pointerdown", handlePointerDown, { passive: true });
    host.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerdown", handlePointerDown);
      host.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Precision 48x48 hairline grid with radial edge fade */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #020617 1px, transparent 1px), linear-gradient(to bottom, #020617 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          ...GRID_MASK_STYLE,
        }}
      />

      {/* Interactive tactile selectable-tile canvas (60fps, zero React re-renders) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={GRID_MASK_STYLE}
      />

      {/* Soft natural ambient glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(2, 132, 199, 0.08) 0%, rgba(240, 249, 255, 0) 70%)",
        }}
      />
    </div>
  );
}

export default Hero3DBackground;
