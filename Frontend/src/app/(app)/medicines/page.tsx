"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  UploadCloud,
  Pill,
  Activity,
  BugOff,
  Apple,
  Wind,
  Heart,
  Thermometer,
  SlidersHorizontal,
  X,
  Syringe,
  FlaskConical,
  Bandage,
  Camera,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MedicineDetailsModal } from "@/components/medicines/MedicineDetailsModal";
import { PrescriptionIntelligenceWorkspace } from "@/components/prescription/PrescriptionIntelligenceWorkspace";

const CATEGORIES = [
  { id: "All", name: "All Medicines", icon: Pill, color: "text-slate-600", bg: "bg-slate-100", activeBg: "bg-slate-900 text-white", badgeStyle: "text-slate-700 bg-slate-100/90 border-slate-200/80", badgeLabel: "THERAPEUTIC" },
  { id: "Painkiller", name: "Fever & Pain", icon: Thermometer, color: "text-rose-600", bg: "bg-rose-50", activeBg: "bg-rose-600 text-white", badgeStyle: "text-[#e11d48] bg-[#FFF1F2] border-[#FFE4E6]", badgeLabel: "FEVER & PAIN" },
  { id: "Gastric", name: "Gastric & Ulcer", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", activeBg: "bg-emerald-600 text-white", badgeStyle: "text-[#059669] bg-[#ECFDF5] border-[#D1FAE5]", badgeLabel: "GASTRIC & ULCER" },
  { id: "Antibiotic", name: "Antibiotics", icon: BugOff, color: "text-purple-600", bg: "bg-purple-50", activeBg: "bg-purple-600 text-white", badgeStyle: "text-[#9333ea] bg-[#FAF5FF] border-[#F3E8FF]", badgeLabel: "ANTIBIOTICS" },
  { id: "Allergy", name: "Asthma & Allergy", icon: Wind, color: "text-sky-600", bg: "bg-sky-50", activeBg: "bg-sky-600 text-white", badgeStyle: "text-[#0284c7] bg-[#F0F9FF] border-[#E0F2FE]", badgeLabel: "ASTHMA & ALLERGY" },
  { id: "Vitamins", name: "Vitamins & Calcium", icon: Apple, color: "text-amber-600", bg: "bg-amber-50", activeBg: "bg-amber-600 text-white", badgeStyle: "text-[#b45309] bg-[#FFFBEB] border-[#FEF3C7]", badgeLabel: "VITAMINS & CALCIUM" },
  { id: "Cardiac", name: "Heart & Pressure", icon: Heart, color: "text-red-600", bg: "bg-red-50", activeBg: "bg-red-600 text-white", badgeStyle: "text-[#dc2626] bg-[#FEF2F2] border-[#FEE2E2]", badgeLabel: "HEART & PRESSURE" },
];

export default function MedicinesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [uploadedPrescriptionFile, setUploadedPrescriptionFile] = useState<File | null>(null);
  const [isDraggingTopUpload, setIsDraggingTopUpload] = useState(false);
  const topFileInputRef = useRef<HTMLInputElement | null>(null);
  const topCameraInputRef = useRef<HTMLInputElement | null>(null);
  const scannerSectionRef = useRef<HTMLDivElement | null>(null);

  const getFormIcon = (type: string) => {
    if (!type) return Pill;
    const t = type.toLowerCase();
    if (
      t.includes("syrup") ||
      t.includes("suspension") ||
      t.includes("powder") ||
      t.includes("solution") ||
      t.includes("liquid") ||
      t.includes("drop")
    )
      return FlaskConical;
    if (t.includes("injection") || t.includes("iv") || t.includes("infusion")) return Syringe;
    if (t.includes("cream") || t.includes("ointment") || t.includes("gel")) return Bandage;
    return Pill;
  };

  const toggleCart = (medId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCartItems((prev) => {
      const next = new Set(prev);
      if (next.has(medId)) next.delete(medId);
      else next.add(medId);
      return next;
    });
  };

  // Real Data States
  const [medicines, setMedicines] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [priceSnapshot, setPriceSnapshot] = useState<{
    source: string;
    generatedAt: string | null;
    ageDays?: number | null;
    freshness?: string;
  } | null>(null);

  const fetchMedicines = useCallback(
    async (pageNum: number, isNewSearch: boolean = false) => {
      try {
        if (isNewSearch) setIsLoading(true);
        else setIsLoadingMore(true);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "20",
          category: activeCategory,
          q: searchQuery,
        });

        const res = await fetch(`/api/medicines/all?${params.toString()}`);
        const data = await res.json();

        if (data && data.data) {
          setPriceSnapshot(data.priceSnapshot || null);
          if (isNewSearch) {
            setMedicines(data.data);
          } else {
            setMedicines((prev) => [...prev, ...data.data]);
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
    },
    [activeCategory, searchQuery]
  );

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-y-auto pb-36 sm:pb-32 lg:pb-16">
      {/* Search & Automated Prescription Upload Hero Banner */}
      <div className="relative shrink-0 bg-white border-b border-[#E5E7EB] px-4 md:px-8 pt-6 sm:pt-10 lg:pt-8 pb-7 z-10 shadow-2xs">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-center justify-between">
          {/* Left: Search Title & Bar */}
          <div className="flex-1 w-full min-w-0">
            <h1 className="text-[24px] sm:text-[32px] md:text-[36px] font-[900] text-[#111827] mb-2 leading-tight tracking-tight">
              Centralized Medicine Database
            </h1>

            <p className="text-[14px] sm:text-[15px] text-[#64748B] font-medium mb-5 leading-relaxed max-w-[620px]">
              Search {totalCount > 0 ? totalCount.toLocaleString() : "21,714"} verified DGDA medicines, compare pharmacy prices instantly, or upload a prescription for automatic recognition and price analysis.
            </p>

            {/* Search Input Box */}
            <div className="flex items-center gap-2 max-w-[620px] w-full">
              <div className="flex-1 bg-[#F8FAFC] hover:bg-slate-100/70 rounded-2xl flex items-center p-1.5 sm:p-2 border border-[#E5E7EB] focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/15 focus-within:bg-white transition-all shadow-2xs">
                <div className="pl-3.5 pr-2.5 text-[#64748B]">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicine, generic, or symptom..."
                  className="flex-1 bg-transparent border-none outline-none py-1.5 text-[14px] sm:text-[15px] font-medium text-[#111827] placeholder:text-[#64748B] min-w-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-[#64748B] hover:text-[#111827] mr-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="bg-white border border-[#E5E7EB] hover:border-sky-300 text-[#111827] hover:text-sky-600 rounded-2xl w-[48px] sm:w-[52px] h-[48px] sm:h-[52px] shrink-0 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                title="Filter categories"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Right: Single Automated Prescription Upload Interface (Drag & Drop, Click to Upload, Camera Capture) */}
          <div className="w-full lg:w-[440px] shrink-0">
            <input
              ref={topFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedPrescriptionFile(file);
                  setTimeout(() => {
                    scannerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }
                e.target.value = "";
              }}
              className="hidden"
            />
            <input
              ref={topCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedPrescriptionFile(file);
                  setTimeout(() => {
                    scannerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }
                e.target.value = "";
              }}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingTopUpload(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingTopUpload(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingTopUpload(false);
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  setUploadedPrescriptionFile(droppedFile);
                  setTimeout(() => {
                    scannerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }
              }}
              onClick={() => topFileInputRef.current?.click()}
              className={`w-full text-left relative overflow-hidden rounded-2xl border transition-all cursor-pointer p-4 sm:p-5 flex items-center justify-between gap-3.5 group ${
                isDraggingTopUpload
                  ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20"
                  : "border-[#E5E7EB] hover:border-sky-400 hover:shadow-sm bg-white"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UploadCloud size={24} className="text-sky-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[14px] sm:text-[15px] font-[900] text-[#111827] group-hover:text-sky-600 transition-colors truncate">
                      Upload Prescription
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                      AI OCR
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-[12px] text-[#64748B] font-medium truncate">
                    Drop JPG, PNG, WEBP, or PDF for instant price analysis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => topCameraInputRef.current?.click()}
                  className="inline-flex sm:hidden items-center justify-center w-9 h-9 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#111827] border border-[#E5E7EB] cursor-pointer"
                  title="Capture prescription with camera"
                >
                  <Camera size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => topFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Camera size={14} />
                  <span>Scan Rx</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 sm:py-8 w-full">
        {/* AUTOMATED PRESCRIPTION RECOGNITION & VERIFIED PRICE ANALYSIS RESULTS */}
        <div ref={scannerSectionRef} className={uploadedPrescriptionFile ? "mb-8" : ""}>
          <PrescriptionIntelligenceWorkspace
            onSelectMedicineDetail={(med) => setSelectedMedicine(med)}
            externalUploadedFile={uploadedPrescriptionFile}
            onExternalFileHandled={() => setUploadedPrescriptionFile(null)}
            hideInlineUploader={true}
            onTriggerNewUpload={() => topFileInputRef.current?.click()}
          />
        </div>

        {/* Clean Header: Category & Count */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 mt-2">
          <div>
            <h2 className="text-[20px] sm:text-[26px] md:text-[28px] font-[900] text-[#111827] tracking-tight">
              {searchQuery ? `Results for "${searchQuery}"` : "Find Medicines by Category"}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#64748B] font-medium mt-0.5">
              Browse {totalCount > 0 ? totalCount.toLocaleString() : "21,714"} authentic medicines, dosage strengths, and approved generic substitutes.
            </p>
          </div>
        </div>

        {/* Quick Horizontal Category Bar (Mobile & Desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
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

        {/* Medicine Grid */}
        {(() => {
          if (isLoading) {
            return (
              <div className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden h-[190px] shadow-2xs p-4 flex flex-col justify-between"
                  >
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
                <p className="text-[14px] text-slate-500 mb-5">
                  We couldn&apos;t find any medicine matching your search query in the Oxpecker AI database. Try another brand or generic name.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            );
          }

          const getCategoryDetails = (catId: string) => {
            return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];
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
                    const FormIcon = getFormIcon(med.type);
                    const isInCart = cartItems.has(med.id);
                    const verifiedPrice =
                      typeof med.price === "number" && med.price > 0
                        ? med.price
                        : typeof med.unitPrice === "number" && med.unitPrice > 0
                          ? med.unitPrice
                          : typeof med.packagePrice === "number" && med.packagePrice > 0
                            ? med.packagePrice
                            : null;

                    return (
                      <motion.div
                        key={med.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={`/medicines/${med.id}`}
                          className={`block relative bg-white rounded-[20px] sm:rounded-[22px] border p-4 sm:p-5 transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                            isInCart
                              ? "border-sky-400 ring-2 ring-sky-100 shadow-sm"
                              : "border-slate-200/90 hover:border-sky-300"
                          }`}
                        >
                          <FlaskConical
                            className="absolute -right-2 -bottom-2 w-28 h-28 text-slate-300/15 -rotate-12 pointer-events-none select-none group-hover:scale-105 transition-all duration-500 ease-out"
                            strokeWidth={1}
                          />

                          {/* Top Badges Row */}
                          <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200/80 bg-sky-50/40 text-[11px] sm:text-[12px] font-semibold text-slate-700 shrink-0">
                              <FormIcon size={12} className="text-sky-600" />
                              <span>{med.type || "Tablet"}</span>
                            </span>

                            <span
                              className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border shrink-0 ${
                                catDetails.badgeStyle || "text-slate-700 bg-slate-100 border-slate-200"
                              }`}
                            >
                              {catDetails.badgeLabel || "MEDICINE"}
                            </span>
                          </div>

                          {/* Brand, Generic, and For Indication */}
                          <div className="relative z-10 flex-1 min-w-0">
                            <h3
                              className="text-[17px] sm:text-[19px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight truncate leading-tight mb-1"
                              title={med.name}
                            >
                              {med.name}
                            </h3>
                            <p
                              className="text-[12px] sm:text-[13px] font-semibold text-slate-500 truncate mb-1"
                              title={med.generic}
                            >
                              {med.generic}
                              {med.strength ? ` • ${med.strength}` : ""}
                            </p>
                            <p className="text-[12px] sm:text-[13px] font-medium truncate mb-4">
                              <span className="text-purple-600 font-bold">For: </span>
                              <span className="text-slate-600 font-semibold">{med.useFor || med.generic}</span>
                            </p>
                          </div>

                          {/* Bottom Row: Verified Price (or explicit unavailable label) + Cart Button */}
                          <div className="relative z-10 flex items-end justify-between pt-3 border-t border-slate-100/90 mt-auto">
                            {verifiedPrice !== null ? (
                              <div className="flex items-baseline gap-1">
                                <span className="text-[20px] sm:text-[22px] font-[900] text-slate-900 tracking-tight leading-none">
                                  ৳{verifiedPrice.toFixed(2)}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  /{med.priceBasis || "unit"}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs font-bold text-amber-700">
                                Price unavailable — verification required
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => toggleCart(med.id, e)}
                              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                isInCart
                                  ? "bg-slate-900 text-white shadow-sm"
                                  : "bg-[#F1F5F9] hover:bg-slate-200 text-slate-700"
                              }`}
                              title={isInCart ? "Remove from cart" : "Add to cart"}
                            >
                              <ShoppingCart
                                size={18}
                                strokeWidth={2.2}
                                className={isInCart ? "text-white" : "text-slate-700"}
                              />
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
                                ? "bg-sky-600 text-white shadow-xs"
                                : "border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 disabled:opacity-50"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      } else if (p === page - 2 || p === page + 2) {
                        return (
                          <span key={p} className="text-slate-400 font-bold px-1 text-xs">
                            ...
                          </span>
                        );
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
                {CATEGORIES.map((cat) => (
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
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                    setIsFilterOpen(false);
                  }}
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

      <MedicineDetailsModal
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
        onSelectAlternative={(alt) => setSelectedMedicine(alt)}
      />
    </div>
  );
}
