"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Compass, Loader2, X, Check, Building2,
  Navigation, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface SelectedLocationData {
  address: string;
  road?: string;
  moholla?: string;
  upazila?: string;
  zila?: string;
  division?: string;
  postcode?: string;
  lat?: string;
  lon?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: SelectedLocationData) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function LocationAutocompleteInput({
  value,
  onChange,
  onLocationSelect,
  placeholder = "বাসা/রোড, গ্রাম/মহল্লা, থানা ও জেলা লিখুন...",
  disabled = false,
  className = "",
  required = false,
}: Props) {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions from our internal API route
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/location/autocomplete?q=${encodeURIComponent(query)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.predictions)) {
          setSuggestions(data.predictions);
          setIsOpen(data.predictions.length > 0);
        }
      }
    } catch (err) {
      console.warn("Autocomplete fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (newVal.trim().length >= 2) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(newVal);
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const fullAddress = item.display_name || item.main_text;
    setInputValue(fullAddress);
    onChange(fullAddress);
    setIsOpen(false);

    if (onLocationSelect) {
      onLocationSelect({
        address: fullAddress,
        road: item.road,
        moholla: item.moholla,
        upazila: item.upazila,
        zila: item.zila,
        division: item.division,
        postcode: item.postcode,
        lat: item.lat,
        lon: item.lon,
      });
    }

    toast.success(`লোকেশন সেট হয়েছে: ${item.zila || "বাংলাদেশ"}`, {
      icon: "📍",
    });
  };

  // 1-Click GPS Current Location Auto-Detect
  const handleGpsLocate = () => {
    if (disabled || isLocating) return;

    if (!navigator.geolocation) {
      toast.error("আপনার ব্রাউজারে GPS সাপোর্ট নেই");
      return;
    }

    setIsLocating(true);
    toast.info("আপনার বর্তমান GPS অবস্থান সনাক্ত করা হচ্ছে...");

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
              setInputValue(data.display_name);
              onChange(data.display_name);

              if (onLocationSelect) {
                onLocationSelect({
                  address: data.display_name,
                  road: data.road,
                  moholla: data.moholla,
                  upazila: data.upazila,
                  zila: data.zila,
                  division: data.division,
                  postcode: data.postcode,
                  lat: String(latitude),
                  lon: String(longitude),
                });
              }

              toast.success(
                `GPS লোকেশন সেট হয়েছে: ${data.zila || "বাংলাদেশ"} (${
                  data.postcode || ""
                })`,
                { icon: "📍" }
              );
            } else {
              toast.error("লোকেশন অ্যাড্রেস বের করা সম্ভব হয়নি");
            }
          } else {
            toast.error("রিভার্স জিওকোডিং ব্যর্থ হয়েছে");
          }
        } catch (e) {
          toast.error("লোকেশন সার্ভারের সাথে সংযোগ বিচ্ছিন্ন");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        if (err.code === 1) {
          toast.error(
            "ব্রাউজারে লোকেশন পারমিশন দিন যাতে অটো-লোকেশন পাওয়া যায়"
          );
        } else {
          toast.error("GPS অবস্থান পাওয়া যায়নি। হাতে লিখে সার্চ করুন।");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        {/* Left Map Pin */}
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          <MapPin size={16} className={inputValue ? "text-sky-600" : ""} />
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full h-11 pl-10 pr-24 border rounded-xl text-sm transition-all duration-150 ${
            disabled
              ? "bg-slate-50/80 border-slate-200 text-slate-700 cursor-not-allowed select-none"
              : "bg-white border-slate-200 text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
          } ${className}`}
        />

        {/* Right Action Buttons: Clear & GPS Auto-Detect */}
        <div className="absolute right-2 flex items-center gap-1.5">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                onChange("");
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              title="Clear input"
            >
              <X size={14} />
            </button>
          )}

          {!disabled && (
            <button
              type="button"
              onClick={handleGpsLocate}
              disabled={isLocating}
              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 text-xs font-bold rounded-lg border border-sky-200/80 flex items-center gap-1 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="Detect current location via GPS"
            >
              {isLocating ? (
                <Loader2 size={13} className="animate-spin text-sky-600" />
              ) : (
                <Compass size={13} className="text-sky-600" />
              )}
              <span className="hidden sm:inline">
                {isLocating ? "Locating..." : "GPS"}
              </span>
            </button>
          )}

          {isLoading && (
            <Loader2
              size={14}
              className="animate-spin text-sky-600 shrink-0 mr-1"
            />
          )}
        </div>
      </div>

      {/* Floating Autocomplete Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.14)] z-50 overflow-hidden max-h-72 overflow-y-auto"
          >
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Location Suggestions ({suggestions.length})</span>
              <span className="text-[10px] text-sky-600 font-medium normal-case">
                English & বাংলা Supported
              </span>
            </div>

            <div className="space-y-1 mt-1">
              {suggestions.map((item, idx) => (
                <button
                  key={item.place_id || idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left p-2.5 hover:bg-sky-50/80 rounded-xl transition-colors flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100/70 group-hover:bg-sky-200/80 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    <MapPin size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-950 truncate">
                      {item.main_text || item.display_name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {item.secondary_text || item.display_name}
                    </p>

                    {/* Extracted Geo Badges */}
                    <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px]">
                      {item.moholla && (
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          মহল্লা: {item.moholla}
                        </span>
                      )}
                      {item.upazila && (
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          থানা: {item.upazila}
                        </span>
                      )}
                      {item.zila && (
                        <span className="px-1.5 py-0.2 bg-sky-100 text-sky-800 font-semibold rounded">
                          জেলা: {item.zila}
                        </span>
                      )}
                      {item.postcode && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-mono rounded">
                          ZIP: {item.postcode}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default LocationAutocompleteInput;
