"use client";

import { useState } from "react";
import { Bell, Search, Menu, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { AdminNotificationModal } from "./AdminNotificationModal";

export function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);

  const pathSegments = pathname.split("/").filter(p => p && p !== "admin");
  
  return (
    <>
      <header className="h-[72px] shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
            <Link href="/admin/dashboard" className="text-slate-500 hover:text-emerald-600 transition-colors">
              Admin
            </Link>
            {pathSegments.map((segment, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-slate-600">/</span>
                <span className={`capitalize ${index === pathSegments.length - 1 ? "text-slate-900" : "text-slate-500"}`}>
                  {segment.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden md:flex relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search users, doctors, medicines..." 
              className="w-[280px] h-[40px] bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>

          <button 
            onClick={() => setShowNotifs(true)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="System Notifications"
          >
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
          </button>

          {/* Super Admin Profile Link */}
          <Link 
            href="/admin/profile"
            className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 hover:opacity-90 transition-opacity"
            title="Super Admin Profile Settings"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                {user?.name || "Supreme Admin"}
                <ShieldCheck size={14} className="text-amber-500" />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">God-Level Power</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 font-bold shadow-md overflow-hidden border-2 border-white ring-2 ring-slate-200 relative">
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
