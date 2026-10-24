"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Search,
  BedDouble,
  ShieldCheck,
  HeartPulse,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Phone,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Sparkles,
  Stethoscope,
  ArrowRight,
  LogOut,
  Activity,
  Zap,
  Layers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import type { InpatientAdmission, BedGig } from "@/types/hospital-hms";
import {
  getHospitalAdmissions,
  saveHospitalAdmission,
  dischargeHospitalPatient,
  getHospitalBeds,
  searchNationalPatientRegistry,
  RegistrySearchMatch,
} from "@/lib/hospital-hms";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

function InpatientConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBed = searchParams?.get("bed") || "";

  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [beds, setBeds] = useState<BedGig[]>([]);
  const [search, setSearch] = useState("");
  const [filterCondition, setFilterCondition] = useState<string>("All");
  const [wardFilter, setWardFilter] = useState<string>("All");

  // Modal States
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<InpatientAdmission | null>(null);

  // 1-Click Database Import Search
  const [registryQuery, setRegistryQuery] = useState("");
  const [registryResults, setRegistryResults] = useState<RegistrySearchMatch[]>([]);
  const [isSearchingRegistry, setIsSearchingRegistry] = useState(false);
  const [importedPatientBadge, setImportedPatientBadge] = useState<string | null>(null);

  // Admission Form State
  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    english_name: "",
    nid_number: "",
    smart_card_uid: "",
    personal_phone: "",
    date_of_birth: "1980-01-01",
    age: 46,
    gender: "Male",
    blood_group: "O+",
    address: "",
    allergies: [] as string[],
    has_pacemaker: false,
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "Family",
    bed_id: "",
    attending_doctor: "Prof. Dr. Anisur Rahman",
    primary_diagnosis: "",
    condition: "Stable" as InpatientAdmission["condition"],
    initial_deposit: 20000,
  });

  // Load Data on Mount
  useEffect(() => {
    const loadedAdmissions = getHospitalAdmissions();
    const loadedBeds = getHospitalBeds();
    setAdmissions(loadedAdmissions);
    setBeds(loadedBeds);

    // If preselected bed from URL query param
    if (preselectedBed) {
      setFormData((prev) => ({ ...prev, bed_id: preselectedBed }));
      setIsAdmitModalOpen(true);
    }
  }, [preselectedBed]);

  // Registry Search Effect
  useEffect(() => {
    if (registryQuery.trim().length >= 2) {
      setIsSearchingRegistry(true);
      const matches = searchNationalPatientRegistry(registryQuery);
      setRegistryResults(matches);
      setIsSearchingRegistry(false);
    } else {
      setRegistryResults([]);
    }
  }, [registryQuery]);

  // Handle 1-Click Auto Import
  const handleAutoImportPatient = (patient: RegistrySearchMatch) => {
    setFormData((prev) => ({
      ...prev,
      patient_id: patient.id,
      patient_name: patient.patient_name,
      english_name: patient.english_name || patient.patient_name,
      nid_number: patient.nid_number || "",
      smart_card_uid: patient.smart_card_uid,
      personal_phone: patient.personal_phone || "",
      date_of_birth: patient.date_of_birth,
      age: patient.age,
      gender: patient.gender,
      blood_group: patient.blood_group,
      address: patient.address || "",
      allergies: patient.allergies || [],
      has_pacemaker: !!patient.has_pacemaker,
      emergency_contact_name: patient.emergency_contact_name || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
      emergency_contact_relation: patient.emergency_contact_relation || "Family",
    }));

    setImportedPatientBadge(`${patient.english_name || patient.patient_name} (${patient.smart_card_uid})`);
    setRegistryResults([]);
    setRegistryQuery("");
    toast.success(`1-Click Import Successful: ${patient.english_name || patient.patient_name} verified from National HealthPass Registry`);
  };

  // Submit Admission
  const handleSubmitAdmission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_name.trim()) {
      toast.error("Patient name is required");
      return;
    }
    if (!formData.bed_id) {
      toast.error("Please assign a hospital bed or ward suite");
      return;
    }

    const assignedBed = beds.find((b) => b.id === formData.bed_id);
    const admissionId = `ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAdmission: InpatientAdmission = {
      id: admissionId,
      patient_id: formData.patient_id || `pat-${Date.now()}`,
      patient_name: formData.patient_name.trim(),
      english_name: formData.english_name.trim() || formData.patient_name.trim(),
      nid_number: formData.nid_number.trim() || "N/A",
      smart_card_uid: formData.smart_card_uid.trim() || `HP-${Math.floor(10000 + Math.random() * 90000)}`,
      personal_phone: formData.personal_phone.trim() || "N/A",
      date_of_birth: formData.date_of_birth,
      age: Number(formData.age) || 35,
      gender: formData.gender,
      blood_group: formData.blood_group,
      address: formData.address.trim() || "Dhaka, Bangladesh",
      allergies: formData.allergies,
      has_pacemaker: formData.has_pacemaker,
      emergency_contact_name: formData.emergency_contact_name.trim() || "Emergency Contact",
      emergency_contact_phone: formData.emergency_contact_phone.trim() || "N/A",
      emergency_contact_relation: formData.emergency_contact_relation.trim() || "Family",
      bed_id: formData.bed_id,
      bed_name: assignedBed?.title || `Bed ${formData.bed_id}`,
      bed_type: assignedBed?.category || "General Ward",
      bed_daily_rate: assignedBed?.price || 3000,
      admission_date: new Date().toISOString().split("T")[0],
      admission_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attending_doctor: formData.attending_doctor,
      primary_diagnosis: formData.primary_diagnosis.trim() || "Clinical Observation & Inpatient Workup",
      condition: formData.condition,
      initial_deposit: Number(formData.initial_deposit) || 10000,
      status: "Admitted",
      healthPassVerified: !!formData.smart_card_uid,
    };

    const updatedAdmissions = saveHospitalAdmission(newAdmission);
    setAdmissions(updatedAdmissions);
    setBeds(getHospitalBeds()); // Bed status refreshed to Occupied
    setIsAdmitModalOpen(false);

    toast.success(`Inpatient ${newAdmission.english_name} successfully admitted to ${newAdmission.bed_name}`);
  };

  // Discharge Patient
  const handleDischarge = (adm: InpatientAdmission) => {
    if (confirm(`Discharge patient ${adm.english_name || adm.patient_name} from ${adm.bed_name}? The bed will enter sanitization cycle.`)) {
      const { admissions: updated } = dischargeHospitalPatient(adm.id);
      setAdmissions(updated);
      setBeds(getHospitalBeds());
      toast.success(`Patient discharged. Bed ${adm.bed_id} marked for Cleaning.`);
    }
  };

  // Filter Admitted Inpatients
  const filteredAdmissions = admissions.filter((adm) => {
    const matchesSearch =
      adm.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      (adm.english_name || "").toLowerCase().includes(search.toLowerCase()) ||
      adm.id.toLowerCase().includes(search.toLowerCase()) ||
      adm.bed_name.toLowerCase().includes(search.toLowerCase()) ||
      adm.bed_id.toLowerCase().includes(search.toLowerCase()) ||
      (adm.nid_number || "").includes(search);

    const matchesCondition =
      filterCondition === "All" ||
      adm.condition === filterCondition ||
      adm.status === filterCondition;

    const matchesWard =
      wardFilter === "All" ||
      adm.bed_type.toLowerCase().includes(wardFilter.toLowerCase()) ||
      adm.bed_name.toLowerCase().includes(wardFilter.toLowerCase());

    return matchesSearch && matchesCondition && matchesWard;
  });

  // Popup Options
  const conditionOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Patients", count: admissions.length },
    {
      value: "Stable",
      label: "Stable Condition",
      dotColor: "bg-emerald-500",
      count: admissions.filter((a) => a.condition === "Stable" && a.status === "Admitted").length,
    },
    {
      value: "Critical",
      label: "Critical Care",
      dotColor: "bg-rose-500",
      count: admissions.filter((a) => a.condition === "Critical" && a.status === "Admitted").length,
    },
    {
      value: "Observation",
      label: "Observation",
      dotColor: "bg-blue-500",
      count: admissions.filter((a) => a.condition === "Observation" && a.status === "Admitted").length,
    },
    {
      value: "Discharged",
      label: "Discharged Records",
      dotColor: "bg-slate-400",
      count: admissions.filter((a) => a.status === "Discharged").length,
    },
  ];

  const wardOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Ward Suites" },
    { value: "ICU", label: "ICU Critical Care" },
    { value: "CCU", label: "Cardiac CCU" },
    { value: "VIP Suite", label: "VIP Suites" },
    { value: "Deluxe Cabin", label: "Deluxe Cabins" },
    { value: "General Ward", label: "General Ward" },
  ];

  const availableBeds = beds.filter((b) => b.status === "Vacant");

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital Inpatient Admissions & Clinical Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Singapore Standard
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            1-Click National HealthPass database auto-import, bedside clinical vitals, and synchronized ward allocation.
          </p>
        </div>

        <button
          onClick={() => {
            setImportedPatientBadge(null);
            setIsAdmitModalOpen(true);
          }}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus size={18} />
          Admit Inpatient (1-Click Import)
        </button>
      </div>

      {/* Search & Filter Bar with Custom Popup Boxes */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, NID, bed unit, or admission ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
          <div className="w-full sm:w-56">
            <CustomSelect
              value={filterCondition}
              onChange={(val) => setFilterCondition(val)}
              options={conditionOptions}
              prefix="Condition:"
              icon={Activity}
              menuWidth="w-64"
            />
          </div>

          <div className="w-full sm:w-52">
            <CustomSelect
              value={wardFilter}
              onChange={(val) => setWardFilter(val)}
              options={wardOptions}
              prefix="Ward:"
              icon={BedDouble}
              menuWidth="w-56"
            />
          </div>
        </div>
      </div>

      {/* Inpatient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Admission ID</th>
                <th className="py-3 px-4">Patient Name & Demographics</th>
                <th className="py-3 px-4">Assigned Bed / Ward</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">HealthPass Verification</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAdmissions.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900">{adm.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">
                      {adm.english_name || adm.patient_name}
                      <span className="text-xs font-medium text-slate-400 ml-1.5">
                        ({adm.age}y, {adm.gender})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Blood: <strong className="text-rose-600">{adm.blood_group}</strong></span>
                      <span>•</span>
                      <span>NID: {adm.nid_number}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-700 text-xs block">{adm.bed_name}</span>
                    <span className="text-[11px] text-slate-400 font-medium">৳ {adm.bed_daily_rate.toLocaleString()}/day</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold">
                    {adm.attending_doctor}
                  </td>
                  <td className="py-3.5 px-4">
                    {adm.healthPassVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        <ShieldCheck size={12} /> National Verified
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        adm.status === "Discharged"
                          ? "bg-slate-100 text-slate-500"
                          : adm.condition === "Critical"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : adm.condition === "Stable"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {adm.status === "Discharged" ? "Discharged" : adm.condition}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedDossier(adm)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                      >
                        Clinical Dossier
                      </button>
                      {adm.status === "Admitted" && (
                        <button
                          onClick={() => handleDischarge(adm)}
                          className="text-xs font-bold text-slate-600 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                        >
                          Discharge
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1-Click Database Import & Inpatient Admission Modal */}
      <AnimatePresence>
        {isAdmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdmitModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8 custom-scrollbar border border-slate-200"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Admit Inpatient & Clinical Ward Allocation
                    </h3>
                    <p className="text-xs text-slate-500">
                      Auto-import patient demographics from National HealthPass database or manual register.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 1-Click National Database Search & Auto-Import Box */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 relative">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider mb-2">
                  <Zap size={15} className="text-emerald-600 fill-emerald-600" />
                  1-Click National Database Auto-Import (Smart Registry)
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Type patient name, NID, Smart Card UID, or phone number. Click on any record to automatically autofill all demographics, allergies, pacemaker, and emergency contacts!
                </p>

                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    placeholder="Search e.g. Al Amin, 1972 5590, 8472-1094, +880 1712..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-emerald-300 bg-white text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>

                {/* Live Dropdown Results */}
                {registryResults.length > 0 && (
                  <div className="mt-2 bg-white rounded-xl border border-emerald-300 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {registryResults.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => handleAutoImportPatient(match)}
                        className="p-3 hover:bg-emerald-50/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {match.blood_group}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                              {match.english_name || match.patient_name}
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                {match.gender}, {match.age}y
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <span>NID: {match.nid_number}</span>
                              <span>•</span>
                              <span>UID: {match.smart_card_uid}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="h-8 px-3 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                        >
                          Auto-Import <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Badge when Patient Imported */}
                {importedPatientBadge && (
                  <div className="mt-2.5 p-2 rounded-xl bg-white border border-emerald-400 flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Auto-Imported: <strong>{importedPatientBadge}</strong>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Autofilled 10+ Fields
                    </span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmitAdmission} className="mt-6 space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Patient Name (English) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.english_name}
                      onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
                      placeholder="e.g. Al Amin Sheikh"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Patient Name (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                      placeholder="e.g. আল আমিন শেখ"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* NID & Smart Card UID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      National NID Number
                    </label>
                    <input
                      type="text"
                      value={formData.nid_number}
                      onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                      placeholder="e.g. 1972 5590 1234 9876"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      HealthPass Smart Card UID
                    </label>
                    <input
                      type="text"
                      value={formData.smart_card_uid}
                      onChange={(e) => setFormData({ ...formData, smart_card_uid: e.target.value })}
                      placeholder="e.g. 8472-1094-8832-5501"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Demographics Row (Age, Gender, Blood, Phone) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white outline-none focus:border-emerald-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold text-rose-600 bg-white outline-none focus:border-emerald-500"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.personal_phone}
                      onChange={(e) => setFormData({ ...formData, personal_phone: e.target.value })}
                      placeholder="+880 1712..."
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Residential Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Permanent / Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House, Road, Area, Dhaka"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Bed / Ward Assignment Dropdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    Assign Hospital Bed / Inpatient Suite <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.bed_id}
                    onChange={(e) => setFormData({ ...formData, bed_id: e.target.value })}
                    className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Vacant Hospital Bed Suite --</option>
                    {availableBeds.map((bed) => (
                      <option key={bed.id} value={bed.id}>
                        {bed.id} • {bed.title} ({bed.category} - {bed.ward}) - ৳{bed.price.toLocaleString()}/day
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Showing available vacant beds from your hospital profile & bed inventory.
                  </p>
                </div>

                {/* Attending Doctor & Diagnosis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Attending Consultant / Doctor <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.attending_doctor}
                      onChange={(e) => setFormData({ ...formData, attending_doctor: e.target.value })}
                      placeholder="e.g. Prof. Dr. Anisur Rahman"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Clinical Condition Status
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as InpatientAdmission["condition"] })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white outline-none focus:border-emerald-500"
                    >
                      <option value="Stable">Stable</option>
                      <option value="Critical">Critical (ICU / High Risk)</option>
                      <option value="Observation">Observation (Post-Op / Vitals Monitoring)</option>
                    </select>
                  </div>
                </div>

                {/* Primary Clinical Diagnosis */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Primary Clinical Diagnosis / Admission Reason
                  </label>
                  <input
                    type="text"
                    value={formData.primary_diagnosis}
                    onChange={(e) => setFormData({ ...formData, primary_diagnosis: e.target.value })}
                    placeholder="e.g. Acute Coronary Syndrome, Uncontrolled Hypertension, Respiratory Distress"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Initial Admission Deposit */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Initial Admission Deposit (৳ BDT)
                  </label>
                  <input
                    type="number"
                    value={formData.initial_deposit}
                    onChange={(e) => setFormData({ ...formData, initial_deposit: Number(e.target.value) })}
                    placeholder="20000"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-black text-emerald-700 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdmitModalOpen(false)}
                    className="h-11 px-5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Confirm Admission & Occupy Bed
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clinical Dossier View Modal */}
      <AnimatePresence>
        {selectedDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDossier(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200 custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Inpatient Clinical Dossier
                    </h3>
                    <p className="text-xs text-slate-500">
                      ID: {selectedDossier.id} • Admitted {selectedDossier.admission_date} ({selectedDossier.admission_time})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDossier(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {/* Patient Summary Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {selectedDossier.english_name || selectedDossier.patient_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedDossier.gender} • {selectedDossier.age} Years • Blood: <strong className="text-rose-600">{selectedDossier.blood_group}</strong>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      NID: <strong>{selectedDossier.nid_number}</strong> | UID: {selectedDossier.smart_card_uid}
                    </p>
                  </div>
                  {selectedDossier.healthPassVerified && (
                    <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <ShieldCheck size={16} /> Verified
                    </span>
                  )}
                </div>

                {/* Bed & Medical Specs */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block">Assigned Ward</span>
                    <strong className="text-slate-900 text-sm block mt-0.5">{selectedDossier.bed_name}</strong>
                    <span className="text-emerald-700 font-bold">৳ {selectedDossier.bed_daily_rate.toLocaleString()}/day</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block">Attending Physician</span>
                    <strong className="text-slate-900 text-sm block mt-0.5">{selectedDossier.attending_doctor}</strong>
                    <span className="text-blue-700 font-bold">{selectedDossier.condition} Condition</span>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Primary Diagnosis & Admission Reason
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedDossier.primary_diagnosis}
                  </p>
                </div>

                {/* Emergency Contact & Allergies */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Emergency Contact:</span>
                    <strong className="text-slate-900">{selectedDossier.emergency_contact_name} ({selectedDossier.emergency_contact_relation}) - {selectedDossier.emergency_contact_phone}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pacemaker / Implant:</span>
                    <strong className={selectedDossier.has_pacemaker ? "text-rose-600" : "text-slate-700"}>
                      {selectedDossier.has_pacemaker ? "YES (Cardiac Pacemaker Active)" : "No"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Allergies:</span>
                    <strong className="text-slate-900">
                      {selectedDossier.allergies && selectedDossier.allergies.length > 0
                        ? selectedDossier.allergies.join(", ")
                        : "None Recorded"}
                    </strong>
                  </div>
                </div>

                {/* Deposit Paid */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800">Initial Admission Deposit:</span>
                  <strong className="text-base font-black text-emerald-700">৳ {selectedDossier.initial_deposit.toLocaleString()}</strong>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Link
                  href="/hospital/dashboard/billing"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  View Inpatient Running Bill →
                </Link>
                <button
                  onClick={() => setSelectedDossier(null)}
                  className="h-10 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
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

export default function HospitalPatientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Loading Inpatient Registry...</div>}>
      <InpatientConsoleContent />
    </Suspense>
  );
}
