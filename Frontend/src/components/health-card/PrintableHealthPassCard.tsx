"use client";

import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Printer, 
  RotateCw, 
  ShieldCheck, 
  Heart, 
  Phone, 
  AlertTriangle, 
  Pill, 
  QrCode, 
  Sparkles,
  Download,
  CheckCircle2,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfflineEmergencyProfile, encodeOfflineQRPayload } from "@/lib/healthpass-offline-qr";

interface PrintableHealthPassCardProps {
  profile: OfflineEmergencyProfile;
  language?: "en" | "bn";
}

export function PrintableHealthPassCard({
  profile,
  language = "bn"
}: PrintableHealthPassCardProps) {
  const isBn = language === "bn";
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const qrDataUrl = encodeOfflineQRPayload(profile);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm print:hidden">
        <div>
          <h2 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            {isBn ? "স্মার্ট হেলথপাস (জাতীয় ডিজিটাল হেলথ কার্ড)" : "Smart HealthPass (National Digital Health ID)"}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isBn 
              ? "CR80 স্ট্যান্ডার্ড পিভিসি কার্ড সাইজ (85.6mm × 53.98mm) • অফলাইন ইমার্জেন্সি কিউআর যুক্ত"
              : "Standard CR80 PVC ID Card Size • With Zero-Internet Offline Emergency QR"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Flip Card Toggle for Mobile */}
          <Button
            size="sm"
            variant="outline"
            className="sm:hidden text-xs"
            onClick={() => setActiveSide(prev => prev === "front" ? "back" : "front")}
          >
            <RotateCw className="h-3.5 w-3.5 mr-1" />
            {activeSide === "front" ? (isBn ? "পেছনের পাশ" : "View Back") : (isBn ? "সামনের পাশ" : "View Front")}
          </Button>

          {/* Print Button */}
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/20 text-xs"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-1.5" />
            {isBn ? "কার্ড প্রিন্ট করুন (A4 / PVC)" : "Print ID Card (A4 / PVC)"}
          </Button>
        </div>
      </div>

      {/* Cards Display Grid (Side-by-Side on Desktop, Toggle on Mobile, Clean Pair on Print) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
        
        {/* ===================== FRONT SIDE ===================== */}
        <div 
          className={`relative overflow-hidden rounded-2xl border-2 border-emerald-600/30 bg-gradient-to-br from-emerald-900 via-teal-950 to-neutral-950 text-white p-5 shadow-xl transition-all duration-300 min-h-[240px] flex flex-col justify-between ${
            activeSide === "front" ? "block" : "hidden md:flex"
          } print:block print:min-h-[220px] print:shadow-none print:border-neutral-400 print:text-black print:bg-white`}
          style={{ aspectRatio: "1.586 / 1" }}
        >
          {/* Holographic Watermark Simulation */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none print:hidden" />
          <div className="absolute right-4 top-4 text-emerald-400/20 text-4xl font-extrabold select-none print:hidden">
            DGHS
          </div>

          {/* Card Top Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5 print:border-neutral-300">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-xs shadow-sm">
                OX
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 print:text-emerald-700">
                  Government of Bangladesh
                </span>
                <h4 className="text-xs font-bold tracking-tight text-white print:text-black">
                  Oxpecker Smart HealthPass
                </h4>
              </div>
            </div>

            {/* Emergency Hotlines */}
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-200 print:text-black bg-emerald-950/60 print:bg-neutral-100 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Phone className="h-2.5 w-2.5 text-rose-400" />
              <span>999</span>
              <span className="text-emerald-500">•</span>
              <span>16263</span>
            </div>
          </div>

          {/* Middle Identity Section */}
          <div className="my-3 flex items-center justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 print:text-neutral-500">
                Citizen Identity & Health ID
              </span>
              <h3 className="text-base font-extrabold text-white print:text-black truncate">
                {profile.fullName}
              </h3>
              <p className="font-mono text-xs text-emerald-200 print:text-black font-semibold tracking-wider">
                {profile.healthId}
              </p>
              {profile.dateOfBirth && (
                <p className="text-[10px] text-neutral-300 print:text-neutral-600">
                  DOB: {profile.dateOfBirth}
                </p>
              )}
            </div>

            {/* Blood Group Badge (Prominent) */}
            <div className="shrink-0 flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-rose-600 to-rose-700 text-white px-3.5 py-2 shadow-md border border-rose-400/40 print:border-rose-700">
              <span className="text-[8px] uppercase font-bold tracking-wider opacity-90">Blood</span>
              <span className="text-xl font-black leading-tight tracking-tight">
                {profile.bloodGroup || "O+"}
              </span>
            </div>
          </div>

          {/* Bottom Alerts Section */}
          <div className="border-t border-emerald-500/20 pt-2 grid grid-cols-2 gap-2 text-[10px] print:border-neutral-300">
            <div>
              <span className="text-[8px] uppercase font-bold text-emerald-400 print:text-neutral-500">
                Known Allergies:
              </span>
              <p className="font-semibold text-rose-300 print:text-rose-700 truncate">
                {profile.knownAllergies.length > 0 ? profile.knownAllergies.join(", ") : "None Reported"}
              </p>
            </div>

            <div>
              <span className="text-[8px] uppercase font-bold text-emerald-400 print:text-neutral-500">
                Chronic Conditions:
              </span>
              <p className="font-semibold text-amber-300 print:text-amber-800 truncate">
                {profile.chronicDiseases.length > 0 ? profile.chronicDiseases.join(", ") : "No Chronic Conditions"}
              </p>
            </div>
          </div>
        </div>

        {/* ===================== BACK SIDE ===================== */}
        <div 
          className={`relative overflow-hidden rounded-2xl border-2 border-emerald-600/30 bg-gradient-to-br from-neutral-900 via-teal-950 to-emerald-950 text-white p-5 shadow-xl transition-all duration-300 min-h-[240px] flex flex-col justify-between ${
            activeSide === "back" ? "block" : "hidden md:flex"
          } print:block print:min-h-[220px] print:shadow-none print:border-neutral-400 print:text-black print:bg-white`}
          style={{ aspectRatio: "1.586 / 1" }}
        >
          {/* Top Label */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 print:border-neutral-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 print:text-emerald-700 flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" />
              {isBn ? "অফলাইন জরুরি ট্রায়াজ কোড" : "Offline Emergency Triage Record"}
            </span>
            {profile.organDonor && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                <Heart className="h-2.5 w-2.5 fill-rose-400" />
                Organ Donor
              </span>
            )}
          </div>

          {/* QR Code + Clinical Summary Grid */}
          <div className="my-2 flex items-center gap-4">
            {/* High-density QR code container */}
            <div className="shrink-0 p-2 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <QRCodeSVG
                value={qrDataUrl}
                size={94}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Emergency Clinical Summary */}
            <div className="flex-1 min-w-0 space-y-1.5 text-[10px]">
              <div>
                <span className="text-[8px] uppercase font-bold text-emerald-400 print:text-neutral-500">
                  Active Regular Medications:
                </span>
                <p className="font-medium text-neutral-200 print:text-black line-clamp-2">
                  {profile.currentMedications.length > 0 
                    ? profile.currentMedications.join(", ") 
                    : "None reported"}
                </p>
              </div>

              <div>
                <span className="text-[8px] uppercase font-bold text-emerald-400 print:text-neutral-500">
                  Emergency Guardian Contact:
                </span>
                <p className="font-bold text-emerald-300 print:text-emerald-800">
                  {profile.emergencyContactName ? `${profile.emergencyContactName}: ` : ""}
                  {profile.emergencyContact || "16263 (Shastho Batayon)"}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Footnote */}
          <div className="border-t border-emerald-500/20 pt-1.5 text-[9px] text-neutral-400 print:text-neutral-600 flex items-center justify-between">
            <span>
              {isBn ? "যেকোনো মোবাইল ক্যামেরা দিয়ে স্ক্যান করলেই তাৎক্ষণিক জরুরি হিস্ট্রি লোড হবে।" : "Scan with any smartphone camera for zero-internet emergency record."}
            </span>
            <span className="font-mono text-[8px] opacity-70">
              v1.0 • DGHS
            </span>
          </div>
        </div>
      </div>

      {/* Cutting Guides & Print Info (Visible only when Printing) */}
      <div className="hidden print:block text-center text-xs text-neutral-500 pt-4 border-t border-dashed border-neutral-300">
        <p>✂ কাটার নির্দেশিকা: কার্ডের দাগ বরাবর কেটে ল্যামিনেট করে ওয়ালেটে সংরক্ষণ করুন। Oxpecker AI • DGHS Interoperable E-Health System</p>
      </div>
    </div>
  );
}
