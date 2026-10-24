"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Stethoscope, 
  Search, 
  Check, 
  ChevronDown, 
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
  name: string;
  icon: any;
}

export const SPECIALTIES: SpecialtyItem[] = [
  { name: "General Physician", icon: Stethoscope },
  { name: "Internal Medicine", icon: Activity },
  { name: "Cardiologist", icon: Heart },
  { name: "Dermatologist", icon: Sparkles },
  { name: "Endocrinologist & Diabetologist", icon: Pill },
  { name: "Gastroenterologist", icon: Activity },
  { name: "Gynecologist & Obstetrician", icon: Heart },
  { name: "Neurologist", icon: Brain },
  { name: "Neurosurgeon", icon: Brain },
  { name: "Orthopedic Surgeon", icon: Activity },
  { name: "Pediatrician", icon: Baby },
  { name: "Psychiatrist", icon: Sparkles },
  { name: "ENT Specialist", icon: Stethoscope },
  { name: "Ophthalmologist (Eye)", icon: Eye },
  { name: "Dentist & Dental Surgeon", icon: Sparkles },
  { name: "Nephrologist (Kidney)", icon: ShieldCheck },
  { name: "Pulmonologist (Chest & Lungs)", icon: Activity },
  { name: "Oncologist (Cancer)", icon: ShieldCheck },
  { name: "Urologist", icon: Activity },
  { name: "General Surgeon", icon: Activity },
  { name: "Physical Medicine & Rehab", icon: Activity },
  { name: "Other Specialization", icon: Plus },
];

interface DoctorSpecializationSelectorProps {
  id?: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (spec: string) => void;
  error?: string;
  isHalf?: boolean;
  placeholder?: string;
}

export function DoctorSpecializationSelector({
  id = "doctor-spec-selector",
  label = "Primary Specialization",
  required = false,
  value,
  onChange,
  error,
  isHalf = false,
  placeholder = "Select Specialization...",
}: DoctorSpecializationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected item to show its icon
  const selectedItem = useMemo(() => {
    if (!value) return null;
    return SPECIALTIES.find((item) => item.name.toLowerCase() === value.toLowerCase()) || {
      name: value,
      icon: Stethoscope,
    };
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filter list by English name
  const filteredSpecialties = useMemo(() => {
    if (!search.trim()) return SPECIALTIES;
    const q = search.toLowerCase().trim();
    return SPECIALTIES.filter((item) => item.name.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = (specName: string) => {
    onChange(specName);
    setIsOpen(false);
    setSearch("");
  };

  const SelectedIcon = selectedItem ? selectedItem.icon : Stethoscope;

  return (
    <div className={`flex flex-col gap-1.5 ${isHalf ? "md:col-span-1 col-span-2" : "col-span-2"}`}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-slate-500 ml-1 mb-0.5 tracking-tight">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Normal Form Style Dropdown Input */}
      <div className="relative" ref={dropdownRef}>
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full h-[52px] rounded-2xl px-4 transition-all outline-none text-[15px] font-medium flex items-center justify-between text-left cursor-pointer border ${
            error
              ? "bg-red-50 text-red-900 border-red-200 ring-2 ring-red-100"
              : isOpen
              ? "bg-white text-slate-900 border-sky-400 ring-4 ring-sky-100/50"
              : "bg-black/[0.03] text-slate-900 border-transparent hover:bg-black/[0.05]"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {value ? (
              <>
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <SelectedIcon size={16} />
                </div>
                <span className="truncate text-slate-900 font-semibold">{value}</span>
              </>
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )}
          </div>

          <div className="text-slate-400 shrink-0 ml-2">
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-sky-600" : ""}`}
            />
          </div>
        </button>

        {/* Normal Form Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-[calc(100%+6px)] z-50 w-full bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 overflow-hidden"
            >
              {/* Search input */}
              <div className="relative mb-2">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search specialization..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-sky-400 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>

              {/* Specialties List in English only */}
              <div className="max-h-[220px] overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredSpecialties.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No specialization found</p>
                ) : (
                  filteredSpecialties.map((item) => {
                    const isSelected = value?.toLowerCase() === item.name.toLowerCase();
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelect(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-sky-50 text-sky-900 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <span className="text-[13px] truncate">{item.name}</span>
                        </div>
                        {isSelected && <Check size={15} className="text-sky-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation Error Text */}
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
    </div>
  );
}
