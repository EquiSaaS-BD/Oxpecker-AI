"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

interface NeuralFieldProps {
  variant?: "hero" | "chat" | "compact";
}

interface WebGLErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

// WebGL Error Boundary to prevent Context Lost crashes
class WebGLErrorBoundary extends React.Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[WebGL] Caught Three.js WebGL context error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Organic 3D Neural Curves & Data Nodes
function NeuralFibers({ variant = "hero" }: NeuralFieldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Generate 16 lightweight 3D curves
  const { curveGeometries, nodePositions, particlePositions } = useMemo(() => {
    const curves: THREE.BufferGeometry[] = [];
    const nodes: THREE.Vector3[] = [];
    const pCount = 24;
    const pPos = new Float32Array(pCount * 3);

    const curveCount = 16;
    for (let i = 0; i < curveCount; i++) {
      const isLeft = i % 2 === 0;
      const xOffset = isLeft ? -10 - (i * 0.7) : 10 + (i * 0.7);
      const startY = -6 + (i * 0.4);
      const startZ = -3 + (i * 0.2);

      const p1 = new THREE.Vector3(xOffset * 1.3, startY, startZ);
      const p2 = new THREE.Vector3(xOffset * 0.8, startY + 3, startZ + 1.5);
      const p3 = new THREE.Vector3(xOffset * 0.6, startY + 7, startZ - 1.5);
      const p4 = new THREE.Vector3(xOffset * 1.0, startY + 12, startZ - 3);

      const curve = new THREE.CatmullRomCurve3([p1, p2, p3, p4]);
      const points = curve.getPoints(30);
      curves.push(new THREE.BufferGeometry().setFromPoints(points));

      if (i % 2 === 0) {
        nodes.push(p2);
      }

      if (i < pCount) {
        pPos[i * 3] = p2.x;
        pPos[i * 3 + 1] = p2.y;
        pPos[i * 3 + 2] = p2.z;
      }
    }

    return { curveGeometries: curves, nodePositions: nodes, particlePositions: pPos };
  }, []);

  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth - 0.5) * 0.1;
      mouse.current.targetY = (e.clientY / window.innerHeight - 0.5) * 0.1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.04;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.04;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03 + mouse.current.x * 0.1;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.02 + mouse.current.y * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, -1]}>
      {curveGeometries.map((geo, i) => (
        <lineSegments key={i} geometry={geo}>
          <lineBasicMaterial
            color={i % 3 === 0 ? "#18B88A" : i % 2 === 0 ? "#22C7F5" : "#0878C9"}
            transparent
            opacity={variant === "chat" ? 0.15 : 0.32}
          />
        </lineSegments>
      ))}

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          color="#22C7F5"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {nodePositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial
            color={idx % 2 === 0 ? "#22C7F5" : "#18B88A"}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
}

// Inner Canvas Container
function PerspectiveGridCanvas({
  variant = "hero",
  className,
  showOverlay = true,
}: {
  variant?: "hero" | "chat" | "compact";
  className?: string;
  showOverlay?: boolean;
  fadeRadius?: number;
}) {
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebGlSupported(false);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  const fallbackCSS = (
    <div 
      className="absolute inset-0 pointer-events-none z-0 opacity-60"
      style={{
        background: `radial-gradient(circle at 50% 35%, rgba(232, 248, 255, 0.9) 0%, rgba(240, 249, 255, 0.3) 50%, transparent 80%)`,
      }}
    />
  );

  return (
    <div 
      aria-hidden="true"
      className={cn("relative w-full h-full overflow-hidden pointer-events-none", className)}
      style={showOverlay ? {
        background: `radial-gradient(ellipse at 50% 32%, #ffffff 0%, #ffffff 48%, rgba(255,255,255,0.75) 68%, transparent 95%)`,
      } : undefined}
    >
      {!webGlSupported ? fallbackCSS : (
        <WebGLErrorBoundary fallback={fallbackCSS}>
          <Canvas
            camera={{ position: [0, 2, 16], fov: 55 }}
            gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                console.warn("[WebGL] WebGL context lost. Rendering CSS fallback.");
                setWebGlSupported(false);
              });
            }}
          >
            <ambientLight intensity={0.6} />
            <NeuralFibers variant={variant} />
          </Canvas>
        </WebGLErrorBoundary>
      )}
    </div>
  );
}

// Export dynamic client-side component (No SSR)
export const PerspectiveGrid3D = dynamic(
  () => Promise.resolve(PerspectiveGridCanvas),
  { ssr: false }
);

export default PerspectiveGrid3D;
