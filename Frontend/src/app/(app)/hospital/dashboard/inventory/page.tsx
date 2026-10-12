"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  RotateCw,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: "Oxygen & Gases" | "Medications" | "Surgical & PPE" | "Diagnostic Kits";
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  lastUpdated: string;
}

const initialInventory: InventoryItem[] = [
  {
    id: "INV-ITEM-01",
    name: "Medical Grade Oxygen Cylinder (Type D)",
    category: "Oxygen & Gases",
    quantity: 14,
    unit: "Cylinders",
    minThreshold: 20,
    location: "Central Gas Plant / ICU Depot",
    lastUpdated: "2026-10-12",
  },
  {
    id: "INV-ITEM-02",
    name: "Injection Ceftriaxone 1g",
    category: "Medications",
    quantity: 480,
    unit: "Vials",
    minThreshold: 100,
    location: "Main Pharmacy Store",
    lastUpdated: "2026-10-11",
  },
  {
    id: "INV-ITEM-03",
    name: "IV Cannula 20G (Pink)",
    category: "Surgical & PPE",
    quantity: 35,
    unit: "Boxes (100/box)",
    minThreshold: 50,
    location: "Emergency Ward Supplies",
    lastUpdated: "2026-10-10",
  },
  {
    id: "INV-ITEM-04",
    name: "Normal Saline (0.9% NaCl 1000ml)",
    category: "Medications",
    quantity: 620,
    unit: "Bags",
    minThreshold: 150,
    location: "IV Fluids Store",
    lastUpdated: "2026-10-12",
  },
  {
    id: "INV-ITEM-05",
    name: "Sterile Surgical Gloves (Size 7.5)",
    category: "Surgical & PPE",
    quantity: 80,
    unit: "Boxes",
    minThreshold: 60,
    location: "OT Supply Room 1",
    lastUpdated: "2026-10-09",
  },
  {
    id: "INV-ITEM-06",
    name: "Rapid Dengue NS1 / IgG IgM Antigen Kit",
    category: "Diagnostic Kits",
    quantity: 18,
    unit: "Kits (25 tests/kit)",
    minThreshold: 30,
    location: "Clinical Pathology Lab",
    lastUpdated: "2026-10-12",
  },
];

export default function HospitalInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Medications" as InventoryItem["category"],
    quantity: 50,
    unit: "Pcs",
    minThreshold: 20,
    location: "Main Store",
  });

  const categories = ["All", "Oxygen & Gases", "Medications", "Surgical & PPE", "Diagnostic Kits"];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = items.filter((i) => i.quantity <= i.minThreshold).length;

  const stats = [
    { label: "Tracked Supplies", value: items.length, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Low Stock Alerts", value: lowStockCount, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Oxygen Cylinders", value: "14 Onsite", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Stock Health", value: "88%", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    const created: InventoryItem = {
      id: `INV-ITEM-${String(items.length + 1).padStart(2, "0")}`,
      name: newItem.name,
      category: newItem.category,
      quantity: Number(newItem.quantity) || 10,
      unit: newItem.unit,
      minThreshold: Number(newItem.minThreshold) || 15,
      location: newItem.location,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    setItems([created, ...items]);
    setIsModalOpen(false);
    setNewItem({
      name: "",
      category: "Medications",
      quantity: 50,
      unit: "Pcs",
      minThreshold: 20,
      location: "Main Store",
    });
  };

  const handleRestock = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 50, lastUpdated: new Date().toISOString().split("T")[0] } : item
      )
    );
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hospital Inventory & Supplies</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor oxygen reserves, ICU equipment, essential pharmaceuticals, and reorders.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${st.bg} flex items-center justify-center shrink-0`}>
              <Package size={22} className={st.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{st.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{st.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by supply item name, ID, or depot location..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Supply Item</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Quantity in Stock</th>
                <th className="py-3.5 px-5">Storage Location</th>
                <th className="py-3.5 px-5">Stock Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{item.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-800 text-base">
                        {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">Min Threshold: {item.minThreshold}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs text-slate-700">{item.location}</p>
                    </td>
                    <td className="py-4 px-5">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCw size={12} /> Restock (+50)
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">No inventory supplies found</h3>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword.</p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
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
                <h2 className="text-lg font-bold text-slate-900">Add Supply to Inventory</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg IV"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Medications">Medications</option>
                      <option value="Oxygen & Gases">Oxygen & Gases</option>
                      <option value="Surgical & PPE">Surgical & PPE</option>
                      <option value="Diagnostic Kits">Diagnostic Kits</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Unit of Measure</label>
                    <input
                      type="text"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      placeholder="e.g. Vials / Boxes"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Starting Quantity</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Alert Threshold</label>
                    <input
                      type="number"
                      value={newItem.minThreshold}
                      onChange={(e) => setNewItem({ ...newItem, minThreshold: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Depot / Ward Location</label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    placeholder="e.g. Ward B Store Room"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
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
                    Save Item
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
