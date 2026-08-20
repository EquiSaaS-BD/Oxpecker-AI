"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Stethoscope,
  FileText,
  Building2,
  Clock,
  ShieldCheck,
  HeartPulse,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export interface WhyUsBentoProps {
  className?: string;
}

export function WhyUsBento({ className }: WhyUsBentoProps) {
  const { t, language } = useLanguage();

  return (
    <section id="features" className={cn("py-12 sm:py-16 relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6", className)}>
      <div className="text-center mb-10">
        <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-200 px-4 py-1.5 rounded-full inline-block mb-3">
          {t("Smarter Healthcare for Bangladesh", "আধুনিক স্বাস্থ্যসেবা প্রযুক্তি")}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t("Why Choose Oxpecker AI", "কেন অক্সপ্যাকার এআই ব্যবহার করবেন")}
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          {t(
            "Designed to connect patients, doctors, and hospitals seamlessly across Bangladesh.",
            "রোগী, অভিজ্ঞ ডাক্তার এবং স্বনামধন্য হাসপাতালগুলোকে সরাসরি সংযুক্ত করার স্মার্ট স্বাস্থ্যসেবা প্ল্যাটফর্ম।"
          )}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 auto-rows-auto">
        {/* 01: AI Health Assistant */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-1 md:col-span-2 row-span-1 rounded-3xl bg-gradient-to-br from-sky-900 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden group shadow-lg min-h-[200px] flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-sky-400 mb-4 backdrop-blur-md">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              {t("Instant AI Health Guidance in Bengali", "বাংলায় তাৎক্ষণিক এআই স্বাস্থ্য পরামর্শ")}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {t(
                "Describe your symptoms in natural Bengali or English. Our AI analyzes your inputs and recommends appropriate medical specialists instantly.",
                "আপনার লক্ষণ বা শারীরিক সমস্যা বাংলায় লিখুন। আমাদের এআই সাথে সাথে প্রাথমিক মূল্যায়ন এবং সঠিক বিশেষজ্ঞ ডাক্তারের পরামর্শ দেবে।"
              )}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-sky-400">
            <span>{t("24/7 Available Free", "২৪/৭ সার্ভিস সম্পূর্ণ ফ্রি")}</span>
          </div>
        </motion.div>

        {/* 02: Verified BMDC Doctors */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="col-span-1 md:col-span-1 row-span-1 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[200px] flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
              <Stethoscope size={22} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              {t("Verified Specialist Doctors", "BMDC রেজিস্টার্ড অভিজ্ঞ ডাক্তার")}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              {t(
                "Find certified doctors across Cardiology, Medicine, Pediatrics, Gynecology and book chamber slots with clear fee details.",
                "হৃদরোগ, মেডিসিন, শিশু রোগ ও স্ত্রীরোগসহ সকল বিষয়ের ডাক্তারদের প্রোফাইল, চেম্বারের ঠিকানা ও সময়সূচী দেখুন।"
              )}
            </p>
          </div>
        </motion.div>

        {/* 03: Smart Prescription & Report Reader */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-1 row-span-1 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[200px] flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <FileText size={22} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              {t("Prescription & Report Scanner", "প্রেসক্রিপশন ও রিপোর্ট স্ক্যানার")}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              {t(
                "Upload prescription photos to get clear medicine timing, dosages, and food instructions explained in plain Bengali.",
                "প্রেসক্রিপশন বা টেস্ট রিপোর্টের ছবি আপলোড করে ওষুধের নিয়ম, খাওয়ার সময় এবং পরামর্শ বুঝে নিন।"
              )}
            </p>
          </div>
        </motion.div>

        {/* 04: Hospital Bed & Emergency Info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="col-span-1 md:col-span-2 row-span-1 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[200px] flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
              <Building2 size={22} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {t("Hospital Beds & Emergency Directory", "জরুরী হাসপাতাল বেড ও ডিরেক্টরি")}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl">
              {t(
                "Access real-time hospital info, ICU bed availabilities, and emergency ambulance contacts for major hospitals across Bangladesh.",
                "স্কয়ার, ল্যাবএইড, পপুলার, এভারকেয়ারসহ দেশের শীর্ষ হাসপাতালগুলোর যোগাযোগের ঠিকানা, বেড ও জরুরী হটলাইন নাম্বার।"
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyUsBento;
