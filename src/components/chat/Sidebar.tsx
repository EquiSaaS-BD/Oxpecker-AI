"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Plus, MessageSquare, History, Settings, User, MoreHorizontal, LogOut, Stethoscope, Building2, Pill, Apple, FileText, Calendar, Bookmark, Cpu, BarChart3, ScrollText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: Stethoscope, label: "Doctors", href: "/doctors" },
    { icon: Building2, label: "Hospitals", href: "/hospitals" },
    { icon: Pill, label: "Medicines", href: "/medicines" },
    { icon: Apple, label: "Nutrition", href: "/nutrition" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Calendar, label: "Appointments", href: "/appointments" },
    { icon: Bookmark, label: "Saved", href: "/saved" },
  ];

  const adminItems = [
    { icon: Cpu, label: "AI Providers", href: "/admin/ai-providers" },
    { icon: BarChart3, label: "AI Analytics", href: "/admin/ai-analytics" },
    { icon: ScrollText, label: "Audit Logs", href: "/admin/ai-logs" },
  ];

  const chatHistory = [
    { group: "Today", chats: ["Viral fever symptoms", "Dr. Rahman Appointment"] },
    { group: "Yesterday", chats: ["Napa Extend dosage", "Diet plan for diabetes"] },
    { group: "Last 7 Days", chats: ["Blood test report analysis", "Cardiologist near me"] },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] h-screen bg-white border-r border-slate-100
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Top Header */}
        <div className="p-4 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <Image src="/images/shustota-icon.png" alt="Shustota AI" fill sizes="40px" className="object-contain" />
            </div>
            <span className="font-[800] text-[20px] text-slate-900 tracking-tight">Shustota</span>
          </Link>

          <button className="flex items-center justify-between w-full h-12 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors group">
            <div className="flex items-center gap-2 font-medium">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Plus size={14} />
              </div>
              New Chat
            </div>
            <Search size={16} className="text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          {/* Main Navigation */}
          <div className="space-y-0.5 mb-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 w-full h-12 px-3 rounded-lg text-[15px] transition-colors
                    ${isActive 
                      ? "bg-primary/5 font-semibold text-primary" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}
                  `}
                >
                  <item.icon size={20} className={isActive ? "text-primary" : "text-slate-400"} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          <div className="space-y-0.5 mb-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Admin</p>
            {adminItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 w-full h-12 px-3 rounded-lg text-[15px] transition-colors
                    ${isActive 
                      ? "bg-primary/5 font-semibold text-primary" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}
                  `}
                >
                  <item.icon size={20} className={isActive ? "text-primary" : "text-slate-400"} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Chat History */}
          <div className="px-2">
            {chatHistory.map((group, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="text-xs font-semibold text-slate-400 mb-2 px-1">{group.group}</h3>
                <div className="space-y-0.5">
                  {group.chats.map((chat, cIdx) => (
                    <div 
                      key={cIdx}
                      className="group flex items-center justify-between h-10 px-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-500 transition-colors"
                    >
                      <span className="truncate pr-2">{chat}</span>
                      <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions (Sticky) */}
        <div className="p-3 space-y-0.5 bg-white border-t border-slate-100">
          {user ? (
            <Link href="/settings" className="flex items-center gap-3 w-full h-11 px-3 rounded-lg hover:bg-slate-50 text-slate-700 text-[14px] font-medium transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-bold overflow-hidden relative shrink-0">
                {user?.image ? (
                  <Image src={user.image} alt={user?.name || "User"} fill className="object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="truncate">{user?.name || 'User'}</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[14px] font-bold transition-colors">
              <LogOut size={16} className="rotate-180" /> 
              Log In
            </Link>
          )}
          
          <Link href="/settings" className="flex items-center gap-3 w-full h-11 px-3 rounded-lg hover:bg-slate-50 text-slate-600 text-[14px] font-medium transition-colors">
            <Settings size={18} className="text-slate-500" /> Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
