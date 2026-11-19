"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  QrCode,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Barcode,
  Receipt,
  Sparkles,
  Ambulance,
  AlertTriangle,
  TestTube2,
  ClipboardPlus,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { INITIAL_HEALTH_CARDS } from "@/lib/healthpass";
import {
  createDiagnosticOrder,
  getDiagnosticCatalog,
  getDiagnosticOrders,
  getErTriageCases,
  saveDiagnosticCatalogItem,
  saveErTriageCase,
  updateDiagnosticOrderStatus,
  type DiagnosticDepartment,
  type DiagnosticOrderItem,
  type DiagnosticOrderStatus,
  type DiagnosticPriority,
  type DiagnosticTestItem,
  type ErTriageCaseItem,
} from "@/lib/hospital-diagnostics";
import { HospitalPrintStudio, type PrintDocumentType } from "@/components/hospital/HospitalPrintStudio";

type DiagTab = "queue" | "order" | "catalog" | "er";

const STATUS_SEQUENCE: DiagnosticOrderStatus[] = [
  "Ordered",
  "Sample Collected",
  "In Lab",
  "AI Analyzed",
  "Pathologist Review",
  "Verified & Published",
  "Delivered",
];

export default function HospitalDiagnosticsPage() {
  const [activeTab, setActiveTab] = useState<DiagTab>("queue");
  const [catalog, setCatalog] = useState<DiagnosticTestItem[]>([]);
  const [orders, setOrders] = useState<DiagnosticOrderItem[]>([]);
  const [erCases, setErCases] = useState<ErTriageCaseItem[]>([]);

  // Queue filters
  const [queueSearch, setQueueSearch] = useState("");
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>("All");

  // Order Entry State
  const [hpLookup, setHpLookup] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("42");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientPhone, setPatientPhone] = useState("");
  const [smartCardUid, setSmartCardUid] = useState("");
  const [referringDoctor, setReferringDoctor] = useState("Prof. Dr. Ahmed Rahman, FCPS");
  const [orderSource, setOrderSource] = useState<DiagnosticOrderItem["source"]>("Walk-In");
  const [priority, setPriority] = useState<DiagnosticPriority>("Routine");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState<DiagnosticTestItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Add Test Catalog Modal
  const [showAddTest, setShowAddTest] = useState(false);
  const [newTestCode, setNewTestCode] = useState("");
  const [newTestName, setNewTestName] = useState("");
  const [newTestDept, setNewTestDept] = useState<DiagnosticDepartment>("Biochemistry");
  const [newTestSpecimen, setNewTestSpecimen] = useState("Venous Serum");
  const [newTestRef, setNewTestRef] = useState("");
  const [newTestUnit, setNewTestUnit] = useState("mg/dL");
  const [newTestPrice, setNewTestPrice] = useState("800");
  const [newTestTat, setNewTestTat] = useState("6");

  // Add ER Case Form
  const [erPatientName, setErPatientName] = useState("");
  const [erComplaint, setErComplaint] = useState("");
  const [erVitals, setErVitals] = useState("BP 130/80 | HR 90 | SpO2 98%");
  const [erLevel, setErLevel] = useState<ErTriageCaseItem["triageLevel"]>("Yellow - Urgent");

  // Print Studio
  const [printState, setPrintState] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    data: any;
  }>({ isOpen: false, type: "sample_barcode", data: null });

  useEffect(() => {
    setCatalog(getDiagnosticCatalog());
    setOrders(getDiagnosticOrders());
    setErCases(getErTriageCases());

    Promise.all([
      fetch("/api/hospital/diagnostics/catalog").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/hospital/diagnostics/orders").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/hospital/clinical?type=triage").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([catRes, ordRes, erRes]) => {
        if (Array.isArray(catRes?.catalog) && catRes.catalog.length > 0) setCatalog(catRes.catalog);
        if (Array.isArray(ordRes?.orders) && ordRes.orders.length > 0) setOrders(ordRes.orders);
        if (Array.isArray(erRes?.cases) && erRes.cases.length > 0) setErCases(erRes.cases);
      })
      .catch(() => {});
  }, []);

  const handleHealthPassLookup = () => {
    const q = hpLookup.trim().toLowerCase();
    if (!q) return;
    const match = INITIAL_HEALTH_CARDS.find(
      (c) =>
        c.card_number.toLowerCase() === q ||
        (c.english_name || c.patient_name || "").toLowerCase().includes(q) ||
        (c.personal_phone || "").includes(q)
    );
    if (match) {
      const displayName = match.english_name || match.patient_name;
      setPatientName(displayName);
      setPatientPhone(match.personal_phone || "");
      setPatientGender(match.gender || "Male");
      setSmartCardUid(match.card_number);
      toast.success(`Loaded HealthPass ${match.card_number}: ${displayName}`);
    } else {
      toast.warning("No seeded HealthPass card matched — you can continue with manual entry.");
    }
  };

  const toggleTestSelection = (test: DiagnosticTestItem) => {
    setSelectedTests((prev) =>
      prev.some((t) => t.code === test.code)
        ? prev.filter((t) => t.code !== test.code)
        : [...prev, test]
    );
  };

  const subtotal = selectedTests.reduce((s, t) => s + t.price, 0);
  const netPayable = Math.max(0, subtotal - Number(discountAmount || 0));

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || selectedTests.length === 0) {
      toast.error("Please enter patient name and select at least one diagnostic test.");
      return;
    }
    setIsSubmittingOrder(true);
    try {
      const payload = {
        patientName: patientName.trim(),
        patientAge: Number(patientAge || 35),
        patientGender,
        patientPhone: patientPhone.trim(),
        smartCardUid: smartCardUid.trim() || undefined,
        referringDoctor: referringDoctor.trim(),
        source: orderSource,
        priority,
        tests: selectedTests.map((t) => ({
          code: t.code,
          name: t.name,
          department: t.department,
          specimen: t.specimen,
          price: t.price,
        })),
        discountAmount: Number(discountAmount || 0),
        paidAmount: paidAmount !== "" ? Number(paidAmount) : netPayable,
        paymentMethod,
      };

      let created: DiagnosticOrderItem | null = null;
      const res = await fetch("/api/hospital/diagnostics/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (res?.ok) {
        const json = await res.json();
        created = json.order;
      }
      if (!created) {
        created = createDiagnosticOrder(payload);
      }

      setOrders((prev) => [created!, ...prev.filter((o) => o.id !== created!.id)]);
      toast.success(`Diagnostic Order ${created.accessionId} created!`);
      setSelectedTests([]);
      setPrintState({ isOpen: true, type: "diagnostic_invoice", data: created });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleAdvanceStatus = async (order: DiagnosticOrderItem, nextStatus: DiagnosticOrderStatus) => {
    const updated = updateDiagnosticOrderStatus(order.id, nextStatus);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    }
    fetch("/api/hospital/diagnostics/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: nextStatus }),
    }).catch(() => {});
    toast.success(`${order.accessionId} moved to "${nextStatus}"`);
  };

  const handleSaveNewTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim()) return;
    const item: DiagnosticTestItem = {
      id: `cat-${Date.now()}`,
      code: (newTestCode || `TST-${Date.now().toString().slice(-4)}`).toUpperCase(),
      name: newTestName.trim(),
      department: newTestDept,
      specimen: newTestSpecimen.trim() || "Venous Serum",
      referenceRange: newTestRef.trim() || "Lab Specific",
      unit: newTestUnit.trim(),
      price: Number(newTestPrice || 500),
      tatHours: Number(newTestTat || 6),
      isActive: true,
    };

    const next = saveDiagnosticCatalogItem(item);
    setCatalog([...next]);
    fetch("/api/hospital/diagnostics/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }).catch(() => {});
    toast.success(`Added ${item.code} (${item.name}) to catalog.`);
    setShowAddTest(false);
    setNewTestCode("");
    setNewTestName("");
    setNewTestRef("");
  };

  const handleAddErCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!erPatientName.trim() || !erComplaint.trim()) return;
    const newCase: ErTriageCaseItem = {
      id: `er-${Date.now()}`,
      token: `ER-${Math.floor(10 + Math.random() * 89)}`,
      patientName: erPatientName.trim(),
      age: 40,
      gender: "Male",
      chiefComplaint: erComplaint.trim(),
      triageLevel: erLevel,
      vitalsSummary: erVitals,
      status: "In Triage",
      arrivedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const next = saveErTriageCase(newCase);
    setErCases([...next]);
    fetch("/api/hospital/clinical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "triage", ...newCase }),
    }).catch(() => {});
    setErPatientName("");
    setErComplaint("");
    toast.success(`ER Case ${newCase.token} registered (${newCase.triageLevel})`);
  };

  const filteredOrders = orders.filter((o) => {
    if (queueStatusFilter !== "All" && o.status !== queueStatusFilter) return false;
    if (queueSearch.trim()) {
      const q = queueSearch.toLowerCase();
      return (
        o.accessionId.toLowerCase().includes(q) ||
        o.patientName.toLowerCase().includes(q) ||
        (o.smartCardUid || "").toLowerCase().includes(q) ||
        o.patientPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statCount = orders.filter((o) => o.priority === "STAT" && o.status !== "Delivered").length;
  const collectedCount = orders.filter((o) => o.status === "Sample Collected" || o.status === "In Lab").length;
  const readyReviewCount = orders.filter((o) => o.status === "AI Analyzed" || o.status === "Pathologist Review").length;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Diagnostic Center & LIS Command
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Enterprise LIS/PACS
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Order entry, sample barcode tracking, ER STAT triage, test catalog & branded receipt printing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("order")}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={15} /> New Lab / Scan Order
          </button>
          <Link
            href="/hospital/dashboard/reports"
            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Sparkles size={15} /> AI Report Scanner & Print
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-black uppercase text-slate-400">Active Lab Orders</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Walk-in, OPD, IPD & ER</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-xs">
          <div className="text-[11px] font-black uppercase text-rose-600">STAT Priority Queue</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{statCount}</div>
          <div className="text-xs text-rose-600 mt-0.5">Emergency immediate turnaround</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-black uppercase text-sky-600">Samples In Lab / Processing</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{collectedCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Phlebotomy & analyzer run</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-black uppercase text-amber-600">Awaiting Pathologist Sign</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{readyReviewCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">AI pre-screened ready to sign</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: "queue" as const, label: "Phlebotomy & Sample Queue", icon: TestTube2 },
          { id: "order" as const, label: "New Diagnostic Order", icon: ClipboardPlus },
          { id: "catalog" as const, label: "Test Catalog & Tariff", icon: FlaskConical },
          { id: "er" as const, label: "ER STAT Triage Desk", icon: Ambulance },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                active
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PHLEBOTOMY & SAMPLE TRACKING */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                placeholder="Search Accession ID (ACC-...), patient name, HealthPass ID, or phone..."
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
            <select
              value={queueStatusFilter}
              onChange={(e) => setQueueStatusFilter(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="All">All Specimen Stages</option>
              {STATUS_SEQUENCE.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Accession & Priority</th>
                    <th className="py-3.5 px-4">Patient / HealthPass</th>
                    <th className="py-3.5 px-4">Ordered Investigations</th>
                    <th className="py-3.5 px-4">Lifecycle Status</th>
                    <th className="py-3.5 px-4">Billing</th>
                    <th className="py-3.5 px-4 text-right">LIS Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const currentIdx = STATUS_SEQUENCE.indexOf(order.status);
                    const nextStatus =
                      currentIdx >= 0 && currentIdx < STATUS_SEQUENCE.length - 1
                        ? STATUS_SEQUENCE[currentIdx + 1]
                        : null;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-black text-slate-900">{order.accessionId}</div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black ${
                              order.priority === "STAT"
                                ? "bg-rose-100 text-rose-700"
                                : order.priority === "Urgent"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {order.priority} • {order.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{order.patientName}</div>
                          <div className="text-[11px] text-slate-500">
                            {order.patientAge}Y / {order.patientGender} {order.smartCardUid ? `• ${order.smartCardUid}` : ""}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[260px]">
                          {order.tests.map((t, idx) => (
                            <div key={idx} className="font-semibold text-slate-800 truncate">
                              • {t.name}
                            </div>
                          ))}
                          <div className="text-[11px] text-slate-400 mt-0.5">Ref: {order.referringDoctor}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1">
                            <Clock size={11} /> {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900">
                            ৳ {(order.totalAmount - order.discountAmount).toLocaleString()}
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"
                            }`}
                          >
                            {order.paymentStatus} ({order.paymentMethod || "Cash"})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {nextStatus && (
                              <button
                                type="button"
                                onClick={() => handleAdvanceStatus(order, nextStatus)}
                                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <ArrowRight size={12} /> {nextStatus}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setPrintState({ isOpen: true, type: "sample_barcode", data: order })}
                              className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Barcode size={12} /> Barcode
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintState({ isOpen: true, type: "diagnostic_invoice", data: order })}
                              className="h-8 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Receipt size={12} /> Receipt
                            </button>
                            <Link
                              href={`/hospital/dashboard/reports?accessionId=${encodeURIComponent(order.accessionId)}&patient=${encodeURIComponent(order.patientName)}`}
                              className="h-8 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                            >
                              <Sparkles size={12} /> AI Result
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECEPTION & NEW ORDER ENTRY */}
      {activeTab === "order" && (
        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Patient Lookup Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <QrCode size={16} className="text-emerald-600" /> 1. Patient Registration & HealthPass Lookup
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hpLookup}
                    onChange={(e) => setHpLookup(e.target.value)}
                    placeholder="HP-2026-8841 or phone..."
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleHealthPassLookup}
                    className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Patient Full Name *</label>
                  <input
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rahim Uddin"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Phone Number</label>
                  <input
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+880 17..."
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">HealthPass ID (Optional)</label>
                  <input
                    value={smartCardUid}
                    onChange={(e) => setSmartCardUid(e.target.value)}
                    placeholder="HP-2026-..."
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Age / Gender</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-20 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Referring Physician</label>
                  <input
                    value={referringDoctor}
                    onChange={(e) => setReferringDoctor(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Source & Priority</label>
                  <div className="flex gap-2">
                    <select
                      value={orderSource}
                      onChange={(e) => setOrderSource(e.target.value as any)}
                      className="flex-1 h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="Walk-In">Walk-In</option>
                      <option value="OPD">OPD</option>
                      <option value="IPD">IPD</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as DiagnosticPriority)}
                      className="flex-1 h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Selection Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FlaskConical size={16} className="text-emerald-600" /> 2. Select Tests, Scans or Checkup Packages
                </h2>
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter tests (CBC, HbA1c, MRI, Echo)..."
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {catalog
                  .filter(
                    (t) =>
                      t.isActive &&
                      (!catalogSearch.trim() ||
                        t.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        t.code.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        t.department.toLowerCase().includes(catalogSearch.toLowerCase()))
                  )
                  .map((test) => {
                    const checked = selectedTests.some((s) => s.code === test.code);
                    return (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => toggleTestSelection(test)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          checked
                            ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                            : "bg-slate-50/70 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-black text-slate-900">{test.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {test.department} • {test.specimen} • TAT {test.tatHours}h
                            </div>
                          </div>
                          <span className="font-mono text-xs font-black text-emerald-700 shrink-0">
                            ৳ {test.price.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Summary & Billing */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs h-fit space-y-4">
            <h2 className="text-sm font-black text-slate-900">Order & Billing Summary</h2>
            {selectedTests.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
                Select tests from the catalog to build an order.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedTests.map((t) => (
                  <div key={t.code} className="flex justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl">
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    <span className="font-mono font-bold text-slate-900">৳ {t.price}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Gross Subtotal</span>
                <span className="font-mono font-black text-slate-900">৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold">Concession / Discount (৳)</span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-24 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono font-bold"
                />
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-700 pt-2 border-t border-slate-100">
                <span>Net Payable</span>
                <span className="font-mono">৳ {netPayable.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option>Cash</option>
                    <option>bKash</option>
                    <option>Nagad</option>
                    <option>Card</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Paid Amount</label>
                  <input
                    type="number"
                    placeholder={String(netPayable)}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingOrder || selectedTests.length === 0}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              {isSubmittingOrder ? "Creating Accession..." : "Generate Accession & Print Receipt"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: TEST CATALOG & TARIFF */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Hospital Diagnostic Test Master ({catalog.length} Tests)</h2>
              <p className="text-xs text-slate-500">Manage Pathology, Biochemistry, Radiology, Cardiology & Checkup packages.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTest((v) => !v)}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Add Test / Package
            </button>
          </div>

          {showAddTest && (
            <form onSubmit={handleSaveNewTest} className="bg-white p-5 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                value={newTestCode}
                onChange={(e) => setNewTestCode(e.target.value)}
                placeholder="Code (e.g. TST-DENGUE)"
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
              <input
                required
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="Test Name *"
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium sm:col-span-2"
              />
              <select
                value={newTestDept}
                onChange={(e) => setNewTestDept(e.target.value as DiagnosticDepartment)}
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option>Biochemistry</option>
                <option>Hematology</option>
                <option>Pathology</option>
                <option>Immunology</option>
                <option>Cardiology</option>
                <option>Radiology</option>
                <option>Microbiology</option>
                <option>Health Packages</option>
              </select>
              <input
                value={newTestSpecimen}
                onChange={(e) => setNewTestSpecimen(e.target.value)}
                placeholder="Specimen Type"
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
              <input
                value={newTestRef}
                onChange={(e) => setNewTestRef(e.target.value)}
                placeholder="Ref Range (e.g. 0.7 - 1.3)"
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
              <input
                type="number"
                value={newTestPrice}
                onChange={(e) => setNewTestPrice(e.target.value)}
                placeholder="Price BDT"
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newTestTat}
                  onChange={(e) => setNewTestTat(e.target.value)}
                  placeholder="TAT hrs"
                  className="w-20 h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
                <button
                  type="submit"
                  className="flex-1 h-10 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Test
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Investigation / Package Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Specimen & Reference Range</th>
                  <th className="py-3 px-4">TAT</th>
                  <th className="py-3 px-4 text-right">Fee (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catalog.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{t.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        {t.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{t.specimen}</div>
                      <div className="text-[11px] font-mono text-slate-400">{t.referenceRange}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{t.tatHours} hrs</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      ৳ {t.price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ER STAT TRIAGE DESK */}
      {activeTab === "er" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {erCases.map((c) => (
              <div
                key={c.id}
                className={`bg-white p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  c.triageLevel.startsWith("Red") ? "border-rose-300 bg-rose-50/20" : "border-slate-200/80"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                      {c.token}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                        c.triageLevel.startsWith("Red")
                          ? "bg-rose-600 text-white"
                          : c.triageLevel.startsWith("Yellow")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {c.triageLevel}
                    </span>
                    <span className="text-[11px] text-slate-500">Arrived {c.arrivedAt}</span>
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {c.patientName} ({c.age}Y / {c.gender}) {c.smartCardUid ? `• ${c.smartCardUid}` : ""}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-600 shrink-0" /> {c.chiefComplaint}
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">{c.vitalsSummary}</div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientName(c.patientName);
                      setPatientAge(String(c.age));
                      setPatientGender(c.gender);
                      setSmartCardUid(c.smartCardUid || "");
                      setOrderSource("Emergency");
                      setPriority("STAT");
                      const trop = catalog.find((t) => t.code === "TST-TROP");
                      if (trop) setSelectedTests([trop]);
                      setActiveTab("order");
                      toast.info(`Loaded ER Patient ${c.patientName} into STAT Order Desk.`);
                    }}
                    className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Stethoscope size={14} /> 1-Click STAT Lab
                  </button>
                  <Link
                    href="/hospital/dashboard/beds"
                    className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    Admit ICU/Bed
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddErCase} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 h-fit text-xs">
            <h3 className="text-sm font-black text-slate-900">Register ER Arrival</h3>
            <input
              required
              value={erPatientName}
              onChange={(e) => setErPatientName(e.target.value)}
              placeholder="Patient Name *"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
            <select
              value={erLevel}
              onChange={(e) => setErLevel(e.target.value as any)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="Red - Immediate">Red - Immediate (Resuscitation)</option>
              <option value="Yellow - Urgent">Yellow - Urgent</option>
              <option value="Green - Non-Urgent">Green - Non-Urgent</option>
            </select>
            <input
              value={erVitals}
              onChange={(e) => setErVitals(e.target.value)}
              placeholder="Vitals Summary (BP, HR, SpO2)"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
            <textarea
              required
              rows={3}
              value={erComplaint}
              onChange={(e) => setErComplaint(e.target.value)}
              placeholder="Chief Complaint & Triage Notes..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
            <button
              type="submit"
              className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Log ER Case
            </button>
          </form>
        </div>
      )}

      {/* Branded Print Studio */}
      <HospitalPrintStudio
        isOpen={printState.isOpen}
        onClose={() => setPrintState((s) => ({ ...s, isOpen: false }))}
        documentType={printState.type}
        data={printState.data}
      />
    </div>
  );
}
