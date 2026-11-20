"use client";

import {
  Stethoscope,
  FileText,
  ArrowRight,
  HeartPulse,
  Phone,
  Pill,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export function AIIntelligenceSuite() {
  const { t } = useLanguage();

  return (
    <section
      id="services"
      className="relative py-16 lg:py-24 bg-[#F8FAFC] border-y border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 space-y-20 lg:space-y-24">
        {/* 1. Emergency Health Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-[#B91C1C] text-xs font-semibold uppercase tracking-wider">
              <HeartPulse size={15} />
              <span>{t("Emergency Health Card", "জরুরি হেলথ কার্ড")}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t(
                "Critical information ready when you cannot speak",
                "জরুরি মুহূর্তে প্রয়োজনীয় তথ্য হাতের নাগালে"
              )}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {t(
                "During an emergency room admission, doctors need blood group, severe drug allergies, ongoing conditions, and a family contact immediately. Your Oxpecker Health Card keeps those essentials clearly structured and accessible.",
                "জরুরি বিভাগে ভর্তির সময় রোগীর রক্তের গ্রুপ, গুরুতর ওষুধের অ্যালার্জি, চলমান রোগ ও পরিবারের যোগাযোগ নম্বর তাৎক্ষণিক জানা প্রয়োজন হয়। আপনার হেলথ কার্ডে এই জরুরি তথ্যগুলো সুবিন্যস্ত থাকে।"
              )}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E99] shrink-0" />
                <span>{t("Blood Group & Age Details", "রক্তের গ্রুপ ও বয়সের তথ্য")}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E99] shrink-0" />
                <span>{t("Severe Medicine Allergies", "গুরুতর ওষুধের অ্যালার্জি")}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E99] shrink-0" />
                <span>{t("Chronic Conditions & Meds", "দীর্ঘমেয়াদী রোগ ও নিয়মিত ওষুধ")}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E99] shrink-0" />
                <span>{t("Verified Family Contact", "পরিবারের জরুরি যোগাযোগ নম্বর")}</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/health-card"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B6E99] hover:bg-[#09587A] text-white font-semibold text-sm transition-colors"
              >
                <span>{t("View Health Card", "হেলথ কার্ড দেখুন")}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Crisp Clinical Emergency Record Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-slate-700">
                Health ID · HP-2026-8841
              </span>
              <span className="font-medium text-slate-500">
                {t("Emergency Summary", "জরুরি সারসংক্ষেপ")}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Rafin Hossain</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Age 29 · Male · Dhaka
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-red-50 text-[#B91C1C] border border-red-200 text-xs font-bold tracking-wide">
                  O+ Positive
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="p-3.5 bg-red-50/40 flex items-start gap-3">
                  <ShieldAlert size={16} className="text-[#B91C1C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {t("Drug Allergy", "ওষুধের অ্যালার্জি")}
                    </span>
                    <span className="text-slate-600 mt-0.5 block">
                      Penicillin — severe skin and breathing reaction
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white flex items-start gap-3">
                  <Pill size={16} className="text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {t("Ongoing Medication & Condition", "চলমান ওষুধ ও স্বাস্থ্য তথ্য")}
                    </span>
                    <span className="text-slate-600 mt-0.5 block">
                      Type 2 diabetes · Metformin 500mg daily
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white flex items-start gap-3">
                  <Phone size={16} className="text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {t("Emergency Contact", "জরুরি যোগাযোগ")}
                    </span>
                    <span className="text-slate-600 mt-0.5 block">
                      Fatema Begum (Mother) · +880 1819-876543
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Clear Symptom Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Structured Clinical Guidance Card */}
          <div className="order-2 lg:order-1 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {t("Symptom & Care Guide", "লক্ষণ ও পরামর্শ সহায়িকা")}
              </span>
              <span className="text-slate-500">
                {t("Bengali & English", "বাংলা ও ইংরেজি")}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800">
                &ldquo;গত ২ দিন ধরে হালকা জ্বর আর গলা ব্যথা হচ্ছে, কোন ডাক্তার দেখাবো?&rdquo;
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    {t("Recommended Department", "প্রস্তাবিত বিভাগ")}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Internal Medicine / ENT Specialist
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    {t("Care Guidance", "প্রাথমিক যত্ন")}
                  </span>
                  <span className="text-slate-600 leading-relaxed block">
                    {t(
                      "Stay hydrated with warm fluids, rest adequately, and monitor fever temperature. See a physician promptly if fever rises or breathing feels difficult.",
                      "পর্যাপ্ত বিশ্রাম নিন, হালকা গরম পানি বা তরল খাবার খান এবং জ্বরের মাত্রা খেয়াল রাখুন। জ্বর বাড়লে বা শ্বাসকষ্ট হলে দ্রুত চিকিৎসকের পরামর্শ নিন।"
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                <Link
                  href="/doctors?specialty=Medicine"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B6E99] hover:text-[#09587A] transition-colors pt-3"
                >
                  <span>{t("Find Medicine Specialists", "মেডিসিন বিশেষজ্ঞ খুঁজুন")}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-5">
            <div className="inline-flex items-center gap-2 text-[#0B6E99] text-xs font-semibold uppercase tracking-wider">
              <Stethoscope size={15} />
              <span>{t("Bengali & English Care Guide", "বাংলা ও ইংরেজি স্বাস্থ্য সহায়িকা")}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t(
                "Describe how you feel in everyday Bengali",
                "সহজ বাংলায় আপনার শারীরিক সমস্যা জানান"
              )}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {t(
                "Write your symptoms naturally in Bengali or English to understand possible home-care precautions and find the right medical department before booking an appointment.",
                "আপনার শারীরিক উপসর্গ সহজ বাংলা বা ইংরেজিতে লিখুন। এটি সাধারণ প্রাথমিক যত্ন বুঝতে এবং কোন বিভাগের বিশেষজ্ঞ ডাক্তার দেখানো উচিত তা ঠিক করতে সাহায্য করবে—চিকিৎসকের পরীক্ষার বিকল্প নয়।"
              )}
            </p>
            <div className="pt-2">
              <Link
                href="/chat?category=symptoms"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B6E99] hover:text-[#09587A] transition-colors"
              >
                <span>{t("Open Symptom Guide", "স্বাস্থ্য সহায়িকা শুরু করুন")}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Prescription & Lab Report Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-[#0B6E99] text-xs font-semibold uppercase tracking-wider">
              <FileText size={15} />
              <span>{t("Prescription & Lab Reports", "প্রেসক্রিপশন ও ল্যাব রিপোর্ট")}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t(
                "Read prescriptions and lab reports without confusion",
                "হাতের লেখা প্রেসক্রিপশন ও ল্যাব রিপোর্ট সহজ ভাষায় বুঝুন"
              )}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {t(
                "Upload a photo or PDF of your prescription or lab report. View medicine dosages, meal timing schedules, generic equivalents, and reference ranges in clear language.",
                "প্রেসক্রিপশন বা টেস্ট রিপোর্টের ছবি বা PDF আপলোড করুন। ওষুধের ডোজ, খাওয়ার নিয়ম, জেনেরিক নাম ও ল্যাব পরীক্ষার মান সহজ ভাষায় দেখে নিন।"
              )}
            </p>
            <div className="pt-2">
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B6E99] hover:text-[#09587A] transition-colors"
              >
                <span>{t("Open Report & Prescription Reader", "রিপোর্ট ও প্রেসক্রিপশন দেখুন")}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Crisp Clinical Schedule Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={14} className="text-[#0B6E99]" />
                {t("Prescription Schedule · 2 Medicines", "প্রেসক্রিপশন শিডিউল · ২টি ওষুধ")}
              </span>
              <span className="text-slate-500 font-medium">
                {t("Readable Summary", "সহজ বিবরণ")}
              </span>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1.5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <strong className="text-slate-900 text-sm font-bold">
                    Napa Extra (Paracetamol 500mg + Caffeine 65mg)
                  </strong>
                  <span className="font-mono font-semibold text-[#0B6E99] tabular-nums">
                    1 + 0 + 1 · 3 days
                  </span>
                </div>
                <p className="text-slate-600">
                  {t(
                    "Schedule: Morning & night after meals",
                    "নিয়ম: সকালে ও রাতে খাওয়ার পর সেবন করুন"
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1.5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <strong className="text-slate-900 text-sm font-bold">
                    Seclo 20mg (Omeprazole)
                  </strong>
                  <span className="font-mono font-semibold text-[#0B6E99] tabular-nums">
                    1 + 0 + 1 · 14 days
                  </span>
                </div>
                <p className="text-slate-600">
                  {t(
                    "Schedule: 30 minutes before breakfast and dinner",
                    "নিয়ম: সকাল ও রাতের খাবারের ৩০ মিনিট আগে"
                  )}
                </p>
              </div>

              <p className="pt-2 text-[11px] text-slate-500">
                {t(
                  "Always follow your prescribing physician's dosage instructions.",
                  "সর্বদা আপনার চিকিৎসকের দেওয়া নির্ধারিত মাত্রা ও নিয়ম অনুসরণ করুন।"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIIntelligenceSuite;
