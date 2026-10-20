"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, UserPlus, Stethoscope, Phone, Mail, Award, CheckCircle2 } from "lucide-react";
import { toast, Toaster } from "sonner";

const mockDoctors = [
  { id: 1, name: "Prof. Dr. Anisur Rahman", specialty: "Cardiology", degrees: "MBBS, FCPS, FRCP (Glasgow)", phone: "+880 1711-223344", email: "anisur@oxpecker.ai", room: "Chamber 402", patientsToday: 18, status: "Active" },
  { id: 2, name: "Dr. Farzana Yasmin", specialty: "Gynecology & Obstetrics", degrees: "MBBS, MS (Gynae), DGO", phone: "+880 1722-334455", email: "farzana@oxpecker.ai", room: "Chamber 205", patientsToday: 24, status: "Active" },
  { id: 3, name: "Dr. Mahmudul Hasan", specialty: "Neurology", degrees: "MBBS, MD (Neurology)", phone: "+880 1733-445566", email: "mahmud@oxpecker.ai", room: "Chamber 310", patientsToday: 12, status: "On-Duty" },
  { id: 4, name: "Dr. Tanvir Ahmed", specialty: "General & Laparoscopic Surgery", degrees: "MBBS, FCPS (Surgery)", phone: "+880 1744-556677", email: "tanvir@oxpecker.ai", room: "OT Complex B", patientsToday: 8, status: "In Surgery" },
  { id: 5, name: "Dr. Nusrat Jahan", specialty: "Pediatrics", degrees: "MBBS, DCH, MD (Child Health)", phone: "+880 1755-667788", email: "nusrat@oxpecker.ai", room: "Chamber 108", patientsToday: 22, status: "Active" },
];

export default function HospitalDoctorsPage() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const filtered = mockDoctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "All" || doc.specialty.includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Doctors Roster & Consultants</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage affiliated doctors, clinical specialists, and chamber allocations.</p>
        </div>
        <button
          onClick={() => toast.info("Doctor Registration dialog opened")}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                  {doc.name.replace(/Prof\.|Dr\./g, "").trim().charAt(0)}
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  doc.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                  doc.status === "On-Duty" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                }`}>
                  {doc.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">{doc.specialty}</p>
              <p className="text-xs text-slate-500 mt-1">{doc.degrees}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-slate-400" />
                  <span>{doc.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{doc.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Today's Queue: <strong className="text-slate-800">{doc.patientsToday} patients</strong></span>
              <button onClick={() => toast.success(`Viewing chamber for ${doc.name}`)} className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer">
                View Chamber →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
