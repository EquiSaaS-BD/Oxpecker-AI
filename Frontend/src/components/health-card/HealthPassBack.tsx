"use client";

import React, { forwardRef } from "react";
import {
  AlertTriangle, Heart, Phone,
  Activity, Stethoscope, Siren, Droplet, ShieldCheck, MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import type { HealthPassCard as HealthPassCardType } from "@/types/healthpass";

interface Props {
  card: HealthPassCardType;
  onFlip?: () => void;
}

// Universal Emergency Medical Service (EMS) Star of Life SVG
const StarOfLife = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* 6-pointed Star of Life */}
    <path
      d="M43 5h14v22l19-11 7 12-19 11 19 11-7 12-19-11v22H43V61l-19 11-7-12 19-11-19-11 7-12 19 11V5z"
      fill="#0284c7"
    />
    {/* Rod of Asclepius */}
    <path d="M50 16v68" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
    <path
      d="M46 28c5-3 8 2 6 7-3 6-8 10-4 15s8 6 6 12-7 9-4 14"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

// Bangladesh Red Crescent Society (BDRCS) Crescent Emblem
const RedCrescent = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path
      d="M58 8 A42 42 0 1 0 88 80 A35 35 0 1 1 58 8 Z"
      fill="#e11d48"
    />
  </svg>
);

// Official WhatsApp Brand SVG Icon
const WhatsAppIcon = ({ className = "w-2.5 h-2.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" role="img" aria-label="Available on WhatsApp">
    <path
      fill="#25D366"
      d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15-.201.3-.778.98-.954 1.18-.176.201-.352.226-.653.075-1.579-.79-2.617-1.411-3.664-3.21-.276-.475.276-.44.79-1.468.087-.175.044-.326-.022-.476-.065-.15-.678-1.632-.929-2.234-.244-.587-.492-.507-.678-.516l-.578-.01c-.201 0-.527.075-.803.376s-1.054 1.03-1.054 2.512 1.079 2.913 1.23 3.114c.15.201 2.123 3.242 5.144 4.547 2.158.932 2.999.938 4.067.781 1.153-.17 2.502-1.023 2.854-2.01.352-.986.352-1.832.247-2.01-.106-.178-.306-.279-.607-.43z"
    />
    <path
      fill="#25D366"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.908-1.353A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.17 8.17 0 01-4.172-1.144l-.299-.178-3.097.854.856-3.018-.195-.31A8.173 8.173 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"
    />
  </svg>
);

// High-Density Smart Card Hospital Scanner Barcode
const BarcodeSvg = ({ value }: { value: string }) => (
  <div className="w-full flex flex-col items-center">
    <svg className="w-full h-3.5 sm:h-4" viewBox="0 0 200 30" preserveAspectRatio="none">
      <rect x="0" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="5" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="9" y="0" width="5" height="30" fill="#0f172a" />
      <rect x="16" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="20" y="0" width="4" height="30" fill="#0f172a" />
      <rect x="26" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="30" y="0" width="7" height="30" fill="#0f172a" />
      <rect x="39" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="44" y="0" width="5" height="30" fill="#0f172a" />
      <rect x="51" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="55" y="0" width="6" height="30" fill="#0f172a" />
      <rect x="63" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="68" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="72" y="0" width="6" height="30" fill="#0f172a" />
      <rect x="80" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="85" y="0" width="5" height="30" fill="#0f172a" />
      <rect x="92" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="96" y="0" width="6" height="30" fill="#0f172a" />
      <rect x="104" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="109" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="113" y="0" width="5" height="30" fill="#0f172a" />
      <rect x="120" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="125" y="0" width="6" height="30" fill="#0f172a" />
      <rect x="133" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="137" y="0" width="5" height="30" fill="#0f172a" />
      <rect x="144" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="149" y="0" width="5" height="30" fill="#0f172a" />
      <rect x="156" y="0" width="4" height="30" fill="#0f172a" />
      <rect x="162" y="0" width="2" height="30" fill="#0f172a" />
      <rect x="166" y="0" width="6" height="30" fill="#0f172a" />
      <rect x="174" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="179" y="0" width="5" height="30" fill="#0f172a" />
      <rect x="186" y="0" width="3" height="30" fill="#0f172a" />
      <rect x="191" y="0" width="4" height="30" fill="#0f172a" />
      <rect x="197" y="0" width="3" height="30" fill="#0f172a" />
    </svg>
    <span className="font-mono text-[6.5px] sm:text-[7px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">
      {value}
    </span>
  </div>
);

export const HealthPassBack = forwardRef<HTMLDivElement, Props>(
  ({ card, onFlip }, ref) => {
    if (!card) return null;

    // Format allergies cleanly
    const allergyList =
      Array.isArray(card.allergies) && card.allergies.length > 0
        ? card.allergies
        : [];

    return (
      <div
        style={{ perspective: 1200 }}
        className="w-full max-w-[560px] flex justify-center py-2"
      >
        <motion.div
          ref={ref}
          onClick={onFlip}
          className="relative w-full aspect-[3.375/2.125] rounded-[24px] p-3.5 sm:p-4.5 overflow-hidden select-none transition-shadow duration-300 shadow-[0_16px_40px_rgba(2,132,199,0.12)] border border-sky-200/90 flex flex-col justify-between cursor-pointer"
          style={{
            background: `
              radial-gradient(circle at 10% 10%, rgba(186, 230, 253, 0.45) 0%, transparent 45%),
              radial-gradient(circle at 90% 90%, rgba(224, 242, 254, 0.5) 0%, transparent 50%),
              linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 45%, #F0F9FF 100%)
            `,
          }}
          title="Click to flip to front"
        >
          {/* Subtle Security Guilloche Pattern in Background */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #0284c7 0, #0284c7 1px, transparent 0, transparent 10px)`,
            }}
          />

          {/* Section 1: Header - Clean Line (No boxes) */}
          <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-slate-200/80">
            {/* Left: Star of Life + Red Crescent + Bilingual Title */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 shrink-0">
                <StarOfLife className="w-4 h-4 shrink-0" />
                <RedCrescent className="w-3.5 h-3.5 shrink-0" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[10px] sm:text-[11px] tracking-wider uppercase text-slate-900 font-sans">
                    NATIONAL EMERGENCY MEDICAL DOSSIER
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[7.5px] sm:text-[8px] text-sky-700 font-semibold tracking-tight">
                  PEOPLE&apos;S REPUBLIC OF BANGLADESH • DGHS ACCREDITED
                </p>
              </div>
            </div>

            {/* Right: DGHS Accreditation Tag */}
            <div className="flex items-center gap-1 font-mono text-[7.5px] sm:text-[8px] text-sky-800 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/80 shrink-0">
              <ShieldCheck size={10} className="text-sky-600" />
              <span>DGHS VERIFIED</span>
            </div>
          </div>

          {/* Section 2: Official Emergency Hotlines - Clean Horizontal Row (No boxes) */}
          <div className="relative z-10 py-1 border-b border-slate-200/80 flex items-center justify-between text-[8px] sm:text-[9px]">
            <span className="text-[7.5px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              HOTLINES:
            </span>

            {/* 16263 Shastho Batayon */}
            <div className="flex items-center gap-1 text-slate-800 font-semibold">
              <Stethoscope size={10} className="text-emerald-600 shrink-0" />
              <span className="font-mono font-black text-emerald-700">16263</span>
              <span className="text-[7px] sm:text-[7.5px] text-slate-500">Health Helpline</span>
            </div>

            <span className="text-slate-300">|</span>

            {/* 999 Emergency */}
            <div className="flex items-center gap-1 text-slate-800 font-semibold">
              <Siren size={10} className="text-rose-600 shrink-0" />
              <span className="font-mono font-black text-rose-700">999</span>
              <span className="text-[7px] sm:text-[7.5px] text-slate-500">National Emergency</span>
            </div>

            <span className="text-slate-300">|</span>

            {/* 10655 IEDCR */}
            <div className="flex items-center gap-1 text-slate-800 font-semibold">
              <Activity size={10} className="text-sky-600 shrink-0" />
              <span className="font-mono font-black text-sky-700">10655</span>
              <span className="text-[7px] sm:text-[7.5px] text-slate-500">IEDCR Desk</span>
            </div>

            <span className="text-slate-300">|</span>

            {/* Red Crescent Blood Bank */}
            <div className="flex items-center gap-1 text-slate-800 font-semibold">
              <Droplet size={10} className="fill-rose-600 text-rose-600 shrink-0" />
              <span className="font-mono font-black text-rose-700">02-9116563</span>
              <span className="text-[7px] sm:text-[7.5px] text-slate-500">Blood Bank</span>
            </div>
          </div>

          {/* Section 3: Clinical Triage Vitals - Clean 4-Column Grid with Hairline Dividers (No boxes) */}
          <div className="relative z-10 py-1 border-b border-slate-200/80 grid grid-cols-4 divide-x divide-slate-200/80">
            {/* Blood Group & Rh */}
            <div className="pr-2">
              <span className="text-[7px] sm:text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">
                BLOOD & RH
              </span>
              <div className="flex items-center gap-1 my-0.5">
                <Droplet size={11} className="fill-rose-600 text-rose-600 shrink-0" />
                <span className="text-[11px] sm:text-[13px] font-black text-rose-700 font-mono leading-none">
                  {card.blood_group || "O+"}
                </span>
              </div>
              <span className="text-[6.5px] sm:text-[7px] text-slate-500 font-medium block truncate">
                Emergency Transfusion
              </span>
            </div>

            {/* Diabetic Status */}
            <div className="px-2">
              <span className="text-[7px] sm:text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">
                DIABETIC STATUS
              </span>
              <div className="flex items-center gap-1 my-0.5">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 leading-none truncate">
                  {card.diabetic_status || "Type-2 (Controlled)"}
                </span>
              </div>
              <span className="text-[6.5px] sm:text-[7px] text-slate-500 font-medium block truncate">
                Glucose Regulated
              </span>
            </div>

            {/* Organ Donor Status */}
            <div className="px-2">
              <span className="text-[7px] sm:text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">
                ORGAN DONOR
              </span>
              <div className="flex items-center gap-1 my-0.5">
                <Heart size={10} className="fill-emerald-600 text-emerald-600 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 leading-none truncate">
                  {card.organ_donor ? "Registered Donor" : "Unpledged"}
                </span>
              </div>
              <span className="text-[6.5px] sm:text-[7px] text-slate-500 font-medium block truncate">
                BDRCS Registry
              </span>
            </div>

            {/* Cardiac & Pacemaker */}
            <div className="pl-2">
              <span className="text-[7px] sm:text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">
                CARDIAC PACEMAKER
              </span>
              <div className="flex items-center gap-1 my-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    card.has_pacemaker ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 leading-none truncate">
                  {card.has_pacemaker ? "⚠️ Active Pacemaker" : "No Pacemaker"}
                </span>
              </div>
              <span className="text-[6.5px] sm:text-[7px] text-slate-500 font-medium block truncate">
                Cardiac Profile
              </span>
            </div>
          </div>

          {/* Section 4: Critical Drug Allergies - Clean Single Row (No box) */}
          <div className="relative z-10 py-1 border-b border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertTriangle size={12} className="text-rose-600 shrink-0" />
              <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider text-rose-900 shrink-0">
                CRITICAL DRUG ALLERGIES:
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-rose-700 truncate">
                {allergyList.length > 0
                  ? allergyList.join(", ")
                  : "No Known Drug Allergies Recorded (NKDA)"}
              </span>
            </div>

            <span className="text-[6.5px] font-mono text-slate-400 uppercase font-semibold shrink-0 hidden sm:inline">
              DO NOT ADMINISTER WITHOUT SCANNING QR
            </span>
          </div>

          {/* Section 5: Dual Phone Emergency Contacts (Personal & Family) + Barcode */}
          <div className="relative z-10 py-1 grid grid-cols-12 gap-3 items-center">
            {/* Left (60%): Personal Phone + Family / ICE Guardian Phone */}
            <div className="col-span-7 space-y-1">
              {/* Row A: Cardholder Personal Phone */}
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  PERSONAL PHONE:
                </span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${card.personal_phone || "+8801712345678"}`}
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold text-sky-800 hover:underline"
                  >
                    <Phone size={9} className="text-sky-600 shrink-0" />
                    <span>{card.personal_phone || "+880 1712-345678"}</span>
                  </a>
                  {(card.personal_has_whatsapp ?? true) && (
                    <span className="flex items-center gap-0.5 px-1 py-0.5 bg-emerald-50 rounded border border-emerald-200/90 shadow-2xs" title="WhatsApp Active">
                      <WhatsAppIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="text-[6.5px] font-bold text-emerald-700">WA</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Row B: Family / Emergency Guardian (ICE) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    FAMILY (ICE):
                  </span>
                  <span className="text-[8px] font-bold text-slate-800 truncate">
                    {card.emergency_contact_name || "Fatema Begum"} ({card.emergency_contact_relation || "Mother"})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${card.emergency_contact_phone || "+8801819876543"}`}
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold text-emerald-700 hover:underline"
                  >
                    <Phone size={9} className="text-emerald-600 shrink-0" />
                    <span>{card.emergency_contact_phone || "+880 1819-876543"}</span>
                  </a>
                  {(card.emergency_has_whatsapp ?? true) && (
                    <span className="flex items-center gap-0.5 px-1 py-0.5 bg-emerald-50 rounded border border-emerald-200/90 shadow-2xs" title="WhatsApp Active">
                      <WhatsAppIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="text-[6.5px] font-bold text-emerald-700">WA</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Row C: Location Address */}
              <div className="flex items-center gap-1 text-[7.5px] text-slate-500 pt-0.5 border-t border-slate-200/60 truncate">
                <MapPin size={8} className="text-sky-600 shrink-0" />
                <span className="truncate">
                  {card.address || (card.upazila ? `${card.upazila}, ${card.zila}` : "Dhanmondi, Dhaka")}
                </span>
              </div>
            </div>

            {/* Right (40%): Hospital Barcode & Cardholder Signature */}
            <div className="col-span-5 border-l border-slate-200/80 pl-3 flex flex-col justify-center">
              <BarcodeSvg value={card.card_number || "HP-2026-8472-1094"} />
              <div className="flex items-center justify-between pt-0.5 mt-0.5 border-t border-slate-200/60">
                <span className="text-[6px] text-slate-400 font-mono uppercase tracking-wider">
                  SIGNATURE:
                </span>
                <span className="text-[8.5px] sm:text-[9.5px] italic font-serif text-slate-800 font-bold truncate">
                  {card.english_name || card.patient_name || "Authorized"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 6: Security Microtext Footer (No in-card button) */}
          <div className="relative z-10 pt-1 border-t border-slate-200/80 flex items-center justify-between text-[7px] sm:text-[8px] text-slate-500">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-slate-800 shrink-0">OXPECKER AI HEALTH NETWORK</span>
              <span className="opacity-40">•</span>
              <span className="truncate">DIRECTORATE GENERAL OF HEALTH SERVICES (DGHS)</span>
            </div>

            <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest shrink-0 ml-2">
              FOR OFFICIAL CLINICAL USE ONLY
            </span>
          </div>
        </motion.div>
      </div>
    );
  }
);

HealthPassBack.displayName = "HealthPassBack";

export default HealthPassBack;
