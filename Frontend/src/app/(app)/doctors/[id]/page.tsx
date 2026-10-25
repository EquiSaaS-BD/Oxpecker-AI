"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Building,
  GraduationCap,
  FileText,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Phone,
  Share2,
  HeartPulse,
  Award,
  Sparkles,
  Activity,
  ArrowRight,
  Check,
} from "lucide-react";
import { mockDoctors, type DoctorProfile } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { GoogleMap } from "@/components/shared/GoogleMap";
import { toast, Toaster } from "sonner";

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { user } = useAuth();
  const isGuest = !user;

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedChamberIndex, setSelectedChamberIndex] = useState(0);

  useEffect(() => {
    const rawId = resolvedParams.id;
    // Match directly, or with doc- prefix, or stripping doc-
    let doc = mockDoctors.find(
      (d) =>
        d.id === rawId ||
        d.id === `doc-${rawId}` ||
        d.id.replace("doc-", "") === rawId
    );

    // Fallback to first doctor if invalid ID provided so page never hangs
    if (!doc && mockDoctors.length > 0) {
      doc = mockDoctors[0];
    }

    if (doc) {
      setDoctor(doc);
    }

    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [resolvedParams.id]);

  const handleBookingClick = () => {
    if (isGuest) {
      router.push("/login");
    } else {
      router.push(`/doctors/${doctor?.id}/book`);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Doctor profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center animate-pulse">
            <Stethoscope size={28} />
          </div>
          <p className="text-sm font-bold text-slate-500">Loading Doctor Profile...</p>
        </div>
      </div>
    );
  }

  const initials = doctor.name
    .replace(/Prof\.|Dr\.|Professor/gi, "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || "DR";

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 font-sans text-slate-900">
      <Toaster position="top-right" richColors />

      {/* Top Glass Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/doctors")}
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Directory</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>/</span>
              <span className="text-slate-600 truncate max-w-[200px]">{doctor.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
            </button>

            <button
              onClick={handleBookingClick}
              className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs hover:shadow cursor-pointer"
            >
              <CalendarDays size={16} />
              <span>Book Appointment</span>
              <span className="bg-sky-500/80 px-2 py-0.5 rounded-md text-[11px] font-black text-white ml-1">
                ৳ {doctor.fee.toLocaleString()}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Doctor Profile Banner Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            
            {/* Doctor Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-slate-200 bg-sky-50 shadow-md flex items-center justify-center relative">
                {!imageError && doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    sizes="144px"
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="font-black text-sky-700 text-3xl tracking-widest">{initials}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-xs border border-slate-200">
                <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-50" />
              </div>
            </div>

            {/* Header Details */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope size={13} />
                  {doctor.specialty}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  {doctor.bmdc_reg}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  {doctor.availability}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                {doctor.name}
              </h1>

              <p className="text-sm sm:text-base font-bold text-sky-700 mt-1">
                {doctor.title}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {doctor.department}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Building size={16} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{doctor.hospital}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span>{doctor.rating}</span>
                  <span className="text-slate-500 font-normal">({doctor.reviews} verified patient reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Performance Metric Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Experience</span>
              <strong className="text-lg sm:text-xl font-black text-slate-900">{doctor.experienceYears}+ Years</strong>
              <span className="text-[10px] text-slate-500 block">Clinical & OPD</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Patients Served</span>
              <strong className="text-lg sm:text-xl font-black text-sky-700">12,000+</strong>
              <span className="text-[10px] text-slate-500 block">Treated Cases</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">BMDC Verified</span>
              <strong className="text-lg sm:text-xl font-black text-emerald-700">{doctor.qualifications.length} Degrees</strong>
              <span className="text-[10px] text-slate-500 block">Post-Grad Registered</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Satisfaction</span>
              <strong className="text-lg sm:text-xl font-black text-amber-600">99.4%</strong>
              <span className="text-[10px] text-slate-500 block">Patient Recommended</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Bio, Chambers, Qualifications, Procedures */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section 1: About Doctor */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Clinical Biography & Profile</h2>
                <p className="text-xs text-slate-500">Overview of specialist expertise, qualifications, and patient care approach</p>
              </div>
            </div>

            <div className="mt-4 text-sm leading-relaxed text-slate-700 space-y-3 font-normal">
              <p>{doctor.about}</p>
              <p>
                As an accredited specialist, {doctor.name} provides comprehensive diagnostic evaluation, rational pharmaceutical prescription management, pre-admission workup, and outpatient follow-ups. All consultations synchronize automatically with the patient&apos;s Universal Health Pass, ensuring full emergency continuity.
              </p>
            </div>

            {/* Special Clinical Interests */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                Clinical Focus & Treated Procedures:
              </span>
              <div className="flex flex-wrap gap-2">
                {doctor.specialtiesList.map((proc, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-800 hover:text-sky-800 border border-slate-200/80 text-xs font-semibold transition-colors"
                  >
                    {proc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: OPD Chambers & Visiting Schedule */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">OPD Chambers & Visiting Hours</h2>
                  <p className="text-xs text-slate-500">Consultation suites and outpatient schedule</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {doctor.chambers.length} Chambers Available
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {doctor.chambers.map((chamber, idx) => {
                const isSelected = selectedChamberIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-5 transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-50/30 ring-1 ring-sky-500/20"
                        : "border-slate-200/90 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{chamber.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {chamber.room || "Room 201"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <span>{chamber.address}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                        <strong className="text-base font-black text-slate-900">৳ {doctor.fee.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock size={14} className="text-sky-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">{chamber.days}</span>
                          <span className="block text-slate-500">{chamber.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone size={14} className="text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">Direct Helpline:</span>
                          <span className="block text-slate-500">{chamber.phone || "+880 1711-000000"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedChamberIndex(idx)}
                        className={`text-xs font-bold cursor-pointer transition-colors ${
                          isSelected ? "text-sky-700 underline" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {isSelected ? "✓ Selected Chamber" : "Select This Chamber"}
                      </button>

                      <Link
                        href={`/doctors/${doctor.id}/book?chamber=${encodeURIComponent(chamber.name)}`}
                        className="h-8 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>Book This Chamber</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Verified Medical Education & Degrees */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Education & Board Qualifications</h2>
                <p className="text-xs text-slate-500">BMDC registered medical degrees and specialist diplomas</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {doctor.qualifications.map((qual, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 gap-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{qual.degree}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{qual.institute}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center pl-11 sm:pl-0">
                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      {qual.year}
                    </span>
                    {qual.verified && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Universal Health ID & Admission Continuity */}
          <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Activity size={16} />
                <span>Zero Duplicate Tests Guarantee</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Universal Health ID & 1-Second Emergency Continuity
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                When you consult {doctor.name}, your digital prescription, vitals, allergy profile, and lab results are automatically archived to your Oxpecker Universal Health Pass. If admission or ICU is needed, hospital wards receive your verified history instantaneously.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/hospital/dashboard/health-pass"
                  className="h-9 px-4 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
                >
                  <span>Explore Universal Health Pass</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Sticky Booking Card, Map & Hospital Info */}
        <div className="lg:col-span-4 space-y-6">

          {/* Card 1: Fast Appointment Booking */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Consultation Fee
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-slate-900">৳ {doctor.fee.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-medium">/ OPD Visit</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                {doctor.availability}
              </span>
            </div>

            {/* Fee Policy Details */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50 text-slate-600">
                <span>New OPD Consultation:</span>
                <strong className="text-slate-900 font-bold">৳ {doctor.fee.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50 text-slate-600">
                <span>Follow-up (within 14 days):</span>
                <strong className="text-slate-900 font-bold">৳ {doctor.followUpFee.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between items-center py-1 text-slate-600">
                <span>Lab Report Review (7 days):</span>
                <strong className="text-emerald-600 font-bold">FREE</strong>
              </div>
            </div>

            {/* Next Available Slot */}
            <div className="mt-5 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs">
              <div className="flex items-center gap-2 text-sky-800 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Next Available Slot:</span>
              </div>
              <p className="text-slate-700 font-semibold pl-4">
                Today at 05:30 PM (Chamber Suite 201)
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-5 space-y-2.5">
              <button
                onClick={handleBookingClick}
                className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <CalendarDays size={18} />
                <span>Book OPD Appointment</span>
              </button>

              <button
                onClick={() => router.push("/chat")}
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Stethoscope size={15} className="text-sky-600" />
                <span>AI Clinical Consultation First</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              100% Free Cancellation up to 2 hours before appointment
            </p>
          </div>

          {/* Card 2: Hospital Location & Interactive Map */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin size={18} className="text-rose-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Hospital Location</h3>
                <p className="text-[11px] text-slate-500">{doctor.hospital}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3 font-medium">
              {doctor.chambers[0]?.address || doctor.location}
            </p>

            <div className="mt-3.5 h-[220px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <GoogleMap
                lat={doctor.mapLocation.lat}
                lng={doctor.mapLocation.lng}
                title={`${doctor.name} - ${doctor.hospital}`}
                className="h-full w-full"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Emergency Hotline:</span>
              <strong className="text-slate-900 font-bold">+880 1711-098765</strong>
            </div>
          </div>

          {/* Card 3: Oxpecker Safety & Quality Guarantee */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-5 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Oxpecker Medical Quality Guarantee</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-slate-500 text-[11px]">
              <li>BMDC License strictly verified & attested</li>
              <li>Auto-synced to Universal Health Pass</li>
              <li>No duplicate diagnostic charges</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
