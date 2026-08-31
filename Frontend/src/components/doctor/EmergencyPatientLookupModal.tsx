"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, ShieldAlert, Heart, Activity, FileText, Phone, X, CheckCircle2, User, Stethoscope } from "lucide-react";
import { toast } from "sonner";

interface EmergencyPatientRecord {
  uhid: string;
  nid?: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup: string;
  severeAllergies: string[];
  chronicConditions: string[];
  activeMedications: { name: string; dosage: string }[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  hasPacemaker?: boolean;
  isDiabetic?: boolean;
  organDonor?: boolean;
  pastSurgeries: string[];
  notes?: string;
}

interface EmergencyPatientLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  doctorBmdc?: string;
  hospitalName?: string;
}

export function EmergencyPatientLookupModal({
  isOpen,
  onClose,
  doctorName = "Attending Physician",
  doctorBmdc = "BMDC-VERIFIED",
  hospitalName = "Emergency Room Triage",
}: EmergencyPatientLookupModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<EmergencyPatientRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter an ID or Phone Number.");
      return;
    }

    setIsLoading(true);
    setRecord(null);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/emergency/patient?query=${encodeURIComponent(searchQuery.trim())}&doctorName=${encodeURIComponent(doctorName)}&doctorBmdc=${encodeURIComponent(doctorBmdc)}&hospitalName=${encodeURIComponent(hospitalName)}`
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "No emergency health record found.");
        return;
      }

      setRecord(data.patient);
      toast.success("Emergency Health Record retrieved and audited.");
    } catch (err) {
      console.error("Lookup error:", err);
      toast.error("Network error retrieving emergency health record.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-white text-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">National Emergency Health Record</h2>
              <p className="text-xs text-slate-500">Emergency Profile Lookup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Universal Health ID (e.g. BD-H-10928374), NID, or Phone..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={16} /> Access Record
                </>
              )}
            </button>
          </form>

          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
            <span>Sample Test IDs:</span>
            <button
              type="button"
              onClick={() => setSearchQuery("BD-H-10928374")}
              className="px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-800 font-mono transition-colors"
            >
              BD-H-10928374
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery("BD-H-88239102")}
              className="px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-800 font-mono transition-colors"
            >
              BD-H-88239102
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery("BD-H-55410982")}
              className="px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-800 font-mono transition-colors"
            >
              BD-H-55410982
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {record ? (
            <div className="space-y-6">
              {/* Primary Vitals Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-rose-700 uppercase">Health ID: {record.uhid}</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{record.fullName}</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {record.gender || "Gender N/A"} • DOB: {record.dateOfBirth || "N/A"} • Contact: {record.phone}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-rose-600 text-white rounded-xl text-center shadow-xs">
                    <span className="text-[10px] font-bold uppercase block opacity-80">Blood Group</span>
                    <span className="text-base font-black">{record.bloodGroup}</span>
                  </div>
                </div>
              </div>

              {/* Critical Red-Flags (Allergies & Conditions) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wide">
                    <AlertTriangle size={15} /> Severe Drug Allergies
                  </div>
                  {record.severeAllergies.length > 0 ? (
                    <ul className="space-y-1">
                      {record.severeAllergies.map((allergy, i) => (
                        <li key={i} className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          {allergy}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No known drug allergies reported.</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wide">
                    <Activity size={15} /> Chronic Conditions
                  </div>
                  {record.chronicConditions.length > 0 ? (
                    <ul className="space-y-1">
                      {record.chronicConditions.map((cond, i) => (
                        <li key={i} className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          {cond}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No chronic conditions listed.</p>
                  )}
                </div>
              </div>

              {/* Active Medications & Past Surgeries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wide">
                    <FileText size={15} /> Active Regular Medications
                  </div>
                  {record.activeMedications.length > 0 ? (
                    <ul className="space-y-1.5">
                      {record.activeMedications.map((med, i) => (
                        <li key={i} className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                          <span>{med.name}</span>
                          <span className="text-slate-500 text-[11px] font-mono">{med.dosage}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No active regular medications.</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wide">
                    <Heart size={15} /> Emergency Contacts & Surgeries
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong className="text-slate-900">Next of Kin:</strong> {record.emergencyContactName || "Not provided"} ({record.emergencyContactPhone || "N/A"})
                  </p>
                  {record.pastSurgeries.length > 0 && (
                    <p className="text-xs text-slate-700">
                      <strong className="text-slate-900">Surgeries:</strong> {record.pastSurgeries.join(", ")}
                    </p>
                  )}
                  {record.hasPacemaker && (
                    <span className="inline-block px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold">
                      Pacemaker Implanted
                    </span>
                  )}
                </div>
              </div>

              {/* Clinical Notes */}
              {record.notes && (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-relaxed font-medium">
                  <strong className="block text-sky-950 mb-1">Attending Physician Precaution Note:</strong>
                  {record.notes}
                </div>
              )}
            </div>
          ) : hasSearched && !isLoading ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <User size={36} className="mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No record found matching query.</p>
              <p className="text-xs text-slate-500">Please verify the ID or registered phone number.</p>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Stethoscope size={36} className="mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-600">Enter patient identifier to initiate emergency triage.</p>
              <p className="text-xs text-slate-500">Access to sensitive health records is securely logged for medical audit compliance.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Logged under Attending: <strong>{doctorName}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Close Triage
          </button>
        </div>
      </motion.div>
    </div>
  );
}
