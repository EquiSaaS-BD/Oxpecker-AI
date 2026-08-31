"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Stethoscope,
  Building2,
  Pill,
  MessageSquare,
  FileText,
  Apple,
  Calendar,
  Bookmark,
  ChevronDown,
  HeartPulse,
  Plus,
  Grid,
  PhoneCall
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useChatHistory } from "@/context/ChatHistoryContext";

export function PatientMegaMenuNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { createNewThread } = useChatHistory();
  const [moreOpen, setMoreOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Directly visible top links on Laptop bar
  const primaryLinks = [
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Doctors", href: "/doctors", icon: Stethoscope },
  ];

  // Items moved inside More dropdown as requested by user
  const moreDropdownItems = [
    {
      label: "Hospitals & Beds",
      href: "/hospitals",
      icon: Building2,
      color: "bg-indigo-100 text-indigo-600",
      desc: "Find hospitals and check live ICU bed status"
    },
    {
      label: "Medicines Guide",
      href: "/medicines",
      icon: Pill,
      color: "bg-blue-100 text-blue-600",
      desc: "Search medicines, alternatives and pricing"
    },
    {
      label: "Nutrition & Diet",
      href: "/nutrition",
      icon: Apple,
      color: "bg-orange-100 text-orange-600",
      desc: "Personalized diet plans and nutrition guide"
    },
    {
      label: "Saved Records",
      href: "/saved",
      icon: Bookmark,
      color: "bg-teal-100 text-teal-600",
      desc: "Access your saved reports and prescriptions"
    },
    {
      label: "Patient Profile",
      href: "/patient/profile",
      icon: HeartPulse,
      color: "bg-amber-100 text-amber-600",
      desc: "Manage your personal health information"
    },
    {
      label: "Emergency Hotline",
      href: "/contact",
      icon: PhoneCall,
      color: "bg-rose-100 text-rose-600",
      desc: "24/7 emergency contact numbers and support"
    },
  ];

  return (
    <header
      ref={navRef}
      className="hidden lg:flex 2xl:hidden sticky top-0 left-0 right-0 h-[72px] glass-panel border-x-0 border-t-0 border-b border-slate-200/50 items-center px-6 z-[60] spatial-shadow-sm justify-between"
    >
      {/* 1. Clickable Logo + New Chat + Primary Links */}
      <div className="flex items-center gap-5">
        
        {/* Clickable Brand Logo */}
        <Link 
          href="/?view=home" 
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
          onClick={() => {
            createNewThread("New Chat");
            router.push("/chat");
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full btn-clay text-xs font-extrabold shrink-0"
          title="Start a New AI Health Chat"
        >
          <Plus size={14} strokeWidth={3} />
          <span>New Chat</span>
        </button>

        {/* Primary Direct Links */}
        <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 shadow-2xs">
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/chat" && pathname.startsWith(link.href));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all shrink-0",
                  isActive
                    ? "bg-white text-sky-700 shadow-xs ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                )}
              >
                <Icon size={14} className={isActive ? "text-sky-600" : "text-slate-500"} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* More Dropdown (Contains Hospitals, Medicines, Nutrition, Saved, Profile, Hotline) */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all shrink-0",
                moreOpen || ["/hospitals", "/medicines", "/nutrition", "/saved", "/patient"].some(path => pathname.startsWith(path))
                  ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              )}
            >
              <Grid size={14} className="text-sky-600" />
              <span>More</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", moreOpen && "rotate-180")} />
            </button>

            {/* Dropdown Panel */}
            {moreOpen && (
              <div className="absolute left-0 top-full mt-2 w-[460px] bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-2">
                  {moreDropdownItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isItemActive = pathname.startsWith(item.href);

                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex items-start gap-3 p-2.5 rounded-2xl transition-all group",
                          isItemActive ? "bg-sky-50 border border-sky-200/60" : "hover:bg-slate-50"
                        )}
                      >
                        <div className={`p-2.5 rounded-xl ${item.color} group-hover:scale-105 transition-transform shrink-0`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {item.label}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
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
          <span className="text-xs font-extrabold text-slate-800 max-w-[120px] truncate">
            {user?.name || "Profile"}
          </span>
        </Link>
      </div>
    </header>
  );
}

export default PatientMegaMenuNavbar;
