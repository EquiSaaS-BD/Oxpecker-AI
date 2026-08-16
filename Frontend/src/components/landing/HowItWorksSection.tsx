"use client";

import { motion } from "framer-motion";
import { UserPlus, MessageSquareHeart, Cpu, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HowItWorksSection() {
  const { lang, t } = useLanguage();
  const isBn = lang === "bn";

  const steps = [
    {
      icon: UserPlus,
      num: isBn ? "০১" : "01",
      title: t("Create Your Account", "অ্যাকাউন্ট তৈরি করুন"),
      desc: t("Sign up securely in just a few clicks.", "কয়েক ক্লিকেই নিরাপদে সাইন আপ করুন।"),
    },
    {
      icon: MessageSquareHeart,
      num: isBn ? "০২" : "02",
      title: t("Ask Your Question", "সমস্যা জানান"),
      desc: t("Describe your symptoms or upload a prescription.", "আপনার লক্ষণ লিখুন অথবা প্রেসক্রিপশন আপলোড করুন।"),
    },
    {
      icon: Cpu,
      num: isBn ? "০৩" : "03",
      title: t("AI Analyzes Data", "AI বিশ্লেষণ করে"),
      desc: t("Our advanced AI processes your health data instantly.", "আমাদের উন্নত AI তাৎক্ষণিকভাবে আপনার ডেটা বিশ্লেষণ করে।"),
    },
    {
      icon: ShieldCheck,
      num: isBn ? "০৪" : "04",
      title: t("Get Smart Guidance", "সঠিক গাইডেন্স পান"),
      desc: t("Receive accurate health advice and doctor recommendations.", "সঠিক স্বাস্থ্য পরামর্শ এবং ডাক্তারের রেকমেন্ডেশন পান।"),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-16 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0a1628]">
            <span className="text-primary uppercase tracking-widest text-sm sm:text-2xl lg:text-3xl mr-2">{t("How It Works:", "কীভাবে কাজ করে:")}</span>
            <span>{t("Get Started in 4 Simple Steps", "৪টি সহজ ধাপে শুরু করুন")}</span>
          </h2>
        </div>

        <div className="relative">
          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-slate-100 -translate-y-1/2 z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-default"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 relative group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-colors duration-300">
                  <step.icon size={28} className="text-slate-600 group-hover:text-white transition-colors duration-300" />
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm">
                    {step.num}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-[#0a1628] mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
