"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Search,
  Filter,
  Plus,
  X,
  BedDouble,
  HeartPulse,
  Activity,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";

interface PatientAdmission {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  admissionDate: string;
  wardBed: string;
  doctorInCharge: string;
  diagnosis: string;
  status: "Admitted" | "ICU Critical" | "Observation" | "Discharged";
}

const initialPatients: PatientAdmission[] = [
  {
    id: "ADM-101",
    uhid: "UHID-8801",
    name: "Mohammad Rafiq",
    age: 58,
    gender: "Male",
    phone: "+880 1711-123456",
    admissionDate: "2026-10-10",
    wardBed: "ICU-02",
    doctorInCharge: "Dr. Ayesha Rahman",
    diagnosis: "Acute Myocardial Infarction",
    status: "ICU Critical",
  },
  {
    id: "ADM-102",
    uhid: "UHID-8802",
    name: "Nasima Begum",
    age: 42,
    gender: "Female",
    phone: "+880 1812-234567",
    admissionDate: "2026-10-11",
    wardBed: "Cabin-201",
    doctorInCharge: "Dr. Tariqul Islam",
    diagnosis: "Femur Fracture Post-OP",
    status: "Admitted",
  },
  {
    id: "ADM-103",
    uhid: "UHID-8803",
    name: "Samiul Hasan",
    age: 9,
    gender: "Male",
    phone: "+880 1913-345678",
    admissionDate: "2026-10-12",
    wardBed: "Pediatric Ward P-04",
    doctorInCharge: "Dr. Nusrat Jahan",
    diagnosis: "Severe Viral Pneumonia",
    status: "Observation",
  },
  {
    id: "ADM-104",
    uhid: "UHID-8804",
    name: "Rokeya Khatun",
    age: 65,
    gender: "Female",
    phone: "+880 1614-456789",
    admissionDate: "2026-10-08",
    wardBed: "General Ward B-102",
    doctorInCharge: "Dr. Mahmud Hasan",
    diagnosis: "Post Laparoscopic Cholecystectomy",
    status: "Discharged",
  },
];

export default function HospitalPatientsPage() {
  const [patients, setPatients] = useState<PatientAdmission[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: 35,
    gender: "Male",
    phone: "",
    wardBed: "General Ward B-105",
    doctorInCharge: "Dr. Ayesha Rahman",
    diagnosis: "",
    status: "Admitted" as PatientAdmission["status"],
  });

  const filteredPatients = patients.filter((pt) => {
    const matchesSearch =
      pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.wardBed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || pt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Active Inpatients", value: patients.filter((p) => p.status !== "Discharged").length, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "ICU Admissions", value: patients.filter((p) => p.status === "ICU Critical").length, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Under Observation", value: patients.filter((p) => p.status === "Observation").length, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Discharged (Today)", value: patients.filter((p) => p.status === "Discharged").length, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.diagnosis) return;

    const admitted: PatientAdmission = {
      id: `ADM-${Math.floor(105 + Math.random() * 100)}`,
      uhid: `UHID-${Math.floor(8805 + Math.random() * 200)}`,
      name: newPatient.name,
      age: Number(newPatient.age) || 30,
      gender: newPatient.gender,
      phone: newPatient.phone || "+880 1700-000000",
      admissionDate: new Date().toISOString().split("T")[0],
      wardBed: newPatient.wardBed,
      doctorInCharge: newPatient.doctorInCharge,
      diagnosis: newPatient.diagnosis,
      status: newPatient.status,
    };

    setPatients([admitted, ...patients]);
    setIsModalOpen(false);
    setNewPatient({
      name: "",
      age: 35,
      gender: "Male",
      phone: "",
      wardBed: "General Ward B-105",
      doctorInCharge: "Dr. Ayesha Rahman",
      diagnosis: "",
      status: "Admitted",
    });
  };

  const getStatusBadge = (status: PatientAdmission["status"]) => {
    switch (status) {
      case "Admitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ICU Critical":
        return "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
      case "Observation":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Discharged":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients & Admissions</h1>
          <p className="text-sm text-slate-500 mt-1">Track inpatients, emergency triage entries, bed assignments, and discharge status.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={16} /> Admit Patient
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${st.bg} flex items-center justify-center shrink-0`}>
              <HeartPulse size={22} className={st.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{st.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{st.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by UHID, patient name, bed, diagnosis..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {["All", "Admitted", "ICU Critical", "Observation", "Discharged"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">UHID / Patient</th>
                <th className="py-3.5 px-5">Ward & Bed</th>
                <th className="py-3.5 px-5">Attending Doctor</th>
                <th className="py-3.5 px-5">Primary Diagnosis</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPatients.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{pt.name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {pt.uhid} • {pt.age}y/{pt.gender} • {pt.phone}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <BedDouble size={14} className="text-emerald-600" />
                      <span>{pt.wardBed}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <p className="font-semibold text-slate-800">{pt.doctorInCharge}</p>
                  </td>
                  <td className="py-4 px-5">
                    <p className="text-xs text-slate-700 max-w-xs">{pt.diagnosis}</p>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(pt.status)}`}>
                      {pt.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-1.5">
                    {pt.status !== "Discharged" ? (
                      <button
                        onClick={() => {
                          setPatients((prev) =>
                            prev.map((p) => (p.id === pt.id ? { ...p, status: "Discharged" } : p))
                          );
                        }}
                        className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Discharge
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">Discharged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <UserPlus size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">No patient records found</h3>
            <p className="text-xs text-slate-400 mt-1">Try another search or filter.</p>
          </div>
        )}
      </div>

      {/* Admit Patient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Hospital Patient Admission</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAdmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g. Anisur Rahman"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Age</label>
                    <input
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Gender</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="+880 1700-000000"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ward & Bed Allocation</label>
                  <input
                    type="text"
                    value={newPatient.wardBed}
                    onChange={(e) => setNewPatient({ ...newPatient, wardBed: e.target.value })}
                    placeholder="e.g. Ward A Bed-104 or ICU-03"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Diagnosis / Reason for Admission *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.diagnosis}
                    onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                    placeholder="e.g. Acute Appendicitis / High Fever"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    Admit to Hospital
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
