"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Wallet, Receipt, Smartphone, Search, Plus, DollarSign, Filter, Activity } from "lucide-react";
import { BillReceiptModal } from "@/components/assistant/BillReceiptModal";
import { ManualPaymentModal } from "@/components/assistant/ManualPaymentModal";

// Mock Data
const INITIAL_PAYMENTS = [
  {
    id: "PAY-10023",
    patientName: "Rahim Chowdhury",
    patientId: "R 50 29 53",
    amount: 1500,
    method: "bKash",
    time: "10:30 AM",
    date: "24 Jul 2026",
    status: "Paid",
    items: [
      { name: "Doctor Consultation", amount: 1000 },
      { name: "CBC Test", amount: 500 }
    ]
  },
  {
    id: "PAY-10024",
    patientName: "Fatema Begum",
    patientId: "F 44 21 09",
    amount: 800,
    method: "Cash",
    time: "11:15 AM",
    date: "24 Jul 2026",
    status: "Paid",
    items: [
      { name: "Follow-up Visit", amount: 800 }
    ]
  },
  {
    id: "PAY-10025",
    patientName: "Kamal Hossain",
    patientId: "K 99 11 32",
    amount: 3200,
    method: "Card",
    time: "01:45 PM",
    date: "24 Jul 2026",
    status: "Paid",
    items: [
      { name: "Doctor Consultation", amount: 1200 },
      { name: "Lipid Profile", amount: 800 },
      { name: "Chest X-Ray", amount: 1200 }
    ]
  }
];

export default function AssistantPaymentsPage() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "bKash": return <Smartphone size={16} className="text-pink-600" />;
      case "Card": return <CreditCard size={16} className="text-purple-600" />;
      default: return <Wallet size={16} className="text-emerald-600" />;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "bKash": return "bg-pink-50 text-pink-700 border-pink-100";
      case "Card": return "bg-purple-50 text-purple-700 border-purple-100";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  const filteredPayments = payments.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCollection = payments.reduce((sum, p) => sum + p.amount, 0);
  const cashCollection = payments.filter(p => p.method === "Cash").reduce((sum, p) => sum + p.amount, 0);
  const digitalCollection = totalCollection - cashCollection;

  const handleSavePayment = (newPayment: any) => {
    setPayments([newPayment, ...payments]);
    setIsManualPaymentOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 lg:pb-10 font-sans">
      
      {/* Mobile/Desktop Header Area */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6 pt-safe-top relative z-10">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="text-[20px] lg:text-[24px] font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Receipt className="text-[#2F80ED]" size={24} />
              </div>
              Payments & Billing
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1 hidden sm:block">Track daily collections and patient receipts</p>
          </div>
          
          <button 
            onClick={() => setIsManualPaymentOpen(true)}
            className="w-[48px] h-[48px] sm:w-auto sm:px-6 bg-[#2F80ED] text-white rounded-full sm:rounded-xl shadow-md hover:bg-[#256bbd] active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus size={20} />
            <span className="hidden sm:inline font-bold text-[15px]">Record Payment</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 flex flex-col gap-6">
        
        {/* 1. Modern Metric Cards (3-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 min-h-[110px]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <DollarSign size={24} className="text-[#2F80ED]" />
            </div>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">Total Collection</p>
              <h2 className="text-[28px] font-black text-slate-800 leading-none">৳{totalCollection.toLocaleString()}</h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 min-h-[110px]">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Wallet size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">Cash</p>
              <h2 className="text-[28px] font-black text-slate-800 leading-none">৳{cashCollection.toLocaleString()}</h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 min-h-[110px]">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Activity size={24} className="text-purple-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">Digital (bKash/Card)</p>
              <h2 className="text-[28px] font-black text-slate-800 leading-none">৳{digitalCollection.toLocaleString()}</h2>
            </div>
          </div>

        </div>

        {/* 2. Enhanced Toolbar & Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions by name or ID..." 
              className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-[14px] font-medium text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="hidden sm:flex h-[48px] px-6 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-[14px] hover:bg-slate-50 active:scale-95 transition-all items-center justify-center gap-2 shrink-0">
            <Filter size={18} className="text-slate-500" /> Filter
          </button>
        </div>

        {/* 3. Hybrid Responsive Transactions List */}
        <div className="flex-1 pb-6">
          
          {filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Receipt size={24} className="text-slate-500" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800">No transactions found</h3>
              <p className="text-[14px] text-slate-500 mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP VIEW: Premium Data Table */}
              <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                      <tr className="text-[12px] text-slate-500 font-bold uppercase tracking-wider h-[60px]">
                        <th className="px-6 py-4 whitespace-nowrap">Transaction ID</th>
                        <th className="px-6 py-4 whitespace-nowrap">Patient</th>
                        <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                        <th className="px-6 py-4 whitespace-nowrap">Method</th>
                        <th className="px-6 py-4 whitespace-nowrap">Date & Time</th>
                        <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px] divide-y divide-slate-100">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="h-[72px] hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-[14px] font-bold text-slate-500">{payment.id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2F80ED] font-bold text-[15px] flex items-center justify-center border border-blue-100 shrink-0">
                                {payment.patientName.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{payment.patientName}</span>
                                <span className="text-[12px] font-medium text-slate-500 font-mono mt-0.5">{payment.patientId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-[15px] font-extrabold text-[#2F80ED]">৳{payment.amount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase ${getMethodBadge(payment.method)}`}>
                              {getMethodIcon(payment.method)}
                              {payment.method}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{payment.date}</span>
                              <span className="text-[12px] font-medium text-slate-500 mt-0.5">{payment.time}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button 
                              onClick={() => setSelectedReceipt({
                                ...payment,
                                total: payment.amount,
                                receiptNo: payment.id
                              })}
                              className="px-4 py-2 bg-slate-50 hover:bg-[#2F80ED] hover:text-white text-[#2F80ED] text-[13px] font-bold rounded-lg transition-colors active:scale-95"
                            >
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE VIEW: Edge-to-Edge Cards */}
              <div className="sm:hidden -mx-4 flex flex-col bg-white border-y border-slate-100 divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2F80ED] font-bold text-[18px] flex items-center justify-center border border-blue-100 shrink-0">
                          {payment.patientName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-[16px] font-bold text-slate-800 leading-tight">{payment.patientName}</h4>
                          <span className="text-[13px] font-medium text-slate-500 font-mono block mt-1">{payment.patientId}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[16px] font-extrabold text-[#2F80ED] block mb-1">৳{payment.amount}</span>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${getMethodBadge(payment.method)}`}>
                          {getMethodIcon(payment.method)}
                          {payment.method}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[12px] font-medium text-slate-500 font-mono">{payment.id} • {payment.time}</span>
                      <button 
                        onClick={() => setSelectedReceipt({
                          ...payment,
                          total: payment.amount,
                          receiptNo: payment.id
                        })}
                        className="h-[36px] px-4 bg-slate-50 border border-slate-100 text-[#2F80ED] hover:bg-blue-50 text-[13px] font-bold rounded-lg transition-colors active:scale-95"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

      </div>

      {/* Modals */}
      <BillReceiptModal 
        isOpen={!!selectedReceipt} 
        onClose={() => setSelectedReceipt(null)}
        receiptData={selectedReceipt}
      />
      
      <ManualPaymentModal 
        isOpen={isManualPaymentOpen}
        onClose={() => setIsManualPaymentOpen(false)}
        onSave={handleSavePayment}
      />

    </div>
  );
}
