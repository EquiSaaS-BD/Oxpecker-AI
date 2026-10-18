"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  X,
  Stethoscope,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  Trash2,
  Edit2,
  ShieldCheck,
  Building,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export interface DoctorRecord {
  id: string;
  name: string;
  bmdc: string;
  specialty: string;
  department: string;
  status: "On Duty" | "In Surgery" | "Off Duty";
  phone: string;
  email: string;
  room: string;
  fee: number;
  visitingHours: string;
  experience: string;
}

const initialDoctorsList: DoctorRecord[] = [
  {
    id: "DOC-001",
    name: "Dr. Ayesha Rahman",
    bmdc: "A-54321",
    specialty: "Senior Consultant Cardiologist",
    department: "Cardiology",
    status: "On Duty",
    phone: "+880 1712-345678",
    email: "ayesha.rahman@oxpecker.ai",
    room: "Room 304, Block A",
    fee: 1200,
    visitingHours: "05:00 PM - 09:00 PM (Sat-Thu)",
    experience: "14 yrs exp",
  },
  {
    id: "DOC-002",
    name: "Dr. Tariqul Islam",
    bmdc: "A-48920",
    specialty: "Orthopedic & Trauma Surgeon",
    department: "Orthopedics",
    status: "In Surgery",
    phone: "+880 1819-876543",
    email: "tariqul.islam@oxpecker.ai",
    room: "OT-2 / Room 405",
    fee: 1000,
    visitingHours: "06:00 PM - 10:00 PM",
    experience: "11 yrs exp",
  },
  {
    id: "DOC-003",
    name: "Dr. Nusrat Jahan",
    bmdc: "A-61205",
    specialty: "Consultant Pediatrician",
    department: "Pediatrics",
    status: "On Duty",
    phone: "+880 1911-223344",
    email: "nusrat.jahan@oxpecker.ai",
    room: "Room 108, Block B",
    fee: 800,
    visitingHours: "04:00 PM - 08:00 PM",
    experience: "8 yrs exp",
  },
  {
    id: "DOC-004",
    name: "Dr. Farhan Chowdhury",
    bmdc: "A-39912",
    specialty: "Associate Professor of Neurology",
    department: "Neurology",
    status: "Off Duty",
    phone: "+880 1515-998877",
    email: "farhan.c@oxpecker.ai",
    room: "Room 402, Block A",
    fee: 1500,
    visitingHours: "07:00 PM - 10:00 PM",
    experience: "16 yrs exp",
  },
  {
    id: "DOC-005",
    name: "Dr. Mahmud Hasan",
    bmdc: "A-44319",
    specialty: "General & Laparoscopic Surgeon",
    department: "General Surgery",
    status: "On Duty",
    phone: "+880 1622-445566",
    email: "mahmud.hasan@oxpecker.ai",
    room: "Room 215, Block C",
    fee: 1000,
    visitingHours: "05:00 PM - 09:00 PM",
    experience: "12 yrs exp",
  },
  {
    id: "DOC-006",
    name: "Dr. Sadia Sultana",
    bmdc: "A-58210",
    specialty: "Gynecologist & Obstetrician",
    department: "Gynecology",
    status: "On Duty",
    phone: "+880 1733-112233",
    email: "sadia.s@oxpecker.ai",
    room: "Room 112, Block B",
    fee: 900,
    visitingHours: "04:00 PM - 08:30 PM",
    experience: "10 yrs exp",
  },
];

export default function HospitalDoctorsPage() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<DoctorRecord[]>(initialDoctorsList);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorRecord | null>(null);

  // Open modal if query param ?add=true is present
  useEffect(() => {
    if (searchParams?.get("add") === "true") {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    bmdc: "",
    specialty: "",
    department: "Cardiology",
    phone: "",
    email: "",
    room: "",
    fee: 1000,
    visitingHours: "05:00 PM - 09:00 PM",
    experience: "5 yrs exp",
    status: "On Duty" as DoctorRecord["status"],
  });

  const departments = ["All", "Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General Surgery", "Gynecology"];

  // Filtered doctors
  const filteredDoctors = doctors.filter((doc) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(query) ||
      doc.specialty.toLowerCase().includes(query) ||
      doc.bmdc.toLowerCase().includes(query) ||
      doc.room.toLowerCase().includes(query);
    const matchesDept = selectedDept === "All" || doc.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Doctor count stats
  const totalDoctorsCount = doctors.length;
  const onDutyCount = doctors.filter((d) => d.status === "On Duty").length;
  const inSurgeryCount = doctors.filter((d) => d.status === "In Surgery").length;
  const offDutyCount = doctors.filter((d) => d.status === "Off Duty").length;

  const stats = [
    { label: "Total Doctors", value: totalDoctorsCount, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "On Duty Now", value: onDutyCount, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In Surgery (OT)", value: inSurgeryCount, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Off Duty", value: offDutyCount, color: "text-slate-600", bg: "bg-slate-100" },
  ];

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.specialty) {
      toast.error("Please fill in Doctor Name and Specialty.");
      return;
    }

    const docToAdd: DoctorRecord = {
      id: `DOC-${String(doctors.length + 1).padStart(3, "0")}`,
      name: formData.name.startsWith("Dr.") ? formData.name : `Dr. ${formData.name}`,
      bmdc: formData.bmdc ? (formData.bmdc.startsWith("A-") ? formData.bmdc : `A-${formData.bmdc}`) : `A-${Math.floor(10000 + Math.random() * 90000)}`,
      specialty: formData.specialty,
      department: formData.department,
      status: formData.status,
      phone: formData.phone || "+880 1700-000000",
      email: formData.email || "doctor@oxpecker.ai",
      room: formData.room || "Room 101, Main Chamber",
      fee: Number(formData.fee) || 800,
      visitingHours: formData.visitingHours,
      experience: formData.experience,
    };

    setDoctors([docToAdd, ...doctors]);
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      bmdc: "",
      specialty: "",
      department: "Cardiology",
      phone: "",
      email: "",
      room: "",
      fee: 1000,
      visitingHours: "05:00 PM - 09:00 PM",
      experience: "5 yrs exp",
      status: "On Duty",
    });
    toast.success(`Doctor ${docToAdd.name} successfully registered to hospital roster!`);
  };

  const handleUpdateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    setDoctors(doctors.map((d) => (d.id === editingDoctor.id ? editingDoctor : d)));
    toast.success(`Updated details for ${editingDoctor.name}`);
    setEditingDoctor(null);
  };

  const handleToggleStatus = (id: string) => {
    setDoctors(
      doctors.map((doc) => {
        if (doc.id !== id) return doc;
        const nextStatus: DoctorRecord["status"] =
          doc.status === "On Duty" ? "In Surgery" : doc.status === "In Surgery" ? "Off Duty" : "On Duty";
        toast.info(`${doc.name} shift status updated to: ${nextStatus}`);
        return { ...doc, status: nextStatus };
      })
    );
  };

  const handleDeleteDoctor = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from hospital roster?`)) {
      setDoctors(doctors.filter((d) => d.id !== id));
      toast.success(`${name} has been removed from the roster.`);
    }
  };

  const getStatusBadge = (status: DoctorRecord["status"]) => {
    switch (status) {
      case "On Duty":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Surgery":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Off Duty":
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctors Management & Roster</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage hospital medical staff, BMDC credentials, duty shifts, and consultation fees.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      {/* Metrics Row (Doctor Koyjon Ache) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${st.bg} flex items-center justify-center shrink-0`}>
              <Stethoscope size={22} className={st.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{st.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{st.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Department Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, BMDC reg #, specialty, or room..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDept === dept
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-base shrink-0">
                    {doc.name.replace("Dr. ", "").charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs text-emerald-600 font-semibold">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-400 font-mono">BMDC: {doc.bmdc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(doc.id)}
                  title="Click to cycle status: On Duty -> In Surgery -> Off Duty"
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-all hover:scale-105 ${getStatusBadge(
                    doc.status
                  )}`}
                >
                  {doc.status}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Department:</span>
                  <span className="font-bold text-slate-800">{doc.department}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Chamber / OT:</span>
                  <span className="text-slate-800 font-medium">{doc.room}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-emerald-700">৳{doc.fee.toLocaleString()}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Visiting Hours:</span>
                  <span className="text-slate-700">{doc.visitingHours}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-500 pt-1">
                  <Phone size={12} /> {doc.phone}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400">{doc.id}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingDoctor(doc)}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer border border-slate-200"
                  title="Edit Doctor Details"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer border border-rose-200"
                  title="Remove from Roster"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Stethoscope size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-700">No doctors found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or department filter.</p>
        </div>
      )}

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Add Doctor to Hospital Staff</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddDoctor} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Doctor Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Mohammad Ali"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">BMDC Reg Number</label>
                    <input
                      type="text"
                      value={formData.bmdc}
                      onChange={(e) => setFormData({ ...formData, bmdc: e.target.value })}
                      placeholder="e.g. A-54321"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Specialty & Degrees *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g. FCPS, Consultant Cardiologist"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      {departments.filter((d) => d !== "All").map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Chamber / Room</label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="e.g. Room 204, Block B"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Consultation Fee (৳)</label>
                    <input
                      type="number"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                      placeholder="e.g. 1000"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Visiting Hours</label>
                    <input
                      type="text"
                      value={formData.visitingHours}
                      onChange={(e) => setFormData({ ...formData, visitingHours: e.target.value })}
                      placeholder="e.g. 05:00 PM - 09:00 PM"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+880 1700-000000"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Initial Duty Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="In Surgery">In Surgery</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    Register Doctor
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Doctor Modal */}
      <AnimatePresence>
        {editingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Edit Doctor Information</h2>
                <button
                  onClick={() => setEditingDoctor(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateDoctor} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.name}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Specialty</label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.specialty}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialty: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Chamber / Room</label>
                    <input
                      type="text"
                      value={editingDoctor.room}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, room: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Consultation Fee (৳)</label>
                    <input
                      type="number"
                      value={editingDoctor.fee}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, fee: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={editingDoctor.phone}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Visiting Hours</label>
                    <input
                      type="text"
                      value={editingDoctor.visitingHours}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, visitingHours: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(null)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    Save Changes
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
