"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileSearch,
  FlaskConical,
  HeartPulse,
  History,
  Link2,
  Printer,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import { MANDATORY_BENGALI_DISCLAIMER } from "@/lib/ai-safety-guard";
import {
  type AnalyzedReportRecord,
  type ParameterTrendSeries,
} from "@/lib/lab-report-engine";

interface ReportAnalyzerStudioProps {
  defaultHealthCardNumber?: string;
  autoRunSample?: boolean;
}

export function ReportAnalyzerStudio({
  defaultHealthCardNumber = "HP-2026-8841",
  autoRunSample = false,
}: ReportAnalyzerStudioProps) {
  const [mode, setMode] = useState<"lab" | "radiology" | "skin">("lab");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [patientAge, setPatientAge] = useState("38");
  const [patientGender, setPatientGender] = useState<"male" | "female">("male");
  const [emergencySymptom, setEmergencySymptom] = useState("");
  const [consentToSave, setConsentToSave] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [reports, setReports] = useState<AnalyzedReportRecord[]>([]);
  const [activeReport, setActiveReport] = useState<AnalyzedReportRecord | null>(null);
  const [trends, setTrends] = useState<ParameterTrendSeries[]>([]);
  const [sampleText, setSampleText] = useState("");
  const [sharedExpiresAt, setSharedExpiresAt] = useState<string | null>(null);

  // Doctor review state
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [doctorNameInput, setDoctorNameInput] = useState("Prof. Dr. Ahmed Rahman");
  const [doctorBmdcInput, setDoctorBmdcInput] = useState("BMDC-A-41892");
  const [doctorNoteInput, setDoctorNoteInput] = useState(
    "রিপোর্টটি ক্লিনিক্যালভাবে পর্যালোচনা করা হয়েছে; নির্ধারিত বিশেষজ্ঞের সাথে ফলোআপ করুন।"
  );
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [showEditHistory, setShowEditHistory] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("shareToken");
      if (token) {
        const res = await fetch(`/api/reports/analyze?shareToken=${encodeURIComponent(token)}`);
        if (res.ok) {
          const data = await res.json();
          setActiveReport(data.sharedReport);
          setSharedExpiresAt(data.expiresAt);
          return;
        }
      }

      const res = await fetch("/api/reports/analyze", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setTrends(data.trends || []);
        setSampleText(data.sampleLabText || "");
        if (!activeReport && Array.isArray(data.reports) && data.reports.length > 0) {
          setActiveReport(data.reports[0]);
        }
      }
    } catch {
      // keep safe UI state
    }
  }, [activeReport]);

  useEffect(() => {
    void loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAnalysis = useCallback(
    async (overrideText?: string, overrideMode?: "lab" | "radiology" | "skin") => {
      const targetMode = overrideMode || mode;
      const textToSend = (overrideText ?? rawText).trim();
      if (!file && !textToSend) {
        toast.error("রিপোর্টের ছবি/PDF আপলোড করুন অথবা টেক্সট দিন।");
        return;
      }

      setSubmitting(true);
      setShareUrl(null);
      try {
        let res: Response;
        if (file) {
          const form = new FormData();
          form.append("file", file);
          form.append("mode", targetMode);
          form.append("rawText", textToSend);
          form.append("patientAge", patientAge);
          form.append("patientGender", patientGender);
          form.append("symptoms", emergencySymptom);
          form.append("consentToSave", String(consentToSave));
          form.append("healthCardNumber", defaultHealthCardNumber);
          res = await fetch("/api/reports/analyze", { method: "POST", body: form });
        } else {
          res = await fetch("/api/reports/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: targetMode,
              rawText: textToSend,
              patientAge: parseInt(patientAge, 10) || 38,
              patientGender,
              symptoms: emergencySymptom ? [emergencySymptom] : [],
              consentToSave,
              healthCardNumber: defaultHealthCardNumber,
            }),
          });
        }

        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.error || "বিশ্লেষণ সম্পন্ন করা যায়নি।");
          return;
        }

        setActiveReport(data.report);
        setTrends(data.trends || []);
        setReports((prev) => [data.report, ...prev]);
        toast.success(
          consentToSave
            ? "রিপোর্ট বিশ্লেষণ সম্পন্ন এবং Health ID টাইমলাইনে সংরক্ষিত হয়েছে!"
            : "রিপোর্ট বিশ্লেষণ সম্পন্ন (শুধুমাত্র ব্যক্তিগত সেশনে প্রদর্শিত)।"
        );
      } catch {
        toast.error("নেটওয়ার্ক সমস্যার কারণে বিশ্লেষণ ব্যর্থ হয়েছে।");
      } finally {
        setSubmitting(false);
      }
    },
    [consentToSave, defaultHealthCardNumber, emergencySymptom, file, mode, patientAge, patientGender, rawText]
  );

  useEffect(() => {
    if (autoRunSample && sampleText && !rawText) {
      setRawText(sampleText);
    }
  }, [autoRunSample, rawText, sampleText]);

  const handleLoadSample = async () => {
    setMode("lab");
    const sample =
      sampleText ||
      `Hemoglobin (Hb): 11.4 g/dL (13.5 - 17.5)\nHbA1c: 7.4 % (4.0 - 5.6)\nFasting Blood Glucose (FBS): 148 mg/dL (70 - 99)\nLDL Cholesterol: 138 mg/dL (50 - 100)\nSerum Creatinine: 1.15 mg/dL (0.7 - 1.3)\nTSH: 5.2 mIU/L (0.4 - 4.5)`;
    setRawText(sample);
    setFile(null);
    await submitAnalysis(sample, "lab");
  };

  const handleDoctorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;
    try {
      const res = await fetch("/api/reports/analyze", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "doctor_verify",
          reportId: activeReport.id,
          doctorName: doctorNameInput,
          bmdcRegNo: doctorBmdcInput,
          noteBn: doctorNoteInput,
          demoVerification: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "ডাক্তার যাচাইকরণ ব্যর্থ হয়েছে।");
        return;
      }
      setActiveReport(data.report);
      setReports((prev) => prev.map((r) => (r.id === data.report.id ? data.report : r)));
      setShowVerifyForm(false);
      toast.success("ডাক্তার যাচাইকরণ ব্যাজ যুক্ত হয়েছে!");
    } catch {
      toast.error("যাচাইকরণ আপডেট করা যায়নি।");
    }
  };

  const handleCreateShareLink = async () => {
    if (!activeReport) return;
    try {
      const res = await fetch("/api/reports/analyze", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_share_link", reportId: activeReport.id, ttlHours: 24 }),
      });
      const data = await res.json();
      if (res.ok && data.shareUrl) {
        const full = `${window.location.origin}${data.shareUrl}`;
        setShareUrl(full);
        await navigator.clipboard?.writeText(full).catch(() => {});
        toast.success("২৪ ঘণ্টার এক্সপায়ারিং শেয়ার লিংক তৈরি ও কপি হয়েছে!");
      }
    } catch {
      toast.error("শেয়ার লিংক তৈরি করা যায়নি।");
    }
  };

  const handleExportReport = () => {
    if (!activeReport) return;
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oxpecker-report-${activeReport.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("রিপোর্ট ডেটা JSON হিসেবে ডাউনলোড হয়েছে।");
  };

  const handleDeleteActiveReport = async () => {
    if (!activeReport) return;
    const res = await fetch("/api/reports/analyze", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_report", reportId: activeReport.id }),
    });
    if (res.ok) {
      const next = reports.filter((r) => r.id !== activeReport.id);
      setReports(next);
      setActiveReport(next[0] || null);
      toast.success("রিপোর্টটি আপনার অ্যাকাউন্ট থেকে মুছে ফেলা হয়েছে।");
    }
  };

  const urgencyStyles = (u: AnalyzedReportRecord["urgency"]) => {
    if (u === "দ্রুত ডাক্তার দেখান") {
      return "bg-rose-50 text-rose-800 border-rose-300";
    }
    if (u === "ডাক্তার দেখান") {
      return "bg-amber-50 text-amber-800 border-amber-300";
    }
    return "bg-emerald-50 text-emerald-800 border-emerald-300";
  };

  const flagStyles = (color: "green" | "amber" | "red") => {
    if (color === "red") return "bg-rose-100 text-rose-800 border-rose-300";
    if (color === "amber") return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-emerald-100 text-emerald-800 border-emerald-300";
  };

  return (
    <section className="mb-10 space-y-6">
      {/* Studio Upload + Mode Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-5 py-5 sm:px-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-[11px] font-black uppercase tracking-wider">
                Neurapex-Style Deterministic Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold">
                Health ID: {defaultHealthCardNumber}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-teal-300 shrink-0" />
              রিপোর্ট বুঝিয়ে দেওয়া + সঠিক ডাক্তারের কাছে পৌঁছে দেওয়া
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              বাংলা-সহজ ল্যাব রিপোর্ট বিশ্লেষণ, রেফারেন্স রেঞ্জ যাচাই (Code-Controlled), এক্স-রে/এমআরআই টেক্সট ব্যাখ্যা ও ট্রেন্ড চার্ট।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-slate-950 text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {submitting ? "বিশ্লেষণ চলছে..." : "১-ক্লিক ডেমো ল্যাব রিপোর্ট বিশ্লেষণ"}
            </button>
          </div>
        </div>

        {/* Accessible 3-Mode Tablist */}
        <div
          role="tablist"
          aria-label="Report Analyzer Modes"
          className="flex flex-nowrap overflow-x-auto border-b border-slate-200 px-4 sm:px-6 gap-1 bg-slate-50/70"
        >
          {[
            { id: "lab", label: "ল্যাব রিপোর্ট (Blood / CBC / Organ)" },
            { id: "radiology", label: "রেডিওলজি / X-Ray / MRI টেক্সট" },
            { id: "skin", label: "ত্বকের ছবি (Skin Photo Guidance)" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => setMode(t.id as "lab" | "radiology" | "skin")}
              className={`flex-none px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                mode === t.id
                  ? "border-teal-600 text-teal-800 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitAnalysis();
          }}
          className="p-5 sm:p-6 space-y-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="analyzer-text" className="text-xs font-bold text-slate-700">
                  {mode === "lab"
                    ? "রিপোর্টের মান / OCR টেক্সট (ইংরেজি বা বাংলা সংখ্যা সমর্থিত)"
                    : mode === "radiology"
                      ? "এক্স-রে / সিটি / এমআরআই / আল্ট্রাসাউন্ড রিপোর্টের লেখা পেস্ট করুন (ছবি নয়)"
                      : "ত্বকের দৃশ্যমান পরিবর্তনের সংক্ষিপ্ত বিবরণ (কবে শুরু হয়েছে, চুলকানি/জ্বালা আছে কিনা)"}
                </label>
                <label
                  htmlFor="analyzer-file-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  {file ? file.name : "ছবি / PDF আপলোড করুন"}
                </label>
                <input
                  id="analyzer-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
              </div>

              <textarea
                id="analyzer-text"
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  mode === "lab"
                    ? "উদাহরণ: Hemoglobin: 11.4 g/dL (13.5 - 17.5)\nHbA1c: 7.4%\nCreatinine: 1.2 mg/dL"
                    : mode === "radiology"
                      ? "উদাহরণ: Mild hepatomegaly with Grade I fatty infiltration of liver. No focal mass."
                      : "ত্বকের ছবি আপলোড করুন এবং কত দিন ধরে লালচে ভাব বা র‍্যাশ আছে তা লিখুন..."
                }
                className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="lg:col-span-4 space-y-3 bg-slate-50/80 rounded-2xl border border-slate-200 p-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="patient-age-input" className="block text-[11px] font-bold text-slate-600 mb-1">
                    বয়স (Age)
                  </label>
                  <input
                    id="patient-age-input"
                    type="text"
                    inputMode="numeric"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="patient-gender-select" className="block text-[11px] font-bold text-slate-600 mb-1">
                    লিঙ্গ (Sex)
                  </label>
                  <select
                    id="patient-gender-select"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as "male" | "female")}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  >
                    <option value="male">পুরুষ (Male)</option>
                    <option value="female">মহিলা (Female)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="symptom-flag-select" className="block text-[11px] font-bold text-slate-600 mb-1">
                  কোনো জরুরি উপসর্গ আছে? (Red-Flag Check)
                </label>
                <select
                  id="symptom-flag-select"
                  value={emergencySymptom}
                  onChange={(e) => setEmergencySymptom(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                >
                  <option value="">না — কোনো তীব্র জরুরি উপসর্গ নেই</option>
                  <option value="বুকে ব্যথা ও চাপ">বুকে ব্যথা ও চাপ (Chest Pain)</option>
                  <option value="তীব্র শ্বাসকষ্ট">তীব্র শ্বাসকষ্ট (Severe Breathing Trouble)</option>
                  <option value="মুখ বেঁকে যাওয়া ও কথা জড়িয়ে যাওয়া">স্ট্রোকের লক্ষণ (Face/Speech)</option>
                  <option value="অজ্ঞান হয়ে যাওয়া">অজ্ঞান হয়ে যাওয়া (Unconsciousness)</option>
                </select>
              </div>

              <label className="flex items-start gap-2 text-[11px] text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentToSave}
                  onChange={(e) => setConsentToSave(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600"
                />
                <span>
                  সম্মতি (Consent): বিশ্লেষণটি ব্যক্তিগত <strong>Health ID ({defaultHealthCardNumber})</strong> টাইমলাইনে সংরক্ষণ করুন।
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileSearch className="w-4 h-4" />
                {submitting ? "প্রক্রিয়া চলছে..." : "বিশ্লেষণ শুরু করুন"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Shared Link Expiry Banner */}
      {sharedExpiresAt && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-bold text-sky-900 flex items-center justify-between gap-2">
          <span>এক্সপায়ারিং শেয়ার লিংকের মাধ্যমে রিপোর্ট দেখা হচ্ছে (Read-Only)।</span>
          <span className="font-mono">মেয়াদ শেষ: {new Date(sharedExpiresAt).toLocaleString()}</span>
        </div>
      )}

      {/* Active One-Page Analysis Summary */}
      {activeReport && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6 print:border-0">
          {/* 1. Red-Flag Emergency Override Banner FIRST */}
          {activeReport.redFlag?.isEmergency && (
            <div
              role="alert"
              className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-black text-rose-900">
                    {activeReport.redFlag.bannerTitleBn}
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-800 mt-1">
                    {activeReport.redFlag.emergencyInstructionBn}
                  </p>
                </div>
              </div>
              <a
                href="tel:999"
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black text-center shrink-0"
              >
                ৯৯৯-এ কল করুন
              </a>
            </div>
          )}

          {/* 2. Header Bar: Title, Urgency Badge, Doctor Verified Badge & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${urgencyStyles(activeReport.urgency)}`}>
                  জরুরিত্ব: {activeReport.urgency}
                </span>

                {activeReport.doctorVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                    <BadgeCheck className="w-4 h-4" />
                    ডাক্তার যাচাই করেছেন ({activeReport.verifiedByDoctorName})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    AI প্রাথমিক বিশ্লেষণ (ডাক্তার যাচাই অপেক্ষমাণ)
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900">{activeReport.title}</h3>
              <p className="text-xs text-slate-500">
                {activeReport.laboratory} • তারিখ: {activeReport.reportDate} • বয়স: {activeReport.patientAge || "N/A"} বছর
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVerifyForm((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold cursor-pointer"
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                {activeReport.doctorVerified ? "ডাক্তার নোট সম্পাদনা" : "ডাক্তার যাচাই করুন"}
              </button>
              <button
                type="button"
                onClick={handleCreateShareLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                ২৪ ঘণ্টা শেয়ার লিংক
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                PDF প্রিন্ট
              </button>
              <button
                type="button"
                onClick={handleExportReport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                এক্সপোর্ট
              </button>
              <button
                type="button"
                onClick={handleDeleteActiveReport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                মুছুন
              </button>
            </div>
          </div>

          {shareUrl && (
            <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-teal-900">এক্সপায়ারিং শেয়ার লিংক (২৪ ঘণ্টা):</span>
              <a href={shareUrl} className="font-mono text-teal-700 underline break-all">
                {shareUrl}
              </a>
            </div>
          )}

          {/* Doctor Review Loop Form */}
          {showVerifyForm && (
            <form
              onSubmit={handleDoctorVerify}
              className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 space-y-3"
            >
              <p className="text-xs font-black text-teal-900">
                নিবন্ধিত ডাক্তার রিভিউ লুপ (মূল AI আউটপুট ও সম্পাদনার ইতিহাস সংরক্ষিত থাকবে)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={doctorNameInput}
                  onChange={(e) => setDoctorNameInput(e.target.value)}
                  placeholder="ডাক্তারের নাম"
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                />
                <input
                  type="text"
                  value={doctorBmdcInput}
                  onChange={(e) => setDoctorBmdcInput(e.target.value)}
                  placeholder="BMDC Reg No."
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900"
                />
              </div>
              <textarea
                rows={2}
                value={doctorNoteInput}
                onChange={(e) => setDoctorNoteInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black cursor-pointer"
              >
                যাচাইকরণ ও নোট সংরক্ষণ করুন
              </button>
            </form>
          )}

          {/* 3. Doctor Note + One-Page Bengali Summary */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-3">
            {activeReport.doctorNoteBn && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                <strong>ডাক্তারের মন্তব্য ({activeReport.verifiedByDoctorName}):</strong> {activeReport.doctorNoteBn}
              </div>
            )}
            <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed">
              {activeReport.onePageSummaryBn}
            </pre>

            {activeReport.editHistory?.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditHistory((s) => !s)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  {showEditHistory ? "মূল AI আউটপুট ও সম্পাদনার ইতিহাস লুকান" : `মূল AI আউটপুট ও ইতিহাস দেখুন (${activeReport.editHistory.length})`}
                </button>
                {showEditHistory && (
                  <div className="mt-2 space-y-2 text-xs text-slate-600 bg-white rounded-xl border border-slate-200 p-3">
                    <p>
                      <strong>মূল AI আউটপুট:</strong> {activeReport.originalAiSummaryBn.slice(0, 260)}...
                    </p>
                    {activeReport.editHistory.map((h, i) => (
                      <p key={i} className="border-t border-slate-100 pt-1.5">
                        {new Date(h.editedAt).toLocaleString()} — <strong>{h.doctorName}</strong> ({h.bmdcRegNo}): {h.noteBn}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. "কোন ডাক্তার দেখাবেন" Routing CTA */}
          <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-wider text-sky-700">
                কোন ডাক্তার দেখাবেন? (রিপোর্ট-ভিত্তিক স্পেশালিস্ট রাউটিং)
              </p>
              <p className="text-sm font-bold text-slate-900">
                প্রস্তাবিত বিভাগ:{" "}
                <span className="text-sky-700">{activeReport.recommendedSpecialties[0]?.labelBn || activeReport.primarySpecialty}</span>
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeReport.recommendedSpecialties.map((spec) => (
                  <Link
                    key={spec.specialtyQuery}
                    href={`/doctors?specialty=${encodeURIComponent(spec.specialtyQuery)}&fromReport=${encodeURIComponent(activeReport.id)}`}
                    className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-[11px] font-bold text-sky-800 hover:bg-sky-100"
                  >
                    {spec.specialtyQuery}: {spec.reasonBn}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href={`/doctors?specialty=${encodeURIComponent(activeReport.primarySpecialty)}&fromReport=${encodeURIComponent(activeReport.id)}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-black shadow-xs transition-colors shrink-0"
            >
              <Stethoscope className="w-4 h-4" />
              কোন ডাক্তার দেখাবেন
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5. Deterministic Flagged Parameters Grid + "কেন এই ফলাফল" */}
          {activeReport.parameters.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-teal-600" />
                  পরীক্ষা-ভিত্তিক রেফারেন্স রেঞ্জ ও বাংলা ব্যাখ্যা ({activeReport.parameters.length}টি টেস্ট)
                </h4>
                <span className="text-[11px] font-bold text-slate-500">
                  সব ফ্ল্যাগ কোড-নিয়ন্ত্রিত (Deterministic Engine)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeReport.parameters.map((param) => (
                  <div
                    key={param.code}
                    className="rounded-2xl border border-slate-200 p-4 space-y-2.5 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-slate-900">{param.displayNameBn}</p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {param.displayName} • রেঞ্জ: {param.activeRangeLabel}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black border shrink-0 ${flagStyles(param.badgeColor)}`}
                      >
                        {param.flag}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                      <span className="text-lg font-mono font-black text-slate-900">
                        {param.value} <span className="text-xs font-semibold text-slate-500">{param.unit}</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {param.rangeSource === "lab_printed" ? "ল্যাবের প্রিন্টেড রেঞ্জ" : "স্ট্যান্ডার্ড রেঞ্জ"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>এটা কী:</strong> {param.whatItIsBn}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>সম্ভাব্য ব্যাখ্যা:</strong> {param.possibleMeaningBn}
                    </p>
                    {param.clinicalNoteBn && (
                      <p className="text-[11px] font-bold text-indigo-800 bg-indigo-50 rounded-lg px-2.5 py-1.5 border border-indigo-200">
                        {param.clinicalNoteBn}
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedWhy((prev) => ({ ...prev, [param.code]: !prev[param.code] }))
                        }
                        className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                      >
                        {expandedWhy[param.code] ? "কেন এই ফলাফল লুকান" : "কেন এই ফলাফল? (ব্যাখ্যা)"}
                      </button>
                      <Link
                        href={`/doctors?specialty=${encodeURIComponent(param.specialtyQuery)}`}
                        className="text-[11px] font-bold text-sky-700 hover:underline"
                      >
                        {param.specialistBn} →
                      </Link>
                    </div>

                    {expandedWhy[param.code] && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                        {param.whyThisFlagBn}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Mandatory Bengali Disclaimer Footer */}
          <footer className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs font-bold text-amber-950 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{activeReport.disclaimerFooterBn || MANDATORY_BENGALI_DISCLAIMER}</span>
          </footer>
        </div>
      )}

      {/* 7. Multi-Report Longitudinal Trend Chart */}
      {trends.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                সময়ের সাথে ল্যাব রিপোর্টের ট্রেন্ড চার্ট (Health ID: {defaultHealthCardNumber})
              </h3>
              <p className="text-xs text-slate-500">
                একাধিক রিপোর্টের একই পরীক্ষার তুলনামূলক পরিবর্তন (উদাহরণ: HbA1c ও রক্তের সুগার কমছে না বাড়ছে)।
              </p>
            </div>
            <Link
              href="/patient/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Health ID 360° টাইমলাইন
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.slice(0, 6).map((series) => {
              const maxVal = Math.max(...series.points.map((p) => p.value), series.rangeMax || 1, 1);
              return (
                <div key={series.code} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900">{series.displayNameBn}</p>
                      <p className="text-[10px] font-mono text-slate-500">
                        স্বাভাবিক: {series.rangeMin}–{series.rangeMax} {series.unit}
                      </p>
                    </div>
                    <Activity className="w-4 h-4 text-teal-600" />
                  </div>

                  <div className="space-y-2">
                    {series.points.map((pt, idx) => {
                      const pct = Math.min(100, Math.max(12, Math.round((pt.value / maxVal) * 100)));
                      const barColor =
                        pt.flag === "স্বাভাবিক"
                          ? "bg-emerald-500"
                          : pt.flag === "বেশি"
                            ? "bg-rose-500"
                            : "bg-amber-500";
                      return (
                        <div key={`${pt.date}-${idx}`} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-600">{pt.date}</span>
                            <span className="font-bold text-slate-900">
                              {pt.value} {pt.unit} ({pt.flag})
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
