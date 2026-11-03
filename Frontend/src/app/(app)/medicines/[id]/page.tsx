"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  HeartPulse,
  Info,
  Clock,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MedicineDetailPage() {
  const params = useParams();
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
    if (t.includes("syrup") || t.includes("suspension") || t.includes("liquid") || t.includes("solution") || t.includes("drop")) {
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
          <p className="text-sm font-bold text-slate-500">ওষুধ প্রশাসনের ভেরিফাইড রেকর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
          <Pill size={48} className="mx-auto text-slate-400 mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">মেডিসিন পাওয়া যায়নি</h2>
          <p className="text-sm text-slate-500 mb-6">অনুরোধকৃত মেডিসিন রেকর্ডটি ওষুধ প্রশাসনের ডাটাবেসে খুঁজে পাওয়া যায়নি।</p>
          <Link href="/medicines">
            <Button className="rounded-xl">ওষুধের তালিকায় ফিরে যান</Button>
          </Link>
        </div>
      </div>
    );
  }

  const DosageIcon = getDosageIcon(medicine.type);
  const monograph = medicine.monograph;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Bar with Clear Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link 
            href="/medicines"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 text-slate-700 hover:text-sky-600 font-bold text-sm shadow-xs transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>ওষুধের তালিকায় ফিরে যান (Back to Medicines)</span>
          </Link>

          <div className="flex items-center gap-2">
            {monograph?.monograph_link && (
              <a
                href={monograph.monograph_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200/70 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-all shadow-2xs"
              >
                <span>অফিশিয়াল প্রেসক্রাইবিং তথ্য</span>
                <ExternalLink size={13} />
              </a>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copied ? "কপি হয়েছে" : "শেয়ার করুন"}</span>
            </button>
          </div>
        </div>

        {/* Hero Section: Official Packaging View + Drug Profile */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-8">
            
            {/* Left: Official Packaging Representation */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-2xl p-6 sm:p-8 border border-slate-200/80 relative overflow-hidden group">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-bold border border-emerald-200/60 z-10">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>DGDA Verified Drug</span>
              </div>

              <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-2 flex items-center justify-center">
                <Image
                  src="/images/medicine-box.png"
                  alt={medicine.name}
                  width={240}
                  height={240}
                  className="object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              <div className="w-full text-center mt-2 pt-3 border-t border-slate-200/80">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {medicine.type || "Tablet"} Packaging
                </span>
                <p className="text-xs font-semibold text-slate-500 mt-1.5">
                  {medicine.packageContainer || "Standard Pharmaceutical Blister/Container"}
                </p>
              </div>
            </div>

            {/* Right: Core Medical Specifications */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wide bg-sky-100 text-sky-800 border border-sky-200/80">
                    {medicine.drugType || "Allopathic"}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    DGDA Index #{medicine.id}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight">
                  {medicine.name}
                </h1>
                
                <p className="text-base sm:text-lg font-bold text-sky-700 mt-1">
                  {medicine.generic} {medicine.strength && <span className="text-slate-600 font-semibold">• {medicine.strength}</span>}
                </p>

                <div className="flex items-center gap-2 mt-3 text-sm text-slate-600 font-semibold">
                  <Building2 size={16} className="text-sky-600 shrink-0" />
                  <span>{medicine.company}</span>
                </div>
              </div>

              {/* Price Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Govt. Approved Retail Price
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      ৳{typeof medicine.price === 'number' ? medicine.price.toFixed(2) : (medicine.unitPrice ? medicine.unitPrice.toFixed(2) : '0.00')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      /{medicine.priceBasis || "unit"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    In Stock at Verified Pharmacies
                  </span>
                </div>
              </div>

              {/* Official Primary Indication Highlight */}
              {medicine.useFor && (
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/70 flex items-start gap-3">
                  <HeartPulse size={20} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-900 mb-0.5">
                      প্রাথমিক নির্দেশিত রোগ (Primary Clinical Indication)
                    </h3>
                    <p className="text-sm font-bold text-slate-800">
                      {medicine.useFor}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Comprehensive A-to-Z Official Medical Use Cases */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-sky-600" />
              <h2 className="text-xl sm:text-2xl font-[900] text-slate-900 tracking-tight">
                কেন এবং কীভাবে ব্যবহার করবেন (A to Z বিস্তারিত ব্যবহার নির্দেশিকা)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              ওষুধ প্রশাসন অধিদপ্তর (DGDA) ও অফিশিয়াল ফার্মাকোপিয়া মনোগ্রাফ থেকে সরাসরি সংগৃহীত তথ্য।
            </p>
          </div>

          {/* 1. Official Indications Description */}
          {monograph?.indication_description && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Info size={16} className="text-sky-600" />
                <span>চিকিৎসায় ব্যবহার ও রোগ নিরাময় (Indications & Approved Uses)</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {monograph.indication_description}
              </p>
            </div>
          )}

          {/* 2. Mode of Action / Pharmacology */}
          {monograph?.pharmacology && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                <span>কার্যপদ্ধতি ও ফার্মাকোলজি (Pharmacology & Mechanism)</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {monograph.pharmacology}
              </p>
            </div>
          )}

          {/* 3. Dosage & Administration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monograph?.dosage && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-600" />
                  <span>সেবনমাত্রা ও নিয়ম (Dosage Guidelines)</span>
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                  {monograph.dosage}
                </p>
              </div>
            )}

            {monograph?.administration && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Pill size={16} className="text-amber-600" />
                  <span>সেবনের সঠিক নিয়ম (Administration Instructions)</span>
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                  {monograph.administration}
                </p>
              </div>
            )}
          </div>

          {/* 4. Side Effects & Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monograph?.side_effects && (
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
                <h3 className="text-sm font-extrabold text-rose-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <span>সম্ভাব্য পার্শ্বপ্রতিক্রিয়া (Documented Side Effects)</span>
                </h3>
                <p className="text-sm text-rose-900/90 leading-relaxed font-normal whitespace-pre-line">
                  {monograph.side_effects}
                </p>
              </div>
            )}

            {monograph?.contraindications && (
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>কাদের সেবন নিষেধ (Contraindications)</span>
                </h3>
                <p className="text-sm text-amber-900/90 leading-relaxed font-normal whitespace-pre-line">
                  {monograph.contraindications}
                </p>
              </div>
            )}
          </div>

          {/* 5. Pregnancy & Precautions */}
          {(monograph?.pregnancy_and_lactation || monograph?.precautions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monograph?.pregnancy_and_lactation && (
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2">
                  <h3 className="text-sm font-extrabold text-purple-900 flex items-center gap-2">
                    <HeartPulse size={16} className="text-purple-600" />
                    <span>গর্ভাবস্থা ও স্তন্যদানকালে ব্যবহার (Pregnancy & Lactation)</span>
                  </h3>
                  <p className="text-sm text-purple-900/90 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.pregnancy_and_lactation}
                  </p>
                </div>
              )}

              {monograph?.precautions && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Info size={16} className="text-sky-600" />
                    <span>বিশেষ সতর্কতা (Precautions & Warnings)</span>
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.precautions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 6. Storage Conditions */}
          {monograph?.storage_conditions && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <FileCheck2 size={18} className="text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  সংরক্ষণ নির্দেশিকা (Storage Instructions)
                </span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {monograph.storage_conditions}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Database Specification Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-[900] text-slate-900 tracking-tight">
              অফিশিয়াল ডেটাবেস স্পেসিফিকেশন (Official Database Specifications)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              বাংলাদেশ জাতীয় ওষুধ ডাটাবেসের রেকর্ডকৃত বিবরণ।
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
                  প্যাকেজিং বিবরণ (Packaging Details)
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {medicine.packageContainer}
                </span>
              </div>
            )}
          </div>

          {/* Verification Guarantee Notice */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <FileCheck2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed font-medium">
              <strong>প্রমাণিত তথ্যের নিশ্চয়তা:</strong> প্রদর্শিত সমস্ত তথ্য সরাসরি ওষুধ প্রশাসন অধিদপ্তর (DGDA) ও অনুমোদিত ফার্মাসিউটিক্যালস প্রস্তুতকারকের ডাটাবেস থেকে সংগৃহীত। কোনো অনুমানভিত্তিক বা মনগড়া তথ্য এখানে প্রদর্শিত হয় না।
            </div>
          </div>
        </div>

        {/* Generic Alternatives */}
        {alternatives.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-[900] text-slate-900 tracking-tight">
                একই জেনেরিকের সাশ্রয়ী বিকল্পসমূহ ({alternatives.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                অন্যান্য বিশ্বস্ত কোম্পানির একই কার্যকর জেনেরিক ও শক্তির ওষুধ।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {alternatives.map((alt) => (
                <Link
                  key={alt.id}
                  href={`/medicines/${alt.id}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-sky-700 truncate text-sm">
                      {alt.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
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
                    <span className="text-xs font-bold text-sky-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      দেখন <ChevronRight size={14} />
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
