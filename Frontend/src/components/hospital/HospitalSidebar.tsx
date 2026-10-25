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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface HospitalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
    sectionTitle: "Inpatient & Wards (IPD)",
    items: [
      { label: "Overview", href: "/hospital/dashboard", icon: LayoutDashboard },
      { label: "Bed & Inpatient Hub", href: "/hospital/dashboard/beds", icon: BedDouble, badge: "Live" },
      { label: "Bookings & Clearance", href: "/hospital/dashboard/bookings", icon: ClipboardCheck },
      { label: "Inpatient Registry", href: "/hospital/dashboard/patients", icon: UserPlus },
      { label: "Emergency HealthPass", href: "/hospital/dashboard/health-pass", icon: CreditCard },
    ],
  },
  {
    sectionTitle: "Outpatient & Doctors (OPD)",
    items: [
      { label: "Appointments", href: "/hospital/dashboard/appointments", icon: CalendarDays },
      { label: "Doctors Roster", href: "/hospital/dashboard/doctors", icon: Users },
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

export function HospitalSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: HospitalSidebarProps) {
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
          h-full bg-white border-r border-slate-200/80
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-[76px]" : "lg:w-[260px]"}
          w-[260px]
        `}
      >
        {/* Top Logo & Collapse Toggle Section */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <Link href="/?view=home" className="flex items-center gap-2" title="Back to Home">
                <Image
                  src="/images/Oxpecker_full_size.png"
                  alt="Oxpecker AI"
                  width={140}
                  height={42}
                  className="h-7 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="flex items-center gap-1">
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    title="Collapse sidebar"
                    className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronsLeft size={17} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="lg:hidden p-1.5 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Expand sidebar"
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
              >
                <ChevronsRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation List */}
        <div
          className={`flex-1 overflow-y-auto py-3 space-y-4 custom-scrollbar ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  {group.sectionTitle}
                </div>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      onClick={() => onClose()}
                      className={`
                        flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer
                        ${
                          isCollapsed
                            ? "justify-center w-11 h-11 mx-auto"
                            : "justify-between px-3 py-2.5"
                        }
                        ${
                          active
                            ? "bg-emerald-50 text-emerald-800 font-bold shadow-2xs border border-emerald-200/60"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={18}
                          className={`shrink-0 transition-colors ${
                            active
                              ? "text-emerald-600"
                              : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate font-semibold text-xs text-slate-800 group-hover:text-slate-900">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div>
                          {item.badge ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                              {item.badge}
                            </span>
                          ) : active ? (
                            <ChevronRight size={14} className="text-emerald-500" />
                          ) : null}
                        </div>
                      )}
                    </Link>

                    {/* Collapsed Mode Floating Tooltip */}
                    {isCollapsed && (
                      <div className="hidden lg:flex invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 pointer-events-none transition-all duration-150">
                        <div className="bg-slate-900 text-white rounded-xl py-1.5 px-3 shadow-xl whitespace-nowrap border border-slate-700 text-xs font-bold flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500 text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* FIXED BOTTOM SECTION: Settings and Logout together */}
        <div
          className={`p-2.5 border-t border-slate-100 bg-white shrink-0 space-y-1 ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          {/* Settings Link */}
          <div className="relative group">
            <Link
              href="/hospital/dashboard/settings"
              onClick={() => onClose()}
              className={`
                flex items-center rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                  isCollapsed
                    ? "justify-center w-11 h-11 mx-auto"
                    : "justify-between px-3 py-2.5"
                }
                ${
                  isActive("/hospital/dashboard/settings")
                    ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <Settings
                  size={18}
                  className={`transition-colors shrink-0 ${
                    isActive("/hospital/dashboard/settings")
                      ? "text-emerald-600"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
                {!isCollapsed && <span className="text-xs font-semibold">Settings</span>}
              </div>
              {!isCollapsed && isActive("/hospital/dashboard/settings") && (
                <ChevronRight size={14} className="text-emerald-500" />
              )}
            </Link>

            {isCollapsed && (
              <div className="hidden lg:flex invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 pointer-events-none transition-all duration-150">
                <div className="bg-slate-900 text-white rounded-xl py-1 px-2.5 shadow-xl text-xs font-bold whitespace-nowrap border border-slate-700">
                  Settings
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className={`
                w-full flex items-center rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer
                ${
                  isCollapsed
                    ? "justify-center w-11 h-11 mx-auto"
                    : "gap-2.5 px-3 py-2 text-xs font-semibold"
                }
              `}
            >
              <LogOut size={18} className="text-rose-500 group-hover:text-rose-700 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>

            {isCollapsed && (
              <div className="hidden lg:flex invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 pointer-events-none transition-all duration-150">
                <div className="bg-rose-950 text-rose-100 rounded-xl py-1 px-2.5 shadow-xl text-xs font-bold whitespace-nowrap border border-rose-800">
                  Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
