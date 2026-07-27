"use client";

import React, { useState } from "react";
import { Search, Plus, Star, Building2, Zap, Edit2, Trash2 } from "lucide-react";

const mockMedicines = [
  { id: 1, name: "Napa Extra", type: "Tablet", generic: "Paracetamol + Caffeine", company: "Beximco Pharma", priority: "High Priority", category: "Analgesic" },
  { id: 2, name: "Seclo 20mg", type: "Capsule", generic: "Omeprazole", company: "Square Pharma", priority: "Standard", category: "Anti-ulcerant" },
  { id: 3, name: "Tufnil", type: "Tablet", generic: "Tolfenamic Acid", company: "Eskayef", priority: "High Priority", category: "NSAID" },
  { id: 4, name: "Fexo 120mg", type: "Tablet", generic: "Fexofenadine", company: "Square Pharma", priority: "Standard", category: "Antihistamine" },
  { id: 5, name: "Maxpro 20mg", type: "Tablet", generic: "Esomeprazole", company: "Renata Limited", priority: "High Priority", category: "Anti-ulcerant" },
];

export function MedicineInventory() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] relative overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          
          {/* 1. Top Header & Action Bar (Height: 64px) */}
          <div className="h-[64px] flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-[#111827] tracking-tight">Preferred Medicines</h1>
              <p className="text-[13px] text-slate-500 mt-0.5">Manage sponsored brands for AI auto-suggestions.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search medicines, generics..."
                  className="w-[320px] h-[40px] pl-10 pr-4 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-700 outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED]/20 shadow-sm transition-all"
                />
              </div>
              <button className="h-[40px] px-5 bg-[#2F80ED] hover:bg-[#2563EB] text-white rounded-[8px] text-[14px] font-bold flex items-center gap-2 shadow-sm transition-colors">
                <Plus size={16} />
                Add Medicine
              </button>
            </div>
          </div>

          {/* 2. Statistics/Summary Cards (Height: 90px, Gap: 24px) */}
          <div className="flex gap-6">
            <div className="flex-1 h-[90px] bg-white border border-slate-200 rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase text-slate-500 tracking-wider mb-1">Total Preferred Brands</p>
                <p className="text-[24px] font-bold text-[#111827] leading-none">42</p>
              </div>
              <div className="w-[40px] h-[40px] bg-blue-50 text-[#2F80ED] rounded-[10px] flex items-center justify-center">
                <Star size={20} />
              </div>
            </div>

            <div className="flex-1 h-[90px] bg-white border border-slate-200 rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase text-slate-500 tracking-wider mb-1">Active Companies</p>
                <p className="text-[24px] font-bold text-amber-500 leading-none">8</p>
              </div>
              <div className="w-[40px] h-[40px] bg-amber-50 text-amber-500 rounded-[10px] flex items-center justify-center">
                <Building2 size={20} />
              </div>
            </div>

            <div className="flex-1 h-[90px] bg-white border border-slate-200 rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase text-slate-500 tracking-wider mb-1">AI Suggestion Rate</p>
                <p className="text-[24px] font-bold text-emerald-500 leading-none">84%</p>
              </div>
              <div className="w-[40px] h-[40px] bg-emerald-50 text-emerald-500 rounded-[10px] flex items-center justify-center">
                <Zap size={20} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            {["All", "Tablet", "Capsule", "Syrup", "Injection"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[14px] font-semibold transition-colors border-b-2 ${
                  activeTab === tab 
                    ? "border-[#2F80ED] text-[#2F80ED]" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 3. Main Inventory Table */}
          <div className="w-full bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden min-h-[500px] flex flex-col">
            {/* Header Row (Height: 48px) */}
            <div className="h-[48px] bg-slate-50 border-b border-slate-200 flex items-center px-6 shrink-0">
              <div className="w-[30%] text-[12px] font-bold uppercase text-slate-500 tracking-wider">Medicine Name</div>
              <div className="w-[20%] text-[12px] font-bold uppercase text-slate-500 tracking-wider">Category</div>
              <div className="w-[25%] text-[12px] font-bold uppercase text-slate-500 tracking-wider">Pharmaceutical Co.</div>
              <div className="w-[15%] text-[12px] font-bold uppercase text-slate-500 tracking-wider">AI Priority</div>
              <div className="w-[10%] text-[12px] font-bold uppercase text-slate-500 tracking-wider text-right">Actions</div>
            </div>

            {/* Data Rows (Row Height: 64px) */}
            <div className="flex-1 overflow-y-auto">
              {mockMedicines.map((med) => (
                <div 
                  key={med.id}
                  className="h-[64px] flex items-center px-6 border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-[30%] pr-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <Star size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#111827] truncate">
                        {med.type} {med.name}
                      </p>
                      <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5">{med.generic}</p>
                    </div>
                  </div>
                  
                  <div className="w-[20%] pr-4">
                    <p className="text-[14px] font-medium text-[#374151] truncate">{med.category}</p>
                  </div>
                  
                  <div className="w-[25%] pr-4 flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <p className="text-[14px] font-semibold text-slate-700 truncate">{med.company}</p>
                  </div>

                  <div className="w-[15%] pr-4 flex items-center">
                    {med.priority === "High Priority" && (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-[6px] text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                        <Zap size={12} /> HIGH
                      </span>
                    )}
                    {med.priority === "Standard" && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-[6px] text-[11px] font-bold border border-slate-200">
                        STANDARD
                      </span>
                    )}
                  </div>

                  <div className="w-[10%] flex items-center justify-end gap-2">
                    <button aria-label="Edit medicine" className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#2F80ED] hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Edit2 size={16} />
                    </button>
                    <button aria-label="Delete medicine" className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
