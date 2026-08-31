"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, CreditCard, MessageSquare, Bell, CheckCircle2 } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "appointment",
    title: "New Appointment Request",
    message: "Patient Rahim Chowdhury requested a booking for today at 5:00 PM.",
    time: "2 mins ago",
    unread: true
  },
  {
    id: 2,
    type: "payment",
    title: "Payment Received",
    message: "Received ৳1500 via bKash from Fatema Begum.",
    time: "15 mins ago",
    unread: true
  },
  {
    id: 3,
    type: "message",
    title: "Message from Dr. Anisur",
    message: "Please prepare the lab reports for patient K 99 11 32.",
    time: "1 hour ago",
    unread: false
  },
  {
    id: 4,
    type: "system",
    title: "System Update",
    message: "The Oxpecker AI software has been updated to v1.0.0 successfully.",
    time: "Yesterday",
    unread: false
  }
];

export function AssistantNotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "appointment": return <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2F80ED] flex items-center justify-center shrink-0"><Calendar size={18} /></div>;
      case "payment": return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CreditCard size={18} /></div>;
      case "message": return <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0"><MessageSquare size={18} /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Bell size={18} /></div>;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end sm:items-center sm:justify-center bg-white/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Drawer Container */}
      <div className="w-full sm:w-[400px] h-[85vh] sm:h-[600px] bg-slate-50 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
        
        {/* Drag Handle (Mobile) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold text-slate-800">Notifications</h2>
            <span className="bg-[#2F80ED] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">2 New</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors active:scale-95 shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-3 flex justify-end shrink-0 bg-white border-b border-slate-100">
          <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#2F80ED] active:opacity-70 transition-opacity">
            <CheckCircle2 size={16} />
            Mark all as read
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer ${
                notif.unread ? "bg-white border-[#2F80ED]/30 shadow-[0_2px_12px_rgba(47,128,237,0.08)]" : "bg-slate-100/50 border-transparent shadow-none"
              }`}
            >
              <div className="flex gap-3">
                {getIcon(notif.type)}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className={`text-[14px] font-bold ${notif.unread ? "text-slate-800" : "text-slate-600"}`}>
                      {notif.title}
                    </h3>
                    {notif.unread && <div className="w-2 h-2 rounded-full bg-[#2F80ED] mt-1.5 shrink-0" />}
                  </div>
                  <p className={`text-[13px] leading-snug mb-2 ${notif.unread ? "text-slate-600 font-medium" : "text-slate-500"}`}>
                    {notif.message}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>,
    document.body
  );
}
