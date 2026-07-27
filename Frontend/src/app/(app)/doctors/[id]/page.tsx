"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Star, MapPin, Award, CheckCircle2, Languages, Clock, Hospital, GraduationCap, FileText, CalendarDays, AlertCircle, BadgeCheck } from "lucide-react";
import { mockDoctors, DoctorProfile } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { BookingModal } from "@/components/doctors/BookingModal";
import { GoogleMap } from "@/components/shared/GoogleMap";

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [activeMapIndex, setActiveMapIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const isGuest = !user;

  const handleBookingClick = () => {
    if (isGuest) {
      router.push("/login");
    } else {
      router.push(`/doctors/${doctor?.id}/book`);
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const doc = mockDoctors.find(d => d.id === resolvedParams.id);
    if (doc) setDoctor(doc);
    // Simulate loading for skeleton
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [resolvedParams.id]);

  if (!doctor || isLoading) {
    return (
      <div className="h-full overflow-y-auto bg-[#F8FAFC] pb-32 font-sans">
        {/* Skeleton: Sticky Nav */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center">
            <div className="w-32 h-5 bg-slate-200 animate-pulse rounded-lg"></div>
          </div>
        </div>

        {/* Skeleton: Profile Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row gap-8 items-center py-12">
            {/* Avatar */}
            <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-full bg-slate-200 animate-pulse shrink-0"></div>
            
            {/* Header Details */}
            <div className="flex-1 flex flex-col items-center md:items-start gap-4 w-full">
              {/* Badges */}
              <div className="flex gap-3">
                <div className="w-28 h-8 bg-slate-100 animate-pulse rounded-full"></div>
                <div className="w-32 h-8 bg-slate-100 animate-pulse rounded-full"></div>
                <div className="w-36 h-8 bg-slate-100 animate-pulse rounded-full hidden sm:block"></div>
              </div>
              {/* Name */}
              <div className="w-72 h-10 bg-slate-200 animate-pulse rounded-xl"></div>
              {/* Title */}
              <div className="w-48 h-6 bg-slate-100 animate-pulse rounded-lg"></div>
              {/* Hospital */}
              <div className="w-56 h-5 bg-slate-100 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Skeleton: Content */}
        <div className="max-w-[1280px] mx-auto mt-12 px-6 flex flex-col lg:flex-row gap-12">
          {/* Left Column */}
          <div className="w-full lg:w-[65%] space-y-10">
            {/* About */}
            <div>
              <div className="w-36 h-6 bg-slate-200 animate-pulse rounded-lg mb-4"></div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="w-full h-4 bg-slate-100 animate-pulse rounded"></div>
                <div className="w-full h-4 bg-slate-100 animate-pulse rounded"></div>
                <div className="w-3/4 h-4 bg-slate-100 animate-pulse rounded"></div>
              </div>
            </div>

            {/* Chambers */}
            <div>
              <div className="w-48 h-6 bg-slate-200 animate-pulse rounded-lg mb-4"></div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                {[1, 2].map(i => (
                  <div key={i} className="flex flex-col gap-3 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-48 h-5 bg-slate-200 animate-pulse rounded-lg"></div>
                    <div className="w-64 h-4 bg-slate-100 animate-pulse rounded"></div>
                    <div className="flex gap-3">
                      <div className="w-28 h-8 bg-slate-50 animate-pulse rounded-md border border-slate-200"></div>
                      <div className="w-36 h-8 bg-slate-50 animate-pulse rounded-md border border-slate-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="w-32 h-6 bg-slate-200 animate-pulse rounded-lg mb-4"></div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="space-y-2">
                      <div className="w-40 h-5 bg-slate-200 animate-pulse rounded"></div>
                      <div className="w-56 h-4 bg-slate-100 animate-pulse rounded"></div>
                    </div>
                    <div className="w-20 h-5 bg-green-100 animate-pulse rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[35%] space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-8 bg-slate-200 animate-pulse rounded-lg"></div>
                <div className="w-16 h-4 bg-slate-100 animate-pulse rounded"></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-8 bg-slate-200 animate-pulse rounded-lg"></div>
                <div className="w-16 h-4 bg-slate-100 animate-pulse rounded"></div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-36 h-5 bg-slate-200 animate-pulse rounded-lg mb-3"></div>
              <div className="w-48 h-4 bg-slate-100 animate-pulse rounded mb-1"></div>
              <div className="w-32 h-4 bg-slate-100 animate-pulse rounded mb-4"></div>
              <div className="w-full h-[240px] bg-slate-100 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] pb-32 font-sans relative">
      
      {/* Sticky Navigation */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 shadow-sm shadow-slate-100/50">
        <div className="max-w-[1280px] mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] font-bold text-[16px] transition-colors"
          >
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to Search</span><span className="sm:hidden">Back</span>
          </button>
          
          {/* Desktop Nav Booking Button */}
          <div className="hidden md:block">
            <button 
              onClick={handleBookingClick}
              className="h-[48px] bg-primary hover:bg-[#0052cc] text-white rounded-xl flex items-center justify-between gap-4 pl-5 pr-1.5 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 group overflow-hidden border border-primary/20 hover:-translate-y-0.5"
            >
              <span className="font-bold text-[15px] tracking-wide">Book Appointment</span>
              <div className="bg-white/20 backdrop-blur-md border border-white/20 text-white h-[38px] px-4 rounded-lg flex items-center justify-center gap-1 font-[900] text-[16px]">
                <span>৳</span>{doctor.fee.toString().replace(/[^0-9]/g, '')}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* PROFILE HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row gap-8 items-center py-12 relative">
          
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-full overflow-hidden border border-slate-200 bg-slate-50 z-10 relative">
              <Image src={doctor.image} alt={doctor.name} fill sizes="140px" className="object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 z-20 bg-white rounded-full p-0.5">
              <CheckCircle2 size={24} className="text-[#22C55E] fill-white" />
            </div>
          </div>
          
          {/* Header Details */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full items-center md:items-start w-full">
            
            <h1 className="text-[32px] md:text-[48px] leading-[1.2] font-[800] text-[#0F172A] mb-3 tracking-tight text-center md:text-left">
              {doctor.name}
              {doctor.verified && <BadgeCheck size={32} className="inline-block ml-1.5 text-blue-500 fill-blue-50 align-middle -mt-1.5" />}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="bg-primary/10 text-primary font-bold text-[14px] px-4 py-1.5 rounded-full uppercase tracking-wider">
                {doctor.specialty}
              </span>
            </div>
            
            <p className="text-[20px] md:text-[22px] text-[#64748B] font-medium mb-2">
              {doctor.title}
            </p>
            <p className="text-[18px] text-[#0F172A] font-medium flex items-center justify-center md:justify-start gap-2 mb-4">
              <Hospital size={20} className="text-[#64748B]" /> {doctor.hospital}
            </p>
            
            {/* Rating moved down here */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <span className="flex items-center gap-1.5 text-[#F59E0B] text-[15px] font-bold bg-[#F59E0B]/10 px-4 py-2 rounded-full">
                <Star size={18} className="fill-[#F59E0B]" /> {doctor.rating} ({doctor.reviews} Reviews)
              </span>
            </div>
            
            {/* Mobile Book Now Button (Hidden on Desktop) */}
            <div className="md:hidden mt-6 w-full">
              <button 
                onClick={handleBookingClick}
                className="w-full h-[56px] bg-primary hover:bg-[#0052cc] text-white rounded-xl flex items-center justify-between gap-6 pl-6 pr-1.5 transition-all shadow-xl shadow-primary/30 hover:shadow-primary/40 group overflow-hidden border border-primary/20"
              >
                <span className="font-bold text-[16px] tracking-wide">Book Appointment</span>
                <div className="bg-white/20 backdrop-blur-md border border-white/20 text-white h-[44px] px-5 rounded-lg flex items-center justify-center gap-1 font-[900] text-[18px]">
                  <span>৳</span>{doctor.fee.toString().replace(/[^0-9]/g, '')}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE CONTENT (2 Columns) */}
      <div className="max-w-[1280px] mx-auto mt-12 px-6 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: 65% */}
        <div className="w-full lg:w-[65%] space-y-[48px]">
          
          {/* About Doctor */}
          <section>
            <h2 className="text-[20px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="text-primary" size={20} /> About Doctor
            </h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <p className="text-slate-600 text-[15px] leading-relaxed">
                {doctor.about}
              </p>
            </div>
          </section>

          {/* Chambers & Schedule */}
          {doctor.chambers && doctor.chambers.length > 0 && (
            <section>
              <h2 className="text-[20px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDays className="text-primary" size={20} /> Chambers & Schedule
              </h2>
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-6">
                {doctor.chambers.map((chamber, idx) => (
                  <div key={idx} className="flex flex-col gap-2 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    
                    <div 
                      className="cursor-pointer group flex flex-col gap-2 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
                      onClick={() => setActiveMapIndex(activeMapIndex === idx ? null : idx)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-primary transition-colors">{chamber.name}</h3>
                        <span className="text-[12px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                          {activeMapIndex === idx ? "Hide Map" : "View Map"}
                        </span>
                      </div>
                      
                      <p className="text-[14px] text-slate-500 flex items-center gap-1.5">
                        <MapPin size={16} /> {chamber.address}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md group-hover:border-primary/30 transition-colors">
                          <Clock size={14} className="text-slate-500" />
                          <span className="text-[13px] font-medium text-slate-700">{chamber.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md group-hover:border-primary/30 transition-colors">
                          <CalendarDays size={14} className="text-slate-500" />
                          <span className="text-[13px] font-medium text-slate-700">{chamber.days}</span>
                        </div>
                      </div>
                    </div>

                    {/* Conditional Map Render for this specific chamber */}
                    {activeMapIndex === idx && (
                      <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200">
                          <GoogleMap 
                            lat={doctor.mapLocation?.lat || 23.8052} 
                            lng={doctor.mapLocation?.lng || 90.3639} 
                            title={`${chamber.name} Location`}
                          />
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Qualifications */}
          <section>
            <h2 className="text-[20px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="text-primary" size={20} /> Education
            </h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex flex-col gap-4">
                {doctor.qualifications.map((qual, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900 mb-0.5">{qual.degree}</h3>
                      <p className="text-[13px] text-slate-500">{qual.institute}, {qual.year}</p>
                    </div>
                    {qual.verified && (
                      <div className="flex items-center gap-1 mt-2 md:mt-0 text-[#22C55E]">
                        <CheckCircle2 size={16} className="fill-[#22C55E] text-white" />
                        <span className="text-[12px] font-bold uppercase tracking-wider">Verified</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: 35% */}
        <div className="w-full lg:w-[35%] space-y-[48px]">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[28px] font-bold text-primary mb-0.5">{doctor.experienceYears}+</span>
              <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Years Exp</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[28px] font-bold text-slate-900 mb-0.5">{doctor.reviews}</span>
              <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Patients</span>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-[16px] font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="text-primary" size={18} /> Practice Location
            </h2>
            <p className="text-slate-900 font-medium text-[14px] mb-0.5">{doctor.hospital}</p>
            <p className="text-slate-500 text-[13px] mb-4">{doctor.location}</p>
            
            <div className="w-full h-[240px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://maps.google.com/maps?q=${doctor.mapLocation.lat},${doctor.mapLocation.lng}&hl=en&z=14&amp;output=embed`}
              >
              </iframe>
            </div>
          </div>
          
        </div>
      </div>

      {/* Removed Bottom Booking Bar in favor of Top Right CTA */}
    </div>
  );
}
