"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Search, ScanBarcode, ChevronRight, ChevronLeft, ShoppingCart, UploadCloud, 
  CheckCircle2, TrendingDown, Image as ImageIcon, Sparkles,
  Pill, Activity, Brain, BugOff, Apple, Wind, Heart, Thermometer, ShieldCheck, ArrowRight,
  SlidersHorizontal, X, Syringe, FlaskConical, Bandage
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function MedicinesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getBgIcon = (type: string) => {
    if (!type) return Pill;
    const t = type.toLowerCase();
    if (t.includes('syrup') || t.includes('suspension')) return FlaskConical;
    if (t.includes('injection') || t.includes('iv')) return Syringe;
    if (t.includes('cream') || t.includes('ointment')) return Bandage;
    return Pill;
  };
  
  // Real Data States
  const [medicines, setMedicines] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Labor Illusion states
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const scanSteps = [
    { title: "Initializing High-Resolution Image Capture...", pct: 15 },
    { title: "Running Optical Character Recognition (OCR)...", pct: 40 },
    { title: "Parsing Active Pharmaceutical Ingredients (APIs)...", pct: 65 },
    { title: "Mapping Generic Equivalents & Querying DGDA Database...", pct: 85 },
    { title: "Optimizing Pricing Algorithms & Finding Nearest Alternatives...", pct: 99 }
  ];

  const fetchMedicines = async (pageNum: number, isNewSearch: boolean = false) => {
    try {
      if (isNewSearch) setIsLoading(true);
      else setIsLoadingMore(true);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        category: activeCategory,
        q: searchQuery
      });

      const res = await fetch(`/api/medicines/all?${params.toString()}`);
      const data = await res.json();

      if (data && data.data) {
        if (isNewSearch) {
          setMedicines(data.data);
        } else {
          setMedicines(prev => [...prev, ...data.data]);
        }
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Trigger search/filter changes
  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      setPage(1);
      fetchMedicines(1, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchMedicines(newPage, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadPrescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);
    setCurrentStepIndex(0);

    // Dynamic step animation representing the "Labor Illusion"
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        
        setTimeout(() => {
          setIsScanning(false);
          // Simulate finding a drug and its cheaper alternatives
          const scannedGroup = [
            { id: "a1", name: "Nexum 20mg", company: "Incepta", price: 8.00 },
            { id: "a2", name: "Maxpro 20mg", company: "Renata", price: 7.00 },
            { id: "a3", name: "Emax 20mg", company: "Beximco", price: 5.50 },
            { id: "a4", name: "Sergel 20mg", company: "Healthcare", price: 7.00 }
          ];
          
          // Smart Pricing Logic: Sort from Lowest Price to Highest Price
          scannedGroup.sort((a, b) => a.price - b.price);
          
          setScanResult({
            detected: "Esomeprazole 20mg (Gastric)",
            alternatives: scannedGroup
          });
        }, 500);
      } else {
        setScanProgress(progress);
        
        // Update current step index based on progress percent thresholds
        let nextStepIndex = 0;
        for (let i = 0; i < scanSteps.length; i++) {
          if (progress >= scanSteps[i].pct) {
            nextStepIndex = Math.min(i + 1, scanSteps.length - 1);
          }
        }
        setCurrentStepIndex(nextStepIndex);
      }
    }, 150); // Complete scan in ~3 seconds with smooth micro-ticks
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-y-auto pb-24 lg:pb-0">
      
      {/* Search & Scanner Hero Banner */}
      <div className="relative shrink-0 bg-white border-b border-slate-200 px-4 md:px-8 pt-20 lg:pt-8 pb-8 overflow-hidden z-10 shadow-sm">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-8 items-center justify-between">
          
          {/* Left: Search Title & Bar */}
          <div className="flex-1 w-full min-w-0">
            <h1 className="text-[28px] md:text-[36px] font-[800] text-slate-900 mb-2 leading-tight">Search or Upload Prescription</h1>
            <p className="text-[15px] text-slate-500 font-medium mb-6">Find medicines, compare prices, or upload your prescription to automatically find the best alternatives.</p>
            
            <div className="flex items-center gap-2 max-w-[600px] w-full">
              <div className="flex-1 bg-slate-50 rounded-[16px] flex items-center p-2 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                <div className="pl-4 pr-3 text-slate-400">
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicine, generic..." 
                  className="flex-1 bg-transparent border-none outline-none py-2 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 min-w-0"
                />
              </div>
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-[16px] w-[54px] h-[54px] shrink-0 flex items-center justify-center transition-all shadow-sm"
              >
                <SlidersHorizontal size={20} />
              </button>
              <button className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white rounded-[16px] px-6 h-[54px] items-center justify-center gap-2 text-[14px] font-bold transition-colors shadow-sm shrink-0">
                Search
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
              <span className="text-[12px] font-[800] text-slate-400 uppercase tracking-widest mr-2">Popular Searches:</span>
              {["Napa Extend", "Sergel 20mg", "Losectil", "Calbo D", "Alatrol"].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setSearchQuery(tag)}
                  className="bg-white border border-slate-200 px-4 py-1.5 rounded-lg text-[13px] font-bold text-slate-600 hover:border-primary hover:text-primary transition-colors shadow-sm shrink-0"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Prescription Scanner Box */}
          <div className="w-full lg:w-[400px] shrink-0">
            <label 
              htmlFor="rx-upload"
              className={`block transition-all relative overflow-hidden ${
                isScanning 
                  ? 'border-2 border-dashed rounded-[24px] p-6 lg:p-8 text-center border-primary cursor-wait bg-primary/5' 
                  : 'flex lg:block items-center justify-center h-[54px] lg:h-auto rounded-[16px] lg:rounded-[24px] bg-slate-900 lg:bg-slate-50 text-white lg:text-slate-900 shadow-md shadow-slate-900/20 lg:shadow-none lg:border-2 lg:border-dashed lg:border-slate-300 lg:p-8 hover:bg-slate-800 lg:hover:border-primary lg:hover:bg-primary/5 cursor-pointer'
              }`}
            >
              {/* Hidden file input */}
              <input 
                id="rx-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleUploadPrescription} 
                disabled={isScanning}
                className="hidden" 
              />
              
              {uploadedImage && (
                <div className="absolute inset-0 z-0">
                  <Image src={uploadedImage} alt="Uploaded Rx" fill className="object-cover opacity-30" />
                </div>
              )}

              {isScanning ? (
                <div className="relative z-10 flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="relative">
                    <ScanBarcode size={48} className="text-primary animate-pulse" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-primary animate-scan-line shadow-[0_0_8px_2px_#6DDA6E]"></div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-md border border-slate-100 w-full max-w-[320px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-bold text-primary uppercase tracking-wider">Analyzing Rx</span>
                      <span className="text-[14px] font-black text-slate-800">{scanProgress}%</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-[13px] text-slate-700 font-bold text-left animate-pulse">
                      {scanSteps[currentStepIndex]?.title}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Upload Box */}
                  <div className="hidden lg:flex relative z-10 flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100">
                      <ImageIcon size={28} className="text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-slate-900 mb-1">Upload Prescription</h3>
                      <p className="text-[13px] text-slate-500 font-medium mb-4">Click here to upload an image of your Rx</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-[14px] shadow-sm hover:border-primary hover:text-primary transition-all pointer-events-none">
                      <UploadCloud size={18} /> Upload Image
                    </div>
                  </div>
                  
                  {/* Mobile Upload Button */}
                  <div className="flex lg:hidden items-center justify-center gap-2 w-full h-full font-bold text-[15px] pointer-events-none relative z-10">
                    <UploadCloud size={20} /> Upload Prescription
                  </div>
                </>
              )}
            </label>
          </div>

        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 w-full">
        
        {/* Scan Result Logic / Alternatives */}
        {scanResult && (
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-[24px] p-6 md:p-8 mb-10 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-6">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#10b981] rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[#065f46]">Prescription Analyzed</h2>
                  <p className="text-[14px] font-medium text-[#047857]">Found Generic: <strong>{scanResult.detected}</strong></p>
                </div>
              </div>
              
              <h3 className="text-[16px] font-bold text-[#065f46] mb-4 flex items-center gap-2">
                <TrendingDown size={18} /> Smart Alternatives (Cheapest First)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scanResult.alternatives.map((alt: any, i: number) => (
                  <div key={i} className="bg-white rounded-[16px] p-5 shadow-sm border border-[#a7f3d0] hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{alt.company}</span>
                      {i === 0 && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Cheapest</span>
                      )}
                    </div>
                    <h4 className="text-[18px] font-bold text-slate-900 mb-4">{alt.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[18px] font-[800] text-primary">৳ {alt.price.toFixed(2)}</span>
                      <button className="w-10 h-10 bg-slate-50 hover:bg-primary hover:text-white text-slate-500 rounded-full flex items-center justify-center transition-colors">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* E-Commerce Medicine Grid */}
        <div className="flex justify-between items-end mb-6 mt-8">
          <div>
            <h2 className="text-[28px] md:text-[32px] font-[800] text-slate-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Find Medicines by Category"}
            </h2>
            <p className="text-[15px] text-slate-500 font-medium mt-2">
              Browse {totalCount > 0 ? totalCount.toLocaleString() : 'thousands of'} commonly prescribed medicines grouped by their primary usage.
            </p>
          </div>
        </div>

        {/* Category Tabs moved to Sidebar Drawer */}
        {(() => {
          if (isLoading) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((skeleton) => (
                  <div key={skeleton} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden h-[200px] shadow-sm p-5 flex flex-col justify-between">
                    <div className="flex gap-4">
                      <div className="w-[60px] h-[60px] bg-slate-100 animate-pulse rounded-2xl shrink-0"></div>
                      <div className="flex-1">
                        <div className="w-3/4 h-5 bg-slate-200 animate-pulse rounded mb-2"></div>
                        <div className="w-1/2 h-3 bg-slate-100 animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div className="w-full h-8 bg-slate-100 animate-pulse rounded mt-auto"></div>
                  </div>
                ))}
              </div>
            );
          }

          if (medicines.length === 0) {
            return (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-[20px] font-bold text-slate-900 mb-2">No medicines found</h3>
                <p className="text-[15px] text-slate-500 mb-6">We couldn't find anything matching your filters. Try a different term or category.</p>
                <Button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} variant="outline" size="lg">Clear Filters</Button>
              </div>
            );
          }

          // Helper to get Category Icon
          const getCategoryDetails = (catId: string) => {
            return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
          };

          return (
            <div className="space-y-10">
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
              >
                <AnimatePresence>
                  {medicines.map((med) => {
                    const catDetails = getCategoryDetails(med.category);
                    const MedIcon = catDetails.icon;
                    const BgIcon = getBgIcon(med.type);
                    return (
                      <motion.div
                        key={med.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="block relative bg-white border border-slate-200 p-3 sm:p-5 rounded-[16px] sm:rounded-[24px] shadow-sm hover:shadow-[0_16px_48px_rgba(0,61,155,0.08)] hover:border-primary/30 transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent opacity-50 pointer-events-none z-0"></div>
                          
                          <BgIcon 
                            className="absolute -right-2 -bottom-2 sm:-right-4 sm:-bottom-4 w-24 h-24 sm:w-32 sm:h-32 text-slate-200/50 -rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500" 
                            strokeWidth={1}
                          />

                          <div className="relative z-10 flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <div className={`w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] shrink-0 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border ${catDetails.color.replace('text-', 'bg-').replace('500', '500/10')} border-${catDetails.color.split('-')[1]}-200 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                              <MedIcon className={`w-5 h-5 sm:w-7 sm:h-7 ${catDetails.color}`} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 flex flex-col justify-center min-w-0 mt-1 sm:mt-0">
                              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                                <h3 className="text-[14px] sm:text-[17px] font-extrabold text-slate-900 group-hover:text-primary transition-colors tracking-tight truncate pr-2" title={med.name}>{med.name}</h3>
                                <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50 shrink-0">
                                  <ShieldCheck size={12} />
                                </div>
                              </div>
                              <p className="text-[11px] sm:text-[12px] font-semibold text-slate-500 mb-0.5 sm:mb-1 line-clamp-1" title={med.generic}>{med.generic} <span className="hidden sm:inline">• {med.type}</span></p>
                              <p className={`text-[10px] sm:text-[12px] font-bold ${catDetails.color} truncate`}>
                                <span className="hidden sm:inline">For: </span><span className="font-medium text-slate-600">{med.useFor}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="relative z-10 flex items-center justify-between pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-100">
                            <span className="text-[16px] sm:text-[20px] font-black text-slate-900">৳{med.price.toFixed(2)}</span>
                            <button className="flex items-center justify-center gap-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 hover:bg-primary text-slate-600 hover:text-white transition-colors group/btn">
                              <ShoppingCart className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Functional Pagination */}
              {(() => {
                const ITEMS_PER_PAGE = 20;
                const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
                
                if (totalPages <= 1) return null;

                return (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12 mb-4">
                    <button 
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1 || isLoading}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                        return (
                          <button 
                            key={p}
                            onClick={() => handlePageChange(p)}
                            disabled={isLoading}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                              page === p 
                                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                : 'border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      } else if (p === page - 2 || p === page + 2) {
                        return <span key={p} className="text-slate-400 font-bold px-1 sm:px-2">...</span>;
                      }
                      return null;
                    })}

                    <button 
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages || isLoading}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        })()}

      </div>

      {/* Premium Filter Sidebar Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-[#0a1628]/40 backdrop-blur-md z-[100]"
            />
            
            {/* Drawer */}
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
                        setIsFilterOpen(false); // Optionally close after selecting
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
                <Button 
                  onClick={() => { setActiveCategory("All"); setSearchQuery(""); setIsFilterOpen(false); }}
                  variant="outline" 
                  className="w-full h-[54px] rounded-2xl border-none bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  Clear All Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global CSS for scanning animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
}
