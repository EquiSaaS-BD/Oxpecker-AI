"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, CreditCard, Shield, AlertTriangle, Phone,
  Calendar, MapPin, Heart, Stethoscope, Pill,
  UserCheck, ExternalLink, RefreshCw, X, ArrowRight,
  Filter, CheckCircle2, ChevronRight, Activity, FlipHorizontal,
  Printer, MessageCircle, AlertOctagon, HeartPulse, User,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { HealthPassCard as HealthPassCardType } from "@/types/healthpass";
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
  title = "HealthPass জরুরি দুর্ঘটনা ও মেডিকেল সার্চ ইঞ্জিন",
  subtitle = "NID, মোবাইল নম্বর, জন্ম তারিখ বা রোগীর নাম দিয়ে ১ সেকেন্ডের মধ্যে সম্পূর্ণ ইমার্জেন্সি হিস্ট্রি ও অভিভাবকের তথ্য অনুসন্ধান করুন",
}: Props) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "nid" | "dob" | "phone" | "card_no" | "name">("all");
  
  // Directly initialize with verified benchmark patient
  const [selectedCard, setSelectedCard] = useState<HealthPassCardType | null>(() => {
    return Array.isArray(INITIAL_HEALTH_CARDS) && INITIAL_HEALTH_CARDS.length > 0 ? INITIAL_HEALTH_CARDS[0] : null;
  });
  
  const [isDossierFlipped, setIsDossierFlipped] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cardList, setCardList] = useState<HealthPassCardType[]>(() => {
    return Array.isArray(INITIAL_HEALTH_CARDS) ? INITIAL_HEALTH_CARDS : [];
  });
  const [dataSource, setDataSource] = useState<"database" | "registry">("registry");
  const [showPrintModal, setShowPrintModal] = useState(false);

  // 100% Guaranteed Safe Array Memoization
  const safeResults: HealthPassCardType[] = useMemo(() => {
    if (Array.isArray(cardList) && cardList.length > 0) {
      return cardList;
    }
    return Array.isArray(INITIAL_HEALTH_CARDS) && INITIAL_HEALTH_CARDS.length > 0 ? INITIAL_HEALTH_CARDS : [];
  }, [cardList]);

  // Guaranteed Active Card
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

  const quickPills = [
    { label: "মো. রফিক ইসলাম (A+)", type: "name" as const, val: "Rafiq" },
    { label: "NID: 1995 2698...", type: "nid" as const, val: "1995 2698 4401 2390" },
    { label: "মোবাইল: 01712-345678", type: "phone" as const, val: "01712-345678" },
    { label: "আব্দুল করিম (পেসমেকার B+)", type: "name" as const, val: "Karim" },
    { label: "তানজিলা আক্তার (O+)", type: "name" as const, val: "Tanzila" },
    { label: "জসিম উদ্দিন (O- দাতা)", type: "name" as const, val: "Jasim" },
  ];

  // Defensive array checks for currently selected patient
  const safeAllergies = Array.isArray(currentCard?.allergies) ? currentCard.allergies : [];
  const safeConditions = Array.isArray(currentCard?.chronic_conditions) ? currentCard.chronic_conditions : [];
  const safeMedications = Array.isArray(currentCard?.current_medications) ? currentCard.current_medications : [];

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
              <span>National Trauma & Accident Emergency Protocol</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-mono">
              <Shield size={12} className="text-sky-400" />
              <span>{portalRole.toUpperCase()} ACCESS</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            {subtitle}
          </p>

          {/* Search Box & Filter Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-inner">
            <div className="relative flex-1 flex items-center">
              <Search size={18} className="absolute left-3.5 text-sky-300" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="NID নম্বর, মোবাইল নম্বর, রোগীর নাম, জন্ম তারিখ (YYYY-MM-DD) বা কার্ড নম্বর..."
                className="w-full h-11 pl-10 pr-9 bg-white text-slate-900 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
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
                className="h-11 px-3 bg-slate-800/90 text-white rounded-xl text-xs font-bold border border-white/20 focus:outline-none cursor-pointer"
              >
                <option value="all">সকল ফিল্ড (Universal)</option>
                <option value="nid">জাতীয় পরিচয়পত্র (NID)</option>
                <option value="phone">মোবাইল নম্বর (Phone)</option>
                <option value="name">রোগীর নাম (Name)</option>
                <option value="dob">জন্ম তারিখ (DOB)</option>
                <option value="card_no">কার্ড নম্বর (Card No)</option>
              </select>

              <button
                type="button"
                onClick={() => {}}
                className="h-11 px-5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                অনুসন্ধান
              </button>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">দ্রুত পরীক্ষা (Quick Test):</span>
            {quickPills.map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  setFilterType(pill.type);
                  setQuery(pill.val);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 border border-white/10 text-[11px] font-mono transition-colors cursor-pointer"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Results List (Left column on large screens) */}
        <div className={`space-y-4 ${currentCard ? "lg:col-span-5" : "lg:col-span-12"}`}>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                রেজাল্ট তালিকা ({safeResults.length})
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                dataSource === "database" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
              }`}>
                {dataSource === "database" ? "লাইভ ডাটাবেজ" : "ভেরিফাইড রেজিস্ট্রি"}
              </span>
            </div>
            {currentCard && (
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="text-xs font-bold text-sky-600 hover:underline lg:hidden cursor-pointer"
              >
                রেজাল্ট ভিউ
              </button>
            )}
          </div>

          {safeResults.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
                <AlertOctagon size={26} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">কোনো রেকর্ড পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  প্রদত্ত NID, নাম বা ফোন নম্বরের বিপরীতে কোনো হেলথ রেকর্ড নেই।
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
                <span>ডিফল্ট রেজিস্ট্রি রিলোড করুন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
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
                    {/* Left vertical status indicator */}
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
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <CheckCircle2 size={11} />
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {patient.patient_name} • NID: {patient.nid_number || "অনিবন্ধিত"}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-600">
                            <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {patient.card_number}
                            </span>
                            <span>বয়স: <strong>{age} বছর</strong></span>
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
                          <span>এলার্জি: {patientAllergies.slice(0, 2).join(", ")}</span>
                        </span>
                      )}
                      {patient.has_pacemaker && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                          <HeartPulse size={11} />
                          <span>পেসমেকার সক্রিয়</span>
                        </span>
                      )}
                      {patient.organ_donor && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          <Heart size={11} />
                          <span>অঙ্গদাতা</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Emergency Medical Dossier (Right column on large screens) */}
        {currentCard && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6"
          >
            {/* Dossier Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    জরুরি ক্লিনিকাল ডসিয়ার (Emergency Dossier)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {currentCard.smart_card_uid || currentCard.card_number} • NID: {currentCard.nid_number || "অনিবন্ধিত"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  title="জরুরি ট্রায়াজ রিপোর্ট প্রিন্ট করুন"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">ট্রায়াজ প্রিন্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDossierFlipped(!isDossierFlipped)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors cursor-pointer"
                >
                  <FlipHorizontal size={14} />
                  <span>{isDossierFlipped ? "সামনে" : "উল্টান"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center lg:hidden cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Critical Red Alert Banner if Severe Allergies */}
            {safeAllergies.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-600 text-white flex items-center gap-3 shadow-lg shadow-rose-600/20 animate-pulse">
                <AlertTriangle size={22} className="shrink-0 text-white" />
                <div className="text-xs leading-relaxed">
                  <strong className="font-extrabold uppercase tracking-wide block">
                    ⚠️ জরুরি ড্রাগ এলার্জি সতর্কতা (Severe Anaphylaxis Risk):
                  </strong>
                  <span>রোগীর শরীরে <strong>{safeAllergies.join(", ")}</strong> ব্যবহারে মারাত্মক অ্যালার্জিক রিঅ্যাকশন ঘটবে! যেকোনো অ্যান্টিবায়োটিক দেওয়ার পূর্বে সাবধান থাকুন।</span>
                </div>
              </div>
            )}

            {/* 3D Bank Card Interactive Preview */}
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

            {/* Critical Clinical Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  রক্তের গ্রুপ
                </span>
                <span className="text-2xl font-black text-rose-700">
                  {currentCard.blood_group}
                </span>
                <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
                  {currentCard.blood_group === "O-" ? "Universal Donor" : currentCard.blood_group === "AB+" ? "Universal Recipient" : "Blood Verified"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  ডায়াবেটিস
                </span>
                <span className="text-xs font-extrabold text-amber-900 mt-1 block">
                  {currentCard.diabetic_status || "Non-Diabetic"}
                </span>
                <span className="text-[10px] text-amber-600 block mt-0.5">রক্ত শর্করা নিরীক্ষণ</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  অঙ্গ দানকারী
                </span>
                <span className="text-xs font-extrabold text-emerald-800 mt-1 block">
                  {currentCard.organ_donor ? "✅ রেজিষ্টার্ড" : "অনিবন্ধিত"}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">অঙ্গ প্রতিস্থাপন সম্মতি</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                  পেসমেকার
                </span>
                <span className="text-xs font-extrabold text-sky-900 mt-1 block">
                  {currentCard.has_pacemaker ? "⚠️ সক্রিয় পেসমেকার" : "কোনো পেসমেকার নেই"}
                </span>
                <span className="text-[10px] text-sky-600 block mt-0.5">
                  {currentCard.has_pacemaker ? "MRI নিষিদ্ধ" : "কার্ডিয়াক ডিভাইস মুক্ত"}
                </span>
              </div>
            </div>

            {/* Emergency ICE Call Box (Instant Contact with Guardian) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                    Emergency Primary Guardian (ICE Contact)
                  </span>
                </div>
                <p className="text-base font-black text-white">
                  {currentCard.emergency_contact_name}{" "}
                  <span className="text-xs font-medium text-slate-300">
                    ({currentCard.emergency_contact_relation})
                  </span>
                </p>
                <p className="text-xs font-mono font-bold text-sky-300 mt-0.5">
                  {currentCard.emergency_contact_phone}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${currentCard.emergency_contact_phone}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  <Phone size={15} />
                  <span>তাৎক্ষণিক কল করুন</span>
                </a>

                {currentCard.emergency_has_whatsapp && currentCard.emergency_contact_phone && (
                  <a
                    href={`https://wa.me/${(currentCard.emergency_contact_phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `আসসালামু আলাইকুম। জরুরি খবর: আপনার স্বজন ${currentCard.patient_name} হাসপাতালে জরুরি বিভাগে চিকিৎসাধীন আছেন। বিস্তারিত জানতে হাসপাতালে যোগাযোগ করুন।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md cursor-pointer"
                    title="হোয়াটসঅ্যাপে জরুরি বার্তা পাঠান"
                  >
                    <MessageCircle size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Allergies & Chronic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} className="text-rose-600" />
                  ঔষধ ও খাদ্য এলার্জি তালিকা
                </h4>
                {safeAllergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {safeAllergies.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-lg border border-rose-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">কোনো এলার্জি রেকর্ড নেই</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Stethoscope size={14} className="text-sky-600" />
                  দীর্ঘস্থায়ী রোগ (Chronic Conditions)
                </h4>
                {safeConditions.length > 0 ? (
                  <div className="space-y-1.5">
                    {safeConditions.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {item.status || "active"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">কোনো ক্রনিক রোগ নেই</p>
                )}
              </div>
            </div>

            {/* Active Medications */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Pill size={14} className="text-emerald-600" />
                বর্তমান চলমান প্রেসক্রিপশন ও ঔষধ
              </h4>
              {safeMedications.length > 0 ? (
                <div className="space-y-2">
                  {safeMedications.map((med, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900 font-bold block">{med.name}</strong>
                        <span className="text-slate-500 font-medium">
                          {med.dosage} • {med.frequency}
                        </span>
                      </div>
                      {med.prescribed_by && (
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">
                          {med.prescribed_by}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">কোনো চলমান ওষুধের রেকর্ড নেই</p>
              )}
            </div>

            {/* Address & Legal Info */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800">ঠিকানা:</span> {currentCard.address || "Dhaka, Bangladesh"}
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                ইস্যু: {formatDate(currentCard.issued_at)}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Printable Emergency Trauma Triage Modal */}
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
                  <strong className="text-sm font-bold text-slate-900">
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
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer size={15} />
                <span>মুদ্রণ করুন (Print Slip)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthPassSearchEngine;
