"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Menu,
  Check,
  X as XIcon,
  Info,
  LayoutDashboard,
  Users,
  Calendar,
  UserPlus,
  FileText,
  Clock,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";

type MegaMenuType = "operations" | "management" | null;

export default function AssistantTopNav() {
  const { user, updateUser } = useAuth();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<MegaMenuType>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [assignedDoctor, setAssignedDoctor] = useState<{ name: string; location: string } | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const loadData = () => {
      if ((user as any)?.assistantId || user?.email) {
        const invitesStr = localStorage.getItem("oxpecker_invites");
        if (invitesStr) {
          const allInvites = JSON.parse(invitesStr);
          setInvites(
            allInvites.filter(
              (i: any) => (i.assistantId === (user as any)?.assistantId || i.email === user?.email) && i.status === "pending"
            )
          );
        }
      }

      if (user?.id) {
        const notifStr = localStorage.getItem("oxpecker_notifications");
        if (notifStr) {
          const allNotifs = JSON.parse(notifStr);
          setNotifications(allNotifs.filter((n: any) => n.targetId === (user as any).assistantId || n.targetId === user.id));
        }

        if ((user as any).doctorId) {
          const usersStr = localStorage.getItem("oxpecker_users");
          if (usersStr) {
            const users = JSON.parse(usersStr);
            const doc = users.find((u: any) => u.id === (user as any).doctorId);
            if (doc) {
              setAssignedDoctor({
                name: doc.name || "Assigned Doctor",
                location: doc.location || "Central Hospital",
              });
            }
          }
        }
      }
    };

    loadData();
    window.addEventListener("storage", loadData);
    const interval = setInterval(loadData, 1000);
    return () => {
      window.removeEventListener("storage", loadData);
      clearInterval(interval);
    };
  }, [user, showNotifications]);

  const handleAcceptInvite = (inviteId: string) => {
    const invitesStr = localStorage.getItem("oxpecker_invites");
    if (invitesStr) {
      const allInvites = JSON.parse(invitesStr);
      let doctorName = "the doctor";
      let doctorId = "";
      let inviteAssistantId = "";

      const updatedInvites = allInvites.map((i: any) => {
        if (i.id === inviteId) {
          doctorName = i.doctorName || doctorName;
          doctorId = i.doctorId || "";
          inviteAssistantId = i.assistantId || "";
          return { ...i, status: "accepted" };
        }
        return i;
      });

      localStorage.setItem("oxpecker_invites", JSON.stringify(updatedInvites));
      setInvites(
        updatedInvites.filter(
          (i: any) => (i.assistantId === (user as any)?.assistantId || i.email === user?.email) && i.status === "pending"
        )
      );

      if (doctorId && user) {
        const usersStr = localStorage.getItem("oxpecker_users");
        if (usersStr) {
          const users = JSON.parse(usersStr);
          const uIdx = users.findIndex((u: any) => u.id === user.id);
          if (uIdx !== -1) {
            users[uIdx].doctorId = doctorId;
            localStorage.setItem("oxpecker_users", JSON.stringify(users));
          }
        }
        updateUser({ ...user, doctorId });
      }

      toast.success(`Invite accepted! You are now connected to ${doctorName}.`);
    }
  };

  const totalNotifs = invites.length + notifications.length;

  return (
    <header
      ref={navRef}
      className="h-[76px] bg-white/90 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-40 shadow-xs"
    >
      <Toaster position="top-center" />

      {/* Left side: Doctor Profile & Desktop Mega Menu Navbar */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setShowMobileMenu(true)}
          aria-label="Toggle menu"
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden lg:flex flex-col">
          <h2 className="text-xs font-extrabold text-slate-900">
            {assignedDoctor ? assignedDoctor.name : "Chamber Assistant"}
          </h2>
          <span className="text-[10px] font-semibold text-slate-500">
            {assignedDoctor ? `Chamber: ${assignedDoctor.location}` : "Awaiting Doctor Invite"}
          </span>
        </div>

        {/* Desktop Mega Menu Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60 shadow-2xs">
          
          {/* Operations Mega Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "operations" ? null : "operations")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all",
                openMenu === "operations" ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <span>Queue & Operations</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", openMenu === "operations" && "rotate-180")} />
            </button>

            {openMenu === "operations" && (
              <div className="absolute left-0 top-full mt-2 w-[400px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href="/assistant/walk-in"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sky-50/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
                      <UserPlus size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Walk-in Patient Registration</div>
                      <div className="text-[11px] text-slate-500 font-medium">Issue serial passes for new walk-in patients</div>
                    </div>
                  </Link>

                  <Link
                    href="/assistant/appointments"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Today's Appointment Queue</div>
                      <div className="text-[11px] text-slate-500 font-medium">View and call serial numbers for current chamber shift</div>
                    </div>
                  </Link>

                  <Link
                    href="/assistant/payments"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Fee & Payment Collection</div>
                      <div className="text-[11px] text-slate-500 font-medium">Record doctor visit fees, discounts, and receipts</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Management Mega Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "management" ? null : "management")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all",
                openMenu === "management" ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <span>Shift & Reports</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", openMenu === "management" && "rotate-180")} />
            </button>

            {openMenu === "management" && (
              <div className="absolute left-0 top-full mt-2 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href="/assistant/schedule"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Doctor Shift Schedule</div>
                      <div className="text-[11px] text-slate-500 font-medium">View visiting hours and doctor availability</div>
                    </div>
                  </Link>

                  <Link
                    href="/assistant/reports"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                      <BarChart3 size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Daily Patient Analytics</div>
                      <div className="text-[11px] text-slate-500 font-medium">Summary of daily patient count and total collections</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </nav>
      </div>

      {/* Right side: Search, Notifications & Assistant Profile Avatar */}
      <div className="flex items-center justify-end gap-3 sm:gap-4">
        {/* Desktop Search Bar */}
        <div className="hidden lg:flex items-center relative w-56">
          <Search size={15} className="absolute left-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search patient, serial..."
            className="w-full h-9 pl-9 pr-3 bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 font-medium transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell size={20} />
            {totalNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[120%] w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
              >
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-xs text-slate-900">Notifications</h3>
                  {totalNotifs > 0 && (
                    <span className="bg-sky-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {totalNotifs} New
                    </span>
                  )}
                </div>

                <div className="max-h-[340px] overflow-y-auto candy-scrollbar">
                  {totalNotifs === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 font-medium">No new notifications</div>
                  ) : (
                    <div className="flex flex-col">
                      {invites.map((invite) => (
                        <div key={invite.id} className="p-3.5 border-b border-slate-100 hover:bg-slate-50">
                          <div className="text-xs font-bold text-slate-900">Clinic Invitation</div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            Dr. Sarah Rahman invited you to join as <strong>{invite.role}</strong>.
                          </div>
                          <div className="flex gap-2 mt-2.5">
                            <button
                              onClick={() => handleAcceptInvite(invite.id)}
                              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold py-1 rounded-lg"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar */}
        <Link href="/assistant/settings" className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 relative bg-slate-100 shadow-xs shrink-0">
            <Image src={user?.image || "/images/signup-doctor.png"} alt="Assistant Profile" fill className="object-cover" />
          </div>
        </Link>
      </div>
    </header>
  );
}
