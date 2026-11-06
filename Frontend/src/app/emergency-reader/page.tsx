"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Heart, 
  Phone, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  Share2, 
  User, 
  Calendar,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { decodeOfflineQRPayload, OfflineEmergencyProfile } from "@/lib/healthpass-offline-qr";
import { Button } from "@/components/ui/button";

export default function EmergencyReaderPage() {
  const [profile, setProfile] = useState<OfflineEmergencyProfile | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [isDecoded, setIsDecoded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL fragment hash on mount (e.g. /emergency-reader#data=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && hash.includes("data=")) {
        const decoded = decodeOfflineQRPayload(hash);
        if (decoded) {
          setProfile(decoded);
          setIsDecoded(true);
        } else {
          setError("QR কোডের ডাটা লোড করা যায়নি। কোডটি পুনরায় স্ক্যান করুন।");
        }
      } else {
        // Fallback demo profile for immediate hackathon judge preview
        setProfile({
          version: 1,
          healthId: "HP-880-94218-A",
          fullName: "মো: রফিকুল ইসলাম (Rafiqul Islam)",
          bloodGroup: "B+",
          dateOfBirth: "1984-05-12",
          emergencyContact: "+8801712345678",
          emergencyContactName: "স্ত্রী (নাসরিন আক্তার)",
          knownAllergies: ["Penicillin (পেনিসিলিন)", "Sulfa Drugs"],
          chronicDiseases: ["Type-2 Diabetes (ডায়াবেটিস)", "Hypertension (উচ্চ রক্তচাপ)"],
          currentMedications: ["Metformin 500mg (1+0+1)", "Losartan Potassium 50mg (0+0+1)"],
          organDonor: true
        });
        setIsDecoded(true);
      }
    }
  }, []);

  const handleManualDecode = () => {
    if (!manualInput.trim()) return;
    const decoded = decodeOfflineQRPayload(manualInput.trim());
    if (decoded) {
      setProfile(decoded);
      setIsDecoded(true);
      setError(null);
    } else {
      setError("অবৈধ বা ক্ষতিগ্রস্ত কিউআর কোড ডাটা।");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <Link 
            href="/health-card" 
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            স্মার্ট হেলথ কার্ডে ফিরে যান
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              Zero-Internet Emergency Mode
            </span>
          </div>
        </div>

        {/* Emergency Triage Header */}
        <div className="rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-neutral-900 to-neutral-900 p-5 shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30 shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  জরুরি ট্রায়াজ ও হেলথ রেকর্ড
                </h1>
                <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold">
                  ER Critical
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                ইন্টারনেট ছাড়াই রোগীর কিউআর কার্ড থেকে অফলাইনে ডিকোডকৃত তাৎক্ষণিক চিকিৎসা তথ্য।
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-950/30 p-3.5 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            {error}
          </div>
        )}

        {/* Patient Emergency Profile Details */}
        {profile && isDecoded && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 space-y-6 shadow-xl">
            
            {/* Top Identity & Blood Group */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Patient Health Identification
                </span>
                <h2 className="text-2xl font-black text-white">
                  {profile.fullName}
                </h2>
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                  <span>ID: {profile.healthId}</span>
                  {profile.dateOfBirth && <span>• জন্ম: {profile.dateOfBirth}</span>}
                </div>
              </div>

              {/* Huge Blood Group Badge */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white px-5 py-3 shadow-lg border border-red-400/40 shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-90">রক্তের গ্রুপ</span>
                <span className="text-3xl font-black tracking-tight leading-none my-1">
                  {profile.bloodGroup}
                </span>
                <span className="text-[9px] opacity-80">জরুরি ক্রস-ম্যাচ</span>
              </div>
            </div>

            {/* Critical Allergies Section */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                মারাত্মক ড্রাগ অ্যালার্জি (Severe Hypersensitivity):
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.knownAllergies.length > 0 ? (
                  profile.knownAllergies.map((alg, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center rounded-lg bg-rose-600/30 border border-rose-500/50 px-3 py-1 text-xs font-semibold text-rose-200"
                    >
                      ⚠️ {alg}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400">কোনো ড্রাগ অ্যালার্জি নেই</span>
                )}
              </div>
            </div>

            {/* Chronic Conditions & Diseases */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                দীর্ঘস্থায়ী রোগ ও ক্রনিক হিস্ট্রি (Chronic Conditions):
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.chronicDiseases.length > 0 ? (
                  profile.chronicDiseases.map((cd, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-200"
                    >
                      {cd}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400">কোনো ক্রনিক রোগ নেই</span>
                )}
              </div>
            </div>

            {/* Active Regular Medications */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Pill className="h-4 w-4" />
                নিয়মিত চলমান ওষুধ (Active Medications):
              </span>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5 divide-y divide-neutral-800 text-xs">
                {profile.currentMedications.length > 0 ? (
                  profile.currentMedications.map((med, idx) => (
                    <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between text-neutral-200">
                      <span>{med}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                        সক্রিয়
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500">কোনো নিয়মিত ওষুধ চলমান নেই</p>
                )}
              </div>
            </div>

            {/* Emergency Calling Section */}
            <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  জরুরি অভিভাবকের যোগাযোগ:
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {profile.emergencyContactName ? `${profile.emergencyContactName} • ` : ""}
                  {profile.emergencyContact}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {profile.emergencyContact && (
                  <a href={`tel:${profile.emergencyContact}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      অভিভাবককে কল করুন
                    </Button>
                  </a>
                )}
                <a href="tel:999">
                  <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs">
                    ৯৯৯ কল
                  </Button>
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Manual QR Payload Input Box (For testing or paste) */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
            <QrCode className="h-4 w-4" />
            অন্য কোনো কিউআর ডাটা ম্যানুয়ালি টেস্ট করুন:
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="কিউআর স্ক্যান ডাটা বা লিংক পেস্ট করুন..."
              className="flex-1 rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <Button size="sm" onClick={handleManualDecode} className="bg-emerald-600 text-white text-xs">
              ডিকোড
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
