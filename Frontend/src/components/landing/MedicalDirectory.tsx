"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Building2, UserCircle2, ArrowRight, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { mockDoctors } from "@/lib/mockData";

export function MedicalDirectory() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"doctors" | "hospitals">("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState<"doctors" | "hospitals">("doctors");
  const [isFocused, setIsFocused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const initialHospitals = [
    { id: 1, name: "Square Hospitals Ltd.", type: "Multi-specialty", rating: "4.8", loc: "Panthapath, Dhaka", img: "https://ui-avatars.com/api/?name=Square+Hospital&background=e8edff&color=003d9b" },
    { id: 2, name: "Evercare Hospital", type: "JCI Accredited", rating: "4.9", loc: "Bashundhara, Dhaka", img: "https://ui-avatars.com/api/?name=Evercare+Hospital&background=e8edff&color=003d9b" },
    { id: 3, name: "Labaid Specialized", type: "Cardiac & General", rating: "4.7", loc: "Dhanmondi, Dhaka", img: "https://ui-avatars.com/api/?name=Labaid+Specialized&background=e8edff&color=003d9b" },
  ];
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -350 : 350;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setActiveTab(searchType);
  }, [searchType]);

  // Mobile Auto-Scroll Logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (window.innerWidth < 768 && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If reached the end, loop back to start instantly to avoid rewind animation
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: "auto" });
        } else {
          scrollRef.current.scrollBy({ left: 340, behavior: "smooth" });
        }
      }
    }, 2500); // 2.5 seconds per card

    return () => clearInterval(interval);
  }, [activeTab, searchQuery, searchLocation, isPlaying]);

  const filteredDoctors = mockDoctors.filter(doc => {
    const matchesQuery = !searchQuery || 
                         doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !searchLocation || doc.location.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesQuery && matchesLocation;
  });

  const filteredHospitals = initialHospitals.filter(hosp => {
    const matchesQuery = !searchQuery || 
                         hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         hosp.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !searchLocation || hosp.loc.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesQuery && matchesLocation;
  });

  return (
    <section id="doctors" className="relative py-16 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            <Search size={16} />
            {t("Medical Directory", "মেডিকেল ডিরেক্টরি")}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-5xl font-bold text-[#0a1628] leading-tight"
          >
            {t("Find the Best Doctors & Hospitals", "সেরা ডাক্তার ও হাসপাতাল খুঁজুন")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-slate-500 max-w-5xl mx-auto"
          >
            {t(
              "Book appointments with top healthcare professionals and leading hospitals across Bangladesh instantly.",
              "বাংলাদেশের শীর্ষস্থানীয় ডাক্তার এবং সেরা হাসপাতালগুলোতে মুহূর্তেই অ্যাপয়েন্টমেন্ট বুক করুন।"
            )}
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={{ 
            scale: isFocused ? 1.02 : 1, 
            boxShadow: isFocused ? "0 20px 40px -10px rgba(47,128,237,0.25)" : "0 10px 30px -10px rgba(0,0,0,0.05)" 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          viewport={{ once: true }}
          className={`max-w-5xl mx-auto bg-white p-3 rounded-2xl border flex flex-col md:flex-row gap-3 mb-16 relative z-20 transition-colors duration-300 ${isFocused ? "border-primary/40 ring-4 ring-primary/10" : "border-slate-100"}`}
        >
          {/* Professional Text Select */}
          <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-3 md:w-48 border-r border-slate-200/50 hover:bg-slate-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all cursor-pointer group shrink-0">
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as "doctors" | "hospitals")}
              className="appearance-none bg-transparent border-none outline-none w-full text-slate-700 font-bold cursor-pointer pr-8 z-10"
            >
              <option value="doctors" className="font-medium">{t("Doctors", "ডাক্তার")}</option>
              <option value="hospitals" className="font-medium">{t("Hospitals", "হাসপাতাল")}</option>
            </select>
            <div className="absolute right-4 text-slate-400 group-hover:text-primary transition-colors pointer-events-none z-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>

          <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search size={20} className={`mr-3 shrink-0 transition-colors ${isFocused ? "text-primary" : "text-slate-400"}`} />
            <input 
              type="text" 
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === "doctors" ? t("Search by doctor name or specialty...", "ডাক্তারের নাম বা স্পেশালিটি খুঁজুন...") : t("Search hospitals...", "হাসপাতাল খুঁজুন...")}
              className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <MapPin size={20} className={`mr-3 shrink-0 transition-colors ${isFocused ? "text-primary" : "text-slate-400"}`} />
            <input 
              type="text" 
              value={searchLocation}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder={t("Location (e.g. Dhaka)", "লোকেশন (যেমন: ঢাকা)")}
              className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-container hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center shrink-0">
            {t("Search", "খুঁজুন")}
          </button>
        </motion.div>

        {/* Toggle Tabs */}
        <div className="flex justify-center mb-10 relative z-20">
          <div className="bg-slate-100 p-1.5 rounded-xl flex gap-2 shadow-inner">
            <button
              onClick={() => setActiveTab("doctors")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "doctors" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserCircle2 size={18} />
              {t("Doctors", "ডাক্তার")}
            </button>
            <button
              onClick={() => setActiveTab("hospitals")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "hospitals" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Building2 size={18} />
              {t("Hospitals", "হাসপাতাল")}
            </button>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === "doctors" ? (
                <motion.div 
                key="doctors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative group/slider"
                onClick={() => setIsPlaying(false)}
                onDoubleClick={() => setIsPlaying(true)}
              >
                {/* Scroll Buttons */}
                <button 
                  onClick={() => scroll("left")}
                  className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary opacity-0 group-hover/slider:opacity-100 focus-within:opacity-100 active:opacity-100 transition-all duration-300 hover:scale-125 drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)]"
                >
                  <ChevronLeft size={32} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => scroll("right")}
                  className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary opacity-0 group-hover/slider:opacity-100 focus-within:opacity-100 active:opacity-100 transition-all duration-300 hover:scale-125 drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)]"
                >
                  <ChevronRight size={32} strokeWidth={2.5} />
                </button>

                {/* Slider Container */}
                <div 
                  ref={scrollRef}
                  className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-4 -mx-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {filteredDoctors.length === 0 ? (
                    <div className="w-full py-10 flex flex-col items-center justify-center text-slate-400">
                      <Search size={40} className="mb-4 text-slate-300" />
                      <p>{t("No doctors found matching your search.", "আপনার খোঁজা ডাক্তার পাওয়া যায়নি।")}</p>
                    </div>
                  ) : (
                    filteredDoctors.map((doc) => (
                      <motion.div 
                        key={doc.id}
                        whileHover={{ y: -5 }}
                        className="w-[85vw] max-w-[320px] sm:min-w-[320px] snap-center bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/40 group hover:border-primary/20 transition-all shrink-0 flex flex-col items-center text-center relative"
                      >
                        {/* Rating Badge - Top Right */}
                        <div className="absolute top-6 right-6 flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold z-10">
                          <Star size={12} className="fill-orange-500" />
                          {doc.rating}
                        </div>

                        {/* Profile Picture */}
                        <div className="w-20 h-20 rounded-full overflow-hidden shadow-md ring-2 ring-primary/20 ring-offset-2 ring-offset-white mb-4 mt-2 relative">
                          <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                        </div>
                        
                        {/* Name (One Line) */}
                        <div className="flex items-center justify-center gap-1.5 mb-1 w-full px-2">
                          <h3 className="font-bold text-[18px] sm:text-[20px] text-[#0a1628] truncate leading-tight">{doc.name}</h3>
                          {doc.verified && <BadgeCheck size={18} className="text-blue-500 fill-blue-50 shrink-0" />}
                        </div>
                        
                        {/* Specialist */}
                        <p className="text-primary font-medium text-[14px] mb-5 truncate w-full px-4">{doc.specialty}</p>
                        
                        {/* Details */}
                        <div className="space-y-2.5 mb-6 w-full flex flex-col items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 text-slate-600 text-[13.5px] font-medium">
                            <UserCircle2 size={16} className="text-slate-400" /> {doc.experienceYears} Years Exp.
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 text-[13.5px] font-medium w-full justify-center px-2">
                            <MapPin size={16} className="text-slate-400 shrink-0" /> 
                            <span className="truncate">{doc.location}</span>
                          </div>
                        </div>

                        <Link href="/login" className="w-full bg-primary/5 hover:bg-primary hover:text-white active:bg-primary active:text-white text-primary font-bold text-[15px] py-3 rounded-xl flex items-center justify-center transition-colors mt-auto border border-primary/10">
                          {t("Book Appointment", "অ্যাপয়েন্টমেন্ট বুক করুন")}
                        </Link>
                      </motion.div>
                    ))
                )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="hospitals"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative group/slider"
                onClick={() => setIsPlaying(false)}
                onDoubleClick={() => setIsPlaying(true)}
              >
                {/* Scroll Buttons */}
                <button 
                  onClick={() => scroll("left")}
                  className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-secondary opacity-0 group-hover/slider:opacity-100 focus-within:opacity-100 active:opacity-100 transition-all duration-300 hover:scale-125 drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)]"
                >
                  <ChevronLeft size={32} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => scroll("right")}
                  className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-secondary opacity-0 group-hover/slider:opacity-100 focus-within:opacity-100 active:opacity-100 transition-all duration-300 hover:scale-125 drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)]"
                >
                  <ChevronRight size={32} strokeWidth={2.5} />
                </button>

                {/* Slider Container */}
                <div 
                  ref={scrollRef}
                  className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-4 -mx-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                {filteredHospitals.length === 0 ? (
                  <div className="w-full py-10 flex flex-col items-center justify-center text-slate-400">
                    <Building2 size={40} className="mb-4 text-slate-300" />
                    <p>{t("No hospitals found matching your search.", "আপনার খোঁজা হাসপাতাল পাওয়া যায়নি।")}</p>
                  </div>
                ) : (
                  filteredHospitals.map((hosp) => (
                    <motion.div 
                      key={hosp.id}
                    whileHover={{ y: -5 }}
                    className="w-[85vw] max-w-[320px] sm:min-w-[320px] snap-center bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/40 group hover:border-secondary/20 transition-all shrink-0"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm p-1">
                        <img src={hosp.img} alt={hosp.name} className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold">
                        <Star size={12} className="fill-orange-500" />
                        {hosp.rating}
                      </div>
                    </div>
                    <h3 className="font-bold text-xl text-[#0a1628] mb-1">{hosp.name}</h3>
                    <p className="text-secondary font-medium text-sm mb-4">{hosp.type}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin size={16} /> {hosp.loc}
                      </div>
                    </div>

                    <Link href="/hospitals" className="w-full bg-slate-50 hover:bg-secondary hover:text-white text-secondary font-bold text-sm py-3 rounded-xl flex items-center justify-center transition-colors">
                      {t("View Details", "বিস্তারিত দেখুন")}
                    </Link>
                  </motion.div>
                  ))
                )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View All CTA */}
          <div className="flex justify-center mt-12">
            <Link href="/login" className="group flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-colors">
              {activeTab === "doctors" ? t("View All Doctors", "সব ডাক্তার দেখুন") : t("View All Hospitals", "সব হাসপাতাল দেখুন")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
