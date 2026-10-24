"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Search,
  Download,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Plus,
  BedDouble,
  DollarSign,
  ShieldCheck,
  Building,
  User,
  Sparkles,
  Layers,
} from "lucide-react";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import type { HospitalBill, BillItem, InpatientAdmission } from "@/types/hospital-hms";
import {
  getHospitalBills,
  saveHospitalBill,
  getHospitalAdmissions,
  dischargeHospitalPatient,
} from "@/lib/hospital-hms";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

export default function HospitalBillingPage() {
  const [bills, setBills] = useState<HospitalBill[]>([]);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"settled" | "running">("settled");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");

  // Modals
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<HospitalBill | null>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlingAdmission, setSettlingAdmission] = useState<InpatientAdmission | null>(null);

  // Settlement Form State
  const [settlementForm, setSettlementForm] = useState({
    doctor_fee: 6000,
    diagnostics_total: 4500,
    pharmacy_total: 5200,
    nursing_fee: 3000,
    discount: 0,
    payment_method: "bKash Merchant" as HospitalBill["payment_method"],
    notes: "Settled upon discharge clearance",
  });

  // Load Data on Mount
  useEffect(() => {
    setBills(getHospitalBills());
    setAdmissions(getHospitalAdmissions());
  }, []);

  // Filter Admitted Patients for Running Bills
  const currentInpatients = admissions.filter((a) => a.status === "Admitted");

  // Calculate Running Bill for an Inpatient
  const calculateRunningBill = (adm: InpatientAdmission) => {
    const admissionDate = new Date(adm.admission_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const bedTotal = days * adm.bed_daily_rate;
    const estimatedExtra = 8500; // Doctor + lab estimates
    const gross = bedTotal + estimatedExtra;
    const net = Math.max(0, gross - adm.initial_deposit);
    return { days, bedTotal, gross, net };
  };

  // Metrics
  const totalRevenue = bills
    .filter((b) => b.payment_status === "Paid")
    .reduce((sum, b) => sum + (b.net_payable || b.gross_total), 0);

  const pendingRevenue = bills
    .filter((b) => b.payment_status === "Pending")
    .reduce((sum, b) => sum + b.net_payable, 0);

  const totalInvoicesSettled = bills.filter((b) => b.payment_status === "Paid").length;

  // Search & Payment Method Filtered Bills
  const filteredBills = bills.filter((b) => {
    const matchesPayment =
      paymentMethodFilter === "All" || b.payment_method === paymentMethodFilter;
    if (!matchesPayment) return false;

    const q = search.toLowerCase();
    return (
      b.id.toLowerCase().includes(q) ||
      b.patient_name.toLowerCase().includes(q) ||
      b.bed_name.toLowerCase().includes(q) ||
      (b.booking_id || "").toLowerCase().includes(q) ||
      (b.patient_nid || "").includes(q)
    );
  });

  const paymentMethodOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Payment Methods", count: bills.length },
    {
      value: "bKash Merchant",
      label: "bKash Merchant",
      dotColor: "bg-pink-500",
      count: bills.filter((b) => b.payment_method === "bKash Merchant").length,
    },
    {
      value: "Nagad Gateway",
      label: "Nagad Gateway",
      dotColor: "bg-orange-500",
      count: bills.filter((b) => b.payment_method === "Nagad Gateway").length,
    },
    {
      value: "Credit/Debit Card",
      label: "Credit / Debit Card",
      dotColor: "bg-blue-500",
      count: bills.filter((b) => b.payment_method === "Credit/Debit Card").length,
    },
    {
      value: "Bank Wire Transfer",
      label: "Bank Wire Transfer",
      dotColor: "bg-emerald-500",
      count: bills.filter((b) => b.payment_method === "Bank Wire Transfer").length,
    },
    {
      value: "Cash Counter",
      label: "Cash Counter",
      dotColor: "bg-slate-500",
      count: bills.filter((b) => b.payment_method === "Cash Counter").length,
    },
  ];

  // Open Settle Modal for an Inpatient
  const handleOpenSettle = (adm: InpatientAdmission) => {
    setSettlingAdmission(adm);
    setSettlementForm({
      doctor_fee: 8000,
      diagnostics_total: 5500,
      pharmacy_total: 4800,
      nursing_fee: 3500,
      discount: 0,
      payment_method: "bKash Merchant",
      notes: "Routine discharge settlement after full recovery.",
    });
    setIsSettleModalOpen(true);
  };

  // Execute Settlement
  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingAdmission) return;

    const admissionDate = new Date(settlingAdmission.admission_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const bedTotal = days * settlingAdmission.bed_daily_rate;

    const items: BillItem[] = [
      {
        id: `item-bed-${Date.now()}`,
        description: `${settlingAdmission.bed_name} Stay (${days} Days @ ৳${settlingAdmission.bed_daily_rate.toLocaleString()}/day)`,
        category: "Bed Charges",
        quantity: days,
        unitPrice: settlingAdmission.bed_daily_rate,
        total: bedTotal,
      },
      {
        id: `item-doc-${Date.now()}`,
        description: `Consultant Clinical Rounds (${settlingAdmission.attending_doctor})`,
        category: "Physician Fee",
        quantity: days,
        unitPrice: Math.round(settlementForm.doctor_fee / days),
        total: settlementForm.doctor_fee,
      },
      {
        id: `item-diag-${Date.now()}`,
        description: "Inpatient Diagnostic Lab Panels & Imaging",
        category: "Diagnostics",
        quantity: 1,
        unitPrice: settlementForm.diagnostics_total,
        total: settlementForm.diagnostics_total,
      },
      {
        id: `item-pharm-${Date.now()}`,
        description: "Inpatient Pharmacy, Infusions & Disposables",
        category: "Medications",
        quantity: 1,
        unitPrice: settlementForm.pharmacy_total,
        total: settlementForm.pharmacy_total,
      },
      {
        id: `item-nurse-${Date.now()}`,
        description: "Specialized Ward Nursing & Vitals Telemetry",
        category: "Nursing & Service",
        quantity: days,
        unitPrice: Math.round(settlementForm.nursing_fee / days),
        total: settlementForm.nursing_fee,
      },
    ];

    const gross = bedTotal + settlementForm.doctor_fee + settlementForm.diagnostics_total + settlementForm.pharmacy_total + settlementForm.nursing_fee;
    const net = Math.max(0, gross - settlingAdmission.initial_deposit - settlementForm.discount);

    const newBill: HospitalBill = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      admission_id: settlingAdmission.id,
      patient_name: settlingAdmission.english_name || settlingAdmission.patient_name,
      patient_nid: settlingAdmission.nid_number,
      patient_phone: settlingAdmission.personal_phone,
      bed_name: settlingAdmission.bed_name,
      admission_date: settlingAdmission.admission_date,
      discharge_date: new Date().toISOString().split("T")[0],
      days_admitted: days,
      items,
      bed_total: bedTotal,
      doctor_fee: settlementForm.doctor_fee,
      pharmacy_total: settlementForm.pharmacy_total,
      diagnostics_total: settlementForm.diagnostics_total,
      nursing_fee: settlementForm.nursing_fee,
      gross_total: gross,
      deposit_paid: settlingAdmission.initial_deposit,
      discount: settlementForm.discount,
      net_payable: net,
      payment_method: settlementForm.payment_method,
      payment_status: "Paid",
      transaction_ref: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      created_at: `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };

    // Save Bill
    const updatedBills = saveHospitalBill(newBill);
    setBills(updatedBills);

    // Discharge Patient & Clean Bed
    dischargeHospitalPatient(settlingAdmission.id);
    setAdmissions(getHospitalAdmissions());

    setIsSettleModalOpen(false);
    setSelectedInvoiceForPrint(newBill);
    toast.success(`Inpatient bill ${newBill.id} settled. Patient cleared for discharge.`);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital Billing & Inpatient Financial Settlement
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Singapore Standard
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Running bed tariffs, automated diagnostic itemization, discharge settlements, and printable official vouchers.
          </p>
        </div>

        <button
          onClick={() => {
            if (currentInpatients.length > 0) {
              handleOpenSettle(currentInpatients[0]);
            } else {
              toast.info("No active inpatients currently admitted for settlement.");
            }
          }}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Receipt size={18} />
          Discharge & Settle Inpatient
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Settled Revenue
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ৳ {totalRevenue.toLocaleString()}
          </p>
          <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">
            {totalInvoicesSettled} Official vouchers paid
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Inpatient Running Bills
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {currentInpatients.length} Inpatients
          </p>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">
            Beds actively accumulating daily tariffs
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pending Clearance
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            ৳ {pendingRevenue.toLocaleString()}
          </p>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">
            Awaiting bank reconciliation
          </span>
        </div>
      </div>

      {/* View Switcher Tabs & Filter Toolbar with Popup */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab("settled")}
            className={`h-11 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "settled"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Settled Invoices ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab("running")}
            className={`h-11 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "running"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Live Inpatient Running Bills ({currentInpatients.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {activeTab === "settled" && (
            <div className="w-full sm:w-56 shrink-0">
              <CustomSelect
                value={paymentMethodFilter}
                onChange={(val) => setPaymentMethodFilter(val)}
                options={paymentMethodOptions}
                prefix="Payment:"
                icon={CreditCard}
                menuWidth="w-60"
              />
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: Settled Invoices Table */}
      {activeTab === "settled" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Patient Name & NID</th>
                  <th className="py-3 px-4">Bed Stay / Ward</th>
                  <th className="py-3 px-4">Gross Total</th>
                  <th className="py-3 px-4">Deposit / Net Paid</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBills.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">{inv.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.patient_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">NID: {inv.patient_nid}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 text-xs block">{inv.bed_name}</span>
                      <span className="text-[11px] text-slate-400">
                        {inv.days_admitted} days stay
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ৳ {inv.gross_total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-emerald-700 text-sm block">
                        ৳ {inv.net_payable.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Deposit: ৳{inv.deposit_paid.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-semibold">
                      {inv.payment_method}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                          inv.payment_status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 justify-end ml-auto cursor-pointer px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <Printer size={13} /> Official Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Live Inpatient Running Bills */}
      {activeTab === "running" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentInpatients.map((adm) => {
            const bill = calculateRunningBill(adm);
            return (
              <div
                key={adm.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Admitted Active
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {adm.english_name || adm.patient_name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Admission ID: {adm.id} • Admitted {adm.admission_date}
                      </p>
                    </div>

                    <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                      {bill.days} Days Inpatient
                    </span>
                  </div>

                  {/* Bed Info & Daily Rate */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Bed:</span>
                      <strong className="text-slate-900">{adm.bed_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bed Tariff:</span>
                      <strong>৳ {adm.bed_daily_rate.toLocaleString()} / day</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accumulated Bed Tariff ({bill.days}d):</span>
                      <strong className="text-emerald-700">৳ {bill.bedTotal.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Deposit Paid:</span>
                      <strong className="text-slate-700">- ৳ {adm.initial_deposit.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Estimated Net Outstanding
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      ৳ {bill.net.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenSettle(adm)}
                    className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    Settle & Discharge <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Discharge & Settlement Modal */}
      <AnimatePresence>
        {isSettleModalOpen && settlingAdmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettleModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200 custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Inpatient Final Bill Settlement
                    </h3>
                    <p className="text-xs text-slate-500">
                      Patient: {settlingAdmission.english_name || settlingAdmission.patient_name} • {settlingAdmission.bed_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettleModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleConfirmSettlement} className="mt-5 space-y-4">
                {/* Auto Calculated Bed Stay */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">Bed Stay Charges (Automated)</span>
                    <span className="text-slate-400">Rate: ৳{settlingAdmission.bed_daily_rate.toLocaleString()}/day</span>
                  </div>
                  <strong className="text-sm font-black text-slate-900">
                    ৳ {(calculateRunningBill(settlingAdmission).bedTotal).toLocaleString()}
                  </strong>
                </div>

                {/* Additional Clinical Charges */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Physician & Surgeon Fees (৳)
                    </label>
                    <input
                      type="number"
                      value={settlementForm.doctor_fee}
                      onChange={(e) => setSettlementForm({ ...settlementForm, doctor_fee: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Diagnostics & Lab Panels (৳)
                    </label>
                    <input
                      type="number"
                      value={settlementForm.diagnostics_total}
                      onChange={(e) => setSettlementForm({ ...settlementForm, diagnostics_total: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Pharmacy & Medications (৳)
                    </label>
                    <input
                      type="number"
                      value={settlementForm.pharmacy_total}
                      onChange={(e) => setSettlementForm({ ...settlementForm, pharmacy_total: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Specialized Nursing (৳)
                    </label>
                    <input
                      type="number"
                      value={settlementForm.nursing_fee}
                      onChange={(e) => setSettlementForm({ ...settlementForm, nursing_fee: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Deductions: Initial Deposit & Discount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Initial Deposit (Deducted)
                    </label>
                    <input
                      disabled
                      type="text"
                      value={`- ৳ ${settlingAdmission.initial_deposit.toLocaleString()}`}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Concession / Discount (৳)
                    </label>
                    <input
                      type="number"
                      value={settlementForm.discount}
                      onChange={(e) => setSettlementForm({ ...settlementForm, discount: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Settlement Payment Method
                  </label>
                  <select
                    value={settlementForm.payment_method}
                    onChange={(e) => setSettlementForm({ ...settlementForm, payment_method: e.target.value as HospitalBill["payment_method"] })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="bKash Merchant">bKash Merchant Payment</option>
                    <option value="Nagad">Nagad Merchant Payment</option>
                    <option value="City Bank POS">City Bank POS (Visa / Mastercard)</option>
                    <option value="Bank Transfer">Direct Bank Transfer</option>
                    <option value="Cash">Cash Counter Settlement</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSettleModalOpen(false)}
                    className="h-11 px-5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Confirm Settlement & Print Voucher
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Singapore-Standard Hospital Invoice Voucher Modal */}
      <AnimatePresence>
        {selectedInvoiceForPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 custom-scrollbar print:p-0 print:border-none print:shadow-none"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl">
                    +
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Oxpecker International Hospital
                    </h2>
                    <p className="text-xs text-slate-500">
                      JCI & DGHS Accredited Tertiary Medical Centre • Road 27, Dhanmondi, Dhaka
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer print:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Official Invoice Metadata */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Patient Details
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {selectedInvoiceForPrint.patient_name}
                  </p>
                  <p className="text-slate-600 mt-0.5">NID: {selectedInvoiceForPrint.patient_nid}</p>
                  <p className="text-slate-600">Cell: {selectedInvoiceForPrint.patient_phone}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Voucher Details
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {selectedInvoiceForPrint.id}
                  </p>
                  <p className="text-slate-600 mt-0.5">Admission: {selectedInvoiceForPrint.admission_date}</p>
                  <p className="text-slate-600">Discharged: {selectedInvoiceForPrint.discharge_date} ({selectedInvoiceForPrint.days_admitted} Days)</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Service Description</th>
                      <th className="py-2.5 px-3 text-center">Category</th>
                      <th className="py-2.5 px-3 text-center">Qty / Days</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedInvoiceForPrint.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{item.description}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{item.category}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">৳ {item.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">৳ {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Gross Total Hospital Charges:</span>
                  <strong className="text-slate-900">৳ {selectedInvoiceForPrint.gross_total.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Initial Inpatient Deposit Paid:</span>
                  <strong className="text-emerald-700">- ৳ {selectedInvoiceForPrint.deposit_paid.toLocaleString()}</strong>
                </div>
                {selectedInvoiceForPrint.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Discount / Hospital Concession:</span>
                    <strong className="text-emerald-700">- ৳ {selectedInvoiceForPrint.discount.toLocaleString()}</strong>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-black text-slate-900">Net Amount Settled:</span>
                  <strong className="text-base font-black text-emerald-700">
                    ৳ {selectedInvoiceForPrint.net_payable.toLocaleString()}
                  </strong>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Payment Method: <strong>{selectedInvoiceForPrint.payment_method}</strong> • Ref: {selectedInvoiceForPrint.transaction_ref}
                </div>
              </div>

              {/* Official Seal & Signature */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck size={14} /> Official Hospital Digital Seal • Verified
                  </span>
                </div>
                <div className="text-right">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span className="font-bold text-slate-700">Medical Superintendent</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="h-10 px-4 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer size={14} /> Print Invoice (PDF)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
