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
  TrendingUp,
  Stethoscope,
  CalendarDays,
  ShieldAlert,
  Building,
  UserPlus,
  ArrowRight,
  Search,
  ExternalLink,
  Store,
  ClipboardCheck,
  Receipt,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
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

type Timeframe = "Daily" | "Weekly" | "Monthly" | "Custom";

export default function HospitalDashboardPage() {
  const [beds, setBeds] = useState<BedGig[]>([]);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [bills, setBills] = useState<HospitalBill[]>([]);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);

  // Timeframe Popup Menu State
  const [timeframe, setTimeframe] = useState<Timeframe>("Weekly");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [appliedPeriodLabel, setAppliedPeriodLabel] = useState("Weekly");
  const [inpatientSearch, setInpatientSearch] = useState("");

  // Custom Date Range State inside Dropdown
  const [customStart, setCustomStart] = useState("2026-10-01");
  const [customEnd, setCustomEnd] = useState("2026-10-25");
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  // Load Data on Mount
  useEffect(() => {
    setBeds(getHospitalBeds());
    setAdmissions(getHospitalAdmissions());
    setBills(getHospitalBills());
    setDoctors(getHospitalDoctors());
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
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
    setIsFilterDropdownOpen(false);
    if (tf === "Daily") setAppliedPeriodLabel("Today (Daily)");
    else if (tf === "Weekly") setAppliedPeriodLabel("This Week (Weekly)");
    else if (tf === "Monthly") setAppliedPeriodLabel("This Month (Monthly)");
  };

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeframe("Custom");
    setAppliedPeriodLabel(`${customStart} — ${customEnd}`);
    setIsFilterDropdownOpen(false);
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

  // Dynamic Chart Datasets with Emerald Green theme
  const chartDatasets = {
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

  const activeChartData = chartDatasets[timeframe] || chartDatasets.Weekly;
  const maxVal = Math.max(...activeChartData.map((d) => Math.max(d.admissions, d.discharges))) * 1.15;

  // Filtered Inpatients for bottom table
  const filteredInpatients = currentInpatients.filter((p) => {
    const q = inpatientSearch.toLowerCase();
    return (
      p.patient_name.toLowerCase().includes(q) ||
      (p.english_name || "").toLowerCase().includes(q) ||
      p.bed_id.toLowerCase().includes(q) ||
      p.attending_doctor.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

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
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time census telemetry, ward capacity, and department operations.
          </p>
        </div>

        {/* Professional Category / Timeframe Dropdown (Compact Box on Right) */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2.5 transition-all shadow-2xs cursor-pointer"
          >
            <Calendar size={14} className="text-blue-600" />
            <span>Category: <strong className="text-slate-900 font-black">{appliedPeriodLabel}</strong></span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Popup Modal / Dropdown */}
          <AnimatePresence>
            {isFilterDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 z-50 space-y-1.5"
              >
                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Time Category
                </div>

                {(["Daily", "Weekly", "Monthly", "Custom"] as Timeframe[]).map((tf) => {
                  const isSelected = timeframe === tf && (!showCustomInputs || tf === "Custom");
                  return (
                    <button
                      key={tf}
                      onClick={() => handleSelectTimeframe(tf)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-800"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>
                        {tf === "Daily"
                          ? "Daily (Today)"
                          : tf === "Weekly"
                          ? "Weekly (This Week)"
                          : tf === "Monthly"
                          ? "Monthly (This Month)"
                          : "Custom Date Range"}
                      </span>
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

      {/* 2. Categorized Production Metric Cards (Distinct Accent Colors & Premium Mono Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inpatients (Blue Theme) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-blue-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
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
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <h3 className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight">
              {currentInpatients.length}
            </h3>
            <span className="text-xs font-bold text-slate-400">In Care</span>
          </div>
        </div>

        {/* Card 2: Bed Occupancy (Cyan / Sky Theme) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-cyan-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
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
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <h3 className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight">
              {occupancyRate}%
            </h3>
            <span className="text-xs font-bold text-slate-400">Ward Capacity</span>
          </div>
        </div>

        {/* Card 3: Emergency Triage (Rose Theme) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-rose-500 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
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
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <h3 className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight">
              12
            </h3>
            <span className="text-xs font-bold text-slate-400">ER Arrivals</span>
          </div>
        </div>

        {/* Card 4: Settled Revenue (Emerald Theme) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-emerald-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
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
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-tight">
              BDT {totalRevenue.toLocaleString()}
            </h3>
            <span className="text-xs font-bold text-emerald-600">Cleared</span>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section: Blue Production Graph (8 cols) + Side Quick Links (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left (8 cols): Production-Level Blue Admissions Graph */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Hospital Admissions & Discharges
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Flow Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient throughput telemetry filtered by <strong className="text-slate-700">{appliedPeriodLabel}</strong>
              </p>
            </div>

            {/* In-Graph Quick Category Switcher & Blue Legend */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Switcher Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                {(["Daily", "Weekly", "Monthly", "Custom"] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => handleSelectTimeframe(tf)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      timeframe === tf
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Clean Blue Legend */}
              <div className="flex items-center gap-3 text-xs font-bold pl-2 border-l border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-blue-600" />
                  <span className="text-slate-700">Admissions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-sky-300" />
                  <span className="text-slate-500">Discharges</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pure Blue Telemetry Chart */}
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
                        {d.admissions} in
                      </span>
                    </div>

                    {/* Discharges Bar (Sky Blue) */}
                    <div
                      className="w-1/2 bg-sky-200 hover:bg-sky-300 rounded-t-md transition-all cursor-pointer relative group/bar2"
                      style={{ height: `${disHeight}%` }}
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded opacity-0 group-hover/bar2:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-md">
                        {d.discharges} out
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Occupancy: <strong className="text-blue-700 font-bold">{occupancyRate}%</strong></span>
            <span className="text-slate-400">Telemetry synced with Singapore HMS</span>
          </div>
        </div>

        {/* Right (4 cols): Side Quick Links Box (Clickable, Compact, Professional) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Links Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-black text-slate-900">Quick Portals</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Beds Hub", href: "/hospital/dashboard/beds", icon: BedDouble },
                { label: "Bookings", href: "/hospital/dashboard/beds?tab=bookings", icon: ClipboardCheck },
                { label: "Inpatients", href: "/hospital/dashboard/beds?tab=inpatients", icon: UserPlus },
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

      {/* 4. Live Inpatient Census Table (Spacious, Clean & International Production-Grade) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  {filteredInpatients.length} Active Patients
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time ward telemetry, attending physicians, and clinical observation status
              </p>
            </div>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search inpatient, bed, doctor..."
              value={inpatientSearch}
              onChange={(e) => setInpatientSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-black text-[11px] tracking-wider">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Admission ID</th>
                <th className="py-4 px-6">Bed Suite</th>
                <th className="py-4 px-6">Attending Doctor</th>
                <th className="py-4 px-6">Admit Date</th>
                <th className="py-4 px-6">Clinical Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInpatients.map((pat) => {
                const displayName = pat.english_name || pat.patient_name;
                const initials = displayName
                  .split(" ")
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "PT";

                return (
                  <tr key={pat.id} className="hover:bg-blue-50/20 transition-colors">
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
                    <td className="py-4 px-6 font-mono text-slate-600">
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
              })}

              {filteredInpatients.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No matching inpatients found for "{inpatientSearch}".
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
