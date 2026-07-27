"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileBarChart, ClipboardList, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function DoctorMobileBottomNav() {
  const pathname = usePathname();

  // Show only on doctor dashboard routes
  if (!pathname.startsWith("/doctor/dashboard")) {
    return null;
  }


  const tabs = [
    { href: "/doctor/dashboard", icon: LayoutDashboard },
    { href: "/doctor/dashboard/patients", icon: Users },
    { href: "/doctor/dashboard/reports", icon: FileBarChart },
    { href: "/doctor/dashboard/prescription", icon: ClipboardList },
    { href: "/doctor/dashboard/messages", icon: MessageSquare },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 pointer-events-none">
      <div className="h-[60px] bg-white/40 backdrop-blur-xl border border-white/40 shadow-lg rounded-xl px-8 flex items-center justify-between pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = tab.href === "/doctor/dashboard" 
            ? pathname === tab.href 
            : pathname.startsWith(tab.href);
          
          const Icon = tab.icon;
          
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className="flex items-center justify-center transition-all h-full"
            >
              <div className={cn(
                "flex items-center justify-center transition-all",
                isActive ? "text-[#2F80ED] scale-125 drop-shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}>
                <Icon size={24} className={isActive ? "stroke-[2.5]" : "stroke-[2]"} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
