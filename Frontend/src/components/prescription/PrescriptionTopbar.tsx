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
  const doctorName = "Dr. Rafin"; // Mock context
  const clinicName = "ABC Medical Center"; // Mock context

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 min-h-[72px] flex flex-col md:flex-row items-center justify-between shrink-0 shadow-sm z-30 gap-4 md:gap-0 relative">
      
      {/* Left Section - Title */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-800 text-[16px] md:text-[18px]">Doctor Workspace</h2>
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 hidden sm:block">Draft</span>
        </div>
        
        {/* On mobile, show actions here if needed, or just let them wrap */}
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto justify-end">
        {/* Workspace Tabs - Professional Segmented Control */}
        {onTabChange && (
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-inner w-full md:w-auto">
            <button
              onClick={() => onTabChange("prescription")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[13.5px] font-bold transition-all duration-300 ${
                activeTab === "prescription" 
                  ? "bg-white text-[#2F80ED] shadow-[0_2px_8px_rgba(0,0,0,0.06)]" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              Prescription
            </button>
            <button
              onClick={() => onTabChange("report")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[13.5px] font-bold transition-all duration-300 ${
                activeTab === "report" 
                  ? "bg-white text-[#2F80ED] shadow-[0_2px_8px_rgba(0,0,0,0.06)]" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              Test Reports
            </button>
          </div>
        )}
        
        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {patientName === "Select Patient" && (
            <button className="flex items-center gap-2 text-[13px] font-bold text-[#2F80ED] bg-blue-50/80 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all shrink-0">
              <Search size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}

          <button className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
            <History size={16} />
            <span className="hidden lg:inline">History</span>
          </button>

          <button className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
            <Mic size={16} />
            <span className="hidden lg:inline">Voice</span>
          </button>
          
          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
          
          <button 
            onClick={() => toast.success("Draft Saved")}
            className="flex items-center gap-2 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shrink-0"
          >
            <Save size={16} className="text-[#2F80ED]" />
            <span className="hidden sm:inline">Save</span>
          </button>
          
          <button 
            onClick={onPreview} 
            className="flex items-center gap-2 text-[13px] font-bold text-white bg-slate-800 shadow-md px-4 py-2 rounded-xl hover:bg-slate-700 transition-all active:scale-95 shrink-0"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">Preview</span>
          </button>
          
          <button 
            onClick={onFinalize} 
            className="flex items-center gap-2 text-[13px] font-bold text-white bg-[#6DDA6E] shadow-[0_4px_16px_rgba(109,218,110,0.25)] px-5 py-2 rounded-xl hover:bg-[#5bc95c] transition-all active:scale-95 shrink-0"
          >
            <Check size={16} strokeWidth={3} />
            <span>Finalize</span>
          </button>
        </div>
      </div>
    </div>
  );
}
