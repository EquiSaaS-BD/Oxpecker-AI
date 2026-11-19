"use client";

import Link from "next/link";
import { Toaster } from "sonner";
import { ArrowRight, Building2, CheckCircle2, QrCode, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { ReportAnalyzerStudio } from "@/components/reports/ReportAnalyzerStudio";

export default function JudgeDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-10">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 60-Second Judge Demo Banner */}
        <header className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-black uppercase tracking-wider">
                Oxpecker AI • 60-Second Interactive Judge Demo
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Seeded Health ID: HP-2026-8841 (Rahim Uddin)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              রিপোর্ট বুঝিয়ে দেওয়া + সঠিক ডাক্তারের কাছে পৌঁছে দেওয়া (B2B + B2C SaaS)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Step 1: Click <strong>&ldquo;১-ক্লিক ডেমো ল্যাব রিপোর্ট বিশ্লেষণ&rdquo;</strong> below &bull; Step 2: Inspect deterministic flags (স্বাভাবিক / কম / বেশি), &ldquo;কেন এই ফলাফল&rdquo;, Bengali explanation &amp; HbA1c trend &bull; Step 3: Tap <strong>&ldquo;কোন ডাক্তার দেখাবেন&rdquo;</strong> &bull; Step 4: Inspect Health ID Timeline &amp; B2B SaaS Portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 shrink-0">
            <Link
              href="/patient/profile?mrn=HP-2026-8841"
              className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Health ID Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/doctors?specialty=Endocrinology"
              className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
            >
              <span className="inline-flex items-center gap-1.5"><Stethoscope className="w-4 h-4" /> কোন ডাক্তার দেখাবেন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/hospital/dashboard/integrations"
              className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold"
            >
              <span className="inline-flex items-center gap-1.5"><Building2 className="w-4 h-4 text-teal-600" /> Clinic B2B SaaS Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Live Neurapex-Style Lab Analyzer + Trend + Doctor Verification */}
        <ReportAnalyzerStudio defaultHealthCardNumber="HP-2026-8841" autoRunSample />

        {/* Safety & Architecture Proof Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-slate-900">Zero LLM Flag Guessing</p>
              <p className="text-slate-600 mt-0.5">Reference range comparisons run in pure deterministic TypeScript with printed-range precedence and red-flag override.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
            <Users className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-slate-900">166+ Verified Bangladesh Doctors</p>
              <p className="text-slate-600 mt-0.5">Every abnormal parameter maps straight to Endocrinology, Cardiology, Nephrology, Hepatology, Medicine, or Dermatology.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-slate-900">B2B Multi-Tenant SaaS Ready</p>
              <p className="text-slate-600 mt-0.5">Workspace quotas, bKash/Nagad/SSLCommerz sandbox billing, clinic consent uploads, webhooks, and OpenAPI 3.1 docs.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
