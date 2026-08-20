"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, Calendar, UserPlus, FileText, 
  Clock, CreditCard, Bell, BarChart3, Settings
} from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { name: "Dashboard", href: "/assistant", icon: LayoutDashboard },
  { name: "Patient Management", href: "/assistant/patients", icon: FileText },
  { name: "Appointments", href: "/assistant/appointments", icon: Calendar },
  { name: "Walk-in Patients", href: "/assistant/walk-in", icon: UserPlus },
  { name: "Doctor Schedule", href: "/assistant/schedule", icon: Clock },
  { name: "Prescription Queue", href: "/assistant/prescriptions", icon: FileText },
  { name: "Payments", href: "/assistant/payments", icon: CreditCard },
  { name: "Notifications", href: "/assistant/notifications", icon: Bell },
  { name: "Reports", href: "/assistant/reports", icon: BarChart3 },
];

export default function AssistantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[88px] xl:w-[280px] h-screen bg-slate-50 border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0 sticky top-0 left-0 overflow-hidden z-50 transition-all duration-300">
      <div className="h-16 flex items-center justify-center xl:justify-start xl:px-6 border-b border-slate-200 shrink-0 bg-white">
        <Link href="/">
          {/* Mobile/Tablet Logo (Icon only) */}
          <div className="relative w-8 h-8 xl:hidden">
            <Image src="/images/Oxpecker_icon.png" alt="Oxpecker Icon" fill className="object-contain" />
          </div>
          {/* Desktop Logo (Full) */}
          <div className="hidden xl:flex items-center gap-2">
            <Image 
              src="/images/Oxpecker_Full.png" 
              alt="Oxpecker AI" 
              width={140} 
              height={36} 
              className="object-contain" 
            />
          </div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-3 xl:px-4 flex flex-col gap-2 overflow-x-hidden bg-slate-50">
        <div className="px-2 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider hidden xl:block">
          Assistant Portal
        </div>
        <div className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isNotification = item.name === "Notifications";
            const unreadCount = 3;

            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`relative flex items-center justify-center xl:justify-start h-12 xl:px-4 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "text-sky-700" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title={item.name}
              >
                {isActive && (
                  <motion.div 
                    layoutId="assistant-active-nav"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                
                <div className="flex items-center gap-3 relative z-10 w-full">
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`shrink-0 ${isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span className="text-sm font-semibold hidden xl:block whitespace-nowrap flex-1">{item.name}</span>
                  
                  {/* Notification Badge - Desktop */}
                  {isNotification && (
                    <span className={`hidden xl:flex px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ${isActive ? "bg-sky-100 text-sky-700" : "bg-rose-100 text-rose-600"}`}>
                      {unreadCount} New
                    </span>
                  )}
                </div>
                
                {/* Notification Dot - Tablet */}
                {isNotification && (
                  <span className="xl:hidden absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-50"></span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 shrink-0 bg-white">
        <Link href="/assistant/settings" className="relative flex items-center justify-center xl:justify-start gap-3 h-12 xl:px-4 w-full rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold group" title="Settings">
          <Settings size={20} className="text-slate-400 group-hover:text-slate-600 shrink-0" />
          <span className="text-sm hidden xl:block whitespace-nowrap">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
