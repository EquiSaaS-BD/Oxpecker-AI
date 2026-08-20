"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Activity, Pill, Clock, FileText, Eye, Edit } from "lucide-react";
import { useDoctor } from "@/context/DoctorContext";

interface PatientDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

export function PatientDetailsDrawer({ isOpen, onClose, patient }: PatientDetailsDrawerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { patientPrescriptions } = useDoctor();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const pastPrescriptions = patient ? (patientPrescriptions[patient.id] || []) : [];

  return createPortal(
    <AnimatePresence>
      {isOpen && patient && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[99998] bg-slate-900/20 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[99999] w-full max-w-[600px] bg-white shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Patient Details</h2>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Profile Overview */}
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border border-primary/20">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">{patient.name}</h1>
                  <p className="text-slate-500 font-medium">{patient.id} • {patient.gender}, {patient.age} Years</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                      Blood: O+
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                      Weight: 72kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Visit */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity size={16} className="text-[#2F80ED]" /> Current Visit Info
                </h3>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between border-b border-slate-200/60 pb-3">
                    <span className="text-sm text-slate-500">Diagnosis</span>
                    <span className="text-sm font-bold text-slate-800">{patient.diagnosis}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-3">
                    <span className="text-sm text-slate-500">Visit Type</span>
                    <span className="text-sm font-bold text-slate-800">{patient.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Date</span>
                    <span className="text-sm font-bold text-slate-800">{new Date(patient.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Past Prescriptions */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" /> Past Prescriptions
                </h3>
                
                {pastPrescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {pastPrescriptions.map((rx, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl hover:border-primary/40 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-primary" />
                            <h4 className="font-bold text-slate-800 text-sm">{new Date(rx.date || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</h4>
                          </div>
                          <div className="flex gap-2">
                            <a 
                              href={`/doctor/dashboard/prescription/new?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}&preview=true`}
                              className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold uppercase rounded-md flex items-center gap-1 transition-colors"
                            >
                              <Eye size={12} /> View Design
                            </a>
                            <a 
                              href={`/doctor/dashboard/prescription/new?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}`}
                              className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] font-bold uppercase rounded-md flex items-center gap-1 transition-colors"
                            >
                              <Edit size={12} /> Edit
                            </a>
                          </div>
                        </div>
                        {rx.diagnosis && (
                          <p className="text-xs text-slate-600 mb-2 font-medium">Diagnosis: <span className="text-slate-800">{rx.diagnosis}</span></p>
                        )}
                        {rx.medicines && rx.medicines.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {rx.medicines.slice(0, 3).map((m: any, i: number) => (
                              <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                                <Pill size={10} /> {m.name}
                              </span>
                            ))}
                            {rx.medicines.length > 3 && (
                              <span className="text-[11px] text-slate-400 font-medium px-1 py-0.5">+{rx.medicines.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <FileText size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No past prescriptions found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <a 
                href={`/doctor/dashboard/prescription/new?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                <Edit size={18} />
                Edit / Write Prescription
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
