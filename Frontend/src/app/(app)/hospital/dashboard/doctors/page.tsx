"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  Stethoscope,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  X,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Building,
  Calendar,
  Sparkles,
  Activity,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import type { HospitalDoctor } from "@/types/hospital-hms";
import {
  getHospitalDoctors,
  saveHospitalDoctor,
  deleteHospitalDoctor,
} from "@/lib/hospital-hms";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

const SPECIALTIES = [
  "All",
  "Cardiology",
  "Gynecology & Obstetrics",
  "Neurology",
  "General & Laparoscopic Surgery",
  "Pediatrics & Neonatology",
  "Orthopedics & Trauma",
  "Nephrology & Urology",
  "Internal Medicine",
  "Critical Care / ICU",
];

function HospitalDoctorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams?.get("action");

  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDoctorForChamber, setSelectedDoctorForChamber] = useState<HospitalDoctor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    specialty: "Cardiology",
    department: "Cardiology & Interventional Heart Center",
    degrees: "MBBS, FCPS, MD",
    bmdc_reg: "",
    phone: "",
    email: "",
    room: "",
    visiting_hours: "Sat - Wed (5:00 PM - 9:00 PM)",
    consultation_fee: 1500,
    status: "Active" as HospitalDoctor["status"],
  });

  // Load Doctors on Mount
  useEffect(() => {
    setDoctors(getHospitalDoctors());

    if (actionParam === "add") {
      setIsAddModalOpen(true);
    }
  }, [actionParam]);

  // Handle Create / Add Doctor
  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Doctor name is required");
      return;
    }
    if (!formData.bmdc_reg.trim()) {
      toast.error("BMDC registration number is required");
      return;
    }

    const newDoc: HospitalDoctor = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      specialty: formData.specialty,
      department: formData.department.trim() || `${formData.specialty} Department`,
      degrees: formData.degrees.trim() || "MBBS",
      bmdc_reg: formData.bmdc_reg.trim(),
      phone: formData.phone.trim() || "+880 1711-000000",
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/[^a-z]/g, "")}@oxpecker.ai`,
      room: formData.room.trim() || "Chamber Suite 201",
      visiting_hours: formData.visiting_hours.trim() || "Daily (5:00 PM - 9:00 PM)",
      consultation_fee: Number(formData.consultation_fee) || 1200,
      patientsToday: 0,
      status: formData.status,
      created_at: new Date().toISOString().split("T")[0],
    };

    const updated = saveHospitalDoctor(newDoc);
    setDoctors(updated);
    setIsAddModalOpen(false);

    // Reset Form
    setFormData({
      name: "",
      specialty: "Cardiology",
      department: "Cardiology & Interventional Heart Center",
      degrees: "MBBS, FCPS, MD",
      bmdc_reg: "",
      phone: "",
      email: "",
      room: "",
      visiting_hours: "Sat - Wed (5:00 PM - 9:00 PM)",
      consultation_fee: 1500,
      status: "Active",
    });

    toast.success(`${newDoc.name} successfully registered to hospital medical roster!`);
  };

  // Filter Doctors
  const filtered = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doc.degrees.toLowerCase().includes(search.toLowerCase()) ||
      doc.room.toLowerCase().includes(search.toLowerCase()) ||
      doc.bmdc_reg.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === "All" ||
      doc.specialty.toLowerCase().includes(selectedDept.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || doc.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Popup Options
  const specialtyOptions: CustomSelectOption<string>[] = SPECIALTIES.map((spec) => ({
    value: spec,
    label: spec === "All" ? "All Specialties" : spec,
    count:
      spec === "All"
        ? doctors.length
        : doctors.filter((d) => d.specialty.toLowerCase().includes(spec.toLowerCase())).length,
  }));

  const statusOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Rosters", count: doctors.length },
    {
      value: "Active",
      label: "Active Affiliates",
      dotColor: "bg-emerald-500",
      count: doctors.filter((d) => d.status === "Active").length,
    },
    {
      value: "On-Duty",
      label: "On-Duty in Ward",
      dotColor: "bg-blue-500",
      count: doctors.filter((d) => d.status === "On-Duty").length,
    },
    {
      value: "In Surgery",
      label: "In Operation OT",
      dotColor: "bg-purple-500",
      count: doctors.filter((d) => d.status === "In Surgery").length,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital Doctors Roster & Medical Faculty
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              BMDC Verified
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage senior consultants, outpatient chambers, visiting schedules, and clinical specialties.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 text-sm cursor-pointer shrink-0"
        >
          <UserPlus size={16} />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Search & Department Filters with Custom Popup Boxes */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name, specialty, degrees, BMDC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
          <div className="w-full sm:w-60">
            <CustomSelect
              value={selectedDept}
              onChange={(val) => setSelectedDept(val)}
              options={specialtyOptions}
              prefix="Specialty:"
              icon={Stethoscope}
              menuWidth="w-72"
            />
          </div>

          <div className="w-full sm:w-48">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={statusOptions}
              prefix="Roster:"
              icon={Activity}
              menuWidth="w-56"
            />
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg">
                  {doc.name.replace(/Prof\.|Dr\./g, "").trim().charAt(0)}
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      doc.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : doc.status === "On-Duty"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : doc.status === "In Surgery"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {doc.status}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 mt-1">
                    {doc.bmdc_reg}
                  </span>
                </div>
              </div>

              <h3 className="font-black text-slate-900 text-base leading-snug">{doc.name}</h3>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">{doc.specialty}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-1">{doc.degrees}</p>

              <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-rose-500 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{doc.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500 shrink-0" />
                  <span className="text-slate-600 truncate">{doc.visiting_hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span>{doc.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation</span>
                <span className="font-black text-slate-900">৳ {doc.consultation_fee.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedDoctorForChamber(doc)}
                className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 font-bold cursor-pointer transition-colors"
              >
                Chamber Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Doctor Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8 custom-scrollbar border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Register & Affiliate New Consultant Doctor
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add medical specialist credentials, BMDC license, chamber address, and OPD visiting hours.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddDoctor} className="mt-6 space-y-4">
                {/* Doctor Name & BMDC Reg */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Doctor Name (with prefix) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Prof. Dr. Tariqul Islam"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      BMDC Registration Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.bmdc_reg}
                      onChange={(e) => setFormData({ ...formData, bmdc_reg: e.target.value })}
                      placeholder="e.g. BMDC A-51092"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Specialty & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Clinical Specialty <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value, department: `${e.target.value} Department` })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white outline-none focus:border-emerald-500"
                    >
                      {SPECIALTIES.filter((s) => s !== "All").map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Hospital Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Cardiovascular & Thoracic Surgery"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Degrees */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Degrees, Diplomas & Post-Graduation Qualifications
                  </label>
                  <input
                    type="text"
                    value={formData.degrees}
                    onChange={(e) => setFormData({ ...formData, degrees: e.target.value })}
                    placeholder="e.g. MBBS, FCPS (Cardiology), MD, FRCP (Glasgow)"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Chamber Address / Room Location */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Chamber / OPD Consultation Room (Floor / Wing) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Chamber Suite 402, Level 4 Heart Center"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Visiting Hours & Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      OPD Visiting Days & Schedule
                    </label>
                    <input
                      type="text"
                      value={formData.visiting_hours}
                      onChange={(e) => setFormData({ ...formData, visiting_hours: e.target.value })}
                      placeholder="e.g. Sat - Thu (5:00 PM - 9:00 PM)"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Consultation Fee (৳ BDT)
                    </label>
                    <input
                      type="number"
                      value={formData.consultation_fee}
                      onChange={(e) => setFormData({ ...formData, consultation_fee: Number(e.target.value) })}
                      placeholder="e.g. 1500"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-black text-emerald-700 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Contact Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+880 1711-..."
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="doctor@oxpecker.ai"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Duty Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as HospitalDoctor["status"] })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active (Available for Appointments)</option>
                    <option value="On-Duty">On-Duty (Hospital Inpatient Rounds)</option>
                    <option value="In Surgery">In Surgery (OT Procedure)</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="h-11 px-5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Save & Affiliate Doctor
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chamber Details Modal */}
      <AnimatePresence>
        {selectedDoctorForChamber && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctorForChamber(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedDoctorForChamber.name}</h3>
                    <p className="text-xs text-slate-500">{selectedDoctorForChamber.bmdc_reg} • {selectedDoctorForChamber.specialty}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctorForChamber(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Qualifications</span>
                  <p className="text-sm font-bold text-slate-900">{selectedDoctorForChamber.degrees}</p>
                  <p className="text-slate-600">{selectedDoctorForChamber.department}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Chamber Location:</span>
                    <strong className="text-slate-900 text-sm">{selectedDoctorForChamber.room}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Visiting Hours:</span>
                    <strong className="text-blue-700">{selectedDoctorForChamber.visiting_hours}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Consultation Fee:</span>
                    <strong className="text-emerald-700 text-sm">৳ {selectedDoctorForChamber.consultation_fee.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Direct Phone:</span>
                    <strong className="text-slate-800">{selectedDoctorForChamber.phone}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Hospital Email:</span>
                    <strong className="text-slate-800">{selectedDoctorForChamber.email}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedDoctorForChamber(null)}
                  className="h-10 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HospitalDoctorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Loading Doctors Roster...</div>}>
      <HospitalDoctorsContent />
    </Suspense>
  );
}
