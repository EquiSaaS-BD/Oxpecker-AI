"use client";

import { motion } from "framer-motion";
import { Stethoscope, FileText, Pill, Salad, ArrowRight, ShieldAlert, Sparkles, Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export function AIIntelligenceSuite() {
  const { t } = useLanguage();

  return (
    <section className="relative py-16 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 space-y-32">
        
        {/* 1. AI Symptom Checker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Stethoscope size={16} />
              {t("AI Symptom Checker", "AI লক্ষণ বিশ্লেষক")}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0a1628]">
              {t("Analyze Symptoms with AI", "AI দিয়ে লক্ষণ বিশ্লেষণ করুন")}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              {t(
                "Simply describe your symptoms and Shustota AI provides possible health insights, severity indicators, and recommended specialists using interactive visual cards.",
                "শুধু আপনার লক্ষণগুলো লিখুন এবং আমাদের AI আপনাকে সম্ভাব্য স্বাস্থ্য সমস্যা, এর তীব্রতা এবং কোন ডাক্তারের কাছে যেতে হবে তা বিস্তারিত জানাবে।"
              )}
            </p>
            <ul className="space-y-3 pt-2">
              {["Symptom Analysis", "Severity Detection", "Health Tips", "Specialist Recommendation", "Emergency Alerts"].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
          <div className="relative">
            {/* Interactive Body Model / Severity Meter Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="glass-card rounded-[2rem] p-6 shadow-2xl relative overflow-hidden bg-slate-50 border border-slate-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <ShieldAlert size={24} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0a1628] text-lg">Migraine / Tension Headache</h4>
                  <p className="text-sm text-slate-500 font-medium">Severity: Moderate to High</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Analysis Progress</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-orange-500" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group cursor-pointer hover:border-primary/30 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended</p>
                  <p className="font-bold text-primary">Consult Neurologist</p>
                </div>
                <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* 2. Prescription Scanner (Laser Scan Animation) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-full max-w-md mx-auto aspect-[3/4] sm:aspect-[4/5] glass-card rounded-[2rem] p-2 bg-slate-100 border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="bg-white rounded-[1.5rem] p-6 h-full min-h-[400px] relative overflow-hidden">
                <div className="opacity-30">
                  <div className="h-4 w-32 bg-slate-300 rounded mb-4" />
                  <div className="h-3 w-48 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-slate-200 rounded mb-8" />
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-200 rounded" />
                    <div className="h-2 w-full bg-slate-200 rounded" />
                    <div className="h-2 w-3/4 bg-slate-200 rounded" />
                  </div>
                </div>
                
                {/* Laser Scan Line */}
                <div className="animate-laser-scan z-10" />

                {/* Detected Medicine Card pops up */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  viewport={{ once: true }}
                  className="absolute bottom-4 left-4 right-4 bg-primary text-white p-4 rounded-xl shadow-lg border border-primary/20 backdrop-blur-md z-20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-green-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-green-100">Medicine Detected</span>
                  </div>
                  <p className="font-bold text-lg">Paracetamol 500mg</p>
                  <p className="text-sm opacity-90">1 tablet • 3 times/day • After meal</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
              <FileText size={16} />
              {t("Prescription Scanner", "প্রেসক্রিপশন স্ক্যানার")}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0a1628]">
              {t("Understand Every Prescription", "প্রতিটি প্রেসক্রিপশন বুঝুন সহজেই")}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              {t(
                "Upload a prescription or medical report. Our AI extracts medicine names, dosage, frequency, duration, side effects, and food instructions automatically.",
                "প্রেসক্রিপশনের ছবি আপলোড করুন। আমাদের AI স্বয়ংক্রিয়ভাবে ওষুধের নাম, খাওয়ার নিয়ম এবং পার্শ্বপ্রতিক্রিয়া বের করে আনবে।"
              )}
            </p>
            <Link href="/features/scanner" className="inline-flex items-center gap-2 text-secondary font-bold hover:underline">
              {t("Try Scanner Now", "স্ক্যানারটি ব্যবহার করুন")} <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* 3. Medicine Intelligence & 4. Nutrition Intelligence could follow similar pattern */}

      </div>
    </section>
  );
}
