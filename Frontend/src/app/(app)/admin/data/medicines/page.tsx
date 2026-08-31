"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Pill, Plus, Edit2, Trash2, X as XIcon, Save, Search, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ brandName: "", genericName: "", dosageForm: "Tablet", manufacturer: "", price: "" });

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = () => {
    setIsLoading(true);
    const local = localStorage.getItem("oxpecker_custom_medicines");
    const customMeds = local ? JSON.parse(local) : [];

    fetch("/data/medicines.json")
      .then(res => res.json())
      .then(data => {
        let finalData = data;
        if (Array.isArray(data) && Array.isArray(data[0])) {
          finalData = data.flat();
        }
        const initialList = Array.isArray(finalData) ? finalData.slice(0, 250) : [];
        setMedicines([...customMeds, ...initialList]);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching medicines:", err);
        setMedicines(customMeds);
        setIsLoading(false);
      });
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName || !formData.genericName) {
      toast.error("Brand name and Generic name are required.");
      return;
    }
    const newMed = {
      id: `med-${Date.now()}`,
      ...formData,
      price: parseFloat(formData.price) || 0,
    };

    const local = localStorage.getItem("oxpecker_custom_medicines");
    const customMeds = local ? JSON.parse(local) : [];
    customMeds.unshift(newMed);
    localStorage.setItem("oxpecker_custom_medicines", JSON.stringify(customMeds));

    setMedicines([newMed, ...medicines]);
    setIsAddModalOpen(false);
    setFormData({ brandName: "", genericName: "", dosageForm: "Tablet", manufacturer: "", price: "" });
    toast.success("Medicine added successfully.");
  };

  const handleEditMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine.brandName) {
      toast.error("Brand name is required.");
      return;
    }
    const updated = medicines.map(m => m.id === editingMedicine.id ? editingMedicine : m);
    setMedicines(updated);
    setEditingMedicine(null);
    toast.success("Medicine updated successfully.");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this medicine record?")) {
      const updated = medicines.filter(m => m.id !== id);
      setMedicines(updated);

      const local = localStorage.getItem("oxpecker_custom_medicines");
      if (local) {
        const customMeds = JSON.parse(local).filter((m: any) => m.id !== id);
        localStorage.setItem("oxpecker_custom_medicines", JSON.stringify(customMeds));
      }
      toast.success("Medicine deleted.");
    }
  };

  const filteredMedicines = medicines.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.brandName?.toLowerCase().includes(q) || m.genericName?.toLowerCase().includes(q) || m.manufacturer?.toLowerCase().includes(q);
  });

  const columns = [
    {
      key: "brandName",
      title: "Brand Name",
      render: (item: any) => (
        <div>
          <div className="font-bold text-slate-800 text-sm">{item.brandName || "Unknown"}</div>
          <div className="text-xs text-slate-500 font-mono">{item.genericName || "N/A"}</div>
        </div>
      )
    },
    {
      key: "dosageForm",
      title: "Dosage Form",
      render: (item: any) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
          {item.dosageForm || "Tablet"}
        </span>
      )
    },
    {
      key: "manufacturer",
      title: "Manufacturer",
      render: (item: any) => <span className="text-xs text-slate-600 line-clamp-1">{item.manufacturer || "N/A"}</span>
    },
    {
      key: "price",
      title: "Unit Price",
      render: (item: any) => <span className="font-mono text-emerald-600 font-bold text-sm">৳{item.price || "0.00"}</span>
    },
    {
      key: "actions",
      title: "",
      render: (item: any) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setEditingMedicine(item)}
            className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Edit Medicine"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Medicine"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24"
    >
      <Toaster position="top-center" richColors />
      <AdminPageHeader
        title="Medicines Master Database"
        description={`Manage ${medicines.length} verified pharmaceutical records, pricing, and generic compositions.`}
        icon={<Pill size={24} />}
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 h-11 px-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-all shadow-sm text-sm"
          >
            <Plus size={16} /> Add Medicine
          </button>
        }
      />

      <div className="flex justify-between items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search brand, generic or manufacturer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
          />
        </div>
        <button
          onClick={loadMedicines}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 bg-white transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Reload</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-slate-100 border-t-sky-600 rounded-full animate-spin"></div>
            <p className="mt-3 text-slate-500 text-xs font-medium">Loading registered medicine records...</p>
          </div>
        ) : (
          <DataTable
            columns={columns as any}
            data={filteredMedicines}
            searchPlaceholder="Search database..."
          />
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Add New Medicine</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><XIcon size={18} /></button>
              </div>
              <form onSubmit={handleAddMedicine} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                  <input required type="text" value={formData.brandName} onChange={e => setFormData({ ...formData, brandName: e.target.value })} className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900" placeholder="e.g. Napa Extra" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Generic Name</label>
                  <input required type="text" value={formData.genericName} onChange={e => setFormData({ ...formData, genericName: e.target.value })} className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900" placeholder="e.g. Paracetamol + Caffeine" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dosage Form</label>
                    <select value={formData.dosageForm} onChange={e => setFormData({ ...formData, dosageForm: e.target.value })} className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white">
                      {["Tablet", "Capsule", "Syrup", "Injection", "Suspension", "Eye Drop", "Ointment"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (৳)</label>
                    <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 font-mono" placeholder="2.50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input type="text" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900" placeholder="e.g. Beximco Pharmaceuticals" />
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">Cancel</button>
                  <button type="submit" className="flex-1 h-11 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-colors text-sm">Save Medicine</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMedicine && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Edit Medicine</h3>
                <button onClick={() => setEditingMedicine(null)} className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><XIcon size={18} /></button>
              </div>
              <form onSubmit={handleEditMedicine} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                  <input required type="text" value={editingMedicine.brandName || ""} onChange={e => setEditingMedicine({ ...editingMedicine, brandName: e.target.value })} className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Generic Name</label>
                  <input type="text" value={editingMedicine.genericName || ""} onChange={e => setEditingMedicine({ ...editingMedicine, genericName: e.target.value })} className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dosage Form</label>
                    <select value={editingMedicine.dosageForm || "Tablet"} onChange={e => setEditingMedicine({ ...editingMedicine, dosageForm: e.target.value })} className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white">
                      {["Tablet", "Capsule", "Syrup", "Injection", "Suspension", "Eye Drop", "Ointment"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (৳)</label>
                    <input type="number" step="0.01" value={editingMedicine.price || ""} onChange={e => setEditingMedicine({ ...editingMedicine, price: parseFloat(e.target.value) || 0 })} className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input type="text" value={editingMedicine.manufacturer || ""} onChange={e => setEditingMedicine({ ...editingMedicine, manufacturer: e.target.value })} className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900" />
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setEditingMedicine(null)} className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">Cancel</button>
                  <button type="submit" className="flex-1 h-11 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"><Save size={15} /> Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
