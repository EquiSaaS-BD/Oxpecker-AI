"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Bell,
  BedDouble,
  UserPlus,
  Menu,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface HospitalHeaderProps {
  onMenuClick: () => void;
}

export function HospitalHeader({ onMenuClick }: HospitalHeaderProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "New bed allocation request from Dr. Anisur", time: "5 min ago", unread: true },
    { id: 2, text: "ICU Unit 3 capacity reached 90%", time: "1 hour ago", unread: true },
    { id: 3, text: "Monthly billing report is ready", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        {/* Search */}
        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors, beds, patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions + Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2 mr-2 border-r border-slate-200 pr-4">
          <button
            onClick={() => toast.info("Allocate Bed Feature Coming Soon")}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
          >
            <BedDouble size={14} />
            Allocate Bed
          </button>
          <button
            onClick={() => toast.info("Add Doctor Feature Coming Soon")}
            className="flex items-center gap-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <UserPlus size={14} />
            Add Doctor
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} New
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${
                        notif.unread ? "bg-slate-50/50" : ""
                      }`}
                    >
                      <p className={`text-sm ${notif.unread ? "text-slate-800 font-medium" : "text-slate-600"}`}>
                        {notif.text}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                    Mark all as read
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-2 pl-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
              {user?.name || "Hospital Admin"}
            </p>
            <p className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
              <ShieldCheck size={12} />
              Verified
            </p>
          </div>
          <button aria-label="Profile menu" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {user?.name?.charAt(0) || "H"}
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
