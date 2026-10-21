"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Search,
  ChevronDown,
  FileText,
  Calendar,
  Users,
  Activity,
  MapPin,
  Clock,
  Pill,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

type MegaMenuType = "clinical" | "chambers" | "ai-tools" | null;

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "alert" | "info" | "success";
  unread: boolean;
}

export default function DoctorTopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState<MegaMenuType>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Critical Allergy Warning",
      message: "Patient Abdul Karim has confirmed severe Penicillin & NSAID anaphylaxis risk.",
      time: "2 mins ago",
      type: "alert",
      unread: true,
    },
    {
      id: "2",
      title: "Emergency HealthPass Scanned",
      message: "Rahim Uddin (A+) pass verified at Trauma & OPD queue.",
      time: "15 mins ago",
      type: "info",
      unread: true,
    },
    {
      id: "3",
      title: "Diagnostic Lab Upload",
      message: "Digital Hematology Panel verified for Fatema Begum.",
      time: "1 hour ago",
      type: "success",
      unread: false,
    },
  ]);
  const [isOnline, setIsOnline] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
      if (!notificationRef.current?.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleMenu = (menu: MegaMenuType) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <header
      ref={navRef}
      className="h-16 px-4 sm:px-6 bg-white flex items-center justify-between shrink-0 relative z-30 border-b border-slate-100"
    >
      {/* Mobile Menu Button + Official Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <Link href="/?view=home" className="flex items-center gap-2" title="Return to Home">
          <Image src="/images/Oxpecker_icon.png" alt="Oxpecker AI" width={28} height={28} className="object-contain" priority />
          <span className="text-sm font-bold text-slate-800">Doctor Portal</span>
        </Link>
      </div>

      {/* Desktop Mega Menus */}
      <div className="hidden lg:flex items-center gap-1">
        {/* Desktop Brand Link */}
        <Link href="/?view=home" className="flex items-center gap-2 mr-3 group px-2 py-1 rounded-xl hover:bg-slate-50 transition-colors" title="Return to Home">
          <Image src="/images/Oxpecker_icon.png" alt="Oxpecker AI" width={26} height={26} className="object-contain group-hover:scale-105 transition-transform" priority />
          <span className="text-xs font-black text-slate-900 tracking-tight">Oxpecker <span className="text-sky-600">AI</span></span>
        </Link>
        {/* Clinical Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("clinical")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              openMenu === "clinical"
                ? "bg-sky-50 text-sky-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Activity size={15} className="text-sky-600" />
            <span>Clinical Workflows</span>
            <ChevronDown size={13} className={cn("transition-transform", openMenu === "clinical" && "rotate-180")} />
          </button>

          {openMenu === "clinical" && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <Link
                href="/doctor/dashboard/prescription/new"
                onClick={() => setOpenMenu(null)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-sky-50 text-xs font-semibold text-slate-700 hover:text-sky-700 transition-colors"
              >
                <PlusCircle size={16} className="text-sky-600" />
                <span>New AI Prescription</span>
              </Link>
              <Link
                href="/doctor/dashboard/health-pass"
                onClick={() => setOpenMenu(null)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-colors"
              >
                <ShieldAlert size={16} className="text-rose-600" />
                <span>HealthPass Emergency Search</span>
              </Link>
              <Link
                href="/doctor/dashboard/patients"
                onClick={() => setOpenMenu(null)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-sky-50 text-xs font-semibold text-slate-700 hover:text-sky-700 transition-colors"
              >
                <Users size={16} className="text-indigo-600" />
                <span>Patient Registry</span>
              </Link>
            </div>
          )}
        </div>

        {/* Chambers Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("chambers")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              openMenu === "chambers"
                ? "bg-sky-50 text-sky-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <MapPin size={15} className="text-emerald-600" />
            <span>Chambers & OPD</span>
            <ChevronDown size={13} className={cn("transition-transform", openMenu === "chambers" && "rotate-180")} />
          </button>

          {openMenu === "chambers" && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <Link
                href="/doctor/settings/chambers"
                onClick={() => setOpenMenu(null)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <Clock size={16} className="text-emerald-600" />
                <span>Manage Chamber Slots</span>
              </Link>
              <Link
                href="/doctor/settings/locations"
                onClick={() => setOpenMenu(null)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <MapPin size={16} className="text-sky-600" />
                <span>Practice Locations</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Search, Notifications & Profile Avatar (Settings & Logout Removed per user request) */}
      <div className="flex items-center justify-end gap-2.5 sm:gap-3">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center relative w-48">
          <Search size={15} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient..."
            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Notifications Popover */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            aria-label="Notifications"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={12} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 py-2 candy-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors flex items-start gap-2.5 ${
                      notif.unread
                        ? "bg-sky-50/60 border-sky-200/80 text-slate-900"
                        : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === "alert"
                        ? "bg-rose-100 text-rose-700"
                        : notif.type === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-sky-100 text-sky-700"
                    }`}>
                      {notif.type === "alert" ? (
                        <AlertTriangle size={14} />
                      ) : notif.type === "success" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Activity size={14} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-xs font-bold text-slate-900 truncate">
                          {notif.title}
                        </strong>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Profile Avatar (Settings & Logout removed per instruction) */}
        <Link href="/doctor/settings" className="flex items-center gap-2 cursor-pointer" title="Doctor Profile">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 relative bg-slate-800 shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-xs">
            <Image src={user?.image || "/images/signup-doctor.png"} alt="Doctor Profile" fill className="object-cover" />
          </div>
        </Link>
      </div>
    </header>
  );
}
