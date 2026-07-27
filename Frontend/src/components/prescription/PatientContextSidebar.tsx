import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Activity, Clock, FileText, Pill, AlertTriangle, X, Eye, Sparkles, Loader2 } from "lucide-react";
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
  }

  return (
    <div className={`flex gap-4 w-full mb-2 ${isDesktop ? 'flex-col' : 'flex-col lg:flex-row'}`}>
      {/* Patient Profile Card */}
      <div className={`bg-white rounded-[12px] shadow-sm border border-slate-200 p-4 shrink-0 ${isDesktop ? 'w-full' : 'w-full lg:w-[350px]'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
            <User size={20} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-[15px] truncate">{typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('patientName') || "Rahim Uddin" : "Rahim Uddin"}</h3>
            <p className="text-[12px] text-slate-500 font-medium">{patientId || "No ID"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col justify-center">
            <p className="text-[9px] text-slate-500 uppercase font-semibold mb-0.5">Blood</p>
            <p className="font-bold text-slate-800 text-[12px]">O+ (Pos)</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col justify-center">
            <p className="text-[9px] text-slate-500 uppercase font-semibold mb-0.5">WT/BMI</p>
            <p className="font-bold text-slate-800 text-[12px]">76kg/24.2</p>
          </div>
        </div>

        {/* Critical Info */}
        <div className={`grid ${isDesktop ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          <div className="flex items-start gap-1.5 bg-red-50 text-red-700 p-2 rounded-lg border border-red-100">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Allergies</p>
              <p className="text-[11px] font-medium leading-tight line-clamp-1">Penicillin, Peanuts</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5 bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-100">
            <Activity size={14} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Chronic</p>
              <p className="text-[11px] font-medium leading-tight line-clamp-1">Type 2 Diabetes, HTN</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Timeline */}
      <div className="bg-white rounded-[12px] shadow-sm border border-slate-200 p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-800 text-[13px] mb-4 flex items-center gap-1.5">
          <Clock size={14} className="text-[#2F80ED]" />
          Medical Timeline & Reports
        </h3>
        
        <div className={`flex-1 overflow-x-auto custom-scrollbar ${isDesktop ? 'pb-2' : 'pb-1'}`}>
          <div className={`flex items-start ${isDesktop ? 'flex-col gap-4 pl-4 border-l-2 border-slate-100 ml-2' : 'gap-4 min-w-max'}`}>
            
            {/* Timeline Item 1: Current Appt */}
            <div className={`flex relative ${isDesktop ? 'flex-col w-full' : 'flex-col min-w-[140px]'}`}>
              {isDesktop ? (
                <div className="absolute -left-[26px] top-0.5 w-3 h-3 rounded-full bg-[#6DDA6E] border-[3px] border-white shadow-sm" />
              ) : (
                <>
                  <div className="absolute top-1 -left-2 w-[calc(100%+16px)] h-0.5 bg-slate-100 -z-10" />
                  <div className="w-3 h-3 rounded-full bg-[#6DDA6E] border-[2px] border-white shadow-sm mb-2" />
                </>
              )}
              <p className="text-[10px] font-bold text-[#6DDA6E] mb-1">Current Appt</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 hover:border-[#6DDA6E]/50 transition-colors cursor-pointer group">
                <p className="text-[11px] font-bold text-slate-800 mb-0.5 group-hover:text-[#6DDA6E] transition-colors leading-tight">Prescribing...</p>
                <p className="text-[10px] text-slate-500">Dr. Rafin</p>
              </div>
            </div>

            {/* Dynamic Test Reports */}
            {currentTestReports.map((report, idx) => (
              <div key={report.id} className={`flex relative ${isDesktop ? 'flex-col w-full' : 'flex-col min-w-[140px]'}`}>
                {isDesktop ? (
                  <div className="absolute -left-[26px] top-0.5 w-3 h-3 rounded-full bg-[#2F80ED] border-[3px] border-white shadow-sm" />
                ) : (
                  <>
                    <div className="absolute top-1 -left-2 w-[calc(100%+16px)] h-0.5 bg-slate-100 -z-10" />
                    <div className="w-3 h-3 rounded-full bg-[#2F80ED] border-[2px] border-white shadow-sm mb-2" />
                  </>
                )}
                <p className="text-[10px] font-bold text-[#2F80ED] mb-1">{report.date}</p>
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
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2 hover:border-[#2F80ED]/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5 justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileText size={12} className="text-slate-400 group-hover:text-[#2F80ED]" />
                      <p className="text-[11px] font-bold text-slate-800 group-hover:text-[#2F80ED] transition-colors leading-tight line-clamp-1">{report.name}</p>
                    </div>
                    <Eye size={12} className="text-[#2F80ED] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{report.summary}</p>
                </div>
              </div>
            ))}

            {/* Static Old Timeline Item */}
            <div className={`flex relative ${isDesktop ? 'flex-col w-full' : 'flex-col min-w-[140px]'}`}>
              {isDesktop ? (
                <div className="absolute -left-[26px] top-0.5 w-3 h-3 rounded-full bg-slate-300 border-[3px] border-white shadow-sm" />
              ) : (
                <>
                  <div className="absolute top-1 -left-2 w-full h-0.5 bg-slate-100 -z-10" />
                  <div className="w-3 h-3 rounded-full bg-slate-300 border-[2px] border-white shadow-sm mb-2" />
                </>
              )}
              <p className="text-[10px] font-bold text-slate-500 mb-1">05 Aug 2025</p>
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
                className="bg-slate-50 border border-slate-200 rounded-lg p-2 hover:border-slate-300 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-0.5 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Pill size={12} className="text-slate-400" />
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Previous Rx</p>
                  </div>
                  <Eye size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">Dr. Aminul Islam</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Past History Modal */}
      {isMounted && createPortal(
        <AnimatePresence>
        {selectedHistory && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-[95vw] md:w-[80vw] lg:w-[1200px] h-[95vh] md:h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{selectedHistory.type}</h2>
                  <p className="text-sm font-medium text-slate-500">{selectedHistory.date}</p>
                </div>
                <button 
                  onClick={closeHistory}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Doctor / Source</h4>
                    <p className="font-semibold text-slate-800 text-[14px]">{selectedHistory.doctor}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status / Diagnosis</h4>
                    <p className="font-semibold text-slate-800 text-[14px]">{selectedHistory.diagnosis}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Details / Report Content</h4>
                  <p className="text-[14px] text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedHistory.details}</p>
                </div>

                {/* AI Summarization Section */}
                {selectedHistory.isReport && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 mt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Sparkles size={16} />
                      </div>
                      <h4 className="font-bold text-slate-800">AI Report Analysis</h4>
                    </div>
                    
                    {!aiSummary && !aiLoading && (
                      <p className="text-sm text-slate-600 mb-4">Click to generate an AI summary and get automated clinical insights on this test report.</p>
                    )}
                    
                    {aiLoading && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-4">
                        <Loader2 size={16} className="animate-spin" /> Analyzing report...
                      </div>
                    )}
                    
                    {aiSummary && (
                      <div className="bg-white rounded-lg p-4 text-sm text-slate-700 leading-relaxed shadow-sm border border-slate-200 mb-4">
                        {aiSummary}
                      </div>
                    )}

                    {!aiSummary && (
                      <button 
                        onClick={() => handleGenerateAISummary(selectedHistory.details)}
                        disabled={aiLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[#2F80ED] hover:bg-[#256bbd] text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Sparkles size={16} /> Generate AI Summary
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
