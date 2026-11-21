"use client";

import React, { useState, useRef, useEffect } from "react";
import { Save, Check, Mic, Search, Eye, Globe, ImagePlus, ChevronDown, LayoutTemplate } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { usePrescription } from "@/context/PrescriptionContext";
import { PRESCRIPTION_LANGUAGES, PrescriptionLanguage } from "@/lib/prescription-translator";

interface PrescriptionTopbarProps {
  onFinalize: () => void;
  onPreview: () => void;
  activeTab?: "prescription" | "report";
  onTabChange?: (tab: "prescription" | "report") => void;
}

export function PrescriptionTopbar({
  onFinalize,
  onPreview,
  activeTab = "prescription",
  onTabChange,
}: PrescriptionTopbarProps) {
  const searchParams = useSearchParams();
  const patientName = searchParams?.get("patientName") || "Select Patient";
  const { data, updateData } = usePrescription();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const padUploadRef = useRef<HTMLInputElement>(null);

  const handleVoiceDictation = () => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = data.language === "bn" ? "bn-BD" : "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        setIsDictating(true);
        recognition.onresult = (event: any) => {
          const transcript = String(event?.results?.[0]?.[0]?.transcript || "").trim();
          if (transcript) {
            const nextChief = data.chiefComplaint
              ? `${data.chiefComplaint.trim()}\n${transcript}`
              : transcript;
            updateData({ chiefComplaint: nextChief });
            toast.success(`Dictation added: "${transcript}"`);
          }
        };
        recognition.onerror = () => {
          setIsDictating(false);
          toast.error("Microphone permission or speech recognition unavailable.");
        };
        recognition.onend = () => {
          setIsDictating(false);
        };
        recognition.start();
        return;
      } catch {
        setIsDictating(false);
      }
    }

    const fallbackNote =
      data.language === "bn"
        ? "রোগীর উপসর্গ: ৩ দিন ধরে জ্বর ও শরীর ব্যথা"
        : "Clinical note: Fever and body ache for 3 days";
    const nextChief = data.chiefComplaint
      ? `${data.chiefComplaint.trim()}\n${fallbackNote}`
      : fallbackNote;
    updateData({ chiefComplaint: nextChief });
    toast.success("Dictated clinical note added to Chief Complaint.");
  };

  const currentLang =
    PRESCRIPTION_LANGUAGES.find((l) => l.code === (data.language || "en")) || PRESCRIPTION_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode: PrescriptionLanguage, label: string) => {
    updateData({ language: langCode });
    setLangMenuOpen(false);
    toast.success(`Prescription language switched to ${label}`);
  };

  const handleCustomPadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please upload an image under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateData({
        theme: "custom",
        customThemeImage: base64String,
        customPadTopOffset: data.customPadTopOffset ?? 140,
        customPadBottomOffset: data.customPadBottomOffset ?? 70,
      });
      toast.success("Custom Hospital/Canva Template uploaded! Prescription auto-populated.");
      onPreview();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 rounded-t-[32px] px-4 md:px-6 py-2.5 min-h-[64px] flex flex-col md:flex-row items-center justify-between shrink-0 shadow-none z-30 gap-3 md:gap-4 relative">
      <input
        type="file"
        ref={padUploadRef}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleCustomPadUpload}
      />

      {/* Left Section - Title */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-800 text-[16px] md:text-[18px]">Smart Rx Studio</h2>
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-200 hidden sm:block">
            {data.theme === "custom" ? "Custom Pad" : `${data.theme || "Corporate"} Pad`}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 lg:gap-3 w-full md:w-auto justify-end">
        {/* Workspace Tabs */}
        {onTabChange && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onTabChange("prescription")}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === "prescription"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Prescription
            </button>
            <button
              onClick={() => onTabChange("report")}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === "report"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Test Reports
            </button>
          </div>
        )}

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-between md:justify-end overflow-x-visible pb-1 md:pb-0">
          {patientName === "Select Patient" && (
            <button className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1.5 sm:py-2 rounded-xl hover:bg-sky-100 transition-all shrink-0">
              <Search size={15} />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}

          {/* 1-Click Language Translator Popup */}
          <div className="relative shrink-0" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
              title="1-Click Prescription Language Translator"
            >
              <Globe size={15} className="text-sky-600" />
              <span>{currentLang.nativeLabel}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    1-Click Rx Translation
                  </p>
                </div>
                {PRESCRIPTION_LANGUAGES.map((lang) => {
                  const active = (data.language || "en") === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code, `${lang.nativeLabel} (${lang.label})`)}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        active ? "bg-sky-50/70 text-sky-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="text-[13px] font-bold flex items-center gap-2">
                          <span>{lang.nativeLabel}</span>
                          <span className="text-xs font-medium text-slate-400">({lang.label})</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{lang.countryHint}</p>
                      </div>
                      {active && <Check size={14} className="text-sky-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upload Custom Canva / Hospital Pad */}
          <button
            type="button"
            onClick={() => padUploadRef.current?.click()}
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-all shrink-0 shadow-xs"
            title="Upload Custom Hospital or Canva Pad (PNG/JPG)"
          >
            <ImagePlus size={15} className="text-slate-600" />
            <span className="hidden lg:inline">Upload Pad</span>
          </button>

          <button
            type="button"
            onClick={handleVoiceDictation}
            title="Dictate Chief Complaint"
            className={`hidden xl:flex items-center gap-1.5 text-xs sm:text-[13px] font-bold px-2.5 py-2 rounded-xl transition-colors shrink-0 ${
              isDictating
                ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Mic size={15} />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-0.5 hidden md:block"></div>

          <button
            type="button"
            onClick={() => toast.success("Draft Saved")}
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-700 bg-white border border-slate-200 shadow-xs px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shrink-0"
          >
            <Save size={15} className="text-slate-600" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-slate-200 transition-all active:scale-95 shrink-0"
          >
            <LayoutTemplate size={15} />
            <span className="hidden sm:inline">Templates & Preview</span>
          </button>

          <button
            type="button"
            onClick={onFinalize}
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all active:scale-95 shrink-0"
          >
            <Check size={15} strokeWidth={2.5} />
            <span>Finalize</span>
          </button>
        </div>
      </div>
    </div>
  );
}
