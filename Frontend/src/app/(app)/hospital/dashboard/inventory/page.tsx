"use client";

import { useState } from "react";
import { Package, Search, AlertTriangle, CheckCircle2, Plus, ArrowDown, Droplets, Layers } from "lucide-react";
import { toast, Toaster } from "sonner";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

const mockInventory = [
  { id: "MED-01", name: "Liquid Medical Oxygen (Central Tank)", category: "Gas & Life Support", stock: "8,500 L", capacity: "10,000 L", level: 85, status: "Normal" },
  { id: "MED-02", name: "Inj. Streptokinase 1,500,000 IU", category: "Emergency Cardiac", stock: "14 Vials", capacity: "50 Vials", level: 28, status: "Low Stock" },
  { id: "MED-03", name: "IV Normal Saline 1000ml", category: "Fluids", stock: "450 Bags", capacity: "600 Bags", level: 75, status: "Normal" },
  { id: "MED-04", name: "Ventilator Breathing Circuits (Adult)", category: "ICU Consumables", stock: "12 Sets", capacity: "40 Sets", level: 30, status: "Reorder Soon" },
  { id: "MED-05", name: "Sterile Surgical Gloves (Size 7.5)", category: "Surgical Supply", stock: "1,200 Pairs", capacity: "1,500 Pairs", level: 80, status: "Normal" },
];

export default function HospitalInventoryPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = mockInventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoryOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Supply Categories" },
    { value: "Gas & Life Support", label: "Gas & Life Support" },
    { value: "Emergency Cardiac", label: "Emergency Cardiac" },
    { value: "Fluids", label: "IV Fluids" },
    { value: "ICU Consumables", label: "ICU Consumables" },
    { value: "Surgical Supply", label: "Surgical Supply" },
  ];

  const statusOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Stock Levels" },
    { value: "Normal", label: "Normal Stock", dotColor: "bg-emerald-500" },
    { value: "Low Stock", label: "Low Stock Alert", dotColor: "bg-rose-500" },
    { value: "Reorder Soon", label: "Reorder Soon", dotColor: "bg-amber-500" },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Medical Supplies & Pharmacy</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live stock monitoring, critical oxygen supplies, and inventory replenishment.</p>
        </div>
        <button onClick={() => toast.info("New stock requisition created")} className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer">
          <Plus size={16} /> Requisition Stock
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total SKUs Monitored</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">428 Items</p>
          <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">100% vital medicines tracked</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Low Stock Warnings</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">6 Items</p>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">Requisition orders generated</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Central Oxygen Level</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">85% Full</p>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">Liquid O2 Reserve: 8,500 L</span>
        </div>
      </div>

      {/* Search & Popup Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU code, item name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
          <div className="w-full sm:w-60">
            <CustomSelect
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              options={categoryOptions}
              prefix="Category:"
              icon={Layers}
              menuWidth="w-68"
            />
          </div>

          <div className="w-full sm:w-52">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={statusOptions}
              prefix="Status:"
              icon={CheckCircle2}
              menuWidth="w-56"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-5">SKU Code</th>
                <th className="py-3.5 px-5">Item Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Current Stock</th>
                <th className="py-3.5 px-5">Stock Level</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-slate-800">{item.id}</td>
                  <td className="py-4 px-5 font-bold text-slate-900 text-sm">{item.name}</td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-800">{item.stock}</td>
                  <td className="py-4 px-5">
                    <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.level < 35 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      item.status === "Normal" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button onClick={() => toast.success(`Restock order queued for ${item.name}`)} className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-blue-600 font-bold text-xs cursor-pointer">
                      Restock →
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No medical supplies found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
