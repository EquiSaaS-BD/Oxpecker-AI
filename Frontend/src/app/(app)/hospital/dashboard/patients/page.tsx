"use client";

import { useState } from "react";
import { UserPlus, Search, BedDouble, ShieldCheck, HeartPulse, FileText } from "lucide-react";
import { toast, Toaster } from "sonner";

const mockPatients = [
  { id: "ADM-1029", name: "Al Amin Sheikh", age: 52, gender: "Male", blood: "O+", bed: "Cabin 304", doctor: "Prof. Dr. Anisur Rahman", admitted: "18 Oct 2026", condition: "Stable", healthPass: true },
  { id: "ADM-1030", name: "Mst. Rehana Parvin", age: 39, gender: "Female", blood: "B+", bed: "Ward 2, Bed 14", doctor: "Dr. Farzana Yasmin", admitted: "19 Oct 2026", condition: "Observation", healthPass: true },
  { id: "ADM-1031", name: "Shahidul Islam", age: 67, gender: "Male", blood: "A+", bed: "ICU Unit 03", doctor: "Dr. Mahmudul Hasan", admitted: "20 Oct 2026", condition: "Critical", healthPass: true },
  { id: "ADM-1032", name: "Baby of Nusrat", age: 1, gender: "Female", blood: "B+", bed: "NICU Unit 08", doctor: "Dr. Nusrat Jahan", admitted: "20 Oct 2026", condition: "Under Care", healthPass: false },
];

export default function HospitalPatientsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockPatients.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.bed.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admitted Inpatients & Admissions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live inpatient directory, assigned wards, and HealthPass biometric verification records.</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by patient name, admission ID, or bed number..."
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
                <th className="py-3 px-4">Admission ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Gender / Blood</th>
                <th className="py-3 px-4">Bed / Unit</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">HealthPass</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{pt.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{pt.name} <span className="text-xs font-normal text-slate-400">({pt.age}y)</span></td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">{pt.gender} • <strong className="text-rose-600">{pt.blood}</strong></td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700 text-xs">{pt.bed}</td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs">{pt.doctor}</td>
                  <td className="py-3.5 px-4">
                    {pt.healthPass ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      pt.condition === "Critical" ? "bg-rose-50 text-rose-700" :
                      pt.condition === "Stable" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {pt.condition}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => toast.info(`Accessing medical dossier of ${pt.name}`)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                      View Chart →
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
