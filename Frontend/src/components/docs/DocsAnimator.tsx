"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function FadeInStagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0, y = 20, className = "" }: { children: React.ReactNode, delay?: number, y?: number, className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function TiltBox({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 20px 40px -10px rgba(0, 194, 168, 0.15)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}
