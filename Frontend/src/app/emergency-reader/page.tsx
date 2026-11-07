"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Phone, 
  AlertTriangle, 
  ArrowLeft,
  QrCode,
  Heart,
  Pill,
  User,
  Calendar
} from "lucide-react";
import { decodeOfflineQRPayload, OfflineEmergencyProfile } from "@/lib/healthpass-offline-qr";
import { Button } from "@/components/ui/button";

export default function EmergencyReaderPage() {
  const [profile, setProfile] = useState<OfflineEmergencyProfile | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Check URL fragment hash on mount (e.g. /emergency-reader#data=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && hash.includes("data=")) {
        const decoded = decodeOfflineQRPayload(hash);
        if (decoded) {
          setProfile(decoded);
          setError(null);
        } else {
          setError("QR কোডের ডাটা পড়া যায়নি। কোডটি পুনরায় স্ক্যান করুন।");
        }
      } else {
        // Default clean demo patient for preview
        setProfile({
          version: 1,
          healthId: "HP-880-94218",
          fullName: "মো: রফিকুল ইসলাম (Md. Rafiqul Islam)",
          bloodGroup: "B+",
          dateOfBirth: "1984-05-12",
          emergencyContact: "+8801712345678",
          emergencyContactName: "স্ত্রী (নাসরিন আক্তার)",
          knownAllergies: ["Penicillin (পেনিসিলিন)", "Sulfa Drugs"],
          chronicDiseases: ["Type-2 Diabetes", "Hypertension (উচ্চ রক্তচাপ)"],
          currentMedications: ["Metformin 500mg", "Losartan 50mg"],
          organDonor: true
        });
      }
    }
  }, []);

  const handleManualDecode = () => {
    if (!manualInput.trim()) return;
    const decoded = decodeOfflineQRPayload(manualInput.trim());
    if (decoded) {
      setProfile(decoded);
      setError(null);
    } else {
      setError("সঠিক QR কোড ডাটা পাওয়া যায়নি।");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Simple Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <Link 
            href="/health-card" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            পূর্বের পেজে ফিরুন
          </Link>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            DGHS Emergency Triage Mode
          </span>
        </div>

        {/* Clean Professional Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                জরুরি চিকিৎসা তথ্য (Emergency Medical Record)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                জরুরি পরিস্থিতিতে ইন্টারনেট ছাড়াই কিউআর কার্ড থেকে সংগৃহীত সরাসরি তথ্য।
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">জরুরি সেবা</span>
              <span className="text-xs font-bold text-rose-600">999 • 16263</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Patient Profile Card (Minimal & High Contrast) */}
        {profile && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
            
            {/* Primary Details Row */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">রোগীর নাম</span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {profile.fullName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                  <span>ID: {profile.healthId}</span>
                  {profile.dateOfBirth && <span>• জন্ম: {profile.dateOfBirth}</span>}
                </div>
              </div>

              {/* Clean Blood Group Pill */}
              <div className="text-center bg-rose-50 border border-rose-200 rounded-lg px-4 py-2 shrink-0">
                <span className="text-[10px] uppercase font-bold text-rose-600 block">রক্তের গ্রুপ</span>
                <span className="text-2xl font-black text-rose-700 leading-tight">
                  {profile.bloodGroup}
                </span>
              </div>
            </div>

            {/* Critical Allergies Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                ড্রাগ অ্যালার্জি (Known Drug Allergies)
              </span>
              <p className="text-xs font-medium text-slate-800">
                {profile.knownAllergies.length > 0 
                  ? profile.knownAllergies.join(", ") 
                  : "কোনো জানা ড্রাগ অ্যালার্জি নেই"}
              </p>
            </div>

            {/* Chronic Conditions & Active Meds Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-slate-500" />
                  দীর্ঘস্থায়ী রোগ (Chronic Conditions)
                </span>
                <p className="text-xs text-slate-600">
                  {profile.chronicDiseases.length > 0 
                    ? profile.chronicDiseases.join(", ") 
                    : "কোনো ক্রনিক রোগ নেই"}
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 space-y-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5 text-slate-500" />
                  নিয়মিত ওষুধ (Current Medications)
                </span>
                <p className="text-xs text-slate-600">
                  {profile.currentMedications.length > 0 
                    ? profile.currentMedications.join(", ") 
                    : "কোনো নিয়মিত ওষুধ নেই"}
                </p>
              </div>
            </div>

            {/* Emergency Contact & Calling Action */}
            <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">জরুরি অভিভাবকের নম্বর</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.emergencyContactName ? `${profile.emergencyContactName}: ` : ""}
                  {profile.emergencyContact || "16263"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {profile.emergencyContact && (
                  <a href={`tel:${profile.emergencyContact}`}>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8">
                      <Phone className="h-3 w-3 mr-1" />
                      কল করুন
                    </Button>
                  </a>
                )}
                <a href="tel:999">
                  <Button size="sm" variant="outline" className="text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50">
                    ৯৯৯ ইমার্জেন্সি
                  </Button>
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Minimal Manual Decoder Input */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <span className="text-xs font-medium text-slate-500">
            ম্যানুয়ালি QR কোড লিংক বা ডাটা পেস্ট করুন:
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="https://...#data=..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            />
            <Button size="sm" onClick={handleManualDecode} variant="outline" className="text-xs h-8">
              ডিকোড
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
