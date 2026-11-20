"use client";

import React from "react";
import {
  FileText,
  Building2,
  HeartPulse,
  FolderHeart,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export interface WhyUsBentoProps {
  className?: string;
}

export function WhyUsBento({ className }: WhyUsBentoProps) {
  const { t } = useLanguage();

  const features = [
    {
      eyebrow: t("Medical History", "স্বাস্থ্য রেকর্ড"),
      eyebrowClass: "text-slate-500",
      icon: FolderHeart,
      title: t("Unified Medical Records", "সব স্বাস্থ্য রেকর্ড এক জায়গায়"),
      description: t(
        "Keep prescriptions, diagnostic lab reports, and past visits organized chronologically so any doctor can review your history without missing papers.",
        "প্রেসক্রিপশন, ডায়াগনস্টিক রিপোর্ট ও পূর্বের চিকিৎসার ইতিহাস তারিখ অনুযায়ী গুছিয়ে রাখুন, যাতে নতুন ডাক্তার দেখালে কাগজপত্র হারানোর ভয় না থাকে।"
      ),
      href: "/health-card",
      cta: t("Open Health Records", "হেলথ রেকর্ড দেখুন"),
    },
    {
      eyebrow: t("Emergency Access", "জরুরি সেবা"),
      eyebrowClass: "text-[#B91C1C]",
      icon: HeartPulse,
      title: t("Emergency Health Card", "জরুরি হেলথ কার্ড"),
      description: t(
        "Share blood group, serious drug allergies, ongoing medications, and emergency family contacts with ER doctors via QR when every second counts.",
        "জরুরি মুহূর্তে রোগী কথা বলতে না পারলেও কার্ডের QR কোড স্ক্যান করে ডাক্তার রক্তের গ্রুপ, ড্রাগ অ্যালার্জি ও পরিবারের জরুরি নম্বর দ্রুত দেখতে পারবেন।"
      ),
      href: "/scan/HP-2026-8841",
      cta: t("View Emergency Card", "জরুরি কার্ড দেখুন"),
    },
    {
      eyebrow: t("Facility Lookup", "হাসপাতাল তথ্য"),
      eyebrowClass: "text-slate-500",
      icon: Building2,
      title: t("Hospital & ICU Directory", "হাসপাতাল ও আইসিইউ তথ্য"),
      description: t(
        "Compare hospital departments, emergency phone lines, and ICU, cabin, or general bed availability across major clinics before leaving home.",
        "রওনা হওয়ার আগেই দেশের প্রধান হাসপাতালগুলোর বিভাগ, জরুরি যোগাযোগ নম্বর এবং আইসিইউ, কেবিন ও সাধারণ বেডের অবস্থা দেখে সিদ্ধান্ত নিন।"
      ),
      href: "/hospitals",
      cta: t("Browse Hospitals", "হাসপাতাল দেখুন"),
    },
    {
      eyebrow: t("Clear Guidance", "সহজ ব্যাখ্যা"),
      eyebrowClass: "text-slate-500",
      icon: FileText,
      title: t("Prescription & Report Clarity", "প্রেসক্রিপশন ও রিপোর্ট বুঝতে সহায়তা"),
      description: t(
        "Upload handwritten prescriptions or lab reports to review medicine schedules, generic alternatives, and test values in clear everyday Bengali.",
        "হাতের লেখা প্রেসক্রিপশন বা ল্যাব রিপোর্ট আপলোড করে ওষুধের ডোজ, জেনেরিক নাম ও টেস্টের ফলাফল সহজ বাংলায় স্পষ্টভাবে বুঝে নিন।"
      ),
      href: "/reports",
      cta: t("Upload Report or Prescription", "রিপোর্ট বা প্রেসক্রিপশন দেখুন"),
    },
  ];

  return (
    <section
      id="features"
      className={cn(
        "py-16 sm:py-24 bg-white relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6",
        className
      )}
    >
      {/* Clean Editorial Header */}
      <div className="max-w-2xl mb-12 lg:mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B6E99] mb-2.5">
          {t("Core Capabilities", "মূল সেবাসমূহ")}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t(
            "Practical healthcare tools built for patients and families",
            "রোগী ও পরিবারের দৈনন্দিন চিকিৎসার নির্ভরযোগ্য সঙ্গী"
          )}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
          {t(
            "Designed around real hospital visits in Bangladesh—from finding the right specialist to keeping records safe for emergencies.",
            "বাংলাদেশের বাস্তব চিকিৎসা অভিজ্ঞতার আলোকে তৈরি—সঠিক ডাক্তার খোঁজা থেকে শুরু করে জরুরি মুহূর্তের সব তথ্য প্রস্তুত রাখতে।"
          )}
        </p>
      </div>

      {/* Balanced 2x2 Editorial Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-wider",
                      item.eyebrowClass
                    )}
                  >
                    {item.eyebrow}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2.5">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-7 pt-5 border-t border-slate-100">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B6E99] hover:text-[#09587A] transition-colors group"
                >
                  <span>{item.cta}</span>
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WhyUsBento;
