"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Bell,
  Menu,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Settings,
  Building,
  Check,
} from "lucide-react";

interface HospitalHeaderProps {
  onMenuClick: () => void;
}

export function HospitalHeader({ onMenuClick }: HospitalHeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: "New bed allocation request from Dr. Anisur", time: "5 min ago", unread: true },
    { id: 2, text: "ICU Unit 3 capacity reached 90%", time: "1 hour ago", unread: true },
    { id: 3, text: "Monthly billing report is ready", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
      {/* Left: Mobile menu toggle + Clean Spacious Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Minimalist Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors, beds, patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9.5 pr-12 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Icon */}
        <div className="relative" ref={notificationsRef}>
          <button
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }}
            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              </div>
              <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                      notif.unread ? "bg-slate-50/60" : ""
                    }`}
                  >
                    <p className={`text-xs leading-relaxed ${notif.unread ? "text-slate-900 font-semibold" : "text-slate-600 font-normal"}`}>
                      {notif.text}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subtle Divider */}
        <div className="h-6 w-px bg-slate-200/80 mx-1 hidden sm:block" />

        {/* Profile Pill & Menu (Single source of Profile Actions and Logout) */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            aria-label="Profile and account menu"
            className="flex items-center gap-2.5 p-1 sm:pl-2 sm:pr-2.5 sm:py-1 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60 transition-all cursor-pointer group"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "H"}
            </div>

            {/* User Meta */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[150px]">
                {user?.name || "Hospital Admin"}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-500" />
                Verified Facility
              </p>
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                showProfileDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Account Overview Header */}
              <div className="p-3 bg-slate-50/80 rounded-xl mb-1.5 border border-slate-100">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">
                  {user?.name || "Hospital Admin"}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {user?.email || "hospital@oxpecker.ai"}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md">
                  {user?.role || "Hospital Admin"}
                </span>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5">
                <Link
                  href="/hospital/dashboard/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
                >
                  <Building size={15} className="text-slate-400" />
                  <span>Facility Profile</span>
                </Link>

                <Link
                  href="/hospital/dashboard/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
                >
                  <Settings size={15} className="text-slate-400" />
                  <span>Hospital Settings</span>
                </Link>
              </div>

              {/* Divider & Single Logout Button */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
