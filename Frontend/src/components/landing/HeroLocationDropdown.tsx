"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Compass,
  Search,
  Check,
  X,
  ChevronDown,
  Loader2,
  Navigation,
  Building2,
  Sparkles,
  Map,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export interface LocationItem {
  id: string;
  nameEn: string;
  nameBn: string;
  category?: "division" | "hub" | "custom";
  district?: string;
  hintBn?: string;
}

// Bangladesh 8 Divisions (Bilingual)
const BD_DIVISIONS: LocationItem[] = [
  { id: "all", nameEn: "All Locations", nameBn: "সমগ্র বাংলাদেশ (সব এলাকা)", category: "division" },
  { id: "dhaka", nameEn: "Dhaka", nameBn: "ঢাকা", category: "division" },
  { id: "chattogram", nameEn: "Chattogram", nameBn: "চট্টগ্রাম", category: "division" },
  { id: "sylhet", nameEn: "Sylhet", nameBn: "সিলেট", category: "division" },
  { id: "rajshahi", nameEn: "Rajshahi", nameBn: "রাজশাহী", category: "division" },
  { id: "khulna", nameEn: "Khulna", nameBn: "খুলনা", category: "division" },
  { id: "barishal", nameEn: "Barishal", nameBn: "বরিশাল", category: "division" },
  { id: "rangpur", nameEn: "Rangpur", nameBn: "রংপুর", category: "division" },
  { id: "mymensingh", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ", category: "division" },
];

// Major Medical Hubs in Bangladesh (Bilingual)
const MEDICAL_HUBS: LocationItem[] = [
  {
    id: "hub-shahbag",
    nameEn: "Shahbag, Dhaka",
    nameBn: "শাহবাগ, ঢাকা",
    district: "Dhaka",
    hintBn: "BSMMU, বারডেম ও ঢামেক হাব",
    category: "hub",
  },
  {
    id: "hub-dhanmondi",
    nameEn: "Dhanmondi, Dhaka",
    nameBn: "ধানমন্ডি, ঢাকা",
    district: "Dhaka",
    hintBn: "স্কয়ার, ল্যাবএইড, সেন্ট্রাল",
    category: "hub",
  },
  {
    id: "hub-panthapath",
    nameEn: "Panthapath, Dhaka",
    nameBn: "পান্থপথ, ঢাকা",
    district: "Dhaka",
    hintBn: "স্কয়ার, শমরিতা ও গ্রিন লাইফ",
    category: "hub",
  },
  {
    id: "hub-mirpur",
    nameEn: "Mirpur, Dhaka",
    nameBn: "মিরপুর, ঢাকা",
    district: "Dhaka",
    hintBn: "ন্যাশনাল হার্ট ফাউন্ডেশন, ডেল্টা",
    category: "hub",
  },
  {
    id: "hub-uttara",
    nameEn: "Uttara, Dhaka",
    nameBn: "উত্তরা, ঢাকা",
    district: "Dhaka",
    hintBn: "কুয়েত মৈত্রী, উত্তরা আধুনিক",
    category: "hub",
  },
  {
    id: "hub-mohakhali",
    nameEn: "Mohakhali, Dhaka",
    nameBn: "মহাখালী, ঢাকা",
    district: "Dhaka",
    hintBn: "আইসিডিডিআর'বি ও ক্যান্সার ইনস্টিটিউট",
    category: "hub",
  },
  {
    id: "hub-panchlaish",
    nameEn: "Panchlaish, Chattogram",
    nameBn: "পাঁচলাইশ, চট্টগ্রাম",
    district: "Chattogram",
    hintBn: "চট্টগ্রাম মেডিকেল ও পার্কভিউ",
    category: "hub",
  },
  {
    id: "hub-subidbazar",
    nameEn: "Subidbazar, Sylhet",
    nameBn: "সুবিদবাজার, সিলেট",
    district: "Sylhet",
    hintBn: "এম.এ.জি ওসমানী মেডিকেল হাব",
    category: "hub",
  },
];

interface HeroLocationDropdownProps {
  value: string;
  onChange: (location: string) => void;
  className?: string;
}

export function HeroLocationDropdown({
  value,
  onChange,
  className = "",
}: HeroLocationDropdownProps) {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiSuggestions, setApiSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setApiSuggestions([]);
    }
  }, [isOpen]);

  // Live Location Search via Backend Autocomplete API
  const fetchLiveLocations = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setApiSuggestions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/location/autocomplete?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.predictions)) {
          setApiSuggestions(data.predictions);
        }
      }
    } catch (err) {
      console.warn("Location search error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length >= 2) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        fetchLiveLocations(q.trim());
      }, 300);
    } else {
      setApiSuggestions([]);
      setIsSearching(false);
    }
  };

  // 1-Click GPS Current Location Detection
  const handleDetectGps = () => {
    if (isLocating) return;

    if (!navigator.geolocation) {
      toast.error(
        lang === "bn"
          ? "আপনার ডিভাইসে GPS লোকেশন সাপোর্ট নেই"
          : "Geolocation is not supported by your browser"
      );
      return;
    }

    setIsLocating(true);
    toast.info(
      lang === "bn"
        ? "বর্তমান অবস্থান খোঁজা হচ্ছে..."
        : "Detecting current GPS location...",
      { icon: "📍" }
    );

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `/api/location/reverse?lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.display_name) {
              const detectedCity = data.zila || data.division || "Dhaka";
              const cleanLocation = data.upazila
                ? `${data.upazila}, ${detectedCity}`
                : detectedCity;

              onChange(cleanLocation);
              setIsOpen(false);
              toast.success(
                lang === "bn"
                  ? `লোকেশন সফলভাবে সেট হয়েছে: ${cleanLocation}`
                  : `Location detected: ${cleanLocation}`,
                { icon: "✅" }
              );
            } else {
              toast.error(
                lang === "bn"
                  ? "ঠিকানা পাওয়া যায়নি, অনুগ্রহ করে তালিকা থেকে বাছাই করুন"
                  : "Could not resolve address. Please pick from list."
              );
            }
          } else {
            toast.error(
              lang === "bn"
                ? "রিভার্স জিওকোডিং সার্ভারে সমস্যা হয়েছে"
                : "Failed to reverse geocode location"
            );
          }
        } catch (e) {
          toast.error(
            lang === "bn"
              ? "লোকেশন সার্ভার সাড়া দিচ্ছে না"
              : "Location service unavailable"
          );
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          toast.error(
            lang === "bn"
              ? "ব্রাউজারে লোকেশন পারমিশন দিন"
              : "Location permission denied. Please allow GPS access."
          );
        } else {
          toast.error(
            lang === "bn"
              ? "GPS অবস্থান পাওয়া যায়নি। হাতে লিখে সার্চ করুন।"
              : "Unable to retrieve GPS coordinates."
          );
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Determine current display label
  const getSelectedLabel = () => {
    if (!value || value === "All Locations") {
      return lang === "bn" ? "সব এলাকা" : "All Locations";
    }

    // Check pre-defined list
    const foundDivision = BD_DIVISIONS.find(
      (d) => d.nameEn.toLowerCase() === value.toLowerCase() || d.nameBn === value
    );
    if (foundDivision) {
      return lang === "bn" ? foundDivision.nameBn : foundDivision.nameEn;
    }

    const foundHub = MEDICAL_HUBS.find(
      (h) => h.nameEn.toLowerCase() === value.toLowerCase() || h.nameBn === value
    );
    if (foundHub) {
      return lang === "bn" ? foundHub.nameBn : foundHub.nameEn;
    }

    // Custom or GPS address
    return value;
  };

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("All Locations");
  };

  const isAllSelected = !value || value === "All Locations";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button (Replaces Native <select>) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
            <MapPin size={14} className="text-[#2797de]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-tight">
              {lang === "bn" ? "অবস্থান" : "Location"}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
              {getSelectedLabel()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {!isAllSelected && (
            <span
              onClick={handleClear}
              role="button"
              tabIndex={0}
              className="p-1 text-slate-500 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors"
              title={lang === "bn" ? "রিসেট করুন" : "Clear location"}
            >
              <X size={12} />
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-500 group-hover:text-slate-600"
          >
            <ChevronDown size={14} />
          </motion.div>
        </div>
      </button>

      {/* Dropdown Modal / Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden"
          >
            {/* Header with GPS Auto Detect */}
            <div className="p-3 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Map size={14} className="text-[#2797de]" />
                  {lang === "bn" ? "এলাকা নির্বাচন করুন" : "Select Your Location"}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {lang === "bn" ? "বাংলা ও ইংরেজি" : "Bangla & English"}
                </span>
              </div>

              {/* 1-Click Current Location GPS Button */}
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={isLocating}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/10 via-sky-50 to-emerald-500/10 border border-sky-200/80 hover:border-sky-300 text-slate-800 transition-all hover:shadow-xs group cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {isLocating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Navigation size={16} className="text-white" />
                    )}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      {isLocating
                        ? lang === "bn"
                          ? "GPS অনুসন্ধান চলছে..."
                          : "Detecting GPS location..."
                        : lang === "bn"
                        ? "বর্তমান অবস্থান নিন (GPS)"
                        : "Use Current Location (GPS)"}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {lang === "bn"
                        ? "স্বয়ংক্রিয়ভাবে নিকটস্থ এলাকা সেট করুন"
                        : "Auto-detect nearest division/thana"}
                    </span>
                  </div>
                </div>
                <Sparkles size={14} className="text-amber-500 shrink-0" />
              </button>

              {/* Live Search Input with API */}
              <div className="relative flex items-center">
                <Search
                  size={14}
                  className="absolute left-3 text-slate-500 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={
                    lang === "bn"
                      ? "থানা, জেলা বা এলাকা খুঁজুন... (e.g. ধানমন্ডি, Mirpur)"
                      : "Search thana, city, or district... (e.g. Dhaka, Gulshan)"
                  }
                  className="w-full h-9 pl-8 pr-8 rounded-xl bg-slate-100/80 border border-slate-200/70 text-xs font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white focus:border-[#2797de] focus:ring-2 focus:ring-[#2797de]/20 transition-all"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setApiSuggestions([]);
                    }}
                    className="absolute right-2.5 p-1 text-slate-500 hover:text-slate-600 rounded-md"
                  >
                    <X size={12} />
                  </button>
                ) : isSearching ? (
                  <Loader2
                    size={14}
                    className="absolute right-3 text-sky-500 animate-spin"
                  />
                ) : null}
              </div>
            </div>

            {/* Results / List Area */}
            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar divide-y divide-slate-100">
              {/* If Searching & Has API Results */}
              {searchQuery.trim().length >= 2 ? (
                <div>
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {lang === "bn" ? "অনুসন্ধান ফলাফল (API)" : "Search Results (API)"}
                  </div>
                  {isSearching && apiSuggestions.length === 0 ? (
                    <div className="py-6 flex flex-col items-center justify-center text-slate-500 gap-2">
                      <Loader2 size={18} className="animate-spin text-[#2797de]" />
                      <span className="text-xs">
                        {lang === "bn" ? "অবস্থান খোঁজা হচ্ছে..." : "Searching locations..."}
                      </span>
                    </div>
                  ) : apiSuggestions.length > 0 ? (
                    <div className="space-y-0.5 mt-1">
                      {apiSuggestions.map((item, idx) => {
                        const title = item.main_text || item.display_name;
                        const sub = item.secondary_text || item.division || "বাংলাদেশ";
                        const isCurrent = value.toLowerCase() === title.toLowerCase();

                        return (
                          <button
                            key={item.place_id || idx}
                            type="button"
                            onClick={() => handleSelect(title)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                              isCurrent
                                ? "bg-sky-50 text-[#2797de]"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isCurrent
                                    ? "bg-[#2797de] text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <Building2 size={14} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                  {title}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate">
                                  {sub}
                                </span>
                              </div>
                            </div>
                            {isCurrent && <Check size={14} className="text-[#2797de] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      {lang === "bn"
                        ? "কোন এলাকা পাওয়া যায়নি। অনুগ্রহ করে অন্য বানান দিয়ে চেষ্টা করুন।"
                        : "No matching location found. Please try another query."}
                    </div>
                  )}
                </div>
              ) : (
                /* Default List: Divisions & Medical Hubs */
                <div className="space-y-3 pt-1">
                  {/* Bangladesh 8 Divisions */}
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === "bn" ? "বিভাগীয় শহরসমূহ" : "Divisions"}</span>
                      <span className="text-[10px] font-normal text-slate-500">8 Divisions</span>
                    </div>
                    <div className="grid grid-cols-1 gap-0.5 mt-1">
                      {BD_DIVISIONS.map((div) => {
                        const isSelected =
                          div.id === "all"
                            ? isAllSelected
                            : value.toLowerCase() === div.nameEn.toLowerCase() ||
                              value === div.nameBn;

                        return (
                          <button
                            key={div.id}
                            type="button"
                            onClick={() =>
                              handleSelect(div.id === "all" ? "All Locations" : div.nameEn)
                            }
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                              isSelected
                                ? "bg-sky-50/80 text-[#2797de] font-semibold"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <MapPin
                                size={14}
                                className={`shrink-0 ${
                                  isSelected ? "text-[#2797de]" : "text-slate-500"
                                }`}
                              />
                              <div className="flex items-baseline gap-1.5 truncate">
                                <span className="text-xs font-semibold text-slate-900">
                                  {div.nameEn}
                                </span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  ({div.nameBn})
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check size={14} className="text-[#2797de] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Popular Medical Hubs */}
                  <div className="pt-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === "bn" ? "জনপ্রিয় মেডিকেল হাব" : "Popular Medical Hubs"}</span>
                      <span className="text-[10px] font-normal text-slate-500">Hospitals & Labs</span>
                    </div>
                    <div className="grid grid-cols-1 gap-0.5 mt-1">
                      {MEDICAL_HUBS.map((hub) => {
                        const isSelected =
                          value.toLowerCase() === hub.nameEn.toLowerCase() ||
                          value === hub.nameBn;

                        return (
                          <button
                            key={hub.id}
                            type="button"
                            onClick={() => handleSelect(hub.nameEn)}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                              isSelected
                                ? "bg-sky-50/80 text-[#2797de] font-semibold"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Building2
                                size={14}
                                className={`shrink-0 ${
                                  isSelected ? "text-[#2797de]" : "text-slate-500"
                                }`}
                              />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-baseline gap-1.5 truncate">
                                  <span className="text-xs font-semibold text-slate-900">
                                    {hub.nameEn}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-normal">
                                    ({hub.nameBn})
                                  </span>
                                </div>
                                {hub.hintBn && (
                                  <span className="text-[10px] text-slate-500 truncate">
                                    {hub.hintBn}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Check size={14} className="text-[#2797de] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Compass size={12} className="text-[#2797de]" />
                {lang === "bn" ? "সমগ্র বাংলাদেশ কভারেজ" : "All-Bangladesh Coverage"}
              </span>
              {!isAllSelected && (
                <button
                  type="button"
                  onClick={() => handleSelect("All Locations")}
                  className="font-semibold text-[#2797de] hover:underline"
                >
                  {lang === "bn" ? "রিসেট করুন" : "Reset"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
