"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Plus, MessageSquare, History, Settings, User, MoreHorizontal, LogOut, Stethoscope, Building2, Pill, Apple, FileText, Calendar, Bookmark, Cpu, BarChart3, ScrollText, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useChatHistory } from "@/context/ChatHistoryContext";
import { useMemo } from "react";

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


  const { threads, activeThreadId, switchThread, deleteThread, createNewThread } = useChatHistory();

  // Group threads by date
  const groupedThreads = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const groups = [
      { group: "Today", chats: [] as typeof threads },
      { group: "Yesterday", chats: [] as typeof threads },
      { group: "Previous 7 Days", chats: [] as typeof threads },
      { group: "Older", chats: [] as typeof threads }
    ];

    threads.forEach(t => {
      const date = new Date(t.updatedAt);
      if (date >= today) groups[0].chats.push(t);
      else if (date >= yesterday) groups[1].chats.push(t);
      else if (date >= last7Days) groups[2].chats.push(t);
      else groups[3].chats.push(t);
    });

    return groups.filter(g => g.chats.length > 0);
  }, [threads]);

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

          <button 
            onClick={() => createNewThread("New Chat")}
            className="flex items-center justify-between w-full h-12 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors group"
          >
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

          {/* Admin Section REMOVED for patient UI as requested by user */}
          
          {/* Chat History */}
          <div className="px-2">
            {groupedThreads.map((group, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="text-xs font-semibold text-slate-400 mb-2 px-1">{group.group}</h3>
                <div className="space-y-0.5">
                  {group.chats.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => switchThread(chat.id)}
                      className={`group flex items-center justify-between h-10 px-2 rounded-lg cursor-pointer text-sm transition-colors ${
                        activeThreadId === chat.id 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      <span className="truncate pr-2">{chat.title}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteThread(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 rounded-md hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
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
