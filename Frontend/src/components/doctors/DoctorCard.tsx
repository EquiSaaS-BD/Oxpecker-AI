"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, BadgeCheck, Stethoscope, Eye, Calendar, Sparkles } from "lucide-react";
import type { DoctorProfile } from "@/lib/mockData";

interface DoctorCardProps {
  doctor: DoctorProfile;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const [imageError, setImageError] = useState(false);
  const initials = doctor.name
    .replace(/Prof\.|Dr\.|Professor/gi, "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || "DR";

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-300 flex flex-col justify-between h-full group">
      <div>
        {/* Top: Avatar, BMDC & Rating */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-sky-50 shadow-inner flex items-center justify-center relative shrink-0">
              {!imageError && doctor.image ? (
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="font-black text-sky-700 text-lg tracking-wider">{initials}</span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active BMDC License" />
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-lg text-xs font-bold">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>{doctor.rating}</span>
              <span className="text-amber-500/70 font-normal">({doctor.reviews})</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {doctor.bmdc_reg}
            </span>
          </div>
        </div>

        {/* Doctor Name & Title */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/doctors/${doctor.id}`}
              className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1"
            >
              {doctor.name}
            </Link>
            {doctor.verified && (
              <BadgeCheck size={18} className="text-sky-600 fill-sky-50 shrink-0" />
            )}
          </div>
          <p className="text-xs font-semibold text-sky-700 mt-0.5 line-clamp-1">{doctor.title}</p>
        </div>

        {/* Clinical Specs */}
        <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Stethoscope size={14} className="text-sky-600 shrink-0" />
            <span className="font-semibold text-slate-800 truncate">{doctor.specialty}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 shrink-0">{doctor.experienceYears}+ Yrs Exp</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-rose-500 shrink-0" />
            <span className="truncate text-slate-600">{doctor.hospital}</span>
          </div>
        </div>
      </div>

      {/* Bottom: Fee & Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Consultation Fee</span>
            <span className="font-black text-slate-900 text-base">৳ {doctor.fee.toLocaleString()}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {doctor.availability}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/doctors/${doctor.id}`}
            className="h-9 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye size={14} />
            <span>Profile</span>
          </Link>
          <Link
            href={`/doctors/${doctor.id}/book`}
            className="h-9 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow"
          >
            <Calendar size={14} />
            <span>Book Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
