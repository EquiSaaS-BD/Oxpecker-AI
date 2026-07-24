"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ContextPanel } from "@/components/chat/ContextPanel";
import { Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const pathname = usePathname();

  const isSpecialRoute = 
    pathname === "/doctor" || pathname.startsWith("/doctor/") || 
    pathname === "/hospital" || pathname.startsWith("/hospital/") || 
    pathname === "/admin" || pathname.startsWith("/admin/") || 
    pathname === "/assistant" || pathname.startsWith("/assistant/") || 
    pathname === "/patient" || pathname.startsWith("/patient/") ||
    pathname === "/tv-monitor" || pathname.startsWith("/tv-monitor/");

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      
      {/* 1. Left Sidebar (Fixed 280px) */}
      {!isSpecialRoute && (
        <Sidebar 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      )}
      
      {/* 2. Center Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header (Only visible on lg and below) */}
        {!isSpecialRoute && (
          <header className="lg:hidden absolute top-0 left-0 right-0 h-14 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-4 z-[60] shadow-sm">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2.5 font-[900] text-slate-800 text-xl tracking-tight">
              <div className="w-9 h-9 relative drop-shadow-sm">
                <Image src="/images/shustota-icon.png" alt="Shustota AI" fill sizes="36px" className="object-contain" />
              </div>
              Shustota AI
            </div>
            
            {/* Profile Link */}
            <Link 
              href="/settings"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/50 shadow-sm hover:scale-105 transition-transform"
            >
              <span className="truncate">U</span>
            </Link>
          </header>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>

      {/* 3. Right Context Panel (Conditional 360px) */}
      {/* We can pass context panel state down or manage it via global store (Zustand/Context). For now, it's structurally present. */}
      {pathname === "/chat" && contextPanelOpen && (
        <ContextPanel 
          isOpen={contextPanelOpen} 
          onClose={() => setContextPanelOpen(false)}
          title="Context Details"
        >
          <div className="text-sm text-slate-500 text-center mt-10">
            Contextual information (Doctor profiles, Medical Reports, etc.) will appear here.
          </div>
        </ContextPanel>
      )}
      
      {/* 4. Mobile Bottom Navigation (conditional visibility inside component) */}
      {!isSpecialRoute && <MobileBottomNav />}
      
    </div>
  );
}
