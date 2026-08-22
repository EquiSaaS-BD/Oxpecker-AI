"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ContextPanel } from "@/components/chat/ContextPanel";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { PatientMegaMenuNavbar } from "@/components/layout/PatientMegaMenuNavbar";
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
  const { user } = useAuth();

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
                
                {/* Clickable Logo */}
                <Link href="/" className="flex items-center gap-2 font-[900] text-slate-800 text-lg tracking-tight hover:opacity-90 transition-opacity">
                  <div className="w-8 h-8 relative drop-shadow-sm">
                    <Image src="/images/Oxpecker_icon.png" alt="Oxpecker AI" fill sizes="32px" className="object-contain" />
                  </div>
                  Oxpecker AI
                </Link>
                
                {/* Profile Link */}
                <Link 
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black overflow-hidden border border-slate-200 shadow-xs hover:scale-105 transition-transform relative shrink-0"
                  title={user?.name || "User Profile"}
                >
                  {user?.image ? (
                    <Image src={user.image} alt={user?.name || "User"} fill sizes="32px" className="object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </Link>
              </header>
            )}

            {/* Laptop Horizontal Mega Menu Header (Visible lg to 2xl) */}
            {!isSpecialRoute && <PatientMegaMenuNavbar />}

            {/* Dynamic Page Content */}
            <main className={`flex-1 overflow-y-auto custom-scrollbar relative ${!isSpecialRoute ? 'pt-14 lg:pt-0 2xl:pt-0 pb-16 md:pb-0' : ''}`}>
              {children}
            </main>
          </div>

          {/* Right Context Panel (Conditional 360px) */}
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
          
          {/* Mobile Bottom Navigation */}
          {!isSpecialRoute && <MobileBottomNav />}
          
        </div>
      </ChatHistoryProvider>
    </AuthGuard>
  );
}
