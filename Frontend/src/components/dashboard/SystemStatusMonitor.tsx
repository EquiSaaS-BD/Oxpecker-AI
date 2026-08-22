"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  Cloud, 
  Cpu, 
  Sparkles, 
  FileCode2, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  Globe,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

export function SystemStatusMonitor() {
  const [activeTab, setActiveTab] = useState<"overview" | "mcp">("overview");

  const mcpServices = [
    {
      name: "Context7 AI Docs Engine",
      id: "context7",
      status: "Connected & Authorized",
      desc: "ডকুমেন্টেশন রিট্রিভাল (Next.js 15, React, Supabase, Sentry)",
      icon: FileCode2,
      color: "bg-sky-500/10 text-sky-600 border-sky-200",
      badge: "Bearer Auth Active",
    },
    {
      name: "Sentry Crash & Error Tracker",
      id: "sentry",
      status: "Connected & Capturing",
      desc: "লাইভ প্রোডাকশন এরর মনিটরিং (equisaas-bd.sentry.io)",
      icon: Activity,
      color: "bg-rose-500/10 text-rose-600 border-rose-200",
      badge: "Org Token Authorized",
    },
    {
      name: "Supabase Cloud Database",
      id: "supabase",
      status: "Connected & Syncing",
      desc: "রিয়েলটাইম পেশেন্ট রেকর্ড ও RLS পলিসি সাপোর্ট",
      icon: Database,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      badge: "PAT Authorized",
    },
    {
      name: "Vercel Edge Analytics",
      id: "vercel",
      status: "Connected & Optimized",
      desc: "বিশ্বমানের এজ ক্যাশিং ও স্পিড ইনসাইটস",
      icon: Cloud,
      color: "bg-slate-900/10 text-slate-900 border-slate-300",
      badge: "Account Token Active",
    },
    {
      name: "21st.dev UI Design Engine",
      id: "21st",
      status: "Connected & Active",
      desc: "Framer Motion 3D অ্যানিমেটেড কম্পোনেন্ট জেনারেটর",
      icon: Zap,
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
      badge: "API Key Active",
    },
    {
      name: "Chrome DevTools Auditor",
      id: "chrome-devtools",
      status: "Connected & Ready",
      desc: "DOM পারফরম্যান্স ও অ্যাক্সেসিবিলিটি অডিট",
      icon: Cpu,
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
      badge: "Local Stdio Driver",
    },
  ];

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Oxpecker AI Systems & MCP Integrations
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                100% Operational
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ইন্টারন্যাশনাল স্ট্যান্ডার্ড সিকিউরিটি, রিয়েলটাইম ক্লাউড ও অটোমেটেড MCP মনিটরিং ড্যাশবোর্ড
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
              activeTab === "overview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            System Metrics
          </button>
          <button
            onClick={() => setActiveTab("mcp")}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
              activeTab === "mcp" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            MCP Connections ({mcpServices.length})
          </button>
        </div>
      </div>

      {/* Grid of MCP Connected Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mcpServices.map((service, idx) => {
          const Icon = service.icon;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`p-2.5 rounded-xl border ${service.color} group-hover:scale-105 transition-transform shrink-0`}>
                  <Icon size={20} />
                </div>
                <span className="text-[9px] font-black text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg uppercase tracking-wider shadow-2xs">
                  {service.badge}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-1.5">
                  {service.name}
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {service.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-extrabold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {service.status}
                </span>
                <span className="text-slate-400 group-hover:text-sky-600 transition-colors">Active</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default SystemStatusMonitor;
