"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MedicalLoaderProps {
  text?: string;
  className?: string;
  iconSize?: number;
  fullScreen?: boolean;
  color?: string;
  interval?: number;
}

// Exact FontAwesome 6 Solid SVG Paths for the 5 requested icons
const MEDICAL_ICONS = [
  // 1. Briefcase Medical (fa-solid fa-briefcase-medical)
  {
    name: "briefcase-medical",
    viewBox: "0 0 512 512",
    path: (
      <path
        fill="currentColor"
        d="M184 48l144 0c4.4 0 8 3.6 8 8l0 40L176 96l0-40c0-4.4 3.6-8 8-8zm-56 8l0 40L64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-64 0 0-40c0-30.9-25.1-56-56-56L184 0c-30.9 0-56 25.1-56 56zm96 152c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 48 48 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-48 0 0 48c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-48-48 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l48 0 0-48z"
      />
    ),
  },
  // 2. Truck Medical / Ambulance (fa-solid fa-truck-medical)
  {
    name: "truck-medical",
    viewBox: "0 0 640 512",
    path: (
      <path
        fill="currentColor"
        d="M0 48C0 21.5 21.5 0 48 0L368 0c26.5 0 48 21.5 48 48l0 48 50.7 0c17 0 33.3 6.7 45.3 18.7L589.3 192c12 12 18.7 28.3 18.7 45.3l0 18.7 0 32 0 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0c0 53-43 96-96 96s-96-43-96-96l-128 0c0 53-43 96-96 96s-96-43-96-96l-16 0c-26.5 0-48-21.5-48-48L0 48zM416 256l128 0 0-18.7L466.7 160 416 160l0 96zM160 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm368-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM176 80l0 48-48 0c-8.8 0-16 7.2-16 16l0 32c0 8.8 7.2 16 16 16l48 0 0 48c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-48 48 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-48 0 0-48c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16z"
      />
    ),
  },
  // 3. Stethoscope (fa-solid fa-stethoscope)
  {
    name: "stethoscope",
    viewBox: "0 0 576 512",
    path: (
      <path
        fill="currentColor"
        d="M142.4 21.9c5.6 16.8-3.5 34.9-20.2 40.5L96 71.1 96 192c0 53 43 96 96 96s96-43 96-96l0-120.9-26.1-8.7c-16.8-5.6-25.8-23.7-20.2-40.5s23.7-25.8 40.5-20.2l26.1 8.7C334.4 19.1 352 43.5 352 71.1L352 192c0 77.2-54.6 141.6-127.3 156.7C231 404.6 278.4 448 336 448c61.9 0 112-50.1 112-112l0-70.7c-28.3-12.3-48-40.5-48-73.3c0-44.2 35.8-80 80-80s80 35.8 80 80c0 32.8-19.7 61-48 73.3l0 70.7c0 97.2-78.8 176-176 176c-92.9 0-168.9-71.9-175.5-163.1C87.2 334.2 32 269.6 32 192L32 71.1c0-27.5 17.6-52 43.8-60.7l26.1-8.7c16.8-5.6 34.9 3.5 40.5 20.2zM480 224a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"
      />
    ),
  },
  // 4. Syringe (fa-solid fa-syringe)
  {
    name: "syringe",
    viewBox: "0 0 512 512",
    path: (
      <path
        fill="currentColor"
        d="M441 7l32 32 32 32c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-15-15L417.9 128l55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-72-72L295 73c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l55 55L422.1 56 407 41c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0zM210.3 155.7l61.1-61.1c.3 .3 .6 .7 1 1l16 16 56 56 56 56 16 16c.3 .3 .6 .6 1 1l-191 191c-10.5 10.5-24.7 16.4-39.6 16.4l-88.8 0L41 505c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l57-57 0-88.8c0-14.9 5.9-29.1 16.4-39.6l43.3-43.3 57 57c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-57-57 41.4-41.4 57 57c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-57-57z"
      />
    ),
  },
  // 5. Hospital (fa-solid fa-hospital)
  {
    name: "hospital",
    viewBox: "0 0 640 512",
    path: (
      <path
        fill="currentColor"
        d="M192 48c0-26.5 21.5-48 48-48L400 0c26.5 0 48 21.5 48 48l0 464-80 0 0-80c0-26.5-21.5-48-48-48s-48 21.5-48 48l0 80-80 0 0-464zM48 96l112 0 0 416L48 512c-26.5 0-48-21.5-48-48L0 320l80 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L0 288l0-64 80 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L0 192l0-48c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 48-80 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l80 0 0 64-80 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l80 0 0 144c0 26.5-21.5 48-48 48l-112 0 0-416 112 0zM312 64c-8.8 0-16 7.2-16 16l0 24-24 0c-8.8 0-16 7.2-16 16l0 16c0 8.8 7.2 16 16 16l24 0 0 24c0 8.8 7.2 16 16 16l16 0c8.8 0 16-7.2 16-16l0-24 24 0c8.8 0 16-7.2 16-16l0-16c0-8.8-7.2-16-16-16l-24 0 0-24c0-8.8-7.2-16-16-16l-16 0z"
      />
    ),
  },
];

export function MedicalLoader({
  text = "Loading",
  className = "",
  iconSize = 44,
  fullScreen = false,
  color = "rgb(116, 192, 252)",
  interval = 330,
}: MedicalLoaderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MEDICAL_ICONS.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  const activeIcon = MEDICAL_ICONS[index];

  const content = (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Icon Container - strictly borderless, centered */}
      <div
        className="relative flex items-center justify-center overflow-visible"
        style={{ width: iconSize, height: iconSize }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeIcon.name}
            initial={{ opacity: 0, scale: 0.75, y: 3 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: -3 }}
            transition={{
              duration: 0.14,
              ease: "easeOut",
            }}
            className="flex items-center justify-center absolute inset-0"
            style={{ color }}
          >
            <svg
              viewBox={activeIcon.viewBox}
              className="w-full h-full drop-shadow-[0_4px_12px_rgba(116,192,252,0.35)]"
              aria-hidden="true"
            >
              {activeIcon.path}
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Label & Animated Dots - slightly spaced out / outside as requested */}
      <div className="flex items-center justify-center mt-4">
        <span className="text-[13px] font-semibold text-slate-500 tracking-wider">
          {text}
        </span>
        <span className="inline-flex items-center gap-1.5 ml-2.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: color,
              animationDuration: "1.2s",
              animationDelay: "0ms",
            }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: color,
              animationDuration: "1.2s",
              animationDelay: "180ms",
            }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: color,
              animationDuration: "1.2s",
              animationDelay: "360ms",
            }}
          />
        </span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}

export default MedicalLoader;
