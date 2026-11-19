"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  BadgeCheck,
  Building2,
  CreditCard,
  ExternalLink,
  FileText,
  Palette,
  PhoneCall,
  Sparkles,
  Upload,
} from "lucide-react";

export function SaasWorkspacePanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Clinic upload form state
  const [patientName, setPatientName] = useState("Karim Uddin");
  const [patientPhone, setPatientPhone] = useState("+8801711223344");
  const [healthCardNo, setHealthCardNo] = useState("HP-2026-8841");
  const [consentOtp, setConsentOtp] = useState("CONSENT-9914");
  const [rawReportText, setRawReportText] = useState(
    "Hemoglobin: 10.9 g/dL (13.5 - 17.5)\nHbA1c: 7.9 % (4.0 - 5.6)\nSerum Creatinine: 1.45 mg/dL (0.7 - 1.3)"
  );

  // Branding state
  const [brandColor, setBrandColor] = useState("#0f766e");
  const [brandLogoText, setBrandLogoText] = useState("OXPECKER CARE");

  const loadWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/saas/workspace", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.workspace?.brandColor) setBrandColor(json.workspace.brandColor);
        if (json.workspace?.brandLogoText) setBrandLogoText(json.workspace.brandLogoText);
      }
    } catch {
      // keep clean state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const handlePlanUpgrade = async (targetPlan: string, provider: "bkash" | "nagad" | "sslcommerz") => {
    const res = await fetch("/api/saas/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upgrade_plan", targetPlan, provider }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      toast.success(json.messageBn || "প্ল্যান আপগ্রেড সম্পন্ন!");
      await loadWorkspace();
    } else {
      toast.error(json.error || "পেমেন্ট স্যান্ডবক্স ত্রুটি।");
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/saas/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_branding",
        brandColor,
        brandLogoText,
      }),
    });
    if (res.ok) {
      toast.success("ক্লিনিক ব্র্যান্ডেড PDF লোগো ও রঙ সেভ হয়েছে!");
      await loadWorkspace();
    }
  };

  const handleClinicUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await fetch("/api/saas/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clinic_upload_report",
          patientName,
          patientPhone,
          healthCardNumber: healthCardNo,
          consentOtp,
          patientConsent: true,
          rawText: rawReportText,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "রিপোর্ট আপলোড ব্যর্থ।");
        return;
      }
      toast.success("ক্লিনিক রিপোর্ট বিশ্লেষণ ও রোগীর Health ID-তে যুক্ত হয়েছে!");
      await loadWorkspace();
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: "new" | "contacted" | "booked") => {
    const res = await fetch("/api/saas/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_lead_status", leadId, status }),
    });
    if (res.ok) {
      toast.success("লিড স্ট্যাটাস আপডেট হয়েছে।");
      await loadWorkspace();
    }
  };

  const handleVerifyQueueReport = async (reportId: string) => {
    const res = await fetch("/api/saas/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify_queue_report",
        reportId,
        doctorName: "Prof. Dr. Ahmed Rahman",
        bmdcRegNo: "BMDC-A-41892",
      }),
    });
    if (res.ok) {
      toast.success("ডাক্তার যাচাইকরণ সম্পন্ন হয়েছে!");
      await loadWorkspace();
    }
  };

  if (loading && !data) {
    return <p className="text-xs text-slate-500 p-6">Loading B2B SaaS Workspace...</p>;
  }

  const ws = data?.workspace;
  const plan = data?.plan;
  const analytics = data?.analytics;
  const leads = data?.leads || [];
  const reviewQueue = data?.reviewQueue || [];

  return (
    <div className="p-5 sm:p-6 space-y-6">
      {/* 1. Plan & Usage Quota Metering */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                Active Plan: {plan?.name}
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1">{ws?.name}</h2>
            </div>
            <a
              href="/api/saas/workspace?openapi=1"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              OpenAPI 3.1 Docs <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] font-bold text-slate-500">Reports Analyzed</p>
              <p className="text-lg font-mono font-black text-slate-900">
                {ws?.usage?.reportsAnalyzed || 0} / {plan?.monthlyReportQuota || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] font-bold text-slate-500">Clinic Seats Used</p>
              <p className="text-lg font-mono font-black text-slate-900">
                {ws?.usage?.seatsUsed || 1} / {plan?.seatQuota || 1}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] font-bold text-slate-500">API Calls / Lead Conv.</p>
              <p className="text-lg font-mono font-black text-slate-900">
                {ws?.usage?.apiCallsUsed || 0} ({analytics?.conversionRatePercent || 0}% Conv.)
              </p>
            </div>
          </div>

          {/* Subscription Sandbox Checkout (bKash / Nagad / SSLCommerz) */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-teal-600" />
              Upgrade Plan (Sandbox / Provider Interface):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePlanUpgrade("clinic_starter", "bkash")}
                className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold cursor-pointer"
              >
                bKash • Clinic Starter (৳2,999)
              </button>
              <button
                type="button"
                onClick={() => handlePlanUpgrade("clinic_pro", "nagad")}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer"
              >
                Nagad • Clinic Pro (৳7,999)
              </button>
              <button
                type="button"
                onClick={() => handlePlanUpgrade("lab_enterprise", "sslcommerz")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                SSLCommerz • Lab Enterprise (৳24,999)
              </button>
            </div>
          </div>
        </div>

        {/* Clinic PDF Branding Card */}
        <form onSubmit={handleSaveBranding} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-teal-600" />
            Branded Clinic PDF Settings
          </h3>
          <div>
            <label htmlFor="brand-logo-txt" className="block text-[11px] font-bold text-slate-600 mb-1">
              Report Header Logo Text
            </label>
            <input
              id="brand-logo-txt"
              type="text"
              value={brandLogoText}
              onChange={(e) => setBrandLogoText(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>
          <div>
            <label htmlFor="brand-color-inp" className="block text-[11px] font-bold text-slate-600 mb-1">
              Clinic Theme Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="brand-color-inp"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer"
              />
              <span className="font-mono text-xs text-slate-600">{brandColor}</span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
          >
            Save Clinic Branding
          </button>
        </form>
      </div>

      {/* 2. Clinic Report Upload on Behalf of Patient (Consent/OTP) + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <form
          onSubmit={handleClinicUploadReport}
          className="lg:col-span-7 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 bg-white"
        >
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-teal-600" />
            Upload Lab Report on Behalf of Patient (Consent / OTP Verified)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Patient Name"
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs"
            />
            <input
              type="tel"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="Patient Phone"
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs"
            />
            <input
              type="text"
              value={healthCardNo}
              onChange={(e) => setHealthCardNo(e.target.value)}
              placeholder="Health ID (e.g. HP-2026-8841)"
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono"
            />
            <input
              type="text"
              value={consentOtp}
              onChange={(e) => setConsentOtp(e.target.value)}
              placeholder="Patient Consent Ref / OTP"
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono"
            />
          </div>
          <textarea
            rows={3}
            value={rawReportText}
            onChange={(e) => setRawReportText(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs"
          />
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {uploading ? "Uploading & Analyzing..." : "Analyze & Push to Patient Health ID"}
          </button>
        </form>

        {/* Org Analytics */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 bg-slate-50/70">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            Clinic Analytics &amp; Abnormal Distribution
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-xl border border-emerald-200 p-2.5">
              <p className="text-[10px] font-bold text-emerald-700">স্বাভাবিক</p>
              <strong className="text-lg font-mono text-slate-900">{analytics?.abnormalDistribution?.normal || 0}</strong>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-2.5">
              <p className="text-[10px] font-bold text-amber-700">কম</p>
              <strong className="text-lg font-mono text-slate-900">{analytics?.abnormalDistribution?.low || 0}</strong>
            </div>
            <div className="bg-white rounded-xl border border-rose-200 p-2.5">
              <p className="text-[10px] font-bold text-rose-700">বেশি</p>
              <strong className="text-lg font-mono text-slate-900">{analytics?.abnormalDistribution?.high || 0}</strong>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Top Routed Specialties</p>
            {(analytics?.topSpecialties || []).slice(0, 4).map((sp: any) => (
              <div key={sp.specialty} className="flex justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">{sp.specialty}</span>
                <span className="font-mono text-teal-700">{sp.count} reports</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Specialist Lead Pipeline + Doctor Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 bg-white">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-sky-600" />
            Consent-Gated Specialist Lead Pipeline ({leads.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {leads.map((lead: any) => (
              <div key={lead.id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-slate-900">
                    {lead.patientName} → {lead.doctorName} ({lead.specialty})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Consent: Verified • {lead.patientPhone || "Protected"}
                  </p>
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                  className="h-8 px-2 rounded-lg border border-slate-200 text-[11px] font-bold bg-slate-50"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="booked">Booked</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 bg-white">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            Clinic Doctor Review Queue ({reviewQueue.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {reviewQueue.slice(0, 6).map((rep: any) => (
              <div key={rep.id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{rep.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {rep.reportDate} • {rep.urgency} • {rep.primarySpecialty}
                  </p>
                </div>
                {rep.doctorVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    <BadgeCheck className="w-3.5 h-3.5" /> যাচাইকৃত
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleVerifyQueueReport(rep.id)}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    যাচাই করুন
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
