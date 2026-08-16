"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, HeartPulse, Microscope, Activity, Bot, Clock, Lock, Sparkles, Building2 } from "lucide-react";

export function FeaturesOverview() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Bot,
      title: t("AI Health Assistant", "AI হেলথ অ্যাসিস্ট্যান্ট"),
      desc: t("Get instant answers to health queries 24/7.", "যেকোনো সময় স্বাস্থ্য বিষয়ক প্রশ্নের তাৎক্ষণিক উত্তর পান।"),
      color: "from-primary to-[#0052cc]",
      border: "border-t-primary"
    },
    {
      icon: Activity,
      title: t("Symptom Analysis", "লক্ষণ বিশ্লেষণ"),
      desc: t("Describe symptoms for AI-powered insights.", "লক্ষণ জানিয়ে AI-এর সাহায্যে সম্ভাব্য কারণ জানুন।"),
      color: "from-secondary to-[#008fa3]",
      border: "border-t-secondary"
    },
    {
      icon: Microscope,
      title: t("Prescription Scanner", "প্রেসক্রিপশন স্ক্যানার"),
      desc: t("Upload and understand complex prescriptions.", "প্রেসক্রিপশনের ছবি আপলোড করে সহজে ওষুধের বিবরণ জানুন।"),
      color: "from-tertiary to-[#007a4d]",
      border: "border-t-tertiary"
    },
    {
      icon: Building2,
      title: t("Hospital Directory", "হাসপাতাল ডিরেক্টরি"),
      desc: t("Find nearby hospitals with specific facilities.", "কাছাকাছি সব সুবিধা সংবলিত হাসপাতাল খুঁজে বের করুন।"),
      color: "from-orange-500 to-red-500",
      border: "border-t-orange-500"
    }
  ];

  const whyChooseUs = [
    { icon: Clock, title: t("24/7 Instant Support", "২৪/৭ তাৎক্ষণিক সাপোর্ট") },
    { icon: Lock, title: t("Secure Medical Data", "সুরক্ষিত ডেটা") },
    { icon: ShieldCheck, title: t("DGDA Verified", "DGDA যাচাইকৃত") },
    { icon: HeartPulse, title: t("Personalized Guidance", "ব্যক্তিগত গাইডেন্স") },
  ];

  return (
    <section id="features" className="relative py-16 lg:py-32 bg-slate-50 overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="absolute inset-0 bg-aurora opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="text-3xl lg:text-4xl font-bold text-[#0a1628]"
          >
            <span className="text-primary">{t("Why Millions Will Choose Us: ", "কেন সবাই Shustota বেছে নেবে: ")}</span>
            <span className="text-slate-700">{t("Everything You Need in One Platform.", "আপনার স্বাস্থ্যসেবার সবকিছু এক প্ল্যাটফর্মে।")}</span>
          </motion.h2>
        </div>

        {/* Feature Grid with Connecting Line */}
        <div className="relative mb-20">
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-slate-200 z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className={`glass-card rounded-2xl p-6 border-t-4 ${f.border} shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col group bg-white/90 backdrop-blur-xl relative hover:scale-[1.02] cursor-default`}
              >
                {/* Step Number Badge */}
                <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br ${f.color} text-white flex items-center justify-center text-sm font-bold shadow-md border-2 border-white`}>
                  {i + 1}
                </div>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-[#0a1628] mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Trust Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {whyChooseUs.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-primary/30 transition-colors cursor-default"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-primary">
                <w.icon size={20} />
              </div>
              <span className="font-bold text-sm lg:text-base text-slate-700">{w.title}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
