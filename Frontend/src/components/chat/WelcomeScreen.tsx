"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Pill, FileText, Activity, Apple, Building2, User, HeartPulse, Clock } from "lucide-react";
import { ChatMode } from "./ChatInput";

export function WelcomeScreen({ onSelect }: { onSelect: (mode: ChatMode & { promptText?: string }) => void }) {
  const [mounted, setMounted] = useState(false);
  const [formattedTime, setFormattedTime] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");

  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }

      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      setFormattedTime(timeStr);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const suggestions = [
    { icon: Stethoscope, title: "Analyze my symptoms", promptText: "I would like to analyze my current symptoms. Please help me assess them.", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Pill, title: "Compare medicines", promptText: "I want to compare medicines and understand their uses and dosages.", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: FileText, title: "Scan prescription", promptText: "Can you help me understand a doctor prescription?", color: "text-green-500", bg: "bg-green-50" },
    { icon: Activity, title: "Analyze blood report", promptText: "I want to analyze a blood test or medical lab report.", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Apple, title: "Calculate food calories", promptText: "I want to calculate food calories and get dietary recommendations.", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Building2, title: "Find nearby hospitals", promptText: "Can you help me locate nearby hospitals with specialized facilities?", color: "text-indigo-500", bg: "bg-indigo-50" },
    { icon: User, title: "Find a specialist doctor", promptText: "I need to find a specialist doctor for my health concern.", color: "text-teal-500", bg: "bg-teal-50" },
    { icon: HeartPulse, title: "Check health risks", promptText: "I want to check potential health risk factors.", color: "text-pink-500", bg: "bg-pink-50" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-8 md:mt-20 px-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-slate-600 text-xs font-semibold shadow-xs mb-4">
          <Clock size={14} className="text-primary animate-pulse" />
          <span className="tracking-wide" suppressHydrationWarning>
            {mounted ? (formattedTime || "Local Time") : "Local Time"}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight mb-3" suppressHydrationWarning>
          {mounted ? greeting : "Hello"},
        </h1>
        <h2 className="text-lg md:text-2xl text-slate-500 font-medium">
          How can I help with your health today?
        </h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full"
      >
        {suggestions.map((item, idx) => (
          <motion.button
            key={idx}
            onClick={() => onSelect(item)}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-start justify-between w-full h-[100px] sm:h-[115px] p-4 bg-white border border-slate-200/90 rounded-[20px] hover:border-primary/40 hover:shadow-md transition-all text-left shadow-xs group"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            </div>
            <span className="text-[13px] sm:text-[14px] font-bold text-slate-700 leading-snug group-hover:text-primary transition-colors">
              {item.title}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
