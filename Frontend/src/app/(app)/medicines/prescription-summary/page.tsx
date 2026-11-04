"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PrescriptionIntelligenceWorkspace } from "@/components/prescription/PrescriptionIntelligenceWorkspace";

function PrescriptionSummaryContent() {
  const searchParams = useSearchParams();
  const prescriptionId = searchParams.get("id");

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 px-4 md:px-8 pb-28">
      <div className="max-w-[1280px] mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/medicines"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 font-bold text-xs sm:text-sm shadow-2xs transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back to Centralized Medicine Directory</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Verified DGDA / MedEx National Price Engine (21,714 Records)</span>
          </div>
        </div>

        <PrescriptionIntelligenceWorkspace
          initialPrescriptionId={prescriptionId}
          defaultExpanded={true}
        />
      </div>
    </div>
  );
}

export default function PrescriptionSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8 text-sm font-bold text-slate-600">
          Loading Prescription Intelligence Summary...
        </div>
      }
    >
      <PrescriptionSummaryContent />
    </Suspense>
  );
}
