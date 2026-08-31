"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, DollarSign, Wallet, Smartphone, CreditCard, CheckCircle2 } from "lucide-react";

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: any) => void;
}

export function ManualPaymentModal({ isOpen, onClose, onSave }: ManualPaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !amount) return;

    // Create a mock payment object
    const newPayment = {
      id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      patientName: "New Patient (Walk-in)",
      patientId: patientId,
      amount: parseInt(amount),
      method: method,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: "Paid",
      items: [
        { name: "Manual Payment Entry", amount: parseInt(amount) }
      ]
    };

    onSave(newPayment);
    // Reset form
    setPatientId("");
    setAmount("");
    setMethod("Cash");
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end sm:items-center sm:justify-center bg-white/50 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      
      <div className="w-full sm:w-[450px] bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-slate-800">Record Payment</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-[13px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Patient ID / Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User size={18} className="text-slate-500" />
              </div>
              <input
                type="text"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. 017XXXXX or K 99 11"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Amount (৳)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-slate-500" />
              </div>
              <input
                type="number"
                required
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[18px] font-bold text-[#2F80ED] focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => setMethod("Cash")}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${method === "Cash" ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                <Wallet size={20} className={method === "Cash" ? "text-emerald-600" : ""} />
                <span className="text-[12px] font-bold">Cash</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setMethod("bKash")}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${method === "bKash" ? "bg-pink-50 border-pink-500 text-pink-700 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                <Smartphone size={20} className={method === "bKash" ? "text-pink-600" : ""} />
                <span className="text-[12px] font-bold">bKash</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setMethod("Card")}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${method === "Card" ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                <CreditCard size={20} className={method === "Card" ? "text-purple-600" : ""} />
                <span className="text-[12px] font-bold">Card</span>
              </button>
            </div>
          </div>

          <div className="pt-4 pb-safe-bottom">
            <button 
              type="submit"
              className="w-full py-3.5 bg-[#2F80ED] hover:bg-[#256bbd] text-white rounded-xl font-bold text-[15px] shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Save Payment
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
