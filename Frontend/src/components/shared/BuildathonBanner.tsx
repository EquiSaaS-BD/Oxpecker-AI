"use client";

import { useState } from "react";
import { useHackathon } from "@/context/HackathonContext";
import { Trophy, ExternalLink, FileText, X, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BuildathonBanner() {
  const { isYunet } = useHackathon();
  const [isTopBannerDismissed, setIsTopBannerDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // If not accessing via YUNet referral, render ZERO branding (100% clean for other hackathons/government)
  if (!isYunet) return null;

  const slidesUrl = "https://docs.google.com/presentation/d/1pe99g83r5PLhQTYKm48mZURWcM6S1FgNGtVTfHDXLaw/edit";
  const devpostUrl = "https://yunet-aignite26.devpost.com";

  return (
    <>
      {/* 1. Top Eye-Catching Announcement Bar */}
      <AnimatePresence>
        {!isTopBannerDismissed && (
          <motion.aside
            aria-label="Buildathon Official Project Verification"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="relative z-[60] bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white border-b border-amber-500/30 shadow-md overflow-hidden"
          >
            {/* Subtle Animated Gold Glow Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              
              {/* Left: Official Title & Badge */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider text-[10px]">
                  <Trophy size={12} className="text-amber-400" />
                  Official Entry
                </span>
                
                <p className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-300 font-extrabold">Built For Ostad Presents YUNet AIgnite Buildathon 2026</span>
                  <span className="hidden md:inline text-slate-400">·</span>
                  <span className="hidden md:inline text-slate-300">National AI Hackathon for B2C Solutions</span>
                </p>
              </div>

              {/* Right: Quick Action Links for Judges & Dismiss */}
              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <a
                  href={slidesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all shadow-xs"
                >
                  <FileText size={12} />
                  <span>5-Slide Deck</span>
                  <ExternalLink size={10} className="opacity-70" />
                </a>

                <a
                  href={devpostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 font-semibold text-[11px] transition-all"
                >
                  <span>Devpost</span>
                  <ExternalLink size={10} className="opacity-70" />
                </a>

                <button
                  onClick={() => setIsTopBannerDismissed(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Minimize banner"
                  aria-label="Minimize banner"
                >
                  <X size={14} />
                </button>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. Floating Glassmorphic Watermark Sticker (Always Visible for YUNet Judges) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 select-none group"
      >
        <div className="relative">
          {/* Glowing Aura on Hover */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-2xl blur-xs opacity-40 group-hover:opacity-100 transition duration-300"></div>

          <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 backdrop-blur-xl border border-amber-400/50 text-white shadow-2xl transition-all">
            
            {/* Pulsing Gold Status Dot & Trophy */}
            <div className="relative shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy size={14} className="text-amber-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </div>

            {/* Sticker Text Content */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-tight text-white">
                  YUNet AIgnite 2026
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                  <ShieldCheck size={9} />
                  Verified
                </span>
              </div>
              <span className="text-[10px] text-amber-300/90 font-medium">
                Built For Ostad Presents Buildathon
              </span>
            </div>

            {/* Quick Links on Hover or click */}
            <div className="flex items-center gap-1 pl-1 border-l border-white/10 ml-1">
              <a
                href={slidesUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View Pitch Deck (5 Slides)"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors"
              >
                <FileText size={13} />
              </a>
              <a
                href={devpostUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Devpost"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  );
}
