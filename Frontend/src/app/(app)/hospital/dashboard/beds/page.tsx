"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BedDouble,
  Plus,
  X,
  Search,
  Filter,
  Users,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  LogOut,
  Wrench,
  Trash2,
  DollarSign,
  Building,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";

interface Bed {
  id: string;
  ward: string;
  type: "General" | "Cabin" | "ICU" | "CCU";
  status: "Vacant" | "Occupied" | "Maintenance";
  patient?: string;
  patientPhone?: string;
  price: string;
  dbId?: string;
}

const initialBeds: Bed[] = [
  { id: "B-101", ward: "General Ward A", type: "General", status: "Vacant", price: "৳ 1,500/day" },
  { id: "B-102", ward: "General Ward A", type: "General", status: "Occupied", patient: "Rahim Uddin", patientPhone: "01711223344", price: "৳ 1,500/day" },
  { id: "B-103", ward: "General Ward B", type: "General", status: "Vacant", price: "৳ 1,500/day" },
  { id: "C-201", ward: "Cabin Block B", type: "Cabin", status: "Occupied", patient: "Karim Hassan", patientPhone: "01811223344", price: "৳ 4,000/day" },
  { id: "C-202", ward: "Cabin Block B", type: "Cabin", status: "Maintenance", price: "৳ 4,000/day" },
  { id: "C-203", ward: "Cabin Block B", type: "Cabin", status: "Vacant", price: "৳ 4,500/day" },
  { id: "ICU-01", ward: "Intensive Care Unit", type: "ICU", status: "Vacant", price: "৳ 12,000/day" },
  { id: "ICU-02", ward: "Intensive Care Unit", type: "ICU", status: "Occupied", patient: "Abdur Rahman", patientPhone: "01911223344", price: "৳ 12,000/day" },
  { id: "CCU-01", ward: "Coronary Care Unit", type: "CCU", status: "Vacant", price: "৳ 10,000/day" },
];

export default function BedManagementPage() {
  const { user } = useAuth();
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assignBedTarget, setAssignBedTarget] = useState<Bed | null>(null);

  // Forms
  const [newBed, setNewBed] = useState({
    id: "",
    ward: "",
    type: "General" as Bed["type"],
    status: "Vacant" as Bed["status"],
    price: "1500",
  });

  const [assignForm, setAssignForm] = useState({
    patientName: "",
    patientPhone: "",
  });

  // Load beds from Supabase
  useEffect(() => {
    async function loadBeds() {
      try {
        const { data, error } = await supabase
          .from("hospital_beds")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const mapped: Bed[] = data.map(b => ({
            id: b.id.substring(0, 8).toUpperCase(),
            dbId: b.id,
            ward: b.bed_type,
            type: (b.bed_type.includes("ICU") ? "ICU" : b.bed_type.includes("CCU") ? "CCU" : b.bed_type.includes("Cabin") ? "Cabin" : "General") as Bed["type"],
            status: ((b.available_beds || 0) > 0 ? "Vacant" : "Occupied") as Bed["status"],
            price: `৳ ${(b.price_per_day || 1500).toLocaleString()}/day`,
          }));
          setBeds([...mapped, ...initialBeds]);
        }
      } catch (err) {
        console.error("Failed to load hospital beds:", err);
      }
    }
    loadBeds();
  }, []);

  const bedTypes = ["All", "General", "Cabin", "ICU", "CCU"];

  // Filtered beds
  const filteredBeds = beds.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.patient && b.patient.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "All" || b.type === selectedType;
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Dynamic statistics
  const totalBeds = beds.length;
  const occupiedCount = beds.filter((b) => b.status === "Occupied").length;
  const vacantCount = beds.filter((b) => b.status === "Vacant").length;
  const maintenanceCount = beds.filter((b) => b.status === "Maintenance").length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedCount / totalBeds) * 100) : 0;

  const stats = [
    { label: "Total Hospital Beds", value: totalBeds, icon: BedDouble, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Occupied Beds", value: occupiedCount, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Vacant & Available", value: vacantCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Maintenance / Under Repair", value: maintenanceCount, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBed.id || !newBed.ward) {
      toast.error("Please fill in bed ID and Ward name.");
      return;
    }

    if (beds.some((b) => b.id.toLowerCase() === newBed.id.toLowerCase())) {
      toast.error(`Bed ${newBed.id} already exists!`);
      return;
    }

    const priceNum = parseFloat(newBed.price.replace(/[^0-9.]/g, "")) || 1500;
    try {
      await supabase.from("hospital_beds").insert({
        hospital_id: user?.id || "hosp_01",
        hospital_name: user?.name || "Hospital Partner",
        bed_type: `${newBed.ward} (${newBed.type})`,
        total_beds: 1,
        available_beds: newBed.status === "Vacant" ? 1 : 0,
        price_per_day: priceNum,
      });
    } catch (err) {
      console.warn("Supabase bed insert warning:", err);
    }

    const created: Bed = {
      id: newBed.id.toUpperCase(),
      ward: newBed.ward,
      type: newBed.type,
      status: newBed.status,
      price: `৳ ${priceNum.toLocaleString()}/day`,
    };

    setBeds([created, ...beds]);
    setIsAddModalOpen(false);
    setNewBed({ id: "", ward: "", type: "General", status: "Vacant", price: "1500" });
    toast.success(`Bed ${created.id} successfully added to ${created.ward}!`);
  };

  const handleAssignPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignBedTarget || !assignForm.patientName) return;

    setBeds(
      beds.map((b) =>
        b.id === assignBedTarget.id
          ? {
              ...b,
              status: "Occupied",
              patient: assignForm.patientName,
              patientPhone: assignForm.patientPhone || "+880 1700-000000",
            }
          : b
      )
    );

    toast.success(`Patient ${assignForm.patientName} assigned to Bed ${assignBedTarget.id}!`);
    setAssignBedTarget(null);
    setAssignForm({ patientName: "", patientPhone: "" });
  };

  const handleReleaseBed = (bedId: string, patientName?: string) => {
    setBeds(
      beds.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: "Vacant",
              patient: undefined,
              patientPhone: undefined,
            }
          : b
      )
    );
    toast.info(`Bed ${bedId} has been released and is now Vacant.`);
  };

  const handleToggleMaintenance = (bedId: string) => {
    setBeds(
      beds.map((b) => {
        if (b.id !== bedId) return b;
        const nextStatus = b.status === "Maintenance" ? "Vacant" : "Maintenance";
        toast.info(`Bed ${bedId} status changed to ${nextStatus}.`);
        return {
          ...b,
          status: nextStatus,
          patient: undefined,
          patientPhone: undefined,
        };
      })
    );
  };

  const handleDeleteBed = (bedId: string) => {
    if (confirm(`Are you sure you want to delete Bed ${bedId}?`)) {
      setBeds(beds.filter((b) => b.id !== bedId));
      toast.success(`Bed ${bedId} removed.`);
    }
  };

  const getStatusStyle = (status: Bed["status"]) => {
    switch (status) {
      case "Vacant":
        return {
          bg: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "Occupied":
        return {
          bg: "bg-amber-50/70 border-amber-200 text-amber-900",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "Maintenance":
        return {
          bg: "bg-rose-50/70 border-rose-200 text-rose-900",
          badge: "bg-rose-100 text-rose-800 border-rose-200",
        };
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hospital Bed Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ward capacity tracking, admissions, maintenance, and allocation. (Occupancy: {occupancyRate}%)
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={18} /> Add New Bed
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-xs"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Bed ID, Ward, or Patient name..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Type and Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">Type:</span>
            {bedTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === type
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {type}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

            <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">Status:</span>
            {["All", "Vacant", "Occupied", "Maintenance"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bed Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {filteredBeds.map((bed) => {
          const style = getStatusStyle(bed.status);
          return (
            <motion.div
              key={bed.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${style.bg}`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{bed.id}</h3>
                      <span className="text-xs font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {bed.type}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">{bed.ward}</p>
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${style.badge}`}>
                    {bed.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-white/60 p-3 rounded-xl border border-white/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Daily Rate:</span>
                    <span className="font-bold text-slate-900">{bed.price}</span>
                  </div>
                  {bed.status === "Occupied" && bed.patient ? (
                    <div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Patient:</span>
                        <span className="font-bold text-slate-900">{bed.patient}</span>
                      </div>
                      {bed.patientPhone && (
                        <div className="flex justify-between mt-0.5">
                          <span className="text-slate-500 font-medium">Contact:</span>
                          <span className="text-slate-600">{bed.patientPhone}</span>
                        </div>
                      )}
                    </div>
                  ) : bed.status === "Maintenance" ? (
                    <div className="text-rose-700 font-semibold flex items-center gap-1.5">
                      <Wrench size={13} /> Sanitization & repair in progress
                    </div>
                  ) : (
                    <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Ready for immediate admission
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                {bed.status === "Vacant" && (
                  <button
                    onClick={() => {
                      setAssignBedTarget(bed);
                      setAssignForm({ patientName: "", patientPhone: "" });
                    }}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus size={13} /> Assign Patient
                  </button>
                )}

                {bed.status === "Occupied" && (
                  <button
                    onClick={() => handleReleaseBed(bed.id, bed.patient)}
                    className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <LogOut size={13} /> Release / Vacate
                  </button>
                )}

                <button
                  onClick={() => handleToggleMaintenance(bed.id)}
                  title={bed.status === "Maintenance" ? "Set as Vacant" : "Set to Maintenance"}
                  className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  <Wrench size={14} />
                </button>

                <button
                  onClick={() => handleDeleteBed(bed.id)}
                  title="Delete Bed"
                  className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredBeds.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <BedDouble size={40} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-700">No beds matched your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting search keywords or category filters.</p>
        </div>
      )}

      {/* Add New Bed Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Add New Hospital Bed</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddBed} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Bed Number / ID *</label>
                    <input
                      required
                      type="text"
                      value={newBed.id}
                      onChange={(e) => setNewBed({ ...newBed, id: e.target.value })}
                      placeholder="e.g. B-104 or ICU-03"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                    <select
                      value={newBed.type}
                      onChange={(e) => setNewBed({ ...newBed, type: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="General">General</option>
                      <option value="Cabin">Cabin</option>
                      <option value="ICU">ICU</option>
                      <option value="CCU">CCU</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ward / Floor Name *</label>
                  <input
                    required
                    type="text"
                    value={newBed.ward}
                    onChange={(e) => setNewBed({ ...newBed, ward: e.target.value })}
                    placeholder="e.g. General Ward Block A"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Daily Price (৳)</label>
                    <input
                      type="number"
                      value={newBed.price}
                      onChange={(e) => setNewBed({ ...newBed, price: e.target.value })}
                      placeholder="e.g. 1500"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Starting Status</label>
                    <select
                      value={newBed.status}
                      onChange={(e) => setNewBed({ ...newBed, status: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Vacant">Vacant</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    Create Bed
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Patient Modal */}
      <AnimatePresence>
        {assignBedTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Assign Patient to Bed</h2>
                  <p className="text-xs text-emerald-600 font-semibold">{assignBedTarget.id} • {assignBedTarget.ward}</p>
                </div>
                <button
                  onClick={() => setAssignBedTarget(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAssignPatient} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Patient Full Name *</label>
                  <input
                    required
                    type="text"
                    value={assignForm.patientName}
                    onChange={(e) => setAssignForm({ ...assignForm, patientName: e.target.value })}
                    placeholder="e.g. Mahbubul Alam"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={assignForm.patientPhone}
                    onChange={(e) => setAssignForm({ ...assignForm, patientPhone: e.target.value })}
                    placeholder="+880 1700-000000"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <p>Bed Type: <span className="font-bold text-slate-800">{assignBedTarget.type}</span></p>
                  <p className="mt-0.5">Rate: <span className="font-bold text-slate-800">{assignBedTarget.price}</span></p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssignBedTarget(null)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    Confirm Admission
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
