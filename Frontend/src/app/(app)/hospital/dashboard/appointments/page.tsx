"use client";

import { useState } from "react";
import { CalendarDays, Search, Clock, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import { toast, Toaster } from "sonner";

const mockAppointments = [
  { id: "APT-8812", patient: "Kamrul Hasan", age: 46, doctor: "Prof. Dr. Anisur Rahman", dept: "Cardiology", time: "10:30 AM", date: "Today", type: "Follow-up", status: "Confirmed" },
  { id: "APT-8813", patient: "Nasreen Akter", age: 32, doctor: "Dr. Farzana Yasmin", dept: "Gynecology", time: "11:15 AM", date: "Today", type: "New Consultation", status: "In Progress" },
  { id: "APT-8814", patient: "Abdur Rashid", age: 62, doctor: "Dr. Mahmudul Hasan", dept: "Neurology", time: "12:00 PM", date: "Today", type: "Follow-up", status: "Waiting" },
  { id: "APT-8815", patient: "Sultana Begum", age: 29, doctor: "Dr. Nusrat Jahan", dept: "Pediatrics", time: "01:00 PM", date: "Today", type: "Child Vaccination", status: "Confirmed" },
  { id: "APT-8816", patient: "Zubair Ahmed", age: 51, doctor: "Dr. Tanvir Ahmed", dept: "Surgery", time: "02:30 PM", date: "Today", type: "Post-op Review", status: "Scheduled" },
];

export default function HospitalAppointmentsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockAppointments.filter(
    (a) => a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointment Schedules</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live outpatient appointments, chamber visits, and consultation queues.</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by patient name, doctor, or token ID..."
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
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Dept</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{apt.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{apt.patient} <span className="text-xs font-normal text-slate-400">({apt.age}y)</span></td>
                  <td className="py-3.5 px-4 text-slate-700">{apt.doctor}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-semibold text-xs">{apt.dept}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs font-semibold">{apt.time} ({apt.date})</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      apt.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" :
                      apt.status === "In Progress" ? "bg-blue-50 text-blue-700" :
                      apt.status === "Waiting" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => toast.success(`Check-in for ${apt.patient} completed`)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                      Check In →
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
