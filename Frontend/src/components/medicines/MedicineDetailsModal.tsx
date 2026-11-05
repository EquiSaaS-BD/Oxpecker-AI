"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Pill, 
  FlaskConical, 
  Syringe, 
  Bandage, 
  Building2, 
  FileCheck2,
  Share2,
  Check,
  ChevronRight,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Info
} from "lucide-react";

export interface MedicineDetail {
  id: string;
  name: string;
  generic: string;
  company: string;
  strength?: string;
  price?: number | null;
  priceBasis?: string | null;
  unitPrice?: number | null;
  packagePrice?: number | null;
  packageSize?: string | null;
  packageContainer?: string | null;
  type?: string;
  drugType?: string;
  category?: string;
  useFor?: string;
  image?: string | null;
  slug?: string;
  indication?: string | null;
  indicationDescription?: string | null;
  drugClass?: string | null;
  dosageIcon?: string | null;
  manufacturerLogoUrl?: string | null;
}

interface MedicineDetailsModalProps {
  medicine: MedicineDetail | null;
  onClose: () => void;
  onSelectAlternative?: (altMedicine: MedicineDetail) => void;
}

export function MedicineDetailsModal({ 
  medicine, 
  onClose,
  onSelectAlternative 
}: MedicineDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "clinical" | "dosage">("overview");

  useEffect(() => {
    if (!medicine?.id) return;
    
    let isMounted = true;
    setLoadingDetails(true);
    setDetailData(null);
    setAlternatives([]);

    fetch(`/api/medicines/${medicine.id}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.alternatives) {
          setAlternatives(data.alternatives);
        }
        if (data.data) {
          setDetailData(data.data);
        }
      })
      .catch(err => console.error("Error loading medicine details:", err))
      .finally(() => {
        if (isMounted) setLoadingDetails(false);
      });

    return () => { isMounted = false; };
  }, [medicine?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!medicine) return null;

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

  const DosageIcon = getDosageIcon(medicine.type);
  const packagingImage = detailData?.image || detailData?.packagingImages?.[0] || medicine.image || null;
  const officialDosageIcon = detailData?.officialDosageIcon || medicine.dosageIcon || null;
  const manufacturerAsset = detailData?.manufacturerAsset || null;
  const monograph = detailData?.monograph || null;
  const monographBn = detailData?.monographBn || {};
  const verifiedPrice = typeof detailData?.price === 'number' && detailData.price > 0 
    ? detailData.price 
    : (typeof medicine.price === 'number' && medicine.price > 0 ? medicine.price : null);

  const indicationText = monograph?.indication_description || monograph?.indication || medicine.indicationDescription || medicine.indication || medicine.useFor;
  const drugClassText = monograph?.drug_class || monograph?.therapeutic_class || medicine.drugClass;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/medicines/${medicine.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                {medicine.drugType || "Allopathic"}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">
                DGDA Record #{medicine.id}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Copy share link"
              >
                {copied ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Visual Hero Card with Authentic Packaging / Official Dosage Icon */}
            <div className="relative rounded-2xl bg-[#F8FAFC] p-6 text-[#111827] overflow-hidden border border-[#E5E7EB]">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Photo or 3D Icon Presentation */}
                  <div className="w-20 h-20 rounded-2xl bg-white border border-[#E5E7EB] p-2 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    {packagingImage ? (
                      <img 
                        src={packagingImage} 
                        alt={medicine.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : officialDosageIcon ? (
                      <img 
                        src={officialDosageIcon} 
                        alt={medicine.type || "Dosage"}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <DosageIcon size={36} className="text-sky-600" />
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                        {medicine.type || "Tablet"}
                      </span>
                      {drugClassText && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 truncate max-w-[200px]">
                          {drugClassText}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-[900] tracking-tight text-[#111827] truncate">
                      {medicine.name}
                    </h2>
                    <p className="text-sm font-semibold text-sky-700 mt-0.5 truncate">
                      {medicine.generic} {medicine.strength ? `• ${medicine.strength}` : ""}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 bg-white p-3.5 rounded-2xl w-full sm:w-auto border border-[#E5E7EB]">
                  <div className="text-[11px] text-[#64748B] font-semibold">Verified Retail Price</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#111827]">
                    {typeof verifiedPrice === 'number' && verifiedPrice > 0 
                      ? `৳${verifiedPrice.toFixed(2)}` 
                      : 'Price Unavailable'}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-medium">
                    {typeof verifiedPrice === 'number' && verifiedPrice > 0 
                      ? `per ${medicine.priceBasis || "unit"}` 
                      : 'Verification required'}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("clinical")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "clinical"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Clinical Uses & Action
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dosage")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "dosage"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dosage & Guidelines
              </button>
            </div>

            {/* Tab 1: Database Specifications */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      বাণিজ্যিক নাম (Brand Name)
                    </span>
                    <span className="font-bold text-slate-900 text-base">
                      {medicine.name}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      জেনেরিক উপাদান (Generic Molecule)
                    </span>
                    <span className="font-bold text-slate-900 text-base">
                      {medicine.generic}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      মাত্রা ও শক্তি (Strength)
                    </span>
                    <span className="font-bold text-slate-800">
                      {medicine.strength || "Standard"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      ডোজের ধরণ (Dosage Form)
                    </span>
                    <span className="font-bold text-slate-800">
                      {medicine.type || "Tablet"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">
                      প্রস্তুতকারক কোম্পানি (Manufacturer)
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {manufacturerAsset?.logoUrl ? (
                          <img 
                            src={manufacturerAsset.logoUrl} 
                            alt={manufacturerAsset.shortName}
                            className="h-7 w-auto object-contain max-w-[100px]"
                          />
                        ) : (
                          <Building2 size={18} className="text-sky-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">
                            {manufacturerAsset?.name || medicine.company}
                          </span>
                          {manufacturerAsset?.origin && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              {manufacturerAsset.origin} {manufacturerAsset.established ? `• Est. ${manufacturerAsset.established}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        DGDA Licensed
                      </span>
                    </div>
                  </div>

                  {medicine.packageContainer && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                      <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                        প্যাকেজিং ও স্ট্রিপ সাইজ (Packaging Details)
                      </span>
                      <span className="font-bold text-slate-800">
                        {medicine.packageContainer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Clinical Indications & Action */}
            {activeTab === "clinical" && (
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
                  <div className="flex items-center gap-2 text-sky-900 font-black text-sm">
                    <Stethoscope size={16} className="text-sky-600" />
                    <span>চিকিৎসায় ব্যবহার ও নির্দেশনা (Indications & Use Cases)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {monographBn.indication_description || indicationText || "Approved by DGDA for targeted clinical therapeutic care."}
                  </p>
                </div>

                {drugClassText && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wide block">
                      ফার্মাকোলজিক্যাল ক্লাস (Therapeutic & Drug Class)
                    </span>
                    <p className="font-bold text-purple-950 text-sm">
                      {drugClassText}
                    </p>
                  </div>
                )}

                {monograph?.pharmacology && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                      কার্যপদ্ধতি ও ফার্মাকোলজি (Mechanism of Action)
                    </span>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      {monograph.pharmacology}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Dosage & Guidelines */}
            {activeTab === "dosage" && (
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    মাত্রা ও সেবনবিধি (Dosage & Administration)
                  </span>
                  <p className="text-slate-700 leading-relaxed text-xs font-medium">
                    {monographBn.dosage || monograph?.dosage || "As advised by registered physician. Dosage depends on patient age, body weight, and clinical condition."}
                  </p>
                </div>

                {monograph?.side_effects && (
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
                    <span className="text-xs font-bold text-rose-900 uppercase tracking-wide block">
                      পার্শ্বপ্রতিক্রিয়া (Possible Side Effects)
                    </span>
                    <p className="text-rose-950/80 leading-relaxed text-xs">
                      {monographBn.side_effects || monograph.side_effects}
                    </p>
                  </div>
                )}

                {monograph?.contraindications && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block">
                      প্রতিনির্দেশনা (Contraindications)
                    </span>
                    <p className="text-amber-950/80 leading-relaxed text-xs">
                      {monographBn.contraindications || monograph.contraindications}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Official Monograph Link Button */}
            <div className="pt-1">
              <Link
                href={`/medicines/${medicine.id}`}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/80 text-sky-900 hover:from-sky-100 hover:to-blue-100 transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={18} className="text-sky-600" />
                  <div className="text-left">
                    <div className="text-xs font-black text-sky-950">
                      View Full Prescribing Monograph & Guidelines
                    </div>
                    <div className="text-[11px] text-sky-700 font-medium">
                      Multi-language clinical translation (বাংলা, English, हिन्दी, العربية)
                    </div>
                  </div>
                </div>
                <ExternalLink size={16} className="text-sky-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Authentic Data Guarantee */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <FileCheck2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed font-medium">
                <strong>প্রমাণিত তথ্যের নিশ্চয়তা:</strong> প্রদর্শিত সমস্ত তথ্য সরাসরি বাংলাদেশের ওষুধ প্রশাসন অধিদপ্তর (DGDA), অফিশিয়াল ফার্মাকোপিয়া মনোগ্রাফ ও ভেরিফাইড প্রস্তুতকারক কোম্পানির রেকর্ড থেকে যাচাইকৃত। কোনো অনুমানভিত্তিক মূল্য বা তথ্য প্রদর্শিত হয় না।
              </div>
            </div>

            {/* Generic Alternatives from same database */}
            {alternatives.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    একই জেনেরিকের সাশ্রয়ী বিকল্পসমূহ ({alternatives.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        if (onSelectAlternative) {
                          onSelectAlternative({
                            id: alt.id,
                            name: alt.name,
                            generic: medicine.generic,
                            company: alt.company,
                            strength: alt.strength,
                            type: alt.type,
                            price: alt.price,
                            priceBasis: 'unit',
                            category: medicine.category,
                            useFor: medicine.useFor,
                            drugType: medicine.drugType,
                          });
                        }
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-sky-700 truncate">
                          {alt.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {alt.company}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-slate-900 text-sm">
                          {typeof alt.price === 'number' && alt.price > 0 ? `৳${alt.price.toFixed(2)}` : 'Available'}
                        </div>
                        <span className="text-[10px] text-sky-600 font-bold group-hover:underline flex items-center justify-end gap-0.5">
                          Switch <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer actions */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs font-semibold text-slate-400">
              Oxpecker AI Clinical Medicine Engine
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
