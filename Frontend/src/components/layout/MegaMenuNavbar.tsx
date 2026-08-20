"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  Pill,
  Building2,
  ChevronDown,
  FileText,
  Menu,
  MessageSquare,
  MoveRight,
  ShieldCheck,
    Users,
  X,
  Apple,
  Briefcase,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export interface MegaMenuItem {
  title: string;
  description?: string;
  href: string;
  icon?: LucideIcon;
  iconClassName?: string;
  badge?: string;
}

export interface MegaMenuResourceGroup {
  title: string;
  links: MegaMenuItem[];
}

export interface MegaMenuNavbarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  className?: string;
}

type DesktopMenu = "services" | "use-cases" | "resources" | null;
type MobileSection = Exclude<DesktopMenu, null>;

export function MegaMenuNavbar({
  className,
  ...props
}: MegaMenuNavbarProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = React.useState<DesktopMenu>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileSection, setMobileSection] = React.useState<MobileSection | null>(null);
  const [activeSection, setActiveSection] = React.useState("");
  const navRef = React.useRef<HTMLElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Mega Menu Data tailored for Oxpecker AI
  const SERVICES_FEATURES: MegaMenuItem[] = [
    {
      title: t("AI Diagnostic Chat", "এআই লক্ষণ নির্ণয়"),
      description: t("Describe symptoms in Bengali for instant health insights & specialist advice.", "বাংলায় লক্ষণ লিখে সাথে সাথে সম্ভাব্য পরামর্শ ও সঠিক ডাক্তারের নির্দেশিকা নিন।"),
      href: "/chat",
      icon: MessageSquare, badge: "AI Powered",
      iconClassName: "text-sky-600",
    },
    {
      title: t("Prescription Scanner", "প্রেসক্রিপশন স্ক্যানার"),
      description: t("Upload prescription photos to extract medicine names and timings in Bengali.", "প্রেসক্রিপশনের ছবি আপলোড করে ওষুধের নিয়ম ও খাওয়ার সময় বুঝে নিন।"),
      href: "/chat?mode=prescription",
      icon: FileText,
      iconClassName: "text-amber-600",
    },
    {
      title: t("Food Calorie Scanner", "ফুড ক্যালোরি স্ক্যানার"),
      description: t("Scan food items to analyze calories, nutrition values, and diet advice.", "খাবারের ছবি তুলে ক্যালোরি ও পুষ্টি উপাদান সম্পর্কিত এআই পরামর্শ নিন।"),
      href: "/chat?mode=food",
      icon: Apple,
      iconClassName: "text-emerald-600",
    },
    {
      title: t("Specialist Doctors Directory", "বিশেষজ্ঞ ডাক্তার ডিরেক্টরি"),
      description: t("Search BMDC-certified doctors across 20+ medical specialties.", "২০+ বিষয়ের বিএমডিসি ভেরিফাইড ডাক্তারদের প্রোফাইল ও ফী শিডিউল।"),
      href: "/doctors",
      icon: Stethoscope,
      iconClassName: "text-blue-600",
    },
    {
      title: t("Hospital Bed & ICU Tracker", "হাসপাতাল বেড ও আইসিইউ ট্র্যাকার"),
      description: t("Check real-time bed availabilities and emergency contacts in major hospitals.", "স্কয়ার, ল্যাবএইডসহ প্রধান হাসপাতালগুলোর বেড ও আইসিইউ স্ট্যাটাস।"),
      href: "/hospitals",
      icon: Building2,
      iconClassName: "text-indigo-600",
    },
    {
      title: t("Medicine Usage Guide", "ওষুধের নির্দেশনা ও তথ্য"),
      description: t("Access DGDA registered brand and generic medicine information.", "ডিজিডিএ রেজিস্টার্ড সকল ব্র্যান্ড ও জেনেরিক ওষুধের সঠিক কাজ ও নির্দেশনা।"),
      href: "/medicines",
      icon: Pill,
      iconClassName: "text-[#0878C9]",
    },
  ];

  const USE_CASES: MegaMenuItem[] = [
    {
      title: t("For Patients & Families", "রোগী ও পরিবারের জন্য"),
      description: t("24/7 AI health guidance, verified doctor bookings, and digital prescription archives.", "২৪/৭ এআই পরামর্শ, ডাক্তার বুকিং এবং ডিজিটাল প্রেসক্রিপশন আর্কাইভ।"),
      href: "/register",
      icon: Users,
    },
    {
      title: t("For Specialist Doctors & Clinics", "বিশেষজ্ঞ ডাক্তারদের জন্য"),
      description: t("Smart chamber queue management, 60-second e-prescriptions, and patient logs.", "স্মার্ট চেম্বার কিউ ম্যানেজমেন্ট এবং ৬০-সেকেন্ডের ই-প্রেসক্রিপশন এডিটর।"),
      href: "/doctor/dashboard",
      icon: Briefcase,
    },
    {
      title: t("For Partner Hospitals", "পার্টনার হাসপাতালগুলোর জন্য"),
      description: t("Live ICU and bed status management, ambulance directory, and emergency hotlines.", "লাইভ আইসিইউ ও বেড স্ট্যাটাস আপডেট এবং হাসপাতাল তথ্য পোর্টাল।"),
      href: "/hospital/dashboard",
      icon: Building2,
    },
  ];

  const RESOURCE_GROUPS: MegaMenuResourceGroup[] = [
    {
      title: t("Services", "সেবাসমূহ"),
      links: [
        { title: t("AI Diagnostic Chat", "এআই চ্যাট সেকশন"), href: "/chat", icon: MessageSquare },
        { title: t("Find Doctors", "ডাক্তার খুঁজুন"), href: "/doctors", icon: Stethoscope },
        { title: t("Hospital Directory", "হাসপাতাল তালিকা"), href: "/hospitals", icon: Building2 },
      ],
    },
    {
      title: t("Information", "তথ্য ও নিরাপত্তা"),
      links: [
        { title: t("System Documentation", "সিস্টেম ডক্স"), href: "/docs", icon: FileText },
        { title: t("Privacy & Security", "সিকিউরিটি ও প্রাইভেসি"), href: "/privacy", icon: ShieldCheck },
        { title: t("Medicine Index", "ওষুধ ইনডেক্স"), href: "/medicines", icon: Pill },
      ],
    },
  ];

  // Global Outside Click & Escape Handlers
  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Intersection Observer for Section Highlighting
  React.useEffect(() => {
    const ids = ["services", "doctors", "medicines", "faq"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileSection(null);
  };

  const toggleDesktopMenu = (menu: Exclude<DesktopMenu, null>) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const toggleMobileSection = (section: MobileSection) => {
    setMobileSection((current) => (current === section ? null : section));
  };

  return (
    <header
      {...props}
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all duration-300",
        className
      )}
      onMouseLeave={(event) => {
        setOpenMenu(null);
        props.onMouseLeave?.(event);
      }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          
          {/* Left Brand Logo */}
          <Link href="/" className="relative z-10 flex shrink-0 items-center">
            <Image
              src="/images/Oxpecker_full_size.png"
              alt="Oxpecker AI"
              width={165}
              height={50}
              className="h-9 lg:h-11 w-auto object-contain"
              priority
            />
          </Link>

          {/* Center Desktop Navigation */}
          <nav aria-label="Primary navigation" className="hidden items-center lg:flex">
            <ul className="flex items-center gap-1.5 bg-slate-100/70 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
              
              {/* 1. Services / Features Dropdown */}
              <li className="relative" onMouseEnter={() => setOpenMenu("services")}>
                <button
                  type="button"
                  aria-expanded={openMenu === "services"}
                  onClick={() => toggleDesktopMenu("services")}
                  onFocus={() => setOpenMenu("services")}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 focus-visible:outline-none",
                    (openMenu === "services" || activeSection === "services") && "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200 font-bold"
                  )}
                >
                  <span>{t("Services", "সার্ভিস")}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 opacity-60 transition-transform duration-200",
                      openMenu === "services" && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "absolute left-0 top-full z-50 pt-2 transition-all duration-150",
                    openMenu === "services"
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0 pointer-events-none"
                  )}
                >
                  <div className="w-[640px] rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl">
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICES_FEATURES.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-100/80"
                          >
                            {Icon && (
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 transition-colors group-hover/item:bg-white group-hover/item:border-slate-300">
                                <Icon className={cn("size-4", item.iconClassName || "text-slate-600")} />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold text-sky-700">
                                    {item.badge}
                                  </span>
                                )}
                              </span>
                              {item.description && (
                                <span className="mt-1 block text-xs leading-relaxed text-slate-500 font-medium">
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 px-3 pt-3">
                      <span className="text-xs font-semibold text-slate-500">
                        {t("Need instant AI medical assistance?", "জরুরী এআই স্বাস্থ্য পরামর্শ দরকার?")}
                      </span>
                      <Link
                        href="/chat"
                        onClick={() => setOpenMenu(null)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0878C9] hover:underline"
                      >
                        {t("Ask AI Assistant", "এআই অ্যাসিস্ট্যান্ট খুলুন")}
                        <MoveRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* 2. Medical Care / Use Cases Dropdown */}
              <li className="relative" onMouseEnter={() => setOpenMenu("use-cases")}>
                <button
                  type="button"
                  aria-expanded={openMenu === "use-cases"}
                  onClick={() => toggleDesktopMenu("use-cases")}
                  onFocus={() => setOpenMenu("use-cases")}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 focus-visible:outline-none",
                    openMenu === "use-cases" && "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200 font-bold"
                  )}
                >
                  <span>{t("Care Portals", "পোর্টালসমূহ")}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 opacity-60 transition-transform duration-200",
                      openMenu === "use-cases" && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "absolute left-0 top-full z-50 pt-2 transition-all duration-150",
                    openMenu === "use-cases"
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0 pointer-events-none"
                  )}
                >
                  <div className="w-[410px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                    <div className="flex flex-col gap-1">
                      {USE_CASES.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-100/80"
                          >
                            {Icon && (
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50">
                                <Icon className="size-4 text-slate-700" />
                              </span>
                            )}
                            <span>
                              <span className="block text-sm font-bold text-slate-900">
                                {item.title}
                              </span>
                              {item.description && (
                                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 font-medium">
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </li>

              {/* 3. Direct Links */}
              <li>
                <Link
                  href="/doctors"
                  className={cn(
                    "inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900",
                    activeSection === "doctors" && "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200 font-bold"
                  )}
                >
                  {t("Doctors", "ডাক্তার")}
                </Link>
              </li>

              <li>
                <Link
                  href="/medicines"
                  className={cn(
                    "inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900",
                    activeSection === "medicines" && "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200 font-bold"
                  )}
                >
                  {t("Medicines", "ওষুধ তথ্য")}
                </Link>
              </li>

              {/* 4. Resources Dropdown */}
              <li className="relative" onMouseEnter={() => setOpenMenu("resources")}>
                <button
                  type="button"
                  aria-expanded={openMenu === "resources"}
                  onClick={() => toggleDesktopMenu("resources")}
                  onFocus={() => setOpenMenu("resources")}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 focus-visible:outline-none",
                    (openMenu === "resources" || activeSection === "faq") && "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200 font-bold"
                  )}
                >
                  <span>{t("Resources", "রিসোর্স")}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 opacity-60 transition-transform duration-200",
                      openMenu === "resources" && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 top-full z-50 pt-2 transition-all duration-150",
                    openMenu === "resources"
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0 pointer-events-none"
                  )}
                >
                  <div className="grid grid-cols-3 gap-4 w-[600px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                    <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                      <div>
                        <span className="flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                          <BookOpen className="size-4" />
                        </span>
                        <h4 className="mt-3 text-sm font-bold text-slate-900">
                          {t("Smart Healthcare System", "স্মার্ট হেলথকেয়ার সিস্টেম")}
                        </h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 font-medium">
                          {t("Empowering patients, doctors, and hospitals across Bangladesh.", "রোগী, ডাক্তার এবং হাসপাতালকে সমৃদ্ধ করার প্ল্যাটফর্ম।")}
                        </p>
                      </div>
                      <Link
                        href="/docs"
                        onClick={() => setOpenMenu(null)}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0878C9] hover:underline"
                      >
                        {t("Read Docs", "ডকুমেন্টেশন দেখুন")}
                        <MoveRight className="size-3.5" />
                      </Link>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      {RESOURCE_GROUPS.map((group) => (
                        <div key={group.title} className="flex flex-col gap-1">
                          <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            {group.title}
                          </h4>
                          {group.links.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setOpenMenu(null)}
                                className="flex items-center gap-2 rounded-lg p-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                              >
                                {Icon && <Icon className="size-3.5 text-slate-400" />}
                                {item.title}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors hidden sm:block"
            >
              {t("Log In", "লগইন")}
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-bold bg-[#0B1630] hover:bg-slate-800 text-white rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              {t("Get Started", "শুরু করুন")}
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}

export default MegaMenuNavbar;
