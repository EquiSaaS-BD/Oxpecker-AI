"use client";

import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FinalCTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 lg:py-24 bg-[#F8FAFC] border-t border-slate-200 text-center">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
          {t(
            "Keep your family's health records ready when it matters",
            "পরিবারের জরুরি স্বাস্থ্য তথ্য প্রস্তুত রাখুন"
          )}
        </h2>

        <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          {t(
            "Create your personal Health ID in under a minute to organize prescriptions, track lab reports, and find trusted specialists across Bangladesh.",
            "এক মিনিটেরও কম সময়ে নিজের হেলথ আইডি খুলে প্রেসক্রিপশন ও রিপোর্ট গুছিয়ে রাখুন এবং প্রয়োজনে সঠিক ডাক্তার খুঁজে নিন।"
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0B6E99] hover:bg-[#09587A] text-white text-sm font-semibold rounded-xl transition-colors w-full sm:w-auto"
          >
            <span>{t("Create Free Health ID", "ফ্রি হেলথ আইডি খুলুন")}</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-800 text-sm font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors w-full sm:w-auto"
          >
            <CalendarPlus size={16} className="text-slate-600" />
            <span>{t("For Doctors & Hospitals", "ডাক্তার ও হাসপাতালের জন্য")}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
