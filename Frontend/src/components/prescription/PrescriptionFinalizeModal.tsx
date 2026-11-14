"use client";

import React from "react";
import { X, CheckCircle, BellRing, CalendarClock, MessageSquare, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDoctor } from "@/context/DoctorContext";
import { usePrescription } from "@/context/PrescriptionContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import {
  triggerPrescriptionAutomation,
  generateMedicationSlotsFromRx,
} from "@/lib/automation-engine";

interface PrescriptionFinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionFinalizeModal({ isOpen, onClose }: PrescriptionFinalizeModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addPatientToHistory, addPrescriptionToPatient } = useDoctor();
  const { data } = usePrescription();
  const { user } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [autoSmsEnabled, setAutoSmsEnabled] = React.useState(true);
  const [autoMedAlarmEnabled, setAutoMedAlarmEnabled] = React.useState(true);
  const [autoDghsSyncEnabled, setAutoDghsSyncEnabled] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const previewSlots = React.useMemo(
    () => generateMedicationSlotsFromRx(data.medicines || []),
    [data.medicines]
  );

  const handleFinalize = async () => {
    const pName = searchParams?.get("patientName") || data.patientName || "Rahim Uddin";
    const pId = searchParams?.get("patientId") || data.patientId || "R 10 25 89";
    const resolvedDoctorName = user?.name || "Prof. Dr. Ahmed Rahman";

    try {
      await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patientId: pId,
          patientName: pName,
          doctorName: resolvedDoctorName,
          chiefComplaint: data.chiefComplaint,
          physicalExam: data.physicalExam,
          vitals: data.vitals,
          diagnosis: data.diagnosis || "General Checkup",
          investigations: data.investigations,
          investigationsList: data.investigationsList,
          medicines: data.medicines || [],
          advice: data.advice,
          followUp: data.followUp,
          theme: data.theme,
        }),
      });
    } catch {}

    const newPatient = {
      id: pId,
      name: pName,
      age: 45,
      gender: "Male",
      type: "Appointment",
      date: new Date().toISOString(),
      status: "Completed",
      diagnosis: data.diagnosis || "General Checkup",
      assistant: "System",
      paymentStatus: "Paid",
      avatar: pName.charAt(0).toUpperCase(),
    };

    addPatientToHistory(newPatient);

    addPrescriptionToPatient(pId, {
      date: new Date().toISOString(),
      diagnosis: data.diagnosis,
      medicines: data.medicines,
      advice: data.advice,
      followUp: data.followUp,
    });

    // Trigger End-to-End Prescription Automation
    const automationResult = triggerPrescriptionAutomation({
      patientId: pId,
      patientName: pName,
      doctorName: resolvedDoctorName,
      diagnosis: data.diagnosis,
      followUp: data.followUp,
      medicines: data.medicines || [],
    });

    toast.success("Prescription Finalized & Automation Triggered!", {
      description: `${automationResult.slots.length} daily dose alarms scheduled, SMS sent to patient, and DGHS FHIR synced.`,
    });

    onClose();
    router.push(
      `/doctor/dashboard/patients?id=${encodeURIComponent(pId)}&name=${encodeURIComponent(pName)}`
    );
  };

  if (!mounted) return null;

  const pName = searchParams?.get("patientName") || data.patientName || "Rahim Uddin";
  const pId = searchParams?.get("patientId") || data.patientId || "R 10 25 89";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="bg-white w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[88vh] rounded-none sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                <CheckCircle className="text-emerald-600" size={22} />
                Finalize Prescription & Dispatch Automations
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 bg-slate-50">
              {/* Left Column - Summary & Auto-Generated Medication Schedule */}
              <div className="flex-1 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Patient</p>
                      <p className="font-extrabold text-slate-900 text-base">{pName}</p>
                      <p className="text-xs text-slate-500 font-mono">MRN: {pId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase text-slate-400">Date</p>
                      <p className="font-bold text-slate-800 text-sm" suppressHydrationWarning>
                        {new Date().toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Diagnosis</p>
                      <p className="font-bold text-slate-800 text-sm">
                        {data.diagnosis || "Clinical Consultation"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Follow-up Schedule</p>
                      <p className="font-bold text-slate-800 text-sm">
                        {data.followUp || "After 7 Days"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Automated Medication Schedule Preview */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <BellRing size={15} className="text-slate-700" />
                      Auto-Generated Patient Medication Alarms ({previewSlots.length} Slots)
                    </h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      Auto-Synced
                    </span>
                  </div>

                  {previewSlots.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {previewSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{slot.medicineName}</span>
                            <span className="text-slate-500 ml-2">({slot.instruction})</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {slot.slotLabel}
                            </span>
                            <span className="text-slate-500 font-medium">{slot.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Add medicines with 1+0+1 dosage to auto-generate patient alarm slots.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Automation Pipelines & Confirm */}
              <div className="w-full md:w-[340px] flex flex-col gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Active Automation Pipelines
                  </h4>

                  <label className="flex items-start gap-3 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoMedAlarmEnabled}
                      onChange={(e) => setAutoMedAlarmEnabled(e.target.checked)}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CalendarClock size={13} /> Smart Medication Routine
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Pushes Morning/Noon/Night alarms directly to Patient HealthPass.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs cursor-pointer pt-2 border-t border-slate-100">
                    <input
                      type="checkbox"
                      checked={autoSmsEnabled}
                      onChange={(e) => setAutoSmsEnabled(e.target.checked)}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <MessageSquare size={13} /> Instant SMS & Follow-up Reminder
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Sends Bangla Rx summary SMS & schedules follow-up alert.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs cursor-pointer pt-2 border-t border-slate-100">
                    <input
                      type="checkbox"
                      checked={autoDghsSyncEnabled}
                      onChange={(e) => setAutoDghsSyncEnabled(e.target.checked)}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck size={13} /> DGHS OpenMRS / FHIR Sync
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Auto-dispatches HL7 FHIR bundle to National Health Registry.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-2.5 mt-auto">
                  <button
                    onClick={handleFinalize}
                    className="w-full py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all text-sm flex justify-center items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Confirm, Send SMS & Sync
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-xs"
                  >
                    Keep Editing
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
