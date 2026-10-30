"use client";

import { useState } from "react";
import { Bell, Search, Menu, ShieldCheck, Siren, Navigation } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { AdminNotificationModal } from "./AdminNotificationModal";

export function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);

  const pathSegments = pathname.split("/").filter((p) => p && p !== "admin");

  return (
    <>
      <header className="h-[72px] shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 shadow-xs">
        
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>

          {/* Mobile Official Logo */}
          <Link href="/?view=home" className="flex items-center gap-2 lg:hidden" title="Back to Home">
            <Image src="/images/Oxpecker_icon.png" alt="Oxpecker AI" width={28} height={28} className="object-contain" priority />
            <span className="text-sm font-black text-slate-800 tracking-tight">Admin</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
            <Link href="/admin/dashboard" className="text-slate-500 hover:text-emerald-700 transition-colors font-bold">
              Admin
            </Link>
            {pathSegments.map((segment, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-slate-400">/</span>
                <span className={`capitalize font-semibold ${index === pathSegments.length - 1 ? "text-slate-950 font-bold" : "text-slate-500"}`}>
                  {segment.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Quick Emergency Dispatch Pill */}
          <Link
            href="/admin/dashboard#emergency-radar"
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all shadow-xs"
          >
            <Siren size={14} className="text-rose-600 animate-pulse" />
            <span>Emergency Radar</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients, doctors, drugs..." 
              className="w-[260px] h-[38px] bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Notification Button */}
          <button 
            onClick={() => setShowNotifs(true)}
            className="relative p-2.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer"
            title="System Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
          </button>

          {/* Super Admin Profile Link */}
          <Link 
            href="/admin/profile"
            className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 hover:opacity-90 transition-opacity"
            title="Super Admin Profile Settings"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 flex items-center gap-1">
                {user?.name || "Supreme Admin"}
                <ShieldCheck size={14} className="text-emerald-600" />
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                System SuperAdmin
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-white font-black shadow-md overflow-hidden border-2 border-white ring-2 ring-slate-200 relative">
              {user?.image ? (
                <Image src={user.image} alt="Admin" fill className="object-cover" />
              ) : (
                <span>{(user?.name || "S").charAt(0).toUpperCase()}</span>
              )}
            </div>
          </Link>
        </div>
      </header>

      <AdminNotificationModal isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
    </>
  );
}