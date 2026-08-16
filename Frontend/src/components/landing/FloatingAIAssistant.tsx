"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MessageSquare, HeartPulse, Scan, Salad } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FloatingAIAssistant() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    t("Let's analyze your symptoms.", "লক্ষণগুলো বিশ্লেষণ করি চলুন।"),
    t("Need a doctor? I can help.", "ডাক্তার প্রয়োজন? আমি সাহায্য করতে পারি।"),
    t("Upload your prescription to get started.", "আপনার প্রেসক্রিপশন স্ক্যান করুন।"),
    t("Track your nutrition with AI Vision.", "খাবারের ক্যালরি ট্র্যাক করুন।"),
  ];

  // Rotate messages every 5 seconds
  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, messages.length]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-4 mr-2 bg-white rounded-2xl p-3 shadow-lg border border-primary/20 max-w-[200px]"
          >
            <div className="text-sm font-medium text-slate-700 animate-typing overflow-hidden whitespace-nowrap">
              {messages[messageIndex]}
            </div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-primary/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[320px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <span className="font-bold text-sm">Shustota AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            {/* Chat Body */}
            <div className="p-4 h-[300px] flex flex-col gap-4 overflow-y-auto bg-slate-50">
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-700 border border-slate-100">
                {t("Hi! I am your personal AI healthcare assistant. How can I help you today?", "হ্যালো! আমি আপনার ব্যক্তিগত AI স্বাস্থ্য সহকারী। আমি আপনাকে কীভাবে সাহায্য করতে পারি?")}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-primary/20 hover:bg-primary/5 transition-colors text-xs text-primary font-medium">
                  <HeartPulse size={16} />
                  {t("Symptoms", "লক্ষণ")}
                </button>
                <button className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-secondary/20 hover:bg-secondary/5 transition-colors text-xs text-secondary font-medium">
                  <Scan size={16} />
                  {t("Prescription", "প্রেসক্রিপশন")}
                </button>
              </div>
            </div>
            {/* Input Mockup */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input type="text" placeholder={t("Type a message...", "বার্তা লিখুন...")} className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Orb */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30 flex items-center justify-center relative group"
      >
        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        {isOpen ? <X size={24} /> : <Bot size={28} className="group-hover:animate-bounce-gentle" />}
      </motion.button>
    </div>
  );
}
