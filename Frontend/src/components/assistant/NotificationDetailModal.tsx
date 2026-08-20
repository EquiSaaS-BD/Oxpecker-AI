"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, CreditCard, MessageSquare, Bell, ArrowLeft, Trash2, Reply, UserPlus, CheckCircle2 } from "lucide-react";

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
  onInviteResponse?: (id: number | string, status: 'accepted' | 'declined') => void;
}

export function NotificationDetailModal({ isOpen, onClose, notification, onInviteResponse }: NotificationDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !notification) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "doctor_invite": return <UserPlus size={24} className="text-indigo-600" />;
      case "appointment": return <Calendar size={24} className="text-[#2F80ED]" />;
      case "payment": return <CreditCard size={24} className="text-emerald-600" />;
      case "message": return <MessageSquare size={24} className="text-amber-500" />;
      default: return <Bell size={24} className="text-slate-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "doctor_invite": return "bg-indigo-100";
      case "appointment": return "bg-blue-100";
      case "payment": return "bg-emerald-100";
      case "message": return "bg-amber-100";
      default: return "bg-slate-100";
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col sm:items-center sm:justify-center bg-white sm:bg-slate-900/40 sm:backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      
      {/* Container: Full Screen on Mobile, Card on Desktop */}
      <div className="flex-1 sm:flex-none flex flex-col w-full sm:w-[500px] h-full sm:h-auto bg-white sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-right sm:slide-in-from-bottom-4 duration-300">
        
        {/* Header (App Bar) */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 pt-safe-top">
          <button 
            onClick={onClose}
            className="flex items-center gap-1 text-[#2F80ED] font-semibold text-[15px] active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h2 className="text-[16px] font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">Notification</h2>
          <button className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors active:scale-95">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar relative">
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className={`w-14 h-14 rounded-full ${getIconBg(notification.type)} flex items-center justify-center shrink-0`}>
              {getIcon(notification.type)}
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-slate-800 leading-tight">{notification.title}</h3>
              <p className="text-[13px] font-medium text-slate-400 mt-1">{notification.time} • Oxpecker AI System</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap">
              {notification.message}
            </p>

            {/* Extra context based on type */}
            
            {/* DOCTOR INVITE TYPE */}
            {notification.type === "doctor_invite" && !notification.status && (
              <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-indigo-50 flex items-center justify-center shadow-sm mb-3">
                    <UserPlus size={24} className="text-indigo-500" />
                  </div>
                  <h4 className="text-[16px] font-bold text-slate-800">{notification.doctorName}</h4>
                  <p className="text-[13px] text-slate-500 font-medium">{notification.specialty}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => onInviteResponse?.(notification.id, 'accepted')}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[14px] shadow-md active:scale-95 transition-transform"
                  >
                    Accept Invite
                  </button>
                  <button 
                    onClick={() => onInviteResponse?.(notification.id, 'declined')}
                    className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-[14px] active:scale-95 transition-transform"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
            
            {notification.type === "doctor_invite" && notification.status === 'accepted' && (
              <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-[16px] font-bold text-slate-800">Connection Successful</h4>
                <p className="text-[13px] text-slate-600 mt-1">You are now the official assistant for {notification.doctorName}. You can manage their patient queue and view reports.</p>
              </div>
            )}

            {notification.type === "payment" && (
              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-slate-500 uppercase">Transaction ID</p>
                  <p className="font-mono font-bold text-slate-800 text-[14px] mt-0.5">TXN-984323</p>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-[#2F80ED] shadow-sm active:scale-95 transition-transform">
                  View Receipt
                </button>
              </div>
            )}
            
            {notification.type === "appointment" && (
              <div className="mt-6 flex gap-2">
                <button className="flex-1 py-3 bg-[#2F80ED] hover:bg-[#256bbd] text-white rounded-xl font-bold text-[14px] shadow-sm active:scale-95 transition-transform">
                  Confirm Booking
                </button>
                <button className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-[14px] active:scale-95 transition-transform">
                  Decline
                </button>
              </div>
            )}

          </div>
        </div>
        
        {/* Footer (If Message Type) */}
        {notification.type === "message" && (
          <div className="p-4 border-t border-slate-100 shrink-0 pb-safe">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Reply to Dr. Anisur..."
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#2F80ED] text-white rounded-lg hover:bg-[#256bbd] active:scale-95 transition-transform">
                <Reply size={16} />
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>,
    document.body
  );
}
