"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer, Download, CheckCircle2 } from "lucide-react";

interface BillReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    patientName: string;
    patientId: string;
    date: string;
    items: { name: string; amount: number }[];
    total: number;
    paymentMethod: string;
    status: string;
    receiptNo: string;
  } | null;
}

export function BillReceiptModal({ isOpen, onClose, receiptData }: BillReceiptModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !receiptData) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col sm:items-center sm:justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      
      {/* Mobile: Full Screen, Desktop: Centered Card */}
      <div className="flex-1 sm:flex-none flex flex-col w-full sm:w-[480px] bg-slate-50 sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 pt-safe-top">
          <h2 className="text-[18px] font-bold text-slate-800">Bill Receipt</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
          
          {/* Actual Receipt Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[20px] font-bold text-[#2F80ED]">Shustota AI</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">Medical Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Receipt No</p>
                <p className="text-[13px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md font-mono">{receiptData.receiptNo}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase mb-0.5">Patient Name</p>
                  <p className="text-[14px] font-bold text-slate-800">{receiptData.patientName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase mb-0.5">Patient ID</p>
                  <p className="text-[14px] font-bold text-slate-800 font-mono">{receiptData.patientId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase mb-0.5">Date</p>
                  <p className="text-[13px] font-semibold text-slate-700">{receiptData.date}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase mb-0.5">Status</p>
                  <div className="flex items-center gap-1 text-[#22C55E]">
                    <CheckCircle2 size={14} />
                    <span className="text-[12px] font-bold">{receiptData.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-4 mb-4">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                <span>Description</span>
                <span>Amount</span>
              </div>
              
              <div className="space-y-3">
                {receiptData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-1">
                    <span className="text-[14px] font-semibold text-slate-700">{item.name}</span>
                    <span className="text-[14px] font-bold text-slate-800">৳ {item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mt-2">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[14px] font-bold text-slate-600">Total Amount</span>
                <span className="text-[18px] font-bold text-[#2F80ED]">৳ {receiptData.total}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[12px] font-semibold text-slate-500">Payment Method</span>
                <span className="text-[12px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{receiptData.paymentMethod}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 sm:p-6 border-t border-slate-100 flex gap-3 shrink-0 pb-safe">
          <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-12 rounded-xl transition-colors active:scale-95 text-[14px]">
            <Download size={18} />
            Download
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-[#2F80ED] hover:bg-[#256bbd] text-white font-bold h-12 rounded-xl transition-colors shadow-[0_4px_14px_rgba(47,128,237,0.3)] active:scale-95 text-[14px]">
            <Printer size={18} />
            Print Bill
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
