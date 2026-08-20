"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  FileText,
  ShoppingBag,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";

interface PatientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/patient/dashboard/appointments", icon: CalendarDays },
  { label: "Prescriptions", href: "/patient/dashboard/prescriptions", icon: ClipboardList },
  { label: "Medical Records", href: "/patient/dashboard/records", icon: FileText },
  { label: "Medicine Orders", href: "/patient/dashboard/orders", icon: ShoppingBag },
  { label: "Profile & Settings", href: "/patient/dashboard/settings", icon: Settings },
];

export function PatientSidebar({ isOpen, onClose }: PatientSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const isActive = (href: string) => {
    if (href === "/patient/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

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
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] bg-slate-50 border-r border-slate-200
          flex flex-col h-full
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 shrink-0 bg-white">
          <Link href="/patient/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/images/Oxpecker_Full.png"  
              alt="Oxpecker AI"  
              width={140}
              height={36}
              className="object-contain"  
            />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"  
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Patient Quick Profile */}
        <div className="p-6 border-b border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xl shadow-sm">
              {user?.name?.charAt(0) || "P"}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 tracking-tight">
                {user?.name || "Patient User"}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">ID: SH-P-{Math.floor(Math.random() * 10000)}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide bg-slate-50">
          <div className="px-2 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Patient Portal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`
                  relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                  ${active ? "text-sky-700" : "text-slate-600 hover:text-slate-900"}
                `}
              >
                {active && (
                  <motion.div 
                    layoutId="patient-active-nav"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  {item.label}
                </div>
                {active && <ChevronRight size={16} className="text-sky-400 relative z-10" />}
              </Link>
            );
          })}
        </div>
        
        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 shrink-0 bg-white">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-rose-600 transition-colors w-full"  
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
