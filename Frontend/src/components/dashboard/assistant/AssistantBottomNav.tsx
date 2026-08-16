"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserCog, Calendar, ClipboardList, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/assistant", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/assistant/patients", icon: UserCog, label: "Patient Management" },
  { href: "/assistant/appointments", icon: Calendar, label: "Appointments" },
  { href: "/assistant/payments", icon: CreditCard, label: "Payments" },
];

export default function AssistantBottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pt-2 pointer-events-none">
      {/* Ultra Glassmorphism Floating Pill Container */}
      <div className="bg-white/40 backdrop-blur-[24px] border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07)] h-[64px] flex items-center justify-around px-2 rounded-2xl pointer-events-auto relative overflow-hidden">
        {/* Subtle inner light reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative w-[64px] h-[48px] flex items-center justify-center rounded-2xl transition-transform active:scale-95"
              aria-label={item.label}
            >
              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div 
                  layoutId="activeBottomNavDot"
                  className="absolute bottom-1 w-1.5 h-1.5 bg-[#2F80ED] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              
              {/* Icon */}
              <item.icon 
                size={24} 
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? "text-[#2F80ED]" : "text-slate-400"
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
