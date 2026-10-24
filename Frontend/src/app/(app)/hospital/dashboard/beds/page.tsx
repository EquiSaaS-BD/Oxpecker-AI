"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BedDouble,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Building,
  Camera,
  Bath,
  Edit2,
  Eye,
  ClipboardCheck,
  UserPlus,
  CalendarDays,
  Receipt,
  X,
  Clock,
  Phone,
  ShieldAlert,
  FileText,
  Check,
  ChevronRight,
  HeartPulse,
  Activity,
  Layers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import type {
  BedGig,
  BedCategory,
  BedStatus,
  BedBooking,
  InpatientAdmission,
  HospitalDoctor,
} from "@/types/hospital-hms";
import {
  getHospitalBeds,
  updateBedStatus,
  getHospitalBookings,
  updateBookingStatus,
  getHospitalAdmissions,
  saveHospitalAdmission,
  dischargeHospitalPatient,
  searchNationalPatientRegistry,
  getHospitalDoctors,
  type RegistrySearchMatch,
} from "@/lib/hospital-hms";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

type HubTab = "beds" | "bookings" | "inpatients" | "gigs";

const BED_CATEGORIES: BedCategory[] = [
  "ICU",
  "CCU",
  "VIP Suite",
  "Deluxe Cabin",
  "General Ward",
  "NICU",
  "HDU",
  "Isolation",
];

const CATEGORY_FILTER_OPTIONS: CustomSelectOption<string>[] = [
  { value: "All", label: "All Categories" },
  ...BED_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const STATUS_FILTER_OPTIONS: CustomSelectOption<string>[] = [
  { value: "All", label: "All Statuses" },
  { value: "Vacant", label: "Vacant (Available)", dotColor: "bg-emerald-500" },
  { value: "Occupied", label: "Occupied (Inpatient)", dotColor: "bg-amber-500" },
  { value: "Cleaning", label: "Cleaning Cycle", dotColor: "bg-cyan-500" },
  { value: "Maintenance", label: "Maintenance", dotColor: "bg-rose-500" },
];

function BedHubContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as HubTab) || "beds";

  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);
  const [beds, setBeds] = useState<BedGig[]>([]);
  const [bookings, setBookings] = useState<BedBooking[]>([]);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);

  // Filtering states for Tab 1 (Beds)
  const [bedSearch, setBedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Filtering states for Tab 2 (Bookings)
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("All");
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState("All");

  // Filtering states for Tab 3 (Inpatients)
  const [inpatientSearch, setInpatientSearch] = useState("");
  const [inpatientConditionFilter, setInpatientConditionFilter] = useState("All");
  const [inpatientWardFilter, setInpatientWardFilter] = useState("All");

  // Quick Admit Modal State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [targetBedId, setTargetBedId] = useState("");
  const [patientRegistryQuery, setPatientRegistryQuery] = useState("");
  const [registryMatches, setRegistryMatches] = useState<RegistrySearchMatch[]>([]);
  
  // Admit Form Fields
  const [admitPatientName, setAdmitPatientName] = useState("");
  const [admitEnglishName, setAdmitEnglishName] = useState("");
  const [admitPhone, setAdmitPhone] = useState("");
  const [admitNid, setAdmitNid] = useState("");
  const [admitUid, setAdmitUid] = useState("");
  const [admitAge, setAdmitAge] = useState<number>(45);
  const [admitGender, setAdmitGender] = useState<"Male" | "Female" | "Other">("Male");
  const [admitBloodGroup, setAdmitBloodGroup] = useState("O+");
  const [admitDiagnosis, setAdmitDiagnosis] = useState("");
  const [admitCondition, setAdmitCondition] = useState<"Stable" | "Critical" | "Observation">("Stable");
  const [admitDoctor, setAdmitDoctor] = useState("Prof. Dr. Anisur Rahman");
  const [admitDeposit, setAdmitDeposit] = useState<number>(20000);
  const [isSubmittingAdmit, setIsSubmittingAdmit] = useState(false);

  // Selected Dossier State
  const [selectedDossier, setSelectedDossier] = useState<InpatientAdmission | null>(null);

  // Load all telemetry on mount
  const refreshAllData = () => {
    setBeds(getHospitalBeds());
    setBookings(getHospitalBookings());
    setAdmissions(getHospitalAdmissions());
    setDoctors(getHospitalDoctors());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Update active tab if query param changes
  useEffect(() => {
    const tabParam = searchParams.get("tab") as HubTab;
    if (tabParam && ["beds", "bookings", "inpatients", "gigs"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Census Calculations
  const totalCount = beds.length;
  const occupiedCount = beds.filter((b) => b.status === "Occupied").length;
  const vacantCount = beds.filter((b) => b.status === "Vacant").length;
  const maintenanceCount = beds.filter(
    (b) => b.status === "Maintenance" || b.status === "Cleaning"
  ).length;
  const occupancyPercentage =
    totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0;

  const vacantBeds = useMemo(() => beds.filter((b) => b.status === "Vacant"), [beds]);
  const activeBookingsCount = bookings.filter(
    (b) => b.booking_status !== "Cancelled" && b.booking_status !== "Checked-In"
  ).length;
  const activeAdmissionsCount = admissions.filter((a) => a.status === "Admitted").length;

  // Filtered Beds (Tab 1)
  const filteredBeds = beds.filter((b) => {
    const q = bedSearch.toLowerCase();
    const matchesSearch =
      b.id.toLowerCase().includes(q) ||
      b.title.toLowerCase().includes(q) ||
      b.ward.toLowerCase().includes(q) ||
      (b.roomNumber || "").toLowerCase().includes(q) ||
      (b.floor || "").toLowerCase().includes(q) ||
      (b.currentPatientName || "").toLowerCase().includes(q);

    const matchesCategory = selectedCategory === "All" || b.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || b.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtered Bookings (Tab 2)
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      bookingStatusFilter === "All" || b.booking_status === bookingStatusFilter;
    const matchesCat =
      bookingCategoryFilter === "All" ||
      b.bed_category.toLowerCase().includes(bookingCategoryFilter.toLowerCase());
    const q = bookingSearch.toLowerCase();
    const matchesQuery =
      !q.trim() ||
      b.id.toLowerCase().includes(q) ||
      b.patient_name.toLowerCase().includes(q) ||
      (b.patient_phone || "").includes(q) ||
      b.bed_id.toLowerCase().includes(q) ||
      b.bed_category.toLowerCase().includes(q);

    return matchesStatus && matchesCat && matchesQuery;
  });

  // Filtered Inpatients (Tab 3)
  const filteredInpatients = admissions.filter((a) => {
    const matchesCondition =
      inpatientConditionFilter === "All" ||
      a.condition === inpatientConditionFilter ||
      a.status === inpatientConditionFilter;
    const matchesWard =
      inpatientWardFilter === "All" ||
      a.bed_type.toLowerCase().includes(inpatientWardFilter.toLowerCase()) ||
      a.bed_name.toLowerCase().includes(inpatientWardFilter.toLowerCase());
    const q = inpatientSearch.toLowerCase();
    const matchesQuery =
      !q.trim() ||
      a.id.toLowerCase().includes(q) ||
      a.patient_name.toLowerCase().includes(q) ||
      (a.english_name || "").toLowerCase().includes(q) ||
      a.bed_id.toLowerCase().includes(q) ||
      a.attending_doctor.toLowerCase().includes(q) ||
      a.primary_diagnosis.toLowerCase().includes(q);

    return matchesCondition && matchesWard && matchesQuery;
  });

  // Options for Tab 2 Bookings
  const bookingStatusOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Statuses", count: bookings.length },
    { value: "Checked-In", label: "Checked-In", dotColor: "bg-purple-500", count: bookings.filter((b) => b.booking_status === "Checked-In").length },
    { value: "Confirmed", label: "Confirmed", dotColor: "bg-blue-500", count: bookings.filter((b) => b.booking_status === "Confirmed").length },
    { value: "Pending", label: "Pending Review", dotColor: "bg-amber-500", count: bookings.filter((b) => b.booking_status === "Pending").length },
    { value: "Completed", label: "Completed", dotColor: "bg-slate-500", count: bookings.filter((b) => b.booking_status === "Completed").length },
  ];

  const bookingCategoryOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Categories" },
    ...BED_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  // Options for Tab 3 Inpatients
  const inpatientConditionOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Conditions", count: admissions.length },
    { value: "Stable", label: "Stable", dotColor: "bg-emerald-500", count: admissions.filter((a) => a.condition === "Stable").length },
    { value: "Critical", label: "Critical Care", dotColor: "bg-rose-500", count: admissions.filter((a) => a.condition === "Critical").length },
    { value: "Observation", label: "Observation", dotColor: "bg-blue-500", count: admissions.filter((a) => a.condition === "Observation").length },
  ];

  const inpatientWardOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Ward Suites" },
    ...BED_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  // Bed Status Switcher
  const handleQuickStatusChange = (bedId: string, status: BedStatus) => {
    const updated = updateBedStatus(bedId, status);
    setBeds(updated);
    toast.info(`Bed ${bedId} updated to ${status}`);
  };

  // 1-Click Check-In from Advance Booking to Live Admission
  const handleCheckInBooking = (booking: BedBooking) => {
    const matchingBed = beds.find((b) => b.id === booking.bed_id);
    if (!matchingBed) {
      toast.error(`Assigned bed ${booking.bed_id} not found in inventory`);
      return;
    }
    if (matchingBed.status === "Occupied") {
      toast.error(`Bed ${booking.bed_id} is currently occupied by another patient`);
      return;
    }

    // 1. Mark booking as Checked-In
    updateBookingStatus(booking.id, "Checked-In");

    // 2. Create Inpatient Admission
    const newAdmission: InpatientAdmission = {
      id: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_id: booking.patient_nid || `user-${Math.floor(100 + Math.random() * 900)}`,
      patient_name: booking.patient_name,
      english_name: booking.patient_name,
      smart_card_uid: `HP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      personal_phone: booking.patient_phone,
      date_of_birth: "1985-05-10",
      age: booking.patient_age || 40,
      gender: booking.patient_gender || "Male",
      blood_group: booking.patient_blood_group || "O+",
      address: "Dhaka, Bangladesh",
      allergies: [],
      has_pacemaker: false,
      emergency_contact_name: "Family Contact",
      emergency_contact_phone: booking.patient_phone,
      emergency_contact_relation: "Guardian",
      bed_id: booking.bed_id,
      bed_name: booking.bed_name || `${booking.bed_category} Suite ${booking.bed_id}`,
      bed_type: booking.bed_category,
      bed_daily_rate: booking.bed_daily_rate,
      admission_date: new Date().toISOString().split("T")[0],
      admission_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attending_doctor: booking.attending_doctor || "Prof. Dr. Anisur Rahman",
      primary_diagnosis: booking.diagnosis || "Elective Admission from Reservation",
      condition: "Stable",
      initial_deposit: booking.paid_amount || 10000,
      status: "Admitted",
      healthPassVerified: true,
    };

    saveHospitalAdmission(newAdmission);

    // 3. Mark Bed Occupied
    updateBedStatus(booking.bed_id, "Occupied", booking.patient_name);

    refreshAllData();
    toast.success(`Patient ${booking.patient_name} successfully admitted into ${booking.bed_id}!`);
  };

  // 1-Click Discharge Patient
  const handleDischargePatient = (admissionId: string) => {
    const adm = admissions.find((a) => a.id === admissionId);
    if (!adm) return;
    if (confirm(`Confirm discharge for ${adm.english_name || adm.patient_name} from Bed ${adm.bed_id}?`)) {
      dischargeHospitalPatient(admissionId);
      refreshAllData();
      toast.success(`Patient discharged. Bed ${adm.bed_id} transitioned to Cleaning Cycle.`);
    }
  };

  // Open Quick Admit Modal
  const openAdmitModal = (bedIdToSelect?: string) => {
    if (bedIdToSelect) {
      setTargetBedId(bedIdToSelect);
    } else if (vacantBeds.length > 0) {
      setTargetBedId(vacantBeds[0].id);
    } else {
      setTargetBedId("");
    }
    setPatientRegistryQuery("");
    setRegistryMatches([]);
    setAdmitPatientName("");
    setAdmitEnglishName("");
    setAdmitPhone("");
    setAdmitNid("");
    setAdmitUid("");
    setAdmitDiagnosis("");
    setIsAdmitModalOpen(true);
  };

  // Patient Registry Search Auto-Fill
  const handleRegistrySearchChange = (query: string) => {
    setPatientRegistryQuery(query);
    if (query.trim().length >= 2) {
      const matches = searchNationalPatientRegistry(query);
      setRegistryMatches(matches);
    } else {
      setRegistryMatches([]);
    }
  };

  const handleSelectRegistryPatient = (p: RegistrySearchMatch) => {
    setAdmitPatientName(p.english_name || p.patient_name);
    setAdmitEnglishName(p.english_name || p.patient_name);
    setAdmitPhone(p.personal_phone || "");
    setAdmitNid(p.nid_number || "");
    setAdmitUid(p.smart_card_uid || "");
    setAdmitAge(p.age || 40);
    setAdmitGender(p.gender as any);
    setAdmitBloodGroup(p.blood_group || "O+");
    setRegistryMatches([]);
    setPatientRegistryQuery("");
    toast.success(`Imported records for ${p.english_name || p.patient_name}`);
  };

  // Submit Quick Admission
  const handleSubmitAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBedId) {
      toast.error("Please select a vacant bed suite");
      return;
    }
    if (!admitPatientName.trim()) {
      toast.error("Please provide patient name");
      return;
    }

    setIsSubmittingAdmit(true);
    const chosenBed = beds.find((b) => b.id === targetBedId);

    const newAdm: InpatientAdmission = {
      id: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_id: `user-${Math.floor(100 + Math.random() * 900)}`,
      patient_name: admitPatientName.trim(),
      english_name: admitEnglishName.trim() || admitPatientName.trim(),
      nid_number: admitNid.trim() || undefined,
      smart_card_uid: admitUid.trim() || `HP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      personal_phone: admitPhone.trim() || "+880 1700-000000",
      date_of_birth: "1980-01-01",
      age: admitAge,
      gender: admitGender,
      blood_group: admitBloodGroup,
      address: "Dhaka, Bangladesh",
      allergies: [],
      has_pacemaker: false,
      emergency_contact_name: "Guardian",
      emergency_contact_phone: admitPhone.trim() || "+880 1700-000000",
      emergency_contact_relation: "Relative",
      bed_id: targetBedId,
      bed_name: chosenBed?.title || `${chosenBed?.category || "Clinical"} Bed ${targetBedId}`,
      bed_type: chosenBed?.category || "General Ward",
      bed_daily_rate: chosenBed?.price || 5000,
      admission_date: new Date().toISOString().split("T")[0],
      admission_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attending_doctor: admitDoctor,
      primary_diagnosis: admitDiagnosis.trim() || "Under Clinical Investigation",
      condition: admitCondition,
      initial_deposit: admitDeposit,
      status: "Admitted",
      healthPassVerified: !!admitUid,
    };

    saveHospitalAdmission(newAdm);
    updateBedStatus(targetBedId, "Occupied", newAdm.english_name || newAdm.patient_name);

    refreshAllData();
    setIsSubmittingAdmit(false);
    setIsAdmitModalOpen(false);
    toast.success(`Patient admitted to Bed ${targetBedId}!`);
  };

  return (
    <div className="w-full space-y-6 pb-16">
      <Toaster position="top-right" richColors />

      {/* 1. Master Command Center Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bed & Inpatient Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-200">
              Unified Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time ward census, advance bed reservations, active inpatient admissions, and public gig showcase.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openAdmitModal()}
            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus size={16} />
            Quick Admit Patient
          </button>
          <Link
            href="/hospital/dashboard/beds/new"
            className="h-11 px-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus size={16} />
            Add New Bed Suite
          </Link>
          <button
            onClick={refreshAllData}
            title="Refresh Registry"
            className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 2. Top Census Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Ward Beds */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Total Clinical Beds
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BedDouble size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-slate-900">{totalCount}</h3>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
              Active Hospital Inventory
            </p>
          </div>
        </div>

        {/* Card 2: Vacant (Ready) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Vacant & Ready
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-emerald-700">{vacantCount}</h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
              Instant Admission Ready
            </p>
          </div>
        </div>

        {/* Card 3: Admitted Inpatients */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Admitted Inpatients
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-slate-900">{occupiedCount}</h3>
            <p className="text-[11px] font-bold text-amber-600 mt-0.5">
              {occupancyPercentage}% Ward Occupancy
            </p>
          </div>
        </div>

        {/* Card 4: Advance Bookings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Advance Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ClipboardCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-purple-700">{activeBookingsCount}</h3>
            <p className="text-[11px] font-bold text-purple-600 mt-0.5">
              Pending Check-In
            </p>
          </div>
        </div>
      </div>

      {/* 3. The Unified 4-Tab Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          <button
            onClick={() => setActiveTab("beds")}
            className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "beds"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BedDouble size={16} />
            <span>Live Ward Beds</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "beds" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ClipboardCheck size={16} />
            <span>Advance Bookings</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "bookings" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
              }`}
            >
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inpatients")}
            className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "inpatients"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users size={16} />
            <span>Active Inpatients</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "inpatients" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
              }`}
            >
              {activeAdmissionsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("gigs")}
            className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "gigs"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Sparkles size={16} />
            <span>Marketplace Gigs</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "gigs" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              Showcase
            </span>
          </button>
        </div>
      </div>

      {/* 4. TAB 1: LIVE WARD GRID */}
      {activeTab === "beds" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={bedSearch}
                onChange={(e) => setBedSearch(e.target.value)}
                placeholder="Search Bed Code, Room No, Ward, Floor, Inpatient..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full md:w-auto shrink-0">
              <div className="w-full sm:w-52">
                <CustomSelect
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val)}
                  options={CATEGORY_FILTER_OPTIONS}
                  prefix="Category:"
                  icon={Layers}
                  menuWidth="w-56"
                />
              </div>

              <div className="w-full sm:w-52">
                <CustomSelect
                  value={selectedStatus}
                  onChange={(val) => setSelectedStatus(val)}
                  options={STATUS_FILTER_OPTIONS}
                  prefix="Status:"
                  icon={CheckCircle2}
                  menuWidth="w-56"
                />
              </div>
            </div>
          </div>

          {/* Bed Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBeds.map((bed) => {
              const isVacant = bed.status === "Vacant";
              const isOccupied = bed.status === "Occupied";
              const isCleaning = bed.status === "Cleaning";

              return (
                <div
                  key={bed.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all"
                >
                  {/* Photo Top Header */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={(bed.images && bed.images[0]) || bed.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"}
                      alt={bed.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Status Pill */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-md ${
                          isVacant
                            ? "bg-emerald-600 text-white"
                            : isOccupied
                            ? "bg-amber-600 text-white"
                            : isCleaning
                            ? "bg-cyan-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        ● {bed.status}
                      </span>
                    </div>

                    {/* Category Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/90 text-white shadow-md backdrop-blur-md">
                        {bed.category}
                      </span>
                    </div>

                    {/* Bottom overlay: Room & Floor */}
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-bold">
                      <span>{bed.floor} • {bed.roomNumber || "Suite"}</span>
                      <span className="text-[11px] text-emerald-300">BDT {bed.price.toLocaleString()} /day</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/hospital/dashboard/beds/${encodeURIComponent(bed.id)}`}
                            className="text-lg font-black text-slate-900 hover:text-emerald-600 transition-colors"
                          >
                            {bed.id}
                          </Link>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{bed.ward}</p>
                        </div>

                        {/* Quick Status Select */}
                        <select
                          value={bed.status}
                          onChange={(e) => handleQuickStatusChange(bed.id, e.target.value as BedStatus)}
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border outline-none cursor-pointer shrink-0 ${
                            isVacant
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : isOccupied
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : isCleaning
                              ? "bg-cyan-50 text-cyan-800 border-cyan-300"
                              : "bg-rose-50 text-rose-800 border-rose-300"
                          }`}
                        >
                          <option value="Vacant">Vacant</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Cleaning">Cleaning</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>

                      {/* Current Inpatient Box if Occupied */}
                      {isOccupied && bed.currentPatientName && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 block">
                            Current Inpatient
                          </span>
                          <p className="text-xs font-black text-slate-900 mt-0.5 truncate">
                            {bed.currentPatientName}
                          </p>
                        </div>
                      )}

                      {/* Amenities Pills */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {bed.features.slice(0, 3).map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            {feat}
                          </span>
                        ))}
                        {bed.features.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{bed.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/hospital/dashboard/beds/${encodeURIComponent(bed.id)}`}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} /> View
                      </Link>

                      {isVacant ? (
                        <button
                          type="button"
                          onClick={() => openAdmitModal(bed.id)}
                          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                        >
                          <UserPlus size={12} /> Quick Admit
                        </button>
                      ) : isCleaning ? (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(bed.id, "Vacant")}
                          className="h-8 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Mark Ready
                        </button>
                      ) : isOccupied ? (
                        <button
                          type="button"
                          onClick={() => {
                            const matchAdm = admissions.find((a) => a.bed_id === bed.id && a.status === "Admitted");
                            if (matchAdm) handleDischargePatient(matchAdm.id);
                            else handleQuickStatusChange(bed.id, "Cleaning");
                          }}
                          className="h-8 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                        >
                          Discharge
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(bed.id, "Vacant")}
                          className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Set Vacant
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBeds.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              No clinical bed suites match your search and filter criteria.
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: ADVANCE RESERVATIONS (BOOKINGS) */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search patient, phone, booking ID, bed code..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
              <div className="w-full sm:w-56">
                <CustomSelect
                  value={bookingStatusFilter}
                  onChange={(val) => setBookingStatusFilter(val)}
                  options={bookingStatusOptions}
                  prefix="Status:"
                  icon={CheckCircle2}
                  menuWidth="w-60"
                />
              </div>

              <div className="w-full sm:w-52">
                <CustomSelect
                  value={bookingCategoryFilter}
                  onChange={(val) => setBookingCategoryFilter(val)}
                  options={bookingCategoryOptions}
                  prefix="Category:"
                  icon={Layers}
                  menuWidth="w-56"
                />
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                    <th className="py-3 px-5">Booking ID</th>
                    <th className="py-3 px-5">Patient Details</th>
                    <th className="py-3 px-5">Reserved Suite</th>
                    <th className="py-3 px-5">Check-In Date</th>
                    <th className="py-3 px-5">Stay Duration</th>
                    <th className="py-3 px-5">Advance Deposit</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const isCheckedIn = b.booking_status === "Checked-In";
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors font-medium">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{b.id}</td>
                        <td className="py-3.5 px-5">
                          <p className="font-bold text-slate-900 text-sm">{b.patient_name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={11} /> {b.patient_phone}
                          </p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {b.bed_id}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{b.bed_category}</span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700">{b.check_in_date}</td>
                        <td className="py-3.5 px-5 text-slate-700">{b.duration_days} Days</td>
                        <td className="py-3.5 px-5">
                          <span className="font-black text-slate-900">BDT {b.paid_amount.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">{b.payment_method}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isCheckedIn
                                ? "bg-emerald-50 text-emerald-700"
                                : b.booking_status === "Confirmed"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            ● {b.booking_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {!isCheckedIn ? (
                            <button
                              type="button"
                              onClick={() => handleCheckInBooking(b)}
                              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 size={13} />
                              Check-In & Admit
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">Admitted in Ward</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No advance bed bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: ACTIVE INPATIENT ADMISSIONS */}
      {activeTab === "inpatients" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inpatientSearch}
                onChange={(e) => setInpatientSearch(e.target.value)}
                placeholder="Search patient, doctor, diagnosis, bed code..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
              <div className="w-full sm:w-52">
                <CustomSelect
                  value={inpatientConditionFilter}
                  onChange={(val) => setInpatientConditionFilter(val)}
                  options={inpatientConditionOptions}
                  prefix="Condition:"
                  icon={Activity}
                  menuWidth="w-56"
                />
              </div>

              <div className="w-full sm:w-52">
                <CustomSelect
                  value={inpatientWardFilter}
                  onChange={(val) => setInpatientWardFilter(val)}
                  options={inpatientWardOptions}
                  prefix="Ward:"
                  icon={BedDouble}
                  menuWidth="w-56"
                />
              </div>
            </div>

            <button
              onClick={() => openAdmitModal()}
              className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <UserPlus size={16} /> Admit Patient
            </button>
          </div>

          {/* Inpatients Census Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                    <th className="py-3 px-5">Admission ID</th>
                    <th className="py-3 px-5">Patient Name</th>
                    <th className="py-3 px-5">Assigned Suite</th>
                    <th className="py-3 px-5">Attending Doctor</th>
                    <th className="py-3 px-5">Condition</th>
                    <th className="py-3 px-5">Admit Date</th>
                    <th className="py-3 px-5">Deposit</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInpatients.map((adm) => {
                    const isAdmitted = adm.status === "Admitted";
                    return (
                      <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors font-medium">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{adm.id}</td>
                        <td className="py-3.5 px-5">
                          <p className="font-bold text-slate-900 text-sm">{adm.english_name || adm.patient_name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">UID: {adm.smart_card_uid}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {adm.bed_id}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{adm.bed_type}</span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700">{adm.attending_doctor}</td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              adm.condition === "Critical"
                                ? "bg-rose-50 text-rose-700"
                                : adm.condition === "Stable"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            ● {adm.condition}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">{adm.admission_date}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          BDT {adm.initial_deposit.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedDossier(adm)}
                              className="h-7 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Dossier
                            </button>
                            {isAdmitted && (
                              <button
                                type="button"
                                onClick={() => handleDischargePatient(adm.id)}
                                className="h-7 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                              >
                                Discharge
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredInpatients.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No inpatient admissions matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 4: MARKETPLACE GIGS SHOWCASE */}
      {activeTab === "gigs" && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Public Bed Gigs & Marketplace Showcase</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These cards represent how patient app users view and book your hospital suites on Oxpecker AI.
              </p>
            </div>
            <Link
              href="/hospital/dashboard/beds/new"
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus size={15} /> Add New Gig Suite
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {beds.map((bed) => (
              <div
                key={bed.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full bg-slate-900">
                  <img
                    src={(bed.images && bed.images[0]) || bed.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"}
                    alt={bed.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {bed.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    BDT {bed.price.toLocaleString()} /day
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900">{bed.title}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">{bed.ward} • {bed.roomNumber}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2">{bed.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {bed.images?.length || 1} Photos • {bed.features.length} Amenities
                    </span>
                    <Link
                      href={`/hospital/dashboard/beds/${encodeURIComponent(bed.id)}`}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      Edit Suite <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. MODAL: QUICK ADMIT INPATIENT */}
      <AnimatePresence>
        {isAdmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Quick Patient Admission</h3>
                    <p className="text-xs text-slate-500">Assign a vacant clinical bed and initiate inpatient care</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Patient Registry Search Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Search HealthPass UID, NID or Phone (Auto-Fill Record)
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={patientRegistryQuery}
                    onChange={(e) => handleRegistrySearchChange(e.target.value)}
                    placeholder="e.g. Al Amin, 1972 5590, or 01712..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-emerald-500"
                  />
                </div>

                {registryMatches.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {registryMatches.map((match) => (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => handleSelectRegistryPatient(match)}
                        className="w-full p-2.5 text-left hover:bg-emerald-50/60 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {match.english_name || match.patient_name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            UID: {match.smart_card_uid} • {match.personal_phone}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Import
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Admission Form */}
              <form onSubmit={handleSubmitAdmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={admitPatientName}
                      onChange={(e) => {
                        setAdmitPatientName(e.target.value);
                        setAdmitEnglishName(e.target.value);
                      }}
                      placeholder="e.g. Al Amin Sheikh"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Assign Vacant Bed Suite <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={targetBedId}
                      onChange={(e) => setTargetBedId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white outline-none focus:border-emerald-500"
                    >
                      {vacantBeds.map((vb) => (
                        <option key={vb.id} value={vb.id}>
                          {vb.id} — {vb.category} ({vb.ward}) • BDT {vb.price.toLocaleString()}/day
                        </option>
                      ))}
                      {vacantBeds.length === 0 && (
                        <option value="">No vacant beds available</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={admitPhone}
                      onChange={(e) => setAdmitPhone(e.target.value)}
                      placeholder="+880 1712-345678"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Attending Doctor
                    </label>
                    <select
                      value={admitDoctor}
                      onChange={(e) => setAdmitDoctor(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white outline-none focus:border-emerald-500"
                    >
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.name}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))}
                      <option value="Prof. Dr. Anisur Rahman">Prof. Dr. Anisur Rahman</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Condition
                    </label>
                    <select
                      value={admitCondition}
                      onChange={(e) => setAdmitCondition(e.target.value as any)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none focus:border-emerald-500"
                    >
                      <option value="Stable">Stable</option>
                      <option value="Critical">Critical</option>
                      <option value="Observation">Observation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Primary Diagnosis
                    </label>
                    <input
                      type="text"
                      value={admitDiagnosis}
                      onChange={(e) => setAdmitDiagnosis(e.target.value)}
                      placeholder="e.g. Acute Coronary Syndrome"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Initial Admission Deposit (BDT)
                    </label>
                    <input
                      type="number"
                      value={admitDeposit}
                      onChange={(e) => setAdmitDeposit(Number(e.target.value))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-black text-emerald-700 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdmitModalOpen(false)}
                    className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdmit || vacantBeds.length === 0}
                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    Confirm & Admit Patient
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. MODAL: PATIENT DOSSIER */}
      <AnimatePresence>
        {selectedDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                    Inpatient Medical Dossier
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {selectedDossier.english_name || selectedDossier.patient_name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDossier(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-bold block">Admission ID</span>
                    <strong className="text-slate-900 font-mono text-sm">{selectedDossier.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Assigned Suite</span>
                    <strong className="text-emerald-700 text-sm">{selectedDossier.bed_id} ({selectedDossier.bed_type})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">HealthPass UID</span>
                    <strong className="text-slate-900 font-mono">{selectedDossier.smart_card_uid}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Attending Doctor</span>
                    <strong className="text-slate-900">{selectedDossier.attending_doctor}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Clinical Diagnosis & Status
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{selectedDossier.primary_diagnosis}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px]">
                      Condition: {selectedDossier.condition}
                    </span>
                    <span className="text-slate-400">• Admitted on {selectedDossier.admission_date}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Link
                  href="/hospital/dashboard/billing"
                  className="h-10 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Receipt size={14} /> Open Inpatient Bill
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedDossier(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BedManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Bed & Inpatient Hub...</div>}>
      <BedHubContent />
    </Suspense>
  );
}
