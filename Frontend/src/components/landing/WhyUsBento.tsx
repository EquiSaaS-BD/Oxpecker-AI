"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
  MessageSquare,
  Building2,
  ShieldAlert,
  Network,
  Database,
  ArrowRight,
  Sparkles,
  Zap,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export interface WhyUsBentoProps {
  className?: string;
}

// ============================================
// Bento Build Animation Variants
// ============================================
const bentoContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const bentoItemVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
    },
  },
};

export function WhyUsBento({ className }: WhyUsBentoProps) {
  const { t } = useLanguage();

  return (
    <section id="features" className={cn("py-16 sm:py-24 relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6", className)}>
      
      {/* Section Header */}
      <div className="text-center mb-14 lg:mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 mb-3"
        >
          <Zap size={13} className="text-amber-500 fill-amber-500" />
          <span>{t("Ecosystem Architecture • সমন্বিত প্রযুক্তি", "সমন্বিত স্বাস্থ্য আর্কিটেকচার")}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
        >
          {t("One Platform For All", "সবার জন্য এক স্বাস্থ্য প্ল্যাটফর্ম")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3 font-normal"
        >
          {t(
            "The platform brings doctor, hospital, emergency triage, and digital health-record tools together in one place.",
            "ডাক্তার, হাসপাতাল এবং স্বাস্থ্য রেকর্ডের আধুনিক সব সুবিধা এখন একটি মাত্র প্ল্যাটফর্মে।"
          )}
        </motion.p>
      </div>

      {/* Bento Grid with Bento Build Animations */}
      <motion.div 
        variants={bentoContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Card 1: Central Hospital Server (Spans 2 cols) */}
        <motion.div 
          variants={bentoItemVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-slate-900 via-[#0B1630] to-slate-950 text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between border border-slate-800 shadow-xl group"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

          <div className="relative z-10 space-y-4">
            <div className="w-13 h-13 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 backdrop-blur-md shadow-inner">
              <Network size={26} />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300 text-xs font-bold">
              {t("Centralized Healthcare Cloud", "এক জায়গায় সব রেকর্ড")}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t("Keep Health Records Together", "স্বাস্থ্য রেকর্ড এক জায়গায় রাখুন")}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              {t(
                "Keep reports, past prescriptions, and important health history together so they can be shared securely with any authorized doctor across Bangladesh.",
                "রিপোর্ট, আগের প্রেসক্রিপশন ও গুরুত্বপূর্ণ স্বাস্থ্য তথ্য ক্লাউডে এনক্রিপ্টেড রাখুন, যাতে জরুরি মুহূর্তে যে কোনো রেজিস্টার্ড চিকিৎসকের সাথে শেয়ার করা যায়।"
              )}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-400 relative z-10">
            <span className="flex items-center gap-2 text-sky-400">
              <Database size={16} /> {t("Fast & Interoperable Storage", "আন্তর্জাতিক মানের সুরক্ষিত সংরক্ষণ")}
            </span>
            <Link href="/about" className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors group-hover:translate-x-1">
              <span>{t("Learn About Our Architecture", "সিস্টেম আর্কিটেকচার জানুন")}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Card 2: Emergency Profile */}
        <motion.div 
          variants={bentoItemVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="rounded-[2rem] bg-gradient-to-br from-rose-50 via-rose-50/50 to-orange-50/40 p-8 border border-rose-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-13 h-13 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
              <ShieldAlert size={26} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 block mb-1">
              {t("Life-Saving Triage", "জরুরি মুহূর্তে")}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">
              {t("Emergency Health Summary", "জরুরি স্বাস্থ্য তথ্য")}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {t(
                "Instant emergency QR profile helping authorized doctors access patient blood group, pacemaker status, critical allergies, and emergency contacts in under 5 seconds.",
                "জরুরি পরিস্থিতিতে কথা বলতে না পারলেও QR কোড স্ক্যান করে ডাক্তার রোগীর রক্তের গ্রুপ, ড্রাগ অ্যালার্জি এবং জরুরি অভিভাবকের ফোন নম্বর পেয়ে যাবেন।"
              )}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-200/60 flex items-center justify-between text-xs font-bold text-rose-700 relative z-10">
            <span>{t("Instant 5-Sec Retrieval", "তাৎক্ষণিক ৫ সেকেন্ডে উদ্ধার")}</span>
            <span className="font-mono bg-rose-100/80 px-2 py-0.5 rounded border border-rose-200 text-[10px]">999 READY</span>
          </div>
        </motion.div>

        {/* Card 3: Hospital bed updates */}
        <motion.div 
          variants={bentoItemVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="rounded-[2rem] bg-white p-8 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
              <Building2 size={26} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
              {t("Live Capacity", "হাসপাতাল পর্যবেক্ষণ")}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">
              {t("Hospital Bed Information", "হাসপাতালের বেডের তথ্য")}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {t(
                "Live network telemetry enabling real-time ICU, general bed, and emergency facility availability across leading hospitals in Bangladesh.",
                "হাসপাতালগুলোর আইসিইউ ও সাধারণ বেডের তথ্য হালনাগাদ দেখে সময় নষ্ট না করে সঠিক হাসপাতালে দ্রুত পৌঁছানোর সুবিধা।"
              )}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 relative z-10">
            <span>{t("Verified Telemetry", "যাচাইকৃত নেটওয়ার্ক")}</span>
            <Link href="/hospitals" className="inline-flex items-center gap-1 hover:text-emerald-800 transition-colors">
              <span>{t("View Hospitals", "হাসপাতাল দেখুন")}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>

        {/* Card 4: Bengali AI assistant (Spans 2 cols) */}
        <motion.div 
          variants={bentoItemVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-white via-sky-50/30 to-slate-50 p-8 sm:p-10 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

          <div className="relative z-10 space-y-3">
            <div className="w-13 h-13 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 transition-transform">
              <MessageSquare size={26} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 block">
              {t("Multilingual Clinical Assistant", "বাংলা ও ইংরেজি এআই ডাক্তার")}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {t("Ask Health Questions & Scan Prescriptions", "স্বাস্থ্য প্রশ্ন করুন ও প্রেসক্রিপশন স্ক্যান করুন")}
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
              {t(
                "Powered by Microsoft Azure OpenAI and Computer Vision Read OCR. Decodes doctor handwriting, checks generic medicine alternatives, and triages symptoms under DGHS & WHO medical protocols.",
                "মাইক্রোসফট Azure ও কম্পিউটার ভিশন প্রযুক্তির সমন্বয়ে ডাক্তারের হাতের লেখা ডিকোড, সাশ্রয়ী জেনেরিক বিকল্প ওষুধ এবং স্বাস্থ্য অধিদপ্তরের প্রটোকল অনুযায়ী প্রাথমিক পরামর্শ নিন।"
              )}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs font-bold relative z-10">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-sky-500" />
              {t("Trained on 9,600+ DGHS/WHO Clinical Cases", "১৫০টি রোগের ৯,৬০০+ ক্লিনিক্যাল কেস")}
            </span>
            <Link href="/chat?category=symptoms" className="text-sky-600 hover:text-sky-700 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>{t("Start AI Health Chat", "এআই স্বাস্থ্য চ্যাট শুরু করুন")}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default WhyUsBento;
