"use client";

import { motion } from "framer-motion";
import { Activity, Droplets, HeartPulse, Moon, Timer } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="relative py-24 lg:py-32 bg-slate-50 overflow-hidden">
      
      {/* Refined Grid Background (Light Mode) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      
      {/* Light Rays */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-slate-300/30 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Your Complete Health Dashboard
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-lg sm:text-xl font-medium"
          >
            Instead of plain text, Oxpecker AI presents beautiful charts, progress indicators, timelines, and actionable health analytics.
          </motion.p>
        </div>

        {/* 3D Dashboard Preview (Light Mode Glassmorphism) */}
        <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center perspective-[1200px]">
          
          <motion.div
            initial={{ opacity: 0, rotateX: 10, y: 40 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-white/70 backdrop-blur-3xl border border-slate-200 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b border-slate-200 pb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Health Score</h3>
                <p className="text-slate-500 font-semibold mt-1">Based on recent AI analysis</p>
              </div>
              <div className="text-5xl font-black text-slate-900">
                92<span className="text-2xl text-slate-400 font-bold">/100</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: HeartPulse, label: "Heart Rate", val: "72 bpm", color: "text-rose-500", bg: "bg-rose-100" },
                { icon: Droplets, label: "Water Intake", val: "2.4 L", color: "text-sky-500", bg: "bg-sky-100" },
                { icon: Activity, label: "Steps", val: "8,432", color: "text-emerald-500", bg: "bg-emerald-100" },
                { icon: Moon, label: "Sleep", val: "7h 20m", color: "text-indigo-500", bg: "bg-indigo-100" },
              ].map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/50 border border-slate-100 rounded-[1.5rem] p-5 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center mb-4`}>
                    <m.icon size={24} className={m.color} />
                  </div>
                  <p className="text-slate-500 text-sm font-semibold mb-1">{m.label}</p>
                  <p className="text-slate-900 font-extrabold text-2xl tracking-tight">{m.val}</p>
                </motion.div>
              ))}
            </div>

            {/* AI Insights Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 flex gap-5 items-start"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                <Timer size={24} className="text-slate-600" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-lg mb-2">AI Recommendation</h4>
                <p className="text-slate-600 font-medium leading-relaxed">Your hydration levels are slightly lower than usual. We recommend drinking a glass of water now to maintain optimal performance.</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] -left-[4%] lg:-left-[8%] bg-white border border-slate-200 p-4 rounded-2xl shadow-xl z-20 hidden md:block"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Activity size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-slate-900 text-sm font-extrabold">Vitals Stable</p>
                <p className="text-slate-500 text-xs font-semibold">Updated 2m ago</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[20%] -right-[4%] lg:-right-[8%] bg-white border border-slate-200 p-4 rounded-2xl shadow-xl z-20 hidden md:block"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <HeartPulse size={20} className="text-sky-600" />
              </div>
              <div>
                <p className="text-slate-900 text-sm font-extrabold">ECG Normal</p>
                <p className="text-slate-500 text-xs font-semibold">AI Analyzed</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
