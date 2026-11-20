"use client";

import { Hero3DBackground } from "./Hero3DBackground";
import { HeroLocationDropdown } from "./HeroLocationDropdown";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  Stethoscope,
  Pill,
  Building2,
  ArrowRight,
  HeartPulse,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SEARCH_TABS = [
  {
    id: "doctors",
    label: "Find Doctors",
    bnLabel: "ডাক্তার খুঁজুন",
    icon: Stethoscope,
    placeholder: "Search by specialty, doctor, or chamber...",
    bnPlaceholder: "বিভাগ, ডাক্তার বা এলাকার নাম লিখুন...",
    route: "/doctors",
  },
  {
    id: "medicines",
    label: "Search Medicines",
    bnLabel: "ওষুধ খুঁজুন",
    icon: Pill,
    placeholder: "Search by brand or generic name...",
    bnPlaceholder: "ব্র্যান্ড বা জেনেরিক নাম লিখুন...",
    route: "/medicines",
  },
  {
    id: "hospitals",
    label: "Hospitals & ICU",
    bnLabel: "হাসপাতাল ও আইসিইউ",
    icon: Building2,
    placeholder: "Search hospitals, beds, or locations...",
    bnPlaceholder: "হাসপাতাল, বেড বা এলাকার নাম লিখুন...",
    route: "/hospitals",
  },
  {
    id: "ai",
    label: "Health Guide",
    bnLabel: "স্বাস্থ্য সহায়িকা",
    icon: MessageSquare,
    placeholder: "Describe symptoms or ask a health question in Bengali or English...",
    bnPlaceholder: "বাংলা বা ইংরেজিতে আপনার লক্ষণ বা প্রশ্ন লিখুন...",
    route: "/chat",
  },
];

const POPULAR_SPECIALTIES = [
  { name: "Cardiology", bnName: "হৃদরোগ", href: "/doctors?specialty=Cardiology" },
  { name: "Medicine", bnName: "মেডিসিন", href: "/doctors?specialty=Medicine" },
  { name: "Gynecology", bnName: "স্ত্রীরোগ ও প্রসূতি", href: "/doctors?specialty=Gynecology" },
  { name: "Pediatrics", bnName: "শিশু রোগ", href: "/doctors?specialty=Pediatrics" },
  { name: "Dermatology", bnName: "চর্ম ও যৌন", href: "/doctors?specialty=Dermatology" },
  { name: "Orthopedics", bnName: "অর্থোপেডিকস", href: "/doctors?specialty=Orthopedics" },
];

export function HeroSection() {
  const { t, lang: language } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  const currentTab = SEARCH_TABS.find((tab) => tab.id === activeTab) || SEARCH_TABS[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push(currentTab.route);
      return;
    }
    const params = new URLSearchParams();
    params.set("q", searchQuery.trim());
    if (selectedLocation !== "All Locations") {
      params.set("location", selectedLocation);
    }
    router.push(`${currentTab.route}?${params.toString()}`);
  };

  const quickLinks = [
    {
      href: "/health-card",
      icon: HeartPulse,
      title: t("Emergency Health Info", "জরুরি স্বাস্থ্য তথ্য"),
      subtitle: t(
        "Blood group, allergies & emergency contacts",
        "রক্তের গ্রুপ, অ্যালার্জি ও জরুরি কন্টাক্ট"
      ),
    },
    {
      href: "/hospitals",
      icon: Building2,
      title: t("Hospital Bed Info", "হাসপাতালের বেড তথ্য"),
      subtitle: t(
        "ICU, cabin & ward status across hospitals",
        "প্রধান হাসপাতালের আইসিইউ, কেবিন ও ওয়ার্ড তথ্য"
      ),
    },
    {
      href: "/doctors",
      icon: Stethoscope,
      title: t("Doctor Directory", "ডাক্তার ডিরেক্টরি"),
      subtitle: t(
        "BMDC-verified specialists by department",
        "বিভাগ ও চেম্বার অনুযায়ী বিশেষজ্ঞ ডাক্তার"
      ),
    },
    {
      href: "/medicines",
      icon: Pill,
      title: t("Medicine Guide", "ওষুধের গাইড"),
      subtitle: t(
        "Generics, indicative pricing & usage notes",
        "জেনেরিক নাম, মূল্য ও ব্যবহারের নির্দেশিকা"
      ),
    },
  ];

  return (
    <section className="relative w-full bg-white pt-24 pb-20 md:pt-28 md:pb-24 border-b border-slate-200/80 overflow-hidden">
      <Hero3DBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quiet Editorial Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B6E99] mb-4">
          {t("Bangladesh Digital Healthcare Network", "বাংলাদেশের সমন্বিত স্বাস্থ্যসেবা নেটওয়ার্ক")}
        </p>

        {/* Main Headline & Subtitle */}
        <div className="text-left mb-8 max-w-3xl">
          <h1 className="font-display text-3xl sm:text-5xl md:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-4">
            {language === "bn" ? (
              <>
                আপনার ও পরিবারের স্বাস্থ্যসেবা, <br />
                <span className="text-[#0B6E99]">এখন এক জায়গায়।</span>
              </>
            ) : (
              <>
                Healthcare across Bangladesh, <br />
                <span className="text-[#0B6E99]">organized around you.</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base md:text-[17px] text-slate-600 leading-relaxed font-normal max-w-2xl">
            {t(
              "Find verified doctors, check hospital and ICU availability, read prescriptions clearly, and keep your medical records ready whenever you need care.",
              "নির্ভরযোগ্য ডাক্তার খুঁজুন, হাসপাতালের বেড ও আইসিইউ তথ্য দেখুন, প্রেসক্রিপশন সহজ ভাষায় বুঝুন এবং জরুরি মুহূর্তের জন্য সব স্বাস্থ্য রেকর্ড গুছিয়ে রাখুন।"
            )}
          </p>
        </div>

        {/* Clean Institutional Search Box */}
        <div className="w-full bg-white rounded-2xl p-2.5 sm:p-3 text-left relative z-20 border border-slate-200/90 shadow-[0_6px_28px_rgba(15,23,42,0.06)]">
          {/* Search Tabs */}
          <div className="flex gap-1.5 pb-2.5 px-1 overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-slate-100 mb-2">
            {SEARCH_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 whitespace-nowrap ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon
                    size={15}
                    className={isSelected ? "text-white" : "text-slate-500"}
                  />
                  <span>{language === "bn" ? tab.bnLabel : tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input Form */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
          >
            {activeTab === "doctors" && (
              <div className="relative sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200/80 pb-2 sm:pb-0 sm:pr-2">
                <HeroLocationDropdown
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                />
              </div>
            )}

            <div className="relative flex-1 flex items-center px-3 py-1">
              <Search size={18} className="text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === "bn" ? currentTab.bnPlaceholder : currentTab.placeholder
                }
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent h-10"
              />
            </div>

            <button
              type="submit"
              className="h-11 px-6 bg-[#0B6E99] hover:bg-[#09587A] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>{t("Search", "খুঁজুন")}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Popular Specialty Links */}
        <div className="mt-5 flex flex-wrap items-center justify-start gap-2 text-xs">
          <span className="text-slate-500 font-medium mr-1">
            {t("Common departments:", "প্রচলিত বিভাগ:")}
          </span>
          {POPULAR_SPECIALTIES.map((spec) => (
            <Link
              key={spec.name}
              href={spec.href}
              className="px-3 py-1.5 bg-slate-50 hover:bg-[#F0F7FB] text-slate-700 hover:text-[#0B6E99] border border-slate-200/80 hover:border-[#0B6E99]/30 font-medium rounded-lg transition-colors"
            >
              {language === "bn" ? spec.bnName : spec.name}
            </Link>
          ))}
        </div>

        {/* Unified 4-Column Quick-Access Clinical Strip */}
        <div className="mt-10 bg-white border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-3.5 p-4 sm:p-5 hover:bg-slate-50/90 transition-colors text-left"
              >
                <div className="mt-0.5 text-slate-700 group-hover:text-[#0B6E99] transition-colors shrink-0">
                  <Icon size={19} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0B6E99] transition-colors truncate">
                      {item.title}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-slate-300 group-hover:text-[#0B6E99] group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 leading-snug mt-1">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
