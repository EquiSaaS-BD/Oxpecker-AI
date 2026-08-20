"use client";

import { useState } from "react";
import { 
  Pill, 
  ArrowRight, 
  ShieldCheck, 
  Search,
  Activity,
  Brain,
  BugOff,
  Apple,
  Wind,
  Heart,
  Thermometer,
  Syringe,
  FlaskConical,
  Bandage,
  SlidersHorizontal,
  X
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "All", name: "All", icon: Pill, color: "text-slate-500", bg: "bg-slate-100" },
  { id: "Painkiller", name: "Fever & Pain", icon: Thermometer, color: "text-rose-500", bg: "bg-rose-50" },
  { id: "Gastric", name: "Gastric & Ulcer", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "Antibiotic", name: "Antibiotics", icon: BugOff, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "Allergy", name: "Asthma & Allergy", icon: Wind, color: "text-sky-500", bg: "bg-sky-50" },
  { id: "Vitamins", name: "Vitamins & Calcium", icon: Apple, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "Cardiac", name: "Heart & Pressure", icon: Heart, color: "text-red-500", bg: "bg-red-50" }
];

// Mock Data with specific icons mapping to their use cases
const MEDICINES = [
  { id: 1, name: "Napa Extend", price: "৳ 2.50", mg: "665mg", type: "Tablet", category: "Painkiller", useFor: "Fever & Body ache", Icon: Thermometer, bgIcon: Pill, iconColor: "text-rose-500", iconBg: "bg-rose-500/10 border-rose-500/20" },
  { id: 2, name: "Seclo", price: "৳ 6.00", mg: "20mg", type: "Capsule", category: "Gastric", useFor: "Acidity & Heartburn", Icon: Activity, bgIcon: Pill, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: 13, name: "Napa Syrup", price: "৳ 20.00", mg: "120mg/5ml", type: "Syrup", category: "Painkiller", useFor: "Fever for Kids", Icon: Thermometer, bgIcon: FlaskConical, iconColor: "text-rose-500", iconBg: "bg-rose-500/10 border-rose-500/20" },
  { id: 3, name: "Sergel", price: "৳ 7.00", mg: "20mg", type: "Capsule", category: "Gastric", useFor: "Ulcer & Acidity", Icon: Activity, bgIcon: Pill, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: 14, name: "Ceftriaxone", price: "৳ 150.00", mg: "1g", type: "Injection", category: "Antibiotic", useFor: "Critical Infection", Icon: BugOff, bgIcon: Syringe, iconColor: "text-purple-500", iconBg: "bg-purple-500/10 border-purple-500/20" },
  { id: 5, name: "Monas", price: "৳ 17.50", mg: "10mg", type: "Tablet", category: "Allergy", useFor: "Asthma & Allergies", Icon: Wind, bgIcon: Pill, iconColor: "text-sky-500", iconBg: "bg-sky-500/10 border-sky-500/20" },
  { id: 11, name: "Azithromycin", price: "৳ 35.00", mg: "500mg", type: "Tablet", category: "Antibiotic", useFor: "Bacterial Inf.", Icon: BugOff, bgIcon: Pill, iconColor: "text-purple-500", iconBg: "bg-purple-500/10 border-purple-500/20" },
  { id: 9, name: "Ceevit", price: "৳ 2.00", mg: "250mg", type: "Chewable", category: "Vitamins", useFor: "Vitamin C Def.", Icon: Apple, bgIcon: Pill, iconColor: "text-amber-500", iconBg: "bg-amber-500/10 border-amber-500/20" },
  { id: 15, name: "Bizoran", price: "৳ 14.00", mg: "5/20mg", type: "Tablet", category: "Cardiac", useFor: "High Blood Pressure", Icon: Heart, bgIcon: Pill, iconColor: "text-red-500", iconBg: "bg-red-500/10 border-red-500/20" },
];

export function MedicineMarqueeSection() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const filteredMedicines = MEDICINES.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || med.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const MedCard = ({ med, isMarquee = false }: { med: typeof MEDICINES[0], isMarquee?: boolean }) => (
    <Link 
      href="/medicines"
      className={`block relative overflow-hidden bg-white/50 backdrop-blur-xl border border-white/80 p-3 sm:p-5 rounded-[16px] sm:rounded-[24px] shadow-[0_8px_32px_rgba(0,61,155,0.06)] hover:shadow-[0_16px_48px_rgba(0,61,155,0.12)] hover:border-primary/30 transition-all duration-300 group cursor-pointer ${
        isMarquee ? "w-[280px] sm:w-[350px] shrink-0" : "w-full h-full"
      }`}
    >
      <div className="absolute inset-0  from-white/80   opacity-50 pointer-events-none z-0"></div>
      
      {/* Dynamic Faint Background Icon Based on Type (Syrup, Injection, Pill) */}
      <med.bgIcon 
        className="absolute -right-2 -bottom-2 sm:-right-4 sm:-bottom-4 w-24 h-24 sm:w-32 sm:h-32 text-slate-200/50 -rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500" 
        strokeWidth={1}
      />

      <div className="relative z-10 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className={`w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] shrink-0 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border ${med.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <med.Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${med.iconColor}`} strokeWidth={1.5} />
        </div>

        <div className="flex-1 flex flex-col justify-center mt-1 sm:mt-0 min-w-0">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <h3 className="text-[14px] sm:text-[17px] font-extrabold text-slate-900 group-hover:text-primary transition-colors tracking-tight truncate pr-2">{med.name}</h3>
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50 shrink-0">
              <ShieldCheck size={12} />
            </div>
          </div>
          
          <p className="text-[11px] sm:text-[12px] font-semibold text-slate-500 mb-0.5 sm:mb-1 line-clamp-1">{med.mg} <span className="hidden sm:inline">• {med.type}</span></p>
          
          <p className={`text-[10px] sm:text-[12px] font-bold ${med.iconColor} truncate`}>
            <span className="hidden sm:inline">For: </span><span className="font-medium text-slate-600">{med.useFor}</span>
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-200/60">
        <span className="text-[16px] sm:text-[18px] font-black text-slate-900">{med.price}</span>
        <span className="text-[11px] sm:text-[13px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Details <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
        </span>
      </div>
    </Link>
  );

  return (
    <section id="medicines" className="py-24 bg-[#F8FAFC] border-t border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-[60]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-primary border border-primary/10 mb-6 font-bold text-sm shadow-sm">
            <Pill size={16} />
            <span>{t("Medicine Usage Guide", "ওষুধের ব্যবহার গাইড")}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0a1628] mb-4">
            Find Medicines by <span className="text-primary     ">Symptom</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-[90vw] mx-auto whitespace-nowrap overflow-hidden text-ellipsis">
            Browse commonly prescribed medicines grouped by their primary usage. 
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 max-w-[600px] w-full relative z-20">
            <div className="flex-1 bg-white rounded-[16px] flex items-center p-2 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm h-[54px]">
              <div className="pl-4 pr-3 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines by name or generic..."
                className="w-full h-full bg-transparent border-none outline-none py-2 text-[15px] text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-[14px] w-[54px] h-[54px] shrink-0 flex items-center justify-center transition-all shadow-sm"
            >
              <SlidersHorizontal size={20} />
            </button>
            <button className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white rounded-[14px] px-6 h-[54px] items-center justify-center gap-2 text-[15px] font-bold transition-colors shadow-sm shrink-0">
              Search
            </button>
          </div>
        </div>
        
        {/* Category Tabs moved to Sidebar */}
        {/* Category tabs are now inside the filter drawer */}
        
        <div className="min-h-[400px]">
          {filteredMedicines.length > 0 ? (
            (searchQuery === "" && activeCategory === "All") ? (
              <div className="mt-12 overflow-hidden w-full relative z-10" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
                {/* Infinite Scrolling Marquee for Default View */}
                <motion.div
                  className="flex gap-6 w-max"
                  animate={{ x: [0, -1000] }}
                  transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 25,
                  }}
                >
                  {/* Double the array for seamless loop */}
                  {[...MEDICINES, ...MEDICINES].map((med, idx) => (
                    <MedCard key={idx} med={med} isMarquee={true} />
                  ))}
                </motion.div>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pt-6"
              >
                {/* Grid Layout for Filtered View */}
                {filteredMedicines.map((med, idx) => (
                  <motion.div
                    key={med.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MedCard med={med} />
                  </motion.div>
                ))}
              </motion.div>
            )
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-center text-slate-400 mb-5">
                <Search size={36} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">No medicines found</h3>
              <p className="text-slate-500 font-medium">Try selecting a different category or change your search query.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-primary transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Premium Filter Sidebar Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-[#0a1628]/40 backdrop-blur-md z-[100]"
            />
            
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300, mass: 0.8 }}
              className="fixed top-0 right-0 h-full w-full max-w-[340px] bg-white/95 backdrop-blur-xl shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-[101] flex flex-col rounded-l-[32px] border-l border-white/50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100/50">
                <h3 className="text-[20px] font-extrabold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <SlidersHorizontal size={16} className="text-primary" />
                  </div>
                  Filters
                </h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 hover:bg-rose-50 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-hide">
                <motion.div 
                  className="flex flex-col gap-3"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                    }
                  }}
                >
                  <motion.p variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }} className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</motion.p>
                  
                  {CATEGORIES.map(cat => (
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                      }}
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setIsFilterOpen(false);
                      }}
                      className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-[15px] transition-colors duration-200 ${
                        activeCategory === cat.id 
                          ? `${cat.bg} ${cat.color}` 
                          : "bg-transparent text-slate-600 hover:bg-slate-100/80"
                      }`}
                    >
                      <cat.icon size={20} className={activeCategory === cat.id ? cat.color : "text-slate-400 group-hover:text-slate-600"} />
                      {cat.name}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
              
              <div className="p-6 md:p-8 border-t border-slate-100/50 bg-slate-50/50 backdrop-blur-md">
                <button 
                  onClick={() => { setActiveCategory("All"); setSearchQuery(""); setIsFilterOpen(false); }}
                  className="w-full h-[54px] rounded-2xl border-none bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}
