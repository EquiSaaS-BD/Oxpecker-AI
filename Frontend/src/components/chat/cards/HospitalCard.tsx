"use client";

import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Phone,
  Navigation,
  Building2,
  BedDouble,
  ShieldCheck,
  HeartPulse,
  Baby,
  Check,
  X,
  Globe,
} from "lucide-react";

interface Hospital {
  name: string;
  address: string;
  specialities: string[];
  hasEmergency: boolean;
  hasICU: boolean;
  hasNICU: boolean;
  bedAvailability: number;
  consultationFee: number;
  rating: number;
  phone: string;
  website: string;
}

function FacilityBadge({
  label,
  available,
  icon: Icon,
}: {
  label: string;
  available: boolean;
  icon: React.ElementType;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
        available
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-slate-50 text-slate-400 border-slate-200"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {available ? (
        <Check className="w-3 h-3 ml-0.5" />
      ) : (
        <X className="w-3 h-3 ml-0.5" />
      )}
    </div>
  );
}

export function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm w-full max-w-md overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
          <Building2 className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">
            {hospital.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{hospital.address}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-slate-800">
              {hospital.rating}
            </span>
          </div>
        </div>
      </div>

      {/* Specialities */}
      {hospital.specialities && hospital.specialities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {hospital.specialities.map((spec, i) => (
            <span
              key={i}
              className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Facility Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <FacilityBadge
          label="Emergency"
          available={hospital.hasEmergency}
          icon={ShieldCheck}
        />
        <FacilityBadge
          label="ICU"
          available={hospital.hasICU}
          icon={HeartPulse}
        />
        <FacilityBadge
          label="NICU"
          available={hospital.hasNICU}
          icon={Baby}
        />
      </div>

      {/* Stats Row */}
      <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <BedDouble className="w-4 h-4 text-slate-400" />
          <span>
            <strong className="text-slate-800">
              {hospital.bedAvailability}
            </strong>{" "}
            beds available
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">From</span>
          <span className="text-lg font-bold text-[#09E083] ml-1.5">
            ৳{hospital.consultationFee}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      {hospital.website && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{hospital.website}</span>
        </div>
      )}

      {/* Divider */}
      <div className="my-4 border-t border-slate-100" />

      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <motion.a
          href={`tel:${hospital.phone}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 bg-[#09E083] hover:bg-[#07c972] text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer no-underline"
        >
          <Phone className="w-4 h-4" />
          Call
        </motion.a>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors bg-white cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </motion.button>
      </div>
    </motion.div>
  );
}
