"use client";

import { motion } from "framer-motion";
import { Pill, AlertTriangle, DollarSign, ArrowRight, ShieldAlert, Clock } from "lucide-react";

interface PrescriptionData {
  patientName?: string;
  doctorName?: string;
  date?: string;
  medicines?: {
    name: string;
    generic?: string;
    strength?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
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
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Pill size={18} />
          <span className="font-bold text-[15px]">Prescription Analysis</span>
        </div>
        {data.date && (
          <span className="text-[12px] bg-white/20 text-white px-2.5 py-1 rounded-lg font-medium">{data.date}</span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Patient & Doctor */}
        {(data.patientName || data.doctorName) && (
          <div className="flex gap-4 text-[13px]">
            {data.patientName && (
              <div>
                <span className="text-slate-400 font-medium">Patient: </span>
                <span className="text-slate-700 font-bold">{data.patientName}</span>
              </div>
            )}
            {data.doctorName && (
              <div>
                <span className="text-slate-400 font-medium">Doctor: </span>
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
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Medicines ({data.medicines.length})</p>
            <div className="space-y-2">
              {data.medicines.map((med, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800 text-[14px]">{med.name} {med.strength && <span className="text-slate-500 font-medium">{med.strength}</span>}</p>
                      {med.generic && <p className="text-[12px] text-slate-400 italic">{med.generic}</p>}
                    </div>
                    {med.estimatedPrice !== undefined && (
                      <span className="text-[13px] font-bold text-emerald-600 shrink-0">৳{med.estimatedPrice}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px] text-slate-500">
                    {med.dosage && <span className="flex items-center gap-1"><Pill size={11} /> {med.dosage}</span>}
                    {med.frequency && <span className="flex items-center gap-1"><Clock size={11} /> {med.frequency}</span>}
                    {med.duration && <span>Duration: {med.duration}</span>}
                  </div>
                  {med.instructions && (
                    <p className="text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded-md mt-2 font-medium">{med.instructions}</p>
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
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">💡 Cheaper Alternatives</p>
            <div className="space-y-1.5">
              {data.genericAlternatives.map((alt, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px]">
                  <span className="text-slate-500">{alt.original}</span>
                  <ArrowRight size={12} className="text-slate-300" />
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
