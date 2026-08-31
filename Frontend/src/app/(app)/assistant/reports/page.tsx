"use client";

import React, { useState } from "react";
import { FileText, Search, Activity, CheckCircle2, Clock, Filter, ChevronRight, BarChart3, TrendingUp } from "lucide-react";
import { TestReportViewer } from "@/components/prescription/TestReportViewer";

const MOCK_REPORTS = [
  { id: "RPT-101", patientName: "Rahim Chowdhury", patientId: "R 50 29 53", type: "Pathology", name: "Complete Blood Count", date: "24 Jul 2026", status: "Ready", pages: 3 },
  { id: "RPT-102", patientName: "Fatema Begum", patientId: "F 44 21 09", type: "Radiology", name: "Chest X-Ray", date: "24 Jul 2026", status: "Pending", pages: 1 },
  { id: "RPT-103", patientName: "Kamal Hossain", patientId: "K 99 11 32", type: "Pathology", name: "Lipid Profile", date: "23 Jul 2026", status: "Delivered", pages: 2 }
];

export default function AssistantReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ready": return <span className="bg-[#22C55E]/10 text-[#22C55E] px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Ready</span>;
      case "Pending": return <span className="bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> Pending</span>;
      case "Delivered": return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Delivered</span>;
      default: return null;
    }
  };

  const filteredReports = MOCK_REPORTS.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || r.patientId.toLowerCase().includes(searchQuery.toLowerCase()) || r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (selectedReportId) {
    const report = MOCK_REPORTS.find(r => r.id === selectedReportId);
    if (report) {
      const url = new URL(window.location.href);
      url.searchParams.set('patientId', report.patientId);
      url.searchParams.set('patientName', report.patientName);
      window.history.pushState({}, '', url);

      return (
        <div className="flex-1 flex flex-col bg-white min-h-screen">
          <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center pt-safe-top">
            <button 
              onClick={() => {
                setSelectedReportId(null);
                const url = new URL(window.location.href);
                url.searchParams.delete('patientId');
                url.searchParams.delete('patientName');
                window.history.pushState({}, '', url);
              }}
              className="text-[#2F80ED] font-bold text-[14px] flex items-center gap-1 active:scale-95 transition-transform"
            >
              <ChevronRight size={18} className="rotate-180" /> Back to Reports
            </button>
          </div>
          <TestReportViewer />
        </div>
      );
    }
  }

  return (
    <div className="flex-1 flex flex-col font-sans">
      
      {/* Header Area */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pt-safe-top relative z-10 -mx-4 sm:mx-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:p-0 sm:pt-0 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] sm:text-[32px] font-bold text-[#111827] tracking-tight flex items-center gap-2">
              <BarChart3 className="sm:hidden text-[#2F80ED]" size={24} />
              Reports & Analytics
            </h1>
            <p className="text-[13px] sm:text-[15px] text-[#6B7280] mt-1 hidden sm:block">Monitor lab reports and daily performance metrics.</p>
          </div>
        </div>
      </div>

      {/* Analytics Grid (Mobile: 2 cols stacked, Desktop: 4 cols) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 px-4 sm:px-0">
        <div className="bg-white p-4 sm:p-6 rounded-2xl h-[100px] sm:h-auto sm:border border-slate-100 shadow-sm flex flex-col justify-center">
          <span className="text-[12px] sm:text-[14px] font-bold text-slate-500 uppercase mb-1">Total Reports</span>
          <span className="text-[24px] sm:text-[32px] font-black text-slate-800">142</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl h-[100px] sm:h-auto sm:border border-slate-100 shadow-sm flex flex-col justify-center">
          <span className="text-[12px] sm:text-[14px] font-bold text-slate-500 uppercase mb-1">Ready</span>
          <span className="text-[24px] sm:text-[32px] font-black text-[#22C55E]">86</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl h-[100px] sm:h-auto sm:border border-slate-100 shadow-sm flex flex-col justify-center">
          <span className="text-[12px] sm:text-[14px] font-bold text-slate-500 uppercase mb-1">Pending</span>
          <span className="text-[24px] sm:text-[32px] font-black text-amber-500">24</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl h-[100px] sm:h-auto sm:border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10"><TrendingUp size={100} /></div>
          <span className="text-[12px] sm:text-[14px] font-bold text-slate-500 uppercase mb-1">Delivered</span>
          <span className="text-[24px] sm:text-[32px] font-black text-[#2F80ED]">32</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white sm:rounded-[16px] sm:shadow-sm sm:border border-[#E5E7EB] flex flex-col overflow-hidden -mx-4 sm:mx-0 border-y sm:border-y-0">
        
        <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row gap-4 bg-white z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
            <input 
              type="text" 
              placeholder="Search patient or test..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[52px] sm:h-[44px] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-11 pr-4 text-[15px] sm:text-[14px] text-[#111827] focus:outline-none focus:border-[#2F80ED] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {["All", "Ready", "Pending", "Delivered"].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`h-[40px] px-4 rounded-xl text-[13px] font-bold whitespace-nowrap transition-colors border ${
                  filterStatus === status ? "bg-[#111827] border-[#111827] text-slate-900" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <tr className="text-[13px] text-[#6B7280] font-bold h-[48px] uppercase tracking-wider">
                <th className="px-6 py-3 whitespace-nowrap">Report ID</th>
                <th className="px-6 py-3 whitespace-nowrap">Patient</th>
                <th className="px-6 py-3 whitespace-nowrap">Test Name</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-[#E5E7EB] hover:bg-slate-50/50 transition-colors h-[72px]">
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-500">{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#111827]">{report.patientName}</span>
                      <span className="text-[13px] text-[#6B7280] font-mono">{report.patientId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#111827] flex items-center gap-1.5"><Activity size={16} className="text-[#2F80ED]"/> {report.name}</span>
                      <span className="text-[13px] text-[#6B7280]">{report.type} • {report.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => setSelectedReportId(report.id)}
                      disabled={report.status === "Pending"}
                      className="px-4 py-2 bg-slate-50 hover:bg-[#2F80ED] hover:text-white text-[#2F80ED] text-[13px] font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Edge-to-Edge List */}
        <div className="sm:hidden flex flex-col bg-slate-50 divide-y divide-slate-100">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.type === "Pathology" ? "bg-blue-50 text-[#2F80ED]" : "bg-purple-50 text-purple-600"}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-800 leading-tight">{report.name}</h4>
                    <p className="text-[13px] text-slate-500 font-medium mt-0.5">{report.type} • {report.date}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center mt-1">
                <div>
                  <p className="text-[14px] font-bold text-slate-700">{report.patientName}</p>
                  <p className="text-[12px] font-mono text-slate-500">{report.patientId}</p>
                </div>
                {getStatusBadge(report.status)}
              </div>

              <button 
                onClick={() => setSelectedReportId(report.id)}
                disabled={report.status === "Pending"}
                className="w-full h-[48px] mt-1 bg-blue-50 text-[#2F80ED] font-bold text-[15px] rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <FileText size={18} /> View Full Report
              </button>
            </div>
          ))}
          {filteredReports.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-slate-500" />
              </div>
              <p className="text-[15px] font-bold text-slate-700">No reports found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
