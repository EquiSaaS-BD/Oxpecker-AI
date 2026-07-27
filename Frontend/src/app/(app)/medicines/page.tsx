"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ScanBarcode, ChevronRight, ShoppingCart, UploadCloud, CheckCircle2, TrendingDown, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// E-commerce Mock Data
const ECOMMERCE_MEDICINES = [
  { id: "m1", name: "Napa Extend", generic: "Paracetamol", company: "Beximco Pharma", price: 2.50, type: "Tablet", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop" },
  { id: "m2", name: "Sergel 20mg", generic: "Esomeprazole", company: "Healthcare Pharma", price: 7.00, type: "Capsule", img: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&h=300&fit=crop" },
  { id: "m3", name: "Losectil 20mg", generic: "Omeprazole", company: "SK+F", price: 5.00, type: "Capsule", img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop" },
  { id: "m4", name: "Fexo 120", generic: "Fexofenadine", company: "Square Pharma", price: 8.00, type: "Tablet", img: "https://images.unsplash.com/photo-1550572017-edb73cefb180?w=300&h=300&fit=crop" },
  { id: "m5", name: "Calbo D", generic: "Calcium + Vit D3", company: "Square Pharma", price: 4.50, type: "Tablet", img: "https://images.unsplash.com/photo-1576073719676-aa95576db207?w=300&h=300&fit=crop" },
  { id: "m6", name: "Alatrol 10mg", generic: "Cetirizine", company: "Square Pharma", price: 3.00, type: "Tablet", img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop" },
  { id: "m7", name: "Maxpro 20mg", generic: "Esomeprazole", company: "Renata Ltd", price: 7.00, type: "Capsule", img: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=300&h=300&fit=crop" },
  { id: "m8", name: "Finix 20", generic: "Rabeprazole", company: "Opsonin Pharma", price: 6.00, type: "Tablet", img: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=300&fit=crop" },
];

export default function MedicinesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds loading simulation
    return () => clearTimeout(timer);
  }, []);

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
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      
      {/* Search & Scanner Hero Banner */}
      <div className="relative shrink-0 bg-white border-b border-slate-200 px-4 md:px-8 py-8 overflow-hidden z-10 shadow-sm">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-8 items-center justify-between">
          
          {/* Left: Search Title & Bar */}
          <div className="flex-1 w-full">
            <h1 className="text-[28px] md:text-[36px] font-[800] text-slate-900 mb-2 leading-tight">Search or Upload Prescription</h1>
            <p className="text-[15px] text-slate-500 font-medium mb-6">Find medicines, compare prices, or upload your prescription to automatically find the best alternatives.</p>
            
            <div className="bg-slate-50 rounded-[16px] flex items-center p-2 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm max-w-[600px]">
              <div className="pl-4 pr-3 text-slate-400">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by medicine name, generic, or symptoms..." 
                className="flex-1 bg-transparent border-none outline-none py-2 text-[15px] font-medium text-slate-800 placeholder:text-slate-400"
              />
              <button className="bg-slate-900 hover:bg-slate-800 text-white rounded-[12px] px-6 py-3 flex items-center gap-2 text-[14px] font-bold transition-colors ml-2 shadow-sm">
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
              className={`block border-2 border-dashed rounded-[24px] p-8 text-center transition-all relative overflow-hidden ${
                isScanning ? 'border-primary cursor-wait' : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5 cursor-pointer'
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
                <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
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
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-[24px] font-[800] text-slate-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Medicines"}
            </h2>
            <p className="text-[14px] text-slate-500 font-medium mt-1">Stock up on daily essentials</p>
          </div>
          {!searchQuery && (
            <button className="text-[14px] font-bold text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          )}
        </div>

        {(() => {
          if (isLoading) {
            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((skeleton) => (
                  <div key={skeleton} className="bg-white rounded-[20px] border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm">
                    {/* Image Skeleton */}
                    <div className="h-[180px] bg-slate-100 animate-pulse relative p-4 flex items-center justify-center border-b border-slate-50">
                      <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                    </div>
                    {/* Info Skeleton */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="w-1/2 h-3 bg-slate-200 animate-pulse rounded mb-3"></div>
                      <div className="w-3/4 h-5 bg-slate-200 animate-pulse rounded mb-2"></div>
                      <div className="w-full h-3 bg-slate-100 animate-pulse rounded mb-4"></div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="w-20 h-6 bg-slate-200 animate-pulse rounded"></div>
                        <div className="w-10 h-10 bg-slate-200 animate-pulse rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          const filteredMedicines = ECOMMERCE_MEDICINES.filter(med => 
            med.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            med.generic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.company.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredMedicines.length === 0) {
            return (
              <div className="text-center py-20">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">No medicines found</h3>
                <p className="text-[14px] text-slate-500">We couldn't find anything matching "{searchQuery}". Try a different term.</p>
                <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">Clear Search</Button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredMedicines.map((med) => (
                <div key={med.id} className="bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group flex flex-col h-full">
                  
                  {/* Image Container */}
                  <div className="h-[180px] bg-white relative p-4 flex items-center justify-center border-b border-slate-50">
                    <div className="relative w-full h-full">
                      <Image src={med.img} alt={med.name} fill className="object-contain group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {med.type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Info Container */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-[11px] font-[800] text-slate-400 uppercase tracking-widest mb-1 truncate">{med.company}</p>
                    <h3 className="text-[16px] font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary transition-colors">{med.name}</h3>
                    <p className="text-[13px] text-slate-500 font-medium mb-4 line-clamp-1">{med.generic}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-[18px] font-[800] text-slate-900">৳ {med.price.toFixed(2)}</span>
                      </div>
                      <button className="w-10 h-10 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl flex items-center justify-center transition-colors">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          );
        })()}

      </div>

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
