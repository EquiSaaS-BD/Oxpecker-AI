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
  Store,
  ClipboardCheck,
  UserPlus,
  FileText,
  Package,
  CreditCard,
} from "lucide-react";

interface HospitalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Overview", href: "/hospital/dashboard", icon: LayoutDashboard },
  { label: "Emergency HealthPass", href: "/hospital/dashboard/health-pass", icon: CreditCard },
  { label: "Profile & Gigs", href: "/hospital/dashboard/profile", icon: Store },
  { label: "Bed Management", href: "/hospital/dashboard/beds", icon: BedDouble },
  { label: "Booking Management", href: "/hospital/dashboard/bookings", icon: ClipboardCheck },
  { label: "Doctors Roster", href: "/hospital/dashboard/doctors", icon: Users },
  { label: "Appointments", href: "/hospital/dashboard/appointments", icon: CalendarDays },
  { label: "Patients & Admissions", href: "/hospital/dashboard/patients", icon: UserPlus },
  { label: "Billing & Finances", href: "/hospital/dashboard/billing", icon: Receipt },
  { label: "Test Reports", href: "/hospital/dashboard/reports", icon: FileText },
  { label: "Inventory", href: "/hospital/dashboard/inventory", icon: Package },
];

export function HospitalSidebar({ isOpen, onClose }: HospitalSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/hospital/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-full w-[280px] bg-white border-r border-slate-200/80
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top Logo Section (Matches Navbar Exactly) */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 shrink-0">
          <Link href="/?view=home" className="flex items-center" title="Back to Home">
            <Image
              src="/images/Oxpecker_full_size.png"
              alt="Oxpecker AI"
              width={165}
              height={50}
              className="h-8.5 w-auto object-contain"
              priority
            />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
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
                      ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight size={16} className="text-emerald-500" />}
              </Link>
            );
          })}
        </div>

        {/* FIXED BOTTOM SECTION: Settings and Logout together */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0 space-y-1">
          {/* Settings Link */}
          <Link
            href="/hospital/dashboard/settings"
            onClick={() => onClose()}
            className={`
              flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${
                isActive("/hospital/dashboard/settings")
                  ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Settings
                size={18}
                className={`transition-colors ${
                  isActive("/hospital/dashboard/settings") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700"
                }`}
              />
              <span>Settings</span>
            </div>
            {isActive("/hospital/dashboard/settings") && <ChevronRight size={16} className="text-emerald-500" />}
          </Link>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group"
          >
            <LogOut size={18} className="text-rose-500 group-hover:text-rose-700" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
