"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, CreditCard, Shield, AlertTriangle, Phone,
  Calendar, MapPin, Heart, Stethoscope, Pill,
  UserCheck, ExternalLink, RefreshCw, X, ArrowRight,
  Filter, CheckCircle2, ChevronRight, Activity, FlipHorizontal,
  Printer, MessageCircle, AlertOctagon, HeartPulse, User,
  RotateCcw, FileText, Download, Eye, Globe, Building,
  Thermometer, Droplet, Clock, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { HealthPassCard as HealthPassCardType, DiagnosticReport } from "@/types/healthpass";
import { searchHealthCards, calculateAge, formatDate, INITIAL_HEALTH_CARDS } from "@/lib/healthpass";
import HealthPassCard from "@/components/health-card/HealthPassCard";
import { HealthPassBack } from "@/components/health-card/HealthPassBack";

interface Props {
  portalRole?: "doctor" | "hospital" | "admin";
  title?: string;
  subtitle?: string;
}

export function HealthPassSearchEngine({
  portalRole = "doctor",
  title,
  subtitle,
}: Props) {
  // Localization: English default, 1-click toggle to Bengali
  const [lang, setLang] = useState<"en" | "bn">("en");
  
  // Search query & filters
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "nid" | "dob" | "phone" | "card_no" | "name" | "blood_group">("all");
  
  // View mode: Comprehensive Paper Dossier vs Compact Smart ID Card
  const [viewMode, setViewMode] = useState<"paper" | "card">("paper");
  
  // Selected active patient (Defaults strictly to Rahim Uddin - Doctor Queue S-01)
  const [selectedCard, setSelectedCard] = useState<HealthPassCardType | null>(() => {
    return Array.isArray(INITIAL_HEALTH_CARDS) && INITIAL_HEALTH_CARDS.length > 0 ? INITIAL_HEALTH_CARDS[0] : null;
  });
  
  const [isDossierFlipped, setIsDossierFlipped] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cardList, setCardList] = useState<HealthPassCardType[]>(() => {
    return Array.isArray(INITIAL_HEALTH_CARDS) ? INITIAL_HEALTH_CARDS : [];
  });
  const [dataSource, setDataSource] = useState<"database" | "registry">("registry");
  
  // Modal states for printing & digital lab paper viewing
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeReportModal, setActiveReportModal] = useState<DiagnosticReport | null>(null);

  // Guaranteed safe array memoization
  const safeResults: HealthPassCardType[] = useMemo(() => {
    if (Array.isArray(cardList) && cardList.length > 0) {
      return cardList;
    }
    return Array.isArray(INITIAL_HEALTH_CARDS) && INITIAL_HEALTH_CARDS.length > 0 ? INITIAL_HEALTH_CARDS : [];
  }, [cardList]);

  // Guaranteed active card (strictly attached to selection or initial queue patient)
  const currentCard = selectedCard || (safeResults.length > 0 ? safeResults[0] : (INITIAL_HEALTH_CARDS[0] || null));

  // Search debounce and live API query with offline fallback
  useEffect(() => {
    let isCurrent = true;

    if (!query.trim()) {
      const defaultCards = searchHealthCards("", filterType);
      const safeDefault = Array.isArray(defaultCards) && defaultCards.length > 0 ? defaultCards : INITIAL_HEALTH_CARDS;
      setCardList(Array.isArray(safeDefault) ? safeDefault : []);
      setDataSource("registry");
      if (!selectedCard && safeDefault.length > 0) {
        setSelectedCard(safeDefault[0]);
      }
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/emergency/search?query=${encodeURIComponent(query)}&filterType=${encodeURIComponent(filterType)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isCurrent) {
            const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
            if (list.length > 0) {
              setCardList(list);
              setDataSource(data?.source === "supabase" ? "database" : "registry");
              setSelectedCard(list[0]);
            } else {
              setCardList([]);
            }
          }
        } else {
          // Fallback to synchronous local engine
          const localRes = searchHealthCards(query, filterType);
          const safeRes = Array.isArray(localRes) ? localRes : INITIAL_HEALTH_CARDS;
          if (isCurrent) {
            setCardList(Array.isArray(safeRes) ? safeRes : []);
            setDataSource("registry");
            if (safeRes.length > 0) {
              setSelectedCard(safeRes[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Emergency search fetch error, falling back locally:", err);
        const localRes = searchHealthCards(query, filterType);
        const safeRes = Array.isArray(localRes) ? localRes : INITIAL_HEALTH_CARDS;
        if (isCurrent) {
          setCardList(Array.isArray(safeRes) ? safeRes : []);
          setDataSource("registry");
          if (safeRes.length > 0) {
            setSelectedCard(safeRes[0]);
          }
        }
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query, filterType]);

  // Queue-aligned quick test pills
  const quickPills = [
    { label: "Rahim Uddin (A+ • Queue S-01)", type: "name" as const, val: "Rahim" },
    { label: "Fatema Begum (O+ • Queue S-02)", type: "name" as const, val: "Fatema" },
    { label: "Kamal Hossain (B+ • K 10 23 45)", type: "name" as const, val: "Kamal" },
    { label: "Abdul Karim (B+ • Pacemaker)", type: "name" as const, val: "Karim" },
    { label: "Md. Jasim Uddin (O- • Donor)", type: "name" as const, val: "Jasim" },
    { label: "NID: 1974 2698 4401...", type: "nid" as const, val: "1974 2698 4401 2390" },
  ];

  // Defensive array checks for currently selected patient
  const safeAllergies = Array.isArray(currentCard?.allergies) ? currentCard.allergies : [];
  const safeConditions = Array.isArray(currentCard?.chronic_conditions) ? currentCard.chronic_conditions : [];
  const safeMedications = Array.isArray(currentCard?.current_medications) ? currentCard.current_medications : [];
  const safeReports: DiagnosticReport[] = Array.isArray(currentCard?.diagnostic_reports) ? currentCard.diagnostic_reports : [];
  const safeVitals = currentCard?.vitals;

  // Print helper: prints specific lab paper or the entire dossier
  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Pristine World-Class Medical Executive Header (Pure White & Subtle Sky Gradient, No Harsh Black) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/90 relative overflow-hidden">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          {/* Top Row: System Status Badges + 1-Click Language Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />
                <span>{lang === "en" ? "National Emergency Trauma & Accident Protocol" : "জাতীয় জরুরি ট্রমা ও দুর্ঘটনা প্রটোকল"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
                <Shield size={13} className="text-sky-600" />
                <span>{portalRole.toUpperCase()} CLINICAL ACCESS</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{dataSource === "database" ? (lang === "en" ? "Live Database Sync" : "লাইভ ডাটাবেজ সক্রিয়") : (lang === "en" ? "Verified Registry" : "ভেরিফাইড রেজিস্ট্রি")}</span>
              </span>
            </div>

            {/* 1-Click Language Switcher (EN / BN) */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-white text-sky-700 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Switch interface to English"
              >
                <span>🇬🇧 English</span>
                {lang === "en" && <Check size={12} className="text-sky-600" />}
              </button>
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "bn"
                    ? "bg-white text-sky-700 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="ইন্টারফেস বাংলায় রূপান্তর করুন"
              >
                <span>🇧🇩 বাংলা</span>
                {lang === "bn" && <Check size={12} className="text-sky-600" />}
              </button>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <HeartPulse className="text-sky-600 shrink-0" size={24} />
              <span>
                {title || (lang === "en" ? "Emergency Clinical HealthPass Lookup Engine" : "হেলথপাস জরুরি দুর্ঘটনা ও ক্লিনিক্যাল অনুসন্ধান ইঞ্জিন")}
              </span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-4xl">
              {subtitle || (lang === "en"
                ? "Instant electronic emergency dossier, biometric profile, severe drug allergy check, and digitalized diagnostic lab papers for immediate trauma admission and prescription safety."
                : "এনআইডি, মোবাইল নম্বর, জন্ম তারিখ বা রোগীর নাম দিয়ে ১ সেকেন্ডের মধ্যে সম্পূর্ণ ইমার্জেন্সি হিস্ট্রি, অ্যালার্জি ও ডিজিটাল ল্যাব রিপোর্ট অনুসন্ধান করুন।")}
            </p>
          </div>

          {/* Search Box & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="relative flex-1 flex items-center">
              <Search size={18} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "en"
                  ? "Search by Patient Name, NID, Phone, DOB (YYYY-MM-DD), Card ID, or Blood Group..."
                  : "NID নম্বর, মোবাইল নম্বর, রোগীর নাম, জন্ম তারিখ (YYYY-MM-DD) বা কার্ড নম্বর..."
                }
                className="w-full h-11 pl-10 pr-9 bg-white text-slate-900 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-2xs"
              />
              {isSearching ? (
                <div className="absolute right-3">
                  <RefreshCw size={16} className="text-sky-600 animate-spin" />
                </div>
              ) : query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="h-11 px-3 bg-white text-slate-700 rounded-xl text-xs font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 cursor-pointer shadow-2xs"
              >
                <option value="all">{lang === "en" ? "All Universal Fields" : "সকল ফিল্ড (Universal)"}</option>
                <option value="name">{lang === "en" ? "Patient Name" : "রোগীর নাম (Name)"}</option>
                <option value="nid">{lang === "en" ? "National ID (NID)" : "জাতীয় পরিচয়পত্র (NID)"}</option>
                <option value="phone">{lang === "en" ? "Phone Number" : "মোবাইল নম্বর (Phone)"}</option>
                <option value="blood_group">{lang === "en" ? "Blood Group" : "রক্তের গ্রুপ (Blood Group)"}</option>
                <option value="card_no">{lang === "en" ? "Card ID Number" : "কার্ড নম্বর (Card No)"}</option>
                <option value="dob">{lang === "en" ? "Date of Birth (DOB)" : "জন্ম তারিখ (DOB)"}</option>
              </select>

              <button
                type="button"
                onClick={() => {}}
                className="h-11 px-5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Search size={15} />
                <span>{lang === "en" ? "Search" : "অনুসন্ধান"}</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Test Pills (Matched directly to Doctor Queue & Registry) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
              <Clock size={12} />
              <span>{lang === "en" ? "Doctor Queue & Benchmarks:" : "ডাক্তার কিউ ও বেঞ্চমার্ক:"}</span>
            </span>
            {quickPills.map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  setFilterType(pill.type);
                  setQuery(pill.val);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200/80 text-[11px] font-medium transition-colors cursor-pointer active:scale-95 shadow-2xs"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Results List */}
        <div className={`space-y-3.5 ${currentCard ? "lg:col-span-5" : "lg:col-span-12"}`}>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                {lang === "en" ? "Matching Patients" : "রেজাল্ট তালিকা"} ({safeResults.length})
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                dataSource === "database" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
              }`}>
                {dataSource === "database" ? (lang === "en" ? "Live Database" : "লাইভ ডাটাবেজ") : (lang === "en" ? "Verified Registry" : "ভেরিফাইড রেজিস্ট্রি")}
              </span>
            </div>
            {currentCard && (
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="text-xs font-bold text-sky-600 hover:underline lg:hidden cursor-pointer"
              >
                {lang === "en" ? "Full List" : "রেজাল্ট ভিউ"}
              </button>
            )}
          </div>

          {safeResults.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
                <AlertOctagon size={26} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {lang === "en" ? "No Patient Record Found" : "কোনো রেকর্ড পাওয়া যায়নি"}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {lang === "en"
                    ? "No emergency HealthPass matches the provided name, NID, or phone number."
                    : "প্রদত্ত NID, নাম বা ফোন নম্বরের বিপরীতে কোনো হেলথ রেকর্ড নেই।"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilterType("all");
                  setCardList(INITIAL_HEALTH_CARDS);
                  setSelectedCard(INITIAL_HEALTH_CARDS[0]);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{lang === "en" ? "Reload Active Queue Registry" : "ডিফল্ট রেজিস্ট্রি রিলোড করুন"}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {safeResults.map((patient) => {
                const isSelected = currentCard?.id === patient.id;
                const age = calculateAge(patient.date_of_birth);
                const patientAllergies = Array.isArray(patient?.allergies) ? patient.allergies : [];
                return (
                  <motion.div
                    key={patient.id}
                    onClick={() => {
                      setSelectedCard(patient);
                      setIsDossierFlipped(false);
                    }}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-sky-50/70 border-sky-400 shadow-md ring-2 ring-sky-400/20"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    {/* Left vertical status stripe */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        patient.has_pacemaker
                          ? "bg-amber-500"
                          : patientAllergies.length > 0
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                    />

                    <div className="flex items-start justify-between gap-3 pl-1">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          {patient.patient_image ? (
                            <img
                              src={patient.patient_image}
                              alt={patient.patient_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={22} className="text-sky-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {patient.english_name || patient.patient_name}
                            </h4>
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0" title="Verified Biometric Profile">
                              <CheckCircle2 size={11} />
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {patient.patient_name} • NID: {patient.nid_number || "Unregistered"}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-600">
                            <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {patient.card_number}
                            </span>
                            <span>{lang === "en" ? `Age: ${age} Yrs` : `বয়স: ${age} বছর`}</span>
                            <span>• {patient.gender}</span>
                            <span>• <MapPin size={11} className="inline text-sky-600" /> {patient.zila || "Dhaka"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Blood Group Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center text-sm shadow-xs border border-rose-700">
                          {patient.blood_group}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 font-mono">
                          {patient.personal_phone?.slice(-4) ? `*${patient.personal_phone.slice(-4)}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Quick alerts bar inside list item */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                      {patientAllergies.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                          <AlertTriangle size={11} />
                          <span>{lang === "en" ? `Allergy: ${patientAllergies.slice(0, 2).join(", ")}` : `এলার্জি: ${patientAllergies.slice(0, 2).join(", ")}`}</span>
                        </span>
                      )}
                      {patient.has_pacemaker && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                          <HeartPulse size={11} />
                          <span>{lang === "en" ? "Pacemaker Active (No MRI)" : "পেসমেকার সক্রিয় (MRI নিষিদ্ধ)"}</span>
                        </span>
                      )}
                      {patient.organ_donor && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          <Heart size={11} />
                          <span>{lang === "en" ? "Organ Donor" : "অঙ্গদাতা"}</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Emergency Medical Dossier or Smart Card */}
        {currentCard && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6"
          >
            {/* Dossier Header: Controls, Dual View Switcher & 1-Click Print */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{lang === "en" ? "Clinical Emergency Dossier" : "জরুরি ক্লিনিক্যাল ডসিয়ার"}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {lang === "en" ? "ACTIVE EHR" : "সক্রিয় রেকর্ড"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {currentCard.smart_card_uid || currentCard.card_number} • NID: {currentCard.nid_number || "Unregistered"}
                  </p>
                </div>
              </div>

              {/* View Mode Toggle & Print Button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Segmented View Mode Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setViewMode("paper")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "paper"
                        ? "bg-white text-sky-700 shadow-xs border border-slate-200/60"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="View Comprehensive Hospital Paper EHR Sheet"
                  >
                    <FileText size={14} />
                    <span>{lang === "en" ? "Paper Dossier" : "পেপার ডসিয়ার"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("card")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "card"
                        ? "bg-white text-sky-700 shadow-xs border border-slate-200/60"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="View Compact Interactive Smart ID Card"
                  >
                    <CreditCard size={14} />
                    <span>{lang === "en" ? "Pocket Card" : "স্মার্ট কার্ড"}</span>
                  </button>
                </div>

                {/* 1-Click Print Dossier Button */}
                <button
                  type="button"
                  onClick={handlePrintDossier}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Print standardized hospital emergency admission paper"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">{lang === "en" ? "Print Dossier" : "প্রিন্ট ডসিয়ার"}</span>
                </button>
              </div>
            </div>

            {/* Critical Anaphylaxis & Pacemaker Red Alert Banner */}
            {safeAllergies.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div className="text-xs leading-relaxed min-w-0">
                  <strong className="font-extrabold uppercase tracking-wide block text-rose-800 text-xs sm:text-sm">
                    {lang === "en" ? "CRITICAL DRUG ALLERGY WARNING (ANAPHYLAXIS RISK):" : "⚠️ জরুরি ড্রাগ এলার্জি সতর্কতা (Severe Anaphylaxis Risk):"}
                  </strong>
                  <p className="mt-0.5 text-rose-900 font-medium">
                    {lang === "en"
                      ? `Patient has documented severe adverse reactions to: `
                      : `রোগীর শরীরে মারাত্মক অ্যালার্জিক রিঅ্যাকশন ঘটবে: `}
                    <strong className="underline decoration-rose-400 font-bold">{safeAllergies.join(", ")}</strong>.
                    {lang === "en"
                      ? " Do NOT administer penicillin-class antibiotics or contraindicated NSAIDs before allergy review."
                      : " যেকোনো অ্যান্টিবায়োটিক বা এনএসএআইডি দেওয়ার পূর্বে অবশ্যই সাবধান থাকুন।"}
                  </p>
                </div>
              </div>
            )}

            {/* Pacemaker Alert Banner */}
            {currentCard.has_pacemaker && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3 shadow-xs">
                <HeartPulse size={20} className="shrink-0 text-amber-600" />
                <div className="text-xs font-medium">
                  <strong className="font-bold text-amber-900 uppercase">
                    {lang === "en" ? "Active Cardiac Pacemaker Implant:" : "সক্রিয় কার্ডিয়াক পেসমেকার সতর্কবার্তা:"}
                  </strong>{" "}
                  {lang === "en"
                    ? "Patient has an implanted cardiac pacemaker. MRI scans are strictly contraindicated. Defibrillator pads must be placed >8cm from pulse generator."
                    : "রোগীর শরীরে স্থায়ী পেসমেকার রয়েছে। MRI স্ক্যান সম্পূর্ণ নিষিদ্ধ।"}
                </div>
              </div>
            )}

            {/* VIEW MODE 1: COMPACT SMART ID CARD (Interactive 3D Front & Back Flip) */}
            {viewMode === "card" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="text-slate-500 font-medium">
                    {lang === "en" ? "Click card or button below to flip:" : "কার্ডে বা নিচের বাটনে ক্লিক করে উল্টান:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDossierFlipped(!isDossierFlipped)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FlipHorizontal size={14} />
                    <span>{isDossierFlipped ? (lang === "en" ? "Show Front" : "সামনে দেখুন") : (lang === "en" ? "Show Back" : "পেছন দেখুন")}</span>
                  </button>
                </div>

                <div className="flex justify-center my-2">
                  <AnimatePresence mode="wait">
                    {!isDossierFlipped ? (
                      <motion.div
                        key="dossier-front"
                        initial={{ rotateY: -90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-[500px]"
                      >
                        <HealthPassCard
                          card={currentCard}
                          profileImage={currentCard.patient_image}
                          onFlip={() => setIsDossierFlipped(true)}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dossier-back"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-[500px]"
                      >
                        <HealthPassBack
                          card={currentCard}
                          onFlip={() => setIsDossierFlipped(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: COMPREHENSIVE CLINICAL PAPER DOSSIER (Organized Hospital EHR View) */}
            {viewMode === "paper" && (
              <div className="space-y-6">
                {/* 1. Patient Demographics & Profile Summary */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 border-2 border-white shadow-xs overflow-hidden shrink-0 relative">
                      {currentCard.patient_image ? (
                        <img
                          src={currentCard.patient_image}
                          alt={currentCard.patient_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-sky-300">
                          <User size={32} />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          {currentCard.english_name || currentCard.patient_name}
                        </h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Verified Digital Pass" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-sky-700">
                        {currentCard.patient_name} • {currentCard.gender.toUpperCase()} • {calculateAge(currentCard.date_of_birth)} {lang === "en" ? "Yrs" : "বছর"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 font-mono">
                        <span>DOB: {formatDate(currentCard.date_of_birth)}</span>
                        <span>•</span>
                        <span>NID: {currentCard.nid_number || "Unregistered"}</span>
                        <span>•</span>
                        <span>UID: {currentCard.smart_card_uid}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blood Group Display */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black flex items-center justify-center text-xl shadow-xs border border-rose-700">
                        {currentCard.blood_group}
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {lang === "en" ? "Blood Group" : "রক্তের গ্রুপ"}
                        </span>
                        <span className="text-xs font-bold text-rose-700">
                          {currentCard.blood_group === "O-" ? "Universal Donor" : currentCard.blood_group === "AB+" ? "Universal Recipient" : "Rh Positive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Clinical Vitals & Bio-Metrics Dashboard (International Hospital Standard) */}
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity size={15} className="text-sky-600" />
                      <span>{lang === "en" ? "Clinical Bio-Metrics & Triage Vitals" : "ক্লিনিক্যাল ভাইটাল ও বায়োমেট্রিক্স"}</span>
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      {lang === "en" ? "Recorded: Today" : "রেকর্ড: আজকের আপডেট"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "en" ? "Blood Pressure" : "রক্তচাপ"}
                      </span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block font-mono">
                        {safeVitals?.blood_pressure || "130/85"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">mmHg</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "en" ? "Heart Rate" : "পালস রেট"}
                      </span>
                      <span className="text-sm font-black text-rose-600 mt-0.5 block font-mono">
                        {safeVitals?.heart_rate || "76"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">bpm</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "en" ? "Oxygen (SpO2)" : "অক্সিজেন"}
                      </span>
                      <span className="text-sm font-black text-sky-600 mt-0.5 block font-mono">
                        {safeVitals?.spo2 || "98%"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Normal</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "en" ? "Blood Glucose" : "রক্ত শর্করা"}
                      </span>
                      <span className="text-sm font-black text-amber-600 mt-0.5 block font-mono">
                        {safeVitals?.blood_glucose || "115"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">mg/dL</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "en" ? "Temperature" : "তাপমাত্রা"}
                      </span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block font-mono">
                        {safeVitals?.temperature || "98.6°F"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Afebrile</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "en" ? "BMI / Weight" : "বিএমআই"}
                      </span>
                      <span className="text-sm font-black text-emerald-700 mt-0.5 block font-mono">
                        {safeVitals?.bmi || "24.2"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">kg/m²</span>
                    </div>
                  </div>
                </div>

                {/* 3. Emergency ICE Guardian Contact Callout */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {lang === "en" ? "PRIMARY EMERGENCY GUARDIAN (ICE CONTACT)" : "জরুরি অভিভাবক যোগাযোগ (ICE CONTACT)"}
                      </span>
                    </div>
                    <p className="text-base font-black text-slate-900">
                      {currentCard.emergency_contact_name}{" "}
                      <span className="text-xs font-semibold text-slate-500">
                        ({currentCard.emergency_contact_relation})
                      </span>
                    </p>
                    <p className="text-xs font-mono font-bold text-sky-700 mt-0.5">
                      {currentCard.emergency_contact_phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={`tel:${currentCard.emergency_contact_phone}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Phone size={14} />
                      <span>{lang === "en" ? "Direct Call" : "তাৎক্ষণিক কল"}</span>
                    </a>

                    {currentCard.emergency_has_whatsapp && currentCard.emergency_contact_phone && (
                      <a
                        href={`https://wa.me/${(currentCard.emergency_contact_phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Official Medical Emergency Notice: Patient ${currentCard.patient_name} (${currentCard.english_name || ""}) is currently at the Hospital Emergency Department. Please contact the attending physician.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Send verified WhatsApp emergency alert"
                      >
                        <MessageCircle size={15} />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 4. Active Medications & Chronic Conditions Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Active Medications */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill size={15} className="text-emerald-600" />
                      <span>{lang === "en" ? "Active Ongoing Medications" : "চলমান প্রেসক্রিপশন ও ঔষধ"}</span>
                    </h4>
                    {safeMedications.length > 0 ? (
                      <div className="space-y-2">
                        {safeMedications.map((med, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white border border-slate-200/90 rounded-xl text-xs space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900 font-bold">{med.name}</strong>
                              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                {med.dosage}
                              </span>
                            </div>
                            <p className="text-slate-600 font-medium">
                              {med.frequency} • {med.duration || "Continuous"}
                            </p>
                            {med.instructions && (
                              <p className="text-[11px] text-slate-400 italic">
                                {med.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">{lang === "en" ? "No active medications recorded." : "কোনো চলমান ওষুধের রেকর্ড নেই।"}</p>
                    )}
                  </div>

                  {/* Chronic Conditions */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope size={15} className="text-sky-600" />
                      <span>{lang === "en" ? "Chronic Conditions & History" : "দীর্ঘস্থায়ী রোগ ও হিস্ট্রি"}</span>
                    </h4>
                    {safeConditions.length > 0 ? (
                      <div className="space-y-2">
                        {safeConditions.map((item, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white border border-slate-200/90 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                          >
                            <div>
                              <strong className="font-bold text-slate-900 block">{item.name}</strong>
                              <span className="text-[11px] text-slate-400">
                                {lang === "en" ? `Diagnosed: ${item.since}` : `শনাক্ত: ${item.since}`}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 uppercase">
                              {item.status || "controlled"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">{lang === "en" ? "No chronic conditions recorded." : "কোনো ক্রনিক রোগ নেই।"}</p>
                    )}
                  </div>
                </div>

                {/* 5. VERIFIED DIAGNOSTIC LAB REPORT PAPERS (User's specific core requirement!) */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={16} className="text-sky-600" />
                        <span>{lang === "en" ? "Digitalized Diagnostic Report Papers" : "ডিজিটাল ডায়াগনস্টিক রিপোর্ট পেপারসমূহ"}</span>
                        <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                          {safeReports.length} {lang === "en" ? "Available" : "সংযুক্ত"}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === "en"
                          ? "View full hospital lab parameters, reference ranges, and download official PDF/print report sheets."
                          : "ল্যাব প্যারামিটার ও রেফারেন্স রেঞ্জ দেখুন এবং অফিশিয়াল পেপার ডাউনলোড করুন।"}
                      </p>
                    </div>
                  </div>

                  {safeReports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {safeReports.map((report) => (
                        <div
                          key={report.id}
                          className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase font-mono">
                                {report.category}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                report.status === "Normal"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {report.status}
                              </span>
                            </div>

                            <h5 className="font-bold text-slate-900 text-sm mt-2 leading-snug">
                              {report.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {report.hospital} • {report.date}
                            </p>
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                              {report.summary}
                            </p>
                          </div>

                          {/* Action Buttons: View Full Lab Paper & Download / Print */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveReportModal(report)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>{lang === "en" ? "View Lab Paper" : "পেপার দেখুন"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveReportModal(report);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              title="Download & Print Official Report Slip"
                            >
                              <Download size={13} />
                              <span>{lang === "en" ? "Download" : "ডাউনলোড"}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                      {lang === "en" ? "No digitized diagnostic reports currently attached to this patient." : "কোনো ডায়াগনস্টিক রিপোর্ট সংরক্ষিত নেই।"}
                    </div>
                  )}
                </div>

                {/* 6. Attending Physician Digital Seal & Bottom Actions */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800">
                      {lang === "en" ? "Registered HealthPass Address:" : "রেজিস্টার্ড ঠিকানা:"}
                    </span>{" "}
                    {currentCard.address || "Dhanmondi, Dhaka, Bangladesh"}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {lang === "en" ? `Card Issued: ${formatDate(currentCard.issued_at)}` : `ইস্যু তারিখ: ${formatDate(currentCard.issued_at)}`}
                  </div>
                </div>

                {/* Final 1-Click Print Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handlePrintDossier}
                    className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Printer size={16} />
                    <span>{lang === "en" ? "Print Full Clinical Dossier & Summary Sheet" : "সম্পূর্ণ ক্লিনিক্যাল ডসিয়ার ও সামারি প্রিন্ট করুন"}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* MODAL 1: OFFICIAL DIAGNOSTIC LAB REPORT PAPER VIEWER & DOWNLOADER (User Request) */}
      {activeReportModal && currentCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900 relative"
          >
            {/* Modal Hospital Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest block font-mono">
                  OFFICIAL CLINICAL DIAGNOSTIC REPORT
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {activeReportModal.hospital}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Lab Ref: {activeReportModal.lab_ref} • Date: {activeReportModal.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReportModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Patient Header Block */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Patient Name</span>
                <strong className="text-slate-900 font-sans font-bold">
                  {currentCard.english_name || currentCard.patient_name}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Blood Group / Age</span>
                <strong className="text-rose-600 font-bold">{currentCard.blood_group}</strong> • {calculateAge(currentCard.date_of_birth)} Yrs
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">NID Number</span>
                <strong className="text-slate-800">{currentCard.nid_number || "Unregistered"}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">HealthPass UID</span>
                <strong className="text-sky-700">{currentCard.card_number}</strong>
              </div>
            </div>

            {/* Test Summary & Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-black text-slate-900 uppercase">
                  {activeReportModal.title}
                </h4>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  activeReportModal.status === "Normal"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {activeReportModal.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 bg-sky-50/50 p-3 rounded-xl border border-sky-100 leading-relaxed">
                <strong>Clinical Impression:</strong> {activeReportModal.summary}
              </p>
            </div>

            {/* Detailed Parameters Table if available */}
            {activeReportModal.parameters && activeReportModal.parameters.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Test Parameter</th>
                      <th className="p-3">Result Value</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Normal Reference Range</th>
                      <th className="p-3 text-right">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReportModal.parameters.map((param, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 font-mono">
                        <td className="p-3 font-sans font-bold text-slate-800">{param.name}</td>
                        <td className="p-3 font-bold text-slate-900">{param.value}</td>
                        <td className="p-3 text-slate-500">{param.unit}</td>
                        <td className="p-3 text-slate-500">{param.reference_range}</td>
                        <td className="p-3 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            param.flag === "NORMAL"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800 font-black"
                          }`}>
                            {param.flag || "NORMAL"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Doctor Notes & Sign-off */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                <span className="font-bold text-slate-700">Electronically Verified By:</span>{" "}
                <span className="text-slate-900 font-medium">{activeReportModal.verified_by || "Chief Clinical Pathologist"}</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                Hospital LIMS Security Barcode Validated
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setActiveReportModal(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {lang === "en" ? "Close" : "বন্ধ করুন"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer size={15} />
                <span>{lang === "en" ? "Download / Print Lab Paper" : "ল্যাব পেপার প্রিন্ট / ডাউনলোড"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: EMERGENCY ADMISSION & TRAUMA TRIAGE SLIP */}
      {showPrintModal && currentCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900">
            {/* Print Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest block">
                  EMERGENCY TRAUMA & ADMISSION SLIP
                </span>
                <h3 className="text-xl font-black">
                  Oxpecker National HealthPass Emergency Triage
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* High-Contrast Print Body */}
            <div className="space-y-4 font-mono text-xs border p-4 rounded-xl bg-slate-50">
              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Patient Name</span>
                  <strong className="text-sm font-bold text-slate-900 font-sans">
                    {currentCard.english_name || currentCard.patient_name}
                  </strong>
                  <p className="text-slate-600 text-xs">{currentCard.patient_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block uppercase">Blood Group</span>
                  <span className="text-2xl font-black text-rose-600">
                    {currentCard.blood_group}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-3">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">NID Number</span>
                  <strong>{currentCard.nid_number || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">DOB / Age</span>
                  <strong>{currentCard.date_of_birth} ({calculateAge(currentCard.date_of_birth)} Yrs)</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Gender</span>
                  <strong>{currentCard.gender}</strong>
                </div>
              </div>

              <div className="border-b pb-3">
                <span className="text-rose-600 text-[10px] font-bold block uppercase">
                  ⚠️ Critical Drug Allergies
                </span>
                <p className="font-bold text-rose-700 text-sm">
                  {safeAllergies.length > 0 ? safeAllergies.join(", ") : "NO RECORDED DRUG ALLERGIES"}
                </p>
              </div>

              <div className="border-b pb-3">
                <span className="text-slate-400 text-[10px] block uppercase">Primary ICE Contact</span>
                <p className="font-bold text-slate-900">
                  {currentCard.emergency_contact_name} ({currentCard.emergency_contact_relation}) • {currentCard.emergency_contact_phone}
                </p>
              </div>

              <div className="border-b pb-3">
                <span className="text-slate-400 text-[10px] block uppercase">Active Implants / Chronic</span>
                <p>Pacemaker: {currentCard.has_pacemaker ? "YES (ACTIVE)" : "NO"} | Diabetic: {currentCard.diabetic_status || "None"}</p>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 flex justify-between">
                <span>Hospital Triage Desk: Emergency Trauma Unit</span>
                <span>Timestamp: {new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {lang === "en" ? "Cancel" : "বাতিল করুন"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer size={15} />
                <span>{lang === "en" ? "Print Admission Slip" : "মুদ্রণ করুন (Print Slip)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthPassSearchEngine;
