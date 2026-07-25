"use client";

import { motion } from "framer-motion";
import { Search, AlertCircle, Stethoscope, ShieldCheck, Activity } from "lucide-react";

interface ReportData {
  reportType?: string;
  patientName?: string;
  date?: string;
  lab?: string;
  parameters?: {
    name: string;
    value: string;
    unit: string;
    normalRange: string;
    status: string;
    riskLevel: string;
  }[];
  summary?: string;
  abnormalCount?: number;
  criticalCount?: number;
  recommendedSpecialist?: string;
  urgency?: string;
}

export function ReportCard({ data }: { data: ReportData }) {
  const urgencyColors: Record<string, string> = {
    routine: 'text-emerald-600 bg-emerald-50',
    soon: 'text-amber-600 bg-amber-50',
    urgent: 'text-rose-600 bg-rose-50',
  };

  const statusColors: Record<string, string> = {
    normal: 'text-emerald-700 bg-emerald-50',
    low: 'text-amber-700 bg-amber-50',
    high: 'text-rose-700 bg-rose-50',
    critical: 'text-red-700 bg-red-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-[520px]"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Activity size={18} />
          <span className="font-bold text-[15px]">{data.reportType || 'Report'} Analysis</span>
        </div>
        {data.urgency && (
          <span className={`text-[12px] px-2.5 py-1 rounded-lg font-bold capitalize ${urgencyColors[data.urgency] || 'text-slate-600 bg-slate-100'}`}>
            {data.urgency}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-slate-50 rounded-xl p-3">
            <p className="text-[24px] font-black text-slate-800">{data.parameters?.length || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium">Parameters</p>
          </div>
          <div className="text-center bg-amber-50 rounded-xl p-3">
            <p className="text-[24px] font-black text-amber-600">{data.abnormalCount || 0}</p>
            <p className="text-[11px] text-amber-500 font-medium">Abnormal</p>
          </div>
          <div className="text-center bg-rose-50 rounded-xl p-3">
            <p className="text-[24px] font-black text-rose-600">{data.criticalCount || 0}</p>
            <p className="text-[11px] text-rose-500 font-medium">Critical</p>
          </div>
        </div>

        {/* Parameters Table */}
        {data.parameters && data.parameters.length > 0 && (
          <div>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Test Results</p>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-1 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Parameter</span>
                <span className="text-center">Value</span>
                <span className="text-center">Normal</span>
                <span className="text-center">Status</span>
              </div>
              {data.parameters.slice(0, 8).map((p, i) => (
                <div key={i} className={`grid grid-cols-4 gap-1 px-3 py-2.5 text-[13px] border-t border-slate-50 ${p.status !== 'normal' ? 'bg-rose-50/30' : ''}`}>
                  <span className="font-medium text-slate-700 truncate">{p.name}</span>
                  <span className={`text-center font-bold ${p.status !== 'normal' ? 'text-rose-600' : 'text-slate-800'}`}>{p.value} <span className="text-[10px] text-slate-400">{p.unit}</span></span>
                  <span className="text-center text-slate-400 text-[12px]">{p.normalRange}</span>
                  <span className="text-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md capitalize ${statusColors[p.status] || 'text-slate-600 bg-slate-50'}`}>
                      {p.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialist */}
        {data.recommendedSpecialist && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <Stethoscope size={18} className="text-blue-500 shrink-0" />
            <div>
              <p className="text-[12px] text-blue-400 font-medium">Recommended Specialist</p>
              <p className="text-[14px] font-bold text-blue-700">{data.recommendedSpecialist}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
