"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

/**
 * Connected Medical Synapse & Vital Pulse Mesh
 * Represents an intelligent, interconnected nationwide healthcare network.
 * Nodes symbolize hospitals, emergency centers, and patient health records.
 */
function MedicalSynapseMesh() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { viewport, pointer } = useThree();

  const nodeCount = 180;
  const maxConnections = 300;

  // Medical Palette: Clinical Sky (#0284c7), Vital Teal (#0d9488), Deep Navy (#0369a1), Soft Cyan (#06b6d4)
  const palette = useMemo(() => [
    new THREE.Color("#0284c7"),
    new THREE.Color("#0d9488"),
    new THREE.Color("#0369a1"),
    new THREE.Color("#06b6d4"),
    new THREE.Color("#38bdf8"),
  ], []);

  // Smooth circular texture for antialiased medical node points
  const nodeTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Glowing core
    const gradient = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(2, 132, 199, 0.9)");
    gradient.addColorStop(0.7, "rgba(13, 148, 136, 0.4)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Initialize node positions & velocities
  const [positions, basePositions, velocities, colors, pulsePhases] = useMemo(() => {
    const pos = new Float32Array(nodeCount * 3);
    const base = new Float32Array(nodeCount * 3);
    const vel = new Float32Array(nodeCount * 3);
    const col = new Float32Array(nodeCount * 3);
    const pulse = new Float32Array(nodeCount);

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3;
      // Spread across viewport in realistic spatial depth
      const x = (Math.random() - 0.5) * 28;
      const y = (Math.random() - 0.5) * 18;
      const z = (Math.random() - 0.5) * 8 - 2;

      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;

      base[idx] = x;
      base[idx + 1] = y;
      base[idx + 2] = z;

      vel[idx] = (Math.random() - 0.5) * 0.008;
      vel[idx + 1] = (Math.random() - 0.5) * 0.008;
      vel[idx + 2] = (Math.random() - 0.5) * 0.004;

      const c = palette[i % palette.length];
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;

      pulse[i] = Math.random() * Math.PI * 2;
    }

    return [pos, base, vel, col, pulse];
  }, [palette]);

  // Buffer for network connection lines between nearby hospital nodes
  const [linePositions, lineColors] = useMemo(() => {
    const linePos = new Float32Array(maxConnections * 2 * 3);
    const lineCol = new Float32Array(maxConnections * 2 * 3);
    return [linePos, lineCol];
  }, [maxConnections]);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return;

    const time = state.clock.elapsedTime;
    const targetMouseX = (pointer.x * viewport.width) / 2;
    const targetMouseY = (pointer.y * viewport.height) / 2;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const colAttr = pointsRef.current.geometry.attributes.color;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    const linePosAttr = linesRef.current.geometry.attributes.position;
    const lineColAttr = linesRef.current.geometry.attributes.color;
    const linePosArr = linePosAttr.array as Float32Array;
    const lineColArr = lineColAttr.array as Float32Array;

    // Update node positions with organic vital wave floating
    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3;

      // Vital harmonic breathing motion
      const breathing = Math.sin(time * 0.8 + pulsePhases[i]) * 0.4;
      const ecgWave = Math.sin(time * 1.5 + posArr[idx] * 0.2) * 0.3;

      posArr[idx] += velocities[idx];
      posArr[idx + 1] += velocities[idx + 1] + (breathing * 0.002);
      posArr[idx + 2] += velocities[idx + 2];

      // Soft boundary bounce
      if (Math.abs(posArr[idx] - basePositions[idx]) > 2.5) velocities[idx] *= -1;
      if (Math.abs(posArr[idx + 1] - basePositions[idx + 1]) > 2.0) velocities[idx + 1] *= -1;

      // Mouse interactive synaptic displacement
      const dx = targetMouseX - posArr[idx];
      const dy = targetMouseY - posArr[idx + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influenceRadius = 5.0;

      if (dist < influenceRadius && dist > 0.1) {
        const force = Math.pow((influenceRadius - dist) / influenceRadius, 1.5) * 0.08;
        posArr[idx] -= (dx / dist) * force;
        posArr[idx + 1] -= (dy / dist) * force;
      }

      // Dynamic vital pulse brightness modulation
      const pulseBrightness = 0.7 + 0.3 * Math.sin(time * 2.0 + pulsePhases[i] + ecgWave);
      const baseCol = palette[i % palette.length];
      colArr[idx] = baseCol.r * pulseBrightness;
      colArr[idx + 1] = baseCol.g * pulseBrightness;
      colArr[idx + 2] = baseCol.b * pulseBrightness;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Dynamically calculate synaptic network connection lines
    let lineIdx = 0;
    const maxConnectionDistance = 4.2;

    for (let i = 0; i < nodeCount && lineIdx < maxConnections; i++) {
      const idxA = i * 3;
      const ax = posArr[idxA];
      const ay = posArr[idxA + 1];
      const az = posArr[idxA + 2];

      for (let j = i + 1; j < nodeCount && lineIdx < maxConnections; j++) {
        const idxB = j * 3;
        const bx = posArr[idxB];
        const by = posArr[idxB + 1];
        const bz = posArr[idxB + 2];

        const d = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);

        if (d < maxConnectionDistance) {
          const lPosIdx = lineIdx * 6;
          linePosArr[lPosIdx] = ax;
          linePosArr[lPosIdx + 1] = ay;
          linePosArr[lPosIdx + 2] = az;
          linePosArr[lPosIdx + 3] = bx;
          linePosArr[lPosIdx + 4] = by;
          linePosArr[lPosIdx + 5] = bz;

          // Line alpha / color based on proximity and vital signal pulse
          const proximityAlpha = Math.max(0, 1 - (d / maxConnectionDistance)) * 0.35;
          const signalPulse = Math.sin(time * 3.0 - d * 2.0) * 0.5 + 0.5;
          const r = 0.01 + 0.1 * signalPulse;
          const g = 0.5 + 0.3 * signalPulse;
          const b = 0.8;

          const lColIdx = lineIdx * 6;
          lineColArr[lColIdx] = r * proximityAlpha;
          lineColArr[lColIdx + 1] = g * proximityAlpha;
          lineColArr[lColIdx + 2] = b * proximityAlpha;
          lineColArr[lColIdx + 3] = r * proximityAlpha;
          lineColArr[lColIdx + 4] = g * proximityAlpha;
          lineColArr[lColIdx + 5] = b * proximityAlpha;

          lineIdx++;
        }
      }
    }

    // Clear unused lines
    for (let k = lineIdx * 6; k < maxConnections * 6; k++) {
      linePosArr[k] = 0;
      lineColArr[k] = 0;
    }

    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;

    // Fluid camera parallax
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, (pointer.x * Math.PI) / 40, 0.05);
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, (-pointer.y * Math.PI) / 40, 0.05);
    linesRef.current.rotation.y = pointsRef.current.rotation.y;
    linesRef.current.rotation.x = pointsRef.current.rotation.x;
  });

  return (
    <group>
      {/* Interconnected Synapse Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>

      {/* Hospital and Health Record Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.28}
          vertexColors
          map={nodeTexture || undefined}
          transparent
          alphaTest={0.01}
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function Login3DBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-slate-50 via-white to-sky-50/40 overflow-hidden" />
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-slate-50 via-white to-sky-50/40 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#f8fafc"]} />
        <fog attach="fog" args={["#f8fafc", 8, 22]} />
        <ambientLight intensity={0.9} />
        <MedicalSynapseMesh />
      </Canvas>
    </div>
  );
}
