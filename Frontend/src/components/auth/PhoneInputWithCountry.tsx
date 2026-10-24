"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check, AlertCircle, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CountryInfo {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  minLength: number;
  maxLength: number;
  placeholder: string;
  example: string;
}

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩", minLength: 10, maxLength: 10, placeholder: "1712-345678", example: "1712345678" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", minLength: 10, maxLength: 10, placeholder: "(555) 000-0000", example: "5551234567" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", minLength: 10, maxLength: 10, placeholder: "7911 123456", example: "7911123456" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", minLength: 10, maxLength: 10, placeholder: "98765 43210", example: "9876543210" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", minLength: 9, maxLength: 9, placeholder: "50 123 4567", example: "501234567" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", minLength: 9, maxLength: 9, placeholder: "50 123 4567", example: "501234567" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦", minLength: 8, maxLength: 8, placeholder: "3312 3456", example: "33123456" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼", minLength: 8, maxLength: 8, placeholder: "9123 4567", example: "91234567" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲", minLength: 8, maxLength: 8, placeholder: "9123 4567", example: "91234567" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", minLength: 9, maxLength: 10, placeholder: "12-345 6789", example: "123456789" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", minLength: 8, maxLength: 8, placeholder: "8123 4567", example: "81234567" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", minLength: 10, maxLength: 10, placeholder: "(555) 000-0000", example: "5551234567" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", minLength: 9, maxLength: 9, placeholder: "412 345 678", example: "412345678" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", minLength: 10, maxLength: 11, placeholder: "151 23456789", example: "15123456789" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", minLength: 10, maxLength: 10, placeholder: "312 345 6789", example: "3123456789" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", minLength: 9, maxLength: 9, placeholder: "6 12 34 56 78", example: "612345678" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", minLength: 10, maxLength: 10, placeholder: "90 1234 5678", example: "9012345678" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰", minLength: 10, maxLength: 10, placeholder: "300 1234567", example: "3001234567" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵", minLength: 10, maxLength: 10, placeholder: "984 1234567", example: "9841234567" },
];

interface PhoneInputWithCountryProps {
  id?: string;
  label?: string;
  required?: boolean;
  isHalf?: boolean;
  value: string;
  onChange: (fullNumber: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PhoneInputWithCountry({
  id = "phone-input",
  label = "Mobile Number",
  required = false,
  isHalf = false,
  value,
  onChange,
  error,
  disabled = false,
  placeholder,
}: PhoneInputWithCountryProps) {
  // Find initial country from value or default to Bangladesh
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => {
    if (value) {
      const match = SUPPORTED_COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (match) return match;
    }
    return SUPPORTED_COUNTRIES[0]; // Bangladesh default
  });

  // Extract raw digits
  const [digits, setDigits] = useState<string>(() => {
    if (!value) return "";
    let clean = value;
    if (clean.startsWith(selectedCountry.dialCode)) {
      clean = clean.slice(selectedCountry.dialCode.length).trim();
    }
    return clean.replace(/\D/g, "");
  });

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync state if external value changes drastically
  useEffect(() => {
    if (!value) {
      setDigits("");
      return;
    }
    const match = SUPPORTED_COUNTRIES.find((c) => value.startsWith(c.dialCode));
    if (match && match.code !== selectedCountry.code) {
      setSelectedCountry(match);
      const rest = value.slice(match.dialCode.length).trim().replace(/\D/g, "");
      setDigits(rest);
    } else {
      let clean = value;
      if (clean.startsWith(selectedCountry.dialCode)) {
        clean = clean.slice(selectedCountry.dialCode.length).trim();
      }
      setDigits(clean.replace(/\D/g, ""));
    }
  }, [value, selectedCountry.dialCode, selectedCountry.code]);

  // Click outside to close country dropdown
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

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return SUPPORTED_COUNTRIES;
    const query = search.toLowerCase().trim();
    return SUPPORTED_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.dialCode.includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [search]);

  // Strict length limits for Bangladesh and other countries
  const maxAllowedLength = useMemo(() => {
    if (selectedCountry.code === "BD") {
      // In BD, if user types leading 0 (017...), allow 11 digits; if no leading 0 (17...), allow 10 digits
      return digits.startsWith("0") ? 11 : 10;
    }
    return selectedCountry.maxLength;
  }, [selectedCountry, digits]);

  const minRequiredLength = useMemo(() => {
    if (selectedCountry.code === "BD") {
      return digits.startsWith("0") ? 11 : 10;
    }
    return selectedCountry.minLength;
  }, [selectedCountry, digits]);

  // Handle digit input with strict maximum length cutoff
  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // digits only
    // Determine dynamic max length based on whether user typed a leading 0
    const maxLimit = selectedCountry.code === "BD" 
      ? (rawValue.startsWith("0") ? 11 : 10)
      : selectedCountry.maxLength;

    // Strict cutoff: Cannot type more than maximum allowed digits
    const sliced = rawValue.slice(0, maxLimit);
    setDigits(sliced);

    // Emit formatted value
    if (sliced.length === 0) {
      onChange("");
    } else {
      onChange(`${selectedCountry.dialCode} ${sliced}`);
    }
  };

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch("");

    // Truncate existing digits if they exceed the new country's limit
    const maxLimit = country.code === "BD"
      ? (digits.startsWith("0") ? 11 : 10)
      : country.maxLength;
    const adjusted = digits.slice(0, maxLimit);
    setDigits(adjusted);

    if (adjusted.length > 0) {
      onChange(`${country.dialCode} ${adjusted}`);
    } else {
      onChange("");
    }
  };

  // Real-time validation warning message
  const internalError = useMemo(() => {
    if (digits.length > 0 && digits.length < minRequiredLength) {
      if (selectedCountry.code === "BD") {
        return digits.startsWith("0")
          ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)"
          : "সঠিক ১০ ডিজিটের মোবাইল নম্বর দিন (যেমন: 1712345678)";
      }
      return `${selectedCountry.name} mobile number must be ${minRequiredLength} digits`;
    }
    return null;
  }, [digits, minRequiredLength, selectedCountry]);

  const displayError = error || internalError;

  return (
    <div className={`flex flex-col gap-1.5 ${isHalf ? "md:col-span-1 col-span-2" : "col-span-2"}`}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-slate-500 ml-1 mb-0.5 tracking-tight flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          <span className="text-[11px] font-normal text-slate-400">
            {selectedCountry.flag} {selectedCountry.code} ({digits.length}/{maxAllowedLength})
          </span>
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full h-[52px] rounded-2xl flex items-center transition-all bg-black/[0.03] border ${
            displayError
              ? "bg-red-50/60 border-red-300 ring-2 ring-red-100"
              : "border-transparent hover:bg-black/[0.05] focus-within:bg-white focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100/50"
          }`}
        >
          {/* Custom Country Code Trigger */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            disabled={disabled}
            className="h-full pl-3.5 pr-2.5 flex items-center gap-1.5 hover:bg-slate-200/50 rounded-l-2xl transition-colors cursor-pointer select-none shrink-0 group border-r border-slate-200/80"
            title="Select Country Dial Code"
          >
            <span className="text-xl leading-none filter drop-shadow-xs">{selectedCountry.flag}</span>
            <span className="text-[14px] font-bold text-slate-700 tracking-tight group-hover:text-slate-950">
              {selectedCountry.dialCode}
            </span>
            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-sky-600" : ""}`}
            />
          </button>

          {/* National Digits Input */}
          <div className="relative flex-1 h-full flex items-center">
            <input
              id={id}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              disabled={disabled}
              value={digits}
              onChange={handleDigitChange}
              placeholder={placeholder || selectedCountry.placeholder}
              maxLength={maxAllowedLength}
              className="w-full h-full px-3.5 bg-transparent outline-none text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
            />
            {digits.length > 0 && (
              <span className="pr-3.5 text-xs font-mono font-medium text-slate-400 select-none">
                {digits.length}/{maxAllowedLength}
              </span>
            )}
          </div>
        </div>

        {/* Custom Country Selector Dropdown / Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-[calc(100%+6px)] z-50 w-[310px] sm:w-[340px] max-w-[92vw] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 p-2.5 overflow-hidden"
            >
              {/* Search Box */}
              <div className="relative mb-2">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code (+880)..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-sky-400 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>

              {/* Country List */}
              <div className="max-h-[230px] overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredCountries.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No matching country found</p>
                ) : (
                  filteredCountries.map((country) => {
                    const isSelected = country.code === selectedCountry.code;
                    return (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-sky-50 text-sky-900 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg leading-none">{country.flag}</span>
                          <span className="text-xs truncate">{country.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({country.code})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-slate-600">{country.dialCode}</span>
                          {isSelected && <Check size={14} className="text-sky-600" />}
                        </div>
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
        {displayError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-red-600 font-medium ml-1 mt-0.5"
          >
            <AlertCircle size={13} className="shrink-0 text-red-500" />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
