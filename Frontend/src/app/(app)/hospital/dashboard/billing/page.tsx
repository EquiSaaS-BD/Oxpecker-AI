"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Search,
  Filter,
  Plus,
  X,
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Invoice {
  id: string;
  uhid: string;
  patientName: string;
  date: string;
  items: string;
  amount: number;
  status: "Paid" | "Pending" | "Partially Paid";
  paymentMethod: string;
}

const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-091",
    uhid: "UHID-8801",
    patientName: "Mohammad Rafiq",
    date: "2026-10-12",
    items: "ICU Bed (2 days), Oxygen Support, ECG, Medicines",
    amount: 38500,
    status: "Partially Paid",
    paymentMethod: "bKash / Cash",
  },
  {
    id: "INV-2026-090",
    uhid: "UHID-8802",
    patientName: "Nasima Begum",
    date: "2026-10-11",
    items: "Cabin-201 (1 day), Ortho Consultation, X-Ray",
    amount: 8200,
    status: "Paid",
    paymentMethod: "Credit Card (City Bank)",
  },
  {
    id: "INV-2026-089",
    uhid: "UHID-8799",
    patientName: "Hasibul Hasan",
    date: "2026-10-11",
    items: "Cardiology OPD Consultation, Echo, CBC",
    amount: 4500,
    status: "Paid",
    paymentMethod: "Nagad",
  },
  {
    id: "INV-2026-088",
    uhid: "UHID-8804",
    patientName: "Rokeya Khatun",
    date: "2026-10-10",
    items: "Laparoscopic Surgery Package, 3-Day General Ward",
    amount: 54000,
    status: "Paid",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV-2026-087",
    uhid: "UHID-8795",
    patientName: "Arifur Rahman",
    date: "2026-10-09",
    items: "Emergency Triage, CT Brain Scan, Saline Infusion",
    amount: 14600,
    status: "Pending",
    paymentMethod: "Unpaid",
  },
];

export default function HospitalBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    patientName: "",
    uhid: "UHID-8805",
    items: "",
    amount: "",
    paymentMethod: "Cash",
    status: "Paid" as Invoice["status"],
  });

  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.status === "Paid" ? inv.amount : inv.status === "Partially Paid" ? inv.amount * 0.5 : 0), 0);
  const pendingAmount = invoices.filter((inv) => inv.status === "Pending").reduce((acc, inv) => acc + inv.amount, 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total Revenue Collected", value: `৳${(totalRevenue).toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Dues", value: `৳${(pendingAmount).toLocaleString()}`, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Invoices Generated", value: invoices.length, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Collection Rate", value: "92.4%", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.patientName || !newInvoice.amount) return;

    const created: Invoice = {
      id: `INV-2026-${String(invoices.length + 92).padStart(3, "0")}`,
      uhid: newInvoice.uhid,
      patientName: newInvoice.patientName,
      date: new Date().toISOString().split("T")[0],
      items: newInvoice.items || "General Hospital Services & Medicine",
      amount: Number(newInvoice.amount) || 2000,
      status: newInvoice.status,
      paymentMethod: newInvoice.paymentMethod,
    };

    setInvoices([created, ...invoices]);
    setIsModalOpen(false);
    setNewInvoice({
      patientName: "",
      uhid: "UHID-8805",
      items: "",
      amount: "",
      paymentMethod: "Cash",
      status: "Paid",
    });
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Partially Paid":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing & Finances</h1>
          <p className="text-sm text-slate-500 mt-1">Manage hospital billing, invoices, bed charges, and patient collections.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${st.bg} flex items-center justify-center shrink-0`}>
              <Receipt size={22} className={st.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{st.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{st.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, UHID, or patient name..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {["All", "Paid", "Partially Paid", "Pending"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Invoice / Date</th>
                <th className="py-3.5 px-5">Patient UHID</th>
                <th className="py-3.5 px-5">Billed Items</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{inv.id}</p>
                      <p className="text-xs text-slate-400">{inv.date}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{inv.patientName}</p>
                      <p className="text-xs text-slate-400 font-mono">{inv.uhid}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <p className="text-xs text-slate-700 max-w-xs">{inv.items}</p>
                    <span className="text-[11px] text-slate-400">{inv.paymentMethod}</span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900">
                    ৳{inv.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-1.5">
                    {inv.status !== "Paid" && (
                      <button
                        onClick={() => {
                          setInvoices((prev) =>
                            prev.map((i) => (i.id === inv.id ? { ...i, status: "Paid" } : i))
                          );
                        }}
                        className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => alert(`Downloading Invoice Receipt ${inv.id}`)}
                      className="text-xs p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                      title="Download Invoice"
                    >
                      <Download size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <Receipt size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">No invoices found</h3>
            <p className="text-xs text-slate-400 mt-1">Try another search or status filter.</p>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Create New Patient Bill</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.patientName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, patientName: e.target.value })}
                    placeholder="e.g. Kamal Hossain"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Patient UHID</label>
                  <input
                    type="text"
                    value={newInvoice.uhid}
                    onChange={(e) => setNewInvoice({ ...newInvoice, uhid: e.target.value })}
                    placeholder="e.g. UHID-8805"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Billed Items & Services</label>
                  <input
                    type="text"
                    value={newInvoice.items}
                    onChange={(e) => setNewInvoice({ ...newInvoice, items: e.target.value })}
                    placeholder="e.g. Consultation, Blood Test, 1-Day Bed"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Total Amount (৳) *</label>
                    <input
                      type="number"
                      required
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Payment Method</label>
                    <select
                      value={newInvoice.paymentMethod}
                      onChange={(e) => setNewInvoice({ ...newInvoice, paymentMethod: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Unpaid">Unpaid / Later</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    Issue Invoice
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
