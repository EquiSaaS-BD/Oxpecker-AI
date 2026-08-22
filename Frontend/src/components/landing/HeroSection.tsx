"use client";
import StatsCounter from "@/components/ui/stats-counter";
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
  ShieldCheck,
  Clock,
  Activity
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SEARCH_TABS = [
  { id: "doctors", label: "Find Doctors", bnLabel: "ডাক্তার খুঁজুন", icon: Stethoscope, placeholder: "e.g. Cardiologist in Dhaka for chest pain...", route: "/doctors" },
  { id: "medicines", label: "Search Medicines", bnLabel: "ঔষধ খুঁজুন", icon: Pill, placeholder: "Search brand name or generic (e.g. Napa, Sergel, Paracetamol)...", route: "/medicines" },
  { id: "hospitals", label: "Hospitals & Beds", bnLabel: "হাসপাতাল ও বেড", icon: Building2, placeholder: "Search hospital beds, ICU, or area (e.g. Square Hospital, Dhanmondi)...", route: "/hospitals" },
  { id: "ai", label: "Ask AI Health", bnLabel: "এআই হেলথ", icon: MessageSquare, placeholder: "Describe your symptoms or ask a medical question...", route: "/chat", badge: "AI Powered" },
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
  const { t, language } = useLanguage();
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
    <section className="relative w-full bg-white pt-24 pb-16 md:pt-32 md:pb-20 border-b border-slate-200/60 overflow-hidden">
      {/* AI Clinical Intelligence 3D Background */}
      <Hero3DBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Trust Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50/80 border border-sky-200/80 shadow-xs text-xs font-bold text-sky-800 mb-6 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t("Verified Healthcare Network of Bangladesh", "বাংলাদেশের রেজিস্টার্ড স্বাস্থ্যসেবা নেটওয়ার্ক")}</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl leading-[1.15] mb-4"
        >
          {language === "bn" ? (
            <>
              সঠিক স্বাস্থ্যসেবা বেছে নিন। <br />
              <span className="text-[#0878C9]">দ্রুত, বুদ্ধিমান ও নির্ভরযোগ্য।</span>
            </>
          ) : (
            <>
              Find the Right Care. <br />
              <span className="text-[#0878C9]">Faster. Smarter. Trusted.</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 font-medium"
        >
          {t(
            "Symptoms analysis, medicine guide, live doctor booking, and medical report translation in one intelligent platform.",
            "লক্ষণ বিশ্লেষণ, ঔষধের গাইড, সরাসরি ডাক্তার অ্যাপয়েন্টমেন্ট এবং মেডিকেল রিপোর্ট অনুবাদ—সবই একটি বুদ্ধিমান প্ল্যাটফর্মে।"
          )}
        </motion.p>

        {/* AI-First Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-sky-900/10 border border-slate-200 p-2 sm:p-3 text-left relative z-20"
        >
          {/* Search Tabs */}
          <div className="flex gap-1.5 p-1 overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-slate-100 mb-2">
            {SEARCH_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    isSelected
                      ? "bg-[#0B1630] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon size={16} className={isSelected && tab.id === "ai" ? "text-sky-300" : ""} />
                  <span>{language === "bn" ? tab.bnLabel : tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-sky-500 text-white">
                      {tab.badge}
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
                  <MapPin size={16} className="text-slate-400 shrink-0" />
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
              <Search size={18} className="text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={currentTab.placeholder}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent h-10"
              />
            </div>

            <button
              type="submit"
              className="h-11 px-6 bg-[#0878C9] hover:bg-[#0665aa] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
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
          transition={{ duration: 0.5, delay: 0.4 }}
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

        {/* Floating Live Trust Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 pt-6 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl text-left"
        >
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900"><StatsCounter value={500} suffix="+" /> Verified</div>
              <div className="text-[11px] text-slate-500 font-medium">Doctors & Consultants</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200">
              <Pill size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900"><StatsCounter value={15000} suffix="+" /> Index</div>
              <div className="text-[11px] text-slate-500 font-medium">Registered Medicines</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 relative">
              <Building2 size={18} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Live Bed Status</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Major Hospitals</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Real-time Queue</div>
              <div className="text-[11px] text-slate-500 font-medium">Chamber Passes</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
