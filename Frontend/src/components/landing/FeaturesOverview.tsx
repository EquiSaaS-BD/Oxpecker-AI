"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, HeartPulse, Microscope, Activity, Bot, Clock, Lock, Building2 } from "lucide-react";

export function FeaturesOverview() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Bot,
      title: t("AI Health Assistant", "এআই হেলথ অ্যাসিস্ট্যান্ট"),
      desc: t("Get instant answers to health queries 24/7.", "যেকোনো সময় স্বাস্থ্যগত প্রশ্নের ইনস্ট্যান্ট উত্তর পান।"),
      color: "text-sky-500",
      bg: "bg-sky-50"
    },
    {
      icon: Activity,
      title: t("Symptom Analysis", "সিম্পটম অ্যানালাইসিস"),
      desc: t("Describe symptoms for AI-powered insights.", "লক্ষণ জানালে এআই আপনার রোগ সম্পর্কে ধারণা দেবে।"),
      color: "text-indigo-500",
      bg: "bg-indigo-50"
    },
    {
      icon: Microscope,
      title: t("Prescription Scanner", "প্রেসক্রিপশন স্ক্যানার"),
      desc: t("Upload and understand complex prescriptions.", "প্রেসক্রিপশন আপলোড করে সহজে বুঝে নিন।"),
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      icon: Building2,
      title: t("Hospital Directory", "হসপিটাল ডিরেক্টরি"),
      desc: t("Find nearby hospitals with specific facilities.", "কাছাকাছি হসপিটাল এবং তাদের সুবিধাগুলো জানুন।"),
      color: "text-rose-500",
      bg: "bg-rose-50"
    }
  ];

  const whyChooseUs = [
    { icon: Clock, title: t("24/7 Instant Support", "২৪/৭ ইনস্ট্যান্ট সাপোর্ট") },
    { icon: Lock, title: t("Secure Medical Data", "সুরক্ষিত ডেটা") },
    { icon: ShieldCheck, title: t("DGDA Verified", "DGDA ভেরিফাইড") },
    { icon: HeartPulse, title: t("Personalized Guidance", "পার্সোনালাইজড গাইডেন্স") },
  ];

  return (
    <section id="features" className="relative py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight"
          >
            {t("Everything you need, ", "আপনার যা যা প্রয়োজন, ")}
            <span className="text-slate-500">{t("beautifully organized.", "সবকিছু এক জায়গায়।")}</span>
          </motion.h2>
        </div>

        {/* Bento Grid */}
        <div className="bento-container mb-20">
          {/* Main Feature - Spans 2 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bento-card md:col-span-2 bg-slate-900 text-white border-slate-800"
          >
             <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <Bot size={28} className="text-sky-400" />
             </div>
             <h3 className="text-2xl font-bold mb-3">{features[0].title}</h3>
             <p className="text-slate-400 text-lg leading-relaxed max-w-md">{features[0].desc}</p>
          </motion.div>

          {/* Secondary Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bento-card bg-sky-50 border-sky-100"
          >
             <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-sm">
                <Activity size={24} className="text-sky-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">{features[1].title}</h3>
             <p className="text-slate-600">{features[1].desc}</p>
          </motion.div>

          {/* Tertiary Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bento-card bg-emerald-50 border-emerald-100"
          >
             <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-sm">
                <Microscope size={24} className="text-emerald-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">{features[2].title}</h3>
             <p className="text-slate-600">{features[2].desc}</p>
          </motion.div>

          {/* Quaternary Feature - Spans 2 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bento-card md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between bg-white border-slate-200"
          >
             <div>
               <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-6">
                  <Building2 size={24} className="text-rose-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">{features[3].title}</h3>
               <p className="text-slate-600">{features[3].desc}</p>
             </div>
          </motion.div>
        </div>

        {/* Minimalist Trust Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {whyChooseUs.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left transition-colors hover:bg-slate-100"
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700">
                <w.icon size={18} />
              </div>
              <span className="font-semibold text-sm text-slate-700">{w.title}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
