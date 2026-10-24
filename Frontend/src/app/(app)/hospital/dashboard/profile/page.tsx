"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Edit2,
  Plus,
  Trash2,
  MapPin,
  Building,
  Clock,
  LogOut,
  BedDouble,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";
import type { BedGig, BedStatus } from "@/types/hospital-hms";
import {
  getHospitalBeds,
  deleteHospitalBed,
  updateBedStatus,
} from "@/lib/hospital-hms";

export default function HospitalProfilePage() {
  const { user, logout } = useAuth();
  const [beds, setBeds] = useState<BedGig[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  // Load Beds on Mount
  useEffect(() => {
    setBeds(getHospitalBeds());
  }, []);

  // Quick stats
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === "Occupied").length;
  const vacantBeds = beds.filter((b) => b.status === "Vacant").length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Filtered Gigs
  const filteredBeds =
    selectedFilter === "All"
      ? beds
      : beds.filter((b) => b.category === selectedFilter || b.status === selectedFilter);

  // Delete Bed Gig
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`Are you sure you want to remove bed ${id} from your hospital registry?`)) {
      const updated = deleteHospitalBed(id);
      setBeds(updated);
      toast.success(`Bed ${id} removed successfully`);
    }
  };

  // Quick Status Toggle
  const handleStatusChange = (bedId: string, newStatus: BedStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = updateBedStatus(bedId, newStatus);
    setBeds(updated);
    toast.info(`Bed ${bedId} status changed to ${newStatus}`);
  };

  return (
    <div className="w-full space-y-8 pb-16">
      <Toaster position="top-right" richColors />

      {/* 1. Singapore-Grade Hospital Header Section */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs overflow-hidden relative">
        {/* Cover Photo */}
        <div className="relative w-full h-[220px] sm:h-[260px] bg-slate-900 group">
          <Image
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=600&fit=crop"
            alt="Hospital Banner"
            fill
            priority
            className="object-cover opacity-90 group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-md backdrop-blur-md">
              <ShieldCheck size={14} /> Singapore Hospital Ecosystem
            </span>
            <button className="bg-white/90 hover:bg-white text-slate-800 h-9 px-3.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md transition-all cursor-pointer">
              <Camera size={15} />
              Change Cover
            </button>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-16 relative">
          {/* Hospital Logo Avatar */}
          <div className="absolute -top-[55px] left-6 group cursor-pointer">
            <div className="w-[110px] h-[110px] rounded-2xl border-4 border-white shadow-xl bg-white relative overflow-hidden flex items-center justify-center">
              <Image
                src="/images/Oxpecker_Full.png"
                alt="Hospital Logo"
                fill
                className="object-contain p-2"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={22} />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-1">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user?.hospital_name || user?.name || "Oxpecker International Specialist Hospital"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <Sparkles size={12} /> JCI & DGHS Certified
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2.5 text-xs sm:text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building size={16} className="text-emerald-600" />
                  Tertiary Care & Trauma Center
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-rose-600" />
                  {user?.address || "Road 27, Dhanmondi, Dhaka-1209"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} className="text-blue-600" />
                  24/7 Critical Care & Emergency
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/hospital/dashboard/beds/new"
                className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={16} />
                Add Bed Suite (Full Page)
              </Link>
              <Link
                href="/hospital/dashboard/patients"
                className="h-11 px-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <UserCheck size={16} />
                Admissions Desk
              </Link>
              <button
                type="button"
                onClick={logout}
                className="h-11 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Live Ecosystem Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-100 bg-slate-50/70 p-4 gap-4 text-center">
          <div className="p-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Bed Gigs
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalBeds}</p>
          </div>
          <div className="p-2 border-l border-slate-200/60">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Available (Vacant)
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{vacantBeds}</p>
          </div>
          <div className="p-2 border-l border-slate-200/60">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              Inpatient Occupied
            </span>
            <p className="text-2xl font-black text-orange-600 mt-0.5">{occupiedBeds}</p>
          </div>
          <div className="p-2 border-l border-slate-200/60">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Occupancy Rate
            </span>
            <p className="text-2xl font-black text-blue-600 mt-0.5">{occupancyRate}%</p>
          </div>
        </div>
      </div>

      {/* 2. Bed Gigs & Inpatient Suites Showcase */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BedDouble className="text-emerald-600" size={24} />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hospital Bed Gigs & Clinical Suites
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Fiverr-style bed listing & package management. Click any suite to open its full-page clinical editor and booking management.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/hospital/dashboard/beds/new"
              className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Plus size={18} />
              Add New Bed Gig (Full Page)
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            "All",
            "Vacant",
            "Occupied",
            "ICU",
            "CCU",
            "VIP Suite",
            "Deluxe Cabin",
            "General Ward",
            "NICU",
          ].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedFilter(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === tag
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Create New Bed Gig Card (Direct Full-Page Link) */}
          <Link
            href="/hospital/dashboard/beds/new"
            className="w-full min-h-[420px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors shadow-xs">
              <Plus size={28} className="text-slate-500 group-hover:text-emerald-700" />
            </div>
            <div className="text-center">
              <span className="text-base font-bold text-slate-800 group-hover:text-emerald-800 block">
                Publish New Bed Gig (Full Page)
              </span>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                Add multiple room photos, ICU amenities, daily pricing, and live real-time preview
              </p>
            </div>
          </Link>

          {/* Render Bed Gigs */}
          {filteredBeds.map((gig) => {
            const isVacant = gig.status === "Vacant";
            const isOccupied = gig.status === "Occupied";
            const isCleaning = gig.status === "Cleaning";
            const coverImage =
              (gig.images && gig.images[0]) ||
              gig.image ||
              "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop";
            const photoCount = (gig.images && gig.images.length) || 1;

            return (
              <motion.div
                key={gig.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-2xl border border-slate-200/80 bg-white hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group relative"
              >
                {/* Photo & Category Header */}
                <div className="w-full h-[200px] bg-slate-900 relative overflow-hidden">
                  <img
                    src={coverImage}
                    alt={gig.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Bed ID & Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider border border-white/20">
                      {gig.id}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold">
                      {gig.category}
                    </span>
                  </div>

                  {/* Top Right Action Icons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/hospital/dashboard/beds/${encodeURIComponent(gig.id)}`}
                      title="Edit Suite (Full Page)"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                    >
                      <Edit2 size={14} />
                    </Link>
                    <button
                      onClick={(e) => handleDelete(gig.id, e)}
                      title="Delete Gig"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Ward Location & Status on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 truncate max-w-[180px] font-medium text-slate-200">
                      <MapPin size={12} className="text-emerald-400 shrink-0" />
                      {gig.ward}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md ${
                        isVacant
                          ? "bg-emerald-500/90 text-white"
                          : isOccupied
                          ? "bg-amber-500/90 text-white"
                          : isCleaning
                          ? "bg-cyan-500/90 text-white"
                          : "bg-rose-500/90 text-white"
                      }`}
                    >
                      {gig.status}
                    </span>
                  </div>
                </div>

                {/* Gig Details Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/hospital/dashboard/beds/${encodeURIComponent(gig.id)}`}
                      className="text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1 leading-snug"
                    >
                      {gig.title}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {gig.description}
                    </p>

                    {/* Occupant Notice if Occupied */}
                    {isOccupied && gig.currentPatientName && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs">
                        <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                          <UserCheck size={13} className="text-amber-600" />
                          Admitted: <strong>{gig.currentPatientName}</strong>
                        </span>
                        <Link
                          href="/hospital/dashboard/patients"
                          className="text-[11px] font-bold text-amber-700 hover:underline"
                        >
                          Dossier →
                        </Link>
                      </div>
                    )}

                    {/* Amenities Feature Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {gig.features.slice(0, 3).map((feat, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          {feat}
                        </span>
                      ))}
                      {gig.features.length > 3 && (
                        <span className="text-[11px] font-bold text-slate-400 self-center">
                          +{gig.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Quick Action Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Hospital Daily Rate
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {gig.priceDisplay || `৳ ${gig.price.toLocaleString()} / day`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/hospital/dashboard/beds/${encodeURIComponent(gig.id)}`}
                        className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        Details
                      </Link>

                      {isVacant ? (
                        <Link
                          href={`/hospital/dashboard/patients?bed=${encodeURIComponent(gig.id)}`}
                          className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                        >
                          Admit <ArrowRight size={12} />
                        </Link>
                      ) : (
                        <button
                          onClick={(e) =>
                            handleStatusChange(
                              gig.id,
                              isOccupied ? "Cleaning" : "Vacant",
                              e
                            )
                          }
                          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Mark {isOccupied ? "Vacated" : "Ready"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
