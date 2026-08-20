"use client";

import { motion } from "framer-motion";
import { UserPlus, MessageSquareHeart, Cpu, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: UserPlus,
      title: t("Create Your Account", "অ্যাকাউন্ট তৈরি করুন"),
      desc: t("Sign up securely in just a few clicks.", "কয়েক ক্লিকেই নিরাপদে সাইন আপ করুন।"),
    },
    {
      icon: MessageSquareHeart,
      title: t("Ask Your Question", "প্রশ্ন জিজ্ঞাসা করুন"),
      desc: t("Describe your symptoms or upload a prescription.", "লক্ষণ লিখুন অথবা প্রেসক্রিপশন আপলোড করুন।"),
    },
    {
      icon: Cpu,
      title: t("AI Analyzes Data", "AI বিশ্লেষণ করে"),
      desc: t("Our advanced AI processes your health data instantly.", "আমাদের AI তাৎক্ষণিকভাবে আপনার স্বাস্থ্য ডেটা প্রক্রিয়া করে।"),
    },
    {
      icon: ShieldCheck,
      title: t("Get Smart Guidance", "সঠিক নির্দেশনা পান"),
      desc: t("Receive accurate health advice and doctor recommendations.", "সঠিক স্বাস্থ্য পরামর্শ এবং ডাক্তারের সুপারশি পান।"),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t("Get Started in 4 Simple Steps", "৪টি সহজ ধাপে শুরু করুন")}
          </h2>
        </div>

        <div className="relative">
          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-slate-100 -translate-y-1/2 z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-slate-200"
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
                className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center spatial-shadow transition-all duration-300 group cursor-default hover:-translate-y-2 hover:border-slate-200"
              >
                <div className="w-16 h-16 mx-auto rounded-[1.25rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 relative group-hover:bg-slate-900 group-hover:border-slate-800 transition-colors duration-300">
                  <step.icon size={28} className="text-slate-600 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
