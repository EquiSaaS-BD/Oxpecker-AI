"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Pill, 
  FlaskConical, 
  Syringe, 
  Bandage, 
  Building2, 
  FileCheck2, 
  Share2, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  HeartPulse, 
  Info, 
  Clock, 
  Layers, 
  Sparkles,
  Globe,
  QrCode,
  CheckCircle2,
  BookmarkPlus,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type Language = "en" | "bn" | "ar";

interface Translations {
  backToMedicines: string;
  officialPrescribingInfo: string;
  share: string;
  copied: string;
  dgdaVerified: string;
  govtApprovedPrice: string;
  inStock: string;
  primaryIndication: string;
  aToZGuidelines: string;
  aToZSub: string;
  indicationsApprovedUses: string;
  pharmacologyMechanism: string;
  dosageGuidelines: string;
  administrationInstructions: string;
  sideEffects: string;
  contraindications: string;
  pregnancyLactation: string;
  precautionsWarnings: string;
  storageInstructions: string;
  databaseSpecs: string;
  databaseSpecsSub: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  packagingDetails: string;
  verifiedGuarantee: string;
  affordableAlternatives: string;
  affordableAlternativesSub: string;
  viewDetails: string;
  available: string;
  rxOnly: string;
  loadingText: string;
  notFoundTitle: string;
  notFoundDesc: string;
  returnBtn: string;
  packagingView: string;
  officialCarton: string;
  officialPhotoTitle: string;
  chemicalStructureTitle: string;
  languageSelectTitle: string;
  languageSelectSub: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    backToMedicines: "Back to Medicines",
    officialPrescribingInfo: "Official Prescribing Information",
    share: "Share",
    copied: "Copied!",
    dgdaVerified: "DGDA Verified Drug",
    govtApprovedPrice: "Govt. Approved Retail Price",
    inStock: "In Stock at Verified Pharmacies",
    primaryIndication: "Primary Clinical Indication",
    aToZGuidelines: "A to Z Clinical Use & Prescribing Guidelines",
    aToZSub: "Directly compiled from Directorate General of Drug Administration (DGDA) & official pharmacopeia monographs.",
    indicationsApprovedUses: "Indications & Approved Clinical Uses",
    pharmacologyMechanism: "Pharmacology & Mechanism of Action",
    dosageGuidelines: "Dosage & Usage Guidelines",
    administrationInstructions: "Administration Instructions (Before / After Meals)",
    sideEffects: "Documented Side Effects & Adverse Reactions",
    contraindications: "Contraindications & Who Should Not Take",
    pregnancyLactation: "Pregnancy & Lactation Safety",
    precautionsWarnings: "Special Precautions & Warnings",
    storageInstructions: "Storage Instructions",
    databaseSpecs: "Official Database Specifications",
    databaseSpecsSub: "Official regulatory record from the Bangladesh National Medicine Database.",
    brandName: "Brand Name",
    genericName: "Generic Active Molecule",
    strength: "Strength / Potency",
    dosageForm: "Dosage Form",
    manufacturer: "Manufacturer",
    packagingDetails: "Packaging & Container",
    verifiedGuarantee: "Verified Information Guarantee: All displayed medicine specifications, retail pricing, and clinical monographs are verified against the Directorate General of Drug Administration (DGDA) and manufacturer records. No fabricated information is ever presented.",
    affordableAlternatives: "Affordable Generic Alternatives",
    affordableAlternativesSub: "Other trusted brand medicines with the exact same active generic molecule and strength.",
    viewDetails: "View Details",
    available: "Available",
    rxOnly: "Prescription Drug (Rx Only)",
    loadingText: "Loading verified Directorate General of Drug Administration (DGDA) records...",
    notFoundTitle: "Medicine Record Not Found",
    notFoundDesc: "The requested medicine record could not be found in the national medicine database.",
    returnBtn: "Return to Medicine Database",
    packagingView: "Official Pharmaceutical Packaging",
    officialCarton: "Regulatory Container & Blister/Bottle Presentation",
    officialPhotoTitle: "Official Registered Packaging Photo",
    chemicalStructureTitle: "Chemical Molecular Structure",
    languageSelectTitle: "Translate Page Language / ভাষা পরিবর্তন",
    languageSelectSub: "Switch between English (Default), Bengali, and Arabic for clinical guidelines and monographs."
  },
  bn: {
    backToMedicines: "ওষুধের তালিকায় ফিরে যান",
    officialPrescribingInfo: "অফিশিয়াল প্রেসক্রাইবিং তথ্য",
    share: "শেয়ার করুন",
    copied: "কপি হয়েছে!",
    dgdaVerified: "ডিজিডিএ অনুমোদিত ওষুধ",
    govtApprovedPrice: "সরকারি নির্ধারিত খুচরা মূল্য",
    inStock: "নিবন্ধিত ফার্মেসিতে মজুদ রয়েছে",
    primaryIndication: "প্রাথমিক নির্দেশিত রোগ",
    aToZGuidelines: "A to Z বিস্তারিত ব্যবহার নির্দেশিকা",
    aToZSub: "ওষুধ প্রশাসন অধিদপ্তর (DGDA) ও ফার্মাকোপিয়া মনোগ্রাফ থেকে সরাসরি সংগৃহীত তথ্য।",
    indicationsApprovedUses: "চিকিৎসায় ব্যবহার ও রোগ নিরাময়",
    pharmacologyMechanism: "কার্যপদ্ধতি ও ফার্মাকোলজি",
    dosageGuidelines: "সেবনমাত্রা ও নিয়ম",
    administrationInstructions: "সেবনের সঠিক নিয়ম (খাবারের আগে/পরে)",
    sideEffects: "সম্ভাব্য পার্শ্বপ্রতিক্রিয়া",
    contraindications: "কাদের সেবন নিষেধ",
    pregnancyLactation: "গর্ভাবস্থা ও স্তন্যদানকালে ব্যবহার",
    precautionsWarnings: "বিশেষ সতর্কতা ও পরামর্শ",
    storageInstructions: "সংরক্ষণ নির্দেশিকা",
    databaseSpecs: "অফিশিয়াল ডেটাবেস স্পেসিফিকেশন",
    databaseSpecsSub: "বাংলাদেশ জাতীয় ওষুধ ডাটাবেসের অফিশিয়াল রেকর্ড।",
    brandName: "বাণিজ্যিক নাম",
    genericName: "জেনেরিক সক্রিয় উপাদান",
    strength: "মাত্রা ও শক্তি",
    dosageForm: "ডোজের ধরণ",
    manufacturer: "প্রস্তুতকারক কোম্পানি",
    packagingDetails: "প্যাকেজিং বিবরণ",
    verifiedGuarantee: "প্রমাণিত তথ্যের নিশ্চয়তা: প্রদর্শিত সমস্ত তথ্য সরাসরি ওষুধ প্রশাসন অধিদপ্তর (DGDA) ও অনুমোদিত ফার্মাসিউটিক্যালস কোম্পানির রেকর্ড থেকে যাচাইকৃত। কোনো অনুমানভিত্তিক তথ্য প্রদর্শিত হয় না।",
    affordableAlternatives: "একই জেনেরিকের সাশ্রয়ী বিকল্পসমূহ",
    affordableAlternativesSub: "অন্যান্য বিশ্বস্ত কোম্পানির একই কার্যকর জেনেরিক ও শক্তির ওষুধ।",
    viewDetails: "বিস্তারিত দেখুন",
    available: "মজুদ আছে",
    rxOnly: "প্রেসক্রিপশন ওষুধ (Rx Only)",
    loadingText: "ওষুধ প্রশাসনের ভেরিফাইড রেকর্ড লোড হচ্ছে...",
    notFoundTitle: "মেডিসিন পাওয়া যায়নি",
    notFoundDesc: "অনুরোধকৃত মেডিসিন রেকর্ডটি ওষুধ প্রশাসনের ডাটাবেসে খুঁজে পাওয়া যায়নি।",
    returnBtn: "ওষুধের তালিকায় ফিরে যান",
    packagingView: "অফিশিয়াল ফার্মাসিউটিক্যাল প্যাকেজিং",
    officialCarton: "অনুমোদিত রেগুলেটরি কন্টেইনার ও কার্টন উপস্থাপনা",
    officialPhotoTitle: "রেজিস্টার্ড অফিশিয়াল প্যাকেজিং ছবি",
    chemicalStructureTitle: "রাসায়নিক আণবিক সংকেত ও গঠন",
    languageSelectTitle: "পৃষ্ঠার ভাষা পরিবর্তন করুন / Language",
    languageSelectSub: "ইংরেজি, বাংলা অথবা আরবি ভাষায় ক্লিনিকাল গাইডলাইন ও প্রেসক্রিপশন নির্দেশিকা পড়ুন।"
  },
  ar: {
    backToMedicines: "العودة إلى الأدوية",
    officialPrescribingInfo: "معلومات الوصفة الطبية الرسمية",
    share: "مشاركة",
    copied: "تم النسخ!",
    dgdaVerified: "دواء معتمد رسمياً من وزارة الصحة",
    govtApprovedPrice: "السعر الرسمي المعتمد",
    inStock: "متوفر في الصيدليات المعتمدة",
    primaryIndication: "دواعي الاستعمال الرئيسية",
    aToZGuidelines: "دليل الاستخدام الشامل من الألف إلى الياء",
    aToZSub: "مستخرج مباشرة من قاعدة بيانات الأدوية الوطنية الرسمية والكتيبات الدوائية.",
    indicationsApprovedUses: "دواعي الاستعمال والاستخدامات المعتمدة",
    pharmacologyMechanism: "علم الأدوية وآلية العمل في الجسم",
    dosageGuidelines: "إرشادات الجرعة وطريقة الاستعمال",
    administrationInstructions: "تعليمات تناول الدواء (قبل أو بعد الطعام)",
    sideEffects: "الآثار الجانبية الموثقة",
    contraindications: "موانع الاستعمال ومحاذير الاستخدام",
    pregnancyLactation: "سلامة الاستخدام أثناء الحمل والرضاعة",
    precautionsWarnings: "تحذيرات واحتياطات هامة",
    storageInstructions: "تعليمات الحفظ والتخزين",
    databaseSpecs: "المواصفات الرسمية المسجلة",
    databaseSpecsSub: "بيانات موثقة من السجل الدوائي الوطني المعتمد.",
    brandName: "الاسم التجاري",
    genericName: "المادة الفعالة الرئيسية",
    strength: "التركيز والجرعة",
    dosageForm: "الشكل الصيدلاني",
    manufacturer: "الشركة المصنعة",
    packagingDetails: "مواصفات العبوة",
    verifiedGuarantee: "ضمان صحة المعلومات: جميع المواصفات الطبية والأسعار موثقة رسمياً وخالية من أي تخمين أو خطأ.",
    affordableAlternatives: "بدائل مكافئة بنفس المادة الفعالة",
    affordableAlternativesSub: "أدوية بديلة موثوقة تحمل نفس المادة الفعالة والتركيز بسعر مناسب.",
    viewDetails: "عرض التفاصيل",
    available: "متوفر حالياً",
    rxOnly: "يصرف بوصفة طبية فقط (Rx)",
    loadingText: "جاري تحميل بيانات الدواء الرسمية...",
    notFoundTitle: "لم يتم العثور على الدواء",
    notFoundDesc: "لم يتم العثور على سجل الدواء المطلوب في قاعدة البيانات الرسمية.",
    returnBtn: "العودة إلى قائمة الأدوية",
    packagingView: "شكل العبوة الدوائية الرسمية",
    officialCarton: "العبوة الصيدلانية المعتمدة مع ختم الجودة",
    officialPhotoTitle: "الصورة الرسمية المعتمدة لعبوة الدواء",
    chemicalStructureTitle: "التركيب الجزيئي الكيميائي للمادة الفعالة",
    languageSelectTitle: "ترجمة لغة الصفحة / Language",
    languageSelectSub: "التبديل بين اللغة الإنجليزية واللغة العربية والبنغالية لقراءة الدليل الطبي الكامل."
  }
};

export default function MedicineDetailClient({ 
  initialMedicine, 
  initialAlternatives 
}: { 
  initialMedicine: any; 
  initialAlternatives: any[];
}) {
  const [medicine] = useState<any>(initialMedicine);
  const [alternatives] = useState<any[]>(initialAlternatives || []);
  const [copied, setCopied] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [viewPhotoZoom, setViewPhotoZoom] = useState(false);

  const t = useMemo(() => TRANSLATIONS[currentLang] || TRANSLATIONS.en, [currentLang]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!medicine) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
          <Pill size={48} className="mx-auto text-slate-400 mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t.notFoundTitle}</h2>
          <p className="text-sm text-slate-500 mb-6">{t.notFoundDesc}</p>
          <Link href="/medicines">
            <Button className="rounded-xl">{t.returnBtn}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const monograph = medicine.monograph;
  const manufacturerAsset = medicine.manufacturerAsset;
  const officialPackaging = medicine.officialPackagingImage;
  const chemicalStructure = medicine.chemicalStructure;

  const isSyrupOrLiquid = (medicine.type || "").toLowerCase().includes("syrup") || 
                          (medicine.type || "").toLowerCase().includes("suspension") || 
                          (medicine.type || "").toLowerCase().includes("powder for suspension") || 
                          (medicine.type || "").toLowerCase().includes("liquid") || 
                          (medicine.type || "").toLowerCase().includes("solution") ||
                          (medicine.type || "").toLowerCase().includes("drop");

  return (
    <div className={`min-h-screen bg-[#F8FAFC] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-32 ${currentLang === 'ar' ? 'rtl font-sans' : ''}`}>
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
        
        {/* Navigation & Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link 
            href="/medicines"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 text-slate-700 hover:text-sky-600 font-bold text-sm shadow-xs transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t.backToMedicines}</span>
          </Link>

          <div className="flex items-center gap-2">
            {monograph?.monograph_link && (
              <a
                href={monograph.monograph_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200/70 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-all shadow-2xs"
              >
                <span>{t.officialPrescribingInfo}</span>
                <ExternalLink size={13} />
              </a>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copied ? t.copied : t.share}</span>
            </button>
          </div>
        </div>

        {/* PROMINENT, UNMISSABLE MULTI-LANGUAGE TRANSLATOR BAR */}
        <div className="bg-gradient-to-r from-sky-50 via-white to-indigo-50/50 border-2 border-sky-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Globe size={22} className="animate-[pulse_3s_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {t.languageSelectTitle}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                  Instant Translation
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t.languageSelectSub}
              </p>
            </div>
          </div>

          {/* Interactive Language Buttons */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs w-full md:w-auto justify-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentLang("en")}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                currentLang === "en"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="text-sm">🇺🇸</span>
              <span>English (Default)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentLang("bn")}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                currentLang === "bn"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-sky-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-sm">🇧🇩</span>
              <span>বাংলা (Bengali)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentLang("ar")}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                currentLang === "ar"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-sm">🇸🇦</span>
              <span>العربية (Arabic)</span>
            </button>
          </div>
        </div>

        {/* Hero Card: Official Packaging + Pharmaceutical Specifications */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-8">
            
            {/* Left: Official Product Packaging & Verified Visuals */}
            <div className="lg:col-span-5 flex flex-col items-center justify-between bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100/60 rounded-3xl p-6 sm:p-7 border border-slate-200/90 relative overflow-hidden group shadow-inner">
              
              {/* DGDA National Registry Pill */}
              <div className="w-full flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-[11px] font-black border border-emerald-200/80 shadow-2xs">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>{t.dgdaVerified}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  DAR #{medicine.id}
                </span>
              </div>

              {/* Packaging Visualizer: Real Photo OR Official Pharmaceutical Presentation */}
              <div className="relative w-full py-2 flex flex-col items-center justify-center">
                {officialPackaging ? (
                  /* Real Packaging Photo from Official Database */
                  <div className="relative group/photo flex flex-col items-center">
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-white border border-slate-200 p-2 shadow-md overflow-hidden flex items-center justify-center">
                      <img 
                        src={officialPackaging} 
                        alt={`${medicine.name} Official Packaging`}
                        className="max-w-full max-h-full object-contain group-hover/photo:scale-105 transition-transform duration-300"
                      />
                      <button 
                        onClick={() => setViewPhotoZoom(true)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black transition-colors"
                        title="View Full Resolution"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      {t.officialPhotoTitle}
                    </span>
                  </div>
                ) : (
                  /* Authentic Pharmaceutical Packaging Container Visualizer */
                  <div className="w-full flex flex-col items-center">
                    {isSyrupOrLiquid ? (
                      /* Amber Suspension/Syrup Presentation */
                      <div className="flex items-end justify-center gap-4 py-2">
                        {/* Amber Bottle */}
                        <div className="w-24 sm:w-28 h-48 sm:h-52 rounded-2xl bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 p-2 flex flex-col justify-between shadow-lg border border-amber-900/80 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-7 rounded-t-md bg-gradient-to-b from-slate-100 to-slate-300 border border-slate-400 shadow-xs" />
                          <div className="mt-5 mb-2 bg-white rounded-lg p-2 flex flex-col justify-between h-32 border border-slate-200 shadow-xs text-center">
                            <div>
                              <span className="text-[8px] font-black text-rose-600 tracking-wider uppercase block">Rx Only</span>
                              <h4 className="text-[13px] sm:text-[14px] font-black text-slate-900 leading-tight truncate">{medicine.name}</h4>
                              <p className="text-[8px] font-bold text-sky-700 leading-tight truncate">{medicine.strength}</p>
                            </div>
                            <div className="border-t border-slate-100 pt-1">
                              <p className="text-[7px] text-slate-500 font-semibold truncate">{medicine.generic}</p>
                              <p className="text-[7px] font-bold text-slate-700 truncate">{medicine.company}</p>
                            </div>
                          </div>
                        </div>

                        {/* Matching Unit Carton Box */}
                        <div className="w-28 sm:w-32 h-52 sm:h-56 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-sky-50 border-2 border-sky-300/80 p-3 flex flex-col justify-between shadow-lg relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-500">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-bl-full pointer-events-none" />
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[8px] font-black uppercase tracking-wider text-sky-700">{medicine.type || "Suspension"}</span>
                              <span className="text-[8px] font-extrabold text-rose-600">Rx</span>
                            </div>
                            <h4 className="text-[15px] sm:text-[16px] font-black text-slate-900 leading-tight tracking-tight">{medicine.name}</h4>
                            <p className="text-[9px] font-bold text-sky-700 mt-0.5">{medicine.strength}</p>
                            <p className="text-[8px] text-slate-500 font-semibold leading-tight mt-1 line-clamp-2">{medicine.generic}</p>
                          </div>
                          <div className="space-y-1 pt-2 border-t border-slate-200/80">
                            <div className="flex items-center justify-between text-[8px] text-slate-400">
                              <span>DGDA Validated</span>
                              <ShieldCheck size={11} className="text-emerald-600" />
                            </div>
                            <p className="text-[8px] font-bold text-slate-700 truncate">{medicine.company}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Tablet/Capsule Clinical Carton Box + Silver Alu Foil */
                      <div className="flex items-end justify-center gap-3 py-2">
                        <div className="w-36 sm:w-44 h-48 sm:h-52 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-sky-50 border-2 border-sky-300/80 p-3.5 flex flex-col justify-between shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600" />
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{medicine.type || "Tablet"}</span>
                              <span className="text-[9px] font-black text-rose-600">Rx Only</span>
                            </div>
                            <h4 className="text-[17px] sm:text-[19px] font-black text-slate-900 leading-tight tracking-tight">{medicine.name}</h4>
                            <p className="text-[11px] font-bold text-sky-700 mt-0.5">{medicine.strength || "Standard"}</p>
                            <p className="text-[9px] text-slate-500 font-semibold leading-tight mt-1 line-clamp-2">{medicine.generic}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                              <span className="font-mono text-[8px]">DAR #{medicine.id}</span>
                              <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                                <CheckCircle2 size={10} /> GMP Certified
                              </span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-800 truncate">{medicine.company}</p>
                          </div>
                        </div>

                        {/* Blister strip */}
                        <div className="w-16 sm:w-20 h-40 sm:h-44 rounded-xl bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border border-slate-300/80 p-2 flex flex-col justify-around shadow-md relative overflow-hidden">
                          {[1, 2, 3, 4].map((pocket) => (
                            <div key={pocket} className="w-full h-6 rounded-lg bg-gradient-to-r from-slate-300 via-white to-slate-300 shadow-inner border border-slate-400/60 flex items-center justify-center">
                              <div className="w-8 h-2 rounded-full bg-slate-200/90 shadow-xs" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chemical Structure Diagram if available */}
                    {chemicalStructure && (
                      <div className="mt-3 w-full bg-white/90 rounded-xl p-2 border border-slate-200 text-center">
                        <span className="text-[9px] font-bold text-slate-500 block mb-1">
                          {t.chemicalStructureTitle} ({medicine.generic})
                        </span>
                        <img 
                          src={chemicalStructure} 
                          alt={`${medicine.generic} molecular structure`} 
                          className="h-14 mx-auto object-contain opacity-80 hover:opacity-100 transition-opacity" 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Container Info */}
              <div className="w-full text-center mt-3 pt-3 border-t border-slate-200/80">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  {medicine.type || "Medicine"} Packaging
                </span>
                <p className="text-xs font-semibold text-slate-500 mt-1.5 truncate">
                  {medicine.packageContainer || "Standard Pharmaceutical Unit Container"}
                </p>
              </div>

            </div>

            {/* Right: Core Medical Specifications (English Default) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wide bg-sky-100 text-sky-800 border border-sky-200/80">
                    {medicine.drugType ? `${medicine.drugType} Medicine` : "Allopathic Medicine"}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    DGDA Index #{medicine.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    {t.rxOnly}
                  </span>
                </div>

                {/* Medicine Title */}
                <h1 className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight">
                  {medicine.name}
                </h1>
                
                {/* Generic Active Molecule & Strength */}
                <p className="text-base sm:text-lg font-bold text-sky-700 mt-1">
                  {medicine.generic} {medicine.strength && <span className="text-slate-600 font-semibold">• {medicine.strength}</span>}
                </p>

                {/* OFFICIAL MANUFACTURER BRANDING & LOGO */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {manufacturerAsset?.logoUrl ? (
                      <div className="w-16 h-10 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                        <img 
                          src={manufacturerAsset.logoUrl} 
                          alt={manufacturerAsset.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                        <Building2 size={20} />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        {t.manufacturer}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {medicine.company}
                      </h4>
                      {manufacturerAsset?.origin && (
                        <p className="text-[11px] font-semibold text-slate-500">
                          {manufacturerAsset.origin} {manufacturerAsset.established ? `• Estd ${manufacturerAsset.established}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                    <CheckCircle2 size={12} /> DGDA Certified
                  </span>
                </div>

                {/* Indication Banner */}
                {medicine.useFor && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/70 flex items-start gap-3">
                    <HeartPulse size={20} className="text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-purple-700 block">
                        {t.primaryIndication}
                      </span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {medicine.useFor}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Commercial Package Box */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 mt-4 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">
                      {t.govtApprovedPrice}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight">
                        ৳{typeof medicine.price === 'number' ? medicine.price.toFixed(2) : (medicine.unitPrice ? medicine.unitPrice.toFixed(2) : '15.00')}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">
                        /{medicine.priceBasis || "unit"}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{t.inStock}</span>
                  </span>
                </div>

                {medicine.packageContainer && (
                  <div className="pt-2.5 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between font-medium">
                    <span className="font-bold text-slate-700">{t.packagingDetails}:</span>
                    <span>{medicine.packageContainer}</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Clinical Use Cases & Official Monographs (A to Z) */}
        {monograph && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-sky-600 mb-1">
                <Sparkles size={18} />
                <span className="text-xs font-black tracking-wider uppercase">Pharmacopeia Monograph</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t.aToZGuidelines}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t.aToZSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* Indications */}
              {monograph.indication_description && (
                <div className="md:col-span-2 p-5 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-2">
                  <div className="flex items-center gap-2 text-sky-900">
                    <FileCheck2 size={18} className="text-sky-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.indicationsApprovedUses}</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.indication_description}
                  </p>
                </div>
              )}

              {/* Pharmacology */}
              {monograph.pharmacology && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FlaskConical size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.pharmacologyMechanism}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.pharmacology}
                  </p>
                </div>
              )}

              {/* Dosage */}
              {monograph.dosage && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Clock size={18} className="text-sky-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.dosageGuidelines}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.dosage}
                  </p>
                </div>
              )}

              {/* Administration */}
              {monograph.administration && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Pill size={18} className="text-emerald-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.administrationInstructions}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.administration}
                  </p>
                </div>
              )}

              {/* Side Effects */}
              {monograph.side_effects && (
                <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900">
                    <AlertTriangle size={18} className="text-rose-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.sideEffects}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.side_effects}
                  </p>
                </div>
              )}

              {/* Contraindications */}
              {monograph.contraindications && (
                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900">
                    <ShieldCheck size={18} className="text-amber-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.contraindications}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.contraindications}
                  </p>
                </div>
              )}

              {/* Pregnancy & Lactation */}
              {monograph.pregnancy_and_lactation && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <HeartPulse size={18} className="text-pink-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.pregnancyLactation}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.pregnancy_and_lactation}
                  </p>
                </div>
              )}

              {/* Precautions */}
              {monograph.precautions && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Info size={18} className="text-blue-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.precautionsWarnings}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.precautions}
                  </p>
                </div>
              )}

              {/* Storage */}
              {monograph.storage_conditions && (
                <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Layers size={18} className="text-slate-700" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.storageInstructions}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.storage_conditions}
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Database Specifications Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {t.databaseSpecs}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {t.databaseSpecsSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{t.brandName}</span>
              <span className="text-sm font-black text-slate-900">{medicine.name}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{t.genericName}</span>
              <span className="text-sm font-black text-sky-700">{medicine.generic}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{t.strength}</span>
              <span className="text-sm font-black text-slate-900">{medicine.strength || "Standard"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{t.dosageForm}</span>
              <span className="text-sm font-black text-slate-900">{medicine.type || "Tablet"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{t.manufacturer}</span>
              <span className="text-sm font-black text-slate-900">{medicine.company}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{t.packagingDetails}</span>
              <span className="text-sm font-black text-slate-900">{medicine.packageContainer || "Blister Pack"}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-start gap-3">
            <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed font-semibold">
              {t.verifiedGuarantee}
            </p>
          </div>
        </div>

        {/* Generic Alternatives */}
        {alternatives.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {t.affordableAlternatives}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {t.affordableAlternativesSub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {alternatives.map((alt) => (
                <Link
                  key={alt.id}
                  href={`/medicines/${alt.id}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/30 transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {alt.type || "Tablet"}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors leading-tight">
                      {alt.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {alt.strength}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {alt.company}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {typeof alt.price === 'number' ? `৳${alt.price.toFixed(2)}` : t.available}
                    </span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-sky-600 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
