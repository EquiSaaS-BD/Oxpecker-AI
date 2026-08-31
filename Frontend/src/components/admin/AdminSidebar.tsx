"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Activity,
  Database,
  Pill,
  CalendarCheck,
  BrainCircuit,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Medicines", icon: Pill, href: "/admin/data/medicines" },
    { name: "Bookings", icon: CalendarCheck, href: "/admin/data/bookings" },
    { name: "AI Analytics", icon: BrainCircuit, href: "/admin/ai-analytics" },
    { name: "System Logs", icon: Activity, href: "/admin/ai-logs" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <aside 
      className={`
        relative bg-slate-50 border-r border-slate-200 flex flex-col h-full
        transition-all duration-300 ease-in-out shrink-0 z-50
        ${isOpen ? "w-[280px]" : "w-[80px]"}
      `}
    >
      {/* Logo Area */}
      <div className="h-[72px] flex items-center justify-center border-b border-slate-200 shrink-0 px-4 bg-white">
        <Link href="/?view=home" className="flex items-center justify-center w-full" title="Back to Home">
          {isOpen ? (
            <Image 
              src="/images/Oxpecker_Full.png" 
              alt="Oxpecker AI" 
              width={140} 
              height={36} 
              className="object-contain" 
            />
          ) : (
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-200">
              <Image 
                src="/images/Oxpecker_icon.png" 
                alt="Oxpecker" 
                width={24} 
                height={24} 
                className="object-contain" 
              />
            </div>
          )}
        </Link>
      </div>

      {/* Toggle Button (Desktop) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3.5 top-20 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors z-50 shadow-sm hidden lg:flex"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-3 flex flex-col gap-1.5 bg-slate-50">
        {isOpen && (
          <div className="px-3 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Admin Console
          </div>
        )}
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link 
              key={item.name}
              href={item.href}
              className={`
                relative flex items-center px-3 py-3 rounded-xl transition-all group
                ${isOpen ? "justify-start gap-3" : "justify-center"}
                ${isActive 
                  ? "text-emerald-700" 
                  : "text-slate-600 hover:text-slate-900"
                }
              `}
              title={!isOpen ? item.name : undefined}
            >
              {isActive && (
                <motion.div 
                  layoutId="admin-active-nav"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`relative z-10 shrink-0 ${isActive ? "text-emerald-600" : "group-hover:text-slate-600 transition-colors"}`} />
              
              {isOpen && (
                <span className="relative z-10 font-semibold text-sm">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Logout Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <button 
          onClick={() => logout()}
          className={`
            flex items-center w-full px-3 py-3 rounded-xl transition-all group text-slate-600 hover:bg-slate-50 hover:text-rose-600
            ${isOpen ? "justify-start gap-3" : "justify-center"}
          `}
          title={!isOpen ? "Logout" : undefined}
        >
          <LogOut size={20} strokeWidth={2} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
          {isOpen && (
            <span className="font-bold text-sm">Sign Out</span>
          )}
        </button>
      </div>
    </aside>
  );
}
