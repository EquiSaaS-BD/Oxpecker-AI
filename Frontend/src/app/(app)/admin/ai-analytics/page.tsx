"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Users, MessageSquare, Zap, DollarSign,
  Clock, Globe, Activity, Stethoscope, Pill, Apple, FileText,
  Brain, ChevronDown,
} from "lucide-react";

// Demo analytics data
const WEEKLY_DATA = [
  { day: "Mon", requests: 145, cost: 1.45 },
  { day: "Tue", requests: 203, cost: 2.03 },
  { day: "Wed", requests: 178, cost: 1.78 },
  { day: "Thu", requests: 256, cost: 2.56 },
  { day: "Fri", requests: 312, cost: 3.12 },
  { day: "Sat", requests: 189, cost: 1.89 },
  { day: "Sun", requests: 98, cost: 0.98 },
];

const PROVIDER_USAGE = [
  { name: "OpenAI", percentage: 65, requests: 1247, color: "bg-emerald-500" },
  { name: "Google Gemini", percentage: 25, requests: 478, color: "bg-blue-500" },
  { name: "DeepSeek", percentage: 8, requests: 153, color: "bg-violet-500" },
  { name: "Anthropic", percentage: 2, requests: 38, color: "bg-amber-500" },
];

const POPULAR_TOPICS = [
  { topic: "Symptom Checking", count: 456, icon: Stethoscope, color: "text-blue-600 bg-blue-50" },
  { topic: "Medicine Search", count: 312, icon: Pill, color: "text-purple-600 bg-purple-50" },
  { topic: "Nutrition Analysis", count: 198, icon: Apple, color: "text-green-600 bg-green-50" },
  { topic: "Report Analysis", count: 156, icon: FileText, color: "text-rose-600 bg-rose-50" },
  { topic: "Doctor Recommendations", count: 134, icon: Users, color: "text-teal-600 bg-teal-50" },
  { topic: "Image Analysis", count: 89, icon: Brain, color: "text-amber-600 bg-amber-50" },
];

const LANGUAGES = [
  { lang: "Bangla", percentage: 62, flag: "🇧🇩" },
  { lang: "English", percentage: 31, flag: "🇺🇸" },
  { lang: "Hindi", percentage: 5, flag: "🇮🇳" },
  { lang: "Arabic", percentage: 2, flag: "🇸🇦" },
];

export default function AiAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const maxRequests = Math.max(...WEEKLY_DATA.map(d => d.requests));

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-slate-800 tracking-tight">AI Analytics</h1>
          <p className="text-[15px] text-slate-500 mt-1">Monitor Oxpecker AI usage, costs, and performance</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {[
            { label: "24h", value: "24h" },
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "All", value: "all" },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTimeRange(t.value)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                timeRange === t.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Queries", value: "1,916", change: "+18%", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
          { label: "Total Cost", value: "$13.81", change: "-5%", icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
          { label: "Avg Response", value: "1.8s", change: "-12%", icon: Clock, color: "text-violet-600 bg-violet-50" },
          { label: "Unique Users", value: "342", change: "+24%", icon: Users, color: "text-rose-600 bg-rose-50" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${
                stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-[28px] font-black text-slate-800">{stat.value}</p>
            <p className="text-[13px] text-slate-400 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-[16px] font-bold text-slate-700 mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-sky-600" /> Weekly Requests
          </h3>
          <div className="flex items-end gap-3 h-[200px]">
            {WEEKLY_DATA.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[12px] font-bold text-slate-500">{d.requests}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.requests / maxRequests) * 160}px` }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                  className="w-full  from-primary/80 to-primary/40 rounded-t-xl min-h-[8px]"
                />
                <span className="text-[12px] font-medium text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Usage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-[16px] font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Activity size={18} className="text-sky-600" /> Provider Usage
          </h3>
          <div className="space-y-4">
            {PROVIDER_USAGE.map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] font-semibold text-slate-700">{p.name}</span>
                  <span className="text-[13px] font-bold text-slate-500">{p.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.percentage}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    className={`h-full rounded-full ${p.color}`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{p.requests.toLocaleString()} requests</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Topics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-[16px] font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-sky-600" /> Popular Topics
          </h3>
          <div className="space-y-2.5">
            {POPULAR_TOPICS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.color} shrink-0`}>
                  <t.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-slate-700">{t.topic}</p>
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(t.count / POPULAR_TOPICS[0].count) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="h-full bg-sky-600/50 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-[14px] font-bold text-slate-500">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-[16px] font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Globe size={18} className="text-sky-600" /> Language Distribution
          </h3>
          <div className="space-y-4">
            {LANGUAGES.map((l, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[28px]">{l.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-semibold text-slate-700">{l.lang}</span>
                    <span className="text-[14px] font-bold text-slate-500">{l.percentage}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${l.percentage}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                      className="h-full  from-primary/60  rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Stats */}
          <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-xl">
            <h4 className="text-[14px] font-bold text-rose-700 mb-3">🚨 Emergency Detections</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[22px] font-black text-rose-600">23</p>
                <p className="text-[11px] text-rose-400 font-medium">This Week</p>
              </div>
              <div>
                <p className="text-[22px] font-black text-rose-600">67</p>
                <p className="text-[11px] text-rose-400 font-medium">This Month</p>
              </div>
              <div>
                <p className="text-[22px] font-black text-rose-600">89%</p>
                <p className="text-[11px] text-rose-400 font-medium">999 Called</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
