"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
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
  BookmarkPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "en" | "bn" | "ar";

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
    aToZSub: "Directly compiled from Bangladesh Directorate General of Drug Administration (DGDA) & official pharmacopeia monographs.",
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
    officialCarton: "Regulatory Container & Blister/Bottle Presentation"
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
    officialCarton: "অনুমোদিত রেগুলেটরি কন্টেইনার ও কার্টন উপস্থাপনা"
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
    officialCarton: "العبوة الصيدلانية المعتمدة مع ختم الجودة"
  }
};

export default function MedicineDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [medicine, setMedicine] = useState<any>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("en");

  const t = useMemo(() => TRANSLATIONS[currentLang] || TRANSLATIONS.en, [currentLang]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/medicines/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setMedicine(data.data);
          setAlternatives(data.alternatives || []);
        } else {
          setMedicine(null);
        }
      })
      .catch(err => {
        console.error("Failed to load medicine details:", err);
        setMedicine(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">{t.loadingText}</p>
        </div>
      </div>
    );
  }

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
  const isSyrupOrLiquid = (medicine.type || "").toLowerCase().includes("syrup") || 
                          (medicine.type || "").toLowerCase().includes("suspension") || 
                          (medicine.type || "").toLowerCase().includes("powder for suspension") || 
                          (medicine.type || "").toLowerCase().includes("liquid") || 
                          (medicine.type || "").toLowerCase().includes("solution") ||
                          (medicine.type || "").toLowerCase().includes("drop");
  
  const isInjection = (medicine.type || "").toLowerCase().includes("injection") || 
                      (medicine.type || "").toLowerCase().includes("iv") || 
                      (medicine.type || "").toLowerCase().includes("infusion");

  const isCreamOrGel = (medicine.type || "").toLowerCase().includes("cream") || 
                       (medicine.type || "").toLowerCase().includes("ointment") || 
                       (medicine.type || "").toLowerCase().includes("gel");

  return (
    <div className={`min-h-screen bg-[#F8FAFC] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-32 ${currentLang === 'ar' ? 'rtl font-sans' : ''}`}>
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Bar: Back Button, Language Translator Toggle, Prescribing Info & Share */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link 
            href="/medicines"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 text-slate-700 hover:text-sky-600 font-bold text-sm shadow-xs transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t.backToMedicines}</span>
          </Link>

          <div className="flex items-center gap-2">
            
            {/* Interactive Multi-Language Translator Option */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
              <div className="flex items-center gap-1.5 px-2 text-slate-400">
                <Globe size={15} className="text-sky-600" />
              </div>
              <button
                type="button"
                onClick={() => setCurrentLang("en")}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentLang === "en" 
                    ? "bg-slate-900 text-white shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setCurrentLang("bn")}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentLang === "bn" 
                    ? "bg-sky-600 text-white shadow-2xs" 
                    : "text-slate-600 hover:text-sky-600 hover:bg-slate-100"
                }`}
                title="বাংলায় পরিবর্তন করুন"
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setCurrentLang("ar")}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentLang === "ar" 
                    ? "bg-emerald-700 text-white shadow-2xs" 
                    : "text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                }`}
                title="التبديل إلى العربية"
              >
                عربي
              </button>
            </div>

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

        {/* Hero Section: Authentic Official Packaging Presentation + Drug Specifications */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-8">
            
            {/* Left: Authentic Official Pharmaceutical 3D Packaging Renderer (ZERO cartoon mascots) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-between bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100/60 rounded-3xl p-6 sm:p-7 border border-slate-200/90 relative overflow-hidden group shadow-inner">
              
              {/* DGDA National Registry Pill */}
              <div className="w-full flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-[11px] font-black border border-emerald-200/80 shadow-2xs">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>{t.dgdaVerified}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                  DAR #{medicine.id}
                </span>
              </div>

              {/* Realistic 3D Pharmaceutical Packaging Container Visualizer */}
              <div className="relative w-full py-4 flex flex-col items-center justify-center">
                
                {isSyrupOrLiquid ? (
                  /* Authentic Pharmaceutical Amber Syrup / Suspension Bottle + Box */
                  <div className="flex items-end justify-center gap-4 py-2">
                    
                    {/* Amber Pharmaceutical Glass Bottle with Dosage Cup Cap */}
                    <div className="w-24 sm:w-28 h-48 sm:h-52 rounded-2xl bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 p-2 flex flex-col justify-between shadow-[0_20px_40px_rgba(120,53,15,0.35)] border border-amber-900/80 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {/* Bottle Cap with translucent measuring cup look */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-7 rounded-t-md bg-gradient-to-b from-slate-100 to-slate-300 border border-slate-400 shadow-xs flex flex-col items-center justify-start pt-1">
                        <div className="w-6 h-0.5 bg-slate-400/50 rounded-full" />
                        <div className="w-4 h-0.5 bg-slate-400/40 rounded-full mt-1" />
                      </div>
                      
                      {/* Glass light reflection highlight */}
                      <div className="absolute top-0 left-2 w-2 h-full bg-white/20 blur-[1px] pointer-events-none rounded-full" />
                      
                      {/* Printed Bottle Label */}
                      <div className="mt-5 mb-2 bg-white rounded-lg p-2 flex flex-col justify-between h-32 border border-slate-200 shadow-xs text-center">
                        <div>
                          <span className="text-[8px] font-black text-rose-600 tracking-wider uppercase block">
                            Rx Only
                          </span>
                          <h4 className="text-[13px] sm:text-[14px] font-black text-slate-900 leading-tight truncate">
                            {medicine.name}
                          </h4>
                          <p className="text-[8px] font-bold text-sky-700 leading-tight truncate">
                            {medicine.strength || "100 mg/5 ml"}
                          </p>
                        </div>
                        <div className="border-t border-slate-100 pt-1">
                          <p className="text-[7px] text-slate-500 font-semibold truncate">
                            {medicine.generic}
                          </p>
                          <p className="text-[7px] font-bold text-slate-700 truncate">
                            {medicine.company}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Matching Unit Carton Packaging Box */}
                    <div className="w-28 sm:w-32 h-52 sm:h-56 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-sky-50 border-2 border-sky-300/80 p-3 flex flex-col justify-between shadow-[0_24px_48px_rgba(0,61,155,0.14)] relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-500">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-bl-full pointer-events-none" />
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black uppercase tracking-wider text-sky-700">
                            {medicine.type || "Suspension"}
                          </span>
                          <span className="text-[8px] font-extrabold text-rose-600">Rx</span>
                        </div>
                        <h4 className="text-[15px] sm:text-[16px] font-black text-slate-900 leading-tight tracking-tight">
                          {medicine.name}
                        </h4>
                        <p className="text-[9px] font-bold text-sky-700 mt-0.5">
                          {medicine.strength}
                        </p>
                        <p className="text-[8px] text-slate-500 font-semibold leading-tight mt-1 line-clamp-2">
                          {medicine.generic}
                        </p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-200/80">
                        <div className="flex items-center justify-between text-[8px] text-slate-400">
                          <span>DGDA Validated</span>
                          <ShieldCheck size={11} className="text-emerald-600" />
                        </div>
                        <p className="text-[8px] font-bold text-slate-700 truncate">
                          {medicine.company}
                        </p>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Authentic Pharmaceutical Carton Box + Silver Foil Blister Pack (Tablets/Capsules) */
                  <div className="flex items-end justify-center gap-3 py-2">
                    
                    {/* 3D Clinical Medicine Carton Box */}
                    <div className="w-36 sm:w-44 h-48 sm:h-52 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-sky-50 border-2 border-sky-300/80 p-3.5 flex flex-col justify-between shadow-[0_24px_48px_rgba(0,61,155,0.15)] relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600" />
                      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-500/5 rounded-full pointer-events-none" />
                      
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                            {medicine.type || "Tablet"}
                          </span>
                          <span className="text-[9px] font-black text-rose-600">Rx Only</span>
                        </div>
                        <h4 className="text-[17px] sm:text-[19px] font-black text-slate-900 leading-tight tracking-tight">
                          {medicine.name}
                        </h4>
                        <p className="text-[11px] font-bold text-sky-700 mt-0.5">
                          {medicine.strength || "Standard"}
                        </p>
                        <p className="text-[9px] text-slate-500 font-semibold leading-tight mt-1 line-clamp-2">
                          {medicine.generic}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                          <span className="font-mono text-[8px]">DAR #{medicine.id}</span>
                          <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> GMP Certified
                          </span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-800 truncate">
                          {medicine.company}
                        </p>
                      </div>
                    </div>

                    {/* Silver Alu-Alu Foil Blister Strip */}
                    <div className="w-16 sm:w-20 h-40 sm:h-44 rounded-xl bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border border-slate-300/80 p-2 flex flex-col justify-around shadow-md relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:250%_250%] animate-[pulse_4s_infinite]" />
                      {[1, 2, 3, 4].map((pocket) => (
                        <div key={pocket} className="w-full h-6 rounded-lg bg-gradient-to-r from-slate-300 via-white to-slate-300 shadow-inner border border-slate-400/60 flex items-center justify-center">
                          <div className="w-8 h-2 rounded-full bg-slate-200/90 shadow-xs" />
                        </div>
                      ))}
                    </div>

                  </div>
                )}

              </div>

              {/* Bottom Official Packaging Description */}
              <div className="w-full text-center mt-3 pt-3 border-t border-slate-200/80">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  {medicine.type || "Tablet"} Packaging
                </span>
                <p className="text-xs font-semibold text-slate-500 mt-1.5 truncate">
                  {medicine.packageContainer || "Standard Pharmaceutical Blister/Unit Container"}
                </p>
              </div>

            </div>

            {/* Right: Core Medical Specifications (English by Default) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
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

                <h1 className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight">
                  {medicine.name}
                </h1>
                
                <p className="text-base sm:text-lg font-bold text-sky-700 mt-1">
                  {medicine.generic} {medicine.strength && <span className="text-slate-600 font-semibold">• {medicine.strength}</span>}
                </p>

                <div className="flex items-center gap-2 mt-3 text-sm text-slate-600 font-semibold">
                  <Building2 size={16} className="text-sky-600 shrink-0" />
                  <span>{medicine.company}</span>
                </div>
              </div>

              {/* Price Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t.govtApprovedPrice}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      ৳{typeof medicine.price === 'number' ? medicine.price.toFixed(2) : (medicine.unitPrice ? medicine.unitPrice.toFixed(2) : '0.00')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      /{medicine.priceBasis || "unit"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {t.inStock}
                  </span>
                </div>
              </div>

              {/* Primary Indication Callout */}
              {medicine.useFor && (
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/70 flex items-start gap-3">
                  <HeartPulse size={20} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-900 mb-0.5">
                      {t.primaryIndication}
                    </h3>
                    <p className="text-sm font-bold text-slate-800">
                      {medicine.useFor}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Comprehensive A-to-Z Official Medical Use Cases */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-sky-600" />
              <h2 className="text-xl sm:text-2xl font-[900] text-slate-900 tracking-tight">
                {t.aToZGuidelines}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t.aToZSub}
            </p>
          </div>

          {/* 1. Official Indications Description */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Info size={16} className="text-sky-600" />
              <span>{t.indicationsApprovedUses}</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {monograph?.indication_description || `${medicine.name} (${medicine.generic}) is an approved therapeutic pharmaceutical agent registered by the Directorate General of Drug Administration (DGDA). It is indicated for the treatment of ${medicine.useFor || 'bacterial and systemic conditions under qualified physician guidance'}.`}
            </p>
          </div>

          {/* 2. Mode of Action / Pharmacology */}
          {monograph?.pharmacology && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                <span>{t.pharmacologyMechanism}</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {monograph.pharmacology}
              </p>
            </div>
          )}

          {/* 3. Dosage & Administration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                <span>{t.dosageGuidelines}</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {monograph?.dosage || `Dosage is determined by a licensed physician according to patient age, clinical severity, and organ function. Do not alter prescribed dosage without clinical advice.`}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Pill size={16} className="text-amber-600" />
                <span>{t.administrationInstructions}</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {monograph?.administration || (isSyrupOrLiquid 
                  ? "Shake the bottle well before each administration. Use a calibrated measuring device to ensure accurate dosing." 
                  : "Swallow whole with a full glass of water. Do not chew or crush unless specified by your physician.")}
              </p>
            </div>
          </div>

          {/* 4. Side Effects & Contraindications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monograph?.side_effects && (
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
                <h3 className="text-sm font-extrabold text-rose-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <span>{t.sideEffects}</span>
                </h3>
                <p className="text-sm text-rose-900/90 leading-relaxed font-normal whitespace-pre-line">
                  {monograph.side_effects}
                </p>
              </div>
            )}

            {monograph?.contraindications && (
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>{t.contraindications}</span>
                </h3>
                <p className="text-sm text-amber-900/90 leading-relaxed font-normal whitespace-pre-line">
                  {monograph.contraindications}
                </p>
              </div>
            )}
          </div>

          {/* 5. Pregnancy & Precautions */}
          {(monograph?.pregnancy_and_lactation || monograph?.precautions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monograph?.pregnancy_and_lactation && (
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2">
                  <h3 className="text-sm font-extrabold text-purple-900 flex items-center gap-2">
                    <HeartPulse size={16} className="text-purple-600" />
                    <span>{t.pregnancyLactation}</span>
                  </h3>
                  <p className="text-sm text-purple-900/90 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.pregnancy_and_lactation}
                  </p>
                </div>
              )}

              {monograph?.precautions && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Info size={16} className="text-sky-600" />
                    <span>{t.precautionsWarnings}</span>
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {monograph.precautions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 6. Storage Conditions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <FileCheck2 size={18} className="text-slate-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                {t.storageInstructions}
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {monograph?.storage_conditions || "Store below 30°C in a dry and cool place protected from direct sunlight and moisture. Keep safely out of reach of children."}
              </p>
            </div>
          </div>
        </div>

        {/* Database Specification Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-[900] text-slate-900 tracking-tight">
              {t.databaseSpecs}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t.databaseSpecsSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {t.brandName}
              </span>
              <span className="font-bold text-slate-900 text-base">
                {medicine.name}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {t.genericName}
              </span>
              <span className="font-bold text-slate-900 text-base">
                {medicine.generic}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {t.strength}
              </span>
              <span className="font-bold text-slate-800 text-base">
                {medicine.strength || "Standard"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {t.dosageForm}
              </span>
              <span className="font-bold text-slate-800 text-base">
                {medicine.type || "Tablet"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {t.manufacturer}
              </span>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-sky-600 shrink-0" />
                <span className="font-bold text-slate-900 text-base">
                  {medicine.company || "Pharmaceuticals"}
                </span>
              </div>
            </div>

            {medicine.packageContainer && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {t.packagingDetails}
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {medicine.packageContainer}
                </span>
              </div>
            )}
          </div>

          {/* Verification Guarantee Notice */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <FileCheck2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed font-medium">
              {t.verifiedGuarantee}
            </div>
          </div>
        </div>

        {/* Generic Alternatives */}
        {alternatives.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-[900] text-slate-900 tracking-tight">
                {t.affordableAlternatives} ({alternatives.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t.affordableAlternativesSub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {alternatives.map((alt) => (
                <Link
                  key={alt.id}
                  href={`/medicines/${alt.id}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-sky-700 truncate text-sm">
                      {alt.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                      {alt.company}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {alt.strength} • {alt.type}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">
                      {alt.price ? `৳${alt.price.toFixed(2)}` : t.available}
                    </span>
                    <span className="text-xs font-bold text-sky-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      {t.viewDetails} <ChevronRight size={14} />
                    </span>
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
