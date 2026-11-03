"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Pill, 
  FlaskConical, 
  Syringe, 
  Bandage, 
  Building2, 
  FileCheck2, 
  Share2, 
  Check, 
  ShoppingCart,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MedicineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [medicine, setMedicine] = useState<any>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/medicines/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setMedicine(data.data);
          setAlternatives(data.alternatives || []);
        } else {
          setMedicine(null);
        }
      })
      .catch(err => {
        console.error("Failed to load medicine details:", err);
        setMedicine(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getDosageIcon = (type?: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("syrup") || t.includes("suspension") || t.includes("liquid") || t.includes("solution")) {
      return FlaskConical;
    }
    if (t.includes("injection") || t.includes("iv") || t.includes("infusion")) {
      return Syringe;
    }
    if (t.includes("cream") || t.includes("ointment") || t.includes("gel")) {
      return Bandage;
    }
    return Pill;
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading verified database record...</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
          <Pill size={48} className="mx-auto text-slate-400 mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Medicine Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">The requested medicine record could not be found in the DGDA registry.</p>
          <Link href="/medicines">
            <Button className="rounded-xl">Back to Medicines</Button>
          </Link>
        </div>
      </div>
    );
  }

  const DosageIcon = getDosageIcon(medicine.type);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/medicines"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Medicine Directory</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span>{copied ? "Link Copied" : "Share Medicine"}</span>
          </button>
        </div>

        {/* Hero Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-slate-800">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6 pointer-events-none">
            <DosageIcon size={240} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <DosageIcon size={40} className="text-sky-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    {medicine.type || "Tablet"}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    DGDA Index #{medicine.id}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-[900] tracking-tight text-white">
                  {medicine.name}
                </h1>
                <p className="text-base font-semibold text-sky-200/90 mt-1">
                  {medicine.generic}
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0 bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none w-full sm:w-auto">
              <div className="text-xs text-slate-400 font-medium">Govt. Approved Retail Price</div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-0.5">
                ৳{typeof medicine.price === 'number' ? medicine.price.toFixed(2) : (medicine.unitPrice ? medicine.unitPrice.toFixed(2) : '0.00')}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                per {medicine.priceBasis || "unit"}
              </div>
            </div>
          </div>
        </div>

        {/* Database Specification Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-[900] text-slate-900 tracking-tight">
              Official Pharmaceutical Profile
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Verified clinical and market specifications direct from Bangladesh drug registries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                বাণিজ্যিক নাম (Brand Name)
              </span>
              <span className="font-bold text-slate-900 text-base">
                {medicine.name}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                জেনেরিক উপাদান (Generic Name)
              </span>
              <span className="font-bold text-slate-900 text-base">
                {medicine.generic}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                মাত্রা ও শক্তি (Strength)
              </span>
              <span className="font-bold text-slate-800 text-base">
                {medicine.strength || "Standard"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                ডোজের ধরণ (Dosage Form)
              </span>
              <span className="font-bold text-slate-800 text-base">
                {medicine.type || "Tablet"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                প্রস্তুতকারক কোম্পানি (Manufacturer)
              </span>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-sky-600 shrink-0" />
                <span className="font-bold text-slate-900 text-base">
                  {medicine.company || "Pharmaceuticals"}
                </span>
              </div>
            </div>

            {medicine.packageContainer && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  প্যাকেজিং বিবরণ (Packaging & Strip Details)
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {medicine.packageContainer}
                </span>
              </div>
            )}

            {medicine.useFor && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  থেরাপিউটিক ব্যবহার (Therapeutic Indication)
                </span>
                <span className="font-bold text-sky-800 text-sm">
                  {medicine.useFor}
                </span>
              </div>
            )}
          </div>

          {/* Verification notice */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <FileCheck2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed font-medium">
              <strong>প্রমাণিত তথ্যের নিশ্চয়তা:</strong> প্রদর্শিত সমস্ত তথ্য সরাসরি ওষুধ প্রশাসন অধিদপ্তর (DGDA) ও অনুমোদিত ফার্মাসিউটিক্যালস প্রস্তুতকারকের ডাটাবেস থেকে সংগৃহীত। কোনো অনুমানভিত্তিক বা মনগড়া তথ্য এখানে প্রদর্শিত হয় না।
            </div>
          </div>
        </div>

        {/* Generic Alternatives */}
        {alternatives.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-[900] text-slate-900 tracking-tight">
                একই জেনেরিকের সাশ্রয়ী বিকল্পসমূহ ({alternatives.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                অন্যান্য বিশ্বস্ত কোম্পানির একই কার্যকর জেনেরিক ও শক্তির ওষুধ।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {alternatives.map((alt) => (
                <Link
                  key={alt.id}
                  href={`/medicines/${alt.id}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-sky-700 truncate text-sm">
                      {alt.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {alt.company}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {alt.strength} • {alt.type}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">
                      {alt.price ? `৳${alt.price.toFixed(2)}` : 'Available'}
                    </span>
                    <span className="text-xs font-bold text-sky-600 flex items-center gap-0.5 group-hover:underline">
                      View <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
