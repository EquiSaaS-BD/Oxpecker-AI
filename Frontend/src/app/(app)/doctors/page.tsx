"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  Stethoscope, 
  Heart, 
  Activity, 
  Pill, 
  Syringe, 
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Star,
  Banknote,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockDoctors } from "@/lib/mockData";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilterModal } from "@/components/doctors/DoctorFilterModal";
import { Pagination } from "@/components/ui/Pagination";

const SORT_OPTIONS: { id: "recommended" | "rating" | "fee"; label: string; icon: any; iconColor: string; description: string }[] = [
  { 
    id: "recommended", 
    label: "Recommended", 
    icon: Sparkles, 
    iconColor: "text-sky-500",
    description: "Best match for patient needs" 
  },
  { 
    id: "rating", 
    label: "Highest Rated", 
    icon: Star, 
    iconColor: "text-amber-500",
    description: "Top patient reviews & satisfaction" 
  },
  { 
    id: "fee", 
    label: "Lowest Fee", 
    icon: Banknote, 
    iconColor: "text-emerald-500",
    description: "Most affordable consultation fees" 
  },
];

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
  const [sortBy, setSortBy] = useState<"recommended" | "rating" | "fee">("recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  // Pagination State (21 items per page)
  const ITEMS_PER_PAGE = 21;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when search or sort criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "fee") return (Number(a.fee) || 0) - (Number(b.fee) || 0);
    return 0;
  });

  const totalPages = Math.ceil(sortedDoctors.length / ITEMS_PER_PAGE);
  const paginatedDoctors = sortedDoctors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-semibold text-xs uppercase tracking-widest mb-6">
            <ShieldCheck size={14} className="text-emerald-600" />
            BMDC Verified & Connected
          </div>

          <h1 className="text-[36px] md:text-[48px] font-[800] text-slate-900 mb-4 leading-tight tracking-[-0.04em]">
            National <span className="text-sky-600">Specialist Network</span>
          </h1>
          <p className="text-[16px] text-slate-500 max-w-[700px] mb-8 font-medium leading-relaxed">
            Every doctor listed is verified. Book appointments and manage your health profile, ensuring all your medical records stay updated across any hospital you visit.
          </p>

          <div className="w-full max-w-[720px] flex items-center bg-white/60 backdrop-blur-md border-[1.5px] border-primary/20 shadow-[0_8px_30px_rgb(0,61,155,0.08)] rounded-[16px] focus-within:border-primary focus-within:shadow-[0_8px_30px_rgb(0,61,155,0.15)] transition-all duration-300 p-1.5">
            <div className="pl-4 pr-2 flex items-center justify-center">
              <Search className="text-sky-600/70" size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, specialty, or hospital..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-12 px-1 sm:px-2 bg-transparent text-[14px] sm:text-[15px] text-slate-900 placeholder:text-slate-500 focus:outline-none min-w-0"
            />
            <button 
              onClick={() => setShowFilters(true)}
              className="h-[44px] sm:h-[48px] px-3 sm:px-6 bg-sky-600 hover:bg-[#0052cc] text-white rounded-[12px] flex items-center justify-center gap-2 font-bold text-[14px] sm:text-[15px] transition-all duration-300 shadow-md ml-1 sm:ml-2 shrink-0"
            >
              <SlidersHorizontal size={18} className="text-white shrink-0" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div ref={resultsTopRef} className="w-full max-w-[1280px] mx-auto px-[20px] md:px-[32px] lg:px-[48px] py-12 scroll-mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-slate-900 flex items-center gap-2">
            Doctors
            <span className="text-[13px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
              {isLoading ? "..." : sortedDoctors.length}
            </span>
          </h2>

          {/* Custom Professional Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`flex items-center gap-2.5 bg-white border ${
                isSortOpen 
                  ? "border-sky-500 ring-4 ring-sky-500/10 shadow-sm" 
                  : "border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm"
              } rounded-xl px-3.5 py-2 text-[13px] sm:text-[14px] font-semibold text-slate-800 transition-all duration-200 cursor-pointer select-none`}
              aria-expanded={isSortOpen}
              aria-haspopup="listbox"
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const current = SORT_OPTIONS.find(opt => opt.id === sortBy) || SORT_OPTIONS[0];
                  const Icon = current.icon;
                  return (
                    <>
                      <Icon size={16} className={current.iconColor} />
                      <span className="text-slate-400 font-normal hidden sm:inline">Sort:</span>
                      <span className="font-bold text-slate-800">{current.label}</span>
                    </>
                  );
                })()}
              </div>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-200 ${isSortOpen ? "rotate-180 text-sky-600" : ""}`} 
              />
            </button>

            {/* Custom Pop-up Menu */}
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-1.5 shadow-[0_16px_40px_rgba(0,61,155,0.14)] z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Sort Doctors By
                  </div>
                  <div className="space-y-0.5">
                    {SORT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = sortBy === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSortBy(option.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "bg-sky-50 text-sky-900 font-bold border border-sky-100"
                              : "hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-white shadow-xs" : "bg-slate-100"
                            }`}>
                              <Icon size={15} className={option.iconColor} />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[13px] leading-tight ${isSelected ? "text-sky-900 font-bold" : "text-slate-800"}`}>
                                {option.label}
                              </p>
                              <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 truncate">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={16} className="text-sky-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

          if (sortedDoctors.length === 0) {
            return (
              <div className="w-full py-20 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg text-center">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center mb-4">
                  <Search size={24} className="text-slate-500" />
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-1">No results</h3>
                <p className="text-[14px] text-slate-500">Try adjusting your filters.</p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setShowFilters(true);
                  }}
                  className="mt-4 px-4 py-2 bg-white border border-slate-200 hover:border-primary hover:text-sky-600 rounded-md font-medium text-[14px] transition-colors"
                >
                  Adjust Filters
                </button>
              </div>
            );
          }

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
                {paginatedDoctors.map(doctor => (
                  <DoctorCard 
                    key={doctor.id} 
                    doctor={doctor} 
                  />
                ))}
              </div>

              {/* Pagination (21 doctors per page) */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedDoctors.length}
                itemsPerPage={ITEMS_PER_PAGE}
                itemName="Doctors"
                onPageChange={handlePageChange}
              />
            </>
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
