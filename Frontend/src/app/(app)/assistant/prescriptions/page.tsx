"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Printer, Send, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, Activity
} from 'lucide-react';

const stats = [
  { title: "Pending Prescriptions", count: "12", icon: Clock, color: "text-[#F2994A]", bg: "bg-[#F2994A]/10" },
  { title: "Urgent", count: "3", icon: AlertCircle, color: "text-[#EB5757]", bg: "bg-[#EB5757]/10" },
  { title: "Completed Today", count: "45", icon: CheckCircle2, color: "text-[#6DDA6E]", bg: "bg-[#6DDA6E]/10" },
];

const prescriptions = [
  { id: "PR-9012", patient: "Salma Akter", doctor: "Dr. Farzana Alam", diagnosis: "Prenatal Checkup", time: "10:15 AM", priority: "Normal", status: "Pending" },
  { id: "PR-9013", patient: "Abdul Karim", doctor: "Dr. Hasan", diagnosis: "Severe Angina", time: "10:20 AM", priority: "Urgent", status: "Pending" },
  { id: "PR-9011", patient: "Rahim Uddin", doctor: "Dr. Farzana Alam", diagnosis: "Viral Fever", time: "09:45 AM", priority: "Normal", status: "Completed" },
  { id: "PR-9010", patient: "Fatema Begum", doctor: "Dr. Salma Akter", diagnosis: "Asthma", time: "09:30 AM", priority: "Normal", status: "Completed" },
];

export default function PrescriptionQueuePage() {
  return (
    <div className="w-full flex flex-col font-sans">
      
      {/* Mobile/Desktop Header Area */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pt-safe-top relative z-10 -mx-4 sm:mx-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:p-0 sm:pt-0 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] sm:text-[32px] font-bold text-[#111827] tracking-tight flex items-center gap-2">
              <FileText className="sm:hidden text-[#2F80ED]" size={24} />
              Prescription Queue
            </h1>
            <p className="text-[13px] sm:text-[15px] text-[#6B7280] mt-1 hidden sm:block">Manage, print, and process doctor prescriptions.</p>
          </div>
        </div>
      </div>

      {/* Stats (Hidden on mobile) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[16px] p-6 shadow-sm border border-[#E5E7EB] flex items-center gap-5">
            <div className={`w-[56px] h-[56px] rounded-[14px] flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon size={28} className={stat.color} />
            </div>
            <div>
              <span className="text-[14px] font-[600] text-[#6B7280] uppercase tracking-wider block mb-1">{stat.title}</span>
              <h3 className="text-[32px] font-[700] text-[#111827] leading-none">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="bg-white sm:rounded-[16px] sm:shadow-sm sm:border border-[#E5E7EB] flex flex-col overflow-hidden -mx-4 sm:mx-0 border-y sm:border-y-0">
        
        <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white z-10">
          <h2 className="hidden sm:flex text-[20px] font-bold text-[#111827] items-center gap-2"><FileText size={20} className="text-[#2F80ED]"/> Queue List</h2>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
            <input 
              type="text" 
              placeholder="Search ID or Patient..." 
              className="w-full h-[52px] sm:h-[44px] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-11 pr-4 text-[15px] sm:text-[14px] text-[#111827] focus:outline-none focus:border-[#2F80ED] transition-all"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <tr className="text-[13px] text-[#6B7280] font-bold h-[48px] uppercase tracking-wider">
                <th className="px-6 py-3 whitespace-nowrap">ID / Patient</th>
                <th className="px-6 py-3 whitespace-nowrap">Diagnosis / Doctor</th>
                <th className="px-6 py-3 whitespace-nowrap">Time</th>
                <th className="px-6 py-3 whitespace-nowrap">Priority</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {prescriptions.map((item, i) => (
                <tr key={i} className="border-b border-[#E5E7EB] hover:bg-slate-50/50 transition-colors h-[72px]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#111827] text-[15px]">{item.patient}</span>
                      <span className="text-[13px] text-[#6B7280] font-mono">{item.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#111827] flex items-center gap-1.5"><Activity size={16} className="text-[#6DDA6E]"/> {item.diagnosis}</span>
                      <span className="text-[13px] text-[#6B7280] font-medium">{item.doctor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-[#111827] flex items-center gap-1.5"><Clock size={16} className="text-[#6B7280]"/> {item.time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge type={item.priority === 'Urgent' ? 'error' : 'neutral'}>{item.priority}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge type={item.status === 'Completed' ? 'success' : 'warning'}>{item.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === 'Pending' && (
                        <>
                          <button className="h-[36px] px-3 bg-white border border-[#E5E7EB] text-[#111827] text-[13px] font-[600] rounded-[8px] hover:border-[#2F80ED] hover:text-[#2F80ED] transition-colors flex items-center gap-1.5 shadow-sm">
                            <Send size={14} /> Send
                          </button>
                          <button className="h-[36px] px-3 bg-[#6DDA6E] text-slate-900 text-[13px] font-[600] rounded-[8px] hover:bg-[#5bc95c] transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(109,218,110,0.3)]">
                            <CheckCircle2 size={14} /> Complete
                          </button>
                        </>
                      )}
                      {item.status === 'Completed' && (
                        <button className="h-[36px] px-3 bg-white border border-[#E5E7EB] text-[#111827] text-[13px] font-[600] rounded-[8px] hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm">
                          <Printer size={14} /> Print
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Edge-to-Edge Cards */}
        <div className="sm:hidden flex flex-col bg-slate-50 divide-y divide-slate-100">
          {prescriptions.map((item, i) => (
            <div key={i} className="bg-white px-5 py-4 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[16px] font-bold text-slate-800 leading-tight">{item.patient}</h3>
                  <p className="text-[13px] font-medium text-slate-500 font-mono mt-0.5">{item.id} • {item.time}</p>
                </div>
                <Badge type={item.priority === 'Urgent' ? 'error' : 'neutral'}>{item.priority}</Badge>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-bold text-[#111827] flex items-center gap-1.5 text-[14px]">
                  <Activity size={16} className="text-[#6DDA6E]"/> {item.diagnosis}
                </span>
                <span className="text-[13px] text-[#6B7280] block mt-1 ml-5">Rx by {item.doctor}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1 border-t border-slate-50">
                {item.status === 'Pending' ? (
                  <button className="w-full h-[56px] bg-[#6DDA6E] hover:bg-[#5bc95c] text-slate-900 font-black text-[16px] rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                    <Printer size={20} /> Print & Complete
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="flex-1 h-[48px] bg-slate-100 text-slate-700 font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                      <Printer size={18} /> Print Again
                    </button>
                    <button className="flex-1 h-[48px] bg-blue-50 text-[#2F80ED] font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                      <Send size={18} /> Send Digital
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
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
