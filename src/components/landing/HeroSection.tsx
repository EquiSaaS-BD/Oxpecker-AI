"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Background Video (Seamless Crossfade System) */}
        <div className="absolute inset-0 z-0 w-full h-full pointer-events-none overflow-hidden bg-[#050b14]">
          <img
            src="/videos/Landing_page.gif"
            alt="Landing page background animation"
            fetchPriority="high"
            decoding="async"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover opacity-90 brightness-110 mix-blend-screen"
          />
          {/* Soft gradient at the bottom to blend with the next section seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050b14]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full h-full flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6 max-w-5xl flex flex-col items-center"
          >
            <h1 className="relative text-[2.5rem] sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.2] lg:leading-[1.1] uppercase flex flex-col md:flex-row flex-wrap items-center justify-center gap-x-4 z-10 break-words text-center">
              {/* Background Shadow / Glow */}
              <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 animate-[gradient_4s_linear_infinite] rounded-full z-0 -m-4"></div>
              
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-600 to-indigo-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] drop-shadow-sm text-center">
                AI-POWERED
              </span>
              <span className="relative z-10 text-[#0a1628] drop-shadow-md text-center mt-2 md:mt-0">
                HEALTHCARE ASSISTANT
              </span>
            </h1>
            <p className="text-lg sm:text-2xl text-slate-800 font-medium tracking-wide pb-4">
              Smart Care - Anywhere - Anytime
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0a1628] font-bold rounded-xl shadow-[0_4px_24px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_32px_rgba(255,255,255,0.2)] emil-button">
                {t("Get Started Free", "বিনামূল্যে শুরু করুন")}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 emil-button">
                {t("Watch Live Demo", "লাইভ ডেমো দেখুন")}
                <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Bar Below Video */}
      <div className="w-full bg-[#050b14] py-5 border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 lg:gap-12">
            {["AI Symptom Checker", "Prescription Scanner", "Doctor Finder", "Nutrition AI"].map((chip, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-base font-medium text-slate-400 cursor-default whitespace-nowrap">
                <CheckCircle2 size={16} className="text-cyan-400/80 shrink-0" /> {chip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
