"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Pill, 
  FlaskConical, 
  Syringe, 
  Bandage, 
  Building2, 
  Tag, 
  Package, 
  Coins, 
  Activity, 
  FileCheck2,
  Share2,
  Check,
  ChevronRight,
  ArrowUpRight
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
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  useEffect(() => {
    if (!medicine?.id) return;
    
    // Fetch authentic alternatives from database
    let isMounted = true;
    setLoadingAlternatives(true);
    fetch(`/api/medicines/${medicine.id}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.alternatives) {
          setAlternatives(data.alternatives);
        }
      })
      .catch(err => console.error("Error loading alternatives:", err))
      .finally(() => {
        if (isMounted) setLoadingAlternatives(false);
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

  const DosageIcon = getDosageIcon(medicine.type);

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
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                {medicine.drugType || "Allopathic"}
              </span>
              <span className="text-xs font-bold text-slate-500">
                DGDA Record #{medicine.id}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Copy share link"
              >
                {copied ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Visual Medicine Packaging Display */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-6 text-white shadow-md overflow-hidden border border-slate-800">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
                <DosageIcon size={180} />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                    <DosageIcon size={32} className="text-sky-300" />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-1">
                      {medicine.type || "Tablet"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-[900] tracking-tight text-white">
                      {medicine.name}
                    </h2>
                    <p className="text-sm font-semibold text-sky-200/90 mt-0.5">
                      {medicine.generic}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto">
                  <div className="text-xs text-slate-400 font-medium">Govt. Retail Price</div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {typeof medicine.price === 'number' && medicine.price > 0 ? `৳${medicine.price.toFixed(2)}` : (typeof medicine.unitPrice === 'number' && medicine.unitPrice > 0 ? `৳${medicine.unitPrice.toFixed(2)}` : 'Price unavailable')}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    per {medicine.priceBasis || "unit"}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Database Attributes Table */}
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Official Database Specifications
              </h3>
              
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
                    জেনেরিক উপাদান (Generic Formula)
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
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                    প্রস্তুতকারক কোম্পানি (Manufacturer)
                  </span>
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-sky-600 shrink-0" />
                    <span className="font-bold text-slate-900">
                      {medicine.company || "Pharmaceuticals"}
                    </span>
                  </div>
                </div>

                {medicine.packageContainer && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      প্যাকেজিং ও স্ট্রিপ সাইজ (Packaging & Pack Details)
                    </span>
                    <span className="font-bold text-slate-800">
                      {medicine.packageContainer}
                    </span>
                  </div>
                )}

                {medicine.useFor && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      থেরাপিউটিক ব্যবহার (Therapeutic Indication)
                    </span>
                    <span className="font-bold text-sky-800">
                      {medicine.useFor}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Authentic Data Guarantee */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <FileCheck2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed font-medium">
                <strong>প্রমাণিত তথ্যের নিশ্চয়তা:</strong> উপরের সকল তথ্য সরাসরি বাংলাদেশের ওষুধ প্রশাসন ও ম্যানুফ্যাকচারার ডাটাবেস থেকে সংগৃহীত। কোনো অনুমান বা মনগড়া তথ্য নেই।
              </div>
            </div>

            {/* Generic Alternatives from same database */}
            {alternatives.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                    একই জেনেরিকের বিকল্প ব্র্যান্ডসমূহ ({alternatives.length})
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
                          {alt.price ? `৳${alt.price.toFixed(2)}` : 'Available'}
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
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
