"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { 
  Menu, X, MessageSquare, Stethoscope, Building2, Pill, 
  Apple, FileText, CalendarDays, Bookmark, User, Settings, 
  Activity, ShieldCheck, HeartPulse, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AwwwardsNavLink {
  label: string;
  href: string;
  icon?: any;
  badge?: string;
}

export interface AwwwardsNavColumn {
  title: string;
  links: AwwwardsNavLink[];
}

export interface AwwwardsNavProps {
  items?: AwwwardsNavLink[];
  columns?: AwwwardsNavColumn[];
  moreLabel?: string;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const DEFAULT_ITEMS: AwwwardsNavLink[] = [
  { label: "AI Chat", href: "/chat", icon: MessageSquare },
  { label: "Rx Builder", href: "/doctor/dashboard/prescription/new", icon: FileText, badge: "Rx" },
  { label: "Doctors", href: "/doctors", icon: Stethoscope },
  { label: "Patients", href: "/doctor/dashboard/patients", icon: User },
];

const DEFAULT_COLUMNS: AwwwardsNavColumn[] = [
  {
    title: "AI & Rx Tools",
    links: [
      { label: "60s Rx Prescription Builder", href: "/doctor/dashboard/prescription/new", icon: FileText, badge: "Rx" },
      { label: "AI Diagnostic Chat", href: "/chat", icon: MessageSquare, badge: "Live" },
      { label: "Prescription Scan", href: "/chat?mode=prescription", icon: FileText },
      { label: "Lab Report Analyzer", href: "/chat?mode=report", icon: Activity },
    ],
  },
  {
    title: "Directory",
    links: [
      { label: "Doctor Dashboard", href: "/doctor/dashboard", icon: Stethoscope },
      { label: "Find Specialist Doctor", href: "/doctors", icon: Stethoscope },
      { label: "Hospital Bed Tracker", href: "/hospitals", icon: Building2 },
      { label: "Medicine Directory", href: "/medicines", icon: Pill },
    ],
  },
  {
    title: "Patient & Chamber",
    links: [
      { label: "Appointments Queue", href: "/doctor/dashboard/appointments", icon: CalendarDays },
      { label: "Patient Records", href: "/doctor/dashboard/patients", icon: User },
      { label: "Chamber Settings", href: "/doctor/settings/chambers", icon: Settings },
      { label: "Health Profile", href: "/profile", icon: User },
    ],
  },
];

const COLLAPSED_HEIGHT = 64;
const EXPANDED_HEIGHT = 380;

export function AwwwardsNav({
  items = DEFAULT_ITEMS,
  columns = DEFAULT_COLUMNS,
  moreLabel = "More Services",
  onOpenChange,
  className,
}: AwwwardsNavProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const navTopRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const navHomeRef = useRef<HTMLDivElement>(null);

  const openRef = useRef(false);
  const animatingRef = useRef(false);
  const [showClose, setShowClose] = useState(false);

  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  // Establish collapsed baseline
  useEffect(() => {
    const nav = navRef.current;
    const navTop = navTopRef.current;
    const navItems = navItemsRef.current;
    const navHome = navHomeRef.current;
    if (!nav || !navTop || !navItems || !navHome) return;

    gsap.set(nav, { height: COLLAPSED_HEIGHT });
    gsap.set(navTop, { opacity: 0, scale: 0.96, display: "none" });
    gsap.set(navItems, { opacity: 1, display: "flex" });
    gsap.set(navHome, { flexGrow: 0 });

    return () => {
      gsap.killTweensOf([nav, navTop, navItems, navHome]);
    };
  }, []);

  const toggle = () => {
    const nav = navRef.current;
    const navTop = navTopRef.current;
    const navItems = navItemsRef.current;
    const navHome = navHomeRef.current;
    if (!nav || !navTop || !navItems || !navHome || animatingRef.current) return;

    animatingRef.current = true;
    const opening = !openRef.current;
    openRef.current = opening;
    onOpenChangeRef.current?.(opening);

    if (opening) {
      gsap.to(nav, { height: EXPANDED_HEIGHT, duration: 0.6, ease: "power4.inOut" });
      gsap.to(navItems, {
        opacity: 0,
        duration: 0.1,
        onComplete: () => gsap.set(navItems, { display: "none" }),
      });
      gsap.to(navHome, {
        flexGrow: 1,
        duration: 0.25,
        ease: "power4.inOut",
        onComplete: () => setShowClose(true),
      });
      gsap.to(navTop, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        delay: 0.3,
        onStart: () => gsap.set(navTop, { display: "block" }),
        onComplete: () => {
          animatingRef.current = false;
        },
      });
    } else {
      gsap.to(nav, { height: COLLAPSED_HEIGHT, duration: 0.6, ease: "power4.inOut", delay: 0.15 });
      gsap.to(navTop, {
        opacity: 0,
        scale: 0.96,
        duration: 0.2,
        onComplete: () => gsap.set(navTop, { display: "none" }),
      });
      gsap.to(navHome, {
        flexGrow: 0,
        duration: 0.2,
        ease: "power4.inOut",
        onComplete: () => setShowClose(false),
      });
      gsap.to(navItems, {
        opacity: 1,
        duration: 0.25,
        delay: 0.4,
        onStart: () => gsap.set(navItems, { display: "flex" }),
        onComplete: () => {
          animatingRef.current = false;
        },
      });
    }
  };

  const handleLinkClick = () => {
    if (openRef.current) {
      toggle();
    }
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed bottom-4 left-1/2 z-[100] -translate-x-1/2",
        "h-[64px] w-[min(680px,94vw)] overflow-hidden rounded-2xl border backdrop-blur-2xl transition-shadow",
        "border-white/80 bg-white/85 text-slate-800 shadow-[0_20px_50px_rgba(0,61,155,0.15)]",
        className
      )}
    >
      {/* Expanded mega-menu panel */}
      <div ref={navTopRef} className="absolute inset-x-0 top-0 bottom-[64px] hidden p-3 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col sm:flex-row h-full w-full gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
          {columns.map((col, ci) => (
            <div
              key={col.title}
              className={cn(
                "flex flex-1 flex-col gap-1.5",
                ci > 0 && "sm:border-l sm:border-dashed sm:border-slate-200 sm:pl-4 pt-3 sm:pt-0 border-t border-slate-100 sm:border-t-0"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                <p className="text-[12px] font-extrabold uppercase tracking-wider text-slate-500">{col.title}</p>
              </div>
              {col.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "group flex items-center justify-between py-2 px-2.5 rounded-lg text-[13px] font-semibold transition-all",
                      isActive 
                        ? "bg-sky-600/10 text-sky-600 font-bold" 
                        : "text-slate-700 hover:bg-slate-200/60 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon size={15} className={isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"} />}
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] font-extrabold bg-sky-600 text-white px-2 py-0.5 rounded-full uppercase">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Collapsed bottom row */}
      <div className="absolute inset-x-0 bottom-0 flex h-[64px] gap-1.5 p-2">
        <div
          ref={navHomeRef}
          role="button"
          tabIndex={0}
          aria-expanded={showClose}
          aria-label={showClose ? "Close menu" : "Open menu"}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          className={cn(
            "flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-xl border px-4 text-[13px] font-bold transition-all",
            "border-slate-200 bg-slate-100/90 text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200",
            showClose && "bg-sky-600 text-white border-sky-600 hover:bg-sky-700 hover:text-white"
          )}
        >
          {showClose ? (
            <X className="h-4 w-4 stroke-[2.5]" />
          ) : (
            <Menu className="h-4 w-4 stroke-[2.5]" />
          )}
          <span>{moreLabel}</span>
        </div>

        <div ref={navItemsRef} className="flex min-w-0 flex-[4] items-center gap-1.5 overflow-x-auto scrollbar-none">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href) && item.href !== "/" || (item.href === "/" && pathname === "/");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex h-full flex-1 min-w-[70px] items-center justify-center gap-1.5 rounded-xl border px-2 text-center text-[13px] font-bold transition-all shrink-0",
                  isActive
                    ? "border-sky-600/30 bg-sky-600/10 text-sky-600 shadow-sm"
                    : "border-slate-200/80 bg-white/70 text-slate-600 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50"
                )}
              >
                {Icon && <Icon size={16} className={isActive ? "text-sky-600" : "text-slate-400"} />}
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default AwwwardsNav;
