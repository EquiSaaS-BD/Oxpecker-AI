"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Stethoscope, 
  Search, 
  Check, 
  ChevronDown, 
  X, 
  Activity, 
  Heart, 
  Brain, 
  Baby, 
  Eye, 
  Pill, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SpecialtyItem {
  id: string;
  name: string;
  bengaliName: string;
  category: "medicine" | "surgery" | "women_child" | "specialized";
  icon: any;
  popular?: boolean;
}

export const MEDICAL_SPECIALTIES: SpecialtyItem[] = [
  // Medicine & Primary
  { id: "general_physician", name: "General Physician", bengaliName: "মেডিসিন ও সাধারণ স্বাস্থ্য পরামর্শ", category: "medicine", icon: Stethoscope, popular: true },
  { id: "internal_medicine", name: "Internal Medicine Specialist", bengaliName: "অভ্যন্তরীণ রোগ ও জটিল মেডিসিন", category: "medicine", icon: Activity, popular: true },
  { id: "cardiologist", name: "Cardiologist", bengaliName: "হৃদরোগ, উচ্চ রক্তচাপ ও ভাস্কুলার", category: "medicine", icon: Heart, popular: true },
  { id: "endocrinologist", name: "Endocrinologist & Diabetologist", bengaliName: "ডায়াবেটিস, থাইরয়েড ও হরমোন", category: "medicine", icon: Pill, popular: true },
  { id: "gastroenterologist", name: "Gastroenterologist & Hepatologist", bengaliName: "পরিপাকতন্ত্র, গ্যাস্ট্রিক ও লিভার", category: "medicine", icon: Activity },
  { id: "pulmonologist", name: "Pulmonologist & Chest Specialist", bengaliName: "বক্ষব্যাধি, ফুসফুস ও শ্বাসকষ্ট", category: "medicine", icon: Activity },
  { id: "nephrologist", name: "Nephrologist", bengaliName: "কিডনিরোগ ও ডায়ালাইসিস বিশেষজ্ঞ", category: "medicine", icon: ShieldCheck },

  // Surgery & Orthopedics
  { id: "orthopedist", name: "Orthopedic Surgeon", bengaliName: "হাড়ভাঙা, জয়েন্ট ও মেরুদণ্ড সার্জারি", category: "surgery", icon: Activity, popular: true },
  { id: "general_surgeon", name: "General & Laparoscopic Surgeon", bengaliName: "জেনারেল সার্জারি ও ল্যাপারোস্কোপিক", category: "surgery", icon: Activity },
  { id: "neurosurgeon", name: "Neurosurgeon", bengaliName: "ব্রেন, মস্তিষ্ক ও স্পাইন সার্জারি", category: "surgery", icon: Brain },
  { id: "urologist", name: "Urologist & Andrologist", bengaliName: "মূত্রনালী, প্রোস্টেট ও পুরুষ প্রজনন", category: "surgery", icon: Activity },
  { id: "cardiac_surgeon", name: "Cardiovascular & Thoracic Surgeon", bengaliName: "হার্ট ও বাইপাস সার্জারি বিশেষজ্ঞ", category: "surgery", icon: Heart },

  // Women & Child
  { id: "gynecologist", name: "Gynecologist & Obstetrician", bengaliName: "প্রসূতি ও স্ত্রীরোগ বিশেষজ্ঞ (Maternity)", category: "women_child", icon: Heart, popular: true },
  { id: "pediatrician", name: "Pediatrician & Child Specialist", bengaliName: "শিশুরোগ ও নবজাতক বিশেষজ্ঞ", category: "women_child", icon: Baby, popular: true },
  { id: "pediatric_surgeon", name: "Pediatric Surgeon", bengaliName: "শিশু সার্জারি বিশেষজ্ঞ", category: "women_child", icon: Baby },

  // Specialized Fields
  { id: "neurologist", name: "Neurologist", bengaliName: "স্নায়ুরোগ, স্ট্রোক ও প্যারালাইসিস", category: "specialized", icon: Brain, popular: true },
  { id: "dermatologist", name: "Dermatologist & Cosmetologist", bengaliName: "চর্ম, ত্বক, অ্যালার্জি ও লেজার", category: "specialized", icon: Sparkles, popular: true },
  { id: "ent_specialist", name: "ENT Specialist", bengaliName: "নাক, কান ও গলা বিশেষজ্ঞ", category: "specialized", icon: Stethoscope, popular: true },
  { id: "ophthalmologist", name: "Ophthalmologist (Eye Specialist)", bengaliName: "চক্ষুরোগ ও রেটিনা সার্জন", category: "specialized", icon: Eye, popular: true },
  { id: "psychiatrist", name: "Psychiatrist & Mental Health", bengaliName: "মানসিক স্বাস্থ্য ও সাইকোথেরাপি", category: "specialized", icon: Sparkles },
  { id: "dentist", name: "Dental Surgeon", bengaliName: "দন্তরোগ ও মুখগহ্বর চিকিৎসা", category: "specialized", icon: Sparkles },
  { id: "oncologist", name: "Oncologist (Cancer Specialist)", bengaliName: "ক্যান্সার ও টিউমার বিশেষজ্ঞ", category: "specialized", icon: ShieldCheck },
  { id: "hematologist", name: "Hematologist", bengaliName: "রক্তরোগ, রক্তস্বল্পতা ও থ্যালাসেমিয়া", category: "specialized", icon: Activity },
  { id: "physical_medicine", name: "Physical Medicine & Rehabilitation", bengaliName: "বাত-ব্যথা, ফিজিওথেরাপি ও রিহ্যাব", category: "specialized", icon: Activity },
  { id: "critical_care", name: "Emergency & Critical Care (ICU)", bengaliName: "জরুরি চিকিৎসা ও আইসিইউ কনসালটেন্ট", category: "specialized", icon: Activity },
];

interface DoctorSpecializationSelectorProps {
  id?: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (spec: string) => void;
  error?: string;
  isHalf?: boolean;
}

export function DoctorSpecializationSelector({
  id = "doctor-spec-selector",
  label = "Primary Specialization",
  required = false,
  value,
  onChange,
  error,
  isHalf = false,
}: DoctorSpecializationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Find matching item from preset list
  const selectedItem = useMemo(() => {
    return MEDICAL_SPECIALTIES.find((item) => item.name.toLowerCase() === value?.toLowerCase());
  }, [value]);

  // Open modal handler
  const handleOpen = () => {
    setIsOpen(true);
    setSearch("");
    setIsCustomMode(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filtered specialties
  const filteredSpecialties = useMemo(() => {
    return MEDICAL_SPECIALTIES.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.bengaliName.toLowerCase().includes(q)
      );
    });
  }, [search, selectedCategory]);

  const handleSelect = (specName: string) => {
    onChange(specName);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${isHalf ? "md:col-span-1 col-span-2" : "col-span-2"}`}>
      <label htmlFor={id} className="text-[13px] font-semibold text-slate-500 ml-1 mb-0.5 tracking-tight flex items-center justify-between">
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {value && (
          <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
            Selected
          </span>
        )}
      </label>

      {/* Selector Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={handleOpen}
        className={`w-full min-h-[52px] rounded-2xl px-4 py-2 flex items-center justify-between text-left transition-all cursor-pointer select-none group border ${
          error
            ? "bg-red-50/70 border-red-300 ring-2 ring-red-100"
            : value
            ? "bg-sky-50/40 border-sky-200 hover:border-sky-300 hover:bg-sky-50/70 shadow-xs"
            : "bg-black/[0.03] border-transparent hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              value ? "bg-sky-600 text-white shadow-xs" : "bg-slate-200/80 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
            }`}
          >
            {selectedItem ? (
              <selectedItem.icon size={18} />
            ) : (
              <Stethoscope size={18} />
            )}
          </div>
          <div className="min-w-0">
            {value ? (
              <>
                <p className="text-[14.5px] font-bold text-slate-900 truncate leading-snug">
                  {value}
                </p>
                {selectedItem && (
                  <p className="text-[11.5px] text-slate-500 truncate">
                    {selectedItem.bengaliName}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[14.5px] font-medium text-slate-400">
                Choose clinical specialty (e.g. Cardiology, Medicine)...
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-sky-600 transition-colors pl-2">
          <span className="text-xs font-semibold hidden sm:inline">Browse</span>
          <ChevronDown size={18} />
        </div>
      </button>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-red-600 font-medium ml-1 mt-0.5"
          >
            <AlertCircle size={13} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Specialization Selection Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/50 via-white to-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Stethoscope size={17} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Doctor Specialization Directory
                    </h3>
                    <p className="text-[12px] text-slate-500">
                      আপনার প্রাথমিক চিকিৎসা বিভাগ বা স্পেশালিটি নির্বাচন করুন
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Search Bar & Custom Input Switch */}
              <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/40">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setIsCustomMode(false);
                    }}
                    placeholder="Search by specialty name (Cardiology, মেডিসিন, শিশু, চর্ম)..."
                    className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-[13.5px] font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-xs"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
                  {[
                    { id: "all", label: "All Specialties" },
                    { id: "medicine", label: "Medicine & Cardiac" },
                    { id: "surgery", label: "Surgery & Bones" },
                    { id: "women_child", label: "Women & Child" },
                    { id: "specialized", label: "Eye, ENT, Skin & Others" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-sky-600 text-white shadow-xs font-bold"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialties List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredSpecialties.map((item) => {
                  const isSelected = value?.toLowerCase() === item.name.toLowerCase();
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.name)}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-sky-50/80 border-sky-400 ring-2 ring-sky-200 shadow-xs"
                          : "bg-white border-slate-100 hover:border-sky-200 hover:bg-sky-50/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600"
                          }`}
                        >
                          <Icon size={19} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-bold text-slate-900 truncate">
                              {item.name}
                            </h4>
                            {item.popular && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-slate-500 truncate mt-0.5">
                            {item.bengaliName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-3">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
                            <Check size={14} />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium opacity-0 hover:opacity-100 transition-opacity">
                            Select
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {filteredSpecialties.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm font-semibold text-slate-700">No matching specialty found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Can't find your discipline? Add it as a custom specialization below.
                    </p>
                  </div>
                )}

                {/* Custom Specialization Write-in Option */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {!isCustomMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomMode(true);
                        setTimeout(() => customInputRef.current?.focus(), 50);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-dashed border-sky-300 bg-sky-50/40 hover:bg-sky-50 text-sky-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Not in the list? Enter Custom Specialization</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <label className="text-xs font-bold text-slate-700">
                        Enter Custom Specialization Name:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          ref={customInputRef}
                          type="text"
                          value={customValue}
                          onChange={(e) => setCustomValue(e.target.value)}
                          placeholder="e.g. Pediatric Cardiac Surgeon, Nuclear Medicine..."
                          className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-300 focus:border-sky-500 text-xs font-semibold text-slate-800 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustom}
                          disabled={!customValue.trim()}
                          className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCustomMode(false)}
                          className="h-10 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
                <span>BMDC registered doctor profile verification</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
