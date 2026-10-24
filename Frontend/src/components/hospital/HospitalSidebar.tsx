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

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  sectionTitle: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    sectionTitle: "Operations & Inpatients",
    items: [
      { label: "Overview", href: "/hospital/dashboard", icon: LayoutDashboard },
      { label: "Bed & Inpatient Hub", href: "/hospital/dashboard/beds", icon: BedDouble, badge: "Live" },
      { label: "Bookings & Clearance", href: "/hospital/dashboard/bookings", icon: ClipboardCheck },
      { label: "Inpatient Registry", href: "/hospital/dashboard/patients", icon: UserPlus },
      { label: "Emergency HealthPass", href: "/hospital/dashboard/health-pass", icon: CreditCard },
    ],
  },
  {
    sectionTitle: "Clinical & Patient Care",
    items: [
      { label: "Doctors Roster", href: "/hospital/dashboard/doctors", icon: Users },
      { label: "Appointments", href: "/hospital/dashboard/appointments", icon: CalendarDays },
      { label: "Test Reports", href: "/hospital/dashboard/reports", icon: FileText },
    ],
  },
  {
    sectionTitle: "Finance & Facility",
    items: [
      { label: "Billing & Settlement", href: "/hospital/dashboard/billing", icon: Receipt },
      { label: "Inventory & Pharmacy", href: "/hospital/dashboard/inventory", icon: Package },
      { label: "Hospital Profile", href: "/hospital/dashboard/profile", icon: Store },
    ],
  },
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
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                {group.sectionTitle}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose()}
                    className={`
                      doctor-sidebar-item flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group
                      ${
                        active
                          ? "bg-emerald-50 text-emerald-800 font-bold shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={17}
                        className={`transition-colors shrink-0 ${
                          active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        {item.badge}
                      </span>
                    ) : active ? (
                      <ChevronRight size={14} className="text-emerald-500" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
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
