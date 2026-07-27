"use client";

import React, { useState, useEffect } from "react";
import { MedicineBuilder } from "./MedicineBuilder";
import { PatientContextSidebar } from "./PatientContextSidebar";
import { usePrescription } from "@/context/PrescriptionContext";
import { Plus, X, Loader2 } from "lucide-react";

interface SmartEditorAreaProps {
  onFinalize: () => void;
}

export function SmartEditorArea({ onFinalize }: SmartEditorAreaProps) {
  const { data, updateData, updateVitals } = usePrescription();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const appendToState = (field: keyof typeof data, newText: string) => {
    const currentVal = data[field] as string;
    updateData({ [field]: currentVal ? `${currentVal}, ${newText}` : newText });
  };

  const [customTest, setCustomTest] = useState("");

  const handleAddInvestigation = (test: string) => {
    const trimmed = test.trim();
    if (trimmed && !data.investigationsList?.includes(trimmed)) {
      updateData({ investigationsList: [...(data.investigationsList || []), trimmed] });
    }
    setCustomTest("");
  };

  const handleRemoveInvestigation = (test: string) => {
    updateData({ investigationsList: (data.investigationsList || []).filter(t => t !== test) });
  };

  return (
    <div className="flex flex-col h-auto xl:h-full bg-white relative">
      <div className="flex-1 overflow-visible xl:overflow-y-auto custom-scrollbar p-5 lg:p-6">
        
        {isLoading ? (
          <div className="w-full flex flex-col gap-5 animate-in fade-in duration-500">
            {/* Patient Info Header Skeleton */}
            <div className="w-full h-[140px] bg-slate-50 border border-slate-100 rounded-[12px] shadow-sm animate-pulse p-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-5 bg-slate-200 rounded-md" />
                  <div className="w-1/4 h-4 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-20 h-6 bg-slate-200 rounded-md" />
                <div className="w-24 h-6 bg-slate-200 rounded-md" />
              </div>
            </div>

            {/* Text Area Skeleton 1 */}
            <div className="w-full min-h-[100px] p-4 bg-white border border-slate-100 rounded-[12px] shadow-sm flex flex-col gap-3 animate-pulse">
              <div className="w-40 h-5 bg-slate-100 rounded-md" />
              <div className="w-full h-4 bg-slate-50 rounded-md mt-2" />
              <div className="w-3/4 h-4 bg-slate-50 rounded-md" />
            </div>

            {/* Text Area Skeleton 2 */}
            <div className="w-full min-h-[120px] p-4 bg-white border border-slate-100 rounded-[12px] shadow-sm flex flex-col gap-3 animate-pulse">
              <div className="w-36 h-5 bg-slate-100 rounded-md" />
              <div className="w-full h-4 bg-slate-50 rounded-md mt-2" />
              <div className="w-full h-4 bg-slate-50 rounded-md" />
              <div className="w-1/2 h-4 bg-slate-50 rounded-md" />
            </div>

            {/* Vitals Grid Skeleton */}
            <div className="w-full p-4 bg-white border border-slate-100 rounded-[12px] shadow-sm flex flex-col gap-4 animate-pulse">
              <div className="w-32 h-5 bg-slate-100 rounded-md" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-[10px] p-3 flex flex-col gap-2 h-[72px]">
                    <div className="w-16 h-3 bg-slate-200 rounded-md" />
                    <div className="w-12 h-5 bg-slate-200 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Meds Skeleton */}
            <div className="w-full min-h-[160px] p-4 bg-white border border-slate-100 rounded-[12px] shadow-sm flex flex-col gap-3 animate-pulse">
              <div className="w-32 h-5 bg-slate-100 rounded-md" />
              <div className="w-full h-12 bg-slate-50 rounded-lg mt-2" />
              <div className="w-full h-12 bg-slate-50 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-5 animate-in fade-in duration-500">
          
          {/* Patient Info Header */}
          <PatientContextSidebar isDesktop={false} />

          {/* Section 1: CHIEF COMPLAINT */}
          <div className="w-full min-h-[100px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-2 group transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-[#111827]">CHIEF COMPLAINT</h3>
            <textarea 
              value={data.chiefComplaint}
              onChange={(e) => updateData({ chiefComplaint: e.target.value })}
              placeholder="Describe the patient's primary complaints..."
              className="w-full bg-transparent text-[#6B7280] text-[15px] leading-[1.6] placeholder:text-slate-300 resize-none outline-none focus:ring-0 flex-1"
            />
          </div>

          {/* Section 2: PHYSICAL EXAM */}
          <div className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-2 group transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-[#111827]">PHYSICAL EXAM</h3>
            <textarea 
              value={data.physicalExam}
              onChange={(e) => updateData({ physicalExam: e.target.value })}
              placeholder="Document physical examination findings..."
              className="w-full bg-transparent text-[#6B7280] text-[15px] leading-[1.6] placeholder:text-slate-300 resize-none outline-none focus:ring-0 flex-1"
            />
          </div>

          {/* Section 3: VITALS TODAY */}
          <div className="w-full p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-[#111827]">VITALS TODAY</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Blood Pressure", unit: "mmHg", placeholder: "120/80", field: "bp" },
                { label: "Pulse", unit: "bpm", placeholder: "72", field: "pulse" },
                { label: "Temperature", unit: "°F", placeholder: "98.6", field: "temp" },
                { label: "Weight", unit: "kg", placeholder: "70", field: "weight" },
                { label: "Height", unit: "cm", placeholder: "170", field: "height" },
                { label: "BMI", unit: "kg/m²", placeholder: "24.2", field: "bmi" },
                { label: "SpO₂", unit: "%", placeholder: "98", field: "spo2" },
                { label: "Blood Sugar", unit: "mg/dL", placeholder: "110", field: "bloodSugar" },
              ].map((vital, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-[10px] p-2.5 flex flex-col justify-center h-[72px]">
                  <span className="text-[11px] font-semibold text-slate-500 mb-0.5">{vital.label}</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      value={data.vitals[vital.field as keyof typeof data.vitals]}
                      onChange={(e) => updateVitals({ [vital.field]: e.target.value })}
                      placeholder={vital.placeholder}
                      className="bg-transparent border-none outline-none text-[15px] font-bold text-slate-800 w-full p-0 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-400 font-medium">{vital.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: DIAGNOSIS */}
          <div className="w-full min-h-[100px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-2 group transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-[#111827]">DIAGNOSIS</h3>
            <textarea 
              value={data.diagnosis}
              onChange={(e) => updateData({ diagnosis: e.target.value })}
              placeholder="Enter diagnosis..."
              className="w-full bg-transparent text-[#6B7280] text-[15px] leading-[1.6] placeholder:text-slate-300 resize-none outline-none focus:ring-0 flex-1"
            />
          </div>

          {/* Section 5: INVESTIGATIONS (RX) */}
          <div className="w-full p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-4 transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-[#111827]">INVESTIGATIONS (TESTS)</h3>
            
            {/* Added Tests List */}
            {data.investigationsList && data.investigationsList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.investigationsList.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-[#2F80ED]/20 text-[#2F80ED] text-[13px] font-bold rounded-lg shadow-sm">
                    <span className="opacity-50 mr-1 text-[11px]">{idx + 1}.</span> {test}
                    <button onClick={() => handleRemoveInvestigation(test)} className="ml-1 p-0.5 hover:bg-[#2F80ED]/20 rounded-full transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Test Input */}
            <div className="flex gap-2">
              <input 
                type="text"
                value={customTest}
                onChange={(e) => setCustomTest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInvestigation(customTest);
                  }
                }}
                placeholder="Type a custom test and press Enter..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-[8px] px-3 py-2 text-[14px] text-slate-700 outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED]/20 transition-all"
              />
              <button 
                onClick={() => handleAddInvestigation(customTest)}
                disabled={!customTest.trim()}
                className="px-4 bg-[#2F80ED] text-white font-bold text-[13px] rounded-[8px] hover:bg-[#256bbd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Quick Add Chips */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {["CBC", "Blood Sugar (F)", "Blood Sugar (R)", "Lipid Profile", "ECG", "Chest X-Ray", "Urine RME", "Serum Creatinine"].map((chip, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleAddInvestigation(chip)}
                  disabled={data.investigationsList?.includes(chip)}
                  className="h-[32px] px-3 bg-slate-50 border border-slate-200 rounded-[8px] text-[12px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center active:scale-95"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Rx Medicines */}
          <MedicineBuilder />

          {/* Section 7: ADVICE & DIET */}
          <div className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 group transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-[#111827]">ADVICE & DIET</h3>
            <textarea 
              value={data.advice}
              onChange={(e) => updateData({ advice: e.target.value })}
              placeholder="Type advice..."
              className="w-full bg-transparent text-[#6B7280] text-[15px] leading-[1.6] placeholder:text-slate-300 resize-none outline-none focus:ring-0 h-[60px]"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {["Drink Water", "Exercise", "Reduce Salt", "Avoid Smoking", "Diabetic Diet", "Low Fat Diet"].map((chip, idx) => (
                <button 
                  key={idx} 
                  onClick={() => appendToState("advice", chip)}
                  className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[13px] rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={12} className="text-slate-400" />
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Section 8: FOLLOW-UP */}
          <div className="w-full p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-[#111827]">FOLLOW-UP</h3>
            <textarea 
              value={data.followUp}
              onChange={(e) => updateData({ followUp: e.target.value })}
              placeholder="Next visit instructions..."
              className="w-full bg-transparent text-[#6B7280] text-[15px] leading-[1.6] placeholder:text-slate-300 resize-none outline-none focus:ring-0 h-[40px]"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {["3 Days", "7 Days", "14 Days", "1 Month", "3 Months"].map((chip, idx) => (
                <button 
                  key={idx} 
                  onClick={() => appendToState("followUp", chip)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[12px] font-medium text-slate-600 hover:bg-[#2F80ED] hover:text-white hover:border-[#2F80ED] transition-colors active:scale-95"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

        </div>
        )}
      </div>
    </div>
  );
}
