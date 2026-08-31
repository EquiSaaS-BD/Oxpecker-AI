"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, CalendarDays, CheckCircle2, Clock, XCircle, ChevronRight, X, AlertCircle } from "lucide-react";

// Sample Bookings Data
const initialBookings = [
  { id: "BK-1001", patient: "Abdur Rahman", type: "Premium ICU Package", date: "Oct 24, 2026", status: "Pending", amount: "৳ 15,000", payment: "Unpaid", phone: "01711223344" },
  { id: "BK-1002", patient: "Fatima Begum", type: "General Ward (B-102)", date: "Oct 24, 2026", status: "Confirmed", amount: "৳ 1,500", payment: "Paid", phone: "01811223344" },
  { id: "BK-1003", patient: "Karim Hassan", type: "Maternity Package", date: "Oct 23, 2026", status: "Completed", amount: "৳ 25,000", payment: "Paid", phone: "01911223344" },
  { id: "BK-1004", patient: "Sajid Islam", type: "Cabin (C-201)", date: "Oct 22, 2026", status: "Cancelled", amount: "৳ 4,000", payment: "Refunded", phone: "01511223344" },
];

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const stats = [
    { label: "New Requests", value: bookings.filter(b => b.status === "Pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "Confirmed").length, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Completed", value: bookings.filter(b => b.status === "Completed").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Cancelled", value: bookings.filter(b => b.status === "Cancelled").length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Confirmed": return "bg-blue-100 text-blue-700";
      case "Completed": return "bg-emerald-100 text-emerald-700";
      case "Cancelled": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    setSelectedBooking(null);
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-slate-800">Booking Management</h1>
        <p className="text-[14px] text-slate-500 mt-1">Manage patient bookings for beds, packages, and hospital services.</p>
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
              className="h-[100px] bg-white rounded-[16px] border border-slate-200 p-5 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-[14px] text-slate-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-[24px] font-bold text-slate-800 leading-none">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <Icon size={20} className={stat.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[16px] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Patient Name or Booking ID..."
            className="w-full h-[46px] pl-9 pr-4 rounded-[12px] border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-[14px]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="h-[46px] px-4 rounded-[12px] border border-slate-200 text-slate-600 flex items-center gap-2 text-[14px] font-medium hover:bg-slate-50 flex-1 sm:flex-none justify-center">
            <Filter size={16} />
            Filter Status
          </button>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Service/Bed Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors h-[64px]">
                  <td className="p-4 font-medium text-slate-800">{booking.id}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{booking.patient}</p>
                    <p className="text-[12px] text-slate-500">{booking.phone}</p>
                  </td>
                  <td className="p-4 text-slate-600">{booking.type}</td>
                  <td className="p-4 text-slate-600">{booking.date}</td>
                  <td className="p-4">
                    <span className={`text-[12px] font-semibold ${booking.payment === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {booking.payment}
                    </span>
                    <p className="text-[12px] text-slate-500">{booking.amount}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center justify-center w-[85px] ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center mx-auto transition-colors text-slate-600"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] bg-white rounded-[20px] shadow-2xl z-50 p-0 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-[20px] font-bold text-slate-800 flex items-center gap-2">
                    Booking Details 
                    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${getStatusBadge(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-1">ID: {selectedBooking.id} • {selectedBooking.date}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 text-slate-500 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm border border-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-6 p-5 rounded-[16px] bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-[12px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Patient Details</p>
                    <p className="text-[16px] font-bold text-slate-800">{selectedBooking.patient}</p>
                    <p className="text-[14px] text-slate-600 mt-1">{selectedBooking.phone}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Service Booked</p>
                    <p className="text-[16px] font-bold text-slate-800">{selectedBooking.type}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex items-center justify-between p-5 rounded-[16px] border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedBooking.payment === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {selectedBooking.payment === 'Paid' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">Payment Status: {selectedBooking.payment}</p>
                      <p className="text-[13px] text-slate-500">Amount: {selectedBooking.amount}</p>
                    </div>
                  </div>
                  {selectedBooking.payment === 'Unpaid' && (
                    <button className="h-[36px] px-4 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-[13px] hover:bg-emerald-100">
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                {selectedBooking.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, "Cancelled")}
                      className="h-[44px] px-6 rounded-[12px] border-2 border-rose-100 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, "Confirmed")}
                      className="h-[44px] px-6 rounded-[12px] bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Approve Booking
                    </button>
                  </>
                )}
                
                {selectedBooking.status === "Confirmed" && (
                  <button
                    onClick={() => handleStatusChange(selectedBooking.id, "Completed")}
                    className="h-[44px] px-6 rounded-[12px] bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Mark Completed
                  </button>
                )}

                {(selectedBooking.status === "Completed" || selectedBooking.status === "Cancelled") && (
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="h-[44px] px-6 rounded-[12px] bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
