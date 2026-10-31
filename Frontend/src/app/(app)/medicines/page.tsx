"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, ScanBarcode, ChevronRight, ChevronLeft, ShoppingCart, UploadCloud, 
  CheckCircle2, TrendingDown, Image as ImageIcon, Bot,
  Pill, Activity, Brain, BugOff, Apple, Wind, Heart, Thermometer, ShieldCheck, ArrowRight,
  SlidersHorizontal, X, Syringe, FlaskConical, Bandage, Sparkles, Camera, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { requestMedicalDocumentConsent } from "@/lib/medical-document-client";
import { parsePrescriptionTranscription } from "@/lib/prescription-ocr";
import { PrescriptionReview } from "@/components/prescription/PrescriptionReview";

const CATEGORIES = [
  { id: "All", name: "All Medicines", icon: Pill, color: "text-slate-600", bg: "bg-slate-100", activeBg: "bg-slate-900 text-white" },
  { id: "Painkiller", name: "Fever & Pain", icon: Thermometer, color: "text-rose-600", bg: "bg-rose-50", activeBg: "bg-rose-600 text-white" },
  { id: "Gastric", name: "Gastric & Ulcer", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", activeBg: "bg-emerald-600 text-white" },
  { id: "Antibiotic", name: "Antibiotics", icon: BugOff, color: "text-purple-600", bg: "bg-purple-50", activeBg: "bg-purple-600 text-white" },
  { id: "Allergy", name: "Asthma & Allergy", icon: Wind, color: "text-sky-600", bg: "bg-sky-50", activeBg: "bg-sky-600 text-white" },
  { id: "Vitamins", name: "Vitamins & Calcium", icon: Apple, color: "text-amber-600", bg: "bg-amber-50", activeBg: "bg-amber-600 text-white" },
  { id: "Cardiac", name: "Heart & Pressure", icon: Heart, color: "text-red-600", bg: "bg-red-50", activeBg: "bg-red-600 text-white" }
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
  const [priceSnapshot, setPriceSnapshot] = useState<{ source: string; generatedAt: string | null; ageDays?: number | null; freshness?: string } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const scanTranscription = scanResult?.analysis ? parsePrescriptionTranscription(scanResult.analysis) : null;
  const scanReviewedAgainstImage = scanTranscription?.userReview?.verifiedAgainstImage === true;

  useEffect(() => {
    if (!uploadedImage?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(uploadedImage);
  }, [uploadedImage]);

  const fetchMedicines = useCallback(async (pageNum: number, isNewSearch: boolean = false) => {
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
        setPriceSnapshot(data.priceSnapshot || null);
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
  }, [activeCategory, searchQuery]);

  // Trigger search/filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchMedicines(1, true);
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchMedicines]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchMedicines(newPage, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadPrescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void (async () => {
      try {
        const accessToken = await requestMedicalDocumentConsent();
        if (!accessToken) return;
        setUploadedImage(URL.createObjectURL(file));
        setIsScanning(true);
        setScanResult(null);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("consent", "true");
        const response = await fetch("/api/ai/analyze-prescription", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Prescription analysis failed");
        setScanResult(data);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Prescription analysis failed.");
      } finally {
        setIsScanning(false);
        e.target.value = "";
      }
    })();
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-y-auto pb-36 sm:pb-32 lg:pb-16">
      
      {/* Search & Scanner Hero Banner */}
      <div className="relative shrink-0 bg-white border-b border-slate-200/80 px-4 md:px-8 pt-6 sm:pt-10 lg:pt-8 pb-7 z-10 shadow-xs">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-center justify-between">
          
          {/* Left: Search Title & Bar */}
          <div className="flex-1 w-full min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/70 text-sky-700 font-semibold text-xs uppercase tracking-wider mb-3">
              <Bot size={13} className="text-sky-600" />
              <span>National AI Pharmacy Network</span>
            </div>

            <h1 className="text-[24px] sm:text-[32px] md:text-[36px] font-[900] text-slate-900 mb-2 leading-tight tracking-tight">
              Centralized Medicine Database
            </h1>
            
            <p className="text-[14px] sm:text-[15px] text-slate-500 font-medium mb-5 leading-relaxed max-w-[620px]">
              Search 21,700+ verified medicines, compare pharmacy prices instantly, or upload a prescription to find cheap generic alternatives.
            </p>
            
            {/* Search Input Box */}
            <div className="flex items-center gap-2 max-w-[620px] w-full">
              <div className="flex-1 bg-slate-50 hover:bg-slate-100/70 rounded-2xl flex items-center p-1.5 sm:p-2 border border-slate-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/15 focus-within:bg-white transition-all shadow-xs">
                <div className="pl-3.5 pr-2.5 text-slate-400">
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicine, generic, or symptom..." 
                  className="flex-1 bg-transparent border-none outline-none py-1.5 text-[14px] sm:text-[15px] font-medium text-slate-800 placeholder:text-slate-400 min-w-0"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 mr-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="bg-white border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-600 rounded-2xl w-[48px] sm:w-[52px] h-[48px] sm:h-[52px] shrink-0 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                title="Filter categories"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
            
            {/* Popular Searches Pills */}
            <div className="flex items-center gap-2 mt-3.5 overflow-x-auto scrollbar-hide whitespace-nowrap pt-0.5 pb-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Popular:</span>
              {["Napa Extend", "Sergel 20mg", "Losectil", "Calbo D", "Alatrol", "Ace Plus", "Ciprocin"].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setSearchQuery(tag)}
                  className="bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 px-3 py-1 rounded-lg text-[12px] font-bold text-slate-600 hover:text-sky-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Modern Prescription Scanner Card (Mobile & Desktop) */}
          <div className="w-full lg:w-[380px] shrink-0">
            <label 
              htmlFor="rx-upload"
              className={`block relative overflow-hidden rounded-2xl border transition-all cursor-pointer shadow-xs ${
                isScanning 
                  ? 'border-sky-500 bg-sky-50/90 cursor-wait ring-2 ring-sky-500/20' 
                  : 'border-sky-200/80 bg-gradient-to-br from-sky-50/60 via-white to-blue-50/50 hover:border-sky-400 hover:shadow-md'
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
                  <Image src={uploadedImage} alt="Uploaded Rx" fill className="object-cover opacity-15" />
                </div>
              )}

              {isScanning ? (
                <div className="relative z-10 p-5 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-3">
                    <ScanBarcode size={36} className="text-sky-600 animate-pulse" />
                    <div className="absolute inset-0 bg-sky-500/20 blur-lg rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-sky-600 animate-scan-line shadow-[0_0_8px_2px_#0284c7]"></div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                    <Bot size={13} />
                    <span>AI Scanning Active</span>
                  </div>
                  <p className="text-[13px] text-slate-800 font-bold">
                    Analyzing prescription & comparing prices...
                  </p>
                  <div className="w-full max-w-[200px] bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-sky-600 h-full w-2/3 animate-[pulse_1s_infinite] rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="relative z-10 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-sky-600/10 text-sky-600 border border-sky-600/20 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <UploadCloud size={22} className="text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="text-[14px] sm:text-[15px] font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                        Upload Prescription
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200/50">
                        AI OCR
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 font-medium line-clamp-1">
                      Instant price match & substitute finder
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[12px] shadow-xs transition-colors">
                      <Camera size={13} />
                      <span className="hidden min-[420px]:inline">Upload</span>
                    </span>
                  </div>
                </div>
              )}
            </label>
          </div>

        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 sm:py-8 w-full">
        
        {/* Scan Result Logic / Alternatives */}
        {scanResult && (
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-8 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-6">
              <Bot size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#10b981] rounded-xl flex items-center justify-center shadow-xs shrink-0">
                  <CheckCircle2 size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-[#065f46]">Prescription Analysis Complete</h2>
                  <p className="text-[13px] font-medium text-[#047857]">Reference: <strong>{scanResult.documentId}</strong> · Compare extracted items with original image below.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-start">
                {uploadedImage && (
                  <figure className="bg-white rounded-2xl border border-emerald-100 p-3">
                    <figcaption className="text-xs font-bold text-slate-700 mb-2">Original Prescription</figcaption>
                    <Image src={uploadedImage} alt="Original uploaded prescription" width={1200} height={1600} unoptimized className="w-full h-auto max-h-[500px] object-contain rounded-xl bg-slate-50" />
                  </figure>
                )}
                <div>
                  {(() => {
                    const transcription = parsePrescriptionTranscription(scanResult.analysis || "");
                    return transcription
                      ? <PrescriptionReview documentId={scanResult.documentId} initialTranscription={transcription} onSaved={(updated) => setScanResult((current: any) => ({ ...current, ...updated }))} />
                      : <pre className="bg-white rounded-2xl p-5 whitespace-pre-wrap text-sm text-slate-700 max-h-96 overflow-auto font-sans">{scanResult.analysis}</pre>;
                  })()}
                </div>
              </div>
              
              {!scanReviewedAgainstImage ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 font-medium">
                  মূল ছবির সঙ্গে OCR লেখা মিলিয়ে সংরক্ষণ করলে সেরা বিকল্প ও ফার্মেসি মূল্য তুলনা দেখানো হবে।
                </p>
              ) : <>
              <h3 className="text-[16px] font-bold text-[#065f46] mb-3 flex items-center gap-2">
                <TrendingDown size={18} /> Best Equivalent Matches & Alternatives
              </h3>
              {(scanResult.medicineComparisons || []).map((comparison: any, medicineIndex: number) => (
                <div key={medicineIndex} className="bg-white rounded-xl p-4 mb-3 border border-emerald-100 shadow-2xs">
                  <p className="font-bold text-slate-900 mb-2">
                    Prescribed: {comparison.prescribed?.brandName || comparison.prescribed?.genericName || "Medicine"} · {comparison.prescribed?.strength || ""}
                  </p>
                  {comparison.baselinePrice !== null && comparison.baselinePrice !== undefined && (
                    <p className="text-sm text-slate-700 mb-3">Brand Price: ৳ {comparison.baselinePrice.toFixed(2)} / {comparison.baselinePriceBasis}</p>
                  )}
                  {(comparison.comparablePrices || []).map((alternative: any, alternativeIndex: number) => (
                    <div key={alternativeIndex} className="py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{alternative.brandName} · <span className="text-slate-500 font-normal">{alternative.manufacturer}</span></p>
                        <p className="text-xs text-slate-500">{alternative.generic} · {alternative.strength} · {alternative.dosageForm}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-sky-700 text-sm">৳ {alternative.price.toFixed(2)} / {alternative.priceBasis}</p>
                        {alternative.savings !== null && <p className="text-[11px] text-emerald-700 font-semibold">৳ {alternative.savings.toFixed(2)} cheaper</p>}
                      </div>
                    </div>
                  ))}
                  {!comparison.comparablePrices?.length && <p className="text-xs text-slate-500 border-t border-slate-100 pt-2.5">No exact-pack equivalent was found in this catalog.</p>}
                </div>
              ))}
              </>}
            </div>
          </div>
        )}

        {/* Clean Header: Category & Count (Zero Clutter) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <ShieldCheck size={12} className="text-emerald-600" />
                DGDA Verified Database
              </span>
              <span className="text-[12px] text-slate-400 font-medium">
                • {totalCount > 0 ? `${totalCount.toLocaleString()} medicines available` : "Comprehensive formulary"}
              </span>
            </div>
            
            <h2 className="text-[20px] sm:text-[26px] md:text-[28px] font-[900] text-slate-900 tracking-tight">
              {searchQuery ? `Results for "${searchQuery}"` : "Find Medicines by Category"}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-slate-500 font-medium mt-0.5">
              Browse authentic medicines, dosage strengths, and approved generic substitutes.
            </p>
          </div>
        </div>

        {/* Quick Horizontal Category Bar (Mobile & Desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50"
                }`}
              >
                <Icon size={15} className={isActive ? "text-white" : cat.color} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* E-Commerce Medicine Grid */}
        {(() => {
          if (isLoading) {
            return (
              <div className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((skeleton) => (
                  <div key={skeleton} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden h-[190px] shadow-2xs p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-16 h-5 bg-slate-100 animate-pulse rounded-lg"></div>
                      <div className="w-14 h-4 bg-slate-100 animate-pulse rounded-full"></div>
                    </div>
                    <div>
                      <div className="w-3/4 h-5 bg-slate-200 animate-pulse rounded mb-2"></div>
                      <div className="w-1/2 h-3.5 bg-slate-100 animate-pulse rounded"></div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-auto">
                      <div className="w-20 h-5 bg-slate-200 animate-pulse rounded"></div>
                      <div className="w-8 h-8 bg-slate-100 animate-pulse rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (medicines.length === 0) {
            return (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
                <Search size={40} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-[18px] font-bold text-slate-900 mb-1">No medicines found</h3>
                <p className="text-[14px] text-slate-500 mb-5">We couldn't find any medicine matching your search query. Try another name or generic.</p>
                <Button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} variant="outline" size="sm" className="rounded-xl">
                  Clear Filters
                </Button>
              </div>
            );
          }

          // Helper to get Category Icon
          const getCategoryDetails = (catId: string) => {
            return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
          };

          return (
            <div className="space-y-8">
              <motion.div 
                layout
                className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"
              >
                <AnimatePresence>
                  {medicines.map((med) => {
                    const catDetails = getCategoryDetails(med.category);
                    const BgIcon = getBgIcon(med.type);
                    return (
                      <motion.div
                        key={med.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link 
                          href={`/medicines/${med.id}`}
                          className="group relative bg-white border border-slate-200/90 hover:border-sky-300 p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between overflow-hidden cursor-pointer"
                        >
                          <div>
                            {/* Top row: Type Badge and Category Tag */}
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-slate-700 bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                                <BgIcon className="w-3.5 h-3.5 text-sky-600" />
                                {med.type || "Tablet"}
                              </span>
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${catDetails.bg} ${catDetails.color} border border-slate-100/60`}>
                                {catDetails.name}
                              </span>
                            </div>

                            {/* Brand Name */}
                            <h3 
                              className="text-[15px] sm:text-[16px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight line-clamp-1 mb-0.5" 
                              title={med.name}
                            >
                              {med.name}
                            </h3>

                            {/* Generic Formula */}
                            <p 
                              className="text-[12px] font-semibold text-slate-500 line-clamp-1 mb-1" 
                              title={med.generic}
                            >
                              {med.generic}
                            </p>

                            {/* Indication / Use For */}
                            {med.useFor && (
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                <span className="text-slate-400 font-medium">For: </span>
                                <span className="text-slate-600 font-medium">{med.useFor}</span>
                              </p>
                            )}
                          </div>
                          
                          {/* Bottom row: Clean Price & Cart action */}
                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[16px] sm:text-[17px] font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                                {typeof med.price === "number" ? `৳${med.price.toFixed(2)}` : "Price on request"}
                              </span>
                              {typeof med.price === "number" && (
                                <span className="text-[11px] text-slate-400 font-normal">
                                  /{med.priceBasis || "pc"}
                                </span>
                              )}
                            </div>
                            
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              aria-label="View details"
                              className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-sky-600 text-slate-600 group-hover:text-white border border-slate-200/80 group-hover:border-sky-600 flex items-center justify-center transition-all shadow-2xs"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Link>
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
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 mb-2">
                    <button 
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1 || isLoading}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                        return (
                          <button 
                            key={p}
                            onClick={() => handlePageChange(p)}
                            disabled={isLoading}
                            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                              page === p 
                                ? 'bg-sky-600 text-white shadow-xs' 
                                : 'border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 disabled:opacity-50'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      } else if (p === page - 2 || p === page + 2) {
                        return <span key={p} className="text-slate-400 font-bold px-1 text-xs">...</span>;
                      }
                      return null;
                    })}

                    <button 
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages || isLoading}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })()}
              
              {/* Mobile bottom spacer so floating nav never blocks cards */}
              <div className="h-16 md:hidden" />
            </div>
          );
        })()}

      </div>

      {/* Filter Sidebar Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-[#0a1628]/40 backdrop-blur-xs z-[100]"
            />
            
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300, mass: 0.8 }}
              className="fixed top-0 right-0 h-full w-full max-w-[320px] bg-white shadow-2xl z-[101] flex flex-col rounded-l-3xl border-l border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <SlidersHorizontal size={14} />
                  </div>
                  <span>Categories</span>
                </h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 flex items-center justify-center text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 scrollbar-hide space-y-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${
                      activeCategory === cat.id 
                        ? `${cat.bg} ${cat.color} border border-slate-200/60` 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <cat.icon size={17} className={activeCategory === cat.id ? cat.color : "text-slate-400"} />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <Button 
                  onClick={() => { setActiveCategory("All"); setSearchQuery(""); setIsFilterOpen(false); }}
                  variant="outline" 
                  className="w-full h-[46px] rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
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
