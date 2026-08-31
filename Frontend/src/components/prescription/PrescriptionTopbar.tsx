"use client";

import React from "react";
import { Save, Check, Mic, Search, History, Eye } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface PrescriptionTopbarProps {
  onFinalize: () => void;
  onPreview: () => void;
  activeTab?: "prescription" | "report";
  onTabChange?: (tab: "prescription" | "report") => void;
}

export function PrescriptionTopbar({ onFinalize, onPreview, activeTab = "prescription", onTabChange }: PrescriptionTopbarProps) {
  const searchParams = useSearchParams();
  const patientName = searchParams?.get('patientName') || "Select Patient";
  const patientId = searchParams?.get('patientId') || "N/A";
  const appointmentTime = searchParams?.get('appointmentTime') || "Quick Consult";
  const doctorName = "Dr. Patient"; // Mock context
  const clinicName = "ABC Medical Center"; // Mock context

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 rounded-t-[32px] px-4 md:px-6 py-2.5 min-h-[64px] flex flex-col md:flex-row items-center justify-between shrink-0 shadow-none z-30 gap-3 md:gap-4 relative">
      
      {/* Left Section - Title */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-700 text-[16px] md:text-[18px]">Doctor Workspace</h2>
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 hidden sm:block">Draft</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-2.5 lg:gap-3 xl:gap-4 w-full md:w-auto justify-end">
        {/* Workspace Tabs - Professional Segmented Control */}
        {onTabChange && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onTabChange("prescription")}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 lg:px-5 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === "prescription" 
                  ? "bg-white text-sky-600 shadow-xs border border-slate-200/60" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Prescription
            </button>
            <button
              onClick={() => onTabChange("report")}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 lg:px-5 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === "report" 
                  ? "bg-white text-sky-600 shadow-xs border border-slate-200/60" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Test Reports
            </button>
          </div>
        )}
        
        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-between md:justify-end overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {patientName === "Select Patient" && (
            <button className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1.5 sm:py-2 rounded-xl hover:bg-sky-100 transition-all shrink-0">
              <Search size={15} />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}

          <button className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-500 hover:text-slate-700 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
            <History size={15} />
            <span className="hidden xl:inline">History</span>
          </button>

          <button className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-500 hover:text-slate-700 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
            <Mic size={15} />
            <span className="hidden xl:inline">Voice</span>
          </button>
          
          <div className="h-5 w-[1px] bg-slate-200 mx-0.5 hidden md:block"></div>
          
          <button 
            onClick={() => toast.success("Draft Saved")}
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-700 bg-white border border-slate-200 shadow-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shrink-0"
          >
            <Save size={15} className="text-sky-600" />
            <span className="hidden sm:inline">Save</span>
          </button>
          
          <button 
            onClick={onPreview} 
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-slate-200 transition-all active:scale-95 shrink-0"
          >
            <Eye size={15} />
            <span className="hidden sm:inline">Preview</span>
          </button>
          
          <button 
            onClick={onFinalize} 
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all active:scale-95 shrink-0"
          >
            <Check size={15} strokeWidth={2.5} />
            <span>Finalize</span>
          </button>
        </div>
      </div>
    </div>
  );
}
