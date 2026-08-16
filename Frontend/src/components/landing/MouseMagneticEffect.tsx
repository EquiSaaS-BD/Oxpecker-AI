"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function MouseMagneticEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Smooth springs for trailing effect (Emil Kowalski / Apple physics)
  const springConfig = { stiffness: 100, damping: 10 };
  const smoothX = useSpring(0, springConfig);
  const smoothY = useSpring(0, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      setMousePosition({ x: e.clientX, y: e.clientY });
      smoothX.set(e.clientX);
      smoothY.set(e.clientY);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [smoothX, smoothY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Soft Glow following cursor */}
      <motion.div
        className="cursor-glow"
        style={{
          x: smoothX,
          y: smoothY,
        }}
      />
      {/* Tiny medical cursor particle */}
      <motion.div
        className="pointer-events-none fixed z-50 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#6DDA6E]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}
