"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FinalCTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 lg:py-40 bg-white overflow-hidden text-center flex flex-col items-center justify-center min-h-[60vh] border-t border-slate-100">
      
      {/* Animated Rings Background (Light Mode) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[300px] h-[300px] rounded-full border border-sky-200 absolute oxpecker-ring-lg" />
        <div className="w-[500px] h-[500px] rounded-full border border-slate-200 absolute oxpecker-ring-lg oxpecker-ring-lg-delay" />
        <div className="w-[700px] h-[700px] rounded-full border border-emerald-100 absolute oxpecker-ring-lg" style={{ animationDelay: "-4s" }} />
        
        {/* Subtle Glow */}
        <div className="absolute w-[800px] h-[800px] bg-sky-50 blur-[120px] rounded-full -z-10" />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
        >
          {t("Start Your Smarter Healthcare Journey Today", "আজই আপনার স্মার্ট স্বাস্থ্যসেবা শুরু করুন")}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg lg:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          {t(
            "Join thousands of users using Artificial Intelligence to understand their health, find doctors, analyze medicines, and make better healthcare decisions.",
            "হাজারো ব্যবহারকারীর সাথে যোগ দিন যারা কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে স্বাস্থ্যকে বুঝছে, ডাক্তার খুঁজছে এবং সঠিক সিদ্ধান্ত নিচ্ছে।"
          )}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <Link href="/register" className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all active:scale-95 w-full sm:w-auto">
            {/* Hover Glare */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[oxpecker-line-flow_1.5s_ease-in-out] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            
            {t("Get Started Free", "বিনামূল্যে শুরু করুন")}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link href="#demo" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 w-full sm:w-auto">
            <CalendarPlus size={20} className="text-slate-400" />
            {t("Book a Demo", "ডেমো বুক করুন")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
