"use client";

import { useState } from "react";
import Image from "next/image";
import { useHackathon } from "@/context/HackathonContext";
import { ExternalLink, FileText, X, Trophy, ShieldCheck, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BuildathonBanner() {
  const { isYunet } = useHackathon();
  const [isDismissed, setIsDismissed] = useState(false);

  // If not visiting via ?ref=yunet, render ZERO branding (100% clean for other hackathons/govt)
  if (!isYunet) return null;

  const slidesUrl = "https://docs.google.com/presentation/d/1pe99g83r5PLhQTYKm48mZURWcM6S1FgNGtVTfHDXLaw/edit";
  const devpostUrl = "https://yunet-aignite26.devpost.com";

  return (
    <>
      {/* 1. Official Banner - Positioned Right Underneath the Fixed Navbar */}
      <AnimatePresence>
        {!isDismissed && (
          <motion.aside
            aria-label="Built For Ostad Presents YUNet AIgnite Buildathon 2026"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-16 lg:top-20 left-0 right-0 z-[95] w-full bg-[#171640] text-white border-b-2 border-[#bc5229] shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
              
              {/* Left: Official White Rounded Badge + Title */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Official Logo Badge */}
                <div className="relative shrink-0 w-24 sm:w-28 md:w-32 h-9 sm:h-10 md:h-11 bg-white rounded-lg sm:rounded-xl p-1 shadow-sm overflow-hidden flex items-center justify-center">
                  <Image
                    src="/images/yunet-badge-logo.png"
                    alt="Ostad Presents YUNet AIgnite Buildathon 2026"
                    fill
                    sizes="140px"
                    className="object-contain p-0.5"
                    priority
                  />
                </div>

                {/* Banner Text (Exact Matches User Image) */}
                <div className="flex flex-col justify-center min-w-0">
                  <h2 className="text-[13px] sm:text-[15px] md:text-[17px] font-extrabold tracking-tight leading-tight truncate sm:whitespace-normal">
                    <span className="text-white">Built For Ostad Presents </span>
                    <span className="text-[#fec51a] drop-shadow-xs font-black">YUNet AIgnite Buildathon 2026</span>
                  </h2>
                  <p className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-300 font-medium mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#fec51a] animate-pulse" />
                    <span>National AI Hackathon for B2C Solutions</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-amber-300/90 font-semibold">Verified Student Participant Entry</span>
                  </p>
                </div>
              </div>

              {/* Right: Quick Action Buttons for Judges & Dismiss Button (Kata Jai) */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                
                {/* 5-Slide Pitch Deck Button */}
                <a
                  href={slidesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fec51a] hover:bg-[#e6b115] text-[#171640] font-black text-xs transition-all shadow-sm hover:scale-102 cursor-pointer"
                  title="Open Official 5-Slide Pitch Deck"
                >
                  <FileText size={13} className="text-[#171640]" />
                  <span className="hidden min-[480px]:inline">5-Slide Deck</span>
                  <span className="min-[480px]:hidden">Deck</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>

                {/* Devpost Link */}
                <a
                  href={devpostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all hover:scale-102 cursor-pointer"
                  title="View on Devpost"
                >
                  <span>Devpost</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>

                {/* Close Button (Pop up ta jate kata jai) */}
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                  title="Close Banner"
                  aria-label="Close Banner"
                >
                  <X size={16} />
                </button>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. Floating Docked Sticker at Bottom-Right (Allows Reopening if Dismissed) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 select-none group"
      >
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#bc5229] to-[#fec51a] rounded-2xl blur-xs opacity-50 group-hover:opacity-100 transition duration-300" />
          
          <div className="relative flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#171640] border border-[#bc5229]/60 text-white shadow-2xl backdrop-blur-xl">
            {/* Logo Badge Icon */}
            <div className="relative shrink-0 w-8 h-8 rounded-lg bg-white p-0.5 overflow-hidden flex items-center justify-center">
              <Image
                src="/images/yunet-badge-logo.png"
                alt="YUNet Badge"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>

            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-black text-white">YUNet AIgnite 2026</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#fec51a] animate-pulse" />
              </div>
              <span className="text-[10px] text-[#fec51a] font-bold">Ostad Presents Buildathon</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 pl-1 border-l border-white/15">
              {isDismissed && (
                <button
                  onClick={() => setIsDismissed(false)}
                  title="Re-open Banner"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-[#fec51a] hover:text-[#171640] text-white transition-colors cursor-pointer"
                >
                  <ChevronUp size={13} />
                </button>
              )}
              <a
                href={slidesUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View Pitch Deck"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-[#fec51a] hover:text-[#171640] text-white transition-colors cursor-pointer"
              >
                <FileText size={13} />
              </a>
              <a
                href={devpostUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Devpost"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-[#fec51a] hover:text-[#171640] text-white transition-colors cursor-pointer"
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
