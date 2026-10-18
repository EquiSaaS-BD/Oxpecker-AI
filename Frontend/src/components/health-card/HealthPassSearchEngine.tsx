"use client";

import React, { useState, useMemo } from "react";
import {
  Search, CreditCard, Shield, AlertTriangle, Phone,
  Calendar, MapPin, Heart, Stethoscope, Pill,
  UserCheck, ExternalLink, RefreshCw, X, ArrowRight,
  Filter, CheckCircle2, ChevronRight, Activity, FlipHorizontal
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
  title = "HealthPass জরুরি মেডিকেল সার্চ ইঞ্জিন",
  subtitle = "NID, জন্ম তারিখ, ফোন নম্বর অথবা কার্ড নাম্বার দিয়ে তাৎক্ষণিক রোগীর ইমার্জেন্সি হিস্ট্রি অনুসন্ধান করুন",
}: Props) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "nid" | "dob" | "phone" | "card_no" | "name">("all");
  const [selectedCard, setSelectedCard] = useState<HealthPassCardType | null>(null);
  const [isDossierFlipped, setIsDossierFlipped] = useState(false);

  // Search Results
  const results = useMemo(() => {
    return searchHealthCards(query, filterType);
  }, [query, filterType]);

  const quickPills = [
    { label: "MD. RAFIQUL ISLAM", type: "name" as const, val: "Rafiq" },
    { label: "01712-345678", type: "phone" as const, val: "01712345678" },
    { label: "NID: 1995 2698", type: "nid" as const, val: "1995" },
    { label: "DOB: 1995-03-15", type: "dob" as const, val: "1995-03-15" },
    { label: "HP-2026-94821", type: "card_no" as const, val: "HP-2026" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-800/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide uppercase mb-3">
            <Shield size={13} className="text-sky-400" />
            <span>National Emergency Medical Registry Access • {portalRole.toUpperCase()}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
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
                placeholder="NID নম্বর, জন্ম তারিখ (YYYY-MM-DD), ফোন নম্বর, কার্ড আইডি বা নাম লিখুন..."
                className="w-full h-11 pl-10 pr-9 bg-white text-slate-900 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="h-11 px-3 bg-slate-800/90 text-white rounded-xl text-xs font-bold border border-white/20 focus:outline-none cursor-pointer"
              >
                <option value="all">সকল ফিল্ড (All)</option>
                <option value="nid">জাতীয় পরিচয়পত্র (NID)</option>
                <option value="dob">জন্ম তারিখ (DOB)</option>
                <option value="phone">মোবাইল নম্বর (Phone)</option>
                <option value="card_no">কার্ড নম্বর (Card No)</option>
                <option value="name">রোগীর নাম (Name)</option>
              </select>

              <button
                onClick={() => {}}
                className="h-11 px-5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                অনুসন্ধান
              </button>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">ডেমো টেস্ট:</span>
            {quickPills.map((pill) => (
              <button
                key={pill.label}
                onClick={() => {
                  setFilterType(pill.type);
                  setQuery(pill.val);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 border border-white/10 text-[11px] font-mono transition-colors"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Split View or Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Results List (Left column on large screens) */}
        <div className={`space-y-4 ${selectedCard ? "lg:col-span-5" : "lg:col-span-12"}`}>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                রেজাল্ট তালিকা ({results.length})
              </h3>
              {query && (
                <span className="text-xs text-slate-500">
                  ফিল্টার: <strong className="text-sky-600">{filterType.toUpperCase()}</strong>
                </span>
              )}
            </div>
            {selectedCard && (
              <button
                onClick={() => setSelectedCard(null)}
                className="text-xs font-bold text-sky-600 hover:underline lg:hidden"
              >
                রেজাল্ট ভিউ
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-800">কোনো HealthPass ম্যাচ করেনি</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                এনআইডি নম্বর, ফোন নম্বর, জন্ম তারিখ বা কার্ড নাম্বার সঠিক আছে কিনা পরীক্ষা করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((patient) => {
                const isSelected = selectedCard?.id === patient.id;
                const age = calculateAge(patient.date_of_birth);
                return (
                  <motion.div
                    key={patient.id}
                    layout
                    onClick={() => setSelectedCard(patient)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-sky-50/70 border-sky-400 shadow-md ring-2 ring-sky-500/20"
                        : "bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Avatar / Photo */}
                        <div className="w-12 h-14 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600 text-sm">
                          {patient.patient_image ? (
                            <img
                              src={patient.patient_image}
                              alt={patient.patient_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{patient.patient_name.slice(0, 2)}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-slate-900 truncate">
                              {patient.english_name || patient.patient_name}
                            </h4>
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <CheckCircle2 size={11} />
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {patient.patient_name}
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
                          ZIP: {patient.post_code || "1205"}
                        </span>
                      </div>
                    </div>

                    {/* Quick alert bar inside item */}
                    {patient.allergies.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                        <AlertTriangle size={12} className="shrink-0 text-rose-600" />
                        <span className="truncate">এলার্জি: {patient.allergies.join(", ")}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Emergency Medical Dossier (Right column on large screens) */}
        {selectedCard && (
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
                    ID: {selectedCard.smart_card_uid || selectedCard.card_number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDossierFlipped(!isDossierFlipped)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors"
                >
                  <FlipHorizontal size={14} />
                  <span>{isDossierFlipped ? "কার্ড সামনে" : "কার্ড উল্টান"}</span>
                </button>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

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
                      card={selectedCard}
                      profileImage={selectedCard.patient_image}
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
                      card={selectedCard}
                      onFlip={() => setIsDossierFlipped(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Critical Clinical Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  রক্তের গ্রুপ
                </span>
                <span className="text-xl font-black text-rose-700">
                  {selectedCard.blood_group}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  ডায়াবেটিস
                </span>
                <span className="text-xs font-extrabold text-amber-900 mt-1 block">
                  {selectedCard.diabetic_status || "Non-Diabetic"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  অঙ্গ দানকারী
                </span>
                <span className="text-xs font-extrabold text-emerald-800 mt-1 block">
                  {selectedCard.organ_donor ? "✅ রেজিষ্টার্ড" : "অনিবন্ধিত"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                  পেজমেকার
                </span>
                <span className="text-xs font-extrabold text-sky-900 mt-1 block">
                  {selectedCard.has_pacemaker ? "⚠️ সক্রিয় পেসমেকার" : "কোনো পেসমেকার নেই"}
                </span>
              </div>
            </div>

            {/* Emergency ICE Call Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 block mb-0.5">
                  Emergency Contact (ICE)
                </span>
                <p className="text-sm font-bold">
                  {selectedCard.emergency_contact_name} ({selectedCard.emergency_contact_relation})
                </p>
                <p className="text-xs font-mono text-slate-300">
                  {selectedCard.emergency_contact_phone}
                </p>
              </div>

              <a
                href={`tel:${selectedCard.emergency_contact_phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0"
              >
                <Phone size={14} />
                <span>তাৎক্ষণিক কল করুন</span>
              </a>
            </div>

            {/* Allergies & Chronic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} className="text-rose-600" />
                  ঔষধ ও খাদ্য এলার্জি
                </h4>
                {selectedCard.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCard.allergies.map((item) => (
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
                  দীর্ঘস্থায়ী রোগ (Chronic)
                </h4>
                {selectedCard.chronic_conditions.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedCard.chronic_conditions.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {item.status}
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
              <div className="space-y-2">
                {selectedCard.current_medications.map((med, i) => (
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
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
export default HealthPassSearchEngine;
