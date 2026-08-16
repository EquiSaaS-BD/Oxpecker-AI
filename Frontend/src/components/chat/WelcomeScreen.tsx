"use client";

import { motion } from "framer-motion";
import { Stethoscope, Pill, FileText, Activity, Apple, Building2, User, HeartPulse } from "lucide-react";
import { ChatMode } from "./ChatInput";

export function WelcomeScreen({ onSelect }: { onSelect: (mode: ChatMode) => void }) {
  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const suggestions = [
    { icon: Stethoscope, title: "Analyze my symptoms", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Pill, title: "Compare medicines", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: FileText, title: "Scan prescription", color: "text-green-500", bg: "bg-green-50" },
    { icon: Activity, title: "Analyze blood report", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Apple, title: "Calculate food calories", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Building2, title: "Find nearby hospitals", color: "text-indigo-500", bg: "bg-indigo-50" },
    { icon: User, title: "Find a specialist doctor", color: "text-teal-500", bg: "bg-teal-50" },
    { icon: HeartPulse, title: "Check health risks", color: "text-pink-500", bg: "bg-pink-50" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-12 md:mt-24 px-4 relative z-10">
      {/* Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-3">
          {timeOfDay()},
        </h1>
        <h2 className="text-xl md:text-2xl text-slate-500">
          How can I help with your health today?
        </h2>
      </motion.div>

      {/* Suggestion Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full"
      >
        {suggestions.map((item, idx) => (
          <motion.button
            key={idx}
            onClick={() => onSelect(item)}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-start justify-between w-full h-[90px] sm:h-[110px] p-3 sm:p-4 bg-white border border-slate-200/80 rounded-[16px] sm:rounded-[18px] hover:border-slate-300 hover:shadow-md transition-all text-left shadow-sm"
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color} mb-1 sm:mb-0`}>
              <item.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
            </div>
            <span className="text-[12px] sm:text-[14px] font-[800] text-slate-700 leading-tight">
              {item.title}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
