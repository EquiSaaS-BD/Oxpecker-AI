"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  BedDouble,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Printer,
  CreditCard,
  Building,
  Clock,
  Sparkles,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  ChevronRight,
  HeartPulse,
  Save,
  Check,
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import type {
  BedBooking,
  BookingStatus,
  BookingPaymentStatus,
  PaymentMethod,
  BedGig,
  HospitalBill,
} from "@/types/hospital-hms";
import {
  getHospitalBookings,
  getBookingById,
  saveHospitalBooking,
  updateBookingStatus,
  getHospitalBeds,
  updateBedStatus,
  saveHospitalBill,
  saveHospitalAdmission,
} from "@/lib/hospital-hms";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingIdParam = (params?.id as string) || "";

  const [booking, setBooking] = useState<BedBooking | null>(null);
  const [bed, setBed] = useState<BedGig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Billing Ledger Fields
  const [stayDays, setStayDays] = useState<number>(3);
  const [dailyRate, setDailyRate] = useState<number>(15000);
  const [doctorFees, setDoctorFees] = useState<number>(5000);
  const [pharmacyFees, setPharmacyFees] = useState<number>(4200);
  const [diagnosticsFees, setDiagnosticsFees] = useState<number>(3800);
  const [nursingFees, setNursingFees] = useState<number>(2500);
  const [discount, setDiscount] = useState<number>(0);
  const [advanceDeposit, setAdvanceDeposit] = useState<number>(20000);

  // Payment Settlement
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("bKash");
  const [transactionRef, setTransactionRef] = useState("TXN-HP-99412");
  const [clinicalNotes, setClinicalNotes] = useState(
    "Patient treated for cardiac arrhythmia under continuous telemetry. Vitals stable upon final clinical examination. Approved for discharge."
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  // Load Data
  useEffect(() => {
    if (!bookingIdParam) return;
    const b = getBookingById(bookingIdParam);
    if (b) {
      setBooking(b);
      setStayDays(b.duration_days || 3);
      setDailyRate(b.bed_daily_rate || 15000);
      setAdvanceDeposit(b.paid_amount || b.deposit_amount || 0);
      if (b.payment_method) setSelectedPaymentMethod(b.payment_method);
      if (b.transaction_ref) setTransactionRef(b.transaction_ref);
      if (b.notes) setClinicalNotes(b.notes);
      if (b.booking_status === "Completed") setIsSettled(true);

      const allBeds = getHospitalBeds();
      const matchBed = allBeds.find((bd) => bd.id === b.bed_id);
      if (matchBed) setBed(matchBed);
    }
    setIsLoading(false);
  }, [bookingIdParam]);

  // Financial Calculations
  const bedTotalCharges = useMemo(() => stayDays * dailyRate, [stayDays, dailyRate]);
  const grossTotal = useMemo(
    () => bedTotalCharges + doctorFees + pharmacyFees + diagnosticsFees + nursingFees,
    [bedTotalCharges, doctorFees, pharmacyFees, diagnosticsFees, nursingFees]
  );
  const netPayable = useMemo(
    () => Math.max(0, grossTotal - discount - advanceDeposit),
    [grossTotal, discount, advanceDeposit]
  );

  // 1-Click Check-In Action
  const handleConfirmCheckIn = () => {
    if (!booking) return;
    setIsProcessing(true);

    // 1. Update Booking Status to Checked-In
    const updated = updateBookingStatus(booking.id, "Checked-In", "Deposit Paid", advanceDeposit);
    const refreshed = updated.find((b) => b.id === booking.id) || null;
    setBooking(refreshed);

    // 2. Set Bed Occupied
    updateBedStatus(booking.bed_id, "Occupied", booking.patient_name, booking.id);

    // 3. Create Inpatient Admission record
    saveHospitalAdmission({
      id: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_name: booking.patient_name,
      english_name: booking.patient_name,
      smart_card_uid: `HP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      personal_phone: booking.patient_phone,
      date_of_birth: "1980-01-01",
      age: booking.patient_age || 40,
      gender: booking.patient_gender || "Male",
      blood_group: booking.patient_blood_group || "O+",
      address: "Dhaka, Bangladesh",
      allergies: [],
      has_pacemaker: false,
      emergency_contact_name: "Family Guardian",
      emergency_contact_phone: booking.patient_phone,
      emergency_contact_relation: "Relative",
      bed_id: booking.bed_id,
      bed_name: booking.bed_name,
      bed_type: booking.bed_category,
      bed_daily_rate: dailyRate,
      admission_date: new Date().toISOString().split("T")[0],
      attending_doctor: booking.attending_doctor,
      primary_diagnosis: booking.diagnosis || "Elective Admission from Reservation",
      condition: "Stable",
      initial_deposit: advanceDeposit,
      status: "Admitted",
      healthPassVerified: true,
    });

    setIsProcessing(false);
    toast.success(`Check-In Confirmed! ${booking.patient_name} admitted to ${booking.bed_id}.`);
  };

  // 1-Click Complete & Settle Final Bill
  const handleSettleFinalBill = () => {
    if (!booking) return;
    setIsProcessing(true);

    const finalPaidTotal = grossTotal - discount;

    // 1. Update Booking to Completed
    const updated = updateBookingStatus(booking.id, "Completed", "Fully Paid", finalPaidTotal);
    const refreshed = updated.find((b) => b.id === booking.id) || null;
    setBooking(refreshed);

    // 2. Save Official Hospital Bill
    const newBill: HospitalBill = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      admission_id: booking.id,
      booking_id: booking.id,
      patient_name: booking.patient_name,
      patient_phone: booking.patient_phone,
      patient_nid: booking.patient_nid,
      bed_name: `${booking.bed_name} (${booking.bed_id})`,
      admission_date: booking.check_in_date,
      discharge_date: new Date().toISOString().split("T")[0],
      days_admitted: stayDays,
      items: [
        {
          id: "item-bed",
          description: `Bed & Suite Stay (${stayDays} Days @ BDT ${dailyRate.toLocaleString()}/day)`,
          category: "Bed Charges",
          quantity: stayDays,
          unitPrice: dailyRate,
          total: bedTotalCharges,
        },
        {
          id: "item-doc",
          description: `Consultant Physician Daily Visits & Clinical Rounds`,
          category: "Physician Fee",
          quantity: 1,
          unitPrice: doctorFees,
          total: doctorFees,
        },
        {
          id: "item-pharm",
          description: `Dispensed Inpatient Medications & Infusion Sets`,
          category: "Medications",
          quantity: 1,
          unitPrice: pharmacyFees,
          total: pharmacyFees,
        },
        {
          id: "item-diag",
          description: `Cardiopulmonary & Clinical Pathology Panels`,
          category: "Diagnostics",
          quantity: 1,
          unitPrice: diagnosticsFees,
          total: diagnosticsFees,
        },
        {
          id: "item-nurse",
          description: `24/7 Nursing Telemetry & Infection Sanitization`,
          category: "Nursing & Service",
          quantity: 1,
          unitPrice: nursingFees,
          total: nursingFees,
        },
      ],
      bed_total: bedTotalCharges,
      doctor_fee: doctorFees,
      pharmacy_total: pharmacyFees,
      diagnostics_total: diagnosticsFees,
      nursing_fee: nursingFees,
      gross_total: grossTotal,
      deposit_paid: advanceDeposit,
      discount: discount,
      net_payable: 0,
      payment_status: "Paid",
      payment_method: selectedPaymentMethod,
      transaction_ref: transactionRef,
      created_at: new Date().toISOString(),
    };

    saveHospitalBill(newBill);

    // 3. Move Bed to Cleaning Protocol
    updateBedStatus(booking.bed_id, "Cleaning");

    setIsSettled(true);
    setIsProcessing(false);
    toast.success(
      `Discharge Clearance Finalized! Invoice ${newBill.id} generated and HealthPass synchronized.`
    );
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center text-slate-400 font-bold text-sm">
        Loading Inpatient Clearance Dossier...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
        <AlertTriangle size={36} className="text-amber-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Reservation Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The booking ID `{bookingIdParam}` could not be resolved in the live hospital registry.
        </p>
        <Link
          href="/hospital/dashboard/bookings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          <ArrowLeft size={14} /> Back to Booking Management
        </Link>
      </div>
    );
  }

  const isCheckedIn = booking.booking_status === "Checked-In";
  const isPending = booking.booking_status === "Pending";
  const isConfirmed = booking.booking_status === "Confirmed";
  const isCompleted = booking.booking_status === "Completed" || isSettled;

  return (
    <div className="w-full space-y-6 pb-20">
      <Toaster position="top-right" richColors />

      {/* Top Header & Navigation Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/hospital/dashboard/bookings"
            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            title="Back to Bookings"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Inpatient Clearance & Billing Dossier
              </h1>
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                {booking.id}
              </span>
              <span
                className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs ${
                  isCompleted
                    ? "bg-slate-900 text-white"
                    : isCheckedIn
                    ? "bg-purple-600 text-white"
                    : isConfirmed
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                ● {booking.booking_status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Singapore-standard admission verification, multi-department ledger settlement, and HealthPass sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck size={14} className="text-emerald-600" />
            Verified Emergency HealthPass
          </span>
          <button
            onClick={() => window.print()}
            className="h-10 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={15} /> Print Invoice
          </button>
        </div>
      </div>

      {/* Main Grid: Left Dossier (42%) + Right Billing Clearance (58%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient & Suite Profile (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Patient Medical Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                1. Patient Identity & Clinical History
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Smart UID Synced
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shrink-0">
                {booking.patient_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {booking.patient_name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone size={12} className="text-slate-400" /> {booking.patient_phone}
                </p>
                <p className="text-[11px] font-mono font-semibold text-slate-400 mt-0.5">
                  NID: {booking.patient_nid || "1982 5501 9283 1102"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Age / Gender</span>
                <span className="font-bold text-slate-800">{booking.patient_age || 42} Yrs • {booking.patient_gender || "Male"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Blood Group</span>
                <span className="font-black text-rose-600">{booking.patient_blood_group || "O+"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">HealthPass ID</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">HP-2026-9481</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Primary Diagnosis & Admitting Physician
              </span>
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <p className="font-bold text-emerald-900">
                  {booking.diagnosis || "Acute Cardiac Evaluation & Inpatient Care"}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Attending: <strong>{booking.attending_doctor || "Prof. Dr. Anisur Rahman"}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Allocated Bed Suite Specifications */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                2. Allocated Clinical Suite
              </span>
              <span className="text-xs font-bold text-emerald-700">
                BDT {dailyRate.toLocaleString()} / day
              </span>
            </div>

            {/* Room Photo */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
              <img
                src={
                  (bed?.images && bed.images[0]) ||
                  bed?.image ||
                  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
                }
                alt={booking.bed_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                {booking.bed_id}
              </div>
              <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                {booking.bed_category}
              </div>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900">
                {booking.bed_name || `${booking.bed_category} Suite ${booking.bed_id}`}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {bed?.ward || "Level 4 - Royal Executive Wing"} • {bed?.roomNumber || "Suite 402"}
              </p>
            </div>

            {/* Stay Timeline */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Check-In Date</span>
                <span className="font-bold text-slate-900">{booking.check_in_date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Discharge / Clearance</span>
                <span className="font-bold text-slate-900">
                  {booking.check_out_date || new Date().toISOString().split("T")[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Interactive Inpatient Billing & Settlement Ledger (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Inpatient Billing & Financial Clearance
              </h3>
              <p className="text-xs text-slate-500">
                Adjust clinical charges, deduct advance deposits, and settle final payments
              </p>
            </div>
            <span
              className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {isCompleted ? "Payment Cleared" : "Clearance In Progress"}
            </span>
          </div>

          {/* Itemized Line-Items Ledger */}
          <div className="space-y-3.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Itemized Departmental Charges
            </span>

            {/* Line 1: Bed Charges */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  1. Clinical Suite Stay ({stayDays} Days @ BDT {dailyRate.toLocaleString()}/day)
                </span>
                <span className="text-[11px] text-slate-500">
                  Includes daily nursing supervision, bed linen sanitization, and room utilities.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">Days:</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={stayDays}
                    onChange={(e) => setStayDays(Number(e.target.value))}
                    disabled={isCompleted}
                    className="w-14 h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 text-center"
                  />
                </div>
                <strong className="text-sm font-black text-slate-900 w-28 text-right">
                  BDT {bedTotalCharges.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Line 2: Physician & Consultant Fees */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  2. Consultant Doctor & Specialist Visits
                </span>
                <span className="text-[11px] text-slate-500">
                  Daily bedside rounds and clinical review by {booking.attending_doctor}.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-slate-400">BDT</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={doctorFees}
                  onChange={(e) => setDoctorFees(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-28 h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 text-right"
                />
              </div>
            </div>

            {/* Line 3: Pharmacy & Medications */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  3. Inpatient Pharmacy & Medications
                </span>
                <span className="text-[11px] text-slate-500">
                  IV antibiotics, infusions, and prescription medicines administered.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-slate-400">BDT</span>
                <input
                  type="number"
                  min={0}
                  step={200}
                  value={pharmacyFees}
                  onChange={(e) => setPharmacyFees(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-28 h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 text-right"
                />
              </div>
            </div>

            {/* Line 4: Diagnostics & Lab Panels */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  4. Diagnostics & Pathology Panels
                </span>
                <span className="text-[11px] text-slate-500">
                  ECG 12-lead, CBC, electrolyte profile, and troponin cardiac biomarker tests.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-slate-400">BDT</span>
                <input
                  type="number"
                  min={0}
                  step={200}
                  value={diagnosticsFees}
                  onChange={(e) => setDiagnosticsFees(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-28 h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 text-right"
                />
              </div>
            </div>

            {/* Line 5: Nursing & Service Fee */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  5. Specialized Nursing & Sanitization Protocols
                </span>
                <span className="text-[11px] text-slate-500">
                  24/7 dedicated nurse monitoring, oxygen flow, and bio-waste disposal.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-slate-400">BDT</span>
                <input
                  type="number"
                  min={0}
                  step={200}
                  value={nursingFees}
                  onChange={(e) => setNursingFees(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-28 h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 text-right"
                />
              </div>
            </div>
          </div>

          {/* Financial Balance Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Gross Inpatient Bill Total:</span>
              <span className="font-bold text-white text-sm">BDT {grossTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Hospital Concession / Discount:</span>
              <div className="flex items-center gap-1">
                <span className="text-emerald-400 font-bold">- BDT</span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-20 h-7 px-1.5 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 text-right outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-300 pt-1 border-t border-slate-800">
              <span className="text-blue-300">Advance Deposit Deducted (Paid on Booking):</span>
              <span className="font-bold text-blue-300 text-sm">
                - BDT {advanceDeposit.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Net Balance Payable (Discharge Due)
                </span>
                <p className="text-[10px] text-slate-400">Final clearance required before patient departure</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">
                  BDT {netPayable.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Transaction Reference */}
          {!isCompleted && (
            <div className="p-4 rounded-xl border border-slate-200/90 space-y-3 bg-white">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                Clearance Payment Settlement Method
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["bKash", "Nagad", "Card", "Cash"] as PaymentMethod[]).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(pm)}
                    className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      selectedPaymentMethod === pm
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Transaction Reference / Gateway ID
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. TXN-99412 or POS-AUTH-4410"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Action Pipeline Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              href="/hospital/dashboard/bookings"
              className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors"
            >
              Back to Bookings
            </Link>

            {/* Case A: If Pending or Confirmed, allow Check-In */}
            {(isPending || isConfirmed) && (
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                disabled={isProcessing}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <UserCheck size={16} />
                {isProcessing ? "Checking In..." : "Confirm Inpatient Check-In & Suite Allocation"}
              </button>
            )}

            {/* Case B: If Checked-In, allow Final Bill Settlement & Discharge */}
            {isCheckedIn && (
              <button
                type="button"
                onClick={handleSettleFinalBill}
                disabled={isProcessing}
                className="w-full sm:w-auto h-11 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                {isProcessing ? "Settling Inpatient Bill..." : "Confirm & Settle Final Bill (Discharge)"}
              </button>
            )}

            {/* Case C: If Completed, show Settled badge */}
            {isCompleted && (
              <div className="w-full sm:w-auto h-11 px-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center justify-center gap-2">
                <Check size={16} className="text-emerald-600" />
                Discharged & Account Settled in HealthPass
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
