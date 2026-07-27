"use client";

import { motion } from "framer-motion";
import { Activity, Droplets, HeartPulse, Moon, Timer } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardPreview() {
  const { t } = useLanguage();

  return (
    <section className="relative py-16 lg:py-32 bg-[#050b14] overflow-hidden">
      
      {/* Dark Theme Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      {/* Light Rays / Hologram base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-[100%]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            {t("Your Complete Health Dashboard", "আপনার সম্পূর্ণ হেলথ ড্যাশবোর্ড")}
          </h2>
          <p className="text-slate-400 text-lg">
            {t(
              "Instead of plain text, Shustota AI presents beautiful charts, progress indicators, timelines, and health analytics.",
              "সাধারণ লেখার বদলে Shustota AI আপনাকে দিচ্ছে সুন্দর চার্ট, প্রগ্রেস ইন্ডিকেটর এবং হেলথ অ্যানালিটিক্স।"
            )}
          </p>
        </div>

        {/* 3D Hologram Area */}
        <div className="relative h-[600px] w-full flex items-center justify-center perspective-[1000px]">
          
          {/* Main Hologram Card */}
          <motion.div
            initial={{ opacity: 0, rotateX: 15, scale: 0.95 }}
            whileInView={{ opacity: 1, rotateX: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
            className="w-full max-w-4xl md:aspect-[16/9] glass-card !bg-[#0f172a]/60 !border-white/10 rounded-3xl p-5 sm:p-8 shadow-[0_12px_32px_rgba(0,82,204,0.15)] relative overflow-hidden"
          >
            {/* Hologram scan line inside card */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-laser-scan opacity-50" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{t("Health Score", "হেলথ স্কোর")}</h3>
                <p className="text-slate-400">Based on recent AI analysis</p>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-primary">
                92<span className="text-xl sm:text-2xl text-slate-500">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: HeartPulse, label: "Heart Rate", val: "72 bpm", color: "text-red-400" },
                { icon: Droplets, label: "Water Intake", val: "2.4 L", color: "text-blue-400" },
                { icon: Activity, label: "Steps", val: "8,432", color: "text-green-400" },
                { icon: Moon, label: "Sleep", val: "7h 20m", color: "text-purple-400" },
              ].map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  <m.icon size={24} className={`${m.color} mb-3`} />
                  <p className="text-slate-400 text-sm mb-1">{m.label}</p>
                  <p className="text-white font-bold text-lg">{m.val}</p>
                </motion.div>
              ))}
            </div>

            {/* AI Insights Panel */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Timer size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">AI Recommendation</h4>
                <p className="text-slate-300 text-sm">Your hydration levels are slightly lower than usual. We recommend drinking a glass of water now.</p>
              </div>
            </motion.div>

          </motion.div>

          {/* Floating UI Elements around the hologram */}
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] -left-[5%] lg:left-[5%] glass-card !bg-white/10 !border-white/20 p-4 rounded-2xl backdrop-blur-md shadow-2xl z-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Activity size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Vitals Stable</p>
                <p className="text-slate-400 text-xs">Updated 2m ago</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[20%] -right-[5%] lg:right-[5%] glass-card !bg-white/10 !border-white/20 p-4 rounded-2xl backdrop-blur-md shadow-2xl z-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <HeartPulse size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">ECG Normal</p>
                <p className="text-slate-400 text-xs">AI Analyzed</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
