"use client";

import React, { useEffect, useRef } from 'react';

export function DocsBackground3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number; y: number; z: number }[] = [];
    const particleCount = 1000;
    const fov = 250;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: (Math.random() - 0.5) * 2000,
      });
    }

    let animationFrameId: number;
    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      angleX += 0.001;
      angleY += 0.002;
      
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        // Rotate around Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        
        // Rotate around X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        // 3D to 2D projection
        const scale = fov / (fov + z2 + 1000);
        const x2d = (x1 * scale) + cx;
        const y2d = (y2 * scale) + cy;

        // Draw particle if in front of camera
        if (z2 + 1000 > 0) {
          const alpha = Math.max(0, Math.min(1, scale * 1.5));
          ctx.beginPath();
          ctx.arc(x2d, y2d, scale * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 194, 168, ${alpha * 0.4})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-30">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Overlay gradient to blend it smoothly into the background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white dark:from-slate-950/80 dark:via-slate-950/50 dark:to-slate-950 pointer-events-none" />
    </div>
  );
}
