"use client";

import React, { Suspense } from "react";
import { CreditCard, Stethoscope, ShieldCheck, HeartPulse } from "lucide-react";
import { HealthPassSearchEngine } from "@/components/health-card/HealthPassSearchEngine";
import { MedicalLoader } from "@/components/shared/MedicalLoader";

function DoctorHealthPassContent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Emergency HealthPass Portal
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              রোগীর NID, ফোন নম্বর, জন্ম তারিখ বা কার্ড আইডি দিয়ে জরুরি ক্লিনিক্যাল হিস্ট্রি ও এলার্জি চেক করুন
            </p>
          </div>
        </div>
      </div>

      <HealthPassSearchEngine
        portalRole="doctor"
        title="Doctor Clinical Emergency Lookup"
        subtitle="প্রেসক্রিপশন লেখার পূর্বে অথবা জরুরি বিভাগে রোগীর এনআইডি, ফোন বা জন্মতারিখ দিয়ে তাৎক্ষণিক কার্ড ডসিয়ার চেক করুন"
      />
    </div>
  );
}

export default function DoctorHealthPassPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><MedicalLoader text="লোড হচ্ছে..." /></div>}>
      <DoctorHealthPassContent />
    </Suspense>
  );
}
