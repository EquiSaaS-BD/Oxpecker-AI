"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertOctagon, 
  Siren, 
  HeartPulse, 
  Activity, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Clock, 
  BellRing, 
  Volume2, 
  VolumeX, 
  BedDouble, 
  ShieldAlert, 
  Filter, 
  ArrowRight,
  PhoneCall,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

export interface EmergencyAlertItem {
  id: string;
  code: string;
  uhid: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  chiefComplaint: string;
  news2Score: number;
  urgency: "CRITICAL" | "HIGH" | "MODERATE";
  vitals: {
    hr: number; // bpm
    spo2: number; // %
    bp: string; // mmHg
    temp: number; // °F
  };
  recommendedAction: string;
  location: {
    lat: number;
    lon: number;
    address: string;
  };
  bedAllocation?: {
    ward: string;
    bedNumber: string;
    hospital: string;
  };
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  reportedTime: string;
}

const INITIAL_ALERTS: EmergencyAlertItem[] = [
  {
    id: "ALT-01",
    code: "CODE-RED",
    uhid: "UHID-BD-982104",
    patientName: "Mohammad Rafiqul Islam",
    age: 58,
    gender: "Male",
    bloodGroup: "B+",
    chiefComplaint: "Acute Central Crushing Chest Pain radiating to Left Jaw & Arm. Cold diaphoresis.",
    news2Score: 9,
    urgency: "CRITICAL",
    vitals: { hr: 122, spo2: 89, bp: "185/110", temp: 98.4 },
    recommendedAction: "Suspected STEMI / Acute Coronary Syndrome. Immediate 300mg Aspirin chewable, sublingual Nitroglycerin, and emergency Cath Lab activation.",
    location: {
      lat: 23.7461,
      lon: 90.3742,
      address: "Road 27, Dhanmondi, Dhaka",
    },
    bedAllocation: {
      ward: "Cardiac CCU",
      bedNumber: "CCU-02",
      hospital: "National Institute of Cardiovascular Diseases (NICVD)",
    },
    status: "ACTIVE",
    reportedTime: "3 mins ago",
  },
  {
    id: "ALT-02",
    code: "CODE-RED",
    uhid: "UHID-BD-741920",
    patientName: "Farhana Begum",
    age: 34,
    gender: "Female",
    bloodGroup: "O+",
    chiefComplaint: "Dengue Shock Syndrome (Day 5), severe persistent vomiting, unrecordable pulse.",
    news2Score: 8,
    urgency: "CRITICAL",
    vitals: { hr: 138, spo2: 91, bp: "80/50", temp: 101.2 },
    recommendedAction: "DGHS National Dengue Guideline Protocol: Start rapid crystalloid fluid resuscitation (20ml/kg/hr Normal Saline), arrange emergency FFP/Platelets.",
    location: {
      lat: 23.8103,
      lon: 90.4125,
      address: "Block D, Bashundhara R/A, Dhaka",
    },
    bedAllocation: {
      ward: "Emergency ICU",
      bedNumber: "ICU-05",
      hospital: "Kurmitola General Hospital",
    },
    status: "ACTIVE",
    reportedTime: "8 mins ago",
  },
  {
    id: "ALT-03",
    code: "CODE-AMBER",
    uhid: "UHID-BD-551029",
    patientName: "Ayesha Siddiqua",
    age: 62,
    gender: "Female",
    bloodGroup: "AB+",
    chiefComplaint: "Severe COPD Exacerbation with respiratory exhaustion. Accessory muscle breathing.",
    news2Score: 10,
    urgency: "CRITICAL",
    vitals: { hr: 114, spo2: 84, bp: "160/95", temp: 99.1 },
    recommendedAction: "High-flow oxygen via Venturi mask (titrate SpO2 88-92%), immediate nebulization with Salbutamol+Ipratropium, IV Hydrocortisone.",
    location: {
      lat: 24.8949,
      lon: 91.8687,
      address: "Zindabazar Point, Sylhet",
    },
    status: "ACKNOWLEDGED",
    reportedTime: "17 mins ago",
  },
  {
    id: "ALT-04",
    code: "CODE-YELLOW",
    uhid: "UHID-BD-609124",
    patientName: "Kamrul Ahsan",
    age: 44,
    gender: "Male",
    bloodGroup: "O-",
    chiefComplaint: "Hyperglycemic crisis / Diabetic Ketoacidosis with Kussmaul breathing.",
    news2Score: 6,
    urgency: "HIGH",
    vitals: { hr: 104, spo2: 96, bp: "135/85", temp: 98.8 },
    recommendedAction: "Hourly blood glucose & serum ketone monitoring, IV regular insulin infusion at 0.1 U/kg/hr.",
    location: {
      lat: 23.8041,
      lon: 90.3687,
      address: "Mirpur-10 Roundabout, Dhaka",
    },
    bedAllocation: {
      ward: "High Dependency Unit (HDU)",
      bedNumber: "HDU-03",
      hospital: "BIRDEM General Hospital",
    },
    status: "RESOLVED",
    reportedTime: "42 mins ago",
  },
];

export function EmergencyAlertsCenter() {
  const [alerts, setAlerts] = useState<EmergencyAlertItem[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "CRITICAL" | "RESOLVED">("ACTIVE");
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Synthesize soft medical alert beep using Web Audio API
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playAlertChime();
      toast.success("Emergency siren sound alerts activated.");
    } else {
      toast.info("Emergency sound alerts muted.");
    }
  };

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "ACKNOWLEDGED" } : a))
    );
    toast.success("Alert acknowledged by Attending Physician.");
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a))
    );
    toast.success("Emergency incident marked as Resolved & Archived.");
  };

  const activeAlertsCount = alerts.filter((a) => a.status === "ACTIVE").length;

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === "ACTIVE") return a.status === "ACTIVE";
    if (activeTab === "CRITICAL") return a.urgency === "CRITICAL";
    if (activeTab === "RESOLVED") return a.status === "RESOLVED";
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden my-8">
      {/* Emergency Header Bar */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 p-6 sm:p-7 border-b border-rose-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-900/40 relative">
            <Siren size={24} className="animate-bounce" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Live Emergency Clinical Triage
              </span>
              <span className="bg-rose-500/30 text-rose-200 border border-rose-500/40 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {activeAlertsCount} Critical Alerts Pending
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Emergency Code-Red Command Center
            </h3>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              soundEnabled
                ? "bg-rose-500 text-white border-rose-400 shadow-sm"
                : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/20"
            }`}
            title="Toggle Emergency Chime"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundEnabled ? "Siren Alert: ON" : "Siren Alert: OFF"}
          </button>

          {/* Tab Filter */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            {(["ACTIVE", "CRITICAL", "ALL", "RESOLVED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="p-6 divide-y divide-slate-100 space-y-6">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="font-bold text-slate-700">No active emergency alerts in this category.</p>
              <p className="text-xs text-slate-600 mt-1">All incoming clinical triage distress signals have been addressed.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pt-6 first:pt-0"
              >
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 bg-slate-50/70 hover:bg-slate-50 p-5 rounded-2xl border border-slate-200/80 transition-all">
                  
                  {/* Left: Patient Info & Vitals */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          alert.code === "CODE-RED"
                            ? "bg-rose-600 text-white"
                            : alert.code === "CODE-AMBER"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-sky-600 text-white"
                        }`}
                      >
                        <AlertOctagon size={14} />
                        {alert.code}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-900 text-white">
                        NEWS2 Score: {alert.news2Score}/20
                      </span>

                      <span className="text-xs font-mono text-slate-500 font-bold">{alert.uhid}</span>

                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 ml-auto">
                        <Clock size={12} /> {alert.reportedTime}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        {alert.patientName}
                        <span className="text-xs text-slate-500 font-semibold">
                          ({alert.age}y, {alert.gender}, Blood: {alert.bloodGroup})
                        </span>
                      </h4>
                      <p className="text-sm font-semibold text-rose-700 mt-0.5">
                        {alert.chiefComplaint}
                      </p>
                    </div>

                    {/* Vitals Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <HeartPulse size={16} className="text-rose-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-600">Heart Rate</p>
                          <p className="text-xs font-black text-slate-900">{alert.vitals.hr} bpm</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-sky-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-600">SpO2 Oxygen</p>
                          <p className={`text-xs font-black ${alert.vitals.spo2 < 90 ? "text-rose-600" : "text-slate-900"}`}>
                            {alert.vitals.spo2}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-amber-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-600">Blood Pressure</p>
                          <p className="text-xs font-black text-slate-900">{alert.vitals.bp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-emerald-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-600">Body Temp</p>
                          <p className="text-xs font-black text-slate-900">{alert.vitals.temp} °F</p>
                        </div>
                      </div>
                    </div>

                    {/* DGHS Protocol Suggestion */}
                    <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl text-xs">
                      <p className="font-bold text-emerald-900 mb-0.5">DGHS Clinical Management Guideline:</p>
                      <p className="text-emerald-800 leading-relaxed font-medium">{alert.recommendedAction}</p>
                    </div>

                    {/* Location & Bed Tag */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600 shrink-0" />
                        <span>{alert.location.address}</span>
                      </div>
                      {alert.bedAllocation && (
                        <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                          <BedDouble size={14} />
                          <span>
                            {alert.bedAllocation.hospital} • <strong>{alert.bedAllocation.bedNumber} ({alert.bedAllocation.ward})</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions Column */}
                  <div className="flex flex-row xl:flex-col gap-2 shrink-0 justify-end">
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${alert.location.lat},${alert.location.lon}&travelmode=driving`;
                        window.open(url, "_blank", "noopener,noreferrer");
                        toast.success("Routing in Google Maps...");
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Navigation size={14} />
                      Google Maps Route
                    </button>

                    {alert.status === "ACTIVE" && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <UserCheck size={14} />
                        Acknowledge
                      </button>
                    )}

                    {alert.status !== "RESOLVED" && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle size={14} className="text-emerald-600" />
                        Resolve Incident
                      </button>
                    )}
                  </div>

                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}