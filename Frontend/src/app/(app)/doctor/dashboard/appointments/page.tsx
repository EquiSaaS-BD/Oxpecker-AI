"use client";

import { useState } from "react";
import { 
  Calendar, Clock, Search, Filter, MoreVertical, CheckCircle2, 
  XCircle, Clock3, CalendarClock, User, Phone, Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

import { useDoctor } from "@/context/DoctorContext";

export default function DoctorAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"Today" | "Upcoming" | "Past">("Today");
  const [searchQuery, setSearchQuery] = useState("");
  const { appointments, cancelAppointment } = useDoctor();
  
  // Modals / Dropdowns
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Filter based on Tabs
  const filteredAppointments = appointments.filter(apt => {
    // Search match
    const matchSearch = apt.name.toLowerCase().includes(searchQuery.toLowerCase()) || apt.token.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab match
    let matchTab = false;
    if (activeTab === "Today") matchTab = apt.date === "Today";
    else if (activeTab === "Upcoming") matchTab = apt.date === "Tomorrow" || apt.date.includes("202");
    else if (activeTab === "Past") matchTab = apt.date === "Yesterday" || apt.status === "Cancelled";
    
    return matchSearch && matchTab;
  });

  const handleCancelAppointmentLocal = (id: string) => {
    cancelAppointment(id);
    setActionMenuOpen(null);
    const notifsStr = localStorage.getItem('shustota_notifications');
    const notifs = notifsStr ? JSON.parse(notifsStr) : [];
    notifs.push({ 
      id: Date.now().toString(), 
      targetId: 'assistant', 
      message: `Doctor cancelled appointment ${id}.`, 
      read: false 
    });
    localStorage.setItem('shustota_notifications', JSON.stringify(notifs));
  };

  const handleReschedule = (id: string) => {
    toast.success("Reschedule request sent to Assistant.", { style: { background: '#2F80ED', color: 'white' }});
    setActionMenuOpen(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-80px)] w-full max-w-[1600px] mx-auto overflow-y-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-800 flex items-center gap-2">
            Appointments Management
          </h1>
          <p className="text-slate-500 mt-1">Manage your schedule and coordinate with your assistants.</p>
        </div>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Tabs */}
        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-full lg:w-auto">
          {["Today", "Upcoming", "Past"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-[14px] font-bold transition-all ${
                activeTab === tab 
                  ? "bg-white text-[#2F80ED] shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name or Token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-[14px] focus:outline-none focus:border-[#2F80ED] transition-colors"
            />
          </div>
          <button className="w-[48px] h-[48px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Appointments List View */}
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
        
        {filteredAppointments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl border border-slate-100 border-dashed"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-[20px] font-bold text-slate-700 mb-2">No Appointments Found</h3>
              <p className="text-slate-500 max-w-md mx-auto text-[15px]">
                {searchQuery 
                  ? `No appointments found matching "${searchQuery}"`
                  : `You don't have any appointments scheduled for ${activeTab.toLowerCase()}.`
                }
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider h-[50px]">
                  <th className="px-6 py-3 rounded-tl-[20px]">Patient Info</th>
                  <th className="px-6 py-3">Schedule</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Booked By</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 rounded-tr-[20px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                <AnimatePresence>
                  {filteredAppointments.map((apt, index) => (
                    <motion.tr 
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors group h-[80px]"
                    >
                      {/* Patient Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-[45px] h-[45px] bg-[#2F80ED]/10 text-[#2F80ED] rounded-xl flex items-center justify-center font-bold text-[16px]">
                            {apt.token}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-[15px]">{apt.name}</h4>
                            <p className="text-[13px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone size={12} /> {apt.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[14px]">
                            <Calendar size={14} className="text-[#2F80ED]" /> {apt.date}
                          </span>
                          <span className="text-[13px] text-slate-500 flex items-center gap-1.5 mt-1">
                            <Clock size={14} /> {apt.time}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {apt.type}
                      </td>

                      {/* Booked By (Assistant Sync) */}
                      <td className="px-6 py-4">
                        {apt.bookedBy === "Online" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[12px] font-bold">
                            <User size={12} /> Online Patient
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full text-[12px] font-bold w-fit">
                              <User size={12} /> Assistant
                            </span>
                            <span className="text-[12px] text-slate-500 mt-1 font-medium pl-1">
                              {apt.assistant}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {apt.status === "Completed" && <span className="text-[12px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit"><CheckCircle2 size={14}/> Completed</span>}
                        {apt.status === "Waiting" && <span className="text-[12px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit"><Clock3 size={14}/> Waiting</span>}
                        {apt.status === "Upcoming" && <span className="text-[12px] font-bold text-[#2F80ED] bg-[#2F80ED]/10 px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit"><CalendarClock size={14}/> Upcoming</span>}
                        {apt.status === "Cancelled" && <span className="text-[12px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit"><XCircle size={14}/> Cancelled</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setActionMenuOpen(actionMenuOpen === apt.id ? null : apt.id)}
                          className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors ml-auto"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {actionMenuOpen === apt.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-10 top-10 bg-white border border-slate-100 shadow-xl rounded-xl w-[180px] py-2 z-20 text-left overflow-hidden"
                            >
                              <button onClick={() => handleReschedule(apt.id)} className="w-full px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Edit size={14} /> Reschedule
                              </button>
                              {apt.status !== "Cancelled" && apt.status !== "Completed" && (
                                <button onClick={() => handleCancelAppointmentLocal(apt.id)} className="w-full px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <XCircle size={14} /> Cancel Appointment
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
