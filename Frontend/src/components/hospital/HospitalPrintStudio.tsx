"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Palette,
  AlertTriangle,
} from "lucide-react";
import {
  DEFAULT_HOSPITAL_THEME,
  getHospitalThemeConfig,
} from "@/lib/hospital-hms";
import type { HospitalThemeConfig, HospitalThemeStyle } from "@/types/hospital-hms";
import { MANDATORY_BENGALI_DISCLAIMER } from "@/lib/ai-safety-guard";

export type PrintDocumentType =
  | "lab_report"
  | "sample_barcode"
  | "diagnostic_invoice"
  | "discharge_summary"
  | "opd_prescription";

export interface HospitalPrintStudioProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: PrintDocumentType;
  data: any;
  overrideTheme?: Partial<HospitalThemeConfig>;
}

const THEME_PRESETS: Record<
  HospitalThemeStyle,
  {
    label: string;
    accentHex: string;
    headerBg: string;
    headerText: string;
    borderClass: string;
    badgeClass: string;
  }
> = {
  singapore: {
    label: "Singapore Modern",
    accentHex: "#059669",
    headerBg: "bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700",
    headerText: "text-white",
    borderClass: "border-emerald-700",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  apollo: {
    label: "Apollo Clinical",
    accentHex: "#0369a1",
    headerBg: "bg-gradient-to-r from-slate-900 via-sky-900 to-cyan-800",
    headerText: "text-white",
    borderClass: "border-sky-800",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
  },
  royal: {
    label: "Royal Heritage",
    accentHex: "#92400e",
    headerBg: "bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900",
    headerText: "text-amber-50",
    borderClass: "border-amber-800",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-300",
  },
  minimal: {
    label: "Minimal Laser",
    accentHex: "#0f172a",
    headerBg: "bg-white border-b-2 border-slate-900",
    headerText: "text-slate-900",
    borderClass: "border-slate-900",
    badgeClass: "bg-slate-100 text-slate-900 border-slate-300",
  },
};

function BarcodeStrip({ code }: { code: string }) {
  const clean = (code || "OXPECKER-01").trim();
  const bars: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    bars.push((ch % 3) + 1, ((ch >> 2) % 2) + 1, 1);
  }
  return (
    <div className="inline-flex flex-col items-center">
      <div className="flex items-stretch h-8 bg-white px-1.5 py-0.5 border border-slate-300 rounded">
        {bars.slice(0, 42).map((w, idx) => (
          <span
            key={idx}
            style={{ width: `${w}px` }}
            className={idx % 2 === 0 ? "bg-slate-950 h-full inline-block" : "bg-transparent h-full inline-block"}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] font-bold tracking-widest text-slate-700 mt-0.5">
        {clean}
      </span>
    </div>
  );
}

export function HospitalPrintStudio({
  isOpen,
  onClose,
  documentType,
  data,
  overrideTheme,
}: HospitalPrintStudioProps) {
  const [themeConfig, setThemeConfig] = useState<HospitalThemeConfig>(() => ({
    ...DEFAULT_HOSPITAL_THEME,
    ...getHospitalThemeConfig(),
    ...overrideTheme,
  }));
  const [paperFormat, setPaperFormat] = useState<"A4" | "Thermal-80mm">(
    documentType === "sample_barcode" ? "Thermal-80mm" : "A4"
  );
  const [includeBengaliAi, setIncludeBengaliAi] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showStamp, setShowStamp] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("oxpecker-print-active");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("oxpecker-print-active");
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setPaperFormat(documentType === "sample_barcode" ? "Thermal-80mm" : "A4");
    fetch("/api/hospital/theme")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.theme) {
          setThemeConfig((prev) => ({ ...prev, ...res.theme, ...overrideTheme }));
        }
      })
      .catch(() => {});
  }, [isOpen, documentType, overrideTheme]);

  if (!isOpen || !data) return null;

  const preset = THEME_PRESETS[themeConfig.theme_style] || THEME_PRESETS.singapore;
  const isThermal = paperFormat === "Thermal-80mm";
  const verificationCode = data.qrHash || data.reportCode || data.accessionId || data.id || "OXPECKER-VERIFIED";
  const verifyUrl = `https://oxpecker.ai/verify/${encodeURIComponent(verificationCode)}`;

  const handlePrintNow = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/75 backdrop-blur-xs flex flex-col items-center overflow-y-auto p-3 sm:p-6">
      {/* Control Toolbar (hidden when printing) */}
      <div className="no-print w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-lg p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <Printer size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Hospital Branded Print Studio</h3>
            <p className="text-[11px] text-slate-500">
              Applies saved hospital theme, letterhead, barcode, QR seal & optional Bengali AI card.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Palette size={13} className="text-slate-500" />
            <select
              value={themeConfig.theme_style}
              onChange={(e) =>
                setThemeConfig((prev) => ({
                  ...prev,
                  theme_style: e.target.value as HospitalThemeStyle,
                }))
              }
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="singapore">Singapore Modern</option>
              <option value="apollo">Apollo Clinical</option>
              <option value="royal">Royal Heritage</option>
              <option value="minimal">Minimal Laser</option>
            </select>
          </div>

          {/* Paper Size Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setPaperFormat("A4")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                !isThermal ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              A4 Official
            </button>
            <button
              type="button"
              onClick={() => setPaperFormat("Thermal-80mm")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                isThermal ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              80mm Thermal
            </button>
          </div>

          {documentType === "lab_report" && (
            <button
              type="button"
              onClick={() => setIncludeBengaliAi((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                includeBengaliAi
                  ? "bg-sky-50 text-sky-800 border-sky-200"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              বাংলা AI: {includeBengaliAi ? "ON" : "OFF"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowWatermark((v) => !v)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
              showWatermark
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            Watermark: {showWatermark ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            onClick={() => setShowStamp((v) => !v)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
              showStamp
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            Seal: {showStamp ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            onClick={handlePrintNow}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer size={14} /> Print / Save PDF
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div
        id="oxpecker-print-sheet"
        className={`relative bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden transition-all ${
          isThermal
            ? "thermal-80mm w-full max-w-[340px] rounded-xl p-4 text-xs"
            : "w-full max-w-[820px] rounded-2xl p-6 sm:p-8 text-sm"
        }`}
      >
        {/* Background Watermark */}
        {showWatermark && themeConfig.watermark_enabled && !isThermal && (
          <div className="pointer-events-none fixed sm:absolute inset-0 flex items-center justify-center overflow-hidden select-none z-0">
            <span
              className="font-black uppercase tracking-[0.22em] text-4xl sm:text-5xl -rotate-25 whitespace-nowrap"
              style={{
                color: preset.accentHex,
                opacity: Math.min(0.14, Math.max(0.04, themeConfig.watermark_opacity || 0.07)),
              }}
            >
              {themeConfig.watermark_text || themeConfig.hospital_name}
            </span>
          </div>
        )}

        <div className="relative z-10 space-y-5">
          {/* Branded Letterhead Top Banner */}
          <div
            className={`${preset.headerBg} ${preset.headerText} ${
              isThermal ? "p-3 rounded-lg" : "p-5 rounded-xl"
            } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
          >
            <div className="flex items-start gap-3">
              {themeConfig.logo_url ? (
                <img
                  src={themeConfig.logo_url}
                  alt={themeConfig.hospital_name}
                  className="w-12 h-12 rounded-lg bg-white p-1 object-contain shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center font-black text-lg shrink-0">
                  {themeConfig.hospital_name.slice(0, 1)}
                </div>
              )}
              <div>
                <h2 className={`${isThermal ? "text-sm" : "text-lg sm:text-xl"} font-black tracking-tight`}>
                  {themeConfig.hospital_name}
                </h2>
                {!isThermal && (
                  <p className="text-[11px] opacity-90 font-medium">{themeConfig.hospital_tagline}</p>
                )}
                <p className="text-[10px] opacity-80 mt-0.5">
                  {themeConfig.hospital_address} • Hotline: {themeConfig.hospital_hotline}
                </p>
                {!isThermal && (
                  <p className="text-[10px] opacity-75 font-mono">
                    License: {themeConfig.license_no} • BIN: {themeConfig.tax_bin}
                  </p>
                )}
              </div>
            </div>

            {!isThermal && (
              <div className="bg-white/95 text-slate-900 rounded-xl p-2 flex items-center gap-2 shrink-0 self-start sm:self-center">
                <QRCodeSVG value={verifyUrl} size={46} />
                <div className="text-[9px] leading-tight font-mono">
                  <div className="font-black text-emerald-700">VERIFIED DOC</div>
                  <div>{verificationCode.slice(0, 14)}</div>
                </div>
              </div>
            )}
          </div>

          {/* SAMPLE BARCODE & TUBE SLIP */}
          {documentType === "sample_barcode" && (
            <div className="space-y-3 border-2 border-dashed border-slate-300 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Specimen Collection Label
                  </span>
                  <div className="text-base font-black text-slate-900">{data.patientName}</div>
                  <div className="text-[11px] text-slate-600">
                    {data.patientAge}Y / {data.patientGender} {data.smartCardUid ? `• ${data.smartCardUid}` : ""}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                    data.priority === "STAT"
                      ? "bg-rose-600 text-white"
                      : data.priority === "Urgent"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {data.priority || "ROUTINE"}
                </span>
              </div>
              <div className="flex justify-center py-1">
                <BarcodeStrip code={data.accessionId || data.id} />
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="font-bold text-slate-700">Ordered Tests & Tubes:</div>
                {(data.tests || []).map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <span className="font-semibold text-slate-800">{t.code}: {t.name}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{t.specimen}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between pt-2 border-t border-slate-200">
                <span>Ref: {data.referringDoctor || "Walk-In"}</span>
                <span>{new Date(data.createdAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* LAB & RADIOLOGY REPORT */}
          {documentType === "lab_report" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${preset.badgeClass}`}>
                    {data.dept || "Pathology"} Department Report
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">{data.test}</h3>
                </div>
                <BarcodeStrip code={data.accessionId || data.reportCode || data.id} />
              </div>

              {/* Patient Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                  <span className="font-black text-slate-900">{data.patient}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Sex</span>
                  <span className="font-bold text-slate-800">{data.age} Yrs / {data.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Referred By</span>
                  <span className="font-bold text-slate-800">{data.doctor}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Report Date / Status</span>
                  <span className="font-bold text-slate-800">{data.date} • {data.status}</span>
                </div>
              </div>

              {/* Structured Parameters Table */}
              {Array.isArray(data.parameters) && data.parameters.length > 0 && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black">
                      <tr>
                        <th className="py-2.5 px-3">Investigation Parameter</th>
                        <th className="py-2.5 px-3">Result</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Biological Ref. Range</th>
                        <th className="py-2.5 px-3 text-right">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.parameters.map((p: any, idx: number) => {
                        const flagColor =
                          p.flag === "Critical"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : p.flag === "High"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : p.flag === "Low"
                            ? "bg-sky-100 text-sky-800 border-sky-300"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200";
                        return (
                          <tr key={idx} className={p.flag === "Critical" ? "bg-rose-50/40" : ""}>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                            <td className={`py-2.5 px-3 font-black font-mono ${p.flag !== "Normal" ? "text-rose-700" : "text-slate-900"}`}>
                              {p.value}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{p.unit || "—"}</td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{p.refRange || "—"}</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${flagColor}`}>
                                {p.flag}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Clinical Findings / Interpretation */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  data.status === "Critical Alert"
                    ? "bg-rose-50 border-rose-300 text-rose-900"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="font-black uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5">
                  {data.status === "Critical Alert" && <AlertTriangle size={13} className="text-rose-600" />}
                  Clinical Findings & Pathologist Impression
                </div>
                <p className="font-medium">{data.keyFindings}</p>
              </div>

              {/* Optional Bengali AI Patient Explanation Appendix */}
              {includeBengaliAi && data.bengaliSummary && (
                <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sky-900 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-sky-600" />
                      রোগীর জন্য সহজ বাংলা AI সারসংক্ষেপ (Assistive Guide)
                    </span>
                    {data.recommendedSpecialist && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-sky-200 text-sky-800">
                        পরামর্শ: {data.recommendedSpecialist}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-line font-medium leading-relaxed text-[11px]">
                    {data.bengaliSummary.includes(MANDATORY_BENGALI_DISCLAIMER)
                      ? data.bengaliSummary
                      : `${data.bengaliSummary}\n\n${MANDATORY_BENGALI_DISCLAIMER}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* DIAGNOSTIC INVOICE / MONEY RECEIPT */}
          {documentType === "diagnostic_invoice" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${preset.badgeClass}`}>
                    Official Diagnostic Cash Receipt
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    Invoice / Accession: {data.accessionId || data.id}
                  </div>
                </div>
                {!isThermal && <BarcodeStrip code={data.accessionId || data.id} />}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">PATIENT</span>
                  <span className="font-black text-slate-900">{data.patientName}</span>
                  <div className="text-[11px] text-slate-500">{data.patientPhone || ""}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block text-[10px]">PAYMENT METHOD</span>
                  <span className="font-black text-slate-900">{data.paymentMethod || "Cash"}</span>
                  <div className="text-[11px] text-emerald-700 font-bold">{data.paymentStatus || "Paid"}</div>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Test / Service</th>
                    <th className="py-2 px-3 text-right">Fee (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.tests || []).map((t: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {t.name} <span className="text-[10px] text-slate-400 font-mono">({t.code})</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">৳ {Number(t.price || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Gross Subtotal</span>
                  <span className="font-mono font-bold">৳ {Number(data.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Concession / Discount</span>
                  <span className="font-mono font-bold">- ৳ {Number(data.discountAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                  <span>Net Paid ({data.paymentMethod || "Cash"})</span>
                  <span className="font-mono">৳ {Number(data.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Balance Due</span>
                  <span className="font-mono">
                    ৳ {Math.max(0, Number(data.totalAmount || 0) - Number(data.discountAmount || 0) - Number(data.paidAmount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* IPD DISCHARGE SUMMARY & OPD PRESCRIPTION */}
          {(documentType === "discharge_summary" || documentType === "opd_prescription") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${preset.badgeClass}`}>
                    {documentType === "discharge_summary"
                      ? "Inpatient Clinical Discharge Summary"
                      : "Outpatient Clinical Sheet"}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {data.patient_name || data.patientName} ({data.id})
                  </h3>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-800">{data.bed_name || "OPD Chamber"}</div>
                  <div className="text-slate-500">Admitted: {data.admission_date || data.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">AGE / GENDER</span>
                  <span className="font-bold">{data.age}Y / {data.gender} ({data.blood_group || "N/A"})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">HEALTHPASS UID</span>
                  <span className="font-mono font-bold text-emerald-700">{data.smart_card_uid || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">ATTENDING CONSULTANT</span>
                  <span className="font-bold">{data.attending_doctor || "Attending Physician"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">CONDITION AT DISCHARGE</span>
                  <span className="font-bold text-emerald-700">{data.condition || "Stable / Improved"}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="font-black uppercase text-[10px] text-slate-500">Primary Diagnosis & Clinical Course</div>
                <p className="font-bold text-slate-900">{data.primary_diagnosis || "Clinical Observation"}</p>
                {Array.isArray(data.notes) && data.notes.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="font-bold text-slate-600">Ward Progress & Vitals Notes:</div>
                    {data.notes.slice(0, 5).map((n: any, idx: number) => (
                      <div key={idx} className="text-[11px] bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100">
                        <span className="font-bold text-slate-800">[{n.noteType}]</span> {n.summary}
                        <span className="text-slate-400 ml-2">— {n.recordedBy}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs">
                <div className="font-black uppercase text-[10px] text-emerald-800 mb-1">
                  Discharge Advice & Follow-Up Plan
                </div>
                <p className="font-medium text-slate-800">
                  {data.advice ||
                    "Continue prescribed oral medications as scheduled. Maintain low-salt balanced diet. Report immediately to ER in case of chest pain, breathlessness, or high fever. Routine OPD follow-up in 7 days."}
                </p>
              </div>
            </div>
          )}

          {/* Signatory, Stamp & Authenticity Footer */}
          <div className="pt-4 mt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              {showStamp && themeConfig.stamp_enabled && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 font-black text-[10px] uppercase tracking-wider"
                  style={{
                    borderColor: themeConfig.stamp_color || preset.accentHex,
                    color: themeConfig.stamp_color || preset.accentHex,
                  }}
                >
                  <ShieldCheck size={13} />
                  {themeConfig.stamp_text || "OFFICIALLY VERIFIED & AUTHORIZED"}
                </div>
              )}
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600" />
                Digitally authenticated via Oxpecker Enterprise HMS/LIS • {new Date().toLocaleDateString()}
              </div>
            </div>

            {!isThermal && (
              <div className="text-right text-xs border-t border-slate-300 pt-1.5 min-w-[210px]">
                <div className="font-black text-slate-900">
                  {data.signedBy || themeConfig.signatory_name || "Prof. Dr. Selina Akter, MD"}
                </div>
                <div className="text-[10px] text-slate-600">
                  {data.signedByDegrees || themeConfig.signatory_designation || "Chief Consultant Pathologist"}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {data.signedByBmdc || themeConfig.signatory_bmdc || "BMDC-A-21904"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
