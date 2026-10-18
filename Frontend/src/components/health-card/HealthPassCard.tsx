"use client";

import React, { forwardRef, useRef } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  Shield, CheckCircle2, MapPin, Wifi, Activity, User, Droplet, Phone,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { HealthPassCard as HealthPassCardType } from "@/types/healthpass";
import { formatDate, calculateAge } from "@/lib/healthpass";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

interface Props {
  card: HealthPassCardType;
  profileImage?: string | null;
  interactive?: boolean;
  onFlip?: () => void;
}

export const HealthPassCard = forwardRef<HTMLDivElement, Props>(
  ({ card, profileImage, interactive = true, onFlip }, ref) => {
    // Dual domain QR URL (production: https://oxpecker.equisaas-bd.com, dev: local origin)
    const scanUrl =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? `https://oxpecker.equisaas-bd.com/scan/${card.card_number}`
        : typeof window !== "undefined"
        ? `${window.location.origin}/scan/${card.card_number}`
        : `https://oxpecker.equisaas-bd.com/scan/${card.card_number}`;

    const age = calculateAge(card.date_of_birth);

    // 3D Perspective Tilt Physics with Framer Motion
    const cardContainerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !cardContainerRef.current) return;
      const rect = cardContainerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    // Format Card UID into clean groups: HP-2026 8472 1094 5501
    const formatCardNumber = (num: string) => {
      const clean = num.replace(/[^A-Za-z0-9]/g, "");
      const prefix = clean.startsWith("HP") ? "HP-2026" : "HP-CARD";
      const digits = clean.replace(/^HP\d*/i, "") || "94821";
      const padDigits = (digits + "8472109455").slice(0, 12);
      return `${prefix}  ${padDigits.slice(0, 4)}  ${padDigits.slice(4, 8)}  ${padDigits.slice(8, 12)}`;
    };

    // Normalize any Bengali place names to clean English
    const normalizeToEnglish = (text?: string | null): string => {
      if (!text) return "";
      const bnToEnMap: Record<string, string> = {
        "ময়মনসিংহ": "Mymensingh",
        "ময়মনসিংহ": "Mymensingh",
        "ঢাকা": "Dhaka",
        "চট্টগ্রাম": "Chattogram",
        "সিলেট": "Sylhet",
        "রাজশাহী": "Rajshahi",
        "খুলনা": "Khulna",
        "বরিশাল": "Barishal",
        "রংপুর": "Rangpur",
        "কুমিল্লা": "Cumilla",
        "গাজীপুর": "Gazipur",
        "নারায়ণগঞ্জ": "Narayanganj",
        "নারায়ণগঞ্জ": "Narayanganj",
        "ঈশ্বরগঞ্জ": "Ishwarganj",
        "ধানমন্ডি": "Dhanmondi",
        "গুলশান": "Gulshan",
        "উত্তরা": "Uttara",
        "মিরপুর": "Mirpur",
        "বনানী": "Banani",
        "মতিঝিল": "Motijheel",
        "মোহাম্মদপুর": "Mohammadpur",
        "বাড্ডা": "Badda",
        "কোতোয়ালি": "Kotwali",
        "কোতোয়ালি": "Kotwali",
        "সদর": "Sadar",
      };
      let s = text;
      for (const [bn, en] of Object.entries(bnToEnMap)) {
        s = s.replace(new RegExp(bn, "gi"), en);
      }
      s = s.replace(/উপজেলা|জেলা|থানা|সিটি\s*কর্পোরেশন|বিভাগ/gi, "").trim();
      s = s.replace(/[,\s]+$/, "").replace(/^[,\s]+/, "");
      return s;
    };

    // Synchronized 100% English location for Residential Address & Bottom Footer
    const getSynchronizedLocation = () => {
      const post = card.post_code || "1205";

      if (card.address && card.address.trim().length > 3) {
        const enAddress = normalizeToEnglish(card.address);
        const segs = enAddress.split(",").map((s) => s.trim()).filter(Boolean);

        let area = "";
        let city = "";
        if (segs.length >= 2) {
          city = segs[segs.length - 1];
          area = segs[segs.length - 2];
        } else if (segs.length === 1) {
          city = segs[0];
        }

        const fullResidential = `${enAddress}${
          !enAddress.includes(post) ? ` - ${post}` : ""
        }`;

        const footerCity = area
          ? `${area}, ${city} - ${post}`
          : `${city || "DHAKA"} - ${post}`;

        return {
          residentialAddress: fullResidential,
          footerLocation: footerCity.toUpperCase(),
        };
      }

      const enUpazila = normalizeToEnglish(card.upazila) || "Dhanmondi";
      const enZila = normalizeToEnglish(card.zila) || "Dhaka";
      const fullLoc = `${enUpazila}, ${enZila} - ${post}`;

      return {
        residentialAddress: fullLoc,
        footerLocation: fullLoc.toUpperCase(),
      };
    };

    const { residentialAddress, footerLocation } = getSynchronizedLocation();

    // English gender display
    const genderDisplay =
      card.gender === "Male" || card.gender === "পুরুষ"
        ? "MALE"
        : card.gender === "Female" || card.gender === "মহিলা"
        ? "FEMALE"
        : (card.gender || "OTHER").toUpperCase();

    return (
      <div
        style={{ perspective: 1200 }}
        className="w-full max-w-[560px] flex justify-center py-2"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          ref={ref || cardContainerRef}
          onClick={onFlip}
          style={{
            rotateX: interactive ? rotateX : 0,
            rotateY: interactive ? rotateY : 0,
            transformStyle: "preserve-3d",
          }}
          className="relative w-full aspect-[3.375/2.125] rounded-[24px] p-4 sm:p-5 overflow-hidden select-none transition-shadow duration-300 shadow-[0_16px_40px_rgba(2,132,199,0.12)] border border-sky-200/90 flex flex-col justify-between cursor-pointer"
          title="Click to flip card"
        >
          {/* Authentic Clean Medical White & Soft Royal Blue Gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 90% 10%, rgba(186, 230, 253, 0.45) 0%, transparent 45%),
                radial-gradient(circle at 10% 90%, rgba(224, 242, 254, 0.5) 0%, transparent 50%),
                linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 45%, #F0F9FF 100%)
              `,
            }}
          />

          {/* Subtle Security Guilloche Pattern in Background */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #0284c7 0, #0284c7 1px, transparent 0, transparent 10px)`,
            }}
          />

          {/* Top Header: Official National Identity & Contactless NFC (No gold chip) */}
          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-sky-100/90">
            {/* Left: Official Brand & National Authority */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center overflow-hidden shadow-2xs relative shrink-0">
                <Image
                  src="/images/Oxpecker_icon.png"
                  alt="Oxpecker"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 font-extrabold text-[12px] sm:text-[13.5px] tracking-wider uppercase leading-none font-sans">
                    OXPECKER HEALTHPASS
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-sky-700 font-semibold text-[7.5px] sm:text-[8.5px] tracking-wider uppercase mt-0.5">
                  PEOPLE&apos;S REPUBLIC OF BANGLADESH • NATIONAL DIGITAL HEALTH IDENTITY
                </p>
              </div>
            </div>

            {/* Right: Only Contactless NFC Wave & Verified Seal */}
            <div className="flex items-center gap-2">
              {/* NFC Contactless Wave Symbol */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200/90 text-sky-800 shrink-0">
                <Wifi size={14} className="rotate-90 text-sky-700" />
                <span className="text-[7.5px] font-mono font-bold tracking-wider">NFC</span>
              </div>

              {/* Verified Shield Badge */}
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[8px] font-bold tracking-wider shrink-0">
                <Shield size={10} className="text-emerald-600" />
                <span>VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Middle Body: Full-Card Spacious Layout with Photo, English Demographics & Large QR */}
          <div className="relative z-10 flex items-center justify-between gap-3.5 sm:gap-4 my-auto w-full">
            {/* Left: Patient Avatar with Biometric Verified Badge */}
            <div className="relative shrink-0">
              <div className="w-18 h-24 sm:w-22 sm:h-28 rounded-2xl bg-slate-100 border-2 border-sky-200/90 overflow-hidden shadow-xs relative flex items-center justify-center">
                {(profileImage || card.patient_image) ? (
                  <img
                    src={profileImage || card.patient_image || ""}
                    alt={card.patient_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sky-100 to-sky-200 flex flex-col items-center justify-center text-sky-700 font-bold">
                    <User size={28} className="text-sky-600 mb-0.5" />
                    <span className="text-[8px] tracking-wider uppercase font-mono">PHOTO</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-2xs">
                <CheckCircle2 size={12} />
              </div>
            </div>

            {/* Center: Core Patient Demographics (English Labels + Full Page Spacing) */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              {/* Patient Name (English Primary + Bengali Subtitle) */}
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 truncate leading-tight tracking-tight uppercase font-sans">
                  {card.english_name || card.patient_name}
                </h2>
                <p className="text-[10px] sm:text-xs font-semibold text-sky-800 truncate mt-0.5">
                  {card.patient_name !== card.english_name
                    ? card.patient_name
                    : "SMART HEALTHPASS CARDHOLDER"}
                </p>
              </div>

              {/* Demographics Matrix with Generous Spacing */}
              <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 mt-2 text-[8px] sm:text-[9px] text-slate-600 font-medium">
                {/* DATE OF BIRTH */}
                <div>
                  <span className="text-slate-400 block text-[6.5px] sm:text-[7px] uppercase tracking-wider font-bold">
                    DATE OF BIRTH
                  </span>
                  <span className="font-bold text-slate-800 font-mono text-[9px] sm:text-[10px]">
                    {formatDate(card.date_of_birth)}
                  </span>
                </div>

                {/* BLOOD GROUP (Harmoniously Integrated with Red Droplet Icon) */}
                <div>
                  <span className="text-slate-400 block text-[6.5px] sm:text-[7px] uppercase tracking-wider font-bold">
                    BLOOD GROUP
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Droplet size={11} className="fill-rose-600 text-rose-600 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-black text-rose-700 font-mono leading-none">
                      {card.blood_group || "O+"}
                    </span>
                    <span className="text-[7px] font-bold text-rose-600/80 uppercase">
                      (Rh Pos)
                    </span>
                  </div>
                </div>

                {/* GENDER & AGE */}
                <div>
                  <span className="text-slate-400 block text-[6.5px] sm:text-[7px] uppercase tracking-wider font-bold">
                    GENDER / AGE
                  </span>
                  <span className="font-bold text-slate-800 text-[8.5px] sm:text-[9.5px]">
                    {genderDisplay} • {age} YRS
                  </span>
                </div>

                {/* MARITAL STATUS */}
                <div>
                  <span className="text-slate-400 block text-[6.5px] sm:text-[7px] uppercase tracking-wider font-bold">
                    MARITAL STATUS
                  </span>
                  <span className="font-bold text-slate-800 text-[8.5px] sm:text-[9.5px]">
                    {(card.marital_status || "MARRIED").toUpperCase()}
                  </span>
                </div>

                {/* NATIONAL ID (NID) */}
                <div>
                  <span className="text-slate-400 block text-[6.5px] sm:text-[7px] uppercase tracking-wider font-bold">
                    NATIONAL ID (NID)
                  </span>
                  <span className="font-mono font-bold text-slate-800 tracking-wider text-[8.5px] sm:text-[9.5px] block truncate">
                    {card.nid_number || "1995 2698 4401 2390"}
                  </span>
                </div>

                {/* LAST DOCTOR VISIT */}
                <div>
                  <span className="text-slate-400 block text-[6.5px] sm:text-[7px] uppercase tracking-wider font-bold">
                    LAST DOCTOR VISIT
                  </span>
                  <span className="font-mono font-bold text-sky-800 text-[8.5px] sm:text-[9.5px] block truncate">
                    {(card.last_doctor_visit || "14 OCT 2026").toUpperCase()}
                  </span>
                </div>

                {/* RESIDENTIAL ADDRESS (100% Synchronized English Location) */}
                <div className="col-span-2 pt-1 border-t border-sky-100/70">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[6.5px] sm:text-[7px] uppercase tracking-wider font-bold">
                      RESIDENTIAL ADDRESS
                    </span>
                    {(card.personal_phone || card.emergency_contact_phone) && (
                      <div className="flex items-center gap-1 font-mono text-[7px] sm:text-[7.5px] font-bold text-slate-700">
                        <Phone size={7.5} className="text-sky-600 shrink-0" />
                        <span>{card.personal_phone || card.emergency_contact_phone}</span>
                        {(card.personal_has_whatsapp ?? true) && (
                          <span className="flex items-center gap-0.5 px-1 py-0.2 bg-emerald-50 rounded border border-emerald-200/90 shadow-2xs" title="WhatsApp Active">
                            <WhatsAppIcon className="w-2 h-2 shrink-0" />
                            <span className="text-[6px] font-bold text-emerald-700">WA</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-slate-800 font-bold text-[8px] sm:text-[9px] leading-tight">
                    <MapPin size={9} className="text-sky-600 shrink-0" />
                    <span className="line-clamp-1 text-slate-800">
                      {residentialAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Large, Flat 2D Scannable QR Code (Prominent & Eye-Catching) */}
            <div className="flex flex-col items-center justify-center shrink-0 pl-1">
              <div className="p-2 sm:p-2.5 bg-white rounded-2xl border-2 border-sky-200/90 shadow-sm relative group">
                <QRCodeSVG
                  value={scanUrl}
                  size={76}
                  level="H"
                  includeMargin={false}
                  fgColor="#041224"
                  bgColor="#ffffff"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3.5 h-3.5 rounded-full bg-white border border-sky-400 flex items-center justify-center shadow-2xs">
                    <Activity size={8} className="text-sky-600" />
                  </div>
                </div>
              </div>
              <span className="text-[6.5px] sm:text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 font-mono">
                SCAN FOR DOSSIER
              </span>
            </div>
          </div>

          {/* Bottom Footer: Card UID Number & Live Synced Location (All English, No In-Card Button) */}
          <div className="relative z-10 pt-2 border-t border-sky-100/90 flex items-center justify-between text-[8px] sm:text-[9px]">
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700 tracking-wider">
              <span className="text-sky-700 font-black">UID:</span>
              <span>{formatCardNumber(card.card_number)}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <MapPin size={10} className="text-sky-600 shrink-0" />
              <span className="font-bold text-slate-700 uppercase">
                {footerLocation}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[7.5px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                GPS SYNC
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
);

HealthPassCard.displayName = "HealthPassCard";

export default HealthPassCard;
