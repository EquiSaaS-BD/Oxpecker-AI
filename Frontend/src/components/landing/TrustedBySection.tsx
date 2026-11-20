"use client";

import { UserRound, Stethoscope, FileText, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

const HOSPITAL_EXAMPLES = [
  { name: "Square Hospital Dhaka", bnName: "স্কয়ার হাসপাতাল ঢাকা" },
  { name: "Labaid Specialized Hospital", bnName: "ল্যাবএইড স্পেশালাইজড হাসপাতাল" },
  { name: "Popular Diagnostic Centre", bnName: "পপুলার ডায়াগনস্টিক সেন্টার" },
  { name: "United Hospital Gulshan", bnName: "ইউনাইটেড হাসপাতাল গুলশান" },
  { name: "Evercare Hospital Dhaka", bnName: "এভারকেয়ার হাসপাতাল ঢাকা" },
  { name: "Ibn Sina Specialized Hospital", bnName: "ইবনে সিনা স্পেশালাইজড হাসপাতাল" },
  { name: "Central Hospital Limited", bnName: "সেন্ট্রাল হাসপাতাল লিমিটেড" },
  { name: "BRB Hospitals Limited", bnName: "বিআরবি হাসপাতাল লিমিটেড" },
];

export function TrustedBySection() {
  const { lang, t } = useLanguage();
  const isBn = lang === "bn";

  return (
    <section className="relative border-y border-slate-200/80 bg-white overflow-hidden py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t("Tools for Everyday Health Needs", "দৈনন্দিন স্বাস্থ্যসেবার প্রয়োজনীয় টুল")}
          </h2>
        </div>

        {/* Service overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {[
            {
              icon: UserRound,
              title: t("Digital Health ID", "ডিজিটাল হেলথ আইডি"),
              description: t("Organize key health details", "প্রয়োজনীয় স্বাস্থ্য তথ্য গুছিয়ে রাখুন"),
              color: "text-emerald-600",
              bg: "bg-emerald-50 border border-emerald-200",
            },
            {
              icon: Stethoscope,
              title: t("Doctor Directory", "ডাক্তার ডিরেক্টরি"),
              description: t("Search by specialty and area", "বিভাগ ও এলাকা অনুযায়ী খুঁজুন"),
              color: "text-sky-600",
              bg: "bg-sky-50 border border-sky-200",
            },
            {
              icon: FileText,
              title: t("Health Records", "স্বাস্থ্য রেকর্ড"),
              description: t("Keep prescriptions and reports together", "প্রেসক্রিপশন ও রিপোর্ট এক জায়গায় রাখুন"),
              color: "text-purple-600",
              bg: "bg-purple-50 border border-purple-200",
            },
            {
              icon: Building2,
              title: t("Hospital Information", "হাসপাতালের তথ্য"),
              description: t("Browse facilities and services", "হাসপাতাল ও সেবার তথ্য দেখুন"),
              color: "text-amber-600",
              bg: "bg-amber-50 border border-amber-200",
            },
          ].map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center p-6 bg-slate-50/70 border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${service.bg} flex items-center justify-center mb-4 transition-transform duration-300`}>
                <service.icon size={26} className={service.color} />
              </div>
              <h3 className="text-base font-bold text-slate-900">{service.title}</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Hospital directory examples */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            {t("Hospital Directory Examples", "হাসপাতাল ডিরেক্টরির উদাহরণ")}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {t("Examples from the hospital directory.", "হাসপাতাল ডিরেক্টরি থেকে কিছু উদাহরণ।")}
          </p>
        </div>
        <div className="relative flex overflow-hidden border-t border-slate-100 pt-10">
          <div className="animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none whitespace-nowrap flex items-center gap-10 py-2">
            {[...HOSPITAL_EXAMPLES, ...HOSPITAL_EXAMPLES].map((h, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <Building2 size={16} className="text-sky-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  {isBn ? h.bnName : h.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
