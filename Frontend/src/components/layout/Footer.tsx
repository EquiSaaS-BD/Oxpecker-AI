"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Mail,
  PhoneCall,
  ShieldCheck,

  Building2,
  Heart,
} from "lucide-react";

/* -- Inline brand SVGs (lucide-react doesn't ship brand icons reliably) -- */
const Facebook = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const Youtube = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
);
const Instagram = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const Linkedin = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const HOSPITAL_EXAMPLES = [
  "Square Hospital Dhaka",
  "Labaid Specialized Hospital",
  "Popular Diagnostic Centre",
  "United Hospital Gulshan",
  "Evercare Hospital Dhaka",
  "Ibn Sina Specialized Hospital",
  "Central Hospital Limited",
  "BRB Hospitals Limited",
];

export function Footer() {
  const CLINICAL_LINKS = [
    { label: "AI Diagnostic Chat", href: "/chat" },
    { label: "Find Doctors", href: "/doctors" },
    { label: "Medicine Directory", href: "/medicines" },
    { label: "Hospital & Bed Tracker", href: "/hospitals" },
  ];

  const PLATFORM_LINKS = [
    { label: "About Oxpecker AI", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Medical Disclaimer", href: "/disclaimer" },
    { label: "FAQ & Support", href: "/faq" },
  ];

  return (
    <footer className="relative bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Hospital directory examples */}
        <div id="hospital-directory" className="py-12 sm:py-14 border-b border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-slate-900 text-lg sm:text-xl font-extrabold tracking-tight">
                পরিচিত হাসপাতালের উদাহরণ
              </h3>
            </div>
            <Building2 size={24} className="text-slate-600 hidden sm:block" />
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none w-max py-1">
              {[...HOSPITAL_EXAMPLES, ...HOSPITAL_EXAMPLES].map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white border border-slate-200 whitespace-nowrap hover:bg-slate-100 hover:border-slate-300 shadow-2xs transition-colors duration-200"
                >
                  <Building2 size={15} className="text-sky-600 shrink-0" />
                  <span className="text-sm font-bold text-slate-700">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Colophon */}
        <div className="py-14 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand & Helpline Column */}
          <div className="lg:col-span-5 space-y-5">
            <Image
              src="/images/Oxpecker_Full.png"
              alt="Oxpecker AI"
              width={240}
              height={70}
              className="h-16 sm:h-20 w-auto object-contain mb-2"
            />
            <p className="text-sm font-normal leading-relaxed text-slate-600 max-w-sm">
              Oxpecker AI-এর লক্ষ্য হলো হাসপাতাল, ডাক্তার এবং রোগীদের স্বাস্থ্য তথ্য এক জায়গায় এনে চিকিৎসাসেবা সহজ ও দ্রুত করা।
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck size={15} />
              <span>রোগীর তথ্যের গোপনীয়তা ও সুরক্ষাকে অগ্রাধিকার দেওয়া হয়</span>
            </div>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a 
                href="tel:16263" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <PhoneCall size={14} className="text-sky-600" />
                <span>স্বাস্থ্য বাতায়ন: 16263 (24/7)</span>
              </a>
              <a 
                href="mailto:support@oxpecker.equisaas-bd.com" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <Mail size={14} className="text-slate-500" />
                <span>support@oxpecker.equisaas-bd.com</span>
              </a>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              {[
                { name: "Facebook", icon: Facebook, href: "https://facebook.com/oxpecker" },
                { name: "YouTube", icon: Youtube, href: "https://youtube.com/@oxpecker_ai" },
                { name: "Instagram", icon: Instagram, href: "https://instagram.com/oxpecker_ai" },
                { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/oxpecker" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 shadow-2xs transition-colors duration-200"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Clinical & Directory Links */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-slate-900 font-bold text-sm tracking-wide">চিকিৎসাসেবা ও ডিরেক্টরি</h4>
            <ul className="space-y-3">
              {CLINICAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform & Transparency Links */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-slate-900 font-bold text-sm tracking-wide">প্ল্যাটফর্ম ও নিরাপত্তা</h4>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} Oxpecker AI.</span>
            <span>All rights reserved.</span>
            <span className="text-slate-600">|</span>
            <span>Crafted with precision by</span>
            <a 
              href="https://equisaas.tech" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sky-600 hover:text-sky-700 hover:underline font-bold"
            >
              EquiSaaS Agency
            </a>
            <span>(</span>
            <a 
              href="https://equisaas-bd.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sky-600 hover:text-sky-700 hover:underline font-bold"
            >
              EquiSaaS BD
            </a>
            <span>)</span>
            <span className="text-slate-600">|</span>
            <span>Architected by</span>
            <a 
              href="https://kholipha-ahmmad-al-amin.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-700 hover:text-sky-600 hover:underline font-bold"
            >
              Kholipha Ahmmad Al-Amin
            </a>
          </div>
          <p className="flex items-center gap-1.5 text-center shrink-0">
            Not a substitute for professional medical advice
            <Heart size={10} className="text-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
