"use client";

import React from "react";

export function Hero3DBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Precision hairline grid with radial mask */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(to right, #020617 1px, transparent 1px), linear-gradient(to bottom, #020617 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)",
        }}
      />
      {/* Soft natural ambient glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(2, 132, 199, 0.08) 0%, rgba(240, 249, 255, 0) 70%)",
        }}
      />
    </div>
  );
}

export default Hero3DBackground;