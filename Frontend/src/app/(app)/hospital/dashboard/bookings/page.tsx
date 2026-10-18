"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  X,
  AlertCircle,
  Plus,
  Phone,
  DollarSign,
  User,
  Trash2,
  Check,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export interface HospitalBooking {
  id: string;
  patient: string;
  phone: string;
  type: string;
  date: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  amount: string;
  payment: "Paid" | "Unpaid" | "Refunded";
  notes?: string;
}

const initialBookings: HospitalBooking[] = [
  {
    id: "BK-1001",
    patient: "Abdur Rahman",
    phone: "01711223344",
    type: "Premium ICU Package (ICU-02)",
    date: "Today, 10:30 AM",
    status: "Pending",
    amount: "৳ 15,000",
    payment: "Unpaid",
    notes: "Requires ventilator support upon arrival.",
  },
  {
    id: "BK-1002",
    patient: "Fatima Begum",
    phone: "01811223344",
    type: "General Ward Bed (B-102)",
    date: "Today, 02:00 PM",
    status: "Confirmed",
    amount: "৳ 1,500",
    payment: "Paid",
    notes: "Scheduled post-operative monitoring.",
  },
  {
    id: "BK-1003",
    patient: "Karim Hassan",
    phone: "01911223344",
    type: "Executive Maternity Package",
    date: "Yesterday",
    status: "Completed",
    amount: "৳ 25,000",
    payment: "Paid",
    notes: "Patient safely discharged with newborn.",
  },
  {
    id: "BK-1004",
    patient: "Sajid Islam",
    phone: "01511223344",
    type: "Single Deluxe Cabin (C-201)",
    date: "Oct 22, 2026",
    status: "Cancelled",
    amount: "৳ 4,000",
    payment: "Refunded",
    notes: "Cancelled by patient attendant.",
  },
  {
    id: "BK-1005",
    patient: "Mehedi Hasan",
    phone: "01611334455",
    type: "Cardiology Daycare Bed",
    date: "Tomorrow, 09:00 AM",
    status: "Confirmed",
    amount: "৳ 3,200",
    payment: "Paid",
    notes: "Coronary angiogram preparation.",
  },
];

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<HospitalBooking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<HospitalBooking | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New booking form
  const [newBooking, setNewBooking] = useState({
    patient: "",
    phone: "",
    type: "General Ward Bed (B-103)",
    amount: "1500",
    payment: "Unpaid" as HospitalBooking["payment"],
    notes: "",
  });

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.patient.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.type.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "Cancelled").length;

  const stats = [
    { label: "Pending Requests", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Confirmed Bookings", value: confirmedCount, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Completed Stays", value: completedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Cancelled Bookings", value: cancelledCount, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const handleStatusChange = (id: string, newStatus: HospitalBooking["status"]) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
    toast.success(`Booking ${id} status changed to ${newStatus}`);
  };

  const handleTogglePayment = (id: string) => {
    setBookings(
      bookings.map((b) => {
        if (b.id !== id) return b;
        const nextPayment: HospitalBooking["payment"] = b.payment === "Paid" ? "Unpaid" : "Paid";
        toast.info(`Payment status updated to ${nextPayment} for ${b.id}`);
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, payment: nextPayment });
        }
        return { ...b, payment: nextPayment };
      })
    );
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm(`Are you sure you want to delete Booking ${id}?`)) {
      setBookings(bookings.filter((b) => b.id !== id));
      if (selectedBooking?.id === id) setSelectedBooking(null);
      toast.success(`Booking ${id} deleted.`);
    }
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.patient || !newBooking.phone) {
      toast.error("Please enter patient name and contact number.");
      return;
    }

    const created: HospitalBooking = {
      id: `BK-${Math.floor(1006 + Math.random() * 500)}`,
      patient: newBooking.patient,
      phone: newBooking.phone,
      type: newBooking.type,
      date: "Today, Just now",
      status: "Confirmed",
      amount: `৳ ${Number(newBooking.amount || 1500).toLocaleString()}`,
      payment: newBooking.payment,
      notes: newBooking.notes || "Direct hospital reservation",
    };

    setBookings([created, ...bookings]);
    setIsAddModalOpen(false);
    setNewBooking({
      patient: "",
      phone: "",
      type: "General Ward Bed (B-103)",
      amount: "1500",
      payment: "Unpaid",
      notes: "",
    });
    toast.success(`New Booking ${created.id} confirmed for ${created.patient}!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Booking Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage bed reservations, admission bookings, and service package requests.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={18} /> New Reservation
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
              className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-xs"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={stat.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, Phone, or Booking ID..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Booking ID</th>
                <th className="py-3.5 px-5">Patient Name</th>
                <th className="py-3.5 px-5">Reserved Service / Bed</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Payment</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 font-mono text-slate-800 font-bold">{booking.id}</td>
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{booking.patient}</p>
                      <p className="text-xs text-slate-400">{booking.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-700 font-semibold">{booking.type}</td>
                  <td className="py-4 px-5 text-slate-500 text-xs">{booking.date}</td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => handleTogglePayment(booking.id)}
                      title="Click to toggle payment status"
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer ${
                        booking.payment === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {booking.payment} ({booking.amount})
                    </button>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-1.5">
                    {booking.status === "Pending" && (
                      <button
                        onClick={() => handleStatusChange(booking.id, "Confirmed")}
                        className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status === "Confirmed" && (
                      <button
                        onClick={() => handleStatusChange(booking.id, "Completed")}
                        className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-xs p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                      title="View Details"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="text-xs p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">No bookings found</h3>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword or filter.</p>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
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
                <h2 className="text-lg font-bold text-slate-900">Create New Hospital Reservation</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Patient Full Name *</label>
                  <input
                    required
                    type="text"
                    value={newBooking.patient}
                    onChange={(e) => setNewBooking({ ...newBooking, patient: e.target.value })}
                    placeholder="e.g. Salma Begum"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contact Phone *</label>
                  <input
                    required
                    type="tel"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    placeholder="01711000000"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Service / Bed Package</label>
                  <select
                    value={newBooking.type}
                    onChange={(e) => setNewBooking({ ...newBooking, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="General Ward Bed (B-103)">General Ward Bed (B-103)</option>
                    <option value="Single Deluxe Cabin (C-203)">Single Deluxe Cabin (C-203)</option>
                    <option value="Premium ICU Package (ICU-01)">Premium ICU Package (ICU-01)</option>
                    <option value="Executive Maternity Package">Executive Maternity Package</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Fee / Amount (৳)</label>
                    <input
                      type="number"
                      value={newBooking.amount}
                      onChange={(e) => setNewBooking({ ...newBooking, amount: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Payment Status</label>
                    <select
                      value={newBooking.payment}
                      onChange={(e) => setNewBooking({ ...newBooking, payment: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Admission Notes</label>
                  <input
                    type="text"
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                    placeholder="e.g. Attendant present, immediate check-in"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
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
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedBooking.id}</h3>
                  <p className="text-xs text-slate-500">{selectedBooking.date}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-bold text-slate-900">{selectedBooking.patient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service / Bed:</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-bold text-emerald-700">{selectedBooking.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment:</span>
                    <span className="font-bold text-slate-800">{selectedBooking.payment}</span>
                  </div>
                  {selectedBooking.notes && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      <span className="font-bold">Notes:</span> {selectedBooking.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  {selectedBooking.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedBooking.id, "Cancelled")}
                        className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedBooking.id, "Confirmed")}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                      >
                        Approve Booking
                      </button>
                    </>
                  )}
                  {selectedBooking.status === "Confirmed" && (
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, "Completed")}
                      className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {selectedBooking.status !== "Pending" && selectedBooking.status !== "Confirmed" && (
                    <button
                      onClick={() => setSelectedBooking(null)}
                      className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                    >
                      Close Details
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
