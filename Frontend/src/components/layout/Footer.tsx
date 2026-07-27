"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Mail,
  PhoneCall,
  ShieldCheck,
  BadgeCheck,
  Building2,
  Heart,
} from "lucide-react";

/* ── Inline brand SVGs (lucide-react doesn't ship brand icons reliably) ── */
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

const PARTNER_CLINICS = [
  "Medihome Diagnostic Center",
  "Lifecare General Hospital",
  "Green Valley Clinic",
  "Central Health Point",
  "Prime Care Hospital",
  "Wellness Medical Center",
];

export function Footer() {
  const FOOTER_LINKS = {
    service: [
      { label: "AI Health Chat", href: "/chat" },
      { label: "Find Doctors", href: "/doctors" },
      { label: "Medicine Info", href: "/medicines" },
      { label: "Partner Hospitals", href: "/#partners" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Media", href: "/press" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Medical Disclaimer", href: "/disclaimer" },
      { label: "Refund Policy", href: "/refund" },
    ],
  };

  return (
    <footer className="relative bg-[#060e1a]">
      {/* ── Subtle top gradient fade ── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* ── Partner Clinics Marquee ── */}
        <div id="partners" className="py-14 sm:py-16 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[#4dd0e1] font-semibold text-xs tracking-widest uppercase">
                Network of Trust
              </span>
              <h3 className="text-white text-lg sm:text-xl font-bold mt-2 tracking-tight">
                Our Partner Clinics & Hospitals
              </h3>
            </div>
            <Building2 size={28} className="text-white/10 hidden sm:block" />
          </div>

          <div className="shustota-marquee-mask relative overflow-hidden">
            <div className="flex gap-4 shustota-marquee-track w-max">
              {[...PARTNER_CLINICS, ...PARTNER_CLINICS].map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] whitespace-nowrap hover:bg-white/[0.06] hover:border-white/10 transition-colors duration-300"
                >
                  <BadgeCheck size={15} className="text-[#4dd0e1] shrink-0" />
                  <span className="text-sm font-medium text-white/70">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Footer Grid ── */}
        <div className="py-14 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <Image
              src="/images/shustota ai logo.png"
              alt="Shustota AI"
              width={240}
              height={70}
              className="h-16 sm:h-20 w-auto object-contain brightness-0 invert opacity-90 mb-2"
            />
            <p className="text-sm leading-relaxed text-white/40 max-w-[320px]">
              Shustota is an AI-powered healthcare platform: offering symptom analysis, expert doctor connections, and verified drug information, completely free.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400/80">
              <ShieldCheck size={14} /> Data Encrypted & Secure
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              {[Facebook, Youtube, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:bg-primary hover:border-primary/50 transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-2">
            <FooterCol title="Services" links={FOOTER_LINKS.service} />
          </div>
          <div className="lg:col-span-2">
            <FooterCol title="Company" links={FOOTER_LINKS.company} />
          </div>
          <div className="lg:col-span-2">
            <FooterCol title="Legal" links={FOOTER_LINKS.legal} />
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-white/90 font-semibold text-sm tracking-wide">Contact</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2.5 text-white/40">
                <MapPin size={15} className="shrink-0 mt-0.5" /> Dhaka, Bangladesh
              </p>
              <a href="tel:16263" className="flex items-center gap-2.5 text-white/40 hover:text-white transition-colors duration-200">
                <PhoneCall size={15} className="shrink-0" /> 16263 (24/7)
              </a>
              <a
                href="mailto:support@shustota.com"
                className="flex items-center gap-2.5 text-white/40 hover:text-white transition-colors duration-200"
              >
                <Mail size={15} className="shrink-0" /> support@shustota.com
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p className="flex flex-wrap items-center gap-1">
            <span>&copy; {new Date().getFullYear()} Shustota.</span>
            <span>All rights reserved.</span>
            <span className="text-white/20">|</span>
            <span>Developed by</span>
            <a 
              href="https://equisaas-bd.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#4dd0e1] hover:underline font-bold"
            >
              EquiSaaS BD
            </a>
          </p>
          <p className="flex items-center gap-1.5 text-center">
            Not a substitute for professional medical advice
            <Heart size={10} className="text-red-400/60" />
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-4">
      <h4 className="text-white/90 font-semibold text-sm tracking-wide">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/40 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
