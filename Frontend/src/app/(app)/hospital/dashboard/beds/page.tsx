"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, Plus, X, Search, Filter, Activity, Users, CheckCircle2, AlertTriangle } from "lucide-react";

// Sample Bed Data
const initialBeds = [
  { id: "B-101", ward: "General Ward A", type: "General", status: "Vacant", price: "৳ 1,500/day" },
  { id: "B-102", ward: "General Ward A", type: "General", status: "Occupied", patient: "Rahim Uddin", price: "৳ 1,500/day" },
  { id: "C-201", ward: "Cabin Block B", type: "Cabin", status: "Occupied", patient: "Karim Hassan", price: "৳ 4,000/day" },
  { id: "C-202", ward: "Cabin Block B", type: "Cabin", status: "Maintenance", price: "৳ 4,000/day" },
  { id: "ICU-01", ward: "Intensive Care Unit", type: "ICU", status: "Vacant", price: "৳ 12,000/day" },
  { id: "ICU-02", ward: "Intensive Care Unit", type: "ICU", status: "Occupied", patient: "Abdur Rahman", price: "৳ 12,000/day" },
];

export default function BedManagementPage() {
  const [beds, setBeds] = useState(initialBeds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBed, setNewBed] = useState({ id: "", ward: "", type: "General", status: "Vacant", price: "" });

  const stats = [
    { label: "Total Beds", value: beds.length, icon: BedDouble, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Occupied", value: beds.filter(b => b.status === "Occupied").length, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Vacant", value: beds.filter(b => b.status === "Vacant").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Maintenance", value: beds.filter(b => b.status === "Maintenance").length, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const handleAddBed = (e: React.FormEvent) => {
    e.preventDefault();
    setBeds([...beds, newBed]);
    setIsModalOpen(false);
    setNewBed({ id: "", ward: "", type: "General", status: "Vacant", price: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Vacant": return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "Occupied": return "bg-orange-50 border-orange-200 text-orange-700";
      case "Maintenance": return "bg-rose-50 border-rose-200 text-rose-700";
      default: return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-slate-800">Bed Management</h1>
          <p className="text-[14px] text-slate-500 mt-1">Monitor and manage hospital bed availability in real-time.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[48px] px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[12px] font-bold text-[15px] flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Add New Bed
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="h-[110px] bg-white rounded-[16px] border border-slate-200 p-6 flex items-center gap-4 shadow-sm"
            >
              <div className={`w-14 h-14 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-[14px] text-slate-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-[24px] font-bold text-slate-800 leading-none">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[16px] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search beds or wards..."
            className="w-full h-[46px] pl-9 pr-4 rounded-[12px] border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-[14px]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="h-[46px] px-4 rounded-[12px] border border-slate-200 text-slate-600 flex items-center gap-2 text-[14px] font-medium hover:bg-slate-50 flex-1 sm:flex-none justify-center">
            <Filter size={16} />
            Filter by Ward
          </button>
        </div>
      </div>

      {/* Bed Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {beds.map((bed, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`h-[160px] rounded-[12px] border p-4 flex flex-col justify-between transition-colors shadow-sm ${getStatusColor(bed.status)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[18px] font-bold">{bed.id}</h3>
                <p className="text-[13px] opacity-80">{bed.ward}</p>
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/60`}>
                {bed.status}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[13px]">
                <span className="opacity-80">Type:</span>
                <span className="font-semibold">{bed.type}</span>
              </div>
              {bed.patient ? (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="opacity-80">Patient:</span>
                  <span className="font-semibold truncate max-w-[120px]">{bed.patient}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="opacity-80">Price:</span>
                  <span className="font-semibold">{bed.price}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bed Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-white rounded-[20px] shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold text-slate-800">Add New Bed</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBed} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-medium text-slate-700 mb-1">Bed Number / ID</label>
                    <input
                      required
                      type="text"
                      value={newBed.id}
                      onChange={(e) => setNewBed({ ...newBed, id: e.target.value })}
                      placeholder="e.g. B-103"
                      className="w-full h-[46px] px-4 rounded-[12px] border border-slate-200 focus:outline-none focus:border-emerald-500 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-slate-700 mb-1">Bed Category</label>
                    <select
                      value={newBed.type}
                      onChange={(e) => setNewBed({ ...newBed, type: e.target.value })}
                      className="w-full h-[46px] px-4 rounded-[12px] border border-slate-200 focus:outline-none focus:border-emerald-500 text-[14px] bg-white"
                    >
                      <option value="General">General</option>
                      <option value="Cabin">Cabin</option>
                      <option value="ICU">ICU</option>
                      <option value="CCU">CCU</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1">Ward / Floor Name</label>
                  <input
                    required
                    type="text"
                    value={newBed.ward}
                    onChange={(e) => setNewBed({ ...newBed, ward: e.target.value })}
                    placeholder="e.g. General Ward A"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-slate-200 focus:outline-none focus:border-emerald-500 text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-medium text-slate-700 mb-1">Daily Price</label>
                    <input
                      required
                      type="text"
                      value={newBed.price}
                      onChange={(e) => setNewBed({ ...newBed, price: e.target.value })}
                      placeholder="e.g. ৳ 1,500/day"
                      className="w-full h-[46px] px-4 rounded-[12px] border border-slate-200 focus:outline-none focus:border-emerald-500 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={newBed.status}
                      onChange={(e) => setNewBed({ ...newBed, status: e.target.value })}
                      className="w-full h-[46px] px-4 rounded-[12px] border border-slate-200 focus:outline-none focus:border-emerald-500 text-[14px] bg-white"
                    >
                      <option value="Vacant">Vacant</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-[44px] px-6 rounded-[12px] text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-[44px] px-6 rounded-[12px] bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Add Bed
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
