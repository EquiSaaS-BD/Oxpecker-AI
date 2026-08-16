"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Filter, Pencil, CheckCircle2, Eye, Calendar, X } from "lucide-react";
import { toast } from "sonner";

// Mock Data for Prescription History
const MOCK_HISTORY = [
  { id: "RX-1004", patientName: "Rafin Hossain", date: "24 July, 2026", diagnosis: "Viral Fever & Fatigue", age: 24, gender: "Male" },
  { id: "RX-1003", patientName: "Nafisa Akter", date: "23 July, 2026", diagnosis: "Migraine & Sleep Deprivation", age: 28, gender: "Female" },
  { id: "RX-1002", patientName: "Karim Uddin", date: "22 July, 2026", diagnosis: "Gastric Ulcer", age: 45, gender: "Male" },
  { id: "RX-1001", patientName: "Sumaiya Rahman", date: "20 July, 2026", diagnosis: "Seasonal Asthma", age: 32, gender: "Female" },
];

export default function PrescriptionsPage() {
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRx, setSelectedRx] = useState<typeof MOCK_HISTORY[0] | null>(null);

  const handleEdit = (rx: typeof MOCK_HISTORY[0]) => {
    // In a real app, this would open the editor or redirect to /prescription/new?id=...
    // For now, we simulate the edit and trigger the required notification.
    toast.success(`Editing Prescription ${rx.id}`);
    
    // Simulate saving the edit after a short delay to trigger patient notification
    setTimeout(() => {
      toast("Patient Notified", {
        description: `Notification sent to ${rx.patientName}: "Your prescription has been updated by your doctor."`,
        icon: <CheckCircle2 className="text-emerald-500" />,
      });
      
      // Save notification to local storage for patient side simulation
      const notifsStr = localStorage.getItem('shustota_notifications');
      const notifs = notifsStr ? JSON.parse(notifsStr) : [];
      notifs.push({ 
        id: Date.now().toString(), 
        title: "Prescription Updated",
        message: `Your prescription (${rx.id}) for ${rx.diagnosis} has been updated by your doctor.`, 
        read: false,
        time: new Date().toISOString()
      });
      localStorage.setItem('shustota_notifications', JSON.stringify(notifs));
    }, 1500);
  };

  const filteredHistory = history.filter(h => 
    h.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto flex flex-col gap-4 lg:gap-6 pb-[80px] lg:pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-[20px] lg:text-[24px] font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-[#2F80ED]" />
            Prescriptions
          </h1>
          <p className="text-slate-500 mt-1 text-[13px] lg:text-[14px]">Manage and view all your patient prescriptions.</p>
        </div>
        
        <Link href="/doctor/dashboard/prescription/new" className="w-full sm:w-auto bg-[#6DDA6E] hover:bg-[#5bc95c] text-white px-6 h-[48px] rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6DDA6E]/20 transition-all hover:-translate-y-0.5 active:scale-95">
          <Plus size={20} />
          Create New
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient Name or ID..."
            className="w-full h-[48px] pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2F80ED] focus:ring-4 focus:ring-[#2F80ED]/10 transition-all shadow-sm text-[14px]"
          />
        </div>
        <button className="h-[48px] px-6 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm shrink-0 w-full sm:w-auto">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Prescription History List */}
      <div className="flex flex-col gap-3 lg:gap-4">
        <h2 className="text-[16px] lg:text-[18px] font-bold text-slate-800 px-1 mt-2">Prescription History</h2>
        
        {filteredHistory.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredHistory.map((rx) => (
              <div key={rx.id} className="bg-white p-4 lg:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[12px] font-bold text-[#2F80ED] bg-[#2F80ED]/10 px-2.5 py-1 rounded-md">{rx.id}</span>
                    <span className="text-[12px] text-slate-400 font-medium flex items-center gap-1.5">
                      <Calendar size={12} /> {rx.date}
                    </span>
                  </div>
                  <h3 className="text-[15px] lg:text-[16px] font-bold text-slate-800">{rx.patientName}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <p className="text-[12px] lg:text-[13px] text-slate-500">{rx.age} yrs • {rx.gender}</p>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <p className="text-[13px] font-medium text-slate-600 line-clamp-1">{rx.diagnosis}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
                  <button 
                    onClick={() => setSelectedRx(rx)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#2F80ED] hover:text-[#2563EB] bg-[#2F80ED]/10 hover:bg-[#2F80ED]/20 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <Link 
                    href={`/doctor/dashboard/prescription/new?patientName=${encodeURIComponent(rx.patientName)}&edit=true`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#F59E0B] hover:text-[#D97706] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center p-12 text-center mt-2">
            <FileText size={32} className="text-slate-300 mb-4" />
            <p className="text-slate-500 text-[14px]">No prescriptions found.</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-[200] flex sm:items-center justify-center sm:p-4 bg-slate-900/40 sm:backdrop-blur-sm" onClick={() => setSelectedRx(null)}>
          <div className="bg-white w-full h-full sm:h-auto sm:rounded-2xl sm:max-w-md shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800 text-[16px]">Prescription Details</h3>
              <button onClick={() => setSelectedRx(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-[#2F80ED] bg-[#2F80ED]/10 px-3 py-1.5 rounded-lg">{selectedRx.id}</span>
                <span className="text-[13px] text-slate-500 font-medium flex items-center gap-1.5"><Calendar size={14} /> {selectedRx.date}</span>
              </div>
              <div>
                <p className="text-[13px] text-slate-500 mb-0.5">Patient Name</p>
                <h4 className="text-[20px] font-bold text-slate-800">{selectedRx.patientName}</h4>
                <p className="text-[14px] text-slate-600 mt-1">{selectedRx.age} yrs • {selectedRx.gender}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[13px] text-slate-500 mb-1.5">Primary Diagnosis</p>
                <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">{selectedRx.diagnosis}</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-white">
              <Link 
                href={`/doctor/dashboard/prescription/new?patientName=${encodeURIComponent(selectedRx.patientName)}&edit=true`}
                className="flex items-center justify-center gap-2 text-[15px] font-bold text-white bg-[#F59E0B] hover:bg-[#D97706] px-6 h-[52px] sm:h-[48px] rounded-xl transition-all shadow-md shadow-[#F59E0B]/20 w-full sm:w-auto"
              >
                <Pencil size={18} />
                Edit Prescription
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
