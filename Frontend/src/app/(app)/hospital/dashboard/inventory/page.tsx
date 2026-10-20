"use client";

import { useState } from "react";
import { Package, Search, AlertTriangle, CheckCircle2, Plus, ArrowDown, Droplets } from "lucide-react";
import { toast, Toaster } from "sonner";

const mockInventory = [
  { id: "MED-01", name: "Liquid Medical Oxygen (Central Tank)", category: "Gas & Life Support", stock: "8,500 L", capacity: "10,000 L", level: 85, status: "Normal" },
  { id: "MED-02", name: "Inj. Streptokinase 1,500,000 IU", category: "Emergency Cardiac", stock: "14 Vials", capacity: "50 Vials", level: 28, status: "Low Stock" },
  { id: "MED-03", name: "IV Normal Saline 1000ml", category: "Fluids", stock: "450 Bags", capacity: "600 Bags", level: 75, status: "Normal" },
  { id: "MED-04", name: "Ventilator Breathing Circuits (Adult)", category: "ICU Consumables", stock: "12 Sets", capacity: "40 Sets", level: 30, status: "Reorder Soon" },
  { id: "MED-05", name: "Sterile Surgical Gloves (Size 7.5)", category: "Surgical Supply", stock: "1,200 Pairs", capacity: "1,500 Pairs", level: 80, status: "Normal" },
];

export default function HospitalInventoryPage() {
  const [search, setSearch] = useState("");

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

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-semibold text-xs">{item.category}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.stock}</td>
                  <td className="py-3.5 px-4">
                    <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.level < 35 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      item.status === "Normal" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => toast.success(`Restock order queued for ${item.name}`)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                      Restock →
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
