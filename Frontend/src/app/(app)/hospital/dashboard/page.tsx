"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BedDouble,
  Activity,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  CalendarDays,
  ShieldAlert,
  Search,
  ClipboardCheck,
  Receipt,
  Calendar,
  CheckCircle2,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import {
  getHospitalBeds,
  getHospitalAdmissions,
  getHospitalBills,
  getHospitalDoctors,
} from "@/lib/hospital-hms";
import type { BedGig, InpatientAdmission, HospitalBill, HospitalDoctor } from "@/types/hospital-hms";
import {
  MetricCardSkeleton,
  ChartBarsSkeleton,
  TableRowSkeleton,
} from "@/components/hospital/Skeleton";

type Timeframe = "Daily" | "Day-by-Day" | "Weekly" | "Monthly" | "Custom";

export default function HospitalDashboardPage() {
  const [beds, setBeds] = useState<BedGig[]>([]);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [bills, setBills] = useState<HospitalBill[]>([]);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Timeframe Popup Menu State for Admissions & Discharges Chart
  const [timeframe, setTimeframe] = useState<Timeframe>("Day-by-Day");
  const [isChartFilterOpen, setIsChartFilterOpen] = useState(false);
  const [appliedPeriodLabel, setAppliedPeriodLabel] = useState("Day-by-Day (7 Days)");

  // Top Category Filter State
  const [isTopFilterOpen, setIsTopFilterOpen] = useState(false);

  // Inpatient Census Table Filters
  const [inpatientSearch, setInpatientSearch] = useState("");
  const [inpatientDateFilter, setInpatientDateFilter] = useState<string>("all");
  const [isInpatientFilterOpen, setIsInpatientFilterOpen] = useState(false);

  // Custom Date Range State inside Dropdown
  const [customStart, setCustomStart] = useState("2026-10-18");
  const [customEnd, setCustomEnd] = useState("2026-10-25");
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  // Click Outside Refs
  const chartFilterRef = useRef<HTMLDivElement>(null);
  const topFilterRef = useRef<HTMLDivElement>(null);
  const inpatientFilterRef = useRef<HTMLDivElement>(null);

  // Load Data on Mount with Smooth Skeleton Transition
  useEffect(() => {
    setBeds(getHospitalBeds());
    setAdmissions(getHospitalAdmissions());
    setBills(getHospitalBills());
    setDoctors(getHospitalDoctors());

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Close filter dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chartFilterRef.current && !chartFilterRef.current.contains(event.target as Node)) {
        setIsChartFilterOpen(false);
      }
      if (topFilterRef.current && !topFilterRef.current.contains(event.target as Node)) {
        setIsTopFilterOpen(false);
      }
      if (inpatientFilterRef.current && !inpatientFilterRef.current.contains(event.target as Node)) {
        setIsInpatientFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Timeframe Selection Handler
  const handleSelectTimeframe = (tf: Timeframe) => {
    if (tf === "Custom") {
      setShowCustomInputs(true);
      return;
    }
    setTimeframe(tf);
    setShowCustomInputs(false);
    setIsChartFilterOpen(false);
    setIsTopFilterOpen(false);

    if (tf === "Day-by-Day") setAppliedPeriodLabel("Day-by-Day (7 Days)");
    else if (tf === "Daily") setAppliedPeriodLabel("Daily (24h Flow)");
    else if (tf === "Weekly") setAppliedPeriodLabel("Weekly (This Week)");
    else if (tf === "Monthly") setAppliedPeriodLabel("Monthly (This Month)");
  };

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeframe("Custom");
    setAppliedPeriodLabel(`${customStart} — ${customEnd}`);
    setIsChartFilterOpen(false);
    setIsTopFilterOpen(false);
    toast.success(`Date filter applied: ${customStart} to ${customEnd}`);
  };

  // Metrics Calculations
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === "Occupied").length;
  const vacantBeds = beds.filter((b) => b.status === "Vacant").length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const currentInpatients = admissions.filter((a) => a.status === "Admitted");
  const criticalPatients = currentInpatients.filter((a) => a.condition === "Critical").length;
  const stablePatients = currentInpatients.filter((a) => a.condition === "Stable").length;

  const totalRevenue = bills
    .filter((b) => b.payment_status === "Paid")
    .reduce((sum, b) => sum + (b.net_payable || b.gross_total), 0);

  // Dynamic Chart Datasets with Day-by-Day breakdown
  const chartDatasets = {
    "Day-by-Day": [
      { label: "19 Oct", admissions: 28, discharges: 18 },
      { label: "20 Oct", admissions: 34, discharges: 22 },
      { label: "21 Oct", admissions: 30, discharges: 25 },
      { label: "22 Oct", admissions: 40, discharges: 28 },
      { label: "23 Oct", admissions: 46, discharges: 35 },
      { label: "24 Oct", admissions: 22, discharges: 16 },
      { label: "25 Oct", admissions: 19, discharges: 12 },
    ],
    Daily: [
      { label: "00:00", admissions: 4, discharges: 2 },
      { label: "04:00", admissions: 3, discharges: 1 },
      { label: "08:00", admissions: 14, discharges: 6 },
      { label: "12:00", admissions: 22, discharges: 14 },
      { label: "16:00", admissions: 18, discharges: 16 },
      { label: "20:00", admissions: 9, discharges: 7 },
    ],
    Weekly: [
      { label: "Mon", admissions: 28, discharges: 18 },
      { label: "Tue", admissions: 34, discharges: 22 },
      { label: "Wed", admissions: 30, discharges: 25 },
      { label: "Thu", admissions: 40, discharges: 28 },
      { label: "Fri", admissions: 46, discharges: 35 },
      { label: "Sat", admissions: 22, discharges: 16 },
      { label: "Sun", admissions: 19, discharges: 12 },
    ],
    Monthly: [
      { label: "Week 1", admissions: 120, discharges: 95 },
      { label: "Week 2", admissions: 145, discharges: 118 },
      { label: "Week 3", admissions: 158, discharges: 130 },
      { label: "Week 4", admissions: 170, discharges: 148 },
    ],
    Custom: [
      { label: "P-1", admissions: 48, discharges: 36 },
      { label: "P-2", admissions: 65, discharges: 49 },
      { label: "P-3", admissions: 82, discharges: 68 },
      { label: "P-4", admissions: 61, discharges: 45 },
    ],
  };

  const activeChartData = chartDatasets[timeframe] || chartDatasets["Day-by-Day"];
  const maxVal = Math.max(...activeChartData.map((d) => Math.max(d.admissions, d.discharges))) * 1.15;

  // Day-by-Day Inpatient Census Filter Logic
  const filteredInpatients = currentInpatients.filter((p) => {
    // 1. Text search
    const q = inpatientSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.patient_name.toLowerCase().includes(q) ||
      (p.english_name || "").toLowerCase().includes(q) ||
      p.bed_id.toLowerCase().includes(q) ||
      p.attending_doctor.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // 2. Day-by-Day / Date Filter
    if (inpatientDateFilter === "all") return true;
    if (inpatientDateFilter === "critical") return p.condition === "Critical";
    if (inpatientDateFilter === "stable") return p.condition === "Stable";

    const admitDate = p.admission_date || "";
    if (inpatientDateFilter === "today") {
      return admitDate === "2026-10-25" || admitDate.startsWith("2026-10-25");
    }
    if (inpatientDateFilter === "yesterday") {
      return admitDate === "2026-10-24";
    }
    if (inpatientDateFilter === "recent_3") {
      return ["2026-10-25", "2026-10-24", "2026-10-23"].some((d) => admitDate.startsWith(d));
    }
    if (inpatientDateFilter === "this_week") {
      return admitDate >= "2026-10-19";
    }

    return true;
  });

  const inpatientDateLabels: Record<string, string> = {
    all: "All Active Inpatients",
    today: "Admitted Today (Day-by-Day)",
    yesterday: "Admitted Yesterday",
    recent_3: "Admitted Last 3 Days",
    this_week: "Admitted This Week",
    critical: "Critical Care Priority",
    stable: "Stable Observation",
  };

  return (
    <div className="w-full space-y-6 pb-16">
      <Toaster position="top-right" richColors />

      {/* 1. Ultra-Clean Executive Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Hospital Executive Overview
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time census telemetry, ward capacity, and department operations.
          </p>
        </div>

        {/* Top Filter Popup System */}
        <div className="relative" ref={topFilterRef}>
          <button
            type="button"
            onClick={() => setIsTopFilterOpen(!isTopFilterOpen)}
            className="h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2.5 transition-all shadow-2xs cursor-pointer"
          >
            <Calendar size={14} className="text-blue-600" />
            <span>
              Timeframe: <strong className="text-slate-900 font-black">{appliedPeriodLabel}</strong>
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Popup Dropdown */}
          <AnimatePresence>
            {isTopFilterOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 z-50 space-y-1.5"
              >
                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Telemetry Period
                </div>

                {[
                  { key: "Day-by-Day", label: "Day-by-Day (Last 7 Days Detailed)" },
                  { key: "Daily", label: "Daily (24h Inpatient Flow)" },
                  { key: "Weekly", label: "Weekly (This Week Breakdown)" },
                  { key: "Monthly", label: "Monthly (This Month Overview)" },
                  { key: "Custom", label: "Custom Date Range..." },
                ].map((item) => {
                  const isSelected = timeframe === item.key && (!showCustomInputs || item.key === "Custom");
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectTimeframe(item.key as Timeframe)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-800"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <CheckCircle2 size={14} className="text-blue-600" />}
                    </button>
                  );
                })}

                {/* Inline Custom Date Picker inside the popup */}
                {showCustomInputs && (
                  <form
                    onSubmit={handleApplyCustomDates}
                    className="pt-2 border-t border-slate-100 space-y-2 px-1"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        From Date
                      </span>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        To Date
                      </span>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Apply Filter
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Categorized Production Metric Cards (with Element-Based Skeletons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <MetricCardSkeleton borderLeftColor="border-l-blue-600" />
            <MetricCardSkeleton borderLeftColor="border-l-cyan-600" />
            <MetricCardSkeleton borderLeftColor="border-l-rose-500" />
            <MetricCardSkeleton borderLeftColor="border-l-emerald-600" />
          </>
        ) : (
          <>
            {/* Card 1: Total Inpatients */}
            <div className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-blue-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all h-[148px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Total Inpatients
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      Active Beds
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <h3 className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight">
                  {currentInpatients.length}
                </h3>
                <span className="text-xs font-bold text-slate-400">In Care</span>
              </div>
            </div>

            {/* Card 2: Bed Occupancy */}
            <div className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-cyan-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all h-[148px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <BedDouble size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Bed Occupancy
                    </span>
                    <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      {vacantBeds} Vacant / {totalBeds} Total
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <h3 className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight">
                  {occupancyRate}%
                </h3>
                <span className="text-xs font-bold text-slate-400">Ward Capacity</span>
              </div>
            </div>

            {/* Card 3: Emergency Triage */}
            <div className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-rose-500 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all h-[148px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Activity size={19} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Emergency Triage
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      Critical: {criticalPatients}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <h3 className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight">
                  12
                </h3>
                <span className="text-xs font-bold text-slate-400">ER Arrivals</span>
              </div>
            </div>

            {/* Card 4: Settled Revenue */}
            <div className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-emerald-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all h-[148px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CreditCard size={19} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Settled Revenue
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      Inpatient Billing
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <h3 className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-tight">
                  BDT {totalRevenue.toLocaleString()}
                </h3>
                <span className="text-xs font-bold text-emerald-600">Cleared</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Main Split Section: Single-Line Blue Graph (8 cols) + Side Quick Links (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left (8 cols): Production-Level Blue Admissions Graph (SINGLE CLEAN COMPACT LINE HEADER) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          {/* USER EXPLICIT REQUEST: Single clean horizontal line header without stacked clutter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Left: Title + Flow Analytics badge side-by-side in 1 clean line */}
            <div className="flex items-center gap-2.5 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
                Hospital Admissions & Discharges
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider whitespace-nowrap">
                Flow
              </span>
            </div>

            {/* Right: Legend + Popup Filter Dropdown Box in the EXACT SAME single line */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Clean Blue Legend */}
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-2xs" />
                  Admissions
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-300 shadow-2xs" />
                  Discharges
                </span>
              </div>

              {/* Compact Popup Filter Dropdown Box */}
              <div className="relative" ref={chartFilterRef}>
                <button
                  type="button"
                  onClick={() => setIsChartFilterOpen(!isChartFilterOpen)}
                  className="h-8.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all hover:border-slate-300"
                >
                  <Filter size={12} className="text-blue-600" />
                  <span>{appliedPeriodLabel}</span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {/* Floating Popup Dropdown Menu */}
                <AnimatePresence>
                  {isChartFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 6 }}
                      className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2.5 z-50 space-y-1"
                    >
                      <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                        Select Telemetry Filter
                      </div>

                      {[
                        { key: "Day-by-Day", label: "Day-by-Day (7 Days Detailed)", desc: "19 Oct - 25 Oct" },
                        { key: "Daily", label: "Daily (24h Inpatient Flow)", desc: "Hour-by-hour intervals" },
                        { key: "Weekly", label: "Weekly (This Week)", desc: "Mon to Sun breakdown" },
                        { key: "Monthly", label: "Monthly (This Month)", desc: "Week 1 to Week 4" },
                        { key: "Custom", label: "Custom Date Range...", desc: "Specific calendar dates" },
                      ].map((item) => {
                        const isSelected = timeframe === item.key && (!showCustomInputs || item.key === "Custom");
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => handleSelectTimeframe(item.key as Timeframe)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-800"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <div>
                              <span className="block leading-tight">{item.label}</span>
                              <span className="block text-[10px] font-normal text-slate-400">{item.desc}</span>
                            </div>
                            {isSelected && <CheckCircle2 size={15} className="text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}

                      {/* Inline Custom Date Inputs */}
                      {showCustomInputs && (
                        <form
                          onSubmit={handleApplyCustomDates}
                          className="pt-2 border-t border-slate-100 space-y-2 px-1"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              From Date
                            </span>
                            <input
                              type="date"
                              value={customStart}
                              onChange={(e) => setCustomStart(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              To Date
                            </span>
                            <input
                              type="date"
                              value={customEnd}
                              onChange={(e) => setCustomEnd(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Apply Custom Dates
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Pure Blue Telemetry Bar Chart (or Skeleton) */}
          {isLoading ? (
            <ChartBarsSkeleton />
          ) : (
            <div className="h-64 sm:h-72 w-full pt-6 flex items-end gap-3 sm:gap-6">
              {activeChartData.map((d, i) => {
                const admHeight = Math.min(100, Math.round((d.admissions / maxVal) * 100));
                const disHeight = Math.min(100, Math.round((d.discharges / maxVal) * 100));

                return (
                  <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group">
                    <div className="w-full h-full flex items-end justify-center gap-1.5 relative">
                      {/* Admissions Bar (Royal Blue) */}
                      <div
                        className="w-1/2 bg-blue-600 hover:bg-blue-700 rounded-t-md transition-all cursor-pointer relative group/bar shadow-2xs"
                        style={{ height: `${admHeight}%` }}
                      >
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-md">
                          {d.admissions} Admissions
                        </span>
                      </div>

                      {/* Discharges Bar (Sky Blue) */}
                      <div
                        className="w-1/2 bg-sky-200 hover:bg-sky-300 rounded-t-md transition-all cursor-pointer relative group/bar2"
                        style={{ height: `${disHeight}%` }}
                      >
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded opacity-0 group-hover/bar2:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-md">
                          {d.discharges} Discharges
                        </span>
                      </div>
                    </div>

                    {/* Day-by-Day X-Axis Label */}
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-700 transition-colors whitespace-nowrap">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Telemetry Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Overall Occupancy: <strong className="text-blue-700 font-bold">{occupancyRate}%</strong>
            </span>
            <span className="text-slate-400">Day-by-Day flow synchronized with Singapore HMS</span>
          </div>
        </div>

        {/* Right (4 cols): Side Quick Portals Box & Capacity */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Portals Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-black text-slate-900">Quick Portals</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Beds Hub", href: "/hospital/dashboard/beds", icon: BedDouble },
                { label: "Bookings", href: "/hospital/dashboard/bookings", icon: ClipboardCheck },
                { label: "Inpatients", href: "/hospital/dashboard/patients", icon: Users },
                { label: "Billing", href: "/hospital/dashboard/billing", icon: Receipt },
                { label: "Doctors", href: "/hospital/dashboard/doctors", icon: Stethoscope },
                { label: "HealthPass", href: "/hospital/dashboard/health-pass", icon: ShieldAlert },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center gap-1.5 text-center group cursor-pointer shadow-2xs"
                  >
                    <Icon size={18} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-800">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Compact Ward Capacity Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Ward Capacity
              </h3>
              <span className="text-xs font-bold text-blue-600">{vacantBeds} Available</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>ICU Critical Care</span>
                  <span className="text-rose-600">90%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[90%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>VIP Suites</span>
                  <span className="text-blue-600">65%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[65%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Deluxe Cabins</span>
                  <span className="text-amber-600">80%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[80%]" />
                </div>
              </div>
            </div>

            <Link
              href="/hospital/dashboard/beds"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-end gap-1 pt-1"
            >
              Manage Bed Suites →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Live Inpatient Census Table (Day-by-Day Filter System & Single-Line Skeleton) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Live Inpatient Census
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  {filteredInpatients.length} Active Inpatients
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time ward telemetry filtered day-by-day with attending physician assignments
              </p>
            </div>
          </div>

          {/* Search + Day-by-Day Filter Popup for Inpatients */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, bed, doctor..."
                value={inpatientSearch}
                onChange={(e) => setInpatientSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Inpatient Day-by-Day Filter Popup */}
            <div className="relative w-full sm:w-56" ref={inpatientFilterRef}>
              <button
                type="button"
                onClick={() => setIsInpatientFilterOpen(!isInpatientFilterOpen)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-between shadow-2xs cursor-pointer transition-all"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <CalendarDays size={14} className="text-blue-600 shrink-0" />
                  <span className="text-slate-400 font-normal">Day:</span>
                  <strong className="text-slate-900 truncate">
                    {inpatientDateLabels[inpatientDateFilter] || "All Active"}
                  </strong>
                </span>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </button>

              <AnimatePresence>
                {isInpatientFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 6 }}
                    className="absolute right-0 top-12 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 space-y-1"
                  >
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Filter Inpatient Admission Day
                    </div>

                    {Object.entries(inpatientDateLabels).map(([key, label]) => {
                      const isSelected = inpatientDateFilter === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setInpatientDateFilter(key);
                            setIsInpatientFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 text-blue-800"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && <CheckCircle2 size={14} className="text-blue-600" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Inpatient Table with Exact-Sized Skeletons during Loading */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-black text-[11px] tracking-wider whitespace-nowrap">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Admission ID</th>
                <th className="py-4 px-6">Bed Suite</th>
                <th className="py-4 px-6">Attending Doctor</th>
                <th className="py-4 px-6">Admit Date</th>
                <th className="py-4 px-6">Clinical Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {isLoading ? (
                <>
                  <TableRowSkeleton columnCount={7} />
                  <TableRowSkeleton columnCount={7} />
                  <TableRowSkeleton columnCount={7} />
                  <TableRowSkeleton columnCount={7} />
                  <TableRowSkeleton columnCount={7} />
                </>
              ) : (
                filteredInpatients.map((pat) => {
                  const displayName = pat.english_name || pat.patient_name;
                  const initials =
                    displayName
                      .split(" ")
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "PT";

                  return (
                    <tr key={pat.id} className="hover:bg-blue-50/20 transition-colors whitespace-nowrap">
                      {/* Patient Name with Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {displayName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              UID: {pat.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Admission ID */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80">
                          {pat.id}
                        </span>
                      </td>

                      {/* Bed Suite */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          <BedDouble size={13} />
                          <span>{pat.bed_id}</span>
                        </div>
                      </td>

                      {/* Attending Doctor */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{pat.attending_doctor}</div>
                        <div className="text-[11px] text-slate-400">Specialist Physician</div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 font-mono text-slate-700 font-bold">
                        {pat.admission_date}
                      </td>

                      {/* Condition */}
                      <td className="py-4 px-6">
                        {pat.condition === "Critical" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            Critical Care
                          </span>
                        ) : pat.condition === "Stable" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Stable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Observation
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          href="/hospital/dashboard/patients"
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                        >
                          <span>Dossier</span>
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}

              {!isLoading && filteredInpatients.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No active inpatients match the selected date or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
