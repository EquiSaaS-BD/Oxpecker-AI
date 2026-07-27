"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Clock,
  Video,
  Calendar,
  Building2,
  Languages,
  User,
} from "lucide-react";

interface Doctor {
  name: string;
  degree: string;
  speciality: string;
  experience: number;
  hospital: string;
  consultationFee: number;
  languages: string[];
  location: string;
  rating: number;
  reviewCount: number;
  videoConsult: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm w-full max-w-md overflow-hidden relative"
    >
      {/* Video Consult Badge */}
      {doctor.videoConsult && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
          <Video className="w-3.5 h-3.5" />
          Video
        </div>
      )}

      {/* Header: Avatar + Name */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#003d9b] to-[#0052cc] flex items-center justify-center text-white font-bold text-lg shadow-md">
          {getInitials(doctor.name)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">
            {doctor.name}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">{doctor.degree}</p>
          <span className="inline-block mt-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
            {doctor.speciality}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{doctor.experience} yrs exp.</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <span className="font-semibold text-slate-800">{doctor.rating}</span>
          <span className="text-slate-400">({doctor.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{doctor.hospital}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{doctor.location}</span>
        </div>
      </div>

      {/* Fee */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">Consultation Fee</span>
        <span className="text-lg font-bold text-[#09E083]">
          ৳{doctor.consultationFee}
        </span>
      </div>

      {/* Languages */}
      {doctor.languages && doctor.languages.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Languages className="w-4 h-4 text-slate-400 shrink-0" />
          {doctor.languages.map((lang, i) => (
            <span
              key={i}
              className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium"
            >
              {lang}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="my-4 border-t border-slate-100" />

      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 bg-[#09E083] hover:bg-[#07c972] text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          Book Appointment
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/doctor/profile/${doctor.id || 'demo'}`)}
          className="flex-1 flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors bg-white cursor-pointer"
        >
          <User className="w-4 h-4" />
          View Profile
        </motion.button>
      </div>
    </motion.div>
  );
}
