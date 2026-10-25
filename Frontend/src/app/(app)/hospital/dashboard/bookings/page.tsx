"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  BedDouble,
  UserCheck,
  CreditCard,
  Building,
  Sparkles,
  Phone,
  DollarSign,
  User,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Receipt,
  ArrowRight,
  X,
  AlertTriangle,
  Layers,
  Filter,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import type {
  BedBooking,
  BookingStatus,
  BookingPaymentStatus,
  PaymentMethod,
  BedGig,
} from "@/types/hospital-hms";
import {
  getHospitalBookings,
  saveHospitalBooking,
  updateBookingStatus,
  getHospitalBeds,
  updateBedStatus,
  searchNationalPatientRegistry,
} from "@/lib/hospital-hms";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";
import { BookingTableRowSkeleton } from "@/components/hospital/Skeleton";

export default function BookingManagementPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BedBooking[]>([]);
  const [beds, setBeds] = useState<BedGig[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [wardFilter, setWardFilter] = useState<string>("All");

  // Pagination State (50 patients per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  // New Booking Modal State
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [registryQuery, setRegistryQuery] = useState("");
  const [registryResults, setRegistryResults] = useState<any[]>([]);

  // Booking Form State
  const [selectedBedId, setSelectedBedId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientNid, setPatientNid] = useState("");
  const [patientAge, setPatientAge] = useState<number>(35);
  const [patientGender, setPatientGender] = useState("Male");
  const [patientBloodGroup, setPatientBloodGroup] = useState("O+");
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split("T")[0]);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bKash");
  const [depositAmount, setDepositAmount] = useState<number>(10000);
  const [transactionRef, setTransactionRef] = useState("");
  const [attendingDoctor, setAttendingDoctor] = useState("Prof. Dr. Anisur Rahman");
  const [diagnosis, setDiagnosis] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // Load Data on Mount
  const refreshAll = () => {
    setBookings(getHospitalBookings());
    setBeds(getHospitalBeds());
  };

  useEffect(() => {
    refreshAll();
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Reset page to 1 whenever search, category, or ward filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, wardFilter]);

  // Vacant beds list
  const vacantBeds = useMemo(() => beds.filter((b) => b.status === "Vacant"), [beds]);
  const currentBedObj = useMemo(
    () => beds.find((b) => b.id === selectedBedId) || vacantBeds[0],
    [beds, selectedBedId, vacantBeds]
  );
  const calculatedTotalAmount = (currentBedObj ? currentBedObj.price : 5000) * (durationDays || 1);

  // Global KPIs across full dataset
  const totalCount = bookings.length;
  const checkedInCount = bookings.filter((b) => b.booking_status === "Checked-In").length;
  const pendingCount = bookings.filter((b) => b.booking_status === "Pending").length;
  const confirmedCount = bookings.filter((b) => b.booking_status === "Confirmed").length;
  const completedCount = bookings.filter((b) => b.booking_status === "Completed").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paid_amount || 0), 0);

  // Filtered Bookings for the Unified Table
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Category Switcher Filter
      if (statusFilter !== "All" && b.booking_status !== statusFilter) {
        return false;
      }

      // 2. Ward Filter
      if (wardFilter !== "All" && !b.bed_category.toLowerCase().includes(wardFilter.toLowerCase())) {
        return false;
      }

      // 3. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          b.id.toLowerCase().includes(q) ||
          b.patient_name.toLowerCase().includes(q) ||
          b.patient_phone.includes(q) ||
          (b.patient_nid || "").includes(q) ||
          b.bed_id.toLowerCase().includes(q) ||
          b.bed_category.toLowerCase().includes(q) ||
          (b.diagnosis || "").toLowerCase().includes(q) ||
          b.attending_doctor.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [bookings, statusFilter, wardFilter, search]);

  // Pagination calculations (50 patients per page)
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Popup Category Filter Options
  const categoryOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Categories", count: totalCount },
    { value: "Checked-In", label: "Active Inpatients (Ward)", count: checkedInCount, dotColor: "bg-purple-500" },
    { value: "Pending", label: "Incoming Review (Pending)", count: pendingCount, dotColor: "bg-amber-500" },
    { value: "Confirmed", label: "Confirmed Scheduled", count: confirmedCount, dotColor: "bg-emerald-500" },
    { value: "Completed", label: "Settled Discharges", count: completedCount, dotColor: "bg-blue-500" },
  ];

  // Popup Ward Filter Options
  const wardOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Wards & Units" },
    { value: "ICU", label: "ICU Critical Care" },
    { value: "CCU", label: "Cardiac CCU" },
    { value: "VIP Suite", label: "VIP Suites" },
    { value: "Deluxe Cabin", label: "Deluxe Cabins" },
    { value: "General Ward", label: "General Wards" },
    { value: "NICU", label: "NICU Neonatal" },
    { value: "HDU", label: "HDU Step-Down" },
  ];

  // Navigation to Full Dossier Page
  const handleNavigateToBooking = (bookingId: string) => {
    router.push(`/hospital/dashboard/bookings/${bookingId}`);
  };

  // Registry Live Search Auto-Fill
  const handleRegistrySearch = (query: string) => {
    setRegistryQuery(query);
    if (query.trim().length >= 2) {
      const results = searchNationalPatientRegistry(query);
      setRegistryResults(results);
    } else {
      setRegistryResults([]);
    }
  };

  const handleSelectRegistryPatient = (patient: any) => {
    setPatientName(patient.english_name || patient.patient_name);
    setPatientPhone(patient.personal_phone || "");
    setPatientNid(patient.nid_number || "");
    setPatientAge(patient.age || 35);
    setPatientGender(patient.gender || "Male");
    setPatientBloodGroup(patient.blood_group || "O+");
    setRegistryResults([]);
    setRegistryQuery("");
    toast.success(`Imported verified HealthPass data for ${patient.english_name || patient.patient_name}`);
  };

  // Create New Reservation Submit
  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBedObj) {
      toast.error("No bed available for reservation");
      return;
    }

    const newBooking: BedBooking = {
      id: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      bed_id: currentBedObj.id,
      bed_name: currentBedObj.title,
      bed_category: currentBedObj.category,
      bed_daily_rate: currentBedObj.price,
      patient_name: patientName.trim(),
      patient_phone: patientPhone.trim(),
      patient_nid: patientNid.trim() || undefined,
      patient_age: patientAge,
      patient_gender: patientGender,
      patient_blood_group: patientBloodGroup,
      check_in_date: checkInDate,
      duration_days: durationDays,
      booking_status: "Confirmed",
      payment_status: "Deposit Paid",
      payment_method: paymentMethod,
      total_amount: calculatedTotalAmount,
      deposit_amount: depositAmount,
      paid_amount: depositAmount,
      transaction_ref: transactionRef || `TXN-HP-${Math.floor(10000 + Math.random() * 90000)}`,
      attending_doctor: attendingDoctor,
      diagnosis: diagnosis.trim() || "Elective Admission",
      created_at: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    saveHospitalBooking(newBooking);
    refreshAll();
    setIsNewBookingModalOpen(false);
    toast.success(`Reservation ${newBooking.id} created successfully!`);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      <Toaster position="top-right" richColors />

      {/* 1. Header & Quick Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Inpatient Reservation & Pipeline Clearance
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
              Singapore HMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Categorized workflow for active ward inpatients, incoming review requests, and billing settlement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (vacantBeds.length > 0) setSelectedBedId(vacantBeds[0].id);
              setIsNewBookingModalOpen(true);
            }}
            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} /> New Bed Reservation
          </button>
          <button
            onClick={refreshAll}
            title="Synchronize"
            className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Summary (Clickable to switch Category) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter("Checked-In")}
          className={`text-left bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
            statusFilter === "Checked-In" ? "border-purple-500 ring-2 ring-purple-100 bg-purple-50/20" : "border-slate-200/80 hover:border-purple-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Active Inpatients
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BedDouble size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-purple-700">{checkedInCount}</h3>
            <p className="text-[11px] font-bold text-purple-600 mt-0.5">Checked-In In Ward</p>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("Pending")}
          className={`text-left bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
            statusFilter === "Pending" ? "border-amber-500 ring-2 ring-amber-100 bg-amber-50/20" : "border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-amber-700">{pendingCount}</h3>
            <p className="text-[11px] font-bold text-amber-600 mt-0.5">Needs Bed Allocation</p>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("Confirmed")}
          className={`text-left bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
            statusFilter === "Confirmed" ? "border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20" : "border-slate-200/80 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Confirmed Scheduled
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-emerald-700">{confirmedCount}</h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Upcoming Arrivals</p>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("Completed")}
          className={`text-left bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
            statusFilter === "Completed" ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/20" : "border-slate-200/80 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Settled Discharges
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-slate-900">{completedCount}</h3>
            <p className="text-[11px] font-bold text-blue-600 mt-0.5">BDT {totalRevenue.toLocaleString()} Billed</p>
          </div>
        </button>
      </div>

      {/* 3. Global Search & Popup Category Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Patient Name, Booking ID, Bed Code, Doctor, Phone across categories..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
          <div className="w-full sm:w-64">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={categoryOptions}
              prefix="Category:"
              icon={Layers}
              menuWidth="w-72"
            />
          </div>

          <div className="w-full sm:w-56">
            <CustomSelect
              value={wardFilter}
              onChange={(val) => setWardFilter(val)}
              options={wardOptions}
              prefix="Ward:"
              icon={BedDouble}
              menuWidth="w-60"
            />
          </div>
        </div>
      </div>

      {/* 4. Category Switcher Segmented Tabs (Seamless in-page view switcher) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { key: "All", label: "All Records", count: totalCount, dot: "bg-slate-400" },
          { key: "Checked-In", label: "Active Inpatients", count: checkedInCount, dot: "bg-purple-600" },
          { key: "Pending", label: "Incoming Review", count: pendingCount, dot: "bg-amber-500" },
          { key: "Confirmed", label: "Confirmed Upcoming", count: confirmedCount, dot: "bg-emerald-600" },
          { key: "Completed", label: "Settled Discharges", count: completedCount, dot: "bg-blue-600" },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${tab.dot}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Unified Inpatient Data Table (Single-Line, Separate Blue & Yellow Columns) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">
              {statusFilter === "All"
                ? "Unified Inpatient & Booking Registry"
                : statusFilter === "Checked-In"
                ? "Active Inpatients Occupying Ward Suites"
                : statusFilter === "Pending"
                ? "Incoming Bed Reservations (Pending Review)"
                : statusFilter === "Confirmed"
                ? "Confirmed Scheduled Inpatient Arrivals"
                : "Settled Inpatient Records & Final Discharges"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {filteredBookings.length} {filteredBookings.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing 50 patients per page • Real-time database sync
          </div>
        </div>

        {/* The Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Check-In Date</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Allocated Suite</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Total Billed</th>
                {/* User Explicit Request: Deposit/Completed in Blue column */}
                <th className="py-3.5 px-4 text-blue-700 bg-blue-50/40">Paid / Deposit</th>
                {/* User Explicit Request: Unpaid/Due in Yellow/Amber column */}
                <th className="py-3.5 px-4 text-amber-700 bg-amber-50/40">Pending Due</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <>
                  <BookingTableRowSkeleton />
                  <BookingTableRowSkeleton />
                  <BookingTableRowSkeleton />
                  <BookingTableRowSkeleton />
                  <BookingTableRowSkeleton />
                </>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 text-sm">
                    No inpatient booking records match the selected category or filters.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => {
                  const due = Math.max(0, b.total_amount - b.paid_amount);

                  return (
                    <tr
                      key={b.id}
                      onClick={() => handleNavigateToBooking(b.id)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer whitespace-nowrap"
                    >
                      {/* 1. Booking ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          {b.id}
                        </span>
                      </td>

                      {/* 2. Check-In Date */}
                      <td className="py-3.5 px-4 text-slate-700 text-xs">
                        {b.check_in_date}
                      </td>

                      {/* 3. Patient Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                            {b.patient_name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900 text-xs">
                            {b.patient_name}
                          </span>
                        </div>
                      </td>

                      {/* 4. Contact Phone */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                        {b.patient_phone}
                      </td>

                      {/* 5. Allocated Suite */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-[11px] border border-purple-200">
                            {b.bed_id}
                          </span>
                          <span className="font-semibold text-slate-700 text-xs">
                            {b.bed_category}
                          </span>
                        </div>
                      </td>

                      {/* 6. Stay Duration */}
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-xs">
                        {b.duration_days} Days
                      </td>

                      {/* 7. Total Billed Amount */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-xs">
                        ৳ {b.total_amount.toLocaleString()}
                      </td>

                      {/* 8. Paid / Deposit Amount (BLUE as requested) */}
                      <td className="py-3.5 px-4 bg-blue-50/20">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200">
                          ৳ {b.paid_amount.toLocaleString()} Paid
                        </span>
                      </td>

                      {/* 9. Pending Due Amount (YELLOW / AMBER as requested) */}
                      <td className="py-3.5 px-4 bg-amber-50/20">
                        {due > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300">
                            ৳ {due.toLocaleString()} Due
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200">
                            ৳ 0 (Settled)
                          </span>
                        )}
                      </td>

                      {/* 10. Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            b.booking_status === "Checked-In"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : b.booking_status === "Pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-300"
                              : b.booking_status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.booking_status === "Checked-In"
                                ? "bg-purple-600"
                                : b.booking_status === "Pending"
                                ? "bg-amber-500"
                                : b.booking_status === "Confirmed"
                                ? "bg-emerald-600"
                                : "bg-blue-600"
                            }`}
                          />
                          {b.booking_status}
                        </span>
                      </td>

                      {/* 11. Quick Pipeline Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {b.booking_status === "Checked-In" && (
                            <button
                              onClick={() => handleNavigateToBooking(b.id)}
                              className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 size={13} /> Complete & Settle
                            </button>
                          )}

                          {b.booking_status === "Pending" && (
                            <button
                              onClick={() => handleNavigateToBooking(b.id)}
                              className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <Clock size={13} /> Review & Allocate
                            </button>
                          )}

                          {b.booking_status === "Confirmed" && (
                            <button
                              onClick={() => handleNavigateToBooking(b.id)}
                              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <UserCheck size={13} /> Check In Bed
                            </button>
                          )}

                          {b.booking_status === "Completed" && (
                            <button
                              onClick={() => handleNavigateToBooking(b.id)}
                              className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <Receipt size={13} /> View Clearance
                            </button>
                          )}

                          <button
                            onClick={() => handleNavigateToBooking(b.id)}
                            className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                            title="Open Full Page Dossier"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Professional Pagination Footer (50 Patients Per Page) */}
        {filteredBookings.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-semibold">
              Showing{" "}
              <span className="text-slate-900 font-black">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="text-slate-900 font-black">
                {Math.min(currentPage * pageSize, filteredBookings.length)}
              </span>{" "}
              of{" "}
              <span className="text-slate-900 font-black">{filteredBookings.length}</span>{" "}
              patient bookings
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  currentPage === 1
                    ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
                    : "border-slate-200 text-slate-700 hover:bg-white bg-white shadow-2xs"
                }`}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 min-w-9 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  currentPage === totalPages
                    ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
                    : "border-slate-200 text-slate-700 hover:bg-white bg-white shadow-2xs"
                }`}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. MODAL: CREATE NEW INPATIENT RESERVATION */}
      <AnimatePresence>
        {isNewBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">New Inpatient Bed Reservation</h3>
                    <p className="text-xs text-slate-500">Pre-register an advance bed reservation with deposit</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* HealthPass Registry Lookup */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Auto-Import Patient Record from HealthPass / NID / Phone
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={registryQuery}
                    onChange={(e) => handleRegistrySearch(e.target.value)}
                    placeholder="Search HealthPass UID, NID or Phone..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-emerald-500"
                  />
                </div>

                {registryResults.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {registryResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectRegistryPatient(p)}
                        className="w-full p-2.5 text-left hover:bg-emerald-50/60 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{p.english_name || p.patient_name}</p>
                          <p className="text-[10px] text-slate-500">UID: {p.smart_card_uid} • {p.personal_phone}</p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Import
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Syed Golam Kibria"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Patient Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+880 1711-998877"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Select Clinical Bed Suite <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedBedId}
                      onChange={(e) => setSelectedBedId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none focus:border-emerald-500"
                    >
                      {vacantBeds.map((vb) => (
                        <option key={vb.id} value={vb.id}>
                          {vb.id} — {vb.category} ({vb.ward}) • BDT {vb.price.toLocaleString()}/day
                        </option>
                      ))}
                      {vacantBeds.length === 0 && (
                        <option value="">No vacant beds in ward</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Check-In Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Stay Duration (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Advance Deposit (BDT)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-black text-emerald-700 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none focus:border-emerald-500"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewBookingModalOpen(false)}
                    className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={16} /> Confirm Reservation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
