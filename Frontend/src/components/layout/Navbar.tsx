"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Home, Stethoscope, Pill, HelpCircle, Layers, BookText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: "/#features", id: "features", label: t("Services", "সেবাসমূহ"), icon: Layers },
    { href: "/#doctors", id: "doctors", label: t("Doctors", "ডাক্তার"), icon: Stethoscope },
    { href: "/#medicines", id: "medicines", label: t("Medicines", "ওষুধের তথ্য"), icon: Pill },
    { href: "/#faq", id: "faq", label: t("FAQ", "প্রশ্নোত্তর"), icon: HelpCircle },
    { href: "/docs", id: "docs", label: "DOCS", icon: BookText },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection Observer for Scroll Spy
  useEffect(() => {
    const ids = ["features", "doctors", "medicines", "faq"];
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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-700 overflow-hidden ${
          scrolled
            ? "bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border-b border-white/80"
            : "bg-transparent"
        }`}
      >
        {/* ── Glassmorphism Animated Shine ── */}
        {scrolled && (
          <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30 animate-[shine_6s_infinite]" />
        )}

        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[64px] lg:h-[72px] flex items-center justify-between">
          {/* ── Left Side (Logo + Nav) ── */}
          <div className="flex items-center gap-8 lg:gap-12">
            {/* ── Logo ── */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src="/images/shustota ai logo.png"
                alt="Shustota AI"
                width={280}
                height={95}
                className="h-[52px] sm:h-[56px] lg:h-[4.5rem] w-auto object-contain transition-all duration-300 origin-left scale-[1.15] sm:scale-100"
                priority
              />
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                const activeClass = "text-primary bg-primary/10 font-bold shadow-sm ring-1 ring-primary/20";
                const inactiveClass = scrolled 
                  ? "text-black font-bold hover:text-primary hover:bg-primary/5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]" 
                  : "text-black font-bold hover:text-primary hover:bg-white/20";
                  
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-[14px] font-semibold rounded-lg transition-all duration-300 emil-button ${
                      isActive ? activeClass : inactiveClass
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Desktop & Mobile Actions (Always Visible Login/Signup) ── */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/login"
              className="px-3 sm:px-5 py-2 text-[12px] sm:text-sm font-bold rounded-lg sm:rounded-xl border border-primary/20 text-primary hover:bg-primary/5 transition-colors emil-button"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center gap-1 px-3 sm:px-5 py-2 bg-primary text-white text-[12px] sm:text-sm font-bold rounded-lg sm:rounded-xl shadow-sm sm:shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:bg-[#002d75] emil-button"
            >
              Sign up
              <ChevronRight size={14} className="hidden sm:block group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pt-2 pointer-events-none">
        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-lg px-2 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto h-auto">
          
          {/* Home Link (Always needed in bottom nav) */}
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 transition-all rounded-md ${
              activeSection === "" || activeSection === "hero" ? "text-primary bg-primary/10 scale-105 shadow-sm shadow-primary/5" : "text-slate-800 hover:text-black hover:bg-white/50"
            }`}
          >
            <Home size={20} className={activeSection === "" || activeSection === "hero" ? "fill-primary/20" : ""} />
            <span className={`text-[10px] font-bold tracking-wide transition-all ${activeSection === "" || activeSection === "hero" ? "text-primary" : "text-slate-800"}`}>Home</span>
          </Link>

          {/* Dynamic Links */}
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 transition-all rounded-md ${
                  isActive ? "text-primary bg-primary/10 scale-105 shadow-sm shadow-primary/5" : "text-slate-800 hover:text-black hover:bg-white/50"
                }`}
              >
                <link.icon size={20} className={isActive ? "fill-primary/20" : ""} />
                <span className={`text-[10px] font-bold tracking-wide transition-all ${isActive ? "text-primary" : "text-slate-800"}`}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
