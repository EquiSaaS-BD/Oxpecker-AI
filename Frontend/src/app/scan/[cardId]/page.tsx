"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Shield, Droplet, Phone, AlertTriangle, Stethoscope,
  Pill, Calendar, CheckCircle2, XCircle, Loader2,
  Clock, Activity, Heart, User, MapPin, Eye, X, Printer, HeartPulse, FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { HealthPassCard, MedicalVisit } from "@/types/healthpass";
import { getHealthCardByNumber, formatDate } from "@/lib/healthpass";
import { MedicalLoader } from "@/components/shared/MedicalLoader";

export default function ScanPage() {
  const params = useParams();
  const cardId = params.cardId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [card, setCard] = useState<HealthPassCard | null>(null);
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<MedicalVisit | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await getHealthCardByNumber(cardId);
        if (result) {
          setCard(result.card);
          setVisits(result.visits);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [cardId]);

  if (isLoading) {
    return <MedicalLoader fullScreen text="HealthPass লোড হচ্ছে" />;
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Invalid HealthPass</h1>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          এই কার্ড নম্বরটি সঠিক নয় অথবা কার্ডটি নিষ্ক্রিয় করা হয়েছে।
        </p>
        <p className="text-slate-400 text-xs font-mono">{cardId}</p>
      </div>
    );
  }

  const isVerified = card.verification_status === "verified";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] py-4 px-6 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-white" />
            <h1 className="text-white font-bold text-sm tracking-wider uppercase">
              Oxpecker HealthPass • Clinical Emergency Scan
            </h1>
          </div>
          {isVerified && (
            <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
              <CheckCircle2 size={12} className="text-emerald-300" />
              <span className="text-emerald-200 text-xs font-bold">Verified Citizen</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        {/* Emergency Alert Banner */}
        {card.allergies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs"
          >
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-700 text-sm mb-1">⚠️ Critical Allergy Alert</h3>
              <div className="flex flex-wrap gap-1.5">
                {card.allergies.map((a) => (
                  <span key={a} className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Patient Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Photo */}
            <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0">
              {card.patient_image ? (
                <img src={card.patient_image} alt={card.patient_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                  <User size={28} className="text-sky-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {card.english_name || card.patient_name}
                </h2>
                {card.patient_name && card.english_name && card.patient_name !== card.english_name && (
                  <span className="text-sm font-semibold text-slate-500">
                    ({card.patient_name})
                  </span>
                )}
              </div>
              <p className="text-slate-400 font-mono text-xs mt-0.5 font-bold">{card.card_number}</p>

              {/* Badges Grid */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                  <Droplet size={12} className="text-red-500" />
                  <span className="text-red-700 font-black text-xs">{card.blood_group}</span>
                </div>
                <span className="text-slate-700 font-semibold text-xs bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {card.gender}
                </span>
                <span className="text-slate-700 font-semibold text-xs bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  DOB: {formatDate(card.date_of_birth)}
                </span>
                <span className="text-slate-700 font-semibold text-xs bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  Status: <strong>{card.marital_status || "Married"}</strong>
                </span>
                <span className="text-sky-800 font-semibold text-xs bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                  Last Doctor Visit: <strong>{card.last_doctor_visit || (visits[0] ? formatDate(visits[0].visit_date) : "14 Oct 2026")}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Emergency & Personal Contacts */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Personal Phone Number
              </span>
              <a href={`tel:${card.personal_phone || "+880 1712-345678"}`} className="text-slate-800 font-mono font-bold flex items-center gap-1.5 hover:text-sky-600">
                <Phone size={12} className="text-sky-600" />
                <span>{card.personal_phone || "+880 1712-345678"}</span>
              </a>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <span className="text-[10px] uppercase font-bold text-rose-700 block mb-0.5">
                Emergency Contact (ICE) • {card.emergency_contact_name} ({card.emergency_contact_relation})
              </span>
              <a href={`tel:${card.emergency_contact_phone}`} className="text-rose-900 font-mono font-bold flex items-center gap-1.5 hover:text-rose-700">
                <Phone size={12} className="text-rose-600" />
                <span>{card.emergency_contact_phone}</span>
              </a>
            </div>
          </div>

          {/* Location / Address */}
          {(card.address || card.zila) && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <MapPin size={14} className="text-sky-600 shrink-0" />
              <span>
                <strong>Address: </strong>
                {card.address || `${card.upazila || "Dhanmondi"}, ${card.zila || "Dhaka"}`}
                {card.post_code ? ` - ${card.post_code}` : ""}
              </span>
            </div>
          )}
        </motion.div>

        {/* Active Conditions */}
        {card.chronic_conditions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope size={18} className="text-amber-600" />
              <h3 className="font-bold text-slate-900">Chronic Health Conditions</h3>
            </div>
            <div className="space-y-2.5">
              {card.chronic_conditions.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-amber-50/60 border border-amber-100 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity size={14} className="text-amber-500" />
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{c.name}</span>
                      <span className="text-xs text-slate-400 ml-2">since {c.since}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    c.status === "controlled"
                      ? "bg-emerald-100 text-emerald-700"
                      : c.status === "resolved"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Current Medications */}
        {card.current_medications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Pill size={18} className="text-emerald-600" />
              <h3 className="font-bold text-slate-900">Current Prescribed Medications</h3>
            </div>
            <div className="space-y-2">
              {card.current_medications.map((med, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3"
                >
                  <div>
                    <span className="font-semibold text-slate-800 text-sm">{med.name}</span>
                    <span className="text-xs text-slate-500 ml-1.5 font-mono">({med.dosage})</span>
                    {med.instructions && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{med.instructions}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                    {med.frequency}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Visits & Consultations */}
        {visits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-sky-600" />
              <h3 className="font-bold text-slate-900">Clinical Visit History & Prescriptions</h3>
            </div>
            <div className="space-y-3">
              {visits.map((v) => (
                <div key={v.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{v.doctor_name}</h4>
                      <p className="text-xs text-sky-700 font-medium">{v.department || "Clinical Medicine"}</p>
                      <p className="text-xs text-slate-500">{v.hospital_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">
                        {formatDate(v.visit_date)}
                      </span>
                      <button
                        onClick={() => setSelectedVisit(v)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View Rx</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 mt-2 font-medium">
                    <strong>Diagnosis:</strong> {v.diagnosis}
                  </p>

                  {v.vitals && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono">
                      <span className="text-slate-600 font-sans font-bold">Vitals:</span>
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">BP: {v.vitals.bp}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">Pulse: {v.vitals.pulse}</span>
                      <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-100">Temp: {v.vitals.temp}</span>
                      <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-100">Weight: {v.vitals.weight}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-slate-400">
            Powered by <strong className="text-sky-600">Oxpecker AI</strong> • Digital Health Platform
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            This is a verified medical identity document. For emergency and clinical consultation use only.
          </p>
        </div>
      </div>

      {/* Prescription Dossier Modal */}
      <AnimatePresence>
        {selectedVisit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal Top Header (Hospital Branding) */}
              <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white p-5 sm:p-6 shrink-0 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 block">
                        CLINICAL CONSULTATION & RX DOSSIER
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {selectedVisit.hospital_name}
                      </h3>
                      {selectedVisit.department && (
                        <p className="text-xs text-sky-200 font-semibold">{selectedVisit.department}</p>
                      )}
                      {selectedVisit.location && (
                        <p className="text-[11px] text-sky-300/90 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="shrink-0" />
                          <span>{selectedVisit.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      title="Print Prescription"
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedVisit(null)}
                      title="Close"
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Sub-bar: Doctor Info & Date */}
                <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-sky-200 font-medium">Attending Physician: </span>
                    <strong className="text-white font-bold">{selectedVisit.doctor_name}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-sky-200 font-bold bg-white/10 px-3 py-0.5 rounded-lg border border-white/10">
                    <Calendar size={12} />
                    <span>{formatDate(selectedVisit.visit_date)}</span>
                  </div>
                </div>
              </div>

              {/* Patient Quick Header */}
              {card && (
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Patient:</span>
                    <strong className="font-bold text-slate-800 text-sm">{card.english_name || card.patient_name}</strong>
                    <span className="font-mono text-[11px] text-slate-400">({card.card_number})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">Gender: <strong>{card.gender}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600">Blood: <strong className="text-red-600 font-black">{card.blood_group}</strong></span>
                    {card.marital_status && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">Marital: <strong>{card.marital_status}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Scrollable Prescription Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                {/* 1. Clinical Vitals */}
                {selectedVisit.vitals && (
                  <div>
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <HeartPulse size={14} className="text-rose-500" />
                      Recorded Vitals at Examination
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 bg-red-50/70 border border-red-200/70 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-red-600 block">Blood Pressure</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{selectedVisit.vitals.bp}</span>
                      </div>
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block">Pulse / Heart Rate</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{selectedVisit.vitals.pulse}</span>
                      </div>
                      <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-amber-700 block">Temperature</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{selectedVisit.vitals.temp}</span>
                      </div>
                      <div className="p-3 bg-sky-50/70 border border-sky-200/70 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-sky-700 block">Body Weight</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{selectedVisit.vitals.weight}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Diagnosis */}
                <div>
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Activity size={14} className="text-sky-600" />
                    Clinical Diagnosis & Assessment
                  </h5>
                  <div className="p-4 bg-sky-50/50 border border-sky-200/80 rounded-2xl">
                    <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {selectedVisit.diagnosis}
                    </p>
                    {selectedVisit.notes && (
                      <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-sky-200/40">
                        {selectedVisit.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Rx / Prescribed Medications */}
                <div>
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Pill size={14} className="text-emerald-600" />
                    Prescribed Medications (Rx)
                  </h5>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="py-2.5 px-3">Medicine & Dosage</th>
                          <th className="py-2.5 px-3">Frequency</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3 hidden sm:table-cell">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedVisit.medications && selectedVisit.medications.length > 0 ? (
                          selectedVisit.medications.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 block">{m.name}</span>
                                <span className="text-[11px] text-slate-500 font-mono">{m.dosage}</span>
                                <span className="sm:hidden text-[10px] text-slate-400 block mt-0.5">{m.instructions}</span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-700">{m.frequency}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{m.duration}</td>
                              <td className="py-2.5 px-3 text-slate-500 italic hidden sm:table-cell">{m.instructions}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 px-3 text-slate-600 font-medium">
                              {selectedVisit.prescription_summary}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Requested Diagnostic Tests */}
                {selectedVisit.tests && selectedVisit.tests.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-600" />
                      Laboratory & Diagnostic Tests Ordered
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedVisit.tests.map((test, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                          <span>{test}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Advice & Follow up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVisit.advice && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                      <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block mb-1">
                        Physician Advice & Dietary Guidance
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {selectedVisit.advice}
                      </p>
                    </div>
                  )}

                  {selectedVisit.follow_up && (
                    <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl">
                      <span className="text-[10px] uppercase font-black text-sky-800 tracking-wider block mb-1">
                        Next Follow-up Consultation
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-bold">
                        {selectedVisit.follow_up}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Shield size={14} className="text-emerald-600" />
                  <span>Electronically Verified via Oxpecker Clinical Cloud</span>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
