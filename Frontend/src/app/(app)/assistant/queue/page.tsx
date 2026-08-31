"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Users, Clock, CheckCircle2, AlertCircle, 
  MoreVertical, Phone, Video, Stethoscope, ChevronLeft, ChevronRight,
  UserPlus, Play, MapPin
} from 'lucide-react';
import Image from 'next/image';

const stats = [
  { title: "Total Patients", count: "48", icon: Users, color: "text-sky-600", bg: "bg-sky-50 border border-sky-200" },
  { title: "Waiting", count: "14", icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border border-amber-200" },
  { title: "In Consultation", count: "2", icon: Stethoscope, color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200" },
];

const mockQueue = [
  { token: "S-01", name: "Rahim Uddin", age: 45, gender: "M", type: "Walk-in", doctor: "Dr. Farzana", time: "09:15 AM", estWait: "0m", priority: "Normal", status: "In Consultation" },
  { token: "S-02", name: "Fatema Begum", age: 32, gender: "F", type: "Online", doctor: "Dr. Farzana", time: "09:30 AM", estWait: "5m", priority: "High", status: "Waiting" },
  { token: "S-03", name: "Abdul Karim", age: 58, gender: "M", type: "Walk-in", doctor: "Dr. Farzana", time: "09:45 AM", estWait: "20m", priority: "Normal", status: "Waiting" },
  { token: "E-01", name: "Salma Akter", age: 28, gender: "F", type: "Emergency", doctor: "Dr. Farzana", time: "10:00 AM", estWait: "0m", priority: "Urgent", status: "Checking Vitals" },
  { token: "S-04", name: "Kamal Hossain", age: 50, gender: "M", type: "Online", doctor: "Dr. Farzana", time: "10:15 AM", estWait: "45m", priority: "Normal", status: "Waiting" },
];

export default function TodaysQueuePage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="w-full flex flex-col font-sans">
      
      {/* Mobile/Desktop Header Area */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pt-safe-top sticky top-0 z-30 -mx-4 sm:mx-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:p-0 sm:pt-0 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] sm:text-[32px] font-bold text-[#111827] tracking-tight flex items-center gap-2">
              <Users className="sm:hidden text-[#2F80ED]" size={24} />
              Today's Queue
            </h1>
            <p className="text-[13px] sm:text-[15px] text-[#6B7280] mt-1 hidden sm:block">Manage and monitor real-time patient flow.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none h-[52px] sm:h-[44px] px-5 bg-white border border-slate-200 rounded-xl text-[15px] sm:text-[14px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <UserPlus size={20} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Walk-in</span>
            </button>
            <button className="flex-1 sm:flex-none h-[52px] sm:h-[44px] px-6 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[15px] sm:text-[14px] font-bold shadow-md transition-colors flex items-center justify-center gap-2">
              <Play size={20} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" /> Call Next
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards (Hidden on mobile) */}
      <div className="hidden md:grid grid-cols-3 gap-6 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[16px] p-6 shadow-sm border border-[#E5E7EB] flex items-center gap-5">
            <div className={`w-[48px] h-[48px] rounded-[12px] flex items-center justify-center ${stat.bg}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <span className="text-[14px] font-[500] text-[#6B7280] block mb-1">{stat.title}</span>
              <h3 className="text-[28px] font-[700] text-[#111827] leading-none">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 -mx-4 sm:mx-0">
        
        {/* Left: Main Queue Table/List */}
        <div className="xl:col-span-2 bg-white sm:rounded-[16px] sm:shadow-sm sm:border border-[#E5E7EB] flex flex-col border-y sm:border-y-0">
          
          <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
              <input 
                type="text" 
                placeholder="Search token or name..." 
                className="w-full h-[52px] sm:h-[44px] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-11 pr-4 text-[15px] sm:text-[14px] text-[#111827] focus:outline-none focus:border-[#2F80ED] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="w-[52px] sm:w-[44px] h-[52px] sm:h-[44px] bg-white border border-[#E5E7EB] rounded-xl text-[#6B7280] hover:bg-slate-50 transition-colors flex items-center justify-center shrink-0">
              <Filter size={20} />
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr className="text-[13px] text-[#6B7280] font-bold h-[48px] uppercase tracking-wider">
                  <th className="px-6 py-3 whitespace-nowrap">Token</th>
                  <th className="px-6 py-3 whitespace-nowrap">Patient</th>
                  <th className="px-6 py-3 whitespace-nowrap">Time / Type</th>
                  <th className="px-6 py-3 whitespace-nowrap">Status</th>
                  <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {mockQueue.map((patient, i) => (
                  <tr key={i} className="border-b border-[#E5E7EB] hover:bg-slate-50/50 transition-colors h-[72px]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[16px] font-black ${patient.priority === 'Urgent' ? 'text-[#EB5757]' : 'text-[#111827]'}`}>
                        {patient.token}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111827] text-[15px]">{patient.name}</span>
                        <span className="text-[13px] text-[#6B7280] font-medium">{patient.age} Yrs • {patient.gender}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111827]">{patient.time}</span>
                        <span className="text-[13px] text-[#6B7280] mt-0.5">{patient.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge type={patient.status === 'In Consultation' ? 'success' : patient.status === 'Checking Vitals' ? 'primary' : 'neutral'}>
                        {patient.status === 'In Consultation' && <span className="w-1.5 h-1.5 bg-[#6DDA6E] rounded-full mr-1.5 animate-pulse"></span>}
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="h-[40px] px-4 text-[#2F80ED] bg-blue-50 font-bold rounded-[10px] hover:bg-[#2F80ED] hover:text-white transition-colors">
                        Call Next
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Edge-to-Edge Cards */}
          <div className="sm:hidden flex flex-col bg-slate-50 divide-y divide-slate-100">
            {mockQueue.map((patient, i) => (
              <div key={i} className="bg-white p-5 flex items-center gap-4">
                {/* Massive Token Badge */}
                <div className={`w-[56px] h-[56px] rounded-xl flex items-center justify-center text-[18px] font-black shrink-0 ${
                  patient.status === 'In Consultation' ? 'bg-[#6DDA6E] text-slate-900 shadow-md animate-pulse' : 
                  patient.priority === 'Urgent' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {patient.token.split('-')[1]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-[16px] font-bold text-slate-800 truncate">{patient.name}</h4>
                    {patient.status === 'In Consultation' && (
                      <span className="w-2 h-2 rounded-full bg-[#6DDA6E] animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-slate-500 mb-1.5">{patient.age}Y • {patient.doctor}</p>
                  
                  <div className="flex items-center gap-2">
                    <Badge type={patient.status === 'In Consultation' ? 'success' : patient.status === 'Checking Vitals' ? 'primary' : 'neutral'}>
                      {patient.status}
                    </Badge>
                  </div>
                </div>

                {/* Call Action */}
                {patient.status !== 'In Consultation' && (
                  <button className="w-[44px] h-[44px] rounded-xl bg-blue-50 text-[#2F80ED] flex items-center justify-center shrink-0 active:scale-95 transition-transform">
                    <Play size={20} fill="currentColor" />
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Right Side Panel (Desktop only for now to keep mobile clean, or hidden behind a tab) */}
        <div className="hidden xl:flex flex-col gap-6">
          <div className="bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] p-6">
            <h3 className="text-[18px] font-bold text-[#111827] mb-4">Queue Progress</h3>
            <div className="w-full h-[8px] bg-[#F8FAFC] rounded-full overflow-hidden mb-3">
              <div className="h-full bg-[#6DDA6E] w-[65%]"></div>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-[#6B7280]">32 of 48 completed</span>
              <span className="font-bold text-[#111827]">65%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Floating Action Button */}
      <button className="sm:hidden w-[64px] h-[64px] bg-[#2F80ED] text-white rounded-full fixed bottom-24 right-6 shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform">
        <UserPlus size={28} />
      </button>

    </div>
  );
}

const Badge = ({ children, type }: { children: React.ReactNode, type: 'success' | 'warning' | 'error' | 'neutral' | 'primary' }) => {
  const styles = {
    success: "bg-[#6DDA6E]/10 text-green-700",
    warning: "bg-[#F2994A]/10 text-orange-700",
    error: "bg-[#EB5757]/10 text-red-700",
    neutral: "bg-slate-100 text-[#6B7280]",
    primary: "bg-[#2F80ED]/10 text-[#2F80ED]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${styles[type]}`}>
      {children}
    </span>
  );
};
