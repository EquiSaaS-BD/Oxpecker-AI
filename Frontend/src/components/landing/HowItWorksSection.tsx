"use client";

import { motion } from "framer-motion";
import { UserPlus, Database, ShieldAlert, HeartPulse } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: UserPlus,
      title: t("Create a Health ID", "হেলথ আইডি রেজিস্ট্রেশন"),
      desc: t("Sign up with your phone number to get your unique health ID.", "ফোন নম্বর দিয়ে খুব সহজেই আপনার নিজস্ব ডিজিটাল হেলথ আইডি খুলে নিন।"),
    },
    {
      icon: Database,
      title: t("Save All Records", "সব রেকর্ড এক জায়গায়"),
      desc: t("Upload prescriptions and test reports to keep them together in your profile.", "প্রেসক্রিপশন ও টেস্ট রিপোর্ট আপলোড করে প্রোফাইলে এক জায়গায় গুছিয়ে রাখুন।"),
    },
    {
      icon: ShieldAlert,
      title: t("Emergency Support", "জরুরি মুহূর্তে সহায়তা"),
      desc: t("The planned emergency profile will help authorized doctors review key health details when urgent care is needed.", "পরিকল্পিত জরুরি প্রোফাইলে অনুমোদিত ডাক্তার প্রয়োজনীয় স্বাস্থ্য তথ্য দেখতে পারবেন।"),
    },
    {
      icon: HeartPulse,
      title: t("AI Health Assistant", "এআই স্বাস্থ্য সহকারী"),
      desc: t("Ask health questions in Bengali and learn when you should speak with a doctor.", "বাংলায় স্বাস্থ্য বিষয়ে প্রশ্ন করুন এবং কখন ডাক্তার দেখানো দরকার তা বুঝতে সহায়তা নিন।"),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 lg:py-32 bg-slate-50 overflow-hidden border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t("How Oxpecker AI Helps You", "যেভাবে Oxpecker AI আপনাকে সাহায্য করে")}
          </h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white border border-slate-200 rounded-3xl p-7 text-left shadow-xs transition-all duration-200 group cursor-default hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 relative text-slate-700">
                  <step.icon size={24} />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
