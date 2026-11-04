"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pill,
  Droplets,
  Syringe,
  AlertTriangle,
  Factory,
  Package,
  CircleDot,
  ArrowRightLeft,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface MedicineAlternative {
  id?: string;
  name: string;
  manufacturer?: string;
  price: number;
  priceBasis?: string;
  url?: string;
}

interface Medicine {
  id?: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  manufacturerLogoUrl?: string | null;
  strength: string;
  price: number;
  priceBasis?: string;
  availability: boolean;
  dosageForm: string;
  officialDosageIcon?: string | null;
  packagingImageUrl?: string | null;
  url?: string;
  warnings: string[];
  alternatives: MedicineAlternative[];
}

function getDosageIcon(form: string) {
  const f = (form || "").toLowerCase();
  if (f.includes("syrup") || f.includes("liquid") || f.includes("suspension"))
    return Droplets;
  if (f.includes("injection") || f.includes("injectable")) return Syringe;
  if (f.includes("capsule")) return CircleDot;
  return Pill;
}

export function MedicineCard({ medicine }: { medicine: Medicine }) {
  const DosageIcon = getDosageIcon(medicine.dosageForm);
  const detailUrl = medicine.url || (medicine.id ? `/medicines/${medicine.id}` : "/medicines");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all w-full overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-2xs overflow-hidden p-1.5">
            {medicine.officialDosageIcon ? (
              <img
                src={medicine.officialDosageIcon}
                alt={medicine.dosageForm}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <DosageIcon className="w-6 h-6 text-sky-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={detailUrl}
              className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-sky-600 transition-colors leading-tight inline-flex items-center gap-1.5 group"
            >
              <span className="truncate">{medicine.brandName}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5 truncate">
              {medicine.genericName}
            </p>
          </div>

          {/* Availability Badge */}
          <span
            className={`shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              medicine.availability
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
            }`}
          >
            {medicine.availability ? "DGDA Verified" : "Out of Stock"}
          </span>
        </div>

        {/* Optional Packaging Preview */}
        {medicine.packagingImageUrl && (
          <Link
            href={detailUrl}
            className="mt-3 block rounded-xl overflow-hidden border border-slate-100 bg-slate-50/70 h-28 flex items-center justify-center p-2 hover:border-sky-200 transition-colors"
          >
            <img
              src={medicine.packagingImageUrl}
              alt={`${medicine.brandName} packaging`}
              className="max-h-full w-auto object-contain rounded-lg"
              loading="lazy"
            />
          </Link>
        )}

        {/* Details */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold min-w-0">
            {medicine.manufacturerLogoUrl ? (
              <img
                src={medicine.manufacturerLogoUrl}
                alt={medicine.manufacturer}
                className="w-4 h-4 object-contain shrink-0"
              />
            ) : (
              <Factory className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="truncate" title={medicine.manufacturer}>
              {medicine.manufacturer}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium min-w-0">
            <Package className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{medicine.dosageForm}</span>
          </div>
        </div>

        {/* Strength + Price Row */}
        <div className="mt-3 flex items-center justify-between">
          <span className="bg-sky-50 text-sky-800 text-xs font-bold px-3 py-1 rounded-lg border border-sky-200/80">
            {medicine.strength || medicine.dosageForm}
          </span>
          <div className="text-right">
            <span className="text-lg sm:text-xl font-black text-slate-900">
              ৳{typeof medicine.price === "number" ? medicine.price.toFixed(2) : medicine.price}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 ml-1">
              /{medicine.priceBasis || "unit"}
            </span>
          </div>
        </div>

        {/* Warnings */}
        {medicine.warnings && medicine.warnings.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-800 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>সতর্কতা (Clinical Caution)</span>
            </div>
            <div className="flex flex-col gap-1">
              {medicine.warnings.slice(0, 2).map((warning, i) => (
                <span
                  key={i}
                  className="bg-amber-50/90 text-amber-900 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-amber-200/80 leading-snug line-clamp-2"
                >
                  {warning}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Alternatives */}
        {medicine.alternatives && medicine.alternatives.length > 0 && (
          <div className="mt-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
              <span>সমমানের জেনেরিক বিকল্প (Same Generic Alternatives)</span>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200/70 divide-y divide-slate-200/60">
              {medicine.alternatives.slice(0, 3).map((alt, i) => {
                const altHref = alt.url || (alt.id ? `/medicines/${alt.id}` : "/medicines");
                return (
                  <Link
                    key={i}
                    href={altHref}
                    className="flex items-center justify-between px-3 py-2 hover:bg-sky-50/60 transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs text-slate-800 font-bold group-hover:text-sky-700 block truncate">
                        {alt.name}
                      </span>
                      {alt.manufacturer && (
                        <span className="text-[10px] text-slate-500 block truncate">
                          {alt.manufacturer}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 shrink-0">
                      ৳{typeof alt.price === "number" ? alt.price.toFixed(2) : alt.price}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Direct Action Link to Full Official Monograph */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href={detailUrl}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>সম্পূর্ণ অফিশিয়াল মনোগ্রাফ ও ডোজ দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
