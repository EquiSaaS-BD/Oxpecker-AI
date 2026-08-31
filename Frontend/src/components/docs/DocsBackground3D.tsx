"use client";

import { motion } from "framer-motion";

export function DocsBackground3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50">
      {/* Soft animated ambient light */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-sky-100/40 blur-[100px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-slate-200/50 blur-[120px]"
      />
      
      {/* Premium Minimalist Grid */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, #000 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, transparent 100%)',
        }}
      />
    </div>
  );
}