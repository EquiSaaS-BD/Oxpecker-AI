"use client";

import React, { Suspense } from "react";
import { CreditCard, Building2, ShieldAlert, HeartHandshake } from "lucide-react";
import { HealthPassSearchEngine } from "@/components/health-card/HealthPassSearchEngine";
import { MedicalLoader } from "@/components/shared/MedicalLoader";

function HospitalHealthPassContent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Emergency Triage & HealthPass
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              জরুরি ভর্তি ও ট্রায়াজের সময় রোগীর NID, জন্ম তারিখ, মোবাইল নম্বর বা কার্ড আইডি স্ক্যান করে তাৎক্ষণিক তথ্য পান
            </p>
          </div>
        </div>
      </div>

      <HealthPassSearchEngine
        portalRole="hospital"
        title="Hospital Emergency Admission Search"
        subtitle="হাসপাতাল ইমার্জেন্সি ডেস্ক ও ট্রায়াজ কাউন্টার থেকে রোগীর জীবন রক্ষাকারী রক্তের গ্রুপ, এলার্জি ও জরুরি কন্টাক্ট অ্যাক্সেস করুন"
      />
    </div>
  );
}

export default function HospitalHealthPassPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><MedicalLoader text="লোড হচ্ছে..." /></div>}>
      <HospitalHealthPassContent />
    </Suspense>
  );
}
