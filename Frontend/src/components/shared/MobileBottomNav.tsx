"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Stethoscope, Hospital, FileText, CalendarDays, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on chat route where the AI chat interface is active
  if (pathname === "/chat") {
    return null;
  }

  const tabs = [
    { name: "Home", href: "/", icon: MessageSquare },
    { name: "Doctor", href: "/doctors", icon: Stethoscope },
    { name: "Hospital", href: "/hospitals", icon: Hospital },
    { name: "Medi", href: "/medicines", icon: Pill },
    { name: "Booking", href: "/appointments", icon: CalendarDays },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pt-2 pointer-events-none">
      <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-lg px-6 py-3 flex items-center justify-between pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href) && tab.href !== "/" || (tab.href === "/" && (pathname === "/" || pathname === "/chat"));
          const Icon = tab.icon;
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1.5 transition-all rounded-md",
                isActive ? "text-primary bg-primary/10 scale-105 shadow-sm shadow-primary/5" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
              )}
            >
              <Icon size={20} className={isActive ? "fill-primary/20" : ""} />
              <span className={cn(
                "text-[10px] font-bold tracking-wide transition-all",
                isActive ? "text-primary" : "text-slate-400"
              )}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
