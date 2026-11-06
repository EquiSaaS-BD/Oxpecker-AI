"use client";

import React from "react";
import { Sparkles, TrendingDown, ArrowRight, ShieldCheck, CheckCircle2, DollarSign } from "lucide-react";
import { PrescriptionSavingsReport, GenericAlternativeOption } from "@/lib/prescription-savings";
import { Button } from "@/components/ui/button";

interface PrescriptionSavingsCardProps {
  savingsReport: PrescriptionSavingsReport;
  onApplyAlternative?: (originalId: string | number, alternative: GenericAlternativeOption) => void;
  language?: "en" | "bn";
}

export function PrescriptionSavingsCard({
  savingsReport,
  onApplyAlternative,
  language = "bn"
}: PrescriptionSavingsCardProps) {
  const isBn = language === "bn";

  if (!savingsReport || savingsReport.items.length === 0) {
    return null;
  }

  const {
    currentTotalCostBdt,
    optimizedTotalCostBdt,
    totalSavingsBdt,
    savingsPercentage,
    items,
    currencySymbol
  } = savingsReport;

  const hasSavings = totalSavingsBdt > 0;

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-white dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-neutral-900 p-5 shadow-sm">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {isBn ? "সাশ্রয়ী জেনেরিক সেভিংস ইঞ্জিন" : "Affordable Generic Savings Engine"}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3 w-3" />
                {isBn ? "DGDA সমমানের বিকল্প" : "DGDA Approved Equivalence"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isBn 
                ? "সোশ্যাল বিজনেস ইনিশিয়েটিভ: রোগীদের প্রেসক্রিপশন খরচে সর্বোচ্চ সাশ্রয় নিশ্চিতকরণ" 
                : "Social Business Initiative: Maximizing prescription affordability"}
            </p>
          </div>
        </div>

        {/* Big Savings Scoreboard */}
        {hasSavings && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-600 text-white px-4 py-2 shadow-sm">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">
                {isBn ? "মোট সাশ্রয়" : "Total Savings"}
              </span>
              <p className="text-xl font-bold leading-none">
                {currencySymbol} {totalSavingsBdt}
              </p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="rounded-lg bg-white/20 px-2 py-1 text-center font-bold text-xs">
              {savingsPercentage}% {isBn ? "সাশ্রয়" : "OFF"}
            </div>
          </div>
        )}
      </div>

      {/* Cost Comparison Summary */}
      <div className="my-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-800/60 p-3">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {isBn ? "বর্তমান প্রেসক্রিপশন খরচ" : "Current Prescribed Total"}
          </span>
          <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
            {currencySymbol} {currentTotalCostBdt > 0 ? currentTotalCostBdt : "--"}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/20 p-3">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {isBn ? "সাশ্রয়ী বিকল্পে খরচ" : "Optimized Generic Total"}
          </span>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
            {currencySymbol} {optimizedTotalCostBdt > 0 ? optimizedTotalCostBdt : "--"}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-teal-200 dark:border-teal-800/50 bg-teal-50/50 dark:bg-teal-900/20 p-3 flex flex-col justify-center">
          <span className="text-xs text-teal-700 dark:text-teal-300 font-medium">
            {isBn ? "সাধারণ মানুষের সাশ্রয়" : "Patient Savings"}
          </span>
          <p className="text-lg font-bold text-teal-800 dark:text-teal-200 mt-0.5">
            {hasSavings ? `${currencySymbol} ${totalSavingsBdt} (${savingsPercentage}%)` : (isBn ? "ইতোমধ্যেই সবচেয়ে সাশ্রয়ী" : "Already Optimal")}
          </p>
        </div>
      </div>

      {/* Alternative Recommendations Table */}
      {hasSavings && (
        <div className="mt-4 space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {isBn ? "সাশ্রয়ী বিকল্প ওষুধের তালিকা:" : "Recommended Equivalent Alternatives:"}
          </h4>

          <div className="divide-y divide-emerald-100 dark:divide-neutral-800 rounded-xl border border-emerald-200/60 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 overflow-hidden">
            {items.filter(i => i.hasCheaperAlternative && i.bestAlternative).map((item, idx) => {
              const orig = item.prescribedMedicine;
              const alt = item.bestAlternative!;

              return (
                <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-50/30 dark:hover:bg-neutral-800/40 transition-colors">
                  {/* Current vs Alternative */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {orig.brand_name}
                        </span>
                        <span className="text-xs text-neutral-400">({orig.generic_name})</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {isBn ? "বর্তমান:" : "Current:"} {currencySymbol} {item.currentUnitPrice}/unit • {orig.manufacturer || "Current Brand"}
                      </p>
                    </div>

                    <ArrowRight className="h-4 w-4 text-emerald-600 shrink-0" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate">
                          {alt.brand_name}
                        </span>
                        {alt.isTopTierManufacturer && (
                          <span title="Top Tier DGDA Manufacturer" className="inline-flex items-center">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {currencySymbol} {alt.unit_price_bdt}/unit • {alt.manufacturer}
                      </p>
                    </div>
                  </div>

                  {/* Savings & Switch Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                    <div className="text-right">
                      <span className="inline-block text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {isBn ? `৳ ${alt.savingsTotalBdt} বাঁচবে` : `Save ৳ ${alt.savingsTotalBdt}`}
                      </span>
                    </div>

                    {onApplyAlternative && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:border-emerald-500 dark:text-emerald-300"
                        onClick={() => onApplyAlternative(orig.id, alt)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        {isBn ? "বিকল্প নিন" : "Switch Brand"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span>
          {isBn
            ? "সবকটি বিকল্প ওষুধ ঔষধ প্রশাসন অধিদপ্তর (DGDA) কর্তৃক রেজিস্ট্রিকৃত এবং সক্রিয় উপাদানে ১০০% সমতুল্য।"
            : "All alternatives are DGDA-certified identical generic formulations from approved manufacturers."}
        </span>
      </div>
    </div>
  );
}
