"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { CalendarCheck, Eye, Download, XCircle, CheckCircle2, Clock, Trash2, X as XIcon, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const defaultBookings = [
  { id: "BK-1002", type: "Doctor", patient: "Sarah Jenkins", provider: "Dr. Ahmed Rahman", date: "2026-08-24", time: "10:30 AM", status: "confirmed", amount: 1500 },
  { id: "BK-1003", type: "Hospital", patient: "Michael Chang", provider: "Square Hospital", date: "2026-08-25", time: "02:00 PM", status: "pending", amount: 5000 },
  { id: "BK-1004", type: "Doctor", patient: "Elena Rostova", provider: "Dr. Salma Begum", date: "2026-08-22", time: "04:00 PM", status: "completed", amount: 1200 },
  { id: "BK-1005", type: "Diagnostic", patient: "David Chen", provider: "Popular Diagnostic", date: "2026-08-26", time: "09:00 AM", status: "cancelled", amount: 850 },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from Supabase bookings table
      const { data: sbBookings, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      // 2. Fetch local storage bookings
      const str = typeof window !== "undefined" ? localStorage.getItem("oxpecker_bookings") : null;
      let parsedLocal: any[] = [];
      try {
        parsedLocal = str ? JSON.parse(str) : [];
      } catch {
        parsedLocal = [];
      }
      const localData: any[] = Array.isArray(parsedLocal) ? parsedLocal : [];

      for (const d of defaultBookings) {
        if (!localData.find((b: any) => b.id === d.id)) {
          localData.push(d);
        }
      }

      const merged = [...localData];
      if (sbBookings && sbBookings.length > 0) {
        for (const b of sbBookings) {
          const idx = merged.findIndex((m: any) => m.id === b.id);
          const item = {
            id: b.id,
            type: "Doctor",
            patient: b.patient_name,
            provider: b.doctor_name || "Doctor",
            date: b.booking_date,
            time: b.booking_time,
            status: b.status,
            amount: b.total_fee || b.consultation_fee || 0
          };
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...item };
          } else {
            merged.unshift(item);
          }
        }
      }

      localStorage.setItem("oxpecker_bookings", JSON.stringify(merged));
      setBookings(merged);
    } catch (e) {
      console.warn("Could not load from Supabase:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    } catch (e) {
      console.warn("Supabase update error:", e);
    }

    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem("oxpecker_bookings", JSON.stringify(updated));
    toast.success(`Booking ${id} status updated to ${newStatus}`);
    if (selectedBooking?.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this booking?")) {
      try {
        await supabase.from("bookings").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase delete error:", e);
      }

      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      localStorage.setItem("oxpecker_bookings", JSON.stringify(updated));
      setSelectedBooking(null);
      toast.success("Booking deleted permanently.");
    }
  };

  const columns = [
    {
      key: "id",
      title: "Booking ID",
      sortable: true,
      render: (item: any) => <span className="font-mono text-slate-600 font-semibold text-xs bg-slate-100 px-2 py-1 rounded">{item.id}</span>
    },
    {
      key: "patient",
      title: "Patient",
      sortable: true,
      render: (item: any) => <span className="font-bold text-slate-800 text-sm">{item.patient}</span>
    },
    {
      key: "type",
      title: "Service & Provider",
      sortable: true,
      render: (item: any) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{item.type}</div>
          <div className="text-xs text-slate-500">{item.provider}</div>
        </div>
      )
    },
    {
      key: "date",
      title: "Schedule",
      sortable: true,
      render: (item: any) => (
        <div>
          <div className="text-xs text-slate-800 font-medium">{item.date}</div>
          <div className="text-[11px] font-mono text-slate-500">{item.time}</div>
        </div>
      )
    },
    {
      key: "amount",
      title: "Amount",
      sortable: true,
      render: (item: any) => <span className="font-mono text-emerald-600 font-bold text-sm">৳ {item.amount}</span>
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (item: any) => {
        if (item.status === "confirmed") return <span className="text-[11px] font-bold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-200 capitalize">Confirmed</span>;
        if (item.status === "completed") return <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 capitalize">Completed</span>;
        if (item.status === "pending") return <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 capitalize">Pending</span>;
        return <span className="text-[11px] font-bold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 capitalize">Cancelled</span>;
      }
    }
  ];

  const actionsRender = (item: any) => (
    <div className="flex justify-end gap-1">
      <button
        onClick={() => setSelectedBooking(item)}
        className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
      >
        <Eye size={14} /> View
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-full flex flex-col pb-24 space-y-6">
      <Toaster position="top-center" richColors />
      <AdminPageHeader
        title="Bookings & Appointments"
        description="Monitor, approve, modify, or cancel all platform bookings and appointments in real-time."
        icon={<CalendarCheck size={24} />}
        action={
          <button
            onClick={loadBookings}
            disabled={isLoading}
            className="flex items-center gap-2 h-11 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all shadow-sm text-sm"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            <span>Sync DB</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <DataTable
          columns={columns as any}
          data={bookings}
          searchPlaceholder="Search by ID, Patient, or Provider..."
          actions={actionsRender}
        />
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Booking Details</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedBooking.id}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Patient Name</div>
                    <div className="text-sm font-bold text-slate-800">{selectedBooking.patient}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Provider / Doctor</div>
                    <div className="text-sm font-bold text-slate-800">{selectedBooking.provider}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Schedule</div>
                    <div className="text-sm font-bold text-slate-800">{selectedBooking.date} at {selectedBooking.time}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Total Amount</div>
                    <div className="text-sm font-bold text-emerald-600">৳ {selectedBooking.amount}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Update Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["pending", "confirmed", "completed", "cancelled"].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedBooking.id, status)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                          selectedBooking.status === status
                            ? "bg-white text-slate-900 border-slate-900 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={() => handleDeleteBooking(selectedBooking.id)}
                    className="h-11 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors text-sm flex items-center gap-1.5"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1 h-11 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-colors text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
