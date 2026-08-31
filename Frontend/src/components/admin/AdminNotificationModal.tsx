"use client";

import { useState } from "react";
import { Bell, X, ShieldAlert, CheckCircle2, UserPlus, Database, Cpu, Calendar, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminNotifModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminNotificationModal({ isOpen, onClose }: AdminNotifModalProps) {
  const [notifs, setNotifs] = useState([
    {
      id: "1",
      title: "New Doctor Registration",
      message: "Dr. Sarah Rahman registered a new Cardiology chamber profile.",
      time: "10 mins ago",
      type: "user",
      read: false
    },
    {
      id: "2",
      title: "Supabase Keep-Alive Ping Successful",
      message: "Automated GitHub Action pinged PostgreSQL profiles table. Free tier database active.",
      time: "2 hours ago",
      type: "system",
      read: false
    },
    {
      id: "3",
      title: "AI Gateway Provider Failover",
      message: "DeepSeek API experienced 350ms latency; automatically routed prompt to Gemini 3.6 Flash.",
      time: "4 hours ago",
      type: "ai",
      read: true
    },
    {
      id: "4",
      title: "New Bed Booking Request",
      message: "Square Hospital received a new ICU Bed Allocation booking for Patient Patient.",
      time: "Yesterday",
      type: "booking",
      read: true
    }
  ]);

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-white/30 backdrop-blur-xs" />

          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-xl relative">
                  <Bell size={20} className="text-amber-400" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900" />}
                </div>
                <div>
                  <h2 className="font-bold text-base">System Governance Alerts</h2>
                  <p className="text-xs text-slate-500">{unreadCount} unread system notifications</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Platform Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                  <Check size={13} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    !n.read ? "bg-amber-50/50 border-amber-200/80 shadow-xs" : "bg-white border-slate-100 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      {n.type === "user" && <UserPlus size={16} className="text-sky-600" />}
                      {n.type === "system" && <Database size={16} className="text-emerald-600" />}
                      {n.type === "ai" && <Cpu size={16} className="text-purple-600" />}
                      {n.type === "booking" && <Calendar size={16} className="text-amber-600" />}
                      <span className="font-bold text-slate-800 text-xs">{n.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">{n.message}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[11px] text-slate-500 font-mono">Oxpecker AI Governance Monitor • Supabase PostgreSQL</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
