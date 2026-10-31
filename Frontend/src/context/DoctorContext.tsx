"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

// Types
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  type: string;
  date: string;
  status: string;
  diagnosis: string;
  assistant: string | null;
  paymentStatus: string;
  avatar: string;
}

export interface Appointment {
  id: string;
  token: string;
  name: string;
  phone: string;
  date: string; // "Today", "Tomorrow", "Yesterday"
  time: string;
  type: string;
  status: string;
  bookedBy: string;
  assistant: string | null;
}

export interface QueuePatient {
  token: string;
  name: string;
  info: string;
}

interface DoctorContextType {
  patients: Patient[];
  appointments: Appointment[];
  queue: QueuePatient[];
  previousQueue: QueuePatient[];
  connectedAssistants: any[];
  activityLog: any[];
  patientPrescriptions: Record<string, any[]>;
  testReports: Record<string, any[]>;
  
  // Actions
  handleNextPatient: () => void;
  handleUndoPatient: () => void;
  cancelAppointment: (id: string) => void;
  addAssistant: (assistant: any) => void;
  removeAssistant: (id: string) => void;
  addPatientToHistory: (patient: Patient) => void;
  addPrescriptionToPatient: (patientId: string, prescriptionData: any) => void;
}

// Initial Mock Data
const initialPatients: Patient[] = [
  { id: "R 10 25 89", name: "Rahim Uddin", age: 51, gender: "Male", type: "Appointment", date: "2026-10-24T10:00:00", status: "In Progress", diagnosis: "Type-2 Diabetes Mellitus with Essential Hypertension", assistant: "Kamrul Hasan", paymentStatus: "Paid", avatar: "R" },
  { id: "K 10 23 45", name: "Kamal Hossain", age: 58, gender: "Male", type: "Appointment", date: "2026-10-24T09:30:00", status: "Completed", diagnosis: "Hypertension Stage 1 & Mild Exertional Dyspnea", assistant: "Kamrul Hasan", paymentStatus: "Paid", avatar: "K" },
  { id: "F 10 24 67", name: "Fatema Begum", age: 32, gender: "Female", type: "Walk-in", date: "2026-10-24T10:15:00", status: "Waiting", diagnosis: "Post-natal Review & Iron Deficiency Anemia", assistant: "Aisha Begum", paymentStatus: "Paid", avatar: "F" },
  { id: "N 10 26 12", name: "Nasima Akter", age: 34, gender: "Female", type: "Appointment", date: "2026-10-23T16:30:00", status: "Completed", diagnosis: "Post-Dengue Asthenia & Myalgia", assistant: "Kamrul Hasan", paymentStatus: "Paid", avatar: "N" },
  { id: "A 10 27 34", name: "Abdul Matin", age: 60, gender: "Male", type: "Appointment", date: "2026-10-22T09:00:00", status: "Completed", diagnosis: "Ischemic Heart Disease & Unstable Angina Follow-up", assistant: "System", paymentStatus: "Paid", avatar: "A" },
];

const initialTestReports: Record<string, any[]> = {
  "R 10 25 89": [
    { id: "TR-001", date: "2026-10-15", name: "Complete Blood Count (CBC)", status: "Reviewed", summary: "Hb: 14.2 g/dL, Platelets: 245K/µL, WBC: 7.4K/µL. Normal morphology." },
    { id: "TR-002", date: "2026-10-14", name: "12-Lead Diagnostic ECG", status: "Reviewed", summary: "Normal Sinus Rhythm. Heart rate 74 bpm. No acute ischemia or ST-T changes." },
    { id: "TR-003", date: "2026-10-14", name: "FBS & HbA1c Glycated Hemoglobin", status: "Reviewed", summary: "FBS: 6.1 mmol/L (110 mg/dL), HbA1c: 6.8%. Satisfactory glycemic control." },
    { id: "TR-004", date: "2026-09-20", name: "Digital Chest X-Ray (PA View)", status: "Reviewed", summary: "Clear lung fields, normal cardiothoracic ratio (<0.50), no pleural effusion." }
  ],
  "K 10 23 45": [
    { id: "TR-005", date: "2026-10-15", name: "Complete Blood Count (CBC)", status: "Reviewed", summary: "Normal values. Slight decrease in RBC." },
    { id: "TR-006", date: "2026-10-16", name: "Lipid Profile", status: "Reviewed", summary: "Total Cholesterol 210 mg/dL. Moderate hyperlipidemia." }
  ],
  "F 10 24 67": [
    { id: "TR-007", date: "2026-10-18", name: "Serum Ferritin & Iron Profile", status: "Reviewed", summary: "Low serum ferritin (14 ng/mL). Mild iron deficiency anemia." }
  ]
};

const initialPrescriptions: Record<string, any[]> = {
  "R 10 25 89": [
    {
      id: "RX-1004",
      date: "24 Oct, 2026",
      diagnosis: "Type-2 Diabetes Mellitus with Essential Hypertension",
      chiefComplaint: "Mild chest tightness on brisk walking, routine quarterly diabetic surveillance.",
      physicalExam: "BP: 128/82 mmHg, Pulse: 74 bpm, Heart: S1+S2 audible, no murmurs. Lungs: Clear.",
      vitals: { bp: "128/82", pulse: "74", temp: "98.4", weight: "68.5", bmi: "24.1", spo2: "99", bloodSugar: "110" },
      medicines: [
        { id: 1, name: "Tab. Metformin HCl", type: "Tablet", dosageM: "1", dosageN: "0", dosageE: "1", frequency: "1 + 0 + 1", duration: "90 Days", notes: "Take immediately after meals" },
        { id: 2, name: "Tab. Amlodipine Besylate 5mg", type: "Tablet", dosageM: "1", dosageN: "0", dosageE: "0", frequency: "1 + 0 + 0", duration: "90 Days", notes: "Take in the morning with water" },
        { id: 3, name: "Cap. Cholecalciferol 2000 IU", type: "Capsule", dosageM: "0", dosageN: "1", dosageE: "0", frequency: "0 + 1 + 0", duration: "60 Days", notes: "Take after lunch" }
      ],
      investigationsList: [
        "Fasting Blood Glucose (Target 5.5 - 6.5 mmol/L)",
        "HbA1c Glycated Hemoglobin after 3 months",
        "Serum Creatinine & eGFR"
      ],
      advice: "Low sodium DASH diet (< 2g/day). 30 mins moderate brisk walking 5 days a week. Avoid processed sugar.",
      followUp: "After 3 months with repeat HbA1c & Creatinine report"
    }
  ]
};

const initialAppointments: Appointment[] = [
  { id: "A-101", token: "S-01", name: "Rahim Uddin", phone: "01711-000000", date: "Today", time: "10:00 AM", type: "First Visit", status: "Completed", bookedBy: "Online", assistant: null },
  { id: "A-102", token: "S-02", name: "Fatema Begum", phone: "01811-000000", date: "Today", time: "10:15 AM", type: "Follow Up", status: "Waiting", bookedBy: "Assistant", assistant: "Kamrul Hasan" },
  { id: "A-103", token: "S-03", name: "Karim Ali", phone: "01911-000000", date: "Today", time: "10:30 AM", type: "Report Showing", status: "Upcoming", bookedBy: "Assistant", assistant: "Kamrul Hasan" },
  { id: "A-104", token: "T-01", name: "Nasima Akter", phone: "01722-000000", date: "Tomorrow", time: "05:00 PM", type: "First Visit", status: "Upcoming", bookedBy: "Online", assistant: null },
  { id: "A-105", token: "T-02", name: "Jashim Uddin", phone: "01611-000000", date: "Tomorrow", time: "05:15 PM", type: "Follow Up", status: "Upcoming", bookedBy: "Assistant", assistant: "Aisha Begum" },
  { id: "A-106", token: "Y-01", name: "Rubina Yasmin", phone: "01511-000000", date: "Yesterday", time: "11:00 AM", type: "First Visit", status: "Completed", bookedBy: "Online", assistant: null },
];

const initialQueue: QueuePatient[] = [
  { token: "S-01", name: "Rahim Uddin", info: "First Visit • Fever, Cough" },
  { token: "S-02", name: "Fatema Begum", info: "Follow Up • Headache" },
  { token: "S-03", name: "Karim Ali", info: "Report Showing" },
  { token: "S-04", name: "Nasima Akter", info: "First Visit" }
];

const initialActivityLog = [
  { time: "09:15", name: "Kamrul Hasan", action: "Checked In", token: "S-021", status: "Completed", color: "text-[#22C55E]" },
  { time: "09:18", name: "Kamrul Hasan", action: "Called Next Patient", token: "S-022", status: "Completed", color: "text-[#22C55E]" },
  { time: "09:20", name: "Kamrul Hasan", action: "Rescheduled Appointment", token: "S-025", status: "Completed", color: "text-[#2F80ED]" },
  { time: "09:25", name: "Aisha Begum", action: "Emergency Case Inserted", token: "E-01", status: "Alert", color: "text-[#EF4444]" },
];

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [queue, setQueue] = useState<QueuePatient[]>(initialQueue);
  const [previousQueue, setPreviousQueue] = useState<QueuePatient[]>([]);
  
  const [connectedAssistants, setConnectedAssistants] = useState<any[]>([]);
  
  // Load assistants from local storage
  useEffect(() => {
    const loadAssistants = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('oxpecker_assistants');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Remove duplicates if any got stuck
            const uniqueAssistants = Array.from(new Map(parsed.map((a: any) => [a.id, a])).values());
            setConnectedAssistants(uniqueAssistants);
          } catch (e) {}
        }
      }
    };
    
    loadAssistants();
    window.addEventListener('storage', loadAssistants);
    const interval = setInterval(loadAssistants, 1500);
    
    return () => {
      window.removeEventListener('storage', loadAssistants);
      clearInterval(interval);
    };
  }, []);

  const persistAssistants = (newAssistants: any[]) => {
    setConnectedAssistants(newAssistants);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxpecker_assistants', JSON.stringify(newAssistants));
    }
  };  
  const [activityLog, setActivityLog] = useState(initialActivityLog);
  const [testReports, setTestReports] = useState<Record<string, any[]>>(initialTestReports);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Record<string, any[]>>(initialPrescriptions);

  const handleNextPatient = () => {
    if (queue.length === 0) {
      toast.error("No more patients in the queue.");
      return;
    }
    const completedPatient = queue[0];
    setPreviousQueue([completedPatient, ...previousQueue]);
    setQueue((prev) => prev.slice(1));
    toast.success("Next patient called successfully!", { style: { background: '#22C55E', color: 'white' }});
  };

  const handleUndoPatient = () => {
    if (previousQueue.length === 0) {
      toast.error("No previous patient to return to.");
      return;
    }
    const lastPatient = previousQueue[0];
    setPreviousQueue((prev) => prev.slice(1));
    setQueue([lastPatient, ...queue]);
    toast.success("Reverted to previous patient.");
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) => prev.map(a => a.id === id ? { ...a, status: "Cancelled", date: "Yesterday" } : a));
    toast.error("Appointment Cancelled");
  };

  const addAssistant = (assistant: any) => {
    if (!connectedAssistants.some(a => a.id === assistant.id)) {
      persistAssistants([assistant, ...connectedAssistants]);
    }
  };

  const removeAssistant = (id: string) => {
    persistAssistants(connectedAssistants.filter(a => a.id !== id));
  };

  const addPatientToHistory = (patient: Patient) => {
    setPatients((prev) => [patient, ...prev]);
  };

  const addPrescriptionToPatient = (patientId: string, prescriptionData: any) => {
    setPatientPrescriptions((prev) => ({
      ...prev,
      [patientId]: [prescriptionData, ...(prev[patientId] || [])]
    }));
  };

  return (
    <DoctorContext.Provider value={{
      patients,
      appointments,
      queue,
      previousQueue,
      connectedAssistants,
      activityLog,
      patientPrescriptions,
      testReports,
      handleNextPatient,
      handleUndoPatient,
      cancelAppointment,
      addAssistant,
      removeAssistant,
      addPatientToHistory,
      addPrescriptionToPatient
    }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctor must be used within a DoctorProvider");
  }
  return context;
}
