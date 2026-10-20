"use client";

import { useState } from "react";
import { Receipt, Search, Download, CreditCard, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { toast, Toaster } from "sonner";

const mockInvoices = [
  { id: "INV-9901", patient: "Al Amin Sheikh", package: "Cardiac Emergency Package", amount: "৳ 45,000", date: "20 Oct 2026", method: "bKash Merchant", status: "Paid" },
  { id: "INV-9902", patient: "Mst. Rehana Parvin", package: "Maternity & Delivery (Normal)", amount: "৳ 25,000", date: "19 Oct 2026", method: "City Bank POS", status: "Paid" },
  { id: "INV-9903", patient: "Shahidul Islam", package: "ICU Day 1 + Oxygen Support", amount: "৳ 18,500", date: "20 Oct 2026", method: "Bank Transfer", status: "Pending" },
  { id: "INV-9904", patient: "Faruk Hossain", package: "Executive Health Checkup", amount: "৳ 6,000", date: "18 Oct 2026", method: "Nagad", status: "Paid" },
];

export default function HospitalBillingPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Hospital Finances</h1>
          <p className="text-sm text-slate-500 mt-0.5">Package bookings, patient settlements, and hospital revenue tracking.</p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">৳ 2,40,500</p>
          <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">+15% vs yesterday</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Settled Packages (Gigs)</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">৳ 1,85,000</p>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">14 Packages booked</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Clearance</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">৳ 55,500</p>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">3 pending bank receipts</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Recent Transactions & Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Service Package</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{inv.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{inv.patient}</td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs">{inv.package}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{inv.amount}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">{inv.method}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      inv.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => toast.success(`Downloading invoice ${inv.id}`)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 justify-end ml-auto cursor-pointer">
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
