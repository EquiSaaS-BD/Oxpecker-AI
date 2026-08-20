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
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/doctor/settings", icon: Settings },
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${isCollapsed ? "lg:w-[80px]" : "lg:w-[280px]"} w-[280px] bg-slate-50 border-r border-slate-200
          flex flex-col h-full
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-6 -right-3.5 w-7 h-7 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-sky-600 hover:border-sky-200 shadow-sm z-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        
        {/* Logo Section */}
        <div className={`h-16 px-4 flex items-center ${isCollapsed ? 'lg:justify-center justify-between' : 'justify-between'} border-b border-slate-200 shrink-0 bg-white`}>
          <Link href="/doctor/dashboard" className={`flex items-center gap-2.5 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <Image
              src="/images/Oxpecker_Full.png"  
              alt="Oxpecker AI"  
              width={140}
              height={36}
              className={`object-contain ${isCollapsed ? 'hidden lg:block' : 'block'}`}
            />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"  
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide bg-slate-50">
          {navCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              <div className={`px-2 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'lg:hidden' : 'block'}`}>
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
                      relative flex items-center gap-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                      ${isCollapsed ? 'lg:justify-center lg:px-0 px-3' : 'px-3'}
                      ${active ? "text-sky-700" : "text-slate-600 hover:text-slate-900"}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <motion.div 
                        layoutId="doctor-active-nav"
                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                        initial={false}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <item.icon size={18} strokeWidth={active ? 2.5 : 2} className={`shrink-0 relative z-10 ${active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span className={`flex-1 relative z-10 ${isCollapsed ? 'lg:hidden' : 'block'}`}>{item.label}</span>
                    {active && <ChevronRight size={14} className={`text-sky-400 relative z-10 ${isCollapsed ? 'lg:hidden' : 'block'}`} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        
        {/* Bottom Section */}
        <div className="px-4 pb-4 space-y-2 shrink-0 border-t border-slate-200 pt-4 bg-white">
          {/* Doctor Access Badge */}
          <div className={`flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg ${isCollapsed ? 'lg:hidden' : 'block'}`}>
            <Lock size={13} className="text-slate-400" />
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Doctor Access Only</span>
          </div>
          
          {/* Doctor Profile */}
          <div className={`flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-sm ${isCollapsed ? 'lg:p-2 lg:justify-center p-3' : 'p-3'}`}>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0 border border-emerald-200">
              {user?.name?.charAt(0) || "D"}
            </div>
            <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              <p className="text-sm font-extrabold text-slate-900 truncate">{user?.name || "Dr. User"}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span className="text-xs text-slate-500 font-semibold">Verified</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className={`flex items-center gap-3 py-2.5 mt-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors w-full
            ${isCollapsed ? 'lg:justify-center lg:px-0 px-3' : 'px-3'}
            `}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={18} strokeWidth={2} className="shrink-0" />
            <span className={`${isCollapsed ? 'lg:hidden' : 'block'}`}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
