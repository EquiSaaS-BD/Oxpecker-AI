"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Activity,
  Pill,
  CalendarCheck,
  BrainCircuit,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Radio,
  Siren,
  LogOut,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Command Center", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Emergency Radar", icon: Siren, href: "/admin/dashboard#emergency-radar", badge: "Live" },
    { name: "HealthPass Cards", icon: CreditCard, href: "/admin/health-cards" },
    { name: "User Directory", icon: Users, href: "/admin/users" },
    { name: "Medicines & Drugs", icon: Pill, href: "/admin/data/medicines" },
    { name: "Clinical Bookings", icon: CalendarCheck, href: "/admin/data/bookings" },
    { name: "AI Analytics", icon: BrainCircuit, href: "/admin/ai-analytics" },
    { name: "System Logs", icon: Activity, href: "/admin/ai-logs" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <aside 
      className={`
        relative bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col h-full
        transition-all duration-300 ease-in-out shrink-0 z-50 shadow-sm
        ${isOpen ? "w-[280px]" : "w-[80px]"}
      `}
    >
      {/* Logo Area */}
      <div className="h-[72px] flex items-center justify-center border-b border-slate-200/80 shrink-0 px-4 bg-white">
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
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-200/80">
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
        className="absolute -right-3.5 top-20 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors z-50 shadow-sm hidden lg:flex cursor-pointer"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-3 flex flex-col gap-1.5 bg-slate-50/50">
        {isOpen && (
          <div className="px-3 pb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Admin Console</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.name}
              href={item.href}
              className={`
                relative flex items-center px-3 py-2.5 rounded-xl transition-all group font-semibold text-sm
                ${isOpen ? "justify-start gap-3" : "justify-center"}
                ${isActive 
                  ? "text-emerald-800 font-bold" 
                  : "text-slate-600 hover:text-slate-950 hover:bg-white"
                }
              `}
              title={!isOpen ? item.name : undefined}
            >
              {isActive && (
                <motion.div 
                  layoutId="admin-active-nav"
                  className="absolute inset-0 bg-emerald-50/80 border border-emerald-500/30 rounded-xl shadow-xs"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              
              <item.icon 
                size={19} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`relative z-10 shrink-0 ${
                  item.badge === "Live" 
                    ? "text-rose-500 animate-pulse" 
                    : isActive 
                    ? "text-emerald-600" 
                    : "text-slate-400 group-hover:text-slate-700 transition-colors"
                }`} 
              />
              
              {isOpen && (
                <div className="relative z-10 flex items-center justify-between w-full">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile / Quick Info */}
      {isOpen && (
        <div className="p-4 border-t border-slate-200/80 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-700">Azure Prod: Live</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
        </div>
      )}
    </aside>
  );
}