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
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

type MegaMenuType = "clinical" | "chambers" | "ai-tools" | null;

export default function DoctorTopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<MegaMenuType>(null);
  const [isOnline, setIsOnline] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const toggleMenu = (menu: MegaMenuType) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <header
      ref={navRef}
      className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 relative z-30"
    >
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-bold text-slate-800">Doctor Portal</span>
      </div>

      {/* Desktop Mega Menus */}
      <div className="hidden lg:flex items-center gap-1">
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

      {/* Right side: Search, Notifications & Profile Avatar with Logout */}
      <div className="flex items-center justify-end gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center relative w-48">
          <Search size={15} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient..."
            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
        </button>

        {/* Doctor Settings Hub Link */}
        <Link
          href="/doctor/settings"
          title="Doctor Settings"
          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
        >
          <Settings size={18} />
        </Link>

        {/* Doctor Profile Avatar */}
        <Link href="/doctor/settings" className="flex items-center gap-2 cursor-pointer" title="Go to Settings Hub">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 relative bg-slate-800 shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-xs">
            <Image src={user?.image || "/images/signup-doctor.png"} alt="Doctor Profile" fill className="object-cover" />
          </div>
        </Link>

        {/* Dedicated Sign Out Button */}
        <button
          type="button"
          onClick={logout}
          title="লগআউট (Sign Out)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 text-xs font-bold border border-rose-200/60 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">লগআউট</span>
        </button>
      </div>
    </header>
  );
}
