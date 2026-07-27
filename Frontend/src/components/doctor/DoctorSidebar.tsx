"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
  Menu,
  X,
  Stethoscope,
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-[280px]"} w-[280px] bg-white border-r border-slate-200/80
          flex flex-col h-full
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-6 -right-3.5 w-7 h-7 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-primary hover:border-primary shadow-sm z-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo Section */}
        <div className={`h-16 px-4 flex items-center ${isCollapsed ? 'lg:justify-center justify-between' : 'justify-between'} border-b border-slate-100 shrink-0`}>
          <Link href="/doctor/dashboard" className={`flex items-center gap-2.5 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <Image
              src="/images/shustota icon.png"
              alt="Shustota AI"
              width={36}
              height={36}
              className="rounded-lg shrink-0"
            />
            <div className={`flex items-baseline gap-1.5 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              <span className="text-[18px] font-bold text-slate-800 tracking-tight">Shustota</span>
              <span className="text-[9px] font-bold text-[#2F80ED] bg-[#2F80ED]/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Doctor</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              <div className={`px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'lg:hidden' : 'block'}`}>
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
                      doctor-sidebar-item flex items-center gap-3 py-2.5 rounded-xl text-[13.5px] font-medium
                      ${isCollapsed ? 'lg:justify-center lg:px-0 px-3' : 'px-3'}
                      ${active
                        ? "bg-primary/8 text-primary active"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
                    <span className={`flex-1 ${isCollapsed ? 'lg:hidden' : 'block'}`}>{item.label}</span>
                    {active && <ChevronRight size={14} className={`opacity-50 ${isCollapsed ? 'lg:hidden' : 'block'}`} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-4 space-y-2 shrink-0 border-t border-slate-100 pt-3">
          {/* Doctor Access Badge */}
          <div className={`flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg ${isCollapsed ? 'lg:hidden' : 'block'}`}>
            <Lock size={13} className="text-slate-400" />
            <span className="text-[11px] text-slate-500 font-medium">Doctor Access Only</span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className={`flex items-center gap-3 py-2.5 rounded-xl text-[13.5px] font-medium text-red-500 hover:bg-red-50 transition-colors w-full mb-4
              ${isCollapsed ? 'lg:justify-center lg:px-0 px-3' : 'px-3'}
            `}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
            <span className={`${isCollapsed ? 'lg:hidden' : 'block'}`}>Logout</span>
          </button>
          
          {/* Doctor Profile */}
          <div className={`flex items-center gap-3 bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl ${isCollapsed ? 'lg:p-1.5 lg:justify-center p-3' : 'p-3'}`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {user?.name?.charAt(0) || "D"}
            </div>
            <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || "Doctor"}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span className="text-[11px] text-emerald-600 font-medium">Verified Doctor</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
