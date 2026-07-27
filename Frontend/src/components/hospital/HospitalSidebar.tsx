"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  CalendarDays,
  Receipt,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";

interface HospitalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard },
  { label: "Doctors", href: "/hospital/dashboard/doctors", icon: Users },
  { label: "Beds & Wards", href: "/hospital/dashboard/beds", icon: BedDouble },
  { label: "Appointments", href: "/hospital/dashboard/appointments", icon: CalendarDays },
  { label: "Billing", href: "/hospital/dashboard/billing", icon: Receipt },
  { label: "Settings", href: "/hospital/dashboard/settings", icon: Settings },
];

export function HospitalSidebar({ isOpen, onClose }: HospitalSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/hospital/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

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
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] bg-white border-r border-slate-200/80
          flex flex-col h-full
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 shrink-0">
          <Link href="/hospital/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/images/shustota ai logo.png"
              alt="Shustota AI"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">Shustota</span>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full ml-1.5 uppercase tracking-wider">Hospital</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hospital Quick Profile */}
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
              {user?.name?.charAt(0) || "H"}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">
                {user?.name || "Hospital Admin"}
              </h3>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`
                  doctor-sidebar-item flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    active
                      ? "bg-emerald-50 text-emerald-700 active"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  {item.label}
                </div>
                {active && <ChevronRight size={16} className="text-emerald-400" />}
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 shrink-0 space-y-2">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
