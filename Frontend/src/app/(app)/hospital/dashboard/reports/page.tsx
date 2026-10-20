"use client";

import { useState } from "react";
import { FileText, Search, Download, CheckCircle2, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";

const mockReports = [
  { id: "RPT-4401", patient: "Kamrul Hasan", test: "Echocardiogram (2D Color Doppler)", dept: "Cardiology", doctor: "Prof. Dr. Anisur Rahman", date: "20 Oct 2026", status: "Verified" },
  { id: "RPT-4402", patient: "Al Amin Sheikh", test: "Cardiac Troponin I (High Sensitive)", dept: "Pathology", doctor: "Dr. Anisur Rahman", date: "20 Oct 2026", status: "Verified" },
  { id: "RPT-4403", patient: "Nasreen Akter", test: "Anomaly Scan (4D Ultrasound)", dept: "Radiology", doctor: "Dr. Farzana Yasmin", date: "19 Oct 2026", status: "Verified" },
  { id: "RPT-4404", patient: "Shahidul Islam", test: "Brain MRI with Contrast", dept: "Neuro-Radiology", doctor: "Dr. Mahmudul Hasan", date: "20 Oct 2026", status: "Processing" },
];

export default function HospitalReportsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Test Reports & Diagnostics Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">Laboratory results, pathology analyses, and radiological image scans.</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by test name, patient, or report ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Lab / Dept</th>
                <th className="py-3 px-4">Referred By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockReports.map((rpt) => (
                <tr key={rpt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{rpt.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{rpt.patient}</td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold">{rpt.test}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-semibold text-xs">{rpt.dept}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">{rpt.doctor}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      rpt.status === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {rpt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => toast.success(`Exporting ${rpt.id} PDF`)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 justify-end ml-auto cursor-pointer">
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
