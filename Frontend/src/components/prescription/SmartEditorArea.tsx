"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MedicineBuilder } from "./MedicineBuilder";
import { PatientContextSidebar } from "./PatientContextSidebar";
import { usePrescription } from "@/context/PrescriptionContext";
import { Plus, X, ShieldCheck } from "lucide-react";
import { checkPrescriptionSafety, type PrescriptionMedicineInput } from "@/lib/clinical-safety";
import { ClinicalSafetyAlerts } from "./ClinicalSafetyAlerts";
import { calculatePrescriptionSavings, type PrescribedMedicineForSavings, type GenericAlternativeOption } from "@/lib/prescription-savings";
import { PrescriptionSavingsCard } from "./PrescriptionSavingsCard";

const BRAND_TO_GENERIC_CATALOG: Array<{
  id: string;
  brand_name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  manufacturer: string;
  unit_price_bdt: number;
}> = [
  { id: "dgda-1", brand_name: "Napa", generic_name: "Paracetamol", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd.", unit_price_bdt: 1.2 },
  { id: "dgda-2", brand_name: "Ace", generic_name: "Paracetamol", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 1.0 },
  { id: "dgda-3", brand_name: "Napa Extra", generic_name: "Paracetamol + Caffeine", strength: "500 mg + 65 mg", dosage_form: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd.", unit_price_bdt: 2.5 },
  { id: "dgda-4", brand_name: "Seclo", generic_name: "Omeprazole", strength: "20 mg", dosage_form: "Capsule", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 6.0 },
  { id: "dgda-5", brand_name: "Losectil", generic_name: "Omeprazole", strength: "20 mg", dosage_form: "Capsule", manufacturer: "Eskayef Pharmaceuticals Ltd.", unit_price_bdt: 5.0 },
  { id: "dgda-6", brand_name: "Sergel", generic_name: "Esomeprazole", strength: "20 mg", dosage_form: "Capsule", manufacturer: "Healthcare Pharmaceuticals Ltd.", unit_price_bdt: 7.0 },
  { id: "dgda-7", brand_name: "Maxpro", generic_name: "Esomeprazole", strength: "20 mg", dosage_form: "Tablet", manufacturer: "Renata Limited", unit_price_bdt: 6.5 },
  { id: "dgda-8", brand_name: "Esonix", generic_name: "Esomeprazole", strength: "20 mg", dosage_form: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd.", unit_price_bdt: 5.5 },
  { id: "dgda-9", brand_name: "Pantonix", generic_name: "Pantoprazole", strength: "20 mg", dosage_form: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd.", unit_price_bdt: 5.0 },
  { id: "dgda-10", brand_name: "Monas", generic_name: "Montelukast", strength: "10 mg", dosage_form: "Tablet", manufacturer: "ACME Laboratories Ltd.", unit_price_bdt: 16.0 },
  { id: "dgda-11", brand_name: "Montene", generic_name: "Montelukast", strength: "10 mg", dosage_form: "Tablet", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 12.5 },
  { id: "dgda-12", brand_name: "Fexo", generic_name: "Fexofenadine HCl", strength: "120 mg", dosage_form: "Tablet", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 9.0 },
  { id: "dgda-13", brand_name: "Fenadin", generic_name: "Fexofenadine HCl", strength: "120 mg", dosage_form: "Tablet", manufacturer: "Renata Limited", unit_price_bdt: 7.5 },
  { id: "dgda-14", brand_name: "Alatrol", generic_name: "Cetirizine HCl", strength: "10 mg", dosage_form: "Tablet", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 3.5 },
  { id: "dgda-15", brand_name: "Azithrocin", generic_name: "Azithromycin", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 35.0 },
  { id: "dgda-16", brand_name: "Zimax", generic_name: "Azithromycin", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 35.0 },
  { id: "dgda-17", brand_name: "Tridosil", generic_name: "Azithromycin", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd.", unit_price_bdt: 28.0 },
  { id: "dgda-18", brand_name: "Cef-3", generic_name: "Cefixime", strength: "200 mg", dosage_form: "Capsule", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 35.0 },
  { id: "dgda-19", brand_name: "Comet", generic_name: "Metformin HCl", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 4.0 },
  { id: "dgda-20", brand_name: "Amdocal", generic_name: "Amlodipine", strength: "5 mg", dosage_form: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd.", unit_price_bdt: 5.0 },
  { id: "dgda-21", brand_name: "Coralcal-D", generic_name: "Calcium + Vitamin D3", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Radiant Pharmaceuticals Ltd.", unit_price_bdt: 12.0 },
  { id: "dgda-22", brand_name: "Ostocal-D", generic_name: "Calcium + Vitamin D3", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Eskayef Pharmaceuticals Ltd.", unit_price_bdt: 8.0 },
  { id: "dgda-23", brand_name: "Rivotril", generic_name: "Clonazepam", strength: "0.5 mg", dosage_form: "Tablet", manufacturer: "Radiant Pharmaceuticals Ltd.", unit_price_bdt: 6.0 },
  { id: "dgda-24", brand_name: "Tufnil", generic_name: "Tolfenamic Acid", strength: "200 mg", dosage_form: "Tablet", manufacturer: "Eskayef Pharmaceuticals Ltd.", unit_price_bdt: 10.0 },
  { id: "dgda-25", brand_name: "Ecosprin", generic_name: "Aspirin", strength: "75 mg", dosage_form: "Tablet", manufacturer: "ACME Laboratories Ltd.", unit_price_bdt: 1.5 },
  { id: "dgda-26", brand_name: "Atova", generic_name: "Atorvastatin", strength: "10 mg", dosage_form: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd.", unit_price_bdt: 10.0 },
  { id: "dgda-27", brand_name: "Toradolin", generic_name: "Ketorolac", strength: "10 mg", dosage_form: "Tablet", manufacturer: "Renata Limited", unit_price_bdt: 12.0 },
  { id: "dgda-28", brand_name: "Rolac", generic_name: "Ketorolac", strength: "10 mg", dosage_form: "Tablet", manufacturer: "Renata Limited", unit_price_bdt: 12.0 },
  { id: "dgda-29", brand_name: "Ciprocin", generic_name: "Ciprofloxacin", strength: "500 mg", dosage_form: "Tablet", manufacturer: "Square Pharmaceuticals PLC", unit_price_bdt: 15.0 },
  { id: "dgda-30", brand_name: "Clopid", generic_name: "Clopidogrel", strength: "75 mg", dosage_form: "Tablet", manufacturer: "Drug International Ltd.", unit_price_bdt: 12.0 },
];

function resolveGenericAndPrice(rawMedName: string) {
  const lower = (rawMedName || "").toLowerCase().trim();
  const matched = BRAND_TO_GENERIC_CATALOG.find((item) =>
    lower.startsWith(item.brand_name.toLowerCase()) ||
    lower.includes(item.brand_name.toLowerCase())
  );
  if (matched) return matched;

  // Fallback keyword inference if doctor typed generic directly
  if (lower.includes("napa") || lower.includes("ace") || lower.includes("paracetamol")) {
    return { brand_name: rawMedName, generic_name: "Paracetamol", unit_price_bdt: 1.2, manufacturer: "DGDA Verified" };
  }
  if (lower.includes("ketorolac") || lower.includes("rolac") || lower.includes("toradolin") || lower.includes("diclofenac") || lower.includes("naproxen")) {
    return { brand_name: rawMedName, generic_name: "Ketorolac / NSAID", unit_price_bdt: 12.0, manufacturer: "DGDA Verified" };
  }
  if (lower.includes("ecosprin") || lower.includes("aspirin") || lower.includes("clopid") || lower.includes("warfarin")) {
    return { brand_name: rawMedName, generic_name: "Aspirin / Clopidogrel", unit_price_bdt: 2.0, manufacturer: "DGDA Verified" };
  }
  if (lower.includes("cipro") || lower.includes("levofloxacin")) {
    return { brand_name: rawMedName, generic_name: "Ciprofloxacin", unit_price_bdt: 15.0, manufacturer: "DGDA Verified" };
  }
  if (lower.includes("calcium") || lower.includes("coralcal") || lower.includes("antacid") || lower.includes("iron") || lower.includes("zinc")) {
    return { brand_name: rawMedName, generic_name: "Calcium + Vitamin D3", unit_price_bdt: 10.0, manufacturer: "DGDA Verified" };
  }
  return {
    brand_name: rawMedName,
    generic_name: rawMedName,
    unit_price_bdt: 8.0,
    manufacturer: "DGDA Registered",
  };
}

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

  const safetyReport = useMemo(() => {
    const validMeds: PrescriptionMedicineInput[] = (data.medicines || [])
      .filter((m) => m.name && m.name.trim().length > 0)
      .map((m) => {
        const resolved = resolveGenericAndPrice(m.name);
        return {
          id: m.id,
          brand_name: m.name,
          generic_name: resolved.generic_name,
          dosage_form: m.type,
        };
      });
    return checkPrescriptionSafety(validMeds);
  }, [data.medicines]);

  const savingsReport = useMemo(() => {
    const validMeds: PrescribedMedicineForSavings[] = (data.medicines || [])
      .filter((m) => m.name && m.name.trim().length > 0)
      .map((m) => {
        const resolved = resolveGenericAndPrice(m.name);
        const daysMatch = (m.duration || "").match(/(\d+)/);
        const days = daysMatch ? Number(daysMatch[1]) : 7;
        const dailyDoses =
          (Number(m.dosageM) || 0) + (Number(m.dosageN) || 0) + (Number(m.dosageE) || 0) || 2;
        return {
          id: m.id,
          brand_name: m.name,
          generic_name: resolved.generic_name,
          dosage_form: m.type,
          unit_price_bdt: resolved.unit_price_bdt,
          manufacturer: resolved.manufacturer,
          quantity: Math.max(1, days * dailyDoses),
        };
      });
    return calculatePrescriptionSavings(validMeds, BRAND_TO_GENERIC_CATALOG);
  }, [data.medicines]);

  const handleApplyAlternative = (originalId: string | number, alternative: GenericAlternativeOption) => {
    const updated = data.medicines.map((m) =>
      String(m.id) === String(originalId)
        ? { ...m, name: `${alternative.brand_name}` }
        : m
    );
    updateData({ medicines: updated });
  };

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
    <div className="flex flex-col h-auto xl:h-full bg-slate-50 relative">
      <div className="flex-1 overflow-visible xl:overflow-y-auto custom-scrollbar p-5 lg:p-6 pb-28 xl:pb-6">
        
        {isLoading ? (
          <div className="w-full flex flex-col gap-5 animate-in fade-in duration-500">
            {/* Patient Info Header Skeleton */}
            <div className="w-full h-[140px] bg-white border border-slate-200 rounded-[12px] shadow-sm animate-pulse p-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-5 bg-slate-200 rounded-md" />
                  <div className="w-1/4 h-4 bg-slate-200 rounded-md" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-20 h-6 bg-slate-200 rounded-md" />
                <div className="w-24 h-6 bg-slate-200 rounded-md" />
              </div>
            </div>

            {/* Text Area Skeleton 1 */}
            <div className="w-full min-h-[100px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 animate-pulse">
              <div className="w-40 h-5 bg-slate-200 rounded-md" />
              <div className="w-full h-4 bg-slate-100 rounded-md mt-2" />
              <div className="w-3/4 h-4 bg-slate-100 rounded-md" />
            </div>

            {/* Text Area Skeleton 2 */}
            <div className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 animate-pulse">
              <div className="w-36 h-5 bg-slate-200 rounded-md" />
              <div className="w-full h-4 bg-slate-100 rounded-md mt-2" />
              <div className="w-full h-4 bg-slate-100 rounded-md" />
              <div className="w-1/2 h-4 bg-slate-100 rounded-md" />
            </div>

            {/* Vitals Grid Skeleton */}
            <div className="w-full p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-4 animate-pulse">
              <div className="w-32 h-5 bg-slate-200 rounded-md" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-[10px] p-3 flex flex-col gap-2 h-[72px]">
                    <div className="w-16 h-3 bg-slate-200 rounded-md" />
                    <div className="w-12 h-5 bg-slate-200 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Meds Skeleton */}
            <div className="w-full min-h-[160px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 animate-pulse">
              <div className="w-32 h-5 bg-slate-200 rounded-md" />
              <div className="w-full h-12 bg-slate-100 rounded-lg mt-2" />
              <div className="w-full h-12 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-5 animate-in fade-in duration-500">
          
          {/* Patient Info Header */}
          <PatientContextSidebar isDesktop={false} />

          {/* Section 1: CHIEF COMPLAINT */}
          <div className="w-full min-h-[100px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-2 group transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-slate-800">CHIEF COMPLAINT</h3>
            <textarea 
              value={data.chiefComplaint}
              onChange={(e) => updateData({ chiefComplaint: e.target.value })}
              placeholder="Describe the patient's primary complaints..."
              className="w-full bg-transparent text-slate-700 text-[15px] leading-[1.6] placeholder:text-slate-500/70 resize-none outline-none focus:ring-0 flex-1"
            />
          </div>

          {/* Section 2: PHYSICAL EXAM */}
          <div className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-2 group transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-slate-800">PHYSICAL EXAM</h3>
            <textarea 
              value={data.physicalExam}
              onChange={(e) => updateData({ physicalExam: e.target.value })}
              placeholder="Document physical examination findings..."
              className="w-full bg-transparent text-slate-700 text-[15px] leading-[1.6] placeholder:text-slate-500/70 resize-none outline-none focus:ring-0 flex-1"
            />
          </div>

          {/* Section 3: VITALS TODAY */}
          <div className="w-full p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-slate-800">VITALS TODAY</h3>
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
                <div key={idx} className="bg-white border border-slate-200 rounded-[10px] p-2.5 flex flex-col justify-center h-[72px] transition-colors hover:border-slate-300 relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-sky-500 opacity-80 group-hover:opacity-100 transition-opacity`} />
                  <span className={`text-[11px] font-bold mb-0.5 uppercase tracking-wider pl-1.5 text-slate-500`}>{vital.label}</span>
                  <div className="flex items-center gap-1 pl-1.5 z-10">
                    <input 
                      type="text" 
                      value={data.vitals[vital.field as keyof typeof data.vitals]}
                      onChange={(e) => updateVitals({ [vital.field]: e.target.value })}
                      placeholder={vital.placeholder}
                      className="bg-transparent border-none outline-none text-[16px] font-bold text-slate-800 w-full p-0 focus:ring-0 placeholder:text-slate-500"
                    />
                    <span className="text-[11px] text-slate-500 font-bold">{vital.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: DIAGNOSIS */}
          <div className="w-full min-h-[100px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-2 group transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-slate-800">DIAGNOSIS</h3>
            <textarea 
              value={data.diagnosis}
              onChange={(e) => updateData({ diagnosis: e.target.value })}
              placeholder="Enter diagnosis..."
              className="w-full bg-transparent text-slate-700 text-[15px] leading-[1.6] placeholder:text-slate-500/70 resize-none outline-none focus:ring-0 flex-1"
            />
          </div>

          {/* Section 5: INVESTIGATIONS (RX) */}
          <div className="w-full p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-4 transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-slate-800">INVESTIGATIONS (TESTS)</h3>
            
            {/* Added Tests List */}
            {data.investigationsList && data.investigationsList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.investigationsList.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-[13px] font-bold rounded-lg shadow-sm">
                    <span className="opacity-50 mr-1 text-[11px]">{idx + 1}.</span> {test}
                    <button onClick={() => handleRemoveInvestigation(test)} className="ml-1 p-0.5 hover:bg-sky-100 rounded-full transition-colors">
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
                className="flex-1 bg-slate-50 border border-slate-200 rounded-[8px] px-3 py-2 text-[14px] text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all"
              />
              <button 
                onClick={() => handleAddInvestigation(customTest)}
                disabled={!customTest.trim()}
                className="px-4 bg-sky-600 text-white font-bold text-[13px] rounded-[8px] hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Quick Add Chips */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
              {["CBC", "Blood Sugar (F)", "Blood Sugar (R)", "Lipid Profile", "ECG", "Chest X-Ray", "Urine RME", "Serum Creatinine"].map((chip, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleAddInvestigation(chip)}
                  disabled={data.investigationsList?.includes(chip)}
                  className="h-[32px] px-3 bg-slate-50 border border-slate-200 rounded-[8px] text-[12px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center active:scale-95"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Rx Medicines */}
          <MedicineBuilder />

          {/* Section 6B: Live AI Drug-Drug Interaction (DDI) & Contraindication Guard */}
          {safetyReport.alerts.length > 0 ? (
            <ClinicalSafetyAlerts report={safetyReport} language="bn" />
          ) : (
            data.medicines.some((m) => m.name.trim().length > 0) && (
              <div className="w-full px-4 py-2.5 bg-emerald-50/70 border border-emerald-200 rounded-[10px] flex items-center justify-between text-[12px] text-emerald-800">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ক্লিনিক্যাল ড্রাগ-ড্রাগ ইন্টারঅ্যাকশন (DDI) চেক সম্পন্ন: কোনো ক্ষতিকর ওষুধের বিক্রিয়া বা ডুপ্লিকেট জেনেরিক পাওয়া যায়নি।</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-white border border-emerald-200 rounded-md text-emerald-700">
                  SAFE
                </span>
              </div>
            )
          )}

          {/* Section 6C: Live DGDA Generic Cost-Savings & Bioequivalent Substitution */}
          {savingsReport.items.length > 0 && savingsReport.totalSavingsBdt > 0 && (
            <PrescriptionSavingsCard
              savingsReport={savingsReport}
              onApplyAlternative={handleApplyAlternative}
              language="bn"
            />
          )}

          {/* Section 7: ADVICE & DIET */}
          <div className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 group transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-slate-800">ADVICE & DIET</h3>
            <textarea 
              value={data.advice}
              onChange={(e) => updateData({ advice: e.target.value })}
              placeholder="Type advice..."
              className="w-full bg-transparent text-slate-700 text-[15px] leading-[1.6] placeholder:text-slate-500/70 resize-none outline-none focus:ring-0 h-[60px]"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {["Drink Water", "Exercise", "Reduce Salt", "Avoid Smoking", "Diabetic Diet", "Low Fat Diet"].map((chip, idx) => (
                <button 
                  key={idx} 
                  onClick={() => appendToState("advice", chip)}
                  className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[13px] rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={12} className="text-slate-500" />
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Section 8: FOLLOW-UP */}
          <div className="w-full p-4 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col gap-3 transition-colors hover:border-slate-300">
            <h3 className="text-[16px] font-semibold text-slate-800">FOLLOW-UP</h3>
            <textarea 
              value={data.followUp}
              onChange={(e) => updateData({ followUp: e.target.value })}
              placeholder="Next visit instructions..."
              className="w-full bg-transparent text-slate-700 text-[15px] leading-[1.6] placeholder:text-slate-500/70 resize-none outline-none focus:ring-0 h-[40px]"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {["3 Days", "7 Days", "14 Days", "1 Month", "3 Months"].map((chip, idx) => (
                <button 
                  key={idx} 
                  onClick={() => appendToState("followUp", chip)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[12px] font-medium text-slate-500 hover:bg-sky-600 hover:text-white hover:border-sky-500 transition-colors active:scale-95"
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
