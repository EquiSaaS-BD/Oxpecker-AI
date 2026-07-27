"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export interface PrescriptionData {
  id?: string;
  patientId: string;
  patientName: string;
  chiefComplaint: string;
  physicalExam: string;
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    weight: string;
    height: string;
    bmi: string;
    spo2: string;
    bloodSugar: string;
  };
  diagnosis: string;
  investigations: string;
  investigationsList: string[];
  medicines: Array<{
    id: string | number;
    name: string;
    type: string;
    dosageM: string;
    dosageN: string;
    dosageE: string;
    frequency: string;
    duration: string;
    notes: string;
  }>;
  advice: string;
  followUp: string;
  theme: string;
  customThemeImage: string | null;
  watermarkImage: string | null;
}

const initialData: PrescriptionData = {
  patientId: "",
  patientName: "",
  chiefComplaint: "",
  physicalExam: "",
  vitals: {
    bp: "",
    pulse: "",
    temp: "",
    weight: "",
    height: "",
    bmi: "",
    spo2: "",
    bloodSugar: "",
  },
  diagnosis: "",
  investigations: "",
  investigationsList: [],
  medicines: [],
  advice: "",
  followUp: "",
  theme: "modern",
  customThemeImage: null,
  watermarkImage: null,
};

interface PrescriptionContextType {
  data: PrescriptionData;
  updateData: (updates: Partial<PrescriptionData>) => void;
  updateVitals: (vitals: Partial<PrescriptionData["vitals"]>) => void;
  addMedicine: (medicine: PrescriptionData["medicines"][0]) => void;
  removeMedicine: (id: string) => void;
  loadPrescription: (data: PrescriptionData) => void;
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined);

export function PrescriptionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PrescriptionData>(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        let rawId = params.get('patientId') || "";
        const pName = params.get('patientName') || "New Patient";
        
        // Hash to MRN if needed
        if (!rawId || rawId.includes('-')) {
          const firstLetter = pName.charAt(0).toUpperCase();
          let hash = 0;
          for (let i = 0; i < pName.length; i++) hash = pName.charCodeAt(i) + ((hash << 5) - hash);
          const num = Math.abs(hash).toString().padStart(6, '0');
          rawId = `${firstLetter} ${num.slice(0,2)} ${num.slice(2,4)} ${num.slice(4,6)}`;
        }

        const savedSession = localStorage.getItem(`shustota_prescription_${rawId}`);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          // If we have custom themes globally, merge them
          const savedImage = localStorage.getItem("shustota_custom_theme");
          const savedWatermark = localStorage.getItem("shustota_watermark");
          if (savedImage) parsed.customThemeImage = savedImage;
          if (savedWatermark) parsed.watermarkImage = savedWatermark;
          return parsed;
        }

        // Fallback to load custom theme if no session exists for this patient
        const savedImage = localStorage.getItem("shustota_custom_theme");
        const savedWatermark = localStorage.getItem("shustota_watermark");
        const loadedData = { ...initialData, patientId: rawId, patientName: pName };
        if (savedImage) loadedData.customThemeImage = savedImage;
        if (savedWatermark) loadedData.watermarkImage = savedWatermark;
        return loadedData;
      } catch (e) {
        console.error("Failed to load session from localStorage", e);
      }
    }
    return initialData;
  });

  // Ref to hold debounce timer for DB save
  const dbSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const searchParams = useSearchParams();
  const rawIdFromUrl = searchParams?.get('patientId') || "";
  const pNameFromUrl = searchParams?.get('patientName') || "New Patient";

  // Watch URL changes and load appropriate patient data
  useEffect(() => {
    let rawId = rawIdFromUrl;
    if (!rawId || rawId.includes('-')) {
      const firstLetter = pNameFromUrl.charAt(0).toUpperCase();
      let hash = 0;
      for (let i = 0; i < pNameFromUrl.length; i++) hash = pNameFromUrl.charCodeAt(i) + ((hash << 5) - hash);
      const num = Math.abs(hash).toString().padStart(6, '0');
      rawId = `${firstLetter} ${num.slice(0,2)} ${num.slice(2,4)} ${num.slice(4,6)}`;
    }

    if (rawId && rawId !== data.patientId) {
      // Load from local storage first to prevent UI flickering of old data
      const savedSession = localStorage.getItem(`shustota_prescription_${rawId}`);
      let newPatientData = { ...initialData, patientId: rawId, patientName: pNameFromUrl };
      
      if (savedSession) {
        newPatientData = JSON.parse(savedSession);
      }
      
      // Preserve global themes
      const savedImage = localStorage.getItem("shustota_custom_theme");
      const savedWatermark = localStorage.getItem("shustota_watermark");
      if (savedImage) newPatientData.customThemeImage = savedImage;
      if (savedWatermark) newPatientData.watermarkImage = savedWatermark;
      
      setData(newPatientData);
    }
  }, [rawIdFromUrl, pNameFromUrl]);

  // Fetch from DB when patient changes
  useEffect(() => {
    if (data.patientId) {
      fetch(`/api/prescriptions?mrn=${encodeURIComponent(data.patientId)}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            // DB has data, override local state
            setData(prev => {
              // Ensure we only override if the fetched data matches current patient ID
              if (prev.patientId !== json.data.patientId) return prev;
              
              const merged = { ...prev, ...json.data };
              if (!merged.customThemeImage) merged.customThemeImage = prev.customThemeImage;
              if (!merged.watermarkImage) merged.watermarkImage = prev.watermarkImage;
              return merged;
            });
          }
        })
        .catch(err => console.error("Failed to load from DB:", err));
    }
  }, [data.patientId]);

  const saveToSession = (updatedData: PrescriptionData) => {
    if (typeof window !== "undefined" && updatedData.patientId) {
      try {
        // Strip large base64 images before saving to avoid QuotaExceededError
        const dataToSave = { ...updatedData };
        delete dataToSave.customThemeImage;
        delete dataToSave.watermarkImage;

        localStorage.setItem(`shustota_prescription_${updatedData.patientId}`, JSON.stringify(dataToSave));
        // Still save globals
        if (updatedData.customThemeImage) localStorage.setItem("shustota_custom_theme", updatedData.customThemeImage);
        else localStorage.removeItem("shustota_custom_theme");
        
        if (updatedData.watermarkImage) localStorage.setItem("shustota_watermark", updatedData.watermarkImage);
        else localStorage.removeItem("shustota_watermark");

        // Debounced save to Database
        if (dbSaveTimerRef.current) clearTimeout(dbSaveTimerRef.current);
        dbSaveTimerRef.current = setTimeout(() => {
          fetch('/api/prescriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
          })
          .then(res => res.json())
          .then(resData => {
             if (resData.prescriptionId && resData.prescriptionId !== updatedData.id) {
               // Update ID if newly created
               setData(prev => ({ ...prev, id: resData.prescriptionId }));
             }
          })
          .catch(err => console.error("Failed to save to DB:", err));
        }, 1500); // 1.5s debounce

      } catch (e) {
        console.error("Failed to save to localStorage", e);
      }
    }
  };

  const updateData = (newData: Partial<PrescriptionData>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData };
      saveToSession(updated);
      return updated;
    });
  };

  const updateVitals = (vitalsUpdates: Partial<PrescriptionData["vitals"]>) => {
    setData((prev) => {
      const updated = { ...prev, vitals: { ...prev.vitals, ...vitalsUpdates } };
      saveToSession(updated);
      return updated;
    });
  };

  const addMedicine = (medicine: PrescriptionData["medicines"][0]) => {
    setData((prev) => {
      const updated = { ...prev, medicines: [...prev.medicines, medicine] };
      saveToSession(updated);
      return updated;
    });
  };

  const removeMedicine = (id: string) => {
    setData((prev) => {
      const updated = { ...prev, medicines: prev.medicines.filter((m) => m.id !== id) };
      saveToSession(updated);
      return updated;
    });
  };

  const loadPrescription = (newData: PrescriptionData) => {
    setData(newData);
    saveToSession(newData);
  };

  return (
    <PrescriptionContext.Provider
      value={{
        data,
        updateData,
        updateVitals,
        addMedicine,
        removeMedicine,
        loadPrescription,
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
}

export function usePrescription() {
  const context = useContext(PrescriptionContext);
  if (context === undefined) {
    throw new Error("usePrescription must be used within a PrescriptionProvider");
  }
  return context;
}
