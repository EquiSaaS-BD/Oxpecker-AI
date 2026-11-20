"use client";

import { Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

const NETWORK_HOSPITALS = [
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

  const metrics = [
    {
      value: isBn ? "১৬০+" : "160+",
      label: t("Verified Specialist Doctors", "বিশেষজ্ঞ চিকিৎসক"),
    },
    {
      value: isBn ? "৫০+" : "50+",
      label: t("Hospitals & Diagnostic Centers", "হাসপাতাল ও ডায়াগনস্টিক সেন্টার"),
    },
    {
      value: isBn ? "২০,০০০+" : "20,000+",
      label: t("DGDA Registered Medicines", "ডিজিডিএ নিবন্ধিত ওষুধ"),
    },
    {
      value: isBn ? "৬৪" : "64",
      label: t("Districts Accessible Nationwide", "সারাদেশের ৬৪ জেলায় সেবা"),
    },
  ];

  return (
    <section className="relative border-y border-slate-200/80 bg-[#F8FAFC] py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Institutional Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 lg:gap-x-0 lg:divide-x divide-slate-200">
          {metrics.map((metric) => (
            <div key={metric.label} className="lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {metric.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Clean Static Hospital Directory Grid */}
        <div className="mt-12 pt-10 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <h2 className="text-sm font-semibold text-slate-700">
              {t(
                "Hospitals & Diagnostic Centers in Our Network",
                "ডিরেক্টরিতে যুক্ত প্রধান হাসপাতাল ও ডায়াগনস্টিক সেন্টার"
              )}
            </h2>
            <Link
              href="/hospitals"
              className="text-xs font-semibold text-[#0B6E99] hover:text-[#09587A] transition-colors"
            >
              {t("View full directory →", "সম্পূর্ণ তালিকা দেখুন →")}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {NETWORK_HOSPITALS.map((hospital) => (
              <Link
                key={hospital.name}
                href="/hospitals"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200/90 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                <Building2 size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{isBn ? hospital.bnName : hospital.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
