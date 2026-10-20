"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  Pill,
  MessageSquare,
  Settings,
  LogOut,
  ShieldCheck,
  Lock,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
} from "lucide-react";

interface DoctorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navCategories = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Clinical",
    items: [
      { label: "Appointments", href: "/doctor/dashboard/appointments", icon: CalendarDays },
      { label: "HealthPass Emergency", href: "/doctor/dashboard/health-pass", icon: CreditCard },
      { label: "Prescriptions", href: "/doctor/dashboard/prescription", icon: ClipboardList },
      { label: "Patient List", href: "/doctor/dashboard/patients", icon: Users },
      { label: "Reports & Diagnostics", href: "/doctor/dashboard/reports", icon: FileBarChart },
    ]
  },
  {
    title: "Management",
    items: [
      { label: "Medicine Inventory", href: "/doctor/dashboard/medicines", icon: Pill },
      { label: "Messages", href: "/doctor/dashboard/messages", icon: MessageSquare },
    ]
  }
];

export function DoctorSidebar({ isOpen, onClose }: DoctorSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isActive = (href: string) => {
    if (href === "/doctor/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };
  
  useEffect(() => {
    if (pathname.includes("/prescription/new")) {
      setIsCollapsed(true);
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${isCollapsed ? "lg:w-[80px]" : "lg:w-[240px]"} w-[240px] bg-white border-r border-slate-200/80 lg:border-r-0
          flex flex-col h-full shadow-xl lg:shadow-none
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-[18px] -right-3.5 w-7 h-7 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-500 hover:text-sky-600 hover:border-sky-200 shadow-sm z-50 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        
        {/* Logo Section */}
        <div className={`h-16 px-4 flex items-center ${isCollapsed ? 'lg:justify-center justify-between' : 'justify-between'} shrink-0 bg-white`}>
          <Link href="/?view=home" className={`flex items-center gap-2.5 ${isCollapsed ? 'lg:justify-center' : ''}`} title="Back to Home">
            {isCollapsed ? (
              <Image
                src="/images/Oxpecker_icon.png"  
                alt="Oxpecker AI"  
                width={36}
                height={36}
                className="object-contain hidden lg:block transition-all duration-300"
              />
            ) : (
              <Image
                src="/images/Oxpecker_full_size.png"  
                alt="Oxpecker AI"  
                width={140}
                height={36}
                className="object-contain block transition-all duration-300"
              />
            )}
            
            {/* Mobile logo always full */}
            {isCollapsed && (
              <Image
                src="/images/Oxpecker_full_size.png"  
                alt="Oxpecker AI"  
                width={140}
                height={36}
                className="object-contain lg:hidden block transition-all duration-300"
              />
            )}
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"  
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-hide bg-white">
          {navCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              <div className={`px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:h-0' : 'opacity-100 pb-1 h-auto'}`}>
                {category.title}
              </div>
              {category.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      relative flex items-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                      ${isCollapsed ? 'lg:justify-center lg:px-0 lg:gap-0 px-3 gap-3' : 'px-3 gap-3'}
                      ${active ? "bg-sky-50 text-sky-700 border border-sky-200 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon size={18} strokeWidth={active ? 2.5 : 2} className={`shrink-0 ${active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'flex-1 opacity-100'}`}>{item.label}</span>
                    {active && <ChevronRight size={14} className={`text-sky-500 transition-all duration-300 ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:scale-0' : 'w-auto opacity-100 scale-100'}`} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        
        {/* FIXED BOTTOM SECTION: Settings and Logout together */}
        <div className="px-3 pb-4 pt-3 border-t border-slate-200/80 bg-white space-y-1 shrink-0">
          <Link
            href="/doctor/settings"
            onClick={onClose}
            title={isCollapsed ? "Settings" : undefined}
            className={`
              relative flex items-center py-2.5 rounded-xl border border-transparent transition-all duration-200 group
              ${isActive("/doctor/settings") ? "bg-sky-50 border-sky-200 text-sky-700 shadow-xs" : "hover:bg-slate-100/70 text-slate-600"}
              ${isCollapsed ? 'lg:justify-center lg:px-0 lg:gap-0 px-3 gap-3' : 'px-3 gap-3'}
            `}
          >
            <Settings size={18} strokeWidth={isActive("/doctor/settings") ? 2.5 : 2} className={`shrink-0 ${isActive("/doctor/settings") ? "text-sky-600" : "text-slate-500 group-hover:text-slate-700"}`} />
            <span className={`font-bold overflow-hidden whitespace-nowrap transition-all duration-300 ${isActive("/doctor/settings") ? "text-sky-800" : "text-slate-600 group-hover:text-slate-800"} ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'flex-1 opacity-100'}`}>Settings</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              logout();
            }}
            title={isCollapsed ? "লগআউট (Sign Out)" : undefined}
            className={`
              w-full flex items-center py-2.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 group cursor-pointer
              ${isCollapsed ? 'lg:justify-center lg:px-0 lg:gap-0 px-3 gap-3' : 'px-3 gap-3'}
            `}
          >
            <LogOut size={18} className="shrink-0 text-rose-500 group-hover:text-rose-700" />
            <span className={`font-bold overflow-hidden whitespace-nowrap text-left transition-all duration-300 ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'flex-1 opacity-100'}`}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
