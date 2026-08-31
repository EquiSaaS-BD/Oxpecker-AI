"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, CalendarDays, CalendarClock, Ban, CheckCircle2,
  ListFilter, MoreHorizontal, ChevronLeft, ChevronRight, Video, MapPin, 
  Calendar as CalendarIcon, Clock
} from 'lucide-react';

const stats = [
  { title: "Today's Appointments", count: "48", icon: CalendarDays, color: "text-[#2F80ED]", bg: "bg-[#2F80ED]/10" },
  { title: "Upcoming", count: "124", icon: CalendarClock, color: "text-[#F2994A]", bg: "bg-[#F2994A]/10" },
  { title: "Completed", count: "32", icon: CheckCircle2, color: "text-[#6DDA6E]", bg: "bg-[#6DDA6E]/10" },
];

const mockAppointments = [
  { id: "APT-2901", patient: "Rahim Uddin", doctor: "Dr. Farzana Alam", dept: "Gynecology", date: "2026-07-25", time: "09:15 AM", type: "Walk-in", status: "Completed", payment: "Paid", avatar: "R", age: 45, gender: "Male", diagnosis: "Consultation & ECG" },
  { id: "APT-2902", patient: "Fatema Begum", doctor: "Dr. Farzana Alam", dept: "Gynecology", date: "2026-07-25", time: "09:30 AM", type: "Online", status: "Waiting", payment: "Due", avatar: "F", age: 32, gender: "Female", diagnosis: "Root Canal" },
  { id: "APT-2903", patient: "Salma Akter", doctor: "Dr. Hasan", dept: "Cardiology", date: "2026-07-26", time: "11:00 AM", type: "Online", status: "Waiting", payment: "Paid", avatar: "S", age: 28, gender: "Female", diagnosis: "Blood Test & X-Ray" },
  { id: "APT-2904", patient: "Karim Mia", doctor: "Dr. Hasan", dept: "Cardiology", date: "2026-11-26", time: "05:00 PM", type: "Walk-in", status: "Pending", payment: "Due", avatar: "K", age: 58, gender: "Male", diagnosis: "General Checkup" },
];

const mockDates = [
  { day: "Mon", date: "24", active: true },
  { day: "Tue", date: "25", active: false },
  { day: "Wed", date: "26", active: false },
  { day: "Thu", date: "27", active: false },
  { day: "Fri", date: "28", active: false },
  { day: "Sat", date: "29", active: false },
];

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching appointments data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col font-sans pb-24 -mt-6 lg:-mt-10 animate-pulse">
        {/* Skeleton Header */}
        <div className="bg-white/80 border-b border-white/50 px-4 lg:px-8 py-5 lg:py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] -mx-4 sm:-mx-6 lg:-mx-10 mb-6 sm:mb-8 pt-6 lg:pt-10">
          <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="h-8 bg-slate-200 rounded-lg w-48 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded-md w-64"></div>
            </div>
            <div className="w-full lg:w-[320px] h-[48px] bg-slate-200 rounded-xl"></div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-0">
          {/* Skeleton Stats */}
          <div className="hidden md:grid grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[16px] p-6 border border-slate-100 flex items-center gap-5">
                <div className="w-[48px] h-[48px] rounded-[12px] bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
                  <div className="h-8 w-16 bg-slate-200 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Table/List */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-4 md:w-1/3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-200 rounded-md w-32"></div>
                    <div className="h-3 bg-slate-200 rounded-md w-24"></div>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/4 space-y-2">
                  <div className="h-5 bg-slate-200 rounded-md w-24"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-32"></div>
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div className="h-6 bg-slate-200 rounded-md w-20"></div>
                  <div className="h-10 bg-slate-200 rounded-xl w-[100px]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans pb-24 -mt-6 lg:-mt-10">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 px-4 lg:px-8 py-5 lg:py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] relative z-10 -mx-4 sm:-mx-6 lg:-mx-10 mb-4 sm:mb-6 pt-6 lg:pt-10">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] lg:text-[24px] font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-inner">
                <CalendarDays className="text-indigo-600" size={24} />
              </div>
              Appointments
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1">Manage all incoming and past appointments.</p>
          </div>
          
          <div className="w-full lg:w-[320px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search appointments..." 
              className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-[14px] font-medium text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-0">

      {/* Stats Cards (Hidden on mobile for clean look, or swipeable) */}
      <div className="hidden md:grid grid-cols-3 gap-6 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[16px] p-6 shadow-sm border border-[#E5E7EB] flex items-center gap-5">
            <div className={`w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <span className="text-[14px] font-[500] text-[#6B7280] block mb-1">{stat.title}</span>
              <h3 className="text-[28px] font-[700] text-[#111827] leading-none">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Horizontal Date Selector */}
      <div className="sm:hidden flex gap-3 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 mb-2">
        {mockDates.map((d, i) => (
          <button key={i} className={`w-[56px] h-[64px] rounded-xl flex flex-col items-center justify-center shrink-0 transition-colors border ${
            d.active ? 'bg-[#2F80ED] border-[#2F80ED] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <span className={`text-[12px] font-semibold mb-0.5 ${d.active ? 'text-slate-900/80' : 'text-slate-500'}`}>{d.day}</span>
            <span className="text-[18px] font-black">{d.date}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden mb-6">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[13px] text-slate-500 font-bold tracking-wide uppercase">
                <th className="px-6 py-4 rounded-tl-[20px]">Patient Info</th>
                <th className="px-6 py-4">Doctor & Dept</th>
                <th className="px-6 py-4">Visit Type</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-[20px]">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {mockAppointments.filter(apt => apt.patient.toLowerCase().includes(searchTerm.toLowerCase())).map((apt) => (
                <tr key={apt.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
                        {apt.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{apt.patient}</p>
                        <p className="text-[12.5px] text-slate-500 font-medium">{apt.id} • {apt.gender}, {apt.age}y</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{apt.doctor}</p>
                    <p className="text-[12.5px] text-slate-500 font-medium">{apt.dept}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[12.5px] font-bold">
                      {apt.type === 'Online' ? <Video size={13}/> : <MapPin size={13}/>} 
                      {apt.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{apt.date}</p>
                    <p className="text-[12.5px] text-slate-500">{apt.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    {apt.status === "Completed" && <span className="inline-flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><CheckCircle2 size={12}/> Completed</span>}
                    {apt.status === "Waiting" && <span className="inline-flex items-center gap-1 text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><Clock size={12}/> Waiting</span>}
                    {apt.status === "Pending" && <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md text-[12px] font-bold"><Clock size={12}/> Pending</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-bold shadow-sm hover:bg-[#2F80ED] hover:text-white hover:border-[#2F80ED] transition-all">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {mockAppointments.filter(apt => apt.patient.toLowerCase().includes(searchTerm.toLowerCase())).map((apt) => (
            <div key={apt.id} className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[16px] shrink-0">
                    {apt.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{apt.patient}</h3>
                    <p className="text-[13px] text-slate-500">{apt.id} • {apt.gender}, {apt.age}y</p>
                  </div>
                </div>
                <div>
                  {apt.status === "Completed" && <span className="inline-flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md text-[11px] font-bold"><CheckCircle2 size={12}/> Completed</span>}
                  {apt.status === "Waiting" && <span className="inline-flex items-center gap-1 text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-md text-[11px] font-bold"><Clock size={12}/> Waiting</span>}
                  {apt.status === "Pending" && <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-bold"><Clock size={12}/> Pending</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Doctor</p>
                  <p className="text-[13px] font-bold text-slate-700">{apt.doctor}</p>
                  <p className="text-[12px] text-slate-500">{apt.dept}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Time & Type</p>
                  <p className="text-[13px] font-bold text-slate-700">{apt.date}</p>
                  <p className="text-[12px] text-slate-500">{apt.time} • {apt.type}</p>
                </div>
              </div>
              
              <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[13px] font-bold shadow-sm active:scale-95 transition-transform">
                View Details
              </button>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {mockAppointments.filter(apt => apt.patient.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
              No appointments found.
            </div>
        )}
      </div>
      
      </div> {/* Closes max-w-1200px container */}
    </div>
  );
}

const FilterChip = ({ label, active, icon }: { label: string, active?: boolean, icon?: React.ReactNode }) => {
  return (
    <button className={`px-4 py-2 rounded-[10px] text-[13px] font-[600] border transition-colors flex items-center gap-1.5 ${
      active 
        ? 'bg-[#111827] border-[#111827] text-slate-900' 
        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-slate-50'
    }`}>
      {icon} {label}
    </button>
  );
}

const Badge = ({ children, type }: { children: React.ReactNode, type: 'success' | 'warning' | 'error' | 'neutral' | 'primary' }) => {
  const styles = {
    success: "bg-[#6DDA6E]/10 text-[#6DDA6E]",
    warning: "bg-[#F2994A]/10 text-[#F2994A]",
    error: "bg-[#EB5757]/10 text-[#EB5757]",
    neutral: "bg-slate-100 text-[#6B7280]",
    primary: "bg-[#2F80ED]/10 text-[#2F80ED]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[12px] font-[700] uppercase tracking-wide ${styles[type]}`}>
      {children}
    </span>
  );
};
