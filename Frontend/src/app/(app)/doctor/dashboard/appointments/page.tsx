"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarClock,
  User,
  Phone,
  Edit,
  MessageSquare,
  ExternalLink,
  BellRing,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDoctor } from "@/context/DoctorContext";
import {
  triggerBookingAutomation,
  getAutomationLogs,
  AutomationEventLog,
} from "@/lib/automation-engine";

export default function DoctorAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"Today" | "Upcoming" | "Past">("Today");
  const [searchQuery, setSearchQuery] = useState("");
  const { appointments, cancelAppointment } = useDoctor();

  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [automationLogs, setAutomationLogs] = useState<AutomationEventLog[]>([]);
  const [syncedIds, setSyncedIds] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadLogs = () => setAutomationLogs(getAutomationLogs());
    loadLogs();
    window.addEventListener("oxpecker-automation-updated", loadLogs);
    return () => window.removeEventListener("oxpecker-automation-updated", loadLogs);
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch =
      apt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.token.toLowerCase().includes(searchQuery.toLowerCase());

    let matchTab = false;
    if (activeTab === "Today") matchTab = apt.date === "Today";
    else if (activeTab === "Upcoming") matchTab = apt.date === "Tomorrow" || apt.date.includes("202");
    else if (activeTab === "Past") matchTab = apt.date === "Yesterday" || apt.status === "Cancelled";

    return matchSearch && matchTab;
  });

  const handleCancelAppointmentLocal = (id: string) => {
    cancelAppointment(id);
    setActionMenuOpen(null);
    const notifsStr = localStorage.getItem("oxpecker_notifications");
    const notifs = notifsStr ? JSON.parse(notifsStr) : [];
    notifs.push({
      id: Date.now().toString(),
      targetId: "assistant",
      message: `Doctor cancelled appointment ${id}.`,
      read: false,
    });
    localStorage.setItem("oxpecker_notifications", JSON.stringify(notifs));
  };

  const handleReschedule = (id: string) => {
    toast.success("Reschedule request sent to Assistant.");
    setActionMenuOpen(null);
  };

  const handleTriggerBookingAutomation = (apt: {
    id: string;
    token: string;
    name: string;
    phone: string;
    date: string;
    time: string;
  }) => {
    const result = triggerBookingAutomation({
      patientName: apt.name,
      patientPhone: apt.phone,
      doctorName: "Prof. Dr. Ahmed Rahman",
      token: apt.token,
      date: apt.date,
      time: apt.time,
      hospitalName: "Oxpecker Specialized Hospital, Dhaka",
    });

    setSyncedIds((prev) => ({ ...prev, [apt.id]: result.googleCalendarUrl }));
    setAutomationLogs(getAutomationLogs());

    toast.success(`SMS Sent to ${apt.name} (${apt.phone}) & Doctor Calendar Slot Synced!`, {
      description: result.smsEvent.smsPreview,
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-80px)] w-full max-w-[1600px] mx-auto overflow-y-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-800 flex items-center gap-2">
            Appointments & Smart Automation
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage chamber schedule, auto-dispatch SMS confirmations, and sync slots with Google Calendar.
          </p>
        </div>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="bg-white rounded-[20px] shadow-none border border-slate-200 p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full lg:w-auto">
          {["Today", "Upcoming", "Past"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-[14px] font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by Name or Token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[46px] bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 text-[14px] focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>
          <button className="w-[46px] h-[46px] bg-white border border-slate-300 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shrink-0">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Appointments List View */}
      <div className="bg-white rounded-[20px] shadow-none border border-slate-200 overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-700 mb-1">No Appointments Found</h3>
            <p className="text-slate-500 max-w-md mx-auto text-[14px]">
              {searchQuery
                ? `No appointments found matching "${searchQuery}"`
                : `You don't have any appointments scheduled for ${activeTab.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[12px] text-slate-500 font-bold uppercase tracking-wider h-[48px]">
                  <th className="px-6 py-3">Patient Info</th>
                  <th className="px-6 py-3">Schedule</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Booked By</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Automation (SMS & Calendar)</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                <AnimatePresence>
                  {filteredAppointments.map((apt, index) => {
                    const calendarUrl = syncedIds[apt.id];
                    return (
                      <motion.tr
                        key={apt.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors h-[78px]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-[42px] h-[42px] bg-slate-100 text-slate-800 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-[14px]">
                              {apt.token}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-[14px]">{apt.name}</h4>
                              <p className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone size={11} /> {apt.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[13px]">
                              <Calendar size={13} className="text-slate-600" /> {apt.date}
                            </span>
                            <span className="text-[12px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Clock size={13} /> {apt.time}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-600 text-[13px]">
                          {apt.type}
                        </td>

                        <td className="px-6 py-4">
                          {apt.bookedBy === "Online" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[11px] font-bold">
                              <User size={11} /> Online
                            </span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[11px] font-bold w-fit">
                                <User size={11} /> {apt.assistant || "Assistant"}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {apt.status === "Completed" && (
                            <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                              <CheckCircle2 size={13} /> Completed
                            </span>
                          )}
                          {apt.status === "Waiting" && (
                            <span className="text-[12px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                              <Clock3 size={13} /> Waiting
                            </span>
                          )}
                          {apt.status === "Upcoming" && (
                            <span className="text-[12px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                              <CalendarClock size={13} /> Upcoming
                            </span>
                          )}
                          {apt.status === "Cancelled" && (
                            <span className="text-[12px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                              <XCircle size={13} /> Cancelled
                            </span>
                          )}
                        </td>

                        {/* 1-Click SMS & Calendar Automation */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTriggerBookingAutomation(apt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                                calendarUrl
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                              }`}
                            >
                              {calendarUrl ? <Check size={13} /> : <MessageSquare size={13} />}
                              <span>{calendarUrl ? "SMS Sent & Synced" : "Send SMS & Set Calendar"}</span>
                            </button>

                            {calendarUrl && (
                              <a
                                href={calendarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1"
                                title="Open in Google Calendar"
                              >
                                <ExternalLink size={12} />
                                <span>Calendar</span>
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={() =>
                              setActionMenuOpen(actionMenuOpen === apt.id ? null : apt.id)
                            }
                            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors ml-auto"
                          >
                            <MoreVertical size={17} />
                          </button>

                          <AnimatePresence>
                            {actionMenuOpen === apt.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-10 top-10 bg-white border border-slate-200 shadow-lg rounded-xl w-[180px] py-1.5 z-20 text-left overflow-hidden"
                              >
                                <button
                                  onClick={() => handleReschedule(apt.id)}
                                  className="w-full px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Edit size={14} /> Reschedule
                                </button>
                                {apt.status !== "Cancelled" && apt.status !== "Completed" && (
                                  <button
                                    onClick={() => handleCancelAppointmentLocal(apt.id)}
                                    className="w-full px-4 py-2 text-[13px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                  >
                                    <XCircle size={14} /> Cancel Appointment
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Automation Event Log Panel */}
      <div className="bg-white rounded-[20px] border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <BellRing size={17} className="text-slate-700" />
              Live Healthcare Automation Dispatch Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time log of automated Booking SMS, Doctor Calendar slots, Medication Schedules, and DGHS FHIR syncs.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
            {automationLogs.length} Automated Events
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
          {automationLogs.slice(0, 10).map((ev) => (
            <div key={ev.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900">{ev.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {ev.channel}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {ev.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{ev.summary}</p>
                {ev.smsPreview && (
                  <p className="text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg mt-1">
                    {ev.smsPreview}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {ev.googleCalendarUrl && (
                  <a
                    href={ev.googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    <span>Google Calendar</span>
                  </a>
                )}
                <span className="text-[11px] text-slate-400 font-mono" suppressHydrationWarning>
                  {new Date(ev.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
