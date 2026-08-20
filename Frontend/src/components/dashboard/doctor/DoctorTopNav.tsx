"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

type MegaMenuType = "clinical" | "chambers" | "ai-tools" | null;

export default function DoctorTopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
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
      className="h-[76px] bg-white/90 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-40 shadow-xs"
    >
      {/* Left side: Brand Logo & Title */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={22} />
        </button>
        <Link href="/doctor/dashboard" className="flex items-center gap-2.5">
          <Image src="/images/Oxpecker_full_size.png" alt="Oxpecker Doctor" width={140} height={42} className="h-8 w-auto object-contain" />
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 hidden sm:inline-block">
            Doctor Suite
          </span>
        </Link>

        {/* Desktop Mega Menu Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60 shadow-2xs">
          
          {/* 1. Clinical Workflows Mega Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("clinical")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all",
                openMenu === "clinical" ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <span>Clinical Workflows</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", openMenu === "clinical" && "rotate-180")} />
            </button>

            {openMenu === "clinical" && (
              <div className="absolute left-0 top-full mt-2 w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href="/doctor/dashboard/prescription/new"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sky-50/80 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
                      <PlusCircle size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>New E-Prescription</span>
                        <span className="text-[9px] font-extrabold bg-sky-600 text-white px-1.5 py-0.2 rounded-full">60s Rx</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">Create AI-guided prescription with smart dosage builder</div>
                    </div>
                  </Link>

                  <Link
                    href="/doctor/dashboard/appointments"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Appointments & Chamber Queue</div>
                      <div className="text-[11px] text-slate-500 font-medium">Manage today's booked patients and serial queue</div>
                    </div>
                  </Link>

                  <Link
                    href="/doctor/dashboard/patients"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Patient Health Logs</div>
                      <div className="text-[11px] text-slate-500 font-medium">Access past medical history, lab tests, and Rx logs</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 2. Chambers & Schedule Mega Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("chambers")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all",
                openMenu === "chambers" ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <span>Chambers & Fees</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", openMenu === "chambers" && "rotate-180")} />
            </button>

            {openMenu === "chambers" && (
              <div className="absolute left-0 top-full mt-2 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href="/doctor/settings/locations"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Chamber Locations & Map</div>
                      <div className="text-[11px] text-slate-500 font-medium">Update chamber addresses, maps, and visiting hours</div>
                    </div>
                  </Link>

                  <Link
                    href="/doctor/settings/chambers"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Consultation Fees & Shifts</div>
                      <div className="text-[11px] text-slate-500 font-medium">Set first visit fee, follow-up fee, and slot timings</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. AI Co-Pilot Mega Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("ai-tools")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all text-[#0878C9]",
                openMenu === "ai-tools" ? "bg-white shadow-xs ring-1 ring-sky-300 font-extrabold" : "hover:bg-sky-50/70"
              )}
            >
              
              <span>AI Doctor Tools</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", openMenu === "ai-tools" && "rotate-180")} />
            </button>

            {openMenu === "ai-tools" && (
              <div className="absolute left-0 top-full mt-2 w-[400px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href="/chat"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sky-50/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
                      
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>AI Clinical Co-Pilot</span>
                        <span className="text-[9px] font-extrabold bg-sky-500 text-white px-1.5 py-0.2 rounded-full">AI 2026</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">Instant medical reference, drug interactions & diagnosis aid</div>
                    </div>
                  </Link>

                  <Link
                    href="/doctor/dashboard/medicines"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                      <Pill size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">DGDA Medicine Database</div>
                      <div className="text-[11px] text-slate-500 font-medium">Quick search registered brand & generic medicines</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </nav>
      </div>

      {/* Right side: Online Toggle, Search, Notifications & Profile Avatar */}
      <div className="flex items-center justify-end gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center relative w-56">
          <Search size={15} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, serial..."
            className="w-full h-9 pl-9 pr-3 bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 font-medium transition-all"
          />
        </div>

        {/* Online Status Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={cn(
            "px-3 py-1 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 cursor-pointer",
            isOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
          )}
        >
          <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
          <span>{isOnline ? "Chamber Active" : "Offline"}</span>
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
        </button>

        {/* Doctor Profile */}
        <Link href="/doctor/settings/profile" className="flex items-center gap-2.5 cursor-pointer">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-extrabold text-slate-900 leading-tight">Dr. Sarah Rahman</span>
            <span className="text-[10px] font-semibold text-slate-500">Cardiologist</span>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 relative bg-slate-100 shadow-xs shrink-0">
            <Image src="/images/signup-doctor.png" alt="Doctor Profile" fill className="object-cover" />
          </div>
        </Link>
      </div>
    </header>
  );
}
