"use client";

import { motion } from "framer-motion";
import { UserPlus, Database, ShieldAlert, HeartPulse, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    {
      stepNumber: "01",
      badge: t("Instant Setup", "সহজ শুরু"),
      icon: UserPlus,
      title: t("Create a Health ID", "ডিজিটাল হেলথ আইডি"),
      desc: t("Sign up with your phone number to get your unique national digital healthpass ID.", "ফোন নম্বর দিয়ে মাত্র ৩০ সেকেন্ডে আপনার নিজস্ব নিরাপদ ডিজিটাল হেলথ আইডি ও স্মার্টকার্ড খুলুন।"),
      color: "sky",
      borderColor: "border-sky-200 group-hover:border-sky-400",
      iconBg: "bg-sky-50 text-sky-600 border-sky-200",
      numberColor: "text-sky-600",
      accentBg: "from-sky-500/10 to-transparent",
    },
    {
      stepNumber: "02",
      badge: t("Cloud Vault", "ক্লাউড স্টোরেজ"),
      icon: Database,
      title: t("Save All Records", "সব রেকর্ড এক জায়গায়"),
      desc: t("Upload prescriptions and test reports to keep them encrypted and accessible anytime.", "হাতে লেখা প্রেসক্রিপশন ও টেস্ট রিপোর্ট ছবি তুলে রাখুন, এআই স্বয়ংক্রিয়ভাবে গুছিয়ে সংরক্ষণ করবে।"),
      color: "emerald",
      borderColor: "border-emerald-200 group-hover:border-emerald-400",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      numberColor: "text-emerald-600",
      accentBg: "from-emerald-500/10 to-transparent",
    },
    {
      stepNumber: "03",
      badge: t("24/7 Emergency Guard", "জরুরি সুরক্ষা"),
      icon: ShieldAlert,
      title: t("Emergency Support", "জরুরি মুহূর্তে সহায়তা"),
      desc: t("Dynamic QR code and biometric matcher help ER doctors retrieve life-saving vitals in seconds.", "জরুরি মুহূর্তে কথা বলতে না পারলেও QR কোড বা ফটো স্ক্যানে ডাক্তার তাৎক্ষণিক রক্তের গ্রুপ ও হিস্ট্রি দেখতে পাবেন।"),
      color: "rose",
      borderColor: "border-rose-200 group-hover:border-rose-400",
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      numberColor: "text-rose-600",
      accentBg: "from-rose-500/10 to-transparent",
    },
    {
      stepNumber: "04",
      badge: t("Clinical AI", "এআই ডাক্তার"),
      icon: HeartPulse,
      title: t("AI Health Assistant", "এআই স্বাস্থ্য সহকারী"),
      desc: t("Ask health questions in natural Bangla or English with DGHS & WHO protocol triage guidance.", "বাংলা বা ইংরেজিতে রোগের লক্ষণ বলুন, এআই ডাক্তার সঠিক ঘরোয়া যত্ন ও বিশেষজ্ঞ ডাক্তারের পরামর্শ দেবে।"),
      color: "indigo",
      borderColor: "border-indigo-200 group-hover:border-indigo-400",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      numberColor: "text-indigo-600",
      accentBg: "from-indigo-500/10 to-transparent",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 lg:py-32 bg-slate-50/70 overflow-hidden border-t border-slate-200/60">
      {/* Ambient background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header with pill badge */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-xs font-bold text-sky-800 mb-4 shadow-2xs"
          >
            <Sparkles size={13} className="text-sky-600 animate-pulse" />
            <span>{t("Visual Process Pipeline • 4-Step Patient Journey", "৪-ধাপের ভিজ্যুয়াল স্বাস্থ্যসেবা যাত্রা")}</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            {t("How Oxpecker AI Helps You", "যেভাবে Oxpecker AI আপনাকে সাহায্য করে")}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3 font-normal"
          >
            {t(
              "A seamless end-to-end digital health pipeline ensuring continuous care, instant emergency response, and verified clinical guidance.",
              "রেজিস্ট্রেশন থেকে জরুরি মুহূর্তের উদ্ধার ও এআই ডাক্তার — সব সেবা একটি নিরবচ্ছিন্ন আধুনিক প্রক্রিয়ায় সাজানো।"
            )}
          </motion.p>
        </div>

        {/* Process Flow Track with Connected Cards */}
        <div className="relative">
          
          {/* Animated Connecting SVG Pipe on Desktop (hidden on mobile) */}
          <div className="hidden lg:block absolute top-[62px] left-[12%] right-[12%] h-[3px] z-0">
            {/* Background Track Line */}
            <div className="w-full h-full bg-slate-200/80 rounded-full" />
            
            {/* Animated Pulsing Gradient Beam */}
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="origin-left absolute top-0 left-0 w-full h-full bg-gradient-to-r from-sky-400 via-emerald-400 via-rose-400 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(2,132,199,0.5)]"
            />

            {/* Moving Pulsing Light Bead */}
            <motion.div
              animate={{ x: ["0%", "100%", "0%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[5px] left-0 w-3.5 h-3.5 rounded-full bg-white border-2 border-sky-600 shadow-[0_0_10px_rgba(2,132,199,0.8)]"
            />
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`bg-white border rounded-3xl p-6 lg:p-7 text-left shadow-xs hover:shadow-xl transition-all duration-300 group cursor-default relative overflow-hidden ${step.borderColor}`}
              >
                {/* Subtle top card gradient splash */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${step.accentBg} rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity`} />

                {/* Step Top Bar: Icon + Step Number */}
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${step.iconBg}`}>
                    <step.icon size={24} />
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black tracking-tighter ${step.numberColor}`}>
                      {step.stepNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                      {step.badge}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Step Indicator Arrow */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>{t("Verified Flow", "যাচাইকৃত")}</span>
                  </span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-sky-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Process Trustline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 max-w-2xl mx-auto p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center gap-3 text-xs sm:text-sm text-slate-600 font-medium text-center"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{t("Compliant with DGHS Clinical Protocols & National Digital Health Guidelines", "স্বাস্থ্য অধিদপ্তর (DGHS) ও বিশ্ব স্বাস্থ্য সংস্থা (WHO) প্রটোকল অনুযায়ী নির্মিত")}</span>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
