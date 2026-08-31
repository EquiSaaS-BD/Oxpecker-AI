"use client";

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
} from "lucide-react";

interface Medicine {
  brandName: string;
  genericName: string;
  manufacturer: string;
  strength: string;
  price: number;
  availability: boolean;
  dosageForm: string;
  warnings: string[];
  alternatives: { name: string; price: number }[];
}

function getDosageIcon(form: string) {
  const f = form.toLowerCase();
  if (f.includes("syrup") || f.includes("liquid") || f.includes("suspension"))
    return Droplets;
  if (f.includes("injection") || f.includes("injectable")) return Syringe;
  if (f.includes("capsule")) return CircleDot;
  return Pill;
}

export function MedicineCard({ medicine }: { medicine: Medicine }) {
  const DosageIcon = getDosageIcon(medicine.dosageForm);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm w-full max-w-md overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shadow-sm">
          <DosageIcon className="w-6 h-6 text-purple-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            {medicine.brandName}
          </h3>
          <p className="text-sm text-slate-500 italic mt-0.5">
            {medicine.genericName}
          </p>
        </div>

        {/* Availability Badge */}
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
            medicine.availability
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {medicine.availability ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Factory className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="truncate">{medicine.manufacturer}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Package className="w-4 h-4 text-slate-500 shrink-0" />
          <span>{medicine.dosageForm}</span>
        </div>
      </div>

      {/* Strength + Price Row */}
      <div className="mt-3 flex items-center justify-between">
        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
          {medicine.strength}
        </span>
        <span className="text-xl font-bold text-[#09E083]">
          ৳{medicine.price}
        </span>
      </div>

      {/* Warnings */}
      {medicine.warnings && medicine.warnings.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Warnings
          </div>
          <div className="flex flex-wrap gap-1.5">
            {medicine.warnings.map((warning, i) => (
              <span
                key={i}
                className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-amber-200"
              >
                {warning}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {medicine.alternatives && medicine.alternatives.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <ArrowRightLeft className="w-4 h-4 text-slate-500" />
            Alternatives
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
            {medicine.alternatives.map((alt, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3.5 py-2.5"
              >
                <span className="text-sm text-slate-700 font-medium">
                  {alt.name}
                </span>
                <span className="text-sm font-semibold text-[#09E083]">
                  ৳{alt.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
