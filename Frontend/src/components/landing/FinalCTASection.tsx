"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FinalCTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-16 lg:py-32 bg-[#0a1628] overflow-hidden text-center flex flex-col items-center justify-center min-h-[60vh]">
      
      {/* Animated Rings Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[300px] h-[300px] rounded-full border border-primary/20 absolute shustota-ring-lg" />
        <div className="w-[500px] h-[500px] rounded-full border border-secondary/20 absolute shustota-ring-lg shustota-ring-lg-delay" />
        <div className="w-[700px] h-[700px] rounded-full border border-tertiary/20 absolute shustota-ring-lg" style={{ animationDelay: "-4s" }} />
        
        {/* Glow */}
        <div className="absolute w-[600px] h-[600px] bg-primary/20 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
        >
          {t("Start Your Smarter Healthcare Journey Today", "আজই শুরু করুন আপনার স্মার্ট স্বাস্থ্যসেবা")}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-lg lg:text-xl text-slate-400 mb-10 max-w-5xl mx-auto leading-relaxed"
        >
          {t(
            "Join thousands of users using Artificial Intelligence to understand their health, find doctors, analyze medicines, and make better healthcare decisions.",
            "হাজারো ব্যবহারকারীর সাথে যুক্ত হোন যারা কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে স্বাস্থ্য সমস্যা বুঝছেন, ডাক্তার খুঁজছেন এবং সঠিক সিদ্ধান্ত নিচ্ছেন।"
          )}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/register" className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-primary to-[#0052cc] text-white font-bold rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,61,155,0.2)] hover:shadow-[0_12px_32px_rgba(0,61,155,0.4)] emil-button cursor-default">
            {/* Hover Glare */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shustota-line-flow_1.5s_ease-in-out] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            
            {t("Get Started Free", "বিনামূল্যে শুরু করুন")}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link href="#demo" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 emil-button cursor-default">
            <CalendarPlus size={20} />
            {t("Book a Demo", "লাইভ ডেমো দেখুন")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
