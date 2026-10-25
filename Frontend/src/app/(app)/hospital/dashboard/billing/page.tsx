"use client";

import { useState, useEffect, useMemo } from "react";
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
  Palette,
  FileText,
  FileCheck,
  Activity,
  Upload,
  Eye,
  Sliders,
  RefreshCw,
  Check,
  PhoneCall,
  QrCode,
  Tag,
  Stethoscope,
  Share2,
  Languages,
  ChevronDown,
  Building2,
  Wallet,
  Landmark,
  BadgePercent,
  CheckSquare,
} from "lucide-react";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import type {
  HospitalBill,
  BillItem,
  InpatientAdmission,
  HospitalThemeConfig,
  HospitalThemeStyle,
  HospitalTransactionRecord,
  HospitalBankAccount,
  ConcessionPolicyReason,
} from "@/types/hospital-hms";
import {
  getHospitalBills,
  saveHospitalBill,
  getHospitalAdmissions,
  dischargeHospitalPatient,
  getHospitalThemeConfig,
  saveHospitalThemeConfig,
  DEFAULT_HOSPITAL_THEME,
  getHospitalTransactions,
  recordHospitalTransaction,
  syncBillingAndTransaction,
  getHospitalBankAccounts,
  toBengaliNumerals,
} from "@/lib/hospital-hms";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

type ActiveTab = "settled" | "running" | "transactions" | "documents" | "branding";
type DocumentType = "invoice" | "discharge" | "lab" | "gatepass";
type PageLanguage = "en" | "bn";

export default function HospitalBillingPage() {
  const [bills, setBills] = useState<HospitalBill[]>([]);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [transactions, setTransactions] = useState<HospitalTransactionRecord[]>([]);
  const [bankAccounts, setBankAccounts] = useState<HospitalBankAccount[]>([]);
  const [themeConfig, setThemeConfig] = useState<HospitalThemeConfig>(DEFAULT_HOSPITAL_THEME);

  // Language State
  const [lang, setLang] = useState<PageLanguage>("en");
  const [docLang, setDocLang] = useState<PageLanguage>("en");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("settled");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [transactionMethodFilter, setTransactionMethodFilter] = useState("All");

  // Modals & Document Viewer
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<HospitalBill | null>(null);
  const [activeDocType, setActiveDocType] = useState<DocumentType>("invoice");
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlingAdmission, setSettlingAdmission] = useState<InpatientAdmission | null>(null);

  // Document Hub Selection
  const [selectedDocBill, setSelectedDocBill] = useState<HospitalBill | null>(null);

  // Bank Selector State inside Settlement Modal
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<HospitalBankAccount | null>(null);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  // Clinical Condition & Concession Popups State
  const [isConditionPopupOpen, setIsConditionPopupOpen] = useState(false);
  const [isConcessionPopupOpen, setIsConcessionPopupOpen] = useState(false);

  // Settlement Form State with HealthPass Clinical Details
  const [settlementForm, setSettlementForm] = useState({
    doctor_fee: 6000,
    diagnostics_total: 4500,
    pharmacy_total: 5200,
    nursing_fee: 3000,
    discount: 0,
    concession_reason: "Standard Clinical Concession" as ConcessionPolicyReason,
    bank_trx_id: "",
    cashier_name: "Farhan Tanvir (Desk #02)",
    primary_diagnosis: "Acute Coronary Syndrome (Post PTCA Stenting)",
    discharge_condition: "Cured / Stable" as "Cured / Stable" | "Improved" | "Referred" | "DOR (Discharged on Request)",
    attending_doctor: "Prof. Dr. M. A. Hashem, FRCP",
    clinical_advice: "Tab. Clopidogrel 75mg 1+0+0, Tab. Atorvastatin 20mg 0+0+1 for 30 days. Avoid heavy lifting. Review at OPD in 7 days.",
    notes: "Settled upon complete clinical recovery and discharge clearance.",
  });

  // Load Data on Mount
  useEffect(() => {
    setBills(getHospitalBills());
    setAdmissions(getHospitalAdmissions());
    setTransactions(getHospitalTransactions());
    const banks = getHospitalBankAccounts();
    setBankAccounts(banks);
    if (banks.length > 0) setSelectedBank(banks[0]);

    const loadedTheme = getHospitalThemeConfig();
    setThemeConfig(loadedTheme);

    const handleThemeChange = (e: CustomEvent<HospitalThemeConfig>) => {
      if (e.detail) setThemeConfig(e.detail);
    };
    window.addEventListener("hospital_theme_changed" as any, handleThemeChange);

    return () => {
      window.removeEventListener("hospital_theme_changed" as any, handleThemeChange);
    };
  }, []);

  // Filter Admitted Patients for Running Bills
  const currentInpatients = admissions.filter((a) => a.status === "Admitted");

  // Set default bill for Document Hub when bills load
  useEffect(() => {
    if (!selectedDocBill && bills.length > 0) {
      setSelectedDocBill(bills[0]);
    }
  }, [bills, selectedDocBill]);

  // Calculate Running Bill for an Inpatient
  const calculateRunningBill = (adm: InpatientAdmission) => {
    const admissionDate = new Date(adm.admission_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const bedTotal = days * adm.bed_daily_rate;
    const estimatedExtra = 8500;
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

  const totalLedgerAmount = transactions
    .filter((t) => t.status === "Settled")
    .reduce((sum, t) => sum + t.amount, 0);

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

  // Filtered Financial Transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesMethod =
      transactionMethodFilter === "All" || t.payment_method.toLowerCase().includes(transactionMethodFilter.toLowerCase());
    if (!matchesMethod) return false;

    const q = search.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.invoice_id.toLowerCase().includes(q) ||
      t.patient_name.toLowerCase().includes(q) ||
      t.reference_no.toLowerCase().includes(q) ||
      t.patient_phone.includes(q) ||
      (t.bank_trx_id || "").toLowerCase().includes(q) ||
      (t.bank_name || "").toLowerCase().includes(q) ||
      t.cashier_name.toLowerCase().includes(q)
    );
  });

  // Filtered Bank Accounts for Searchable Dropdown
  const filteredBankAccounts = useMemo(() => {
    if (!bankSearch.trim()) return bankAccounts;
    const q = bankSearch.toLowerCase();
    return bankAccounts.filter(
      (b) =>
        b.bank_name.toLowerCase().includes(q) ||
        b.account_number.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.branch_name.toLowerCase().includes(q)
    );
  }, [bankAccounts, bankSearch]);

  const paymentMethodOptions: CustomSelectOption<string>[] = [
    { value: "All", label: lang === "bn" ? "সকল পেমেন্ট মাধ্যম" : "All Payment Methods", count: bills.length },
    {
      value: "bKash Merchant Pay",
      label: "bKash Merchant Pay",
      dotColor: "bg-pink-500",
      count: bills.filter((b) => (b.payment_method || "").includes("bKash")).length,
    },
    {
      value: "Nagad Corporate",
      label: "Nagad Corporate",
      dotColor: "bg-orange-500",
      count: bills.filter((b) => (b.payment_method || "").includes("Nagad")).length,
    },
    {
      value: "City Bank Visa Card",
      label: "Credit / Debit Card",
      dotColor: "bg-blue-500",
      count: bills.filter((b) => (b.payment_method || "").includes("Card")).length,
    },
    {
      value: "Bank Wire Transfer",
      label: "Bank Wire Transfer",
      dotColor: "bg-emerald-500",
      count: bills.filter((b) => (b.payment_method || "").includes("Bank") || (b.payment_method || "").includes("Wire")).length,
    },
    {
      value: "Cash Counter",
      label: lang === "bn" ? "ক্যাশ কাউন্টার" : "Cash Counter",
      dotColor: "bg-slate-500",
      count: bills.filter((b) => (b.payment_method || "").includes("Cash")).length,
    },
  ];

  // Open Settle Modal for an Inpatient
  const handleOpenSettle = (adm: InpatientAdmission) => {
    setSettlingAdmission(adm);
    const defaultBank = bankAccounts[0] || null;
    setSelectedBank(defaultBank);
    setSettlementForm({
      doctor_fee: 8000,
      diagnostics_total: 5500,
      pharmacy_total: 4800,
      nursing_fee: 3500,
      discount: 0,
      concession_reason: "Standard Clinical Concession",
      bank_trx_id: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      cashier_name: "Farhan Tanvir (Desk #02)",
      primary_diagnosis: adm.primary_diagnosis || "Post-Procedural Recovery & Observation",
      discharge_condition: "Cured / Stable",
      attending_doctor: adm.attending_doctor || "Prof. Dr. M. A. Hashem, FRCP",
      clinical_advice: "Continue oral anticoagulants and antibiotics for 5 days. Schedule suture removal & clinical review at OPD in 7 days.",
      notes: "Routine discharge settlement after full medical stabilization.",
    });
    setIsSettleModalOpen(true);
  };

  // Execute Settlement with HealthPass & Financial Ledger Auto-Sync
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
        description: `Consultant Clinical Rounds (${settlementForm.attending_doctor})`,
        category: "Physician Fee",
        quantity: days,
        unitPrice: Math.round(settlementForm.doctor_fee / days),
        total: settlementForm.doctor_fee,
      },
      {
        id: `item-diag-${Date.now()}`,
        description: "Inpatient Diagnostic Lab Panels, ECG & Imaging",
        category: "Diagnostics",
        quantity: 1,
        unitPrice: settlementForm.diagnostics_total,
        total: settlementForm.diagnostics_total,
      },
      {
        id: `item-pharm-${Date.now()}`,
        description: "Inpatient Pharmacy, Infusions & Medical Disposables",
        category: "Medications",
        quantity: 1,
        unitPrice: settlementForm.pharmacy_total,
        total: settlementForm.pharmacy_total,
      },
      {
        id: `item-nurse-${Date.now()}`,
        description: "Specialized Ward Nursing, Telemetry & Vitals Monitoring",
        category: "Nursing & Service",
        quantity: days,
        unitPrice: Math.round(settlementForm.nursing_fee / days),
        total: settlementForm.nursing_fee,
      },
    ];

    const gross =
      bedTotal +
      settlementForm.doctor_fee +
      settlementForm.diagnostics_total +
      settlementForm.pharmacy_total +
      settlementForm.nursing_fee;
    const net = Math.max(
      0,
      gross - settlingAdmission.initial_deposit - settlementForm.discount
    );

    const chosenBankName = selectedBank ? selectedBank.bank_name : "Central Hospital Counter";
    const chosenAccountNo = selectedBank ? selectedBank.account_number : "Direct Counter";

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
      payment_method: chosenBankName,
      payment_status: "Paid",
      transaction_ref: settlementForm.bank_trx_id || `REF-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      bank_name: chosenBankName,
      bank_account_no: chosenAccountNo,
      bank_trx_id: settlementForm.bank_trx_id,
      concession_reason: settlementForm.discount > 0 ? settlementForm.concession_reason : undefined,
      created_at: `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };

    // Auto Synchronize to Bill, Financial Ledger, and Patient HealthPass History
    syncBillingAndTransaction({
      bill: newBill,
      cashier_name: settlementForm.cashier_name,
      notes: settlementForm.notes,
      bank_name: chosenBankName,
      bank_account_no: chosenAccountNo,
      bank_trx_id: settlementForm.bank_trx_id,
      concession_reason: settlementForm.concession_reason,
      dischargeInfo: {
        diagnosis: settlementForm.primary_diagnosis,
        condition: settlementForm.discharge_condition,
        doctor: settlementForm.attending_doctor,
        clinical_advice: settlementForm.clinical_advice,
      },
    });

    // Update state
    setBills(getHospitalBills());
    setTransactions(getHospitalTransactions());
    setAdmissions(getHospitalAdmissions());

    setIsSettleModalOpen(false);
    setSelectedInvoiceForPrint(newBill);
    setActiveDocType("invoice");

    toast.success(
      lang === "bn"
        ? `ইনপেশেন্ট বিল ${newBill.id} সফলভাবে পরিশোধিত। ব্যাংক ট্রানজেকশন ${settlementForm.bank_trx_id} হেলথপাসে সিঙ্ক হয়েছে!`
        : `Inpatient invoice ${newBill.id} settled via ${chosenBankName}. TXN #${settlementForm.bank_trx_id} recorded & synced to Patient HealthPass!`,
      { duration: 5000 }
    );
  };

  // Save Custom Theme & Watermark Settings
  const handleSaveThemeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveHospitalThemeConfig(themeConfig);
    toast.success(
      lang === "bn"
        ? "হাসপাতালের ব্র্যান্ডিং, থিম ও ওয়াটারমার্ক সেটিংস সফলভাবে সংরক্ষিত হয়েছে!"
        : "Hospital branding, custom theme & watermark settings saved successfully!",
      {
        description:
          lang === "bn"
            ? "সকল ভবিষ্যতের ইনভয়েস ও রিলিজ সার্টিফিকেটে এই ব্র্যান্ডিং স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।"
            : "All future invoices, discharge summaries and medical dossiers will now use this branding.",
      }
    );
  };

  // Upload Custom Logo Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file too large! Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setThemeConfig((prev) => ({
            ...prev,
            logo_url: event.target?.result as string,
          }));
          toast.success(lang === "bn" ? "হাসপাতালের লোগো আপলোড সম্পন্ন হয়েছে!" : "Custom hospital logo loaded!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Document Print / Preview opener
  const handleOpenDocPrint = (bill: HospitalBill, type: DocumentType) => {
    setSelectedInvoiceForPrint(bill);
    setActiveDocType(type);
  };

  // Helper theme styling classes
  const getThemeClasses = (style: HospitalThemeStyle) => {
    switch (style) {
      case "apollo":
        return {
          bannerBg: "bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white",
          accentColor: "text-amber-400",
          borderColor: "border-blue-200",
          tableHeadBg: "bg-blue-900 text-white",
          subtleBg: "bg-blue-50/60",
          badgeBorder: "border-blue-300 bg-blue-50 text-blue-800",
        };
      case "royal":
        return {
          bannerBg: "bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white",
          accentColor: "text-rose-400",
          borderColor: "border-purple-200",
          tableHeadBg: "bg-purple-950 text-white",
          subtleBg: "bg-purple-50/40",
          badgeBorder: "border-purple-300 bg-purple-50 text-purple-900",
        };
      case "minimal":
        return {
          bannerBg: "bg-slate-800 text-white",
          accentColor: "text-slate-200",
          borderColor: "border-slate-300",
          tableHeadBg: "bg-slate-700 text-white",
          subtleBg: "bg-slate-50",
          badgeBorder: "border-slate-300 bg-slate-100 text-slate-800",
        };
      case "singapore":
      default:
        return {
          bannerBg: "bg-gradient-to-r from-teal-900 via-emerald-900 to-[#0f1d33] text-white",
          accentColor: "text-emerald-400",
          borderColor: "border-emerald-200",
          tableHeadBg: "bg-teal-900 text-white",
          subtleBg: "bg-teal-50/50",
          badgeBorder: "border-emerald-300 bg-emerald-50 text-emerald-800",
        };
    }
  };

  const themeClasses = getThemeClasses(themeConfig.theme_style);

  // Format currency based on language
  const fmtMoney = (val: number) => {
    if (lang === "bn") {
      return `৳ ${toBengaliNumerals(val.toLocaleString())}`;
    }
    return `৳ ${val.toLocaleString()}`;
  };

  // Format currency specifically for documents
  const fmtDocMoney = (val: number) => {
    if (docLang === "bn") {
      return `৳ ${toBengaliNumerals(val.toLocaleString())}`;
    }
    return `৳ ${val.toLocaleString()}`;
  };

  const fmtDocNumber = (val: number | string) => {
    if (docLang === "bn") {
      return toBengaliNumerals(val);
    }
    return val.toString();
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto pb-16 ${lang === "bn" ? "font-hind" : ""}`}>
      <Toaster position="top-right" richColors />

      {/* Page Header with 1-Click Bilingual Language Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {lang === "bn" ? "বিলিং ও ফাইন্যান্সিয়াল নথি হাব" : "Billing & Financial Dossier"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck size={13} className="text-emerald-600" />
              {lang === "bn" ? "সিঙ্গাপুর জেসিআই মানদণ্ড" : "Singapore JCI Standard"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "bn"
              ? "ইনপেশেন্ট সম্পূর্ণ বিল নিষ্পত্তি, মাল্টি-ব্যাংক ট্রানজেকশন, কাস্টম ওয়াটারমার্ক ও স্বয়ংক্রিয় হেলথপাস সিঙ্ক্রোনাইজেশন"
              : "Complete Inpatient Settlement, Multi-Bank Ledger, Custom Watermark & Automatic HealthPass Synchronization"}
          </p>
        </div>

        {/* Global Quick Actions & Language Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 1-Click Bilingual Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setLang("en")}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer font-hind ${
                lang === "bn"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              বাংলা
            </button>
          </div>

          <button
            onClick={() => setActiveTab("branding")}
            className="h-10 px-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-all hover:bg-slate-50 cursor-pointer"
          >
            <Palette size={15} className="text-teal-600" />
            <span>{lang === "bn" ? "থিম ও ওয়াটারমার্ক" : "Theme & Watermark"}</span>
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className="h-10 px-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-all hover:bg-slate-50 cursor-pointer"
          >
            <FileText size={15} className="text-blue-600" />
            <span>{lang === "bn" ? "পেপারওয়ার্ক হাব" : "Paperwork Hub"}</span>
          </button>
        </div>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue Settled */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === "bn" ? "পরিশোধিত মোট রাজস্ব" : "Settled Revenue"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {fmtMoney(totalRevenue)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            {lang === "bn"
              ? `${toBengaliNumerals(totalInvoicesSettled)}টি ভাউচার পেইড ও সংরক্ষিত`
              : `${totalInvoicesSettled} vouchers cleared & locked`}
          </p>
        </div>

        {/* Metric 2: Inpatient Running Bills */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === "bn" ? "চলতি ইনপেশেন্ট বাকি" : "Running Inpatient Dues"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BedDouble size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">
              {lang === "bn"
                ? `${toBengaliNumerals(currentInpatients.length)}টি বেড`
                : `${currentInpatients.length} Beds`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock size={12} className="text-blue-500" />
            {lang === "bn" ? "দৈনিক শয্যা চার্জ যুক্ত হচ্ছে" : "Accumulating daily clinical tariffs"}
          </p>
        </div>

        {/* Metric 3: Financial Ledger Total */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === "bn" ? "ফাইন্যান্সিয়াল লেজার খাতা" : "Ledger Accounting"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">
              {fmtMoney(totalLedgerAmount)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Check size={12} className="text-purple-500" />
            {lang === "bn"
              ? `${toBengaliNumerals(transactions.length)}টি পৃথক ব্যাংক লেনদেন রেকর্ড`
              : `${transactions.length} separate financial records`}
          </p>
        </div>

        {/* Metric 4: Active Theme & Watermark */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === "bn" ? "অ্যাক্টিভ পেপার থিম" : "Active Paper Theme"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900 capitalize">
              {themeConfig.theme_style} Style
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {lang === "bn" ? "ওয়াটারমার্ক: " : "Watermark: "}
            {themeConfig.watermark_enabled ? `"${themeConfig.watermark_text}"` : lang === "bn" ? "বন্ধ" : "Off"}
          </p>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 custom-scrollbar">
        <button
          onClick={() => setActiveTab("settled")}
          className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "settled"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Receipt size={15} />
          <span>
            {lang === "bn"
              ? `পরিশোধিত ইনভয়েস (${toBengaliNumerals(bills.length)})`
              : `Settled Invoices (${bills.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("running")}
          className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "running"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BedDouble size={15} />
          <span>
            {lang === "bn"
              ? `চলতি ইনপেশেন্ট বিল (${toBengaliNumerals(currentInpatients.length)})`
              : `Running Inpatient Bills (${currentInpatients.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "transactions"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <CreditCard size={15} />
          <span>
            {lang === "bn"
              ? `ফাইন্যান্সিয়াল ট্রানজেকশন (${toBengaliNumerals(transactions.length)})`
              : `Financial Transactions (${transactions.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "documents"
              ? "bg-slate-800 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FileCheck size={15} />
          <span>{lang === "bn" ? "ডকুমেন্ট ও পেপারওয়ার্ক হাব" : "Document & Paperwork Hub"}</span>
        </button>

        <button
          onClick={() => setActiveTab("branding")}
          className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "branding"
              ? "bg-teal-700 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Palette size={15} />
          <span>{lang === "bn" ? "থিম ও ওয়াটারমার্ক স্টুডিও" : "Theme & Watermark Studio"}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SETTLED INVOICES */}
      {/* ========================================================================= */}
      {activeTab === "settled" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  lang === "bn"
                    ? "ইনভয়েস নম্বর, রোগীর নাম, বেড বা ফোন দিয়ে খুঁজুন..."
                    : "Search by invoice ID, patient name, bed or phone..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>
            <div className="w-full sm:w-64">
              <CustomSelect
                options={paymentMethodOptions}
                value={paymentMethodFilter}
                onChange={(val) => setPaymentMethodFilter(val)}
                className="w-full"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{lang === "bn" ? "ইনভয়েস আইডি" : "Invoice ID"}</th>
                    <th className="py-3 px-4">{lang === "bn" ? "রোগী ও যোগাযোগ" : "Patient & Contact"}</th>
                    <th className="py-3 px-4">{lang === "bn" ? "বেড ও থাকার সময়" : "Bed & Stay Duration"}</th>
                    <th className="py-3 px-4 text-right">{lang === "bn" ? "মোট গ্রস বিল" : "Gross Total"}</th>
                    <th className="py-3 px-4 text-right">{lang === "bn" ? "পরিশোধিত নিট বিল" : "Net Settled"}</th>
                    <th className="py-3 px-4">{lang === "bn" ? "পেমেন্ট ব্যাংক / মাধ্যম" : "Payment Bank / Channel"}</th>
                    <th className="py-3 px-4 text-center">HealthPass</th>
                    <th className="py-3 px-4 text-right">{lang === "bn" ? "অ্যাকশন" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        {lang === "bn"
                          ? "কোনো পরিশোধিত ইনভয়েস পাওয়া যায়নি।"
                          : "No settled invoices matching the criteria."}
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{bill.id}</span>
                          <span className="text-[10px] text-slate-500">
                            {lang === "bn" ? toBengaliNumerals(bill.created_at || "2026-10-25") : bill.created_at || "2026-10-25"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{bill.patient_name}</span>
                          <span className="text-[10px] text-slate-500">
                            {bill.patient_phone ? (lang === "bn" ? toBengaliNumerals(bill.patient_phone) : bill.patient_phone) : "NID Verified"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800 block truncate max-w-[180px]">{bill.bed_name}</span>
                          <span className="text-[10px] text-slate-500">
                            {lang === "bn"
                              ? `${toBengaliNumerals(bill.days_admitted)} দিন (${toBengaliNumerals(bill.admission_date)} হতে ${toBengaliNumerals(bill.discharge_date || "")})`
                              : `${bill.days_admitted} Days (${bill.admission_date} to ${bill.discharge_date})`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                          {fmtMoney(bill.gross_total)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">
                          {fmtMoney(bill.net_payable)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {bill.bank_name || bill.payment_method || "Cash Counter"}
                          </span>
                          {bill.bank_trx_id && (
                            <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                              {lang === "bn" ? `Trx: ${bill.bank_trx_id}` : `Trx: ${bill.bank_trx_id}`}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <ShieldCheck size={11} /> {lang === "bn" ? "সংযুক্ত" : "Synced"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDocPrint(bill, "invoice")}
                              className="h-8 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-[11px] flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                              title="Print / View Invoice Voucher"
                            >
                              <Printer size={13} /> {lang === "bn" ? "ভাউচার" : "Voucher"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDocBill(bill);
                                setActiveTab("documents");
                              }}
                              className="h-8 px-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Open Full Paperwork Hub"
                            >
                              <FileText size={13} /> {lang === "bn" ? "নথিপত্র" : "Dossier"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RUNNING INPATIENT BILLS */}
      {/* ========================================================================= */}
      {activeTab === "running" && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <BedDouble size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {lang === "bn" ? "সক্রিয় ইনপেশেন্ট শয্যা ও বিল হিসাব" : "Active Inpatient Tariff Telemetry"}
                </h4>
                <p className="text-[11px] text-slate-600">
                  {lang === "bn"
                    ? "ছাড়পত্র না হওয়া পর্যন্ত দৈনিক চার্জ স্বয়ংক্রিয়ভাবে বাড়ছে। রোগীকে রিলিজ করতে 'নিষ্পত্তি ও ছাড়পত্র' বাটনে ক্লিক করুন।"
                    : "Daily bed fees accumulate automatically until discharge clearance. Click 'Settle & Discharge' to finalize invoice and sync to Patient HealthPass."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentInpatients.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                {lang === "bn"
                  ? "বর্তমানে কোনো সক্রিয় ইনপেশেন্ট শয্যায় ভর্তি নেই।"
                  : "No active inpatient admissions currently admitted in beds."}
              </div>
            ) : (
              currentInpatients.map((adm) => {
                const running = calculateRunningBill(adm);
                return (
                  <div
                    key={adm.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-shadow space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            {adm.id}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm mt-1.5">
                            {adm.english_name || adm.patient_name}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            {lang === "bn" ? "ফোন: " : "Cell: "}
                            {adm.personal_phone ? (lang === "bn" ? toBengaliNumerals(adm.personal_phone) : adm.personal_phone) : "Not recorded"}
                          </p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Admitted" />
                      </div>

                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{lang === "bn" ? "বরাদ্দকৃত বেড:" : "Bed Allocation:"}</span>
                          <strong className="text-slate-900 truncate max-w-[150px]">{adm.bed_name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{lang === "bn" ? "ভর্তির তারিখ:" : "Admitted On:"}</span>
                          <span className="text-slate-700">{lang === "bn" ? toBengaliNumerals(adm.admission_date) : adm.admission_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{lang === "bn" ? "মোট অতিক্রান্ত দিন:" : "Elapsed Stay:"}</span>
                          <strong className="text-blue-600">
                            {lang === "bn" ? `${toBengaliNumerals(running.days)} দিন` : `${running.days} Days`}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{lang === "bn" ? "দৈনিক শয্যা ভাড়া:" : "Daily Bed Rate:"}</span>
                          <span className="text-slate-700">{fmtMoney(adm.bed_daily_rate)}</span>
                        </div>
                      </div>

                      <div className="mt-3.5 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{lang === "bn" ? "শয্যা চার্জ সাবটোটাল:" : "Bed Stay Subtotal:"}</span>
                          <strong className="text-slate-900">{fmtMoney(running.bedTotal)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{lang === "bn" ? "ভর্তিকালীন অগ্রিম জমা:" : "Admission Advance Paid:"}</span>
                          <strong className="text-emerald-600">- {fmtMoney(adm.initial_deposit)}</strong>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-sm">
                          <span className="text-slate-800">{lang === "bn" ? "আনুমানিক প্রদেয়:" : "Estimated Due:"}</span>
                          <span className="text-blue-700">{fmtMoney(running.net)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenSettle(adm)}
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Receipt size={14} /> {lang === "bn" ? "নিষ্পত্তি ও ছাড়পত্র গ্রহণ" : "Settle & Discharge Clearance"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FINANCIAL TRANSACTIONS LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Search & Channel Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  lang === "bn"
                    ? "ট্রানজেকশন আইডি, ইনভয়েস, রোগী, রেফারেন্স বা ব্যাংক দিয়ে খুঁজুন..."
                    : "Search transaction ID, invoice ID, patient, reference or bank..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {["All", "City", "DBBL", "BRAC", "Islami", "bKash", "Nagad", "Cash"].map((method) => (
                <button
                  key={method}
                  onClick={() => setTransactionMethodFilter(method)}
                  className={`h-9 px-3 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    transactionMethodFilter === method
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{lang === "bn" ? "ট্রানজেকশন আইডি" : "Transaction ID"}</th>
                    <th className="py-3 px-4">{lang === "bn" ? "ইনভয়েস নম্বর" : "Invoice Ref"}</th>
                    <th className="py-3 px-4">{lang === "bn" ? "রোগীর নাম ও ফোন" : "Patient Name & Contact"}</th>
                    <th className="py-3 px-4">{lang === "bn" ? "ক্যাটাগরি" : "Category"}</th>
                    <th className="py-3 px-4">{lang === "bn" ? "পেমেন্ট ব্যাংক / চ্যানেল" : "Payment Bank / Channel"}</th>
                    <th className="py-3 px-4">{lang === "bn" ? "ক্যাশিয়ার ডেস্ক" : "Cashier Desk"}</th>
                    <th className="py-3 px-4 text-right">{lang === "bn" ? "সেটেল্ড অ্যামাউন্ট" : "Settled Amount"}</th>
                    <th className="py-3 px-4 text-center">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        {lang === "bn"
                          ? "কোনো আর্থিক লেনদেন রেকর্ড মেলেনি।"
                          : "No financial transaction records match your search."}
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-purple-700 block">{txn.id}</span>
                          <span className="text-[10px] text-slate-500">
                            {txn.bank_trx_id ? `Trx: ${txn.bank_trx_id}` : `Ref: ${txn.reference_no}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {txn.invoice_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{txn.patient_name}</span>
                          <span className="text-[10px] text-slate-500">
                            {lang === "bn" ? toBengaliNumerals(txn.patient_phone) : txn.patient_phone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {txn.transaction_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            {txn.bank_name || txn.payment_method}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          {txn.cashier_name}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">
                          {fmtMoney(txn.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> {lang === "bn" ? "পরিশোধিত" : "Settled"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UNIFIED DOCUMENT & PAPERWORK HUB */}
      {/* ========================================================================= */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Header Description with Executive Deep Slate-Navy */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-[#0f1d33] text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-teal-500/20 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck size={20} className="text-emerald-400" />
                <h3 className="font-black text-base text-white tracking-tight">
                  {lang === "bn" ? "হাসপাতাল পেপারওয়ার্ক ও মেডিকেল নথি হাব" : "Hospital Paperwork & Medical Dossier Hub"}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {lang === "bn"
                  ? "যেকোনো রোগীর জন্য সকল অফিসিয়াল কাগজপত্র বাংলা বা ইংলিশে প্রিভিউ করুন এবং নিজস্ব লেটারহেড ও জালিয়াতি-রোধক ওয়াটারমার্ক সহ ১-ক্লিকে ডাউনলোড/প্রিন্ট করুন।"
                  : "Generate, preview and download all official hospital paperwork with your custom branding, letterhead logo, and anti-fraud watermark automatically stamped."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">{lang === "bn" ? "সক্রিয় থিম:" : "Active Theme:"}</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-300 text-xs font-bold border border-white/10 capitalize">
                {themeConfig.theme_style}
              </span>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {lang === "bn"
                ? "রোগী / ছাড়পত্রপ্রাপ্ত ইনপেশেন্ট রেকর্ড নির্বাচন করুন"
                : "Select Patient / Discharged Inpatient Record"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {bills.map((bill) => (
                <button
                  key={bill.id}
                  onClick={() => setSelectedDocBill(bill)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedDocBill?.id === bill.id
                      ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{bill.patient_name}</span>
                    <span className="text-[10px] text-slate-500">{bill.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 truncate">{bill.bed_name}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{fmtMoney(bill.net_payable)}</span>
                    <span className="text-emerald-600 font-bold">
                      {lang === "bn" ? toBengaliNumerals(bill.discharge_date || "") : bill.discharge_date}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4 Core Hospital Documents Grid */}
          {selectedDocBill && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document 1: Tax Invoice */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Receipt size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {lang === "bn" ? "অফিসিয়াল মূসক চালান" : "Official Tax Invoice"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-3">
                    {lang === "bn" ? "বিল নিষ্পত্তি ও অর্থ প্রাপ্তি রসিদ" : "Settlement Tax Invoice & Money Receipt"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "bn"
                      ? "শয্যা ভাড়া, কনসালট্যান্ট রাউন্ড, ডায়াগনস্টিকস পরীক্ষা এবং ওষুধের পূর্ণ বিবরণ সম্বলিত অফিসিয়াল অর্থপ্রদান রসিদ।"
                      : "Complete itemized billing breakdown with daily bed tariff, consultant fees, diagnostic imaging, and pharmacy dispensations."}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDocPrint(selectedDocBill, "invoice")}
                    className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Eye size={13} /> {lang === "bn" ? "প্রিভিউ ও প্রিন্ট" : "Preview & Print"}
                  </button>
                </div>
              </div>

              {/* Document 2: Discharge Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileCheck size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {lang === "bn" ? "ক্লিনিক্যাল ছাড়পত্র" : "Clinical Certification"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-3">
                    {lang === "bn" ? "ইনপেশেন্ট ক্লিনিক্যাল ডিসচার্জ সারসংক্ষেপ" : "Inpatient Clinical Discharge Summary"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "bn"
                      ? "রোগীর রোগনির্ণয়, হাসপাতালের চিকিৎসা ইতিহাস, ডিসচার্জ ভাইটালস, ছাড়কালীন প্রেসক্রিপশন ও ফলো-আপ পরামর্শ।"
                      : "Official discharge certificate with primary diagnosis, surgical/clinical course, discharge vitals, prescribed discharge medications and follow-up regimen."}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDocPrint(selectedDocBill, "discharge")}
                    className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Eye size={13} /> {lang === "bn" ? "প্রিভিউ ও প্রিন্ট" : "Preview & Print"}
                  </button>
                </div>
              </div>

              {/* Document 3: Diagnostic Lab Dossier */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Activity size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      {lang === "bn" ? "প্যাথলজি ও রেডিওলজি" : "Pathology & Radiology"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-3">
                    {lang === "bn" ? "রোগনির্ণয় ল্যাব ও রেডিওলজি ইনভেস্টিগেশন ফাইল" : "Diagnostic Lab & Imaging Investigation Dossier"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "bn"
                      ? "সম্পূর্ণ রক্তের কাউন্ট (CBC), ইসিজি, সেরাম ক্রিয়েটিনিন এবং প্যাথলজিস্ট অনুমোদিত ল্যাবরেটরি রিপোর্ট।"
                      : "Consolidated laboratory test results: Complete Blood Count, Serum Electrolytes, 12-Lead Color ECG, Chest X-Ray and Pathologist clinical endorsement."}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDocPrint(selectedDocBill, "lab")}
                    className="flex-1 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Eye size={13} /> {lang === "bn" ? "প্রিভিউ ও প্রিন্ট" : "Preview & Print"}
                  </button>
                </div>
              </div>

              {/* Document 4: Bed Gate Pass */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <BedDouble size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {lang === "bn" ? "নিরাপত্তা ছাড়পত্র" : "Security Clearance"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-3">
                    {lang === "bn" ? "হাসপাতাল বেড ভর্তি ও রোগীর সহকারীর গেট পাস" : "Hospital Bed Admission & Attendant Gate Pass"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "bn"
                      ? "অনুমোদিত অভিভাবক বা সহকারীর জন্য কিউআর কোডযুক্ত ২৪/৭ ওয়ার্ড ও কেবিন সিকিউরিটি অ্যাকসেস কার্ড।"
                      : "24/7 Ward & Cabin security gate pass for authorized attendant, room key registration, and emergency visitor clearance card."}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDocPrint(selectedDocBill, "gatepass")}
                    className="flex-1 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Eye size={13} /> {lang === "bn" ? "প্রিভিউ ও প্রিন্ট" : "Preview & Print"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BRANDING & THEME STUDIO */}
      {/* ========================================================================= */}
      {activeTab === "branding" && (
        <form onSubmit={handleSaveThemeSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Configuration Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Theme Preset Selector */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Palette size={16} className="text-teal-600" />
                    {lang === "bn" ? "হাসপাতাল পেপারওয়ার্ক থিম প্রিসেট" : "Hospital Paperwork Theme Presets"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === "bn"
                      ? "প্রিন্টকৃত সকল ভাউচার এবং সার্টিফিকেটের জন্য আন্তর্জাতিক ডিজাইন ফরম্যাট নির্বাচন করুন।"
                      : "Choose an international hospital styling format for all printed vouchers and medical certificates."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Singapore */}
                  <div
                    onClick={() => setThemeConfig({ ...themeConfig, theme_style: "singapore" })}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      themeConfig.theme_style === "singapore"
                        ? "border-emerald-600 bg-emerald-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Singapore Novena</span>
                      <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {lang === "bn" ? "ক্লিনিক্যাল টিল ও এমারেল্ড প্যালেট।" : "Teal & emerald clinical palette with crisp borders."}
                    </p>
                  </div>

                  {/* Option 2: Apollo */}
                  <div
                    onClick={() => setThemeConfig({ ...themeConfig, theme_style: "apollo" })}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      themeConfig.theme_style === "apollo"
                        ? "border-blue-600 bg-blue-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Apollo Tertiary Care</span>
                      <span className="w-3 h-3 rounded-full bg-blue-700" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {lang === "bn" ? "ডিপ কর্পোরেট নেভি ও গোল্ডেন অ্যাকসেন্ট।" : "Deep corporate navy header with amber gold accents."}
                    </p>
                  </div>

                  {/* Option 3: Royal */}
                  <div
                    onClick={() => setThemeConfig({ ...themeConfig, theme_style: "royal" })}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      themeConfig.theme_style === "royal"
                        ? "border-purple-600 bg-purple-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Royal Pavilion Suite</span>
                      <span className="w-3 h-3 rounded-full bg-purple-800" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {lang === "bn" ? "লাক্সারি প্রাইভেট স্যুইট ফরম্যাট।" : "Sophisticated indigo & crimson private luxury clinic format."}
                    </p>
                  </div>

                  {/* Option 4: Minimal */}
                  <div
                    onClick={() => setThemeConfig({ ...themeConfig, theme_style: "minimal" })}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      themeConfig.theme_style === "minimal"
                        ? "border-slate-900 bg-slate-100 shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Minimalist High-Contrast</span>
                      <span className="w-3 h-3 rounded-full bg-slate-900" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {lang === "bn" ? "কালি বাঁচানোর মনোক্রোম লেআউট।" : "Monochrome black & white layout designed to save printer ink."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Watermark Customizer */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sliders size={16} className="text-purple-600" />
                      {lang === "bn" ? "ডকুমেন্ট ওয়াটারমার্ক সেটিংস" : "Document Watermark Settings"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === "bn"
                        ? "কাগজপত্রে জালিয়াতি রোধে পেছনে হালকা কোণে স্ট্যাম্প ওয়াটারমার্ক যুক্ত করুন।"
                        : "Prevent tampering by imprinting a custom angled watermark on all generated paperwork."}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeConfig.watermark_enabled}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, watermark_enabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {lang === "bn" ? "ওয়াটারমার্ক সক্রিয়" : "Enable Watermark"}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "ওয়াটারমার্ক টেক্সট" : "Watermark Stamp Text"}
                    </label>
                    <input
                      type="text"
                      value={themeConfig.watermark_text}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, watermark_text: e.target.value })
                      }
                      placeholder="e.g. PAID & DISCHARGED"
                      className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-purple-500"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {["PAID & DISCHARGED", "পরিশোধিত ও ছাড়পত্রপ্রাপ্ত", "OFFICIAL HOSPITAL COPY", "ORIGINAL FOR RECIPIENT"].map((txt) => (
                        <button
                          type="button"
                          key={txt}
                          onClick={() => setThemeConfig({ ...themeConfig, watermark_text: txt })}
                          className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer"
                        >
                          {txt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        {lang === "bn"
                          ? `ওয়াটারমার্ক দৃশ্যমানতা: ${toBengaliNumerals(Math.round(themeConfig.watermark_opacity * 100))}%`
                          : `Watermark Opacity: ${Math.round(themeConfig.watermark_opacity * 100)}%`}
                      </label>
                    </div>
                    <input
                      type="range"
                      min="0.03"
                      max="0.25"
                      step="0.01"
                      value={themeConfig.watermark_opacity}
                      onChange={(e) =>
                        setThemeConfig({
                          ...themeConfig,
                          watermark_opacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-purple-600 cursor-pointer mt-2"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {lang === "bn"
                        ? "সুপারিশকৃত: ৬% - ১০% স্বচ্ছতা যাতে মূল লেখার সাথে সংঘর্ষ না হয়।"
                        : "Recommended: 6% - 10% for crisp readability on physical paper prints."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hospital Profile & Letterhead Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building size={16} className="text-blue-600" />
                    {lang === "bn" ? "অফিসিয়াল লেটারহেড ও লাইসেন্স তথ্য" : "Official Letterhead & Legal Credentials"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === "bn"
                      ? "এই তথ্য প্রতিটি প্রিন্ট ভাউচারের হেডার এবং ফুটারে প্রদর্শিত হবে।"
                      : "These credentials appear at the header and footer of every issued patient voucher."}
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === "bn" ? "হাসপাতালের নিজস্ব লোগো / ক্রেস্ট আপলোড" : "Upload Hospital Logo / Crest"}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="h-10 px-4 rounded-[10px] border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer hover:bg-slate-50">
                      <Upload size={14} /> {lang === "bn" ? "লোগো ফাইল নির্বাচন করুন" : "Upload Custom Logo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {themeConfig.logo_url && (
                      <button
                        type="button"
                        onClick={() => setThemeConfig({ ...themeConfig, logo_url: undefined })}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        {lang === "bn" ? "ডিফল্ট ক্রেস্টে ফিরুন" : "Reset to Default Crest"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "হাসপাতালের নাম" : "Hospital Legal Name"}
                    </label>
                    <input
                      type="text"
                      value={themeConfig.hospital_name}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, hospital_name: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "ট্যাগলাইন / স্বীকৃতি" : "Tagline / Accreditation"}
                    </label>
                    <input
                      type="text"
                      value={themeConfig.hospital_tagline}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, hospital_tagline: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "নিবন্ধিত পূর্ণাঙ্গ ঠিকানা" : "Hospital Registered Address"}
                    </label>
                    <input
                      type="text"
                      value={themeConfig.hospital_address}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, hospital_address: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "ডিজিএইচএস লাইসেন্স নং" : "DGHS License No"}
                    </label>
                    <input
                      type="text"
                      value={themeConfig.license_no}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, license_no: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "ট্যাক্স বিন / ভ্যাট রেজি." : "Tax BIN / VAT Reg"}
                    </label>
                    <input
                      type="text"
                      value={themeConfig.tax_bin}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, tax_bin: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 bg-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Official Stamp & Seal */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      {lang === "bn" ? "ডিজিটাল ভেরিফিকেশন স্ট্যাম্প ও সিল" : "Digital Verification Stamp"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === "bn"
                        ? "প্রতিটি ছাড়পত্র ডকুমেন্টের নিচে হাসপাতালের অডিট সিল।"
                        : "Hospital audit seal placed automatically at the foot of every clearance document."}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeConfig.stamp_enabled}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, stamp_enabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {lang === "bn" ? "সিল সক্রিয়" : "Enable Stamp"}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "স্ট্যাম্প টেক্সট" : "Stamp Verification Label"}
                    </label>
                    <input
                      type="text"
                      value={themeConfig.stamp_text}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, stamp_text: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "সিলের রঙ নির্বাচন" : "Stamp Color Accent"}
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { color: "#059669", label: "Emerald" },
                        { color: "#2563eb", label: "Blue" },
                        { color: "#7c3aed", label: "Purple" },
                        { color: "#dc2626", label: "Red" },
                        { color: "#1e293b", label: "Slate" },
                      ].map((c) => (
                        <button
                          type="button"
                          key={c.color}
                          onClick={() => setThemeConfig({ ...themeConfig, stamp_color: c.color })}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 cursor-pointer ${
                            themeConfig.stamp_color === c.color ? "border-black scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        >
                          {themeConfig.stamp_color === c.color && <Check size={12} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="h-11 px-8 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  {lang === "bn" ? "ব্র্যান্ডিং ও থিম সেটিংস সংরক্ষণ করুন" : "Save Branding & Theme Settings"}
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Live Real-Time Document Preview Box */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={14} className="text-teal-600" />
                  {lang === "bn" ? "লাইভ ডকুমেন্ট প্রিভিউ" : "Live Document Print Preview"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Scale: 75% A4</span>
              </div>

              {/* The Mock Printable Paper Preview */}
              <div className="relative bg-white rounded-2xl border border-slate-300 shadow-lg p-5 overflow-hidden text-[11px] select-none">
                {/* Dynamic Watermark Overlay */}
                {themeConfig.watermark_enabled && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none overflow-hidden"
                    style={{
                      opacity: themeConfig.watermark_opacity,
                      transform: "rotate(-35deg)",
                    }}
                  >
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-widest uppercase border-4 border-slate-900 px-6 py-2 rounded-2xl whitespace-nowrap">
                      {themeConfig.watermark_text || "PAID & DISCHARGED"}
                    </span>
                  </div>
                )}

                {/* Document Header with chosen theme */}
                <div className={`p-4 rounded-xl ${themeClasses.bannerBg} flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-2.5">
                    {themeConfig.logo_url ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/20 p-0.5">
                        <Image
                          src={themeConfig.logo_url}
                          alt="Logo"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center font-black text-xl">
                        +
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-xs tracking-tight line-clamp-1">
                        {themeConfig.hospital_name}
                      </h4>
                      <p className="text-[9px] text-white/80 line-clamp-1">
                        {themeConfig.hospital_tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-header details */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between text-[10px]">
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">
                      {lang === "bn" ? "রোগী" : "Patient"}
                    </span>
                    <strong className="text-slate-900">Al Amin Sheikh</strong>
                    <p className="text-slate-500">Cabin 304 (4 Days)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">
                      {lang === "bn" ? "ভাউচার নং" : "Invoice No"}
                    </span>
                    <strong className="text-slate-900">INV-2026-9901</strong>
                    <p className="text-slate-500">{new Date().toISOString().split("T")[0]}</p>
                  </div>
                </div>

                {/* Mini Itemized Table */}
                <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden text-[9px]">
                  <table className="w-full text-left">
                    <thead className={`${themeClasses.tableHeadBg} uppercase text-[8px] font-bold`}>
                      <tr>
                        <th className="py-1 px-2">{lang === "bn" ? "সেবা" : "Service"}</th>
                        <th className="py-1 px-2 text-right">{lang === "bn" ? "পরিমাণ" : "Amount"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-1 px-2">Executive Deluxe Cabin (4 Days)</td>
                        <td className="py-1 px-2 text-right">৳ 30,000</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2">Cardiologist Consultant Rounds</td>
                        <td className="py-1 px-2 text-right">৳ 8,000</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2">Cardiac Diagnostics &amp; Imaging</td>
                        <td className="py-1 px-2 text-right">৳ 5,500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mini Calculation */}
                <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === "bn" ? "মোট গ্রস:" : "Gross Total:"}</span>
                    <strong>৳ 43,500</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === "bn" ? "অগ্রিম জমা:" : "Deposit Paid:"}</span>
                    <strong className="text-emerald-700">- ৳ 10,000</strong>
                  </div>
                  <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-200">
                    <span>{lang === "bn" ? "পরিশোধিত নিট:" : "Net Settled:"}</span>
                    <span className="text-emerald-700">৳ 33,500</span>
                  </div>
                </div>

                {/* Mini Footer Stamp */}
                {themeConfig.stamp_enabled && (
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div
                      className="px-2 py-0.5 rounded text-[8px] font-bold border flex items-center gap-1"
                      style={{
                        borderColor: themeConfig.stamp_color,
                        color: themeConfig.stamp_color,
                        backgroundColor: `${themeConfig.stamp_color}10`,
                      }}
                    >
                      <ShieldCheck size={10} /> {themeConfig.stamp_text}
                    </div>
                    <div className="text-right">
                      <div className="w-16 border-b border-slate-400 mb-0.5 ml-auto" />
                      <span className="text-[8px] text-slate-500 font-bold">
                        {lang === "bn" ? "হিসাব কর্মকর্তা" : "Accounts Officer"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SETTLEMENT FORM MODAL WITH SEARCHABLE MULTI-BANK & 10PX FIELDS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSettleModalOpen && settlingAdmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettleModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200 custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
                    <Receipt size={20} className="text-emerald-600" />
                    {lang === "bn" ? "ইনপেশেন্ট ছাড়পত্র ও বিল নিষ্পত্তি" : "Inpatient Discharge Clearance & Settlement"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === "bn" ? "রোগী: " : "Patient: "}
                    <strong>{settlingAdmission.english_name || settlingAdmission.patient_name}</strong> • {settlingAdmission.bed_name}
                  </p>
                </div>
                <button
                  onClick={() => setIsSettleModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmSettlement} className="mt-5 space-y-4">
                {/* Clinical Diagnosis & Advice for HealthPass */}
                <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block flex items-center gap-1">
                    <Stethoscope size={12} />
                    {lang === "bn"
                      ? "রোগীর হেলথপাস হিস্ট্রিতে স্বয়ংক্রিয় সিঙ্ক"
                      : "Auto-Sync to Patient HealthPass History"}
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {lang === "bn" ? "প্রাথমিক রোগনির্ণয় (Primary Diagnosis)" : "Primary Clinical Diagnosis"}
                    </label>
                    <input
                      type="text"
                      value={settlementForm.primary_diagnosis}
                      onChange={(e) =>
                        setSettlementForm({ ...settlementForm, primary_diagnosis: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-[10px] border border-teal-300 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-teal-600 shadow-xs"
                    />
                  </div>

                  {/* Discharge Clinical Condition Selection Popup */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        {lang === "bn" ? "ছাড়কালীন শারীরিক অবস্থা" : "Discharge Clinical Condition"}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsConditionPopupOpen(!isConditionPopupOpen);
                          setIsConcessionPopupOpen(false);
                        }}
                        className="w-full h-9 px-3 rounded-[10px] border border-teal-300 text-xs font-semibold text-slate-900 bg-white flex items-center justify-between outline-none cursor-pointer shadow-xs text-left"
                      >
                        <span className="truncate">{settlementForm.discharge_condition}</span>
                        <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                      </button>

                      {/* Condition Selection Popup */}
                      {isConditionPopupOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-30 space-y-1">
                          {[
                            { value: "Cured / Stable", desc: "সম্পূর্ণ সুস্থ / স্থিতিশীল" },
                            { value: "Improved", desc: "শারীরিক উন্নতি / অ্যাম্বুলেটরি" },
                            { value: "Referred", desc: "উন্নত চিকিৎসার জন্য রেফার্ড" },
                            { value: "DOR (Discharged on Request)", desc: "রোগীর ইচ্ছায় ছাড়পত্র" },
                          ].map((item) => (
                            <button
                              type="button"
                              key={item.value}
                              onClick={() => {
                                setSettlementForm({
                                  ...settlementForm,
                                  discharge_condition: item.value as any,
                                });
                                setIsConditionPopupOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer flex flex-col ${
                                settlementForm.discharge_condition === item.value
                                  ? "bg-teal-50 text-teal-800 font-bold border border-teal-200"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{item.value}</span>
                              <span className="text-[10px] text-slate-500 font-normal">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        {lang === "bn" ? "কনসালট্যান্ট চিকিৎসক" : "Attending Doctor"}
                      </label>
                      <input
                        type="text"
                        value={settlementForm.attending_doctor}
                        onChange={(e) =>
                          setSettlementForm({ ...settlementForm, attending_doctor: e.target.value })
                        }
                        className="w-full h-9 px-3 rounded-[10px] border border-teal-300 text-xs text-slate-900 bg-white outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {lang === "bn" ? "ছাড়কালীন ওষুধ ও পরামর্শ" : "Discharge Medications & Clinical Advice"}
                    </label>
                    <textarea
                      rows={2}
                      value={settlementForm.clinical_advice}
                      onChange={(e) =>
                        setSettlementForm({ ...settlementForm, clinical_advice: e.target.value })
                      }
                      className="w-full p-2.5 rounded-[10px] border border-teal-300 text-xs text-slate-900 bg-white outline-none focus:border-teal-600 custom-scrollbar shadow-xs"
                    />
                  </div>
                </div>

                {/* ITEMIZED DEPARTMENTAL CHARGES - Exactly 10px Curved Inputs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    {lang === "bn" ? "বিভাগীয় আইটেমাইজড চার্জ (১০px কার্ভ)" : "Itemized Departmental Charges"}
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === "bn" ? "ডাক্তার ভিজিট ও রাউন্ড" : "Doctor Consultation Fees"}
                      </label>
                      <input
                        type="number"
                        value={settlementForm.doctor_fee}
                        onChange={(e) =>
                          setSettlementForm({
                            ...settlementForm,
                            doctor_fee: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full h-9 px-3 rounded-[10px] border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === "bn" ? "ডায়াগনস্টিক ল্যাব ও ইসিজি" : "Diagnostic Lab & Imaging"}
                      </label>
                      <input
                        type="number"
                        value={settlementForm.diagnostics_total}
                        onChange={(e) =>
                          setSettlementForm({
                            ...settlementForm,
                            diagnostics_total: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full h-9 px-3 rounded-[10px] border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === "bn" ? "ফার্মেসি ও ইনফিউশন" : "Pharmacy & Infusions"}
                      </label>
                      <input
                        type="number"
                        value={settlementForm.pharmacy_total}
                        onChange={(e) =>
                          setSettlementForm({
                            ...settlementForm,
                            pharmacy_total: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full h-9 px-3 rounded-[10px] border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === "bn" ? "নার্সিং ও টেলিমেট্রি" : "Nursing & Ward Telemetry"}
                      </label>
                      <input
                        type="number"
                        value={settlementForm.nursing_fee}
                        onChange={(e) =>
                          setSettlementForm({
                            ...settlementForm,
                            nursing_fee: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full h-9 px-3 rounded-[10px] border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* CONCESSION POLICY & REASON POPUP */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "হাসপাতাল ছাড় / মওকুফ (৳)" : "Hospital Discount / Concession (৳)"}
                    </label>
                    <input
                      type="number"
                      value={settlementForm.discount}
                      onChange={(e) =>
                        setSettlementForm({
                          ...settlementForm,
                          discount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full h-9 px-3 rounded-[10px] border border-slate-200 font-bold text-emerald-700 focus:border-emerald-500 outline-none shadow-xs"
                    />
                  </div>

                  <div className="relative">
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === "bn" ? "মওকুফ পলিসি / কারণ" : "Concession Policy / Reason"}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConcessionPopupOpen(!isConcessionPopupOpen);
                        setIsConditionPopupOpen(false);
                      }}
                      className="w-full h-9 px-3 rounded-[10px] border border-slate-200 text-xs font-semibold text-slate-900 bg-white flex items-center justify-between outline-none cursor-pointer shadow-xs text-left"
                    >
                      <span className="truncate">{settlementForm.concession_reason}</span>
                      <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                    </button>

                    {/* Concession Selection Popup */}
                    {isConcessionPopupOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-30 space-y-1">
                        {[
                          { value: "Standard Clinical Concession", desc: "সাধারণ নিয়মিত ক্লিনিক্যাল ছাড়" },
                          { value: "Hospital Authority Discretionary Waiver", desc: "হাসপাতাল কর্তৃপক্ষের বিশেষ মওকুফ" },
                          { value: "Corporate / TPA Insurance Co-Pay Waiver", desc: "কর্পোরেট/বীমা চুক্তিভিত্তিক সুবিধা" },
                          { value: "Zakat / Social Welfare Fund Subsidy", desc: "যাকাত / সমাজকল্যাণ তহবিল সহায়তা" },
                          { value: "Freedom Fighter / Healthcare Worker Benefit", desc: "বীর মুক্তিযোদ্ধা / স্বাস্থ্যকর্মী সুবিধা" },
                          { value: "None / Full Tariff Applicable", desc: "কোনো ছাড় প্রযোজ্য নয়" },
                        ].map((item) => (
                          <button
                            type="button"
                            key={item.value}
                            onClick={() => {
                              setSettlementForm({
                                ...settlementForm,
                                concession_reason: item.value as any,
                              });
                              setIsConcessionPopupOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer flex flex-col ${
                              settlementForm.concession_reason === item.value
                                ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{item.value}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{item.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SEARCHABLE MULTI-BANK SETTLEMENT METHOD */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block flex items-center gap-1.5">
                    <Landmark size={14} className="text-blue-600" />
                    {lang === "bn" ? "ডিসচার্জ পেমেন্ট সেটেলমেন্ট ব্যাংক / মাধ্যম" : "Discharge Payment Settlement Method"}
                  </span>

                  <div className="relative">
                    {/* Selected Bank Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                      className="w-full h-11 px-3.5 rounded-[10px] border border-slate-200 bg-white flex items-center justify-between shadow-xs cursor-pointer hover:border-slate-300"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: selectedBank?.badge_color || "#2563eb" }}
                        />
                        <div className="text-left">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {selectedBank?.bank_name || "Select Settlement Bank"}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {selectedBank?.account_number} • {selectedBank?.category}
                          </span>
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                    </button>

                    {/* Searchable Dropdown Menu */}
                    {isBankDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-40 space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder={lang === "bn" ? "ব্যাংক বা মাধ্যম খুঁজুন..." : "Filter bank or account..."}
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
                            autoFocus
                          />
                        </div>

                        <div className="space-y-1">
                          {filteredBankAccounts.map((b) => (
                            <button
                              type="button"
                              key={b.id}
                              onClick={() => {
                                setSelectedBank(b);
                                setIsBankDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                selectedBank?.id === b.id
                                  ? "bg-blue-50 text-blue-900 font-bold border border-blue-200"
                                  : "hover:bg-slate-50 text-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: b.badge_color || "#2563eb" }}
                                />
                                <div>
                                  <span className="block">{b.bank_name}</span>
                                  <span className="text-[10px] text-slate-500">{b.account_number}</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {b.category}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bank Transaction Number / TrxID (Auto Stamped on Receipt) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {lang === "bn"
                        ? "ব্যাংক ট্রানজেকশন নম্বর / TrxID / জমা স্লিপ নং (রসিদে স্বয়ংক্রিয় ছাপা হবে)"
                        : "Bank Transaction Reference / TrxID / Deposit Slip No (Auto-stamped on Receipt)"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BK-9948201938 or CT-104928"
                      value={settlementForm.bank_trx_id}
                      onChange={(e) => setSettlementForm({ ...settlementForm, bank_trx_id: e.target.value })}
                      className="w-full h-9 px-3 rounded-[10px] border border-slate-200 font-mono text-xs font-bold text-slate-900 bg-white outline-none focus:border-blue-500 shadow-xs"
                      required
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSettleModalOpen(false)}
                    className="h-10 px-4 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                  >
                    {lang === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck size={15} />
                    {lang === "bn"
                      ? "বিল নিষ্পত্তি ও হেলথপাস অটো-সিঙ্ক"
                      : "Confirm Settlement & Auto-Sync HealthPass"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL PRINTABLE PAPERWORK WITH 1-CLICK BILINGUAL TOGGLE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedInvoiceForPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200 custom-scrollbar print:p-0 print:border-none print:shadow-none ${
                docLang === "bn" ? "font-hind" : ""
              }`}
            >
              {/* Document Modal Toolbar with Document Type & Document Language Switcher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 print:hidden">
                {/* Document Type Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { id: "invoice", labelEn: "Tax Invoice", labelBn: "মূসক চালান", icon: Receipt },
                    { id: "discharge", labelEn: "Discharge Summary", labelBn: "ডিসচার্জ সনদ", icon: FileCheck },
                    { id: "lab", labelEn: "Lab Dossier", labelBn: "ল্যাব ফাইল", icon: Activity },
                    { id: "gatepass", labelEn: "Gate Pass", labelBn: "গেট পাস", icon: BedDouble },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDocType(tab.id as DocumentType)}
                        className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          activeDocType === tab.id
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <Icon size={13} /> {docLang === "bn" ? tab.labelBn : tab.labelEn}
                      </button>
                    );
                  })}
                </div>

                {/* Document Language Toggle & Close */}
                <div className="flex items-center gap-2 justify-end">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setDocLang("en")}
                      className={`h-7 px-2.5 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                        docLang === "en" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setDocLang("bn")}
                      className={`h-7 px-2.5 rounded-md text-[11px] font-bold cursor-pointer transition-all font-hind ${
                        docLang === "bn" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      বাংলা নথি
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedInvoiceForPrint(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Document Body with Dynamic Watermark */}
              <div className="relative mt-4">
                {/* Dynamic Watermark Stamp Overlay */}
                {themeConfig.watermark_enabled && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none overflow-hidden"
                    style={{
                      opacity: themeConfig.watermark_opacity,
                      transform: "rotate(-35deg)",
                    }}
                  >
                    <span className="text-4xl sm:text-6xl font-black text-slate-900 tracking-widest uppercase border-4 sm:border-8 border-slate-900 px-6 py-2 sm:px-8 sm:py-3 rounded-2xl sm:rounded-3xl whitespace-nowrap">
                      {docLang === "bn"
                        ? "পরিশোধিত ও ছাড়পত্রপ্রাপ্ত"
                        : themeConfig.watermark_text || "PAID & DISCHARGED"}
                    </span>
                  </div>
                )}

                {/* Header with Custom Theme Banner (Clinical Executive Slate-Navy / Teal) */}
                <div className={`p-6 rounded-2xl ${themeClasses.bannerBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs`}>
                  <div className="flex items-center gap-3">
                    {themeConfig.logo_url ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/20 p-1 flex-shrink-0">
                        <Image
                          src={themeConfig.logo_url}
                          alt="Hospital Crest"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white/20 text-white flex items-center justify-center font-black text-2xl flex-shrink-0">
                        +
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                        {docLang === "bn"
                          ? "অক্সপেকার স্পেশালাইজড ইন্টারন্যাশনাল হসপিটাল"
                          : themeConfig.hospital_name}
                      </h2>
                      <p className="text-xs text-white/80 mt-0.5">
                        {docLang === "bn"
                          ? "সিঙ্গাপুর আন্তর্জাতিক স্বাস্থ্যবিধি মানসম্মত টারশিয়ারি মেডিকেল কেয়ার সেন্টার"
                          : themeConfig.hospital_tagline}
                      </p>
                      <p className="text-[10px] text-white/60 mt-0.5">
                        {themeConfig.hospital_address} • 24/7 Hotline: {themeConfig.hospital_hotline}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[11px] text-white/90">
                    <span className="font-bold block uppercase tracking-wider text-[10px] text-white/70">
                      {docLang === "bn" ? "লাইসেন্স ও মূসক রেজি." : "License & Tax BIN"}
                    </span>
                    <p>{themeConfig.license_no}</p>
                    <p>{themeConfig.tax_bin}</p>
                  </div>
                </div>

                {/* Patient & Voucher Metadata Grid */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {docLang === "bn" ? "রোগীর বিবরণ" : "Patient Details"}
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {selectedInvoiceForPrint.patient_name}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {docLang === "bn" ? "জাতীয় পরিচয়পত্র: " : "NID: "}
                      {docLang === "bn" ? toBengaliNumerals(selectedInvoiceForPrint.patient_nid || "") : selectedInvoiceForPrint.patient_nid}
                    </p>
                    <p className="text-slate-600">
                      {docLang === "bn" ? "মোবাইল: " : "Cell: "}
                      {docLang === "bn" ? toBengaliNumerals(selectedInvoiceForPrint.patient_phone || "") : selectedInvoiceForPrint.patient_phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {docLang === "bn" ? "ভাউচার রেফারেন্স" : "Voucher Reference"}
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {selectedInvoiceForPrint.id}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {docLang === "bn" ? "ভর্তির তারিখ: " : "Admission: "}
                      {docLang === "bn" ? toBengaliNumerals(selectedInvoiceForPrint.admission_date) : selectedInvoiceForPrint.admission_date}
                    </p>
                    <p className="text-slate-600">
                      {docLang === "bn" ? "ছাড়পত্র: " : "Discharge: "}
                      {docLang === "bn" ? toBengaliNumerals(selectedInvoiceForPrint.discharge_date || "") : selectedInvoiceForPrint.discharge_date}
                      {" "}({fmtDocNumber(selectedInvoiceForPrint.days_admitted)} {docLang === "bn" ? "দিন" : "Days"})
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {docLang === "bn" ? "শয্যা ও ব্যাংক মাধ্যম" : "Bed Accommodation"}
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 max-w-[200px]">
                      {selectedInvoiceForPrint.bed_name}
                    </p>
                    <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                      {selectedInvoiceForPrint.bank_name || selectedInvoiceForPrint.payment_method}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={11} /> {docLang === "bn" ? "পরিশোধিত ও প্রত্যয়িত" : "Settled & Verified"}
                    </span>
                  </div>
                </div>

                {/* DOCUMENT TYPE 1: TAX INVOICE */}
                {activeDocType === "invoice" && (
                  <>
                    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className={`${themeClasses.tableHeadBg} font-bold uppercase text-[10px] tracking-wider`}>
                          <tr>
                            <th className="py-2.5 px-3">{docLang === "bn" ? "সেবার বিবরণ" : "Service Description"}</th>
                            <th className="py-2.5 px-3 text-center">{docLang === "bn" ? "বিভাগ" : "Category"}</th>
                            <th className="py-2.5 px-3 text-center">{docLang === "bn" ? "পরিমাণ / দিন" : "Qty / Days"}</th>
                            <th className="py-2.5 px-3 text-right">{docLang === "bn" ? "হার" : "Rate"}</th>
                            <th className="py-2.5 px-3 text-right">{docLang === "bn" ? "মোট টাকা" : "Amount"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {selectedInvoiceForPrint.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{item.description}</td>
                              <td className="py-2.5 px-3 text-center text-slate-500">{item.category}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-700">{fmtDocNumber(item.quantity)}</td>
                              <td className="py-2.5 px-3 text-right text-slate-600">{fmtDocMoney(item.unitPrice)}</td>
                              <td className="py-2.5 px-3 text-right font-black text-slate-900">{fmtDocMoney(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {docLang === "bn" ? "মোট হাসপাতাল চিকিৎসা খরচ (Gross Total):" : "Gross Total Hospital Charges:"}
                        </span>
                        <strong className="text-slate-900">{fmtDocMoney(selectedInvoiceForPrint.gross_total)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {docLang === "bn" ? "ভর্তিকালীন অগ্রিম জমা (Deposit Paid):" : "Initial Inpatient Deposit Paid:"}
                        </span>
                        <strong className="text-emerald-700">- {fmtDocMoney(selectedInvoiceForPrint.deposit_paid)}</strong>
                      </div>
                      {selectedInvoiceForPrint.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            {docLang === "bn" ? "বিশেষ ছাড় / মওকুফ (Concession):" : "Discount / Hospital Concession:"}
                          </span>
                          <strong className="text-emerald-700">- {fmtDocMoney(selectedInvoiceForPrint.discount)}</strong>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                        <span className="font-black text-slate-900">
                          {docLang === "bn" ? "সর্বমোট পরিশোধিত অর্থ (Net Amount Settled):" : "Net Amount Settled:"}
                        </span>
                        <strong className="text-base font-black text-emerald-700">
                          {fmtDocMoney(selectedInvoiceForPrint.net_payable)}
                        </strong>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between flex-wrap gap-2">
                        <span>
                          {docLang === "bn" ? "পরিশোধের মাধ্যম: " : "Payment Channel: "}
                          <strong>{selectedInvoiceForPrint.bank_name || selectedInvoiceForPrint.payment_method}</strong>
                        </span>
                        <span>
                          {docLang === "bn" ? "ব্যাংক ট্রানজেকশন TrxID: " : "Bank TrxID: "}
                          <strong className="font-mono text-slate-800">
                            {selectedInvoiceForPrint.bank_trx_id || selectedInvoiceForPrint.transaction_ref}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* DOCUMENT TYPE 2: DISCHARGE SUMMARY */}
                {activeDocType === "discharge" && (
                  <div className="mt-5 space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {docLang === "bn" ? "ক্লিনিক্যাল রোগনির্ণয় ও চিকিৎসা ইতিহাস" : "Clinical Diagnosis & Course"}
                      </h4>
                      <p className="mt-1 text-slate-700">
                        {docLang === "bn" ? "প্রাথমিক রোগনির্ণয়: " : "Primary Diagnosis: "}
                        <strong>Acute Coronary Syndrome (Post PTCA Stenting)</strong>
                      </p>
                      <p className="mt-1 text-slate-600">
                        {docLang === "bn"
                          ? "হাসপাতালের বিবরণ: রোগীকে বুকে তীব্র ব্যথাসহ জরুরি ট্রায়াজে ভর্তি করা হয়েছিল। সফল করোনারি এনজিওগ্রাম এবং এলএডিতে ড্রাগ-ইলুটিং স্টেন্ট স্থাপন করা হয়। রোগী বর্তমানে সম্পূর্ণ সুস্থ ও স্থিতিশীল।"
                          : "Hospital Course: The patient was admitted via emergency triage with acute retrosternal chest pain. Coronary angiogram performed followed by successful drug-eluting stent (DES) placement to LAD. Hemodynamically stable post-procedure with normal sinus rhythm."}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {docLang === "bn" ? "ছাড়কালীন প্রেসক্রিপশন ও ওষুধের তালিকা" : "Discharge Medications & Rx"}
                      </h4>
                      <ul className="mt-2 space-y-1 text-slate-700 list-disc list-inside">
                        <li>Tab. Clopidogrel 75mg — 1 tablet daily in morning (30 days)</li>
                        <li>Tab. Aspirin 75mg — 1 tablet daily after meal (30 days)</li>
                        <li>Tab. Atorvastatin 20mg — 1 tablet at bedtime (60 days)</li>
                        <li>Tab. Bisoprolol 2.5mg — 1/2 tablet once daily in morning</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-700 block">
                          {docLang === "bn" ? "ছাড়কালীন শারীরিক অবস্থা:" : "Condition on Discharge:"}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {docLang === "bn" ? "সম্পূর্ণ সুস্থ / স্থিতিশীল" : "Cured / Stable"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block">
                          {docLang === "bn" ? "পরবর্তী ফলো-আপ সাক্ষাত:" : "Follow-Up Clinical Review:"}
                        </span>
                        <span className="text-blue-700 font-bold">
                          {docLang === "bn" ? "৭ দিন পর বহির্বিভাগ (OPD) ২০৪ কক্ষে" : "In 7 Days at OPD Room 204"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENT TYPE 3: LAB DOSSIER */}
                {activeDocType === "lab" && (
                  <div className="mt-5 space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-sm mb-2">
                        {docLang === "bn"
                          ? "প্যাথলজি ও বায়োকেমিস্ট্রি ইনভেস্টিগেশন প্যানেল"
                          : "Comprehensive Pathology & Biochemistry Panels"}
                      </h4>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                          <tr>
                            <th className="p-2">{docLang === "bn" ? "টেস্টের নাম" : "Test Name"}</th>
                            <th className="p-2">{docLang === "bn" ? "প্রাপ্ত ফলাফল" : "Observed Result"}</th>
                            <th className="p-2">{docLang === "bn" ? "স্বাভাবিক মাত্রা" : "Biological Reference"}</th>
                            <th className="p-2 text-right">{docLang === "bn" ? "মন্তব্য" : "Status"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          <tr>
                            <td className="p-2">Hemoglobin (Hb)</td>
                            <td className="p-2 font-bold text-slate-900">14.2 g/dL</td>
                            <td className="p-2 text-slate-500">13.0 - 17.0 g/dL</td>
                            <td className="p-2 text-right text-emerald-600 font-bold">Normal</td>
                          </tr>
                          <tr>
                            <td className="p-2">Cardiac Troponin I</td>
                            <td className="p-2 font-bold text-slate-900">0.02 ng/mL</td>
                            <td className="p-2 text-slate-500">&lt; 0.04 ng/mL</td>
                            <td className="p-2 text-right text-emerald-600 font-bold">Baseline</td>
                          </tr>
                          <tr>
                            <td className="p-2">Serum Creatinine</td>
                            <td className="p-2 font-bold text-slate-900">0.95 mg/dL</td>
                            <td className="p-2 text-slate-500">0.7 - 1.3 mg/dL</td>
                            <td className="p-2 text-right text-emerald-600 font-bold">Optimal</td>
                          </tr>
                          <tr>
                            <td className="p-2">Serum Potassium (K+)</td>
                            <td className="p-2 font-bold text-slate-900">4.3 mmol/L</td>
                            <td className="p-2 text-slate-500">3.5 - 5.1 mmol/L</td>
                            <td className="p-2 text-right text-emerald-600 font-bold">Normal</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* DOCUMENT TYPE 4: GATE PASS */}
                {activeDocType === "gatepass" && (
                  <div className="mt-5 space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                            {docLang === "bn" ? "২৪/৭ নিরাপত্তা গেট পাস" : "24/7 Security Gate Pass"}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                            {docLang === "bn" ? "অনুমোদিত সহকারীর প্রবেশ কার্ড" : "Authorized Attendant Access Card"}
                          </h4>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg border border-amber-300 flex items-center justify-center font-mono font-bold text-xs">
                          <QrCode size={28} />
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">
                            {docLang === "bn" ? "অনুমোদিত অভিভাবক/সহকারী:" : "Authorized Attendant:"}
                          </span>
                          <strong className="block text-slate-900">Shahidul Islam (Spouse / Guardian)</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">
                            {docLang === "bn" ? "কেবিন / শয্যা নম্বর:" : "Room / Bed ID:"}
                          </span>
                          <strong className="block text-slate-900">{selectedInvoiceForPrint.bed_name}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Official Stamp & Signatures */}
                {themeConfig.stamp_enabled && (
                  <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                    <div>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full border"
                        style={{
                          borderColor: themeConfig.stamp_color,
                          color: themeConfig.stamp_color,
                          backgroundColor: `${themeConfig.stamp_color}10`,
                        }}
                      >
                        <ShieldCheck size={14} />
                        {docLang === "bn" ? "অ্যাকাউন্টস ও অডিট নিরীক্ষিত — অফিসিয়াল রসিদ" : themeConfig.stamp_text}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="w-36 border-b border-slate-400 mb-1 ml-auto" />
                      <span className="font-bold text-slate-700">
                        {docLang === "bn" ? "হিসাব ও মেডিকেল সুপারিনটেনডেন্ট" : "Accounts & Medical Director"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Modal Print & Close Actions */}
                <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceForPrint(null)}
                    className="h-10 px-4 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                  >
                    {docLang === "bn" ? "বন্ধ করুন" : "Close"}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="h-10 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Printer size={14} />
                    {docLang === "bn" ? "নথি প্রিন্ট করুন (PDF)" : "Print Document (PDF)"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
