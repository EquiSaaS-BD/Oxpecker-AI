"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Building2,
  ShieldAlert,
  Network,
  Database,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export interface WhyUsBentoProps {
  className?: string;
}

export function WhyUsBento({ className }: WhyUsBentoProps) {
  const { t } = useLanguage();

  return (
    <section id="features" className={cn("py-12 sm:py-20 relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6", className)}>
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          {t("One Platform For All", "সবার জন্য এক স্বাস্থ্য প্ল্যাটফর্ম")}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3 font-normal">
          {t(
            "The platform brings doctor, hospital, and health-record tools together in one place.",
            "ডাক্তার, হাসপাতাল এবং স্বাস্থ্য রেকর্ডের সুবিধাগুলো এক জায়গায় পাওয়া যাবে।"
          )}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Central Hospital Server (Spans 2 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          viewport={{ once: true }}
          className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-slate-900 via-[#0B1630] to-slate-950 text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between border border-slate-800 shadow-xl group"
        >
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 backdrop-blur-md">
              <Network size={26} />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300 text-xs font-bold">
              {t("All Records in One Place", "এক জায়গায় সব রেকর্ড")}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t("Keep Health Records Together", "স্বাস্থ্য রেকর্ড এক জায়গায় রাখুন")}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              {t(
                "Keep reports, past prescriptions, and important health history together so they can be shared with a care provider when needed.",
                "রিপোর্ট, আগের প্রেসক্রিপশন ও গুরুত্বপূর্ণ স্বাস্থ্য তথ্য এক জায়গায় গুছিয়ে রাখুন, যাতে প্রয়োজন হলে চিকিৎসাসেবাদাতার সাথে শেয়ার করা যায়।"
              )}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-2 text-sky-400">
              <Database size={16} /> {t("Organized Record Storage", "গুছিয়ে রেকর্ড সংরক্ষণ")}
            </span>
            <Link href="/about" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors">
              {t("Learn About Our Work", "আমাদের কাজ সম্পর্কে জানুন")} <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Emergency profile */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: 0.1 }}
          className="rounded-[2rem] bg-gradient-to-br from-rose-50 to-orange-50/60 p-8 border border-rose-200/80 shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-6 shadow-sm">
              <ShieldAlert size={26} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 block mb-1">
              {t("In Emergencies", "জরুরি মুহূর্তে")}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">
              {t("Emergency Health Summary", "জরুরি স্বাস্থ্য তথ্য")}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {t(
                "The planned emergency profile will help authorized doctors review a patient's blood group, serious allergies, and key history when urgent care is needed.",
                "পরিকল্পিত জরুরি প্রোফাইলে অনুমোদিত ডাক্তার রক্তের গ্রুপ, গুরুতর অ্যালার্জি এবং প্রয়োজনীয় চিকিৎসার তথ্য দেখতে পারবেন।"
              )}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-200/60 flex items-center justify-between text-xs font-bold text-rose-700">
            <span>{t("Access Controls Planned", "প্রবেশাধিকার নিয়ন্ত্রণ পরিকল্পিত")}</span>
            <span className="font-mono">BD-H-XXXXXX</span>
          </div>
        </motion.div>

        {/* Hospital bed updates */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: 0.2 }}
          className="rounded-[2rem] bg-white p-8 border border-slate-200 shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6">
              <Building2 size={26} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
              {t("Planned Updates", "পরিকল্পিত আপডেট")}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">
              {t("Hospital Bed Information", "হাসপাতালের বেডের তথ্য")}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {t(
                "Connected hospitals will be able to share ICU and general bed updates so patients can decide where to go.",
                "যুক্ত হাসপাতালগুলো আইসিইউ ও সাধারণ বেডের আপডেট দিতে পারবে, যাতে রোগীরা কোথায় যাবেন তা ঠিক করতে পারেন।"
              )}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>{t("Updates From Hospitals", "হাসপাতালের দেওয়া আপডেট")}</span>
            <Link href="/hospitals" className="hover:underline">{t("View Hospitals", "হাসপাতাল দেখুন")} &rarr;</Link>
          </div>
        </motion.div>

        {/* Bengali AI assistant */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: 0.3 }}
          className="md:col-span-2 rounded-[2rem] bg-white p-8 sm:p-10 border border-slate-200 shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-4">
              <MessageSquare size={26} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 block">
              {t("Bengali AI Assistant", "বাংলা এআই সহকারী")}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {t("Ask Health Questions and Scan Prescriptions", "স্বাস্থ্য প্রশ্ন করুন ও প্রেসক্রিপশন স্ক্যান করুন")}
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
              {t(
                "Ask health questions in everyday Bengali or upload a prescription. The assistant explains instructions in simple language, highlights warning signs, and tells you when to seek medical care.",
                "সহজ বাংলায় স্বাস্থ্য বিষয়ে প্রশ্ন করুন বা প্রেসক্রিপশন আপলোড করুন। সহকারী নির্দেশনাগুলো সহজ ভাষায় বুঝিয়ে দেবে, বিপদের লক্ষণ জানাবে এবং কখন চিকিৎসা নিতে হবে তা বুঝতে সাহায্য করবে।"
              )}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
            <span className="text-slate-500">{t("Medicine and Doctor Information", "ওষুধ ও ডাক্তারের তথ্য")}</span>
            <Link href="/chat" className="text-sky-600 hover:text-sky-700 font-extrabold flex items-center gap-1">
              {t("Start AI Health Chat", "এআই স্বাস্থ্য চ্যাট শুরু করুন")} <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyUsBento;
