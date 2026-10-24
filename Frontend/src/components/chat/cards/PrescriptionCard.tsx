"use client";

import { motion } from "framer-motion";
import { Pill, AlertTriangle, DollarSign, ArrowRight, ShieldAlert, Clock } from "lucide-react";

interface PrescriptionData {
  patientName?: string;
  doctorName?: string;
  date?: string;
  prescriptionDate?: string | null;
  imageQuality?: { status?: string; reasons?: string[] };
  uncertainFields?: string[];
  rawOcrText?: string | null;
  manualReviewRequired?: boolean;
  medicines?: {
    name?: string | null;
    brandName?: string | null;
    generic?: string;
    genericName?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    packageSize?: string | null;
    dose?: string | null;
    dosage?: string;
    frequency?: string;
    duration?: string | null;
    route?: string | null;
    instructions?: string | null;
    instructionsTranscribed?: string | null;
    confidence?: string;
    fieldConfidence?: Record<string, string>;
    evidence?: string | null;
    estimatedPrice?: number;
  }[];
  diagnosis?: string;
  totalEstimatedCost7Days?: number;
  totalEstimatedCost15Days?: number;
  totalEstimatedCost30Days?: number;
  warnings?: string[];
  genericAlternatives?: { original: string; alternative: string; savings: string }[];
}

export function PrescriptionCard({ data }: { data: PrescriptionData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-[520px]"
    >
      {/* Header */}
      <div className="bg-sky-50 border-b border-sky-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-800">
          <Pill size={18} />
          <span className="font-bold text-[15px]">Prescription Analysis</span>
        </div>
        {(data.prescriptionDate || data.date) && (
          <span className="text-[12px] bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg font-semibold">{data.prescriptionDate || data.date}</span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {(data.manualReviewRequired || data.imageQuality?.status === "partially_readable" || data.imageQuality?.status === "unreadable") && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900">
            <p className="font-bold">OCR draft — clinician or pharmacist must verify every field.</p>
            {data.imageQuality?.status && <p className="mt-1">Image readability: {data.imageQuality.status.replaceAll("_", " ")}{data.imageQuality.reasons?.length ? ` · ${data.imageQuality.reasons.join(", ")}` : ""}</p>}
            {data.uncertainFields?.length ? <p className="mt-1">Needs review: {data.uncertainFields.join(" · ")}</p> : null}
          </div>
        )}
        {data.rawOcrText && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs font-bold text-slate-600 mb-1">Raw OCR text — verify against the original</p>
            <pre className="whitespace-pre-wrap text-sm text-slate-800 font-sans">{data.rawOcrText}</pre>
          </div>
        )}
        {/* Patient & Doctor */}
        {(data.patientName || data.doctorName) && (
          <div className="flex gap-4 text-[13px]">
            {data.patientName && (
              <div>
                <span className="text-slate-500 font-medium">Patient: </span>
                <span className="text-slate-700 font-bold">{data.patientName}</span>
              </div>
            )}
            {data.doctorName && (
              <div>
                <span className="text-slate-500 font-medium">Doctor: </span>
                <span className="text-slate-700 font-bold">{data.doctorName}</span>
              </div>
            )}
          </div>
        )}

        {data.diagnosis && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
            <p className="text-[12px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Diagnosis</p>
            <p className="text-[14px] font-semibold text-blue-700">{data.diagnosis}</p>
          </div>
        )}

        {/* Medicine List */}
        {data.medicines && data.medicines.length > 0 && (
          <div>
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Medicines ({data.medicines.length})</p>
            <div className="space-y-2">
              {data.medicines.map((med, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800 text-[14px]">{med.brandName || med.name || "ওষুধের নাম পড়া যায়নি"} {(med.strength || med.dosageForm) && <span className="text-slate-500 font-medium">{[med.strength, med.dosageForm].filter(Boolean).join(" · ")}</span>}</p>
                      {(med.genericName || med.generic) && <p className="text-[12px] text-slate-500 italic">{med.genericName || med.generic}</p>}
                      {med.confidence && <p className="text-[11px] text-amber-700 mt-1">Visual reading confidence: {med.confidence} (not calibrated)</p>}
                    </div>
                    {med.estimatedPrice !== undefined && (
                      <span className="text-[13px] font-bold text-emerald-600 shrink-0">৳{med.estimatedPrice}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px] text-slate-500">
                    {(med.dose || med.dosage) && <span className="flex items-center gap-1"><Pill size={11} /> {med.dose || med.dosage}</span>}
                    {med.frequency && <span className="flex items-center gap-1"><Clock size={11} /> {med.frequency}</span>}
                    {med.duration && <span>Duration: {med.duration}</span>}
                    {med.route && <span>Route: {med.route}</span>}
                  </div>
                  {(med.instructionsTranscribed || med.instructions) && (
                    <p className="text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded-md mt-2 font-medium">{med.instructionsTranscribed || med.instructions}</p>
                  )}
                  {med.evidence && <p className="text-[11px] text-slate-500 mt-2">Visible text: “{med.evidence}”</p>}
                  {med.fieldConfidence && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 border-t border-slate-200 pt-2">
                      {([
                        ["brandName", "Brand"], ["genericName", "Generic as written"], ["strength", "Strength"],
                        ["dosageForm", "Form"], ["packageSize", "Package"], ["dose", "Dose"], ["frequency", "Frequency"],
                        ["duration", "Duration"], ["route", "Route"], ["instructionsTranscribed", "Instructions"],
                      ] as const).map(([field, label]) => {
                        const values: Record<string, string | null | undefined> = {
                          brandName: med.brandName, genericName: med.genericName, strength: med.strength,
                          dosageForm: med.dosageForm, packageSize: med.packageSize, dose: med.dose, frequency: med.frequency,
                          duration: med.duration, route: med.route,
                          instructionsTranscribed: med.instructionsTranscribed,
                        };
                        const value = values[field];
                        const confidence = med.fieldConfidence?.[field] || "uncertain";
                        return <div key={field} className="text-[11px]">
                          <span className="text-slate-500">{label}: </span>
                          <span className="text-slate-800">{value || "পড়া যায়নি"}</span>
                          <span className="text-amber-700"> · {confidence}</span>
                        </div>;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        {(data.totalEstimatedCost7Days || data.totalEstimatedCost30Days) && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1"><DollarSign size={13} /> Cost Estimate</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {data.totalEstimatedCost7Days && (
                <div>
                  <p className="text-[11px] text-emerald-400 font-medium">7 Days</p>
                  <p className="text-[18px] font-black text-emerald-700">৳{data.totalEstimatedCost7Days}</p>
                </div>
              )}
              {data.totalEstimatedCost15Days && (
                <div>
                  <p className="text-[11px] text-emerald-400 font-medium">15 Days</p>
                  <p className="text-[18px] font-black text-emerald-700">৳{data.totalEstimatedCost15Days}</p>
                </div>
              )}
              {data.totalEstimatedCost30Days && (
                <div>
                  <p className="text-[11px] text-emerald-400 font-medium">30 Days</p>
                  <p className="text-[18px] font-black text-emerald-700">৳{data.totalEstimatedCost30Days}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warnings */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <p className="text-[12px] font-bold text-amber-600 mb-1.5 flex items-center gap-1"><AlertTriangle size={13} /> Warnings</p>
            <ul className="space-y-1">
              {data.warnings.map((w, i) => (
                <li key={i} className="text-[12px] text-amber-700 flex items-start gap-1.5">
                  <ShieldAlert size={12} className="shrink-0 mt-0.5" /> {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Generic Alternatives */}
        {data.genericAlternatives && data.genericAlternatives.length > 0 && (
          <div>
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cheaper Alternatives</p>
            <div className="space-y-1.5">
              {data.genericAlternatives.map((alt, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px]">
                  <span className="text-slate-500">{alt.original}</span>
                  <ArrowRight size={12} className="text-slate-600" />
                  <span className="text-emerald-600 font-bold">{alt.alternative}</span>
                  <span className="text-[11px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-medium">Save {alt.savings}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
