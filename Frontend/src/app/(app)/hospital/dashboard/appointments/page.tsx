"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Search,
  Filter,
  Plus,
  X,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  type: "Consultation" | "Follow-up" | "Emergency Triage";
  status: "Confirmed" | "Completed" | "Pending" | "Cancelled";
}

const initialAppointments: Appointment[] = [
  {
    id: "APT-801",
    patientName: "Kamal Hossain",
    phone: "+880 1711-223344",
    doctorName: "Dr. Ayesha Rahman",
    department: "Cardiology",
    date: "Today",
    timeSlot: "10:30 AM",
    type: "Consultation",
    status: "Confirmed",
  },
  {
    id: "APT-802",
    patientName: "Fatema Begum",
    phone: "+880 1822-334455",
    doctorName: "Dr. Tariqul Islam",
    department: "Orthopedics",
    date: "Today",
    timeSlot: "11:15 AM",
    type: "Follow-up",
    status: "Completed",
  },
  {
    id: "APT-803",
    patientName: "Tanvir Ahmed",
    phone: "+880 1933-445566",
    doctorName: "Dr. Nusrat Jahan",
    department: "Pediatrics",
    date: "Today",
    timeSlot: "12:00 PM",
    type: "Consultation",
    status: "Pending",
  },
  {
    id: "APT-804",
    patientName: "Shirin Akter",
    phone: "+880 1544-556677",
    doctorName: "Dr. Farhan Chowdhury",
    department: "Neurology",
    date: "Today",
    timeSlot: "02:30 PM",
    type: "Emergency Triage",
    status: "Confirmed",
  },
  {
    id: "APT-805",
    patientName: "Mehedi Hasan",
    phone: "+880 1655-667788",
    doctorName: "Dr. Mahmud Hasan",
    department: "General Surgery",
    date: "Tomorrow",
    timeSlot: "09:45 AM",
    type: "Consultation",
    status: "Pending",
  },
];

export default function HospitalAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApt, setNewApt] = useState({
    patientName: "",
    phone: "",
    doctorName: "Dr. Ayesha Rahman",
    department: "Cardiology",
    timeSlot: "11:00 AM",
    type: "Consultation" as Appointment["type"],
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total Appointments", value: appointments.length, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Confirmed", value: appointments.filter((a) => a.status === "Confirmed").length, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending", value: appointments.filter((a) => a.status === "Pending").length, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completed", value: appointments.filter((a) => a.status === "Completed").length, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.patientName) return;

    const aptToAdd: Appointment = {
      id: `APT-${Math.floor(800 + Math.random() * 200)}`,
      patientName: newApt.patientName,
      phone: newApt.phone || "+880 1700-000000",
      doctorName: newApt.doctorName,
      department: newApt.department,
      date: "Today",
      timeSlot: newApt.timeSlot,
      type: newApt.type,
      status: "Confirmed",
    };

    setAppointments([aptToAdd, ...appointments]);
    setIsModalOpen(false);
    setNewApt({
      patientName: "",
      phone: "",
      doctorName: "Dr. Ayesha Rahman",
      department: "Cardiology",
      timeSlot: "11:00 AM",
      type: "Consultation",
    });
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Completed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hospital Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage outpatient schedules, doctor consultations, and walk-in bookings.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={16} /> New Appointment
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${st.bg} flex items-center justify-center shrink-0`}>
              <CalendarDays size={22} className={st.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{st.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{st.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Status Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, doctor, or mobile number..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map((status) => (
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

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">ID / Patient</th>
                <th className="py-3.5 px-5">Doctor / Department</th>
                <th className="py-3.5 px-5">Schedule</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{apt.patientName}</p>
                      <p className="text-xs text-slate-400 font-mono">{apt.id} • {apt.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{apt.doctorName}</p>
                      <p className="text-xs text-emerald-600 font-semibold">{apt.department}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Clock size={14} className="text-slate-400" />
                      <span>{apt.date}, {apt.timeSlot}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                      {apt.type}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-1.5">
                    {apt.status === "Pending" && (
                      <button
                        onClick={() => {
                          setAppointments((prev) =>
                            prev.map((a) => (a.id === apt.id ? { ...a, status: "Confirmed" } : a))
                          );
                        }}
                        className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                    {apt.status === "Confirmed" && (
                      <button
                        onClick={() => {
                          setAppointments((prev) =>
                            prev.map((a) => (a.id === apt.id ? { ...a, status: "Completed" } : a))
                          );
                        }}
                        className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                    {apt.status !== "Cancelled" && (
                      <button
                        onClick={() => {
                          setAppointments((prev) =>
                            prev.map((a) => (a.id === apt.id ? { ...a, status: "Cancelled" } : a))
                          );
                        }}
                        className="text-xs px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">No appointments found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
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
                <h2 className="text-lg font-bold text-slate-900">Book Walk-in Appointment</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newApt.patientName}
                    onChange={(e) => setNewApt({ ...newApt, patientName: e.target.value })}
                    placeholder="e.g. Rahim Uddin"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newApt.phone}
                    onChange={(e) => setNewApt({ ...newApt, phone: e.target.value })}
                    placeholder="+880 1700-000000"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Assign Doctor</label>
                    <select
                      value={newApt.doctorName}
                      onChange={(e) => setNewApt({ ...newApt, doctorName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Dr. Ayesha Rahman">Dr. Ayesha Rahman (Cardiology)</option>
                      <option value="Dr. Tariqul Islam">Dr. Tariqul Islam (Orthopedics)</option>
                      <option value="Dr. Nusrat Jahan">Dr. Nusrat Jahan (Pediatrics)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Time Slot</label>
                    <input
                      type="text"
                      value={newApt.timeSlot}
                      onChange={(e) => setNewApt({ ...newApt, timeSlot: e.target.value })}
                      placeholder="e.g. 11:30 AM"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
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
                    Confirm Booking
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
