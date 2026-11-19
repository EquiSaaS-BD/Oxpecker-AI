"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle2, Plus, Layers, X } from "lucide-react";
import { toast } from "sonner";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";
import {
  addOrRestockInventoryItem,
  getHospitalInventoryItems,
  type HospitalInventoryItem,
} from "@/lib/hospital-diagnostics";

export default function HospitalInventoryPage() {
  const [items, setItems] = useState<HospitalInventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Requisition Modal State
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqCategory, setReqCategory] = useState<HospitalInventoryItem["category"]>("Lab Reagent & Kit");
  const [reqStock, setReqStock] = useState("100");
  const [reqCapacity, setReqCapacity] = useState("200");
  const [reqUnit, setReqUnit] = useState("Kits");
  const [reqBatch, setReqBatch] = useState("");
  const [reqExpiry, setReqExpiry] = useState("2027-12-31");

  useEffect(() => {
    setItems(getHospitalInventoryItems());
  }, []);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.batchNo || "").toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSubmitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim()) return;
    const updated = addOrRestockInventoryItem({
      name: reqName.trim(),
      category: reqCategory,
      stockCount: Number(reqStock || 50),
      capacityCount: Number(reqCapacity || 100),
      unit: reqUnit.trim() || "Units",
      batchNo: reqBatch.trim() || undefined,
      expiryDate: reqExpiry || undefined,
    });
    setItems([...updated]);
    toast.success(`Stock requisition fulfilled for ${reqName.trim()}`);
    setShowReqModal(false);
    setReqName("");
    setReqBatch("");
  };

  const handleQuickRestock = (item: HospitalInventoryItem) => {
    const updated = addOrRestockInventoryItem({
      id: item.id,
      name: item.name,
      stockCount: item.capacityCount,
      capacityCount: item.capacityCount,
    });
    setItems([...updated]);
    toast.success(`Replenished ${item.name} to full capacity (${item.capacityCount} ${item.unit}).`);
  };

  const lowCount = items.filter((i) => i.status !== "Normal").length;
  const reagentCount = items.filter((i) => i.category === "Lab Reagent & Kit").length;

  const categoryOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Supply Categories" },
    { value: "Lab Reagent & Kit", label: "Diagnostic Lab Reagents & Kits" },
    { value: "Pharmacy Medicine", label: "Pharmacy Medicines" },
    { value: "Gas & Life Support", label: "Gas & Life Support" },
    { value: "Emergency Cardiac", label: "Emergency Cardiac" },
    { value: "Fluids", label: "IV Fluids" },
    { value: "ICU Consumables", label: "ICU Consumables" },
  ];

  const statusOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Stock Levels" },
    { value: "Normal", label: "Normal Stock", dotColor: "bg-emerald-500" },
    { value: "Low Stock", label: "Low Stock Alert", dotColor: "bg-rose-500" },
    { value: "Reorder Soon", label: "Reorder Soon", dotColor: "bg-amber-500" },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hospital Pharmacy & Lab Reagent Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track pharmacy medicines, central medical oxygen, ICU consumables, and diagnostic lab assay kits with batch & expiry alerts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowReqModal(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer shrink-0"
        >
          <Plus size={16} /> New Stock / Reagent Requisition
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tracked SKUs</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{items.length} Batches</p>
          <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">Pharmacy & Diagnostic Stores</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Low Stock / Reorder Alerts</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{lowCount} Items</p>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">1-click instant restock ready</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Diagnostic Lab Reagents</span>
          <p className="text-2xl font-extrabold text-sky-700 mt-1">{reagentCount} Assay Kits</p>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">LIS analyzer reagent telemetry</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU code, item name, batch no., or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
          <div className="w-full sm:w-64">
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
                <th className="py-3.5 px-5">SKU & Batch</th>
                <th className="py-3.5 px-5">Item / Reagent Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Current Stock</th>
                <th className="py-3.5 px-5">Level</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-mono font-bold text-slate-800">{item.id}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.batchNo || "N/A"} • Exp: {item.expiryDate || "—"}
                    </div>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900 text-sm">{item.name}</td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-800">
                    {item.stockCount.toLocaleString()} {item.unit}
                  </td>
                  <td className="py-4 px-5">
                    <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.level < 35 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        item.status === "Normal"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.status === "Low Stock"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleQuickRestock(item)}
                      className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-emerald-700 font-bold text-xs cursor-pointer"
                    >
                      Restock Full →
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No medical supplies or reagents found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock / Reagent Requisition Modal */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-black text-slate-900">Create Stock / Diagnostic Reagent Requisition</h3>
              <button
                type="button"
                onClick={() => setShowReqModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmitRequisition} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Medicine / Lab Reagent Name *</label>
                <input
                  required
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder="e.g. HbA1c Cartridge Pack (100 Tests)"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Category</label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Lab Reagent & Kit">Lab Reagent & Kit</option>
                    <option value="Pharmacy Medicine">Pharmacy Medicine</option>
                    <option value="Emergency Cardiac">Emergency Cardiac</option>
                    <option value="ICU Consumables">ICU Consumables</option>
                    <option value="Fluids">Fluids</option>
                    <option value="Gas & Life Support">Gas & Life Support</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Unit</label>
                  <input
                    value={reqUnit}
                    onChange={(e) => setReqUnit(e.target.value)}
                    placeholder="Kits / Vials / Boxes"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Quantity Added</label>
                  <input
                    type="number"
                    value={reqStock}
                    onChange={(e) => setReqStock(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Max Shelf Capacity</label>
                  <input
                    type="number"
                    value={reqCapacity}
                    onChange={(e) => setReqCapacity(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Batch Number</label>
                  <input
                    value={reqBatch}
                    onChange={(e) => setReqBatch(e.target.value)}
                    placeholder="e.g. LOT-2026-41"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={reqExpiry}
                    onChange={(e) => setReqExpiry(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="h-10 px-4 bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Confirm & Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
