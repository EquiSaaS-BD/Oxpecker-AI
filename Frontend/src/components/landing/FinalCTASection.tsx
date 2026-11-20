"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FinalCTASection() {
  const { t } = useLanguage();

  return (
    <section 
      className="relative py-20 lg:py-32 bg-slate-50 overflow-hidden text-center flex flex-col items-center justify-center border-t border-slate-200"
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight"
        >
          {t("Keep Your Health Records Together", "স্বাস্থ্য রেকর্ড এক জায়গায় রাখুন")}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-base lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          {t(
            "Create a personal health ID and organize your prescriptions and reports in one place.",
            "নিজের হেলথ আইডি খুলে প্রেসক্রিপশন ও রিপোর্ট এক জায়গায় গুছিয়ে রাখুন।"
          )}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors active:scale-95 w-full sm:w-auto">
            {t("Create Free Health ID", "ফ্রি হেলথ আইডি খুলুন")}
            <ArrowRight size={18} />
          </Link>
          
          <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-800 font-bold rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs active:scale-95 w-full sm:w-auto">
            <CalendarPlus size={18} className="text-slate-600" />
            {t("For Doctors & Hospitals", "ডাক্তার ও হাসপাতালের জন্য")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
