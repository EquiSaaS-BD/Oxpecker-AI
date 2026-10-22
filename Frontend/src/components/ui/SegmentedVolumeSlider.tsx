"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

interface SegmentedVolumeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  segmentsCount?: number;
  className?: string;
  label?: string;
}

export function SegmentedVolumeSlider({
  min = 500,
  max = 5000,
  step = 250,
  value,
  onChange,
  segmentsCount = 20,
  className = "",
  label = "CONSULTATION FEE",
}: SegmentedVolumeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clamp current value to min-max
  const clampedValue = Math.max(min, Math.min(value, max));
  const percent = ((clampedValue - min) / (max - min)) * 100;

  const updateValueFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const rawRatio = rect.width > 0 ? x / rect.width : 0;
      const rawValue = min + rawRatio * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const finalValue = Math.max(min, Math.min(steppedValue, max));
      onChange(finalValue);
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateValueFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateValueFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(min, clampedValue - step));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, clampedValue + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  // Build segments
  const segments = Array.from({ length: segmentsCount }, (_, i) => {
    const segmentRatio = segmentsCount > 1 ? i / (segmentsCount - 1) : 0;
    const currentRatio = (clampedValue - min) / (max - min);
    // Active if this segment's position is before the thumb position
    const isActive = segmentRatio < currentRatio - 0.01;
    return { index: i, isActive };
  });

  return (
    <div
      className={`bg-[#0d1117] rounded-2xl p-4 sm:p-5 border border-slate-800/90 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] select-none ${className}`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </span>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2797de]/15 border border-[#2797de]/30 text-[#38bdf8] shadow-[0_0_12px_rgba(39,151,222,0.25)]">
          <span className="text-[11px] font-semibold text-slate-400">Up to</span>
          <span className="text-[13px] font-extrabold font-mono tracking-tight">
            ৳{clampedValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Segmented Volume Track */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        aria-valuetext={`৳${clampedValue}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative h-9 sm:h-10 flex items-center justify-between px-2 cursor-pointer touch-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2797de]/50 rounded-xl"
      >
        {/* Render Segment Bars */}
        {segments.map((seg) => (
          <div
            key={seg.index}
            className={`w-[3.5px] sm:w-[4px] h-[18px] sm:h-[22px] rounded-full transition-all duration-150 pointer-events-none ${
              seg.isActive
                ? "bg-[#2797de] shadow-[0_0_10px_rgba(39,151,222,0.9),0_0_2px_#ffffff]"
                : "bg-[#262c38]"
            }`}
          />
        ))}

        {/* Sliding White Capsule Thumb */}
        <div
          style={{
            left: `calc(10px + (${percent / 100} * (100% - 20px)))`,
            transform: "translateX(-50%)",
          }}
          className={`absolute top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-7 sm:h-8 bg-white rounded-md shadow-[0_0_14px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.6)] border border-white transition-transform ${
            isDragging ? "scale-110 cursor-grabbing" : "cursor-grab hover:scale-105"
          }`}
        />
      </div>

      {/* Min / Max Labels */}
      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium px-1">
        <span>৳{min}</span>
        <span className="text-slate-600 font-mono text-[10px]">
          {Math.round(percent)}%
        </span>
        <span>৳{max.toLocaleString()}+</span>
      </div>

      {/* Quick Budget Presets */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1">
          Quick:
        </span>
        {[1000, 2000, 3000, 5000].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              clampedValue === preset
                ? "bg-[#2797de] text-white shadow-[0_0_10px_rgba(39,151,222,0.5)]"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/50"
            }`}
          >
            ৳{preset.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
}
