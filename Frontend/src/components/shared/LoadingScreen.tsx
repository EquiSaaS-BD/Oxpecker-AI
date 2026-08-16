"use client";

import Image from "next/image";

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = "Loading Oxpecker AI...",
  subtext = "Preparing your healthcare workspace",
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 transition-all duration-500 ${
        fullScreen
          ? "fixed inset-0 z-[9999] min-h-screen w-screen bg-[#050b14]/90 backdrop-blur-md"
          : "w-full min-h-[300px] py-12"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#00C2A8]/20 via-[#3B82F6]/15 to-transparent blur-3xl pointer-events-none animate-pulse" />

      {/* Central Icon & Spinning Rings Container */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00C2A8]/30 animate-[spin_10s_linear_infinite]" />

        {/* Inner Gradient Spinning Ring */}
        <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#00C2A8] border-r-[#3B82F6] animate-[spin_1.2s_cubic-bezier(0.68,-0.55,0.27,1.55)_infinite]" />

        {/* Pulsing Center Icon Container */}
        <div className="relative w-14 h-14 rounded-2xl bg-[#0a1628] border border-white/10 shadow-[0_0_25px_rgba(0,194,168,0.25)] flex items-center justify-center overflow-hidden animate-[pulse_2s_ease-in-out_infinite]">
          <Image
            src="/images/Oxpecker_icon.png"
            alt="Oxpecker AI"
            width={34}
            height={34}
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* Message & Animated Dots */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-semibold tracking-wide text-slate-100 font-sans">
            {message}
          </span>
          <span className="flex gap-1 items-center ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-bounce" />
          </span>
        </div>

        {subtext && (
          <p className="text-[12px] text-slate-400 font-medium tracking-normal">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingScreen;
