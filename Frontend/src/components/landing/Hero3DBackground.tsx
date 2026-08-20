"use client";

import PerspectiveGrid3D from "@/components/shared/PerspectiveGrid3D";

export function Hero3DBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-90">
      <PerspectiveGrid3D variant="hero" fadeRadius={75} />
    </div>
  );
}

export default Hero3DBackground;