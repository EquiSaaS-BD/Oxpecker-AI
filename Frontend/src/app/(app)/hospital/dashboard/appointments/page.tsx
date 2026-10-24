"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Users,
  Stethoscope,
  ChevronRight,
  UserCheck,
  Activity,
  Plus,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

interface Appointment {
  id: string;
  patient: string;
  age: number;
  doctor: string;
  dept: string;
  time: string;
  date: string;
  type: string;
  status: "Confirmed" | "In Progress" | "Waiting" | "Scheduled" | "Completed";
}

const initialAppointments: Appointment[] = [
  { id: "APT-8812", patient: "Kamrul Hasan", age: 46, doctor: "Prof. Dr. Anisur Rahman", dept: "Cardiology", time: "10:30 AM", date: "Today", type: "Follow-up", status: "Confirmed" },
  { id: "APT-8813", patient: "Nasreen Akter", age: 32, doctor: "Dr. Farzana Yasmin", dept: "Gynecology", time: "11:15 AM", date: "Today", type: "New Consultation", status: "In Progress" },
  { id: "APT-8814", patient: "Abdur Rashid", age: 62, doctor: "Dr. Mahmudul Hasan", dept: "Neurology", time: "12:00 PM", date: "Today", type: "Follow-up", status: "Waiting" },
  { id: "APT-8815", patient: "Sultana Begum", age: 29, doctor: "Dr. Nusrat Jahan", dept: "Pediatrics", time: "01:00 PM", date: "Today", type: "Child Vaccination", status: "Confirmed" },
  { id: "APT-8816", patient: "Zubair Ahmed", age: 51, doctor: "Dr. Tanvir Ahmed", dept: "Surgery", time: "02:30 PM", date: "Today", type: "Post-op Review", status: "Scheduled" },
];

export default function HospitalAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  // Load live appointments from server database
  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((res) => {
        if (res?.appointments && Array.isArray(res.appointments) && res.appointments.length > 0) {
          setAppointments(res.appointments);
        }
      })
      .catch((err) => console.warn("Live appointments API sync note:", err));
  }, []);

  const handleUpdateStatus = (id: string, newStatus: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    // Persist status change to database
    fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    }).catch(() => {});

    toast.success(`Appointment ${id} status updated to ${newStatus}`);
  };

  const handleCreateToken = async () => {
    const nextTokenNum = Math.floor(15 + Math.random() * 80);
    const tokenStr = `TK-${nextTokenNum}`;
    const newApt: Appointment = {
      id: `APT-${Math.floor(8000 + Math.random() * 1999)}`,
      patient: `Walk-in Patient #${nextTokenNum}`,
      age: 35,
      doctor: "Prof. Dr. Anisur Rahman",
      dept: "Cardiology",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: "Today",
      type: "Walk-in Consultation",
      status: "Waiting",
    };

    setAppointments((prev) => [newApt, ...prev]);

    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenStr,
          name: newApt.patient,
          age: newApt.age,
          doctor: newApt.doctor,
          dept: newApt.dept,
          type: newApt.type,
        }),
      });
      toast.success(`Token ${tokenStr} registered and persisted to server database!`);
    } catch {
      toast.success(`Token ${tokenStr} created locally.`);
    }
  };

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    const matchesDept = deptFilter === "All" || a.dept === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const totalCount = appointments.length;
  const inProgressCount = appointments.filter((a) => a.status === "In Progress").length;
  const waitingCount = appointments.filter((a) => a.status === "Waiting").length;
  const confirmedCount = appointments.filter((a) => a.status === "Confirmed").length;

  const statusOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Statuses", count: totalCount },
    { value: "In Progress", label: "In Consultation", dotColor: "bg-blue-500", count: inProgressCount },
    { value: "Waiting", label: "Waiting in Lobby", dotColor: "bg-amber-500", count: waitingCount },
    { value: "Confirmed", label: "Confirmed Check-In", dotColor: "bg-emerald-500", count: confirmedCount },
    { value: "Scheduled", label: "Scheduled Later", dotColor: "bg-purple-500", count: appointments.filter((a) => a.status === "Scheduled").length },
    { value: "Completed", label: "Completed Visits", dotColor: "bg-slate-400", count: appointments.filter((a) => a.status === "Completed").length },
  ];

  const deptOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Specialties" },
    { value: "Cardiology", label: "Cardiology" },
    { value: "Gynecology", label: "Gynecology" },
    { value: "Neurology", label: "Neurology" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Surgery", label: "Surgery" },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Outpatient Appointments & Chamber Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Live Queue
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time outpatient consultation slots, token numbers, and clinical chamber arrivals.
          </p>
        </div>

        <button
          onClick={handleCreateToken}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus size={18} /> Book New Token
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Tokens</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalCount}</p>
          <span className="text-xs font-bold text-slate-500 mt-0.5 block">Today's Schedule</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">In Consultation</span>
          <p className="text-3xl font-black text-blue-700 mt-1">{inProgressCount}</p>
          <span className="text-xs font-bold text-blue-600 mt-0.5 block">With Specialist</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">Waiting in Lobby</span>
          <p className="text-3xl font-black text-amber-700 mt-1">{waitingCount}</p>
          <span className="text-xs font-bold text-amber-600 mt-0.5 block">Next in Line</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Confirmed</span>
          <p className="text-3xl font-black text-emerald-700 mt-1">{confirmedCount}</p>
          <span className="text-xs font-bold text-emerald-600 mt-0.5 block">Arrived at Hospital</span>
        </div>
      </div>

      {/* Search & Popup Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, doctor, or token ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
          <div className="w-full sm:w-56">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={statusOptions}
              prefix="Status:"
              icon={CheckCircle2}
              menuWidth="w-60"
            />
          </div>

          <div className="w-full sm:w-52">
            <CustomSelect
              value={deptFilter}
              onChange={(val) => setDeptFilter(val)}
              options={deptOptions}
              prefix="Specialty:"
              icon={Stethoscope}
              menuWidth="w-56"
            />
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Token No</th>
                <th className="py-3.5 px-5">Patient Details</th>
                <th className="py-3.5 px-5">Consultant Doctor</th>
                <th className="py-3.5 px-5">Specialty</th>
                <th className="py-3.5 px-5">Schedule Time</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((apt) => {
                const initials = apt.patient
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                        {apt.id}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{apt.patient}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Age: {apt.age}y • Type: {apt.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-800 font-semibold">{apt.doctor}</td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        {apt.dept}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-700">
                      {apt.time} <span className="text-slate-400">({apt.date})</span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                          apt.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : apt.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : apt.status === "Waiting"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            apt.status === "In Progress"
                              ? "bg-blue-600 animate-pulse"
                              : apt.status === "Confirmed"
                              ? "bg-emerald-600"
                              : "bg-amber-600"
                          }`}
                        />
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {apt.status === "Waiting" ? (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, "In Progress")}
                          className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Call In →
                        </button>
                      ) : apt.status === "In Progress" ? (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, "Completed")}
                          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Complete ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, "Waiting")}
                          className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching outpatient appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
