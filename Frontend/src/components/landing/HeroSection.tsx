"use client";

import { Hero3DBackground } from "./Hero3DBackground";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  Stethoscope,
  Pill,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Activity
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SEARCH_TABS = [
  { id: "doctors", label: "Find Doctors", bnLabel: "ডাক্তার খুঁজুন", icon: Stethoscope, placeholder: "Search by specialty, doctor, or location...", bnPlaceholder: "বিভাগ, ডাক্তার বা এলাকার নাম লিখুন...", route: "/doctors" },
  { id: "medicines", label: "Search Medicines", bnLabel: "ওষুধ খুঁজুন", icon: Pill, placeholder: "Search by brand or generic name...", bnPlaceholder: "ব্র্যান্ড বা জেনেরিক নাম লিখুন...", route: "/medicines" },
  { id: "hospitals", label: "Hospitals & ICU", bnLabel: "হাসপাতাল ও আইসিইউ", icon: Building2, placeholder: "Search hospitals, beds, or locations...", bnPlaceholder: "হাসপাতাল, বেড বা এলাকার নাম লিখুন...", route: "/hospitals" },
  { id: "ai", label: "Ask AI Health", bnLabel: "এআই স্বাস্থ্য সহকারী", icon: MessageSquare, placeholder: "Describe your symptoms or ask a health question...", bnPlaceholder: "আপনার লক্ষণ লিখুন বা স্বাস্থ্য বিষয়ে প্রশ্ন করুন...", route: "/chat", badge: "Bengali & English", bnBadge: "বাংলা ও ইংরেজি" },
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

  const currentTab = SEARCH_TABS.find(t => t.id === activeTab) || SEARCH_TABS[0];

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

  return (
    <section className="relative w-full bg-white pt-20 pb-28 md:pt-24 md:pb-36 border-b border-slate-200/60 overflow-hidden">
      {/* Ambient background */}
      <Hero3DBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Signal */}
        <div className="flex items-center justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            <span>{t("Health Information in One Place", "স্বাস্থ্য তথ্য এক জায়গায়")}</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-left mb-8 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5"
          >
            {language === "bn" ? (
              <>
                আপনার স্বাস্থ্য তথ্য <br />
                <span className="text-sky-700">এখন এক জায়গায়।</span>
              </>
            ) : (
              <>
                Your Health Information. <br />
                <span className="text-sky-700">In One Place.</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl"
          >
            {t(
              "Create a Digital Health ID to organize your medical records, find doctors and hospitals, and ask health questions in Bengali or English.",
              "ডিজিটাল হেলথ আইডিতে মেডিকেল রেকর্ড গুছিয়ে রাখুন, ডাক্তার ও হাসপাতাল খুঁজুন এবং বাংলা বা ইংরেজিতে স্বাস্থ্য বিষয়ে প্রশ্ন করুন।"
            )}
          </motion.p>
        </div>

        {/* AI-First Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="w-full glass-panel spatial-shadow-lg rounded-3xl p-3 sm:p-4 text-left relative z-20 border border-slate-200/80"
        >
          {/* Search Tabs */}
          <div className="flex gap-1.5 p-1 overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-slate-100 mb-2">
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
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon size={16} className={isSelected ? "text-sky-400" : "text-slate-500"} />
                  <span className="whitespace-nowrap">{language === "bn" ? tab.bnLabel : tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                      isSelected ? "bg-sky-500 text-white" : "bg-sky-100 text-sky-700"
                    }`}>
                      {language === "bn" ? tab.bnBadge : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            {activeTab === "doctors" && (
              <div className="relative sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 pb-2 sm:pb-0 sm:pr-2">
                <div className="flex items-center gap-2 px-2 text-slate-500">
                  <MapPin size={16} className="text-slate-500 shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>
              </div>
            )}

            <div className="relative flex-1 flex items-center px-3 py-1">
              <Search size={18} className="text-slate-500 shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "bn" ? currentTab.bnPlaceholder : currentTab.placeholder}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 outline-none bg-transparent h-10"
              />
            </div>

            <button
              type="submit"
              className="h-11 px-6 btn-clay rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>{t("Search", "খুঁজুন")}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>

        {/* Popular Specialty Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs"
        >
          <span className="text-slate-500 font-semibold">{t("Explore by specialty:", "বিশেষজ্ঞ বিভাগ খুঁজুন:")}</span>
          {POPULAR_SPECIALTIES.map((spec) => (
            <Link
              key={spec.name}
              href={spec.href}
              className="px-3 py-1 bg-white hover:bg-sky-50/70 text-slate-700 hover:text-[#0878C9] hover:border-sky-300 font-medium rounded-lg border border-slate-200 transition-all shadow-2xs"
            >
              {language === "bn" ? spec.bnName : spec.name}
            </Link>
          ))}
        </motion.div>

        {/* Service summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: 0.5 }}
          className="mt-10 pt-6 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl text-left"
        >
          <div className="flex items-center gap-3 p-2.5 rounded-xl glass-pill spatial-shadow-hover transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <Activity size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t("Emergency Health Info", "জরুরি স্বাস্থ্য তথ্য")}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t("Key Medical Details", "প্রয়োজনীয় চিকিৎসার তথ্য")}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl glass-pill spatial-shadow-hover transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 relative">
              <Building2 size={18} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t("Hospital Bed Information", "হাসপাতালের বেডের তথ্য")}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t("Planned Updates From Hospitals", "হাসপাতালের পরিকল্পিত আপডেট")}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl glass-pill spatial-shadow-hover transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t("Doctor Directory", "ডাক্তার ডিরেক্টরি")}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t("Search by Specialty", "বিভাগ অনুযায়ী খুঁজুন")}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl glass-pill spatial-shadow-hover transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
              <Pill size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t("Medicine Guide", "ওষুধের গাইড")}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t("Search Medicine Information", "ওষুধের তথ্য খুঁজুন")}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
