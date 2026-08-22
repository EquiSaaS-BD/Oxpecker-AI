"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ContextPanel } from "@/components/chat/ContextPanel";
import { Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ChatHistoryProvider } from "@/context/ChatHistoryContext";

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
    pathname === "/tv-monitor" || pathname.startsWith("/tv-monitor/");

  return (
    <AuthGuard>
    <ChatHistoryProvider>
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      
      {/* 1. Left Sidebar (Hidden < 2xl, visible >= 2xl) */}
      {!isSpecialRoute && (
        <Sidebar 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      )}
      
      {/* 2. Center Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile & Tablet Header (Visible < lg) */}
        {!isSpecialRoute && (
          <header className="lg:hidden absolute top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 z-[60] shadow-sm">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 font-[900] text-slate-800 text-lg tracking-tight">
              <div className="w-8 h-8 relative drop-shadow-sm">
                <Image src="/images/Oxpecker_icon.png" alt="Oxpecker AI" fill sizes="32px" className="object-contain" />
              </div>
              Oxpecker AI
            </div>
            
            {/* Profile Link */}
            <Link 
              href="/settings"
              className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform"
            >
              <span className="truncate">U</span>
            </Link>
          </header>
        )}

        {/* Laptop Horizontal Header (Visible lg to 2xl) */}
        {!isSpecialRoute && (
          <header className="hidden lg:flex 2xl:hidden absolute top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 items-center px-6 z-[60] shadow-sm justify-between">
             <div className="flex items-center gap-6">
               <div className="flex items-center gap-2.5 font-[900] text-slate-900 text-xl tracking-tight mr-4">
                 <div className="w-9 h-9 relative drop-shadow-sm">
                   <Image src="/images/Oxpecker_icon.png" alt="Oxpecker AI" fill sizes="36px" className="object-contain" />
                 </div>
                 Oxpecker AI
               </div>
               
               {/* Horizontal Navigation Links */}
               <nav className="flex items-center gap-1">
                 {[
                    { label: "Chat", href: "/chat" },
                    { label: "Doctors", href: "/doctors" },
                    { label: "Hospitals", href: "/hospitals" },
                    { label: "Medicines", href: "/medicines" },
                    { label: "Saved", href: "/saved" },
                 ].map(item => (
                   <Link key={item.href} href={item.href} className="px-3 py-2 text-sm font-bold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                     {item.label}
                   </Link>
                 ))}
               </nav>
             </div>
             
             <div className="flex items-center gap-4">
                <Link href="/settings" className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold shadow-sm hover:scale-105 transition-transform">
                  U
                </Link>
             </div>
          </header>
        )}

        {/* Dynamic Page Content */}
        {/* pt-14 for mobile header, pt-16 for laptop header. 2xl has no top header so pt-0 */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar relative ${!isSpecialRoute ? 'pt-14 lg:pt-16 2xl:pt-0 pb-16 md:pb-0' : ''}`}>
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
    </ChatHistoryProvider>
    </AuthGuard>
  );
}
