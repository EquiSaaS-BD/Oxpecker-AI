"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Pill, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Activity,
  Brain,
  BugOff,
  Apple,
  Wind,
  FlaskConical,
  Syringe
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = ["All Types", "Gastric", "Painkiller", "Antibiotic", "Vitamins", "Allergy"];

// Mock Data with specific icons mapping to their use cases
const MEDICINES = [
  { id: 1, name: "Napa Extend", price: "৳ 2.50", mg: "665mg", type: "Tablet", category: "Painkiller", useFor: "Fever & Body ache", Icon: Brain, iconColor: "text-rose-500", iconBg: "bg-rose-500/10 border-rose-500/20" },
  { id: 2, name: "Seclo", price: "৳ 6.00", mg: "20mg", type: "Capsule", category: "Gastric", useFor: "Acidity & Heartburn", Icon: Activity, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: 3, name: "Sergel", price: "৳ 7.00", mg: "20mg", type: "Capsule", category: "Gastric", useFor: "Ulcer & Acidity", Icon: Activity, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: 4, name: "Maxpro", price: "৳ 7.00", mg: "20mg", type: "Tablet", category: "Gastric", useFor: "Acid Reflux", Icon: Activity, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: 5, name: "Monas", price: "৳ 17.50", mg: "10mg", type: "Tablet", category: "Allergy", useFor: "Asthma & Allergies", Icon: Wind, iconColor: "text-sky-500", iconBg: "bg-sky-500/10 border-sky-500/20" },
  { id: 6, name: "Finix", price: "৳ 6.00", mg: "20mg", type: "Tablet", category: "Gastric", useFor: "Severe Acidity", Icon: Activity, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: 7, name: "Fexo", price: "৳ 9.00", mg: "120mg", type: "Tablet", category: "Allergy", useFor: "Runny Nose", Icon: Wind, iconColor: "text-sky-500", iconBg: "bg-sky-500/10 border-sky-500/20" },
  { id: 8, name: "Alatrol", price: "৳ 4.00", mg: "10mg", type: "Tablet", category: "Allergy", useFor: "Skin Allergy", Icon: Wind, iconColor: "text-sky-500", iconBg: "bg-sky-500/10 border-sky-500/20" },
  { id: 9, name: "Ceevit", price: "৳ 2.00", mg: "250mg", type: "Chewable", category: "Vitamins", useFor: "Vitamin C Def.", Icon: Apple, iconColor: "text-amber-500", iconBg: "bg-amber-500/10 border-amber-500/20" },
  { id: 10, name: "Ace", price: "৳ 1.50", mg: "500mg", type: "Tablet", category: "Painkiller", useFor: "Headache", Icon: Brain, iconColor: "text-rose-500", iconBg: "bg-rose-500/10 border-rose-500/20" },
  { id: 11, name: "Azithromycin", price: "৳ 35.00", mg: "500mg", type: "Tablet", category: "Antibiotic", useFor: "Bacterial Inf.", Icon: BugOff, iconColor: "text-purple-500", iconBg: "bg-purple-500/10 border-purple-500/20" },
  { id: 12, name: "Ciprofloxacin", price: "৳ 12.00", mg: "500mg", type: "Tablet", category: "Antibiotic", useFor: "Severe Infections", Icon: BugOff, iconColor: "text-purple-500", iconBg: "bg-purple-500/10 border-purple-500/20" },
  { id: 13, name: "Napa Syrup", price: "৳ 20.00", mg: "120mg/5ml", type: "Syrup", category: "Painkiller", useFor: "Fever for Kids", Icon: Brain, iconColor: "text-rose-500", iconBg: "bg-rose-500/10 border-rose-500/20" },
  { id: 14, name: "Ceftriaxone", price: "৳ 150.00", mg: "1g", type: "Injection", category: "Antibiotic", useFor: "Critical Infection", Icon: BugOff, iconColor: "text-purple-500", iconBg: "bg-purple-500/10 border-purple-500/20" },
];

export function MedicineMarqueeSection() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Types");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: -340, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: 340, behavior: "smooth" });
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMedicines = MEDICINES.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All Types" || med.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const isFiltering = searchQuery.length > 0 || activeCategory !== "All Types";

  // Mobile Auto-Scroll Logic for Slider
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      if (window.innerWidth < 768 && sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          sliderRef.current.scrollTo({ left: 0, behavior: "auto" });
        } else {
          sliderRef.current.scrollBy({ left: 340, behavior: "smooth" });
        }
      }
    }, 2500); // 2.5 seconds per card

    return () => clearInterval(interval);
  }, [activeCategory, searchQuery, isPlaying]);

  // Helper for background watermark icon
  const getBgWatermark = (type: string) => {
    if (type === "Syrup") return <FlaskConical size={140} strokeWidth={1} />;
    if (type === "Injection") return <Syringe size={140} strokeWidth={1} />;
    return <Pill size={140} strokeWidth={1} />; // Tablet/Capsule default
  };

  // Production-level Glassmorphism Card
  const MedCard = ({ med }: { med: typeof MEDICINES[0] }) => (
    <Link 
      href="/login"
      className="block relative overflow-hidden bg-white/50 backdrop-blur-xl border border-white/80 p-4 sm:p-5 rounded-[24px] shadow-[0_8px_32px_rgba(0,61,155,0.06)] hover:shadow-[0_16px_48px_rgba(0,61,155,0.12)] hover:border-primary/30 transition-all duration-300 w-[85vw] sm:w-[320px] max-w-[320px] shrink-0 mx-auto group cursor-pointer"
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent opacity-50 pointer-events-none z-0"></div>
      
      {/* Type-based Background Watermark Icon */}
      <div className="absolute -bottom-6 -right-6 text-slate-900 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none z-0">
        {getBgWatermark(med.type)}
      </div>

      <div className="relative z-10 flex gap-4">
        {/* Left Area: Use Case Icon */}
        <div className={`w-[72px] h-[72px] shrink-0 rounded-2xl flex flex-col items-center justify-center border ${med.iconBg} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
          <med.Icon size={28} className={med.iconColor} strokeWidth={1.5} />
        </div>

        {/* Right Area: Info */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[18px] font-extrabold text-slate-900 group-hover:text-primary transition-colors tracking-tight truncate max-w-[160px]">{med.name}</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
              <ShieldCheck size={12} />
            </div>
          </div>
          
          <p className="text-[13px] font-semibold text-slate-500 mb-1.5">{med.mg} • {med.type}</p>
          
          <p className={`text-[12px] font-bold ${med.iconColor} truncate`}>
            Used for: <span className="font-medium text-slate-600">{med.useFor}</span>
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-slate-200/60">
        <span className="text-[20px] font-black text-slate-900">{med.price}</span>
        <span className="text-[13px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View Details <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );

  return (
    <section id="medicines" className="py-24 bg-[#F8FAFC] border-t border-slate-100 overflow-hidden relative">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mb-12 text-center relative z-[60]">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-primary border border-primary/10 mb-6 font-bold text-sm shadow-sm">
          <Pill size={16} />
          <span>{t("Medicine Information", "ওষুধের তথ্যাবলি")}</span>
        </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0a1628] mb-4">
            Find <span className="text-primary bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Medicine</span>
          </h2>
        
        {/* Unified Search & Filter Bar */}
        <div className="max-w-[650px] mx-auto mt-10 relative z-[70]" ref={dropdownRef}>
          <div className="flex items-center w-full h-[60px] bg-white border border-slate-200 rounded-[30px] shadow-[0_8px_24px_rgba(0,0,0,0.04)] focus-within:shadow-[0_8px_32px_rgba(0,61,155,0.12)] focus-within:border-primary/40 transition-all duration-300">
            
            {/* Search Input (Left 70%) */}
            <div className="flex-1 flex items-center h-full pl-5 pr-2">
              <Search size={20} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines..."
                className="w-full h-full bg-transparent border-none outline-none pl-3 text-[15px] text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Divider */}
            <div className="w-[1px] h-8 bg-slate-200 shrink-0"></div>

            {/* Dropdown Trigger (Right 30%) */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-full px-5 flex items-center justify-between gap-2 text-[14px] font-bold text-slate-700 hover:text-primary transition-colors shrink-0 min-w-[130px]"
            >
              <span className="truncate">{activeCategory}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Dropdown Menu - Glassmorphism */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-[70px] w-[200px] bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_16px_40px_rgba(0,61,155,0.1)] border border-white/80 overflow-hidden z-[100] animate-fade-in-up">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-[14px] font-bold transition-colors border-b border-white/40 last:border-0 ${
                    activeCategory === cat ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-white/60 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slider View (Always on Mobile, or Desktop when filtering) */}
      <div className={`max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-12 relative z-20 min-h-[300px] ${!isFiltering ? 'block md:hidden' : 'block'}`}>
        {filteredMedicines.length > 0 ? (
          <div 
            className="relative group/slider px-2"
            onClick={() => setIsPlaying(false)}
            onDoubleClick={() => setIsPlaying(true)}
          >
            {/* Left Scroll Button */}
            <button 
              onClick={scrollLeft}
              className="absolute -left-2 sm:-left-6 lg:-left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 rounded-full flex items-center justify-center text-slate-700 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:text-primary hover:scale-110 disabled:opacity-0"
            >
              <ChevronLeft size={24} />
            </button>

            <div 
              ref={sliderRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {filteredMedicines.map(med => (
                <div key={med.id} className="w-[85vw] sm:w-[320px] max-w-[320px] shrink-0 snap-center">
                  <MedCard med={med} />
                </div>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button 
              onClick={scrollRight}
              className="absolute -right-2 sm:-right-6 lg:-right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 rounded-full flex items-center justify-center text-slate-700 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:text-primary hover:scale-110 disabled:opacity-0"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-center text-slate-400 mb-5">
              <Stethoscope size={36} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">No medicines found</h3>
            <p className="text-slate-500 font-medium">We couldn't find any medicine matching your search criteria.</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("All Types"); }}
              className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-primary hover:shadow-lg transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Marquee Wrapper (Desktop Default - Only shows when not searching/filtering) */}
      {!isFiltering && (
        <div className="relative w-full hidden md:flex flex-col mt-14 z-10">
          {/* Top Fade Masks for smooth scrolling entry/exit */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-56 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent z-30 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-24 md:w-56 bg-gradient-to-l from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent z-30 pointer-events-none"></div>

          {/* Single Row: Left to Right */}
          <div className="flex w-fit animate-[shustota-marquee_80s_linear_infinite] hover:[animation-play-state:paused] py-4">
            {[...MEDICINES, ...MEDICINES, ...MEDICINES].map((med, i) => (
              <div key={`row-${i}`} className="mx-4 lg:mx-5">
                <MedCard med={med} />
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
