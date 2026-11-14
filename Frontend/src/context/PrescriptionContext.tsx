"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { PrescriptionLanguage } from "@/lib/prescription-translator";

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
  language?: PrescriptionLanguage;
  customThemeImage: string | null;
  watermarkImage: string | null;
  customPadTopOffset?: number;
  customPadBottomOffset?: number;
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
  theme: "corporate",
  language: "en",
  customThemeImage: null,
  watermarkImage: null,
  customPadTopOffset: 140,
  customPadBottomOffset: 70,
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
        let rawId = params.get("patientId") || "";
        const pName = params.get("patientName") || "New Patient";

        if (!rawId || rawId.includes("-")) {
          const firstLetter = pName.charAt(0).toUpperCase();
          let hash = 0;
          for (let i = 0; i < pName.length; i++) hash = pName.charCodeAt(i) + ((hash << 5) - hash);
          const num = Math.abs(hash).toString().padStart(6, "0");
          rawId = `${firstLetter} ${num.slice(0, 2)} ${num.slice(2, 4)} ${num.slice(4, 6)}`;
        }

        const savedSession = localStorage.getItem(`oxpecker_prescription_${rawId}`);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          const savedImage = localStorage.getItem("oxpecker_custom_theme");
          const savedWatermark = localStorage.getItem("oxpecker_watermark");
          if (savedImage) parsed.customThemeImage = savedImage;
          if (savedWatermark) parsed.watermarkImage = savedWatermark;
          if (!parsed.language) parsed.language = "en";
          if (!parsed.theme || parsed.theme === "modern") parsed.theme = parsed.theme || "corporate";
          return parsed;
        }

        const savedImage = localStorage.getItem("oxpecker_custom_theme");
        const savedWatermark = localStorage.getItem("oxpecker_watermark");
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

  const dbSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const rawIdFromUrl = searchParams?.get("patientId") || "";
  const pNameFromUrl = searchParams?.get("patientName") || "New Patient";

  useEffect(() => {
    let rawId = rawIdFromUrl;
    if (!rawId || rawId.includes("-")) {
      const firstLetter = pNameFromUrl.charAt(0).toUpperCase();
      let hash = 0;
      for (let i = 0; i < pNameFromUrl.length; i++) hash = pNameFromUrl.charCodeAt(i) + ((hash << 5) - hash);
      const num = Math.abs(hash).toString().padStart(6, "0");
      rawId = `${firstLetter} ${num.slice(0, 2)} ${num.slice(2, 4)} ${num.slice(4, 6)}`;
    }

    if (rawId && rawId !== data.patientId) {
      const savedSession = localStorage.getItem(`oxpecker_prescription_${rawId}`);
      let newPatientData = { ...initialData, patientId: rawId, patientName: pNameFromUrl };

      if (savedSession) {
        newPatientData = { ...newPatientData, ...JSON.parse(savedSession) };
      }

      const savedImage = localStorage.getItem("oxpecker_custom_theme");
      const savedWatermark = localStorage.getItem("oxpecker_watermark");
      if (savedImage) newPatientData.customThemeImage = savedImage;
      if (savedWatermark) newPatientData.watermarkImage = savedWatermark;

      setData(newPatientData);
    }
  }, [rawIdFromUrl, pNameFromUrl, data.patientId]);

  useEffect(() => {
    if (data.patientId) {
      fetch(`/api/prescriptions?mrn=${encodeURIComponent(data.patientId)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) {
            setData((prev) => {
              if (prev.patientId !== json.data.patientId) return prev;

              const merged = { ...prev, ...json.data };
              if (!merged.customThemeImage) merged.customThemeImage = prev.customThemeImage;
              if (!merged.watermarkImage) merged.watermarkImage = prev.watermarkImage;
              return merged;
            });
          }
        })
        .catch((err) => console.error("Failed to load from DB:", err));
    }
  }, [data.patientId]);

  const saveToSession = (updatedData: PrescriptionData) => {
    if (typeof window !== "undefined" && updatedData.patientId) {
      try {
        const dataToSave = { ...updatedData };
        delete (dataToSave as any).customThemeImage;
        delete (dataToSave as any).watermarkImage;

        localStorage.setItem(`oxpecker_prescription_${updatedData.patientId}`, JSON.stringify(dataToSave));
        if (updatedData.customThemeImage) localStorage.setItem("oxpecker_custom_theme", updatedData.customThemeImage);
        else localStorage.removeItem("oxpecker_custom_theme");

        if (updatedData.watermarkImage) localStorage.setItem("oxpecker_watermark", updatedData.watermarkImage);
        else localStorage.removeItem("oxpecker_watermark");

        if (dbSaveTimerRef.current) clearTimeout(dbSaveTimerRef.current);
        dbSaveTimerRef.current = setTimeout(() => {
          fetch("/api/prescriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSave),
          })
            .then((res) => res.json())
            .then((resData) => {
              if (resData.prescriptionId && resData.prescriptionId !== updatedData.id) {
                setData((prev) => ({ ...prev, id: resData.prescriptionId }));
              }
            })
            .catch((err) => console.error("Failed to save to DB:", err));
        }, 1500);
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
