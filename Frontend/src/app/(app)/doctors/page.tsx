"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Stethoscope, Heart, Activity, Pill, Syringe, ShieldCheck } from "lucide-react";
import { mockDoctors } from "@/lib/mockData";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilterModal } from "@/components/doctors/DoctorFilterModal";

function DoctorCardSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      {/* Avatar & Rating */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse ring-2 ring-slate-200 ring-offset-2 ring-offset-white"></div>
        <div className="w-12 h-6 bg-slate-100 animate-pulse rounded-lg"></div>
      </div>
      {/* Name */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3/5 h-6 bg-slate-200 animate-pulse rounded-lg"></div>
        <div className="w-5 h-5 bg-slate-100 animate-pulse rounded-full"></div>
      </div>
      {/* Details */}
      <div className="space-y-2.5 mt-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-slate-100 animate-pulse rounded"></div>
          <div className="w-2/5 h-4 bg-slate-100 animate-pulse rounded"></div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-slate-100 animate-pulse rounded"></div>
          <div className="w-1/3 h-4 bg-slate-100 animate-pulse rounded"></div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-slate-100 animate-pulse rounded"></div>
          <div className="w-1/2 h-4 bg-slate-100 animate-pulse rounded"></div>
        </div>
      </div>
      {/* Button */}
      <div className="w-full h-11 bg-slate-100 animate-pulse rounded-xl"></div>
    </div>
  );
}

export default function DoctorsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredDoctors = mockDoctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const medicalIcons = [
    { Icon: Stethoscope, label: "Diagnostics" },
    { Icon: Heart, label: "Cardiology" },
    { Icon: Activity, label: "Health Monitor" },
    { Icon: Pill, label: "Pharmacy" },
    { Icon: Syringe, label: "Vaccination" },
    { Icon: ShieldCheck, label: "Verified" },
  ];

   return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC]">
      {/* HERO SECTION */}
      <div className="w-full py-16 flex flex-col items-center justify-center bg-white border-b border-slate-200 relative overflow-hidden">
        
        {/* Floating Background Medical Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { Icon: Stethoscope, top: '8%', left: '5%', size: 30, delay: 0, dur: 8, color: '#3B82F6' },
            { Icon: Heart, top: '15%', right: '8%', size: 26, delay: 1, dur: 7, color: '#EF4444' },
            { Icon: Activity, top: '65%', left: '10%', size: 24, delay: 2, dur: 9, color: '#10B981' },
            { Icon: Pill, top: '70%', right: '12%', size: 28, delay: 0.5, dur: 6, color: '#F59E0B' },
            { Icon: Syringe, top: '30%', left: '15%', size: 22, delay: 3, dur: 10, color: '#8B5CF6' },
            { Icon: ShieldCheck, top: '45%', right: '6%', size: 26, delay: 1.5, dur: 8, color: '#22C55E' },
            { Icon: Stethoscope, top: '80%', left: '25%', size: 20, delay: 4, dur: 7, color: '#0EA5E9' },
            { Icon: Heart, top: '20%', right: '22%', size: 22, delay: 2.5, dur: 9, color: '#F43F5E' },
            { Icon: Pill, top: '50%', left: '3%', size: 24, delay: 1, dur: 11, color: '#F97316' },
            { Icon: Activity, top: '10%', right: '30%', size: 20, delay: 3.5, dur: 8, color: '#14B8A6' },
          ].map((item, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: item.top,
                left: (item as any).left,
                right: (item as any).right,
                color: item.color,
                opacity: 0.12,
                animation: `floatIcon ${item.dur}s ease-in-out ${item.delay}s infinite`,
              }}
            >
              <item.Icon size={item.size} strokeWidth={1.5} />
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes floatIcon {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.12; }
            25% { transform: translateY(-14px) rotate(6deg); opacity: 0.2; }
            50% { transform: translateY(-5px) rotate(-4deg); opacity: 0.15; }
            75% { transform: translateY(-18px) rotate(5deg); opacity: 0.22; }
          }
        `}</style>

        <div className="w-full max-w-[1280px] px-[20px] md:px-[32px] lg:px-[48px] flex flex-col items-center text-center relative z-10">

          <h1 className="text-[36px] md:text-[48px] font-[800] text-slate-900 mb-2 leading-tight tracking-[-0.04em]">
            Find a <span className="text-primary bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Specialist</span>
          </h1>
          <p className="text-[16px] text-slate-500 max-w-[600px] mb-8 font-medium">
            Search for doctors, clinics, and hospitals.
          </p>

          <div className="w-full max-w-[720px] flex items-center bg-white/60 backdrop-blur-md border-[1.5px] border-primary/20 shadow-[0_8px_30px_rgb(0,61,155,0.08)] rounded-[16px] focus-within:border-primary focus-within:shadow-[0_8px_30px_rgb(0,61,155,0.15)] transition-all duration-300 p-1.5">
            <div className="pl-4 pr-2 flex items-center justify-center">
              <Search className="text-primary/70" size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name or specialty..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-12 px-1 sm:px-2 bg-transparent text-[14px] sm:text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
            />
            <button 
              onClick={() => setShowFilters(true)}
              className="h-[44px] sm:h-[48px] px-3 sm:px-6 bg-primary hover:bg-[#0052cc] text-white rounded-[12px] flex items-center justify-center gap-2 font-bold text-[14px] sm:text-[15px] transition-all duration-300 shadow-md ml-1 sm:ml-2 shrink-0"
            >
              <SlidersHorizontal size={18} className="text-white/90 shrink-0" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="w-full max-w-[1280px] mx-auto px-[20px] md:px-[32px] lg:px-[48px] py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-slate-900">Doctors ({isLoading ? "..." : filteredDoctors.length})</h2>
          <select className="bg-transparent text-[14px] font-medium text-slate-500 border-none focus:outline-none cursor-pointer">
            <option>Recommended</option>
            <option>Highest Rated</option>
            <option>Lowest Fee</option>
          </select>
        </div>

        {(() => {
          if (isLoading) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
                {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                  <DoctorCardSkeleton key={skeleton} />
                ))}
              </div>
            );
          }

          if (filteredDoctors.length === 0) {
            return (
              <div className="w-full py-20 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg text-center">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center mb-4">
                  <Search size={24} className="text-slate-400" />
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-1">No results</h3>
                <p className="text-[14px] text-slate-500">Try adjusting your filters.</p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setShowFilters(true);
                  }}
                  className="mt-4 px-4 py-2 bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-md font-medium text-[14px] transition-colors"
                >
                  Adjust Filters
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
              {filteredDoctors.map(doctor => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* FILTER MODAL */}
      <DoctorFilterModal 
        isOpen={showFilters} 
        onClose={() => setShowFilters(false)} 
      />
    </div>
  );
}
