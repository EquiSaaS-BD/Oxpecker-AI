"use client";

import React, { useState } from "react";
import { Search, Filter, FileText, AlertCircle, CheckCircle2, ChevronRight, Activity, FlaskConical, Stethoscope } from "lucide-react";
import { ReportPreviewPanel } from "./ReportPreviewPanel";

const mockReports = [
  { id: 1, patientName: "Rahim Uddin", testName: "Complete Blood Count (CBC)", date: "12 Oct 2025", status: "Critical", refBy: "Self", category: "Pathology" },
  { id: 2, patientName: "Karim Ali", testName: "Lipid Profile", date: "12 Oct 2025", status: "Normal", refBy: "Dr. Ahmed", category: "Pathology" },
  { id: 3, patientName: "Fatima Begum", testName: "ECG", date: "11 Oct 2025", status: "Pending", refBy: "Self", category: "Cardiology" },
  { id: 4, patientName: "Sumon Khan", testName: "Chest X-Ray", date: "10 Oct 2025", status: "Reviewed", refBy: "Self", category: "Radiology" },
  { id: 5, patientName: "Nasima Akter", testName: "HbA1c", date: "10 Oct 2025", status: "Critical", refBy: "Dr. Rafin", category: "Pathology" },
];

export function ReportsDashboard() {
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] relative overflow-hidden">
      <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out ${selectedReport ? 'mr-[400px]' : ''}`}>
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          
          {/* 1. Top Action Header (Height: 64px) */}
          <div className="h-[64px] flex items-center justify-between">
            <h1 className="text-[24px] font-semibold text-[#111827] tracking-tight">Reports & Diagnostics</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search patients, tests..."
                  className="w-[320px] h-[40px] pl-10 pr-4 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-700 outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED]/20 shadow-sm transition-all"
                />
              </div>
              <button className="h-[40px] px-4 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* 2. Summary Statistics Cards (Height: 100px, Gap: 24px) */}
          <div className="flex gap-6">
            <div className="flex-1 h-[100px] bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase text-slate-500 tracking-wider mb-1">Total Reports</p>
                <p className="text-[28px] font-bold text-[#111827] leading-none">124</p>
              </div>
              <div className="w-[40px] h-[40px] bg-blue-50 text-[#2F80ED] rounded-[10px] flex items-center justify-center">
                <FileText size={20} />
              </div>
            </div>

            <div className="flex-1 h-[100px] bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase text-slate-500 tracking-wider mb-1">Pending Review</p>
                <p className="text-[28px] font-bold text-amber-500 leading-none">12</p>
              </div>
              <div className="w-[40px] h-[40px] bg-amber-50 text-amber-500 rounded-[10px] flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
            </div>

            <div className="flex-1 h-[100px] bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase text-slate-500 tracking-wider mb-1">Critical Values</p>
                <p className="text-[28px] font-bold text-red-500 leading-none">3</p>
              </div>
              <div className="w-[40px] h-[40px] bg-red-50 text-red-500 rounded-[10px] flex items-center justify-center">
                <Activity size={20} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            {["All", "Pending", "Critical", "Reviewed"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[14px] font-semibold transition-colors border-b-2 ${
                  activeTab === tab 
                    ? "border-[#2F80ED] text-[#2F80ED]" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 3. Main Reports Table (Row Height: 72px) */}
          <div className="w-full bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden min-h-[500px] flex flex-col">
            {/* Header Row (Height: 48px) */}
            <div className="h-[48px] bg-slate-50 border-b border-slate-200 flex items-center px-6 shrink-0">
              <div className="w-[25%] text-[12px] font-bold uppercase text-slate-500 tracking-wider">Patient Name</div>
              <div className="w-[30%] text-[12px] font-bold uppercase text-slate-500 tracking-wider">Test / Diagnostic</div>
              <div className="w-[20%] text-[12px] font-bold uppercase text-slate-500 tracking-wider">Date</div>
              <div className="w-[20%] text-[12px] font-bold uppercase text-slate-500 tracking-wider">Status</div>
              <div className="w-[5%]"></div>
            </div>

            {/* Data Rows */}
            <div className="flex-1 overflow-y-auto">
              {mockReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`h-[72px] flex items-center px-6 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors
                    ${selectedReport?.id === report.id ? 'bg-blue-50/50' : ''}
                  `}
                >
                  <div className="w-[25%] pr-4">
                    <p className="text-[15px] font-bold text-[#111827] truncate">{report.patientName}</p>
                    <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5">Ref: {report.refBy}</p>
                  </div>
                  
                  <div className="w-[30%] pr-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                      {report.category === "Pathology" ? <FlaskConical size={14} /> : <Stethoscope size={14} />}
                    </div>
                    <p className="text-[14px] font-semibold text-[#374151] truncate">{report.testName}</p>
                  </div>
                  
                  <div className="w-[20%] pr-4">
                    <p className="text-[13px] font-medium text-slate-600">{report.date}</p>
                  </div>
                  
                  <div className="w-[20%] pr-4 flex items-center">
                    {report.status === "Critical" && (
                      <span className="h-[24px] px-3 bg-red-100 text-red-700 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        CRITICAL
                      </span>
                    )}
                    {report.status === "Pending" && (
                      <span className="h-[24px] px-3 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold flex items-center border border-amber-200">
                        PENDING
                      </span>
                    )}
                    {report.status === "Normal" && (
                      <span className="h-[24px] px-3 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold flex items-center border border-emerald-200">
                        NORMAL
                      </span>
                    )}
                    {report.status === "Reviewed" && (
                      <span className="h-[24px] px-3 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold flex items-center border border-slate-200">
                        <CheckCircle2 size={12} className="mr-1" /> REVIEWED
                      </span>
                    )}
                  </div>

                  <div className="w-[5%] flex justify-end text-slate-400">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 4. Sliding Preview Panel (Right Side) */}
      <div 
        className={`absolute top-0 right-0 h-full transition-transform duration-300 ease-in-out ${
          selectedReport ? 'translate-x-0' : 'translate-x-[400px]'
        }`}
      >
        <ReportPreviewPanel 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      </div>

    </div>
  );
}
