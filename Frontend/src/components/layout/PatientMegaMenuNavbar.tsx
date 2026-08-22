"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  Building2,
  Pill,
  MessageSquare,
  FileText,
  Activity,
  Apple,
  Calendar,
  Bookmark,
  ChevronDown,
  User,
  HeartPulse,
  Plus,
  Bell,
  Search,
  ShieldCheck,
  Grid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useChatHistory } from "@/context/ChatHistoryContext";

export function PatientMegaMenuNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { createNewThread } = useChatHistory();
  const [megaOpen, setMegaOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const navLinks = [
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Doctors", href: "/doctors", icon: Stethoscope },
    { label: "Hospitals", href: "/hospitals", icon: Building2 },
    { label: "Medicines", href: "/medicines", icon: Pill },
    { label: "Nutrition", href: "/nutrition", icon: Apple },
    { label: "Saved", href: "/saved", icon: Bookmark },
  ];

  return (
    <header
      ref={navRef}
      className="hidden lg:flex 2xl:hidden sticky top-0 left-0 right-0 h-[72px] bg-white/95 backdrop-blur-xl border-b border-slate-200/80 items-center px-4 xl:px-6 z-[60] shadow-xs justify-between"
    >
      {/* 1. Clickable Logo + New Chat + Navigation Links */}
      <div className="flex items-center gap-3 xl:gap-5">
        
        {/* Clickable Brand Logo (Navigates to Home) */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group hover:opacity-95 transition-opacity shrink-0"
          title="Return to Home"
        >
          <div className="w-8 h-8 relative drop-shadow-sm group-hover:scale-105 transition-transform">
            <Image 
              src="/images/Oxpecker_icon.png" 
              alt="Oxpecker AI" 
              fill 
              sizes="32px" 
              className="object-contain" 
              priority
            />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight leading-none">
            Oxpecker <span className="text-sky-600">AI</span>
          </span>
        </Link>

        {/* New Chat Button */}
        <button
          onClick={() => createNewThread("New Chat")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition-all shadow-xs shrink-0 active:scale-95"
          title="Start a New AI Health Chat"
        >
          <Plus size={14} strokeWidth={3} />
          <span>New Chat</span>
        </button>

        {/* Primary Direct Top Links */}
        <nav className="flex items-center gap-0.5 xl:gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 shadow-2xs">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/chat" && pathname.startsWith(link.href));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all shrink-0",
                  isActive
                    ? "bg-white text-sky-700 shadow-xs ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                )}
              >
                <Icon size={14} className={isActive ? "text-sky-600" : "text-slate-400"} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* More Services Mega Menu Button */}
          <div className="relative">
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold rounded-full transition-all shrink-0",
                megaOpen ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              )}
            >
              <Grid size={14} className="text-sky-600" />
              <span>More</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", megaOpen && "rotate-180")} />
            </button>

            {/* Comprehensive Mega Menu Dropdown */}
            {megaOpen && (
              <div className="absolute right-0 xl:left-0 top-full mt-2 w-[580px] bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Column 1: AI Health & Patient Care */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-sky-600 px-2">
                      এআই ও পেশেন্ট কেয়ার (AI Health)
                    </div>
                    
                    <Link
                      href="/chat"
                      onClick={() => setMegaOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-sky-100 text-sky-600 group-hover:scale-105 transition-transform shrink-0">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          এআই লক্ষণ নির্ণয় (AI Diagnostic Chat)
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          বাংলায় লক্ষণ বলে সাথে সাথে পরামর্শ নিন।
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/reports"
                      onClick={() => setMegaOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:scale-105 transition-transform shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          ল্যাব রিপোর্ট এআই অ্যানালাইজার
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          রক্ত বা টেস্ট রিপোর্টের এআই বিশ্লেষণ।
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/patient/profile"
                      onClick={() => setMegaOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:scale-105 transition-transform shrink-0">
                        <HeartPulse size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          রোগীর হেলথ প্রোফাইল ও ভিটালস
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          রক্তচাপ, সুগার ও মেডিকেল হিস্ট্রি।
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Column 2: Directory & Services */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-emerald-600 px-2">
                      ডিরেক্টরি ও সেবা (Services)
                    </div>

                    <Link
                      href="/doctors"
                      onClick={() => setMegaOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
                        <Stethoscope size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          বিশেষজ্ঞ ডাক্তার সার্চ ও বুকিং
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          ২০+ স্পেশালিটির নিবন্ধিত ডাক্তার।
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/hospitals"
                      onClick={() => setMegaOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 group-hover:scale-105 transition-transform shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          হাসপাতাল বেড ও আইসিইউ ট্র্যাকার
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          লাইভ আইসিইউ ও হাসপাতাল আপডেট।
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/medicines"
                      onClick={() => setMegaOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                        <Pill size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          ওষুধ নির্দেশিকা ও সেবনবিধি
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          ডিজিডিএ নিবন্ধিত ওষুধ ইনডেক্স।
                        </p>
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            )}
          </div>

        </nav>
      </div>

      {/* 2. User Profile Link */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/patient/profile"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200/80"
          title="Patient Profile"
        >
          <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black overflow-hidden relative shrink-0 shadow-xs">
            {user?.image ? (
              <Image src={user.image} alt={user?.name || "Patient"} fill sizes="28px" className="object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'P'
            )}
          </div>
          <span className="text-xs font-extrabold text-slate-800 max-w-[110px] truncate">
            {user?.name || "Profile"}
          </span>
        </Link>
      </div>
    </header>
  );
}

export default PatientMegaMenuNavbar;
