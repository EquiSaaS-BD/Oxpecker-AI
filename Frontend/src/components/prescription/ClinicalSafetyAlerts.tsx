"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { ClinicalSafetyReport, ClinicalAlert } from "@/lib/clinical-safety";
import { Button } from "@/components/ui/button";

interface ClinicalSafetyAlertsProps {
  report: ClinicalSafetyReport;
  language?: "en" | "bn";
  className?: string;
}

export function ClinicalSafetyAlerts({
  report,
  language = "bn",
  className = ""
}: ClinicalSafetyAlertsProps) {
  const isBn = language === "bn";
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!report || report.alerts.length === 0) {
    return null;
  }

  const { overallRisk, alerts, hasCriticalAlerts } = report;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getSeverityBadge = (severity: ClinicalAlert["severity"]) => {
    switch (severity) {
      case "CONTRAINDICATED":
        return {
          bg: "bg-red-600 text-white",
          border: "border-red-600/30",
          cardBg: "bg-red-50/70 dark:bg-red-950/20",
          icon: <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400" />,
          label: isBn ? "সম্পূর্ণ নিষিদ্ধ (Contraindicated)" : "Contraindicated"
        };
      case "ALLERGY_WARNING":
        return {
          bg: "bg-rose-600 text-white",
          border: "border-rose-600/30",
          cardBg: "bg-rose-50/70 dark:bg-rose-950/20",
          icon: <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
          label: isBn ? "অ্যালার্জি সতর্কতা" : "Allergy Hazard"
        };
      case "MAJOR":
        return {
          bg: "bg-amber-600 text-white",
          border: "border-amber-500/30",
          cardBg: "bg-amber-50/60 dark:bg-amber-950/20",
          icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
          label: isBn ? "গুরুত্বপূর্ণ ইন্টারঅ্যাকশন" : "Major Interaction"
        };
      case "DUPLICATE_THERAPY":
        return {
          bg: "bg-orange-600 text-white",
          border: "border-orange-500/30",
          cardBg: "bg-orange-50/60 dark:bg-orange-950/20",
          icon: <Copy className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
          label: isBn ? "ডুপ্লিকেট থেরাপি (একই ওষুধ)" : "Duplicate Therapy"
        };
      case "MODERATE":
      default:
        return {
          bg: "bg-yellow-600 text-white",
          border: "border-yellow-500/30",
          cardBg: "bg-yellow-50/50 dark:bg-yellow-950/15",
          icon: <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
          label: isBn ? "সতর্কতা ও টাইমিং" : "Moderate Risk"
        };
    }
  };

  return (
    <div className={`rounded-2xl border ${hasCriticalAlerts ? "border-red-500/30 bg-red-50/30 dark:bg-red-950/10" : "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10"} p-5 shadow-sm ${className}`}>
      {/* Banner Header */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ${hasCriticalAlerts ? "bg-red-600" : "bg-amber-600"}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                {isBn ? "ক্লিনিক্যাল প্রেসক্রিপশন সেফটি অ্যালার্ট" : "Clinical Prescription Safety Alerts"}
              </h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${hasCriticalAlerts ? "bg-red-600 text-white" : "bg-amber-600 text-white"}`}>
                {alerts.length} {isBn ? "টি সতর্কতা" : "Alerts"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isBn 
                ? "DGHS ও BMDC সেফটি গাইডলাইন: ড্রাগ-ড্রাগ ইন্টারঅ্যাকশন ও ওভারডোজ প্রতিরোধ" 
                : "DGHS & BMDC Clinical Protocol: Drug-drug interaction & overdose protection"}
            </p>
          </div>
        </div>

        {/* DGHS Badge */}
        <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <Sparkles className="h-3 w-3 text-sky-600" />
          DGHS SHR Verified
        </span>
      </div>

      {/* Alert Items List */}
      <div className="mt-4 space-y-3">
        {alerts.map((alert) => {
          const config = getSeverityBadge(alert.severity);
          const isExpanded = expandedId === alert.id;

          return (
            <div 
              key={alert.id}
              className={`rounded-xl border ${config.border} ${config.cardBg} transition-all duration-200 overflow-hidden`}
            >
              <div 
                className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
                onClick={() => toggleExpand(alert.id)}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${config.bg}`}>
                        {config.label}
                      </span>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {isBn ? alert.headlineBn : alert.headlineEn}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                      <span className="font-semibold underline decoration-neutral-300">
                        {alert.drugA.brand || alert.drugA.name}
                      </span>
                      {alert.drugB && (
                        <>
                          <span className="text-neutral-400">+</span>
                          <span className="font-semibold underline decoration-neutral-300">
                            {alert.drugB.brand || alert.drugB.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 shrink-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {/* Collapsible Clinical Details */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-neutral-200/50 dark:border-neutral-800/60 text-xs space-y-2">
                  <div>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">
                      {isBn ? "ক্লিনিক্যাল ঝুঁকি:" : "Clinical Risk:"}
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {alert.clinicalRisk}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">
                      {isBn ? "চিকিৎসকের করণীয় ও সমাধান:" : "Management Advice:"}
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      {isBn ? alert.managementAdviceBn : alert.managementAdviceEn}
                    </p>
                  </div>

                  <div className="pt-1 text-[11px] text-neutral-400 dark:text-neutral-500 italic">
                    {isBn ? "মেকানিজম:" : "Pharmacological Mechanism:"} {alert.mechanism}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
