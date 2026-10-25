"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Plus,
  Trash2,
  Tag,
  Percent,
  FileCheck,
  Stethoscope,
  QrCode,
  Download,
  X,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import type {
  BedBooking,
  PaymentMethod,
  BedGig,
  HospitalBill,
} from "@/types/hospital-hms";
import {
  getBookingById,
  updateBookingStatus,
  getHospitalBeds,
  updateBedStatus,
  saveHospitalBill,
  saveHospitalAdmission,
  syncDischargeToHealthPass,
  type HealthPassDischargeRecord,
} from "@/lib/hospital-hms";
import { InpatientDossierSkeleton } from "@/components/hospital/Skeleton";

interface CustomBillItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface MedicationRx {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingIdParam = (params?.id as string) || "";

  const [booking, setBooking] = useState<BedBooking | null>(null);
  const [bed, setBed] = useState<BedGig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Billing Ledger Base Items
  const [stayDays, setStayDays] = useState<number>(3);
  const [dailyRate, setDailyRate] = useState<number>(15000);
  const [doctorFees, setDoctorFees] = useState<number>(5000);
  const [pharmacyFees, setPharmacyFees] = useState<number>(4200);
  const [diagnosticsFees, setDiagnosticsFees] = useState<number>(3800);
  const [nursingFees, setNursingFees] = useState<number>(2500);
  const [advanceDeposit, setAdvanceDeposit] = useState<number>(20000);

  // Additional Custom Procedures / Consumables
  const [customItems, setCustomItems] = useState<CustomBillItem[]>([]);
  const [newCustomDesc, setNewCustomDesc] = useState("");
  const [newCustomCategory, setNewCustomCategory] = useState("Surgical / OT");
  const [newCustomAmount, setNewCustomAmount] = useState<number>(0);
  const [showAddCustomItem, setShowAddCustomItem] = useState(false);

  // Discount & Concession Engine
  const [discountMode, setDiscountMode] = useState<"percentage" | "fixed">("percentage");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountFixed, setDiscountFixed] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>("None");
  const [discountAuthorizer, setDiscountAuthorizer] = useState<string>("Medical Director");

  // Payment Settlement Fields
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("bKash");
  const [transactionRef, setTransactionRef] = useState(`TXN-HP-${Math.floor(10000 + Math.random() * 90000)}`);

  // Clinical Discharge Summary & Prescription
  const [dischargeCondition, setDischargeCondition] = useState<string>("Clinically Recovered");
  const [clinicalNotes, setClinicalNotes] = useState(
    "Patient treated for cardiac arrhythmia under continuous telemetry. Vitals stable upon final clinical examination. Approved for discharge with home regimen."
  );
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [medications, setMedications] = useState<MedicationRx[]>([
    { name: "Tab. Rosuvastatin", dosage: "10mg", frequency: "0+0+1 (At Night)", duration: "30 Days" },
    { name: "Tab. Bisoprolol", dosage: "2.5mg", frequency: "1+0+0 (Morning)", duration: "30 Days" },
    { name: "Tab. Pantoprazole", dosage: "40mg", frequency: "1+0+1 (Before Meals)", duration: "14 Days" },
  ]);

  // Action & Modal States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string>("");

  // Load Booking & Bed Data
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
      if (b.booking_status === "Completed") {
        setIsSettled(true);
        setLastInvoiceId(`INV-${b.id.replace(/[^0-9]/g, "") || "948210"}`);
      }

      const allBeds = getHospitalBeds();
      const matchBed = allBeds.find((bd) => bd.id === b.bed_id);
      if (matchBed) setBed(matchBed);
    }
    setIsLoading(false);
  }, [bookingIdParam]);

  // Financial Calculations
  const bedTotalCharges = useMemo(() => stayDays * dailyRate, [stayDays, dailyRate]);
  const customItemsTotal = useMemo(
    () => customItems.reduce((acc, curr) => acc + curr.total, 0),
    [customItems]
  );

  const grossTotal = useMemo(
    () =>
      bedTotalCharges +
      doctorFees +
      pharmacyFees +
      diagnosticsFees +
      nursingFees +
      customItemsTotal,
    [bedTotalCharges, doctorFees, pharmacyFees, diagnosticsFees, nursingFees, customItemsTotal]
  );

  // Concession / Discount Calculation
  const calculatedDiscount = useMemo(() => {
    if (discountMode === "percentage") {
      return Math.round((grossTotal * discountPercent) / 100);
    }
    return Math.min(grossTotal, discountFixed);
  }, [grossTotal, discountMode, discountPercent, discountFixed]);

  const netPayable = useMemo(
    () => Math.max(0, grossTotal - calculatedDiscount - advanceDeposit),
    [grossTotal, calculatedDiscount, advanceDeposit]
  );

  // Preset discount handler
  const handleDiscountReasonChange = (reason: string) => {
    setDiscountReason(reason);
    if (reason === "None") {
      setDiscountPercent(0);
      setDiscountFixed(0);
    } else if (reason.includes("Senior Citizen")) {
      setDiscountMode("percentage");
      setDiscountPercent(10);
    } else if (reason.includes("Hospital Staff")) {
      setDiscountMode("percentage");
      setDiscountPercent(15);
    } else if (reason.includes("Poor Patient")) {
      setDiscountMode("percentage");
      setDiscountPercent(50);
    } else if (reason.includes("Corporate Partner")) {
      setDiscountMode("percentage");
      setDiscountPercent(12);
    } else if (reason.includes("Director Waiver")) {
      setDiscountMode("fixed");
      setDiscountFixed(5000);
    }
  };

  // Add Custom Line Item
  const handleAddCustomItem = () => {
    if (!newCustomDesc.trim() || newCustomAmount <= 0) {
      toast.error("Please enter a valid description and charge amount.");
      return;
    }
    const newItem: CustomBillItem = {
      id: `custom-${Date.now()}`,
      category: newCustomCategory,
      description: newCustomDesc.trim(),
      quantity: 1,
      unitPrice: newCustomAmount,
      total: newCustomAmount,
    };
    setCustomItems((prev) => [...prev, newItem]);
    setNewCustomDesc("");
    setNewCustomAmount(0);
    setShowAddCustomItem(false);
    toast.success(`Added ${newItem.description} (BDT ${newItem.total.toLocaleString()}) to ledger.`);
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

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

  // 1-Click Complete & Settle Final Bill (Discharge with HealthPass Sync)
  const handleSettleFinalBill = () => {
    if (!booking) return;
    setIsProcessing(true);

    const generatedInvoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const finalPaidTotal = grossTotal - calculatedDiscount;
    const dischargeDate = new Date().toISOString().split("T")[0];

    // 1. Update Booking to Completed
    const updated = updateBookingStatus(booking.id, "Completed", "Fully Paid", finalPaidTotal);
    const refreshed = updated.find((b) => b.id === booking.id) || null;
    setBooking(refreshed);

    // 2. Build Itemized Hospital Bill
    const billItems = [
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
        description: "Consultant Physician Daily Visits & Clinical Rounds",
        category: "Physician Fee",
        quantity: 1,
        unitPrice: doctorFees,
        total: doctorFees,
      },
      {
        id: "item-pharm",
        description: "Dispensed Inpatient Medications & Infusion Sets",
        category: "Medications",
        quantity: 1,
        unitPrice: pharmacyFees,
        total: pharmacyFees,
      },
      {
        id: "item-diag",
        description: "Cardiopulmonary & Clinical Pathology Diagnostics",
        category: "Diagnostics",
        quantity: 1,
        unitPrice: diagnosticsFees,
        total: diagnosticsFees,
      },
      {
        id: "item-nurse",
        description: "24/7 Nursing Telemetry & Infection Sanitization",
        category: "Nursing & Service",
        quantity: 1,
        unitPrice: nursingFees,
        total: nursingFees,
      },
      ...customItems.map((ci) => ({
        id: ci.id,
        description: ci.description,
        category: ci.category,
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
        total: ci.total,
      })),
    ];

    const newBill: HospitalBill = {
      id: generatedInvoiceId,
      admission_id: booking.id,
      booking_id: booking.id,
      patient_name: booking.patient_name,
      patient_phone: booking.patient_phone,
      patient_nid: booking.patient_nid,
      bed_name: `${booking.bed_name} (${booking.bed_id})`,
      admission_date: booking.check_in_date,
      discharge_date: dischargeDate,
      days_admitted: stayDays,
      items: billItems,
      bed_total: bedTotalCharges,
      doctor_fee: doctorFees,
      pharmacy_total: pharmacyFees,
      diagnostics_total: diagnosticsFees,
      nursing_fee: nursingFees,
      gross_total: grossTotal,
      deposit_paid: advanceDeposit,
      discount: calculatedDiscount,
      net_payable: 0,
      payment_status: "Paid",
      payment_method: selectedPaymentMethod,
      transaction_ref: transactionRef,
      created_at: new Date().toISOString(),
    };

    saveHospitalBill(newBill);

    // 3. Move Bed to Cleaning / Sanitization Protocol
    updateBedStatus(booking.bed_id, "Cleaning");

    // 4. DIRECT HEALTHPASS AUTOMATIC SYNCHRONIZATION
    const dischargeRecord: HealthPassDischargeRecord = {
      patient_phone: booking.patient_phone,
      patient_name: booking.patient_name,
      patient_age: booking.patient_age,
      patient_gender: booking.patient_gender,
      patient_blood_group: booking.patient_blood_group,
      patient_nid: booking.patient_nid,
      smart_card_uid: `HP-2026-${booking.id.replace(/[^0-9]/g, "").slice(0, 5) || "94821"}`,
      booking_id: booking.id,
      admission_id: booking.id,
      invoice_id: generatedInvoiceId,
      bed_id: booking.bed_id,
      bed_name: booking.bed_name,
      bed_category: booking.bed_category,
      admission_date: booking.check_in_date,
      discharge_date: dischargeDate,
      stay_days: stayDays,
      primary_diagnosis: booking.diagnosis || "Elective Inpatient Care",
      attending_doctor: booking.attending_doctor,
      gross_total: grossTotal,
      discount_amount: calculatedDiscount,
      discount_reason: discountReason !== "None" ? discountReason : undefined,
      advance_deposit: advanceDeposit,
      net_paid: finalPaidTotal,
      payment_method: selectedPaymentMethod,
      transaction_ref: transactionRef,
      discharge_condition: dischargeCondition,
      clinical_advice: clinicalNotes,
      medications: medications,
      follow_up_date: followUpDate,
      cleared_at: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    syncDischargeToHealthPass(dischargeRecord);

    setLastInvoiceId(generatedInvoiceId);
    setIsSettled(true);
    setIsProcessing(false);
    toast.success(
      `Discharge Clearance Finalized! Invoice ${generatedInvoiceId} generated and HealthPass synchronized successfully.`
    );
  };

  const handleTriggerPrint = () => {
    setShowPrintModal(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-20">
        <div className="h-20 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-48 h-5 rounded bg-slate-200/60 skeleton-shimmer" />
            <div className="w-72 h-3 rounded bg-slate-100 skeleton-shimmer" />
          </div>
          <div className="w-32 h-9 rounded-xl bg-slate-100 skeleton-shimmer" />
        </div>
        <InpatientDossierSkeleton />
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

      {/* 1. Top Clinical Letterhead & Action Bar */}
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck size={14} className="text-emerald-600" />
            Verified HealthPass Registry
          </span>

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Printer size={15} /> Print / Save PDF Invoice
          </button>
        </div>
      </div>

      {/* 2. Main Inpatient Console: Left Profile (5 Cols) + Right Financial Ledger (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient Demographic, Bed Suite & Discharge Advice */}
        <div className="lg:col-span-5 space-y-5">
          {/* Patient Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                1. Patient Identity & Clinical History
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Auto-Synced to HealthPass
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
                <span className="font-bold text-slate-800">
                  {booking.patient_age || 42} Yrs • {booking.patient_gender || "Male"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Blood Group</span>
                <span className="font-black text-rose-600">{booking.patient_blood_group || "O+"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">HealthPass ID</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">
                  HP-2026-{booking.id.replace(/[^0-9]/g, "").slice(0, 5) || "94821"}
                </span>
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
                  Attending Consultant: <strong>{booking.attending_doctor || "Prof. Dr. Anisur Rahman"}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Allocated Bed Suite Specifications */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                2. Allocated Inpatient Ward Suite
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

          {/* Clinical Discharge Summary & Post-Care Advice Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                3. Clinical Discharge Advice & Rx
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Discharge Protocol
              </span>
            </div>

            {/* Discharge Condition */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Discharge Clinical Condition
              </label>
              <select
                value={dischargeCondition}
                onChange={(e) => setDischargeCondition(e.target.value)}
                disabled={isCompleted}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-emerald-500"
              >
                <option value="Clinically Recovered">Clinically Recovered (Full Recovery)</option>
                <option value="Hemodynamically Stable">Hemodynamically Stable (Continue Meds at Home)</option>
                <option value="Requires Home Observation">Requires Home Observation & Daily Monitoring</option>
                <option value="Transferred / Referred">Transferred / Referred for Rehabilitation</option>
              </select>
            </div>

            {/* Clinical Remarks */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Attending Physician Discharge Notes
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                disabled={isCompleted}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium leading-relaxed bg-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Prescribed Discharge Medications */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Post-Discharge Medication Regimen
              </span>
              <div className="space-y-1.5">
                {medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{med.name} {med.dosage}</span>
                      <span className="text-[11px] text-slate-500">{med.frequency} • {med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Next Follow-Up Consultation Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                disabled={isCompleted}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Full Interactive Inpatient Billing, Discount & Settlement Ledger (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Inpatient Billing & Financial Clearance
              </h3>
              <p className="text-xs text-slate-500">
                Adjust clinical charges, apply concessions/discounts, and execute final HealthPass clearance
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

          {/* Departmental Line Items */}
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

            {/* Line 6+: Dynamic Custom Line Items */}
            {customItems.map((ci) => (
              <div
                key={ci.id}
                className="p-3.5 rounded-xl border border-purple-200/70 bg-purple-50/20 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {ci.description} ({ci.category})
                  </span>
                  <span className="text-[11px] text-slate-500">Additional Procedure Charge</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">
                    BDT {ci.total.toLocaleString()}
                  </span>
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomItem(ci.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Custom Bill Item Form */}
            {!isCompleted && (
              <div className="pt-1">
                {!showAddCustomItem ? (
                  <button
                    type="button"
                    onClick={() => setShowAddCustomItem(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add Additional Procedure / Diagnostic / Consumable
                  </button>
                ) : (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Add Procedure Charge</span>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomItem(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Description (e.g. Blood Transfusion)"
                        value={newCustomDesc}
                        onChange={(e) => setNewCustomDesc(e.target.value)}
                        className="h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-emerald-500"
                      />
                      <select
                        value={newCustomCategory}
                        onChange={(e) => setNewCustomCategory(e.target.value)}
                        className="h-8.5 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-emerald-500"
                      >
                        <option value="Surgical / OT">Surgical / OT</option>
                        <option value="Blood Bank">Blood Bank</option>
                        <option value="Physiotherapy">Physiotherapy</option>
                        <option value="Ambulance">Ambulance</option>
                        <option value="Other">Other Procedure</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Amount (BDT)"
                          min={0}
                          value={newCustomAmount || ""}
                          onChange={(e) => setNewCustomAmount(Number(e.target.value))}
                          className="h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-emerald-500 w-full"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomItem}
                          className="h-8.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Concession & Discount Engine (As explicitly requested by user) */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Tag size={13} className="text-emerald-600" />
                Hospital Concession & Discount Engine
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                - BDT {calculatedDiscount.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Concession Policy / Reason
                </label>
                <select
                  value={discountReason}
                  onChange={(e) => handleDiscountReasonChange(e.target.value)}
                  disabled={isCompleted}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="None">None (Standard Billing)</option>
                  <option value="Senior Citizen Concession (10%)">Senior Citizen Concession (10%)</option>
                  <option value="Hospital Staff / Welfare (15%)">Hospital Staff / Welfare (15%)</option>
                  <option value="Poor Patient Relief Fund / Zakat">Poor Patient Support / Zakat Fund</option>
                  <option value="Corporate Partner / Insurance Policy (12%)">
                    Corporate Partner Policy (12%)
                  </option>
                  <option value="Director Special Clinical Waiver">Director Special Clinical Waiver</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Discount Value Mode
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => setDiscountMode("percentage")}
                      disabled={isCompleted}
                      className={`px-2.5 py-1 text-xs font-bold ${
                        discountMode === "percentage" ? "bg-slate-900 text-white" : "text-slate-600"
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMode("fixed")}
                      disabled={isCompleted}
                      className={`px-2.5 py-1 text-xs font-bold ${
                        discountMode === "fixed" ? "bg-slate-900 text-white" : "text-slate-600"
                      }`}
                    >
                      BDT
                    </button>
                  </div>

                  {discountMode === "percentage" ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      disabled={isCompleted}
                      placeholder="e.g. 10%"
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <input
                      type="number"
                      min={0}
                      value={discountFixed}
                      onChange={(e) => setDiscountFixed(Number(e.target.value))}
                      disabled={isCompleted}
                      placeholder="e.g. 2000"
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Financial Balance Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Gross Inpatient Charges Total:</span>
              <span className="font-bold text-white text-sm">BDT {grossTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>Hospital Concession Deducted:</span>
                {discountReason !== "None" && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                    {discountReason}
                  </span>
                )}
              </span>
              <span className="font-bold text-emerald-400 text-sm">
                - BDT {calculatedDiscount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-300 pt-1 border-t border-slate-800">
              <span className="text-blue-300">Advance Deposit Deducted (Booking Pre-Payment):</span>
              <span className="font-bold text-blue-300 text-sm">
                - BDT {advanceDeposit.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Net Balance Payable (Discharge Due)
                </span>
                <p className="text-[10px] text-slate-400">
                  {netPayable === 0
                    ? "Full Account Settled. Ready for Official Discharge."
                    : "Final clearance required before patient release."}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-2xl font-black ${
                    netPayable === 0 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  BDT {netPayable.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Payment Method & Transaction Reference */}
          {!isCompleted && (
            <div className="p-4 rounded-xl border border-slate-200/90 space-y-3 bg-white">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                Discharge Payment Settlement Method
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
                  Transaction Reference / Gateway Authorization
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

          {/* 6. Action Pipeline Footer */}
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
                {isProcessing ? "Settling Inpatient Bill..." : "Confirm & Settle Final Bill (Discharge Patient)"}
              </button>
            )}

            {/* Case C: If Completed, show Settled & Print button */}
            {isCompleted && (
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="h-11 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center justify-center gap-2">
                  <Check size={16} className="text-emerald-600" />
                  Account Settled & HealthPass Synced
                </div>
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer size={15} /> Print / Save PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Official Printable Hospital Tax Invoice & Discharge Certificate (Modal & Print Layout) */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
            {/* Modal Controls (Hidden in actual print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-base font-black text-slate-900">
                  Official Inpatient Tax Invoice & Discharge Summary
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> Print Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL LETTERHEAD DOCUMENT */}
            <div id="hospital-printable-invoice" className="p-2 sm:p-4 text-slate-800 space-y-6">
              {/* Hospital Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    OXPECKER SPECIALIZED MEDICAL CENTER
                  </h2>
                  <p className="text-xs font-bold text-slate-600">
                    Inpatient Clinical Pavilion & Super-Specialty Healthcare
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    House 42, Road 9/A, Dhanmondi, Dhaka-1205 | Hotline: 10616 | Tel: +880 2 9112233
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    DGHS Reg: HMS-DH-2026-904 • Tax BIN: 001928374-0101
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded bg-slate-900 text-white text-xs font-black uppercase tracking-wider mb-1">
                    TAX INVOICE & DISCHARGE
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-800">
                    Invoice: {lastInvoiceId || `INV-${booking.id.replace(/[^0-9]/g, "") || "948210"}`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Date: {new Date().toISOString().split("T")[0]}
                  </p>
                </div>
              </div>

              {/* Patient & Admission Demographic Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-1">
                  <p>
                    <span className="text-slate-500 font-medium">Patient Name:</span>{" "}
                    <strong className="text-slate-900 text-sm">{booking.patient_name}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Age / Gender / Blood:</span>{" "}
                    <strong>
                      {booking.patient_age || 42} Yrs / {booking.patient_gender || "Male"} / {booking.patient_blood_group || "O+"}
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Contact Phone:</span>{" "}
                    <strong className="font-mono">{booking.patient_phone}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Smart HealthPass UID:</span>{" "}
                    <strong className="font-mono text-emerald-800">
                      HP-2026-{booking.id.replace(/[^0-9]/g, "").slice(0, 5) || "94821"}
                    </strong>
                  </p>
                </div>

                <div className="space-y-1 text-right">
                  <p>
                    <span className="text-slate-500 font-medium">Bed & Ward:</span>{" "}
                    <strong className="text-slate-900">{booking.bed_id} ({booking.bed_category})</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Attending Consultant:</span>{" "}
                    <strong>{booking.attending_doctor}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Admission Date:</span>{" "}
                    <strong>{booking.check_in_date}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Discharge Date:</span>{" "}
                    <strong>{new Date().toISOString().split("T")[0]} ({stayDays} Days Stay)</strong>
                  </p>
                </div>
              </div>

              {/* Itemized Billing Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3">SL</th>
                      <th className="py-2.5 px-3">Department / Charge Description</th>
                      <th className="py-2.5 px-3 text-center">Qty / Days</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate (BDT)</th>
                      <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-2 px-3 text-slate-500">1</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        Inpatient Suite & Ward Accommodation ({booking.bed_name})
                      </td>
                      <td className="py-2 px-3 text-center">{stayDays}</td>
                      <td className="py-2 px-3 text-right">{dailyRate.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold">{bedTotalCharges.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-500">2</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        Consultant Physician Bedside Visits & Rounds
                      </td>
                      <td className="py-2 px-3 text-center">1</td>
                      <td className="py-2 px-3 text-right">{doctorFees.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold">{doctorFees.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-500">3</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        Dispensed Inpatient Medications & Infusion Therapy
                      </td>
                      <td className="py-2 px-3 text-center">1</td>
                      <td className="py-2 px-3 text-right">{pharmacyFees.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold">{pharmacyFees.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-500">4</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        Clinical Pathology & Cardiopulmonary Diagnostics
                      </td>
                      <td className="py-2 px-3 text-center">1</td>
                      <td className="py-2 px-3 text-right">{diagnosticsFees.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold">{diagnosticsFees.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-500">5</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        24/7 Nursing Telemetry, Oxygen & Sanitization Protocol
                      </td>
                      <td className="py-2 px-3 text-center">1</td>
                      <td className="py-2 px-3 text-right">{nursingFees.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold">{nursingFees.toLocaleString()}</td>
                    </tr>
                    {customItems.map((ci, idx) => (
                      <tr key={ci.id}>
                        <td className="py-2 px-3 text-slate-500">{6 + idx}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {ci.description} ({ci.category})
                        </td>
                        <td className="py-2 px-3 text-center">{ci.quantity}</td>
                        <td className="py-2 px-3 text-right">{ci.unitPrice.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-bold">{ci.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Ledger */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Gross Total Bill:</span>
                    <strong className="text-slate-900">BDT {grossTotal.toLocaleString()}</strong>
                  </div>

                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                      <span>Hospital Concession:</span>
                      <strong>- BDT {calculatedDiscount.toLocaleString()}</strong>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                    <span>Advance Booking Deposit:</span>
                    <strong>- BDT {advanceDeposit.toLocaleString()}</strong>
                  </div>

                  <div className="flex justify-between py-1.5 border-t-2 border-slate-900 text-sm font-black">
                    <span>Total Paid on Settlement:</span>
                    <span className="text-emerald-700">
                      BDT {(grossTotal - calculatedDiscount).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-500 font-bold text-[11px]">
                    <span>Net Balance Due:</span>
                    <span>BDT 0.00 (Fully Cleared)</span>
                  </div>
                </div>
              </div>

              {/* Clinical Discharge Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Clinical Discharge Advice & Prescription
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    Discharge Condition: {dischargeCondition}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {clinicalNotes}
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span>
                    <strong>Next Follow-up Chamber:</strong> {followUpDate} with {booking.attending_doctor}
                  </span>
                  <span className="font-mono text-slate-500">
                    Payment Method: {selectedPaymentMethod} ({transactionRef})
                  </span>
                </div>
              </div>

              {/* Official 4-Part Signature Bar */}
              <div className="pt-10 grid grid-cols-4 gap-4 text-center text-xs">
                <div className="border-t border-slate-400 pt-1.5">
                  <p className="font-bold text-slate-800">Prepared By</p>
                  <p className="text-[10px] text-slate-400">Billing Executive</p>
                </div>
                <div className="border-t border-slate-400 pt-1.5">
                  <p className="font-bold text-slate-800">Ward In-Charge</p>
                  <p className="text-[10px] text-slate-400">Nursing Supervisor</p>
                </div>
                <div className="border-t border-slate-400 pt-1.5">
                  <p className="font-bold text-slate-800">Accounts & Cashier</p>
                  <p className="text-[10px] text-slate-400">Paid & Discharged Stamp</p>
                </div>
                <div className="border-t border-slate-400 pt-1.5">
                  <p className="font-bold text-slate-800">Attending Consultant</p>
                  <p className="text-[10px] text-slate-400">Authorized Medical Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
