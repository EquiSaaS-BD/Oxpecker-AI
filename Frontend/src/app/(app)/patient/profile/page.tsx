"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Download,
  Droplets,
  Edit3,
  FileText,
  FlaskConical,
  Heart,
  Pill,
  QrCode,
  Ruler,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { MedicalLoader } from "@/components/shared/MedicalLoader";

type TimelineFilter = "all" | "appointment" | "prescription" | "lab_report" | "document";

function getBmiBadgeStyle(category?: string | null) {
  switch (category) {
    case "Underweight":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "Normal":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Overweight":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Obese":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function formatSourceLabel(source?: string) {
  switch (source) {
    case "clinic_website":
      return "Clinic Website Sync";
    case "widget":
      return "Embedded Clinic Widget";
    case "csv_import":
      return "Clinic Hub Import";
    case "doctor_pad":
      return "Doctor Smart Pad";
    case "diagnostic_lab":
      return "Diagnostic Lab";
    case "vault_upload":
      return "Encrypted Vault";
    default:
      return "Oxpecker App";
  }
}

async function compressAvatarFile(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 320;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function PatientProfilePage() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Male",
    bloodGroup: "O+",
    nidNumber: "",
    heightCm: "",
    weightKg: "",
    bloodPressure: "",
    heartRate: "",
    spo2: "",
    bloodGlucose: "",
    allergiesText: "",
    conditionsText: "",
    photoUrl: "",
  });

  const hydrateEditForm = useCallback((p: any) => {
    if (!p) return;
    setEditForm({
      name: p.name || "",
      phone: p.phone || "",
      age: p.age ? String(p.age) : "",
      gender: p.gender || "Male",
      bloodGroup: p.bloodGroup || "O+",
      nidNumber: p.nidNumber || "",
      heightCm: p.heightCm ? String(p.heightCm) : "170",
      weightKg: p.weightKg ? String(p.weightKg) : "70",
      bloodPressure: p.vitalsSnapshot?.bloodPressure || "124/80 mmHg",
      heartRate: p.vitalsSnapshot?.heartRate || "74 bpm",
      spo2: p.vitalsSnapshot?.spo2 || "98%",
      bloodGlucose: p.vitalsSnapshot?.bloodGlucose || "108 mg/dL",
      allergiesText: Array.isArray(p.allergies) ? p.allergies.join(", ") : "",
      conditionsText: Array.isArray(p.chronicConditions) ? p.chronicConditions.join(", ") : "",
      photoUrl: p.photoUrl || "",
    });
  }, []);

  const loadPatient360 = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/360", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        hydrateEditForm(json.patient);
      }
    } catch (err) {
      console.error("Patient 360 fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [hydrateEditForm]);

  useEffect(() => {
    void loadPatient360();
  }, [loadPatient360, user?.id, user?.email]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressAvatarFile(file);
      setEditForm((prev) => ({ ...prev, photoUrl: compressed }));
      const res = await fetch("/api/patient/360", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mrn: data?.patient?.mrn,
          name: data?.patient?.name || user?.name,
          photoUrl: compressed,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        if (user) updateUser({ ...user, image: compressed });
        toast.success("Profile photo updated & synced to Patient 360° Vault.");
      } else {
        setData((prev: any) =>
          prev ? { ...prev, patient: { ...prev.patient, photoUrl: compressed } } : prev
        );
        toast.info("Photo preview updated (sign in to persist to PostgreSQL).");
      }
    } catch {
      toast.error("Could not process uploaded image.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/patient/360", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mrn: data?.patient?.mrn,
          name: editForm.name,
          phone: editForm.phone,
          age: editForm.age ? Number(editForm.age) : undefined,
          gender: editForm.gender,
          bloodGroup: editForm.bloodGroup,
          nidNumber: editForm.nidNumber,
          heightCm: editForm.heightCm ? Number(editForm.heightCm) : undefined,
          weightKg: editForm.weightKg ? Number(editForm.weightKg) : undefined,
          photoUrl: editForm.photoUrl || undefined,
          allergies: editForm.allergiesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          chronicConditions: editForm.conditionsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          vitalsSnapshot: {
            bloodPressure: editForm.bloodPressure,
            heartRate: editForm.heartRate,
            spo2: editForm.spo2,
            bloodGlucose: editForm.bloodGlucose,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const updated = await res.json();
      setData(updated);
      hydrateEditForm(updated.patient);
      setIsEditing(false);
      toast.success("Clinical vitals, BMI & Patient 360° profile saved!");
    } catch {
      toast.error("Please sign in to save permanent edits.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadFhir = () => {
    if (!data?.fhirBundle) return;
    const blob = new Blob([JSON.stringify(data.fhirBundle, null, 2)], {
      type: "application/fhir+json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oxpecker-dghs-fhir-${data?.patient?.mrn || "patient"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("HL7 FHIR R4 Bundle exported (DGHS SHR Compatible).");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <MedicalLoader text="Loading Patient 360° Vault" />
      </div>
    );
  }

  const patient = data?.patient || {};
  const vitals = patient.vitalsSnapshot || {};
  const timeline: any[] = data?.timeline || [];
  const filteredTimeline = timeline.filter((t) => filter === "all" || t.category === filter);
  const hospitals: string[] = data?.participatingHospitals || [];
  const doctors: Array<{ name: string; specialty: string; hospital: string }> =
    data?.consultingDoctors || [];
  const bmiNum = typeof patient.bmi === "number" ? patient.bmi : 24.2;
  const bmiGaugePercent = Math.min(100, Math.max(8, ((bmiNum - 12) / 28) * 100));

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" richColors />

      {/* Top Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
            <ShieldCheck size={14} /> Unified MPI Health Record • HL7 FHIR R4 Ready
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Patient 360° Longitudinal Health Vault
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete history of every hospital visit, clinic booking, physician prescription, lab report, and biometric vital across the Oxpecker Hub.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <Edit3 size={15} /> Update Vitals & Height/Weight
          </button>
          <button
            onClick={handleDownloadFhir}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <Download size={15} /> Export DGHS FHIR JSON
          </button>
          <Link
            href="/health-card"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-bold transition-colors"
          >
            <QrCode size={15} /> HealthPass QR
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* LEFT COLUMN: Identity + Photo + Body Composition (Height/Weight/BMI) + Conditions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-sky-500 via-cyan-600 to-teal-600 relative" />
            <div className="px-6 pb-6 -mt-14 flex flex-col items-center text-center relative z-10">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 relative">
                  <Image
                    src={patient.photoUrl || "/images/user-avatar.jpg"}
                    alt={patient.name || "Patient Avatar"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  title="Upload Patient Photo"
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center shadow-md hover:bg-sky-600 transition-colors cursor-pointer"
                >
                  <Camera size={15} />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-3">{patient.name}</h2>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                  MRN: {patient.mrn || "OX-10001"}
                </span>
                {patient.nidNumber && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <CheckCircle2 size={12} /> NID Verified
                  </span>
                )}
              </div>

              <div className="mt-6 w-full space-y-3 text-left text-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-semibold">Age / Gender</span>
                  <span className="font-bold text-slate-900">
                    {patient.age || "—"} yrs • {patient.gender || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-semibold">Blood Group</span>
                  <span className="font-black text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
                    <Droplets size={13} /> {patient.bloodGroup || "O+"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-semibold">Phone</span>
                  <span className="font-bold text-slate-900">{patient.phone || "Not linked"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Email</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                    {patient.email || user?.email || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Height, Weight & Live BMI Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
                Body Metrics & BMI
              </h3>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${getBmiBadgeStyle(
                  patient.bmiCategory
                )}`}
              >
                {patient.bmiCategory || "Normal"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <Ruler size={16} className="mx-auto text-sky-600 mb-1" />
                <div className="text-lg font-black text-slate-900">
                  {patient.heightCm || 170}
                  <span className="text-xs font-semibold text-slate-500 ml-0.5">cm</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Height</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <Scale size={16} className="mx-auto text-indigo-600 mb-1" />
                <div className="text-lg font-black text-slate-900">
                  {patient.weightKg || 70}
                  <span className="text-xs font-semibold text-slate-500 ml-0.5">kg</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Weight</div>
              </div>
              <div className="bg-slate-900 text-white rounded-2xl p-3">
                <Activity size={16} className="mx-auto text-emerald-400 mb-1" />
                <div className="text-lg font-black">{patient.bmi ?? "24.2"}</div>
                <div className="text-[11px] font-semibold text-slate-300">BMI Index</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500 relative">
                <div
                  className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 shadow-md absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
                  style={{ left: `${bmiGaugePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Under &lt;18.5</span>
                <span>Normal 18.5-24.9</span>
                <span>Over 25-29.9</span>
                <span>Obese 30+</span>
              </div>
            </div>
          </div>

          {/* Allergies & Chronic Conditions */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5 mb-2.5">
                <ShieldAlert size={14} /> Documented Drug Allergies
              </h3>
              <div className="flex flex-wrap gap-2">
                {(patient.allergies || []).length > 0 ? (
                  patient.allergies.map((a: string) => (
                    <span
                      key={a}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No known allergies recorded</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-2.5">
                <Heart size={14} /> Chronic Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {(patient.chronicConditions || []).length > 0 ? (
                  patient.chronicConditions.map((c: string) => (
                    <span
                      key={c}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No chronic conditions flagged</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Vitals + Care Network + Chronological 360 Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Vitals Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-500">Blood Pressure</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {vitals.bloodPressure || "126/82 mmHg"}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">Latest recorded</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-500">Heart Rate / Pulse</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {vitals.heartRate || "76 bpm"}
              </div>
              <div className="text-[11px] font-semibold text-sky-600 mt-0.5">Sinus baseline</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-500">Oxygen (SpO2)</div>
              <div className="text-xl font-black text-slate-900 mt-1">{vitals.spo2 || "98%"}</div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">Room air</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-500">Blood Glucose</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {vitals.bloodGlucose || "115 mg/dL"}
              </div>
              <div className="text-[11px] font-semibold text-amber-600 mt-0.5">Glycemic monitor</div>
            </div>
          </div>

          {/* Care Network: Visited Hospitals & Attending Physicians */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-sky-600" /> Connected Hospitals, Clinics & Physicians
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {hospitals.length} Facilities • {doctors.length} Doctors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {doctors.slice(0, 6).map((doc, idx) => (
                <div
                  key={`${doc.name}-${idx}`}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Stethoscope size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{doc.name}</div>
                    <div className="text-xs text-slate-500 truncate">{doc.hospital}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Longitudinal 360 Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Unified Medical Timeline ({filteredTimeline.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Includes Oxpecker bookings, synced clinic website visits, doctor prescriptions, and lab reports.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "appointment", label: "Visits" },
                  { id: "prescription", label: "Prescriptions" },
                  { id: "lab_report", label: "Lab Reports" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as TimelineFilter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      filter === tab.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTimeline.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700">No records in this category yet</p>
                <Link
                  href="/doctors"
                  className="inline-block mt-3 text-xs font-bold text-sky-600 hover:underline"
                >
                  Book a Specialist Appointment →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTimeline.map((item) => {
                  const Icon =
                    item.category === "prescription"
                      ? Pill
                      : item.category === "lab_report"
                        ? FlaskConical
                        : item.category === "appointment"
                          ? Calendar
                          : FileText;
                  const iconColor =
                    item.category === "prescription"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : item.category === "lab_report"
                        ? "bg-violet-50 text-violet-700 border-violet-200"
                        : "bg-sky-50 text-sky-700 border-sky-200";

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-sky-300 bg-slate-50/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconColor}`}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-black text-slate-900">
                                {item.title}
                              </h4>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                                {formatSourceLabel(item.source)}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">
                              {item.subtitle}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                <Building2 size={12} className="text-sky-600" />
                                {item.hospitalName || "Oxpecker Network"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Stethoscope size={12} className="text-emerald-600" />
                                {item.doctorName}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between gap-1 shrink-0">
                          <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            {item.date || "Recent"}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700">{item.status}</span>
                        </div>
                      </div>

                      {Array.isArray(item.medicines) && item.medicines.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-wrap gap-2">
                          {item.medicines.map((m: any, mIdx: number) => (
                            <span
                              key={mIdx}
                              className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg"
                            >
                              {m.brand_name || m.name} {m.strength || ""}{" "}
                              {m.dosage ? `• ${m.dosage}` : ""}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.details && (
                        <p className="mt-2.5 text-xs text-slate-600 bg-white rounded-xl p-2.5 border border-slate-100">
                          {item.details}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Clinical Vitals & BMI Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Update Biometrics, Vitals & Clinical Profile
                </h2>
                <p className="text-xs text-slate-500">
                  BMI is calculated automatically from your height & weight.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.heightCm}
                    onChange={(e) => setEditForm({ ...editForm, heightCm: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.weightKg}
                    onChange={(e) => setEditForm({ ...editForm, weightKg: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Blood Group</label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={editForm.bloodPressure}
                    onChange={(e) => setEditForm({ ...editForm, bloodPressure: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Heart Rate</label>
                  <input
                    type="text"
                    value={editForm.heartRate}
                    onChange={(e) => setEditForm({ ...editForm, heartRate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Blood Glucose</label>
                  <input
                    type="text"
                    value={editForm.bloodGlucose}
                    onChange={(e) => setEditForm({ ...editForm, bloodGlucose: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.allergiesText}
                  onChange={(e) => setEditForm({ ...editForm, allergiesText: e.target.value })}
                  placeholder="Penicillin, Sulfa Drugs"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Chronic Conditions (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.conditionsText}
                  onChange={(e) => setEditForm({ ...editForm, conditionsText: e.target.value })}
                  placeholder="Type-2 Diabetes, Hypertension"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold cursor-pointer"
                >
                  {saving ? "Saving..." : "Save to Patient 360°"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
