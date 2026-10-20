"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Activity, Clock, FileText, Pill, AlertTriangle, X, Eye, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDoctor } from "@/context/DoctorContext";

export function PatientContextSidebar({ isDesktop = false }: { isDesktop?: boolean }) {
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const { testReports } = useDoctor();
  
  // Extract Patient ID from URL
  const patientId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('patientId') : null;
  const currentTestReports = patientId ? (testReports[patientId] || []) : [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGenerateAISummary = (reportDetails: string) => {
    setAiLoading(true);
    setAiSummary(null);
    // Simulate AI generation delay
    setTimeout(() => {
      setAiLoading(false);
      setAiSummary(`AI Insight: Based on the report, the patient has a mildly abnormal result. Ensure follow-up in 2 weeks. The key highlights are: ${reportDetails}`);
    }, 1500);
  };

  const closeHistory = () => {
    setSelectedHistory(null);
    setAiSummary(null);
  };

  return (
    <div className={`flex gap-4 w-full mb-2 ${isDesktop ? 'flex-col' : 'flex-col lg:flex-row'}`}>
      {/* Patient Profile Card */}
      <div className={`bg-white rounded-2xl shadow-xs border border-slate-200 p-4 shrink-0 ${isDesktop ? 'w-full' : 'w-full lg:w-[350px]'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xs shrink-0">
            <User size={19} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-[15px] truncate">
              {typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('patientName') || "Rahim Uddin" : "Rahim Uddin"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium font-mono">{patientId || "S-01"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div className="bg-white border border-rose-100/90 hover:border-rose-300 rounded-xl p-2.5 flex flex-col justify-center relative overflow-hidden transition-all shadow-2xs group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 group-hover:w-1.5 transition-all"></div>
            <p className="text-[9.5px] text-rose-600 uppercase font-black tracking-wider mb-0.5 ml-1.5">Blood</p>
            <p className="font-extrabold text-slate-900 text-[13.5px] ml-1.5">O+ (Pos)</p>
          </div>
          <div className="bg-white border border-emerald-100/90 hover:border-emerald-300 rounded-xl p-2.5 flex flex-col justify-center relative overflow-hidden transition-all shadow-2xs group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 group-hover:w-1.5 transition-all"></div>
            <p className="text-[9.5px] text-emerald-700 uppercase font-black tracking-wider mb-0.5 ml-1.5">WT/BMI</p>
            <p className="font-extrabold text-slate-900 text-[13.5px] ml-1.5">76kg/24.2</p>
          </div>
        </div>

        {/* Critical Info: Clean, High-Contrast Medical Badges */}
        <div className={`grid ${isDesktop ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          <div className="flex items-start gap-2 bg-gradient-to-br from-rose-50 to-red-50/50 text-rose-800 p-2.5 rounded-xl border border-rose-200 shadow-2xs hover:border-rose-300 transition-colors">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-600" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-700 mb-0.5">Allergies</p>
              <p className="text-[11px] font-bold text-rose-950 leading-tight truncate">Penicillin, Peanuts</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gradient-to-br from-sky-50 to-blue-50/50 text-sky-800 p-2.5 rounded-xl border border-sky-200 shadow-2xs hover:border-sky-300 transition-colors">
            <Activity size={15} className="mt-0.5 shrink-0 text-sky-600" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-sky-700 mb-0.5">Chronic</p>
              <p className="text-[11px] font-bold text-sky-950 leading-tight truncate">Type 2 Diabetes, HTN</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Timeline */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 text-[13.5px] mb-4 flex items-center gap-2">
          <Clock size={16} className="text-sky-600" />
          <span>Medical Timeline & Reports</span>
        </h3>
        
        <div className={`flex-1 overflow-x-auto custom-scrollbar ${isDesktop ? 'pb-2' : 'pb-1'}`}>
          <div className={`flex items-start ${isDesktop ? 'flex-col gap-4 pl-4 border-l-2 border-slate-200 ml-2' : 'gap-4 min-w-max'}`}>
            
            {/* Timeline Item 1: Current Appt */}
            <div className={`flex relative ${isDesktop ? 'flex-col w-full' : 'flex-col min-w-[140px]'}`}>
              {isDesktop ? (
                <div className="absolute -left-[26px] top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shadow-xs" />
              ) : (
                <>
                  <div className="absolute top-1.5 -left-2 w-[calc(100%+16px)] h-0.5 bg-slate-200 -z-10" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shadow-xs mb-2.5" />
                </>
              )}
              <p className="text-[10.5px] font-bold text-emerald-700 mb-1">Current Appt</p>
              <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/40 border border-emerald-200 rounded-xl p-2.5 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer shadow-xs group">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-[12px] font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors leading-tight">Prescribing...</p>
                </div>
                <p className="text-[11px] font-semibold text-emerald-700/80">Dr. Patient</p>
              </div>
            </div>

            {/* Dynamic Test Reports */}
            {currentTestReports.map((report) => (
              <div key={report.id} className={`flex relative ${isDesktop ? 'flex-col w-full' : 'flex-col min-w-[140px]'}`}>
                {isDesktop ? (
                  <div className="absolute -left-[26px] top-0 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-sky-100 shadow-xs" />
                ) : (
                  <>
                    <div className="absolute top-1.5 -left-2 w-[calc(100%+16px)] h-0.5 bg-slate-200 -z-10" />
                    <div className="w-3 h-3 rounded-full bg-sky-500 ring-4 ring-sky-100 shadow-xs mb-2.5" />
                  </>
                )}
                <p className="text-[10.5px] font-bold text-sky-700 mb-1">{report.date}</p>
                <div 
                  onClick={() => {
                    toast.success("Opening Past History");
                    setSelectedHistory({
                      date: report.date,
                      type: `Lab Report: ${report.name}`,
                      doctor: "System/Lab",
                      diagnosis: report.status,
                      details: report.summary,
                      isReport: true
                    });
                  }}
                  className="bg-gradient-to-br from-sky-50/90 to-indigo-50/40 border border-sky-200 rounded-xl p-2.5 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 mb-1 justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText size={14} className="text-sky-600 group-hover:text-sky-700 shrink-0" />
                      <p className="text-[12px] font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-tight truncate">{report.name}</p>
                    </div>
                    <Eye size={14} className="text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{report.summary}</p>
                </div>
              </div>
            ))}

            {/* Static Old Timeline Item: Previous Rx */}
            <div className={`flex relative ${isDesktop ? 'flex-col w-full' : 'flex-col min-w-[140px]'}`}>
              {isDesktop ? (
                <div className="absolute -left-[26px] top-0 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-slate-100 shadow-xs" />
              ) : (
                <>
                  <div className="absolute top-1.5 -left-2 w-full h-0.5 bg-slate-200 -z-10" />
                  <div className="w-3 h-3 rounded-full bg-slate-400 ring-4 ring-slate-100 shadow-xs mb-2.5" />
                </>
              )}
              <p className="text-[10.5px] font-bold text-slate-500 mb-1">05 Aug 2025</p>
              <div 
                onClick={() => {
                  toast.success("Opening Past History");
                  setSelectedHistory({
                    date: "05 Aug 2025",
                    type: "Prescription",
                    doctor: "Dr. Aminul Islam",
                    diagnosis: "Viral Fever",
                    details: "Patient presented with 102F fever and body ache. Prescribed Paracetamol 500mg (1+1+1) for 5 days.",
                    isReport: false
                  });
                }}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 rounded-xl p-2.5 hover:shadow-md transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-1.5 mb-1 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Pill size={14} className="text-slate-500 group-hover:text-sky-600 transition-colors" />
                    <p className="text-[12px] font-bold text-slate-800 group-hover:text-sky-700 transition-colors leading-tight">Previous Rx</p>
                  </div>
                  <Eye size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Dr. Aminul Islam</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Past History Modal */}
      {isMounted && createPortal(
        <AnimatePresence>
        {selectedHistory && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-[95vw] md:w-[80vw] lg:w-[1200px] h-[95vh] md:h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedHistory.type}</h2>
                  <p className="text-sm font-medium text-slate-500">{selectedHistory.date}</p>
                </div>
                <button 
                  onClick={closeHistory}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 mb-4 border-b border-slate-200 pb-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor / Source</h4>
                    <p className="font-bold text-slate-900 text-[14px]">{selectedHistory.doctor}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status / Diagnosis</h4>
                    <p className="font-bold text-slate-900 text-[14px]">{selectedHistory.diagnosis}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Details / Report Content</h4>
                  <p className="text-[14px] text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">{selectedHistory.details}</p>
                </div>

                {/* AI Summarization Section */}
                {selectedHistory.isReport && (
                  <div className="bg-sky-50/70 rounded-2xl border border-sky-200 p-5 mt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-sky-400/30 overflow-hidden flex items-center justify-center shrink-0">
                        <img src="/dr-pekr.jpg" alt="Dr. pekr" className="w-full h-full object-contain p-0 scale-90" />
                      </div>
                      <h4 className="font-bold text-slate-900">Dr. pekr Report Analysis</h4>
                    </div>
                    
                    {!aiSummary && !aiLoading && (
                      <p className="text-sm text-slate-600 mb-4">Click to generate an AI summary and get automated clinical insights on this test report.</p>
                    )}
                    
                    {aiLoading && (
                      <div className="flex items-center gap-2 text-sky-600 text-sm font-medium mb-4">
                        <Loader2 size={16} className="animate-spin" /> Analyzing report...
                      </div>
                    )}
                    
                    {aiSummary && (
                      <div className="bg-white rounded-xl p-4 text-sm text-slate-800 leading-relaxed shadow-xs border border-slate-200 mb-4">
                        {aiSummary}
                      </div>
                    )}

                    {!aiSummary && (
                      <button 
                        onClick={() => handleGenerateAISummary(selectedHistory.details)}
                        disabled={aiLoading}
                        className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <Bot size={16} /> Generate AI Summary
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
