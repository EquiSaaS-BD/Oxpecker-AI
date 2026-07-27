"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Bell,
  UserPlus,
  CalendarPlus,
  Menu,
  ShieldCheck,
  ChevronDown,
  Maximize,
  Minimize,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

interface DoctorHeaderProps {
  onMenuClick: () => void;
}

export function DoctorHeader({ onMenuClick }: DoctorHeaderProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const notifications = [
    { id: 1, text: "New appointment request from Fatema Akter", time: "2 min ago", unread: true },
    { id: 2, text: "Lab report ready for Kamal Hossain", time: "15 min ago", unread: true },
    { id: 3, text: "Prescription approved for Abdul Matin", time: "1 hour ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-white/60 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 shrink-0 w-full shadow-sm">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        {/* Mobile Logo */}
        <Link href="/doctor/dashboard" className="flex items-center gap-2 lg:hidden">
          <Image
            src="/images/shustota icon.png"
            alt="Shustota"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] font-bold text-slate-800 tracking-tight">Shustota</span>
            <span className="text-[9px] font-bold text-[#2F80ED] bg-[#2F80ED]/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Doctor</span>
          </div>
        </Link>

        {/* Search */}
        <div className="relative max-w-[600px] flex-1 hidden sm:block">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 lg:h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED]/40 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right: Actions + Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <button
          onClick={() => toast.success("Add Patient dialog coming soon!")}
          className="hidden md:flex items-center gap-1.5 h-9 px-3.5 bg-primary/8 text-primary text-[13px] font-medium rounded-lg hover:bg-primary/12 transition-colors"
        >
          <UserPlus size={15} />
          <span>Add Patient</span>
        </button>
        <button
          onClick={() => toast.success("New Appointment dialog coming soon!")}
          className="hidden md:flex items-center gap-1.5 h-9 px-3.5 bg-emerald-50 text-emerald-600 text-[13px] font-medium rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <CalendarPlus size={15} />
          <span>New Appointment</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40 sm:z-40" onClick={() => setShowNotifications(false)} />
              <div className="fixed inset-0 z-[99999] bg-slate-50 flex flex-col h-[100dvh] sm:h-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:bg-white/60 sm:backdrop-blur-xl sm:rounded-xl sm:shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-0 sm:border sm:border-white/60 overflow-hidden sm:z-50 animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200">
                <div className="px-4 py-4 sm:py-3 border-b border-slate-200 sm:border-white/50 bg-white sm:bg-white/30 flex items-center justify-between shrink-0">
                  <h4 className="text-lg sm:text-sm font-bold text-slate-800">Notifications</h4>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="sm:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 sm:max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-4 sm:py-3 border-b border-slate-100 sm:border-white/20 last:border-0 hover:bg-slate-100 sm:hover:bg-white/40 transition-colors cursor-pointer ${n.unread ? "bg-blue-50/50 sm:bg-white/30 shadow-sm" : "bg-white sm:bg-transparent"}`}
                    >
                      <p className="text-[14px] sm:text-[13px] font-medium text-slate-800">{n.text}</p>
                      <p className="text-[12px] sm:text-[11px] font-bold text-[#2F80ED] sm:text-slate-600 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
