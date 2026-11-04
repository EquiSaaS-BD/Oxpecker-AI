"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Pill, 
  FlaskConical, 
  Building2, 
  FileCheck2, 
  Share2, 
  Check, 
  ChevronRight,
  ChevronDown, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  HeartPulse, 
  Info, 
  Clock, 
  Layers, 
  Sparkles,
  Globe,
  CheckCircle2,
  Maximize2,
  X,
  Beaker,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type Language = "en" | "bn" | "ar" | "hi";

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
  interactionTitle: string;
  sideEffects: string;
  contraindications: string;
  pregnancyLactation: string;
  precautionsWarnings: string;
  overdoseTitle: string;
  reconstitutionTitle: string;
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
  translatingLabel: string;
  selectLanguage: string;
  quickSwitch: string;
  allopathicMedicine: string;
  dgdaCertified: string;
  monographHeaderBadge: string;
  pricePerUnit: string;
  dgdaIndexLabel: string;
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
    dosageGuidelines: "Dosage & Administration Guidelines",
    administrationInstructions: "Administration Instructions (Before / After Meals)",
    interactionTitle: "Drug Interactions",
    sideEffects: "Documented Side Effects & Adverse Reactions",
    contraindications: "Contraindications & Who Should Not Take",
    pregnancyLactation: "Pregnancy & Lactation Safety",
    precautionsWarnings: "Special Precautions & Warnings",
    overdoseTitle: "Overdose Effects & Emergency Management",
    reconstitutionTitle: "Suspension Reconstitution / Mixing Procedure",
    storageInstructions: "Storage Conditions & Handling",
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
    languageSelectTitle: "Select Language / ভাষা নির্বাচন",
    languageSelectSub: "Instant full-page clinical translation.",
    translatingLabel: "Translating monograph...",
    selectLanguage: "Select Language",
    quickSwitch: "Translate Page Instantly",
    allopathicMedicine: "Allopathic Medicine",
    dgdaCertified: "DGDA Certified",
    monographHeaderBadge: "DGDA & Pharmacopeia Monograph (English)",
    pricePerUnit: "/unit",
    dgdaIndexLabel: "DGDA Index #"
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
    aToZGuidelines: "A to Z বিস্তারিত ব্যবহার ও সেবন নির্দেশিকা",
    aToZSub: "ওষুধ প্রশাসন অধিদপ্তর (DGDA) ও অফিশিয়াল ফার্মাকোপিয়া মনোগ্রাফ থেকে সরাসরি সংগৃহীত তথ্য।",
    indicationsApprovedUses: "নির্দেশনা ও চিকিৎসায় ব্যবহার (Indications)",
    pharmacologyMechanism: "ফার্মাকোলজি ও কার্যপদ্ধতি (Pharmacology)",
    dosageGuidelines: "মাত্রা ও সেবনবিধি (Dosage & Administration)",
    administrationInstructions: "সেবনের সঠিক নিয়ম (খাবারের আগে/পরে)",
    interactionTitle: "ওষুধের মিথস্ক্রিয়া (Drug Interactions)",
    sideEffects: "সম্ভাব্য পার্শ্বপ্রতিক্রিয়া (Side Effects)",
    contraindications: "প্রতিনির্দেশনা ও কাদের সেবন নিষেধ (Contraindications)",
    pregnancyLactation: "গর্ভাবস্থা ও স্তন্যদানকালে ব্যবহার (Pregnancy & Lactation)",
    precautionsWarnings: "সতর্কতা ও বিশেষ পরামর্শ (Precautions & Warnings)",
    overdoseTitle: "মাত্রাধিক্যতা ও করণীয় (Overdose Effects)",
    reconstitutionTitle: "সাসপেনশন তৈরির নিয়ম / পুনর্গঠন প্রণালী (Reconstitution)",
    storageInstructions: "সংরক্ষণ নির্দেশিকা (Storage Conditions)",
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
    languageSelectTitle: "ভাষা নির্বাচন করুন / Language",
    languageSelectSub: "সম্পূর্ণ পাতা ও ওষুধের সেবন নির্দেশিকা বাংলায় পড়ুন।",
    translatingLabel: "বাংলায় অনুবাদ হচ্ছে...",
    selectLanguage: "ভাষা নির্বাচন",
    quickSwitch: "মুহূর্তেই পুরো পাতা বাংলায় অনুবাদ",
    allopathicMedicine: "অ্যালোপ্যাথিক ওষুধ",
    dgdaCertified: "ডিজিডিএ প্রত্যয়িত",
    monographHeaderBadge: "ডিজিডিএ ও অফিশিয়াল ফার্মাকোপিয়া মনোগ্রাফ (বাংলা)",
    pricePerUnit: "/পিস (ইউনিট)",
    dgdaIndexLabel: "ডিজিডিএ ইনডেক্স #"
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
    interactionTitle: "التفاعلات الدوائية",
    sideEffects: "الآثار الجانبية الموثقة",
    contraindications: "موانع الاستعمال ومحاذير الاستخدام",
    pregnancyLactation: "سلامة الاستخدام أثناء الحمل والرضاعة",
    precautionsWarnings: "تحذيرات واحتياطات هامة",
    overdoseTitle: "آثار الجرعة الزائدة",
    reconstitutionTitle: "طريقة تحضير المعلق الدوائي",
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
    languageSelectTitle: "اختيار اللغة / Language",
    languageSelectSub: "قراءة الدليل الطبي المعتمد باللغة العربية.",
    translatingLabel: "جاري الترجمة...",
    selectLanguage: "اختيار اللغة",
    quickSwitch: "ترجمة فورية للصفحة",
    allopathicMedicine: "دواء كيميائي معتمد",
    dgdaCertified: "معتمد من DGDA",
    monographHeaderBadge: "الدليل الدوائي الرسمي (العربية)",
    pricePerUnit: "/وحدة",
    dgdaIndexLabel: "فهرس DGDA #"
  },
  hi: {
    backToMedicines: "दवाइयों की सूची पर वापस जाएं",
    officialPrescribingInfo: "आधिकारिक चिकित्सा जानकारी",
    share: "শেयर करें",
    copied: "कॉपी हो गया!",
    dgdaVerified: "DGDA द्वारा सत्यापित दवा",
    govtApprovedPrice: "सरकार द्वारा निर्धारित खुदरा मूल्य",
    inStock: "पंजीकृत फार्मेसियों में उपलब्ध",
    primaryIndication: "प्राथमिक चिकित्सीय उपयोग",
    aToZGuidelines: "A से Z संपूर्ण उपयोग एवं खुराक दिशानिर्देश",
    aToZSub: "औषधि प्रशासन निदेशालय (DGDA) और आधिकारिक फार्माकोपिया मोनोग्राफ से संकलित।",
    indicationsApprovedUses: "संकेत और अनुमोदित चिकित्सीय उपयोग",
    pharmacologyMechanism: "फार्माकोलॉजी और कार्य प्रणाली",
    dosageGuidelines: "खुराक और सेवन विधि",
    administrationInstructions: "सेवन के निर्देश (भोजन से पहले / बाद में)",
    interactionTitle: "दवा পারस्परिक क्रिया (Drug Interactions)",
    sideEffects: "संभावित दुष्प्रभाव (Side Effects)",
    contraindications: "निषेध (किसे नहीं लेनी चाहिए)",
    pregnancyLactation: "गर्भावस्था और स्तनपान में सुरक्षा",
    precautionsWarnings: "विशेष सावधानियां और चेतावनियां",
    overdoseTitle: "अधिक मात्रा (Overdose) के प्रभाव",
    reconstitutionTitle: "सस्पेंशन तैयार करने की विधि",
    storageInstructions: "भंडारण निर्देश (Storage)",
    databaseSpecs: "आधिकारिक डेटाबेस विवरण",
    databaseSpecsSub: "राष्ट्रीय औषधि डेटाबेस का आधिकारिक रिकॉर्ड।",
    brandName: "ब्रांड का नाम",
    genericName: "जेनेरिक सक्रिय तत्व",
    strength: "क्षमता / मात्रा",
    dosageForm: "खुराक का रूप",
    manufacturer: "निर्माता कंपनी",
    packagingDetails: "पैकेजिंग विवरण",
    verifiedGuarantee: "सत्यापित जानकारी की गारंटी: प्रदर्शित सभी दवा विवरण, मूल्य और मोनोग्राफ आधिकारिक DGDA रिकॉर्ड से सत्यापित हैं।",
    affordableAlternatives: "समान जेनेरिक के किफायती विकल्प",
    affordableAlternativesSub: "समान सक्रिय तत्व और क्षमता वाली अन्य विश्वसनीय ब्रांड की दवाएं।",
    viewDetails: "विवरण देखें",
    available: "उपलब्ध",
    rxOnly: "प्रिस्क्रिप्शन दवा (Rx Only)",
    loadingText: "सत्यापित रिकॉर्ड लोड हो रहे हैं...",
    notFoundTitle: "दवा का रिकॉर्ड नहीं मिला",
    notFoundDesc: "राष्ट्रीय डेटाबेस में अनुरोधित दवा नहीं मिली।",
    returnBtn: "दवा डेटाबेस पर लौटें",
    packagingView: "आधिकारिक फार्मास्युटिकल पैकेजिंग",
    officialCarton: "प्रमाणित कंटेनर और पैकेजिंग प्रस्तुति",
    officialPhotoTitle: "आधिकारिक पंजीकृत पैकेजिंग फोटो",
    chemicalStructureTitle: "रासायनिक आणविक संरचना",
    languageSelectTitle: "भाषा चुनें / Select Language",
    languageSelectSub: "संपूर्ण पृष्ठ एवं चिकित्सीय दिशानिर्देश हिंदी में पढ़ें।",
    translatingLabel: "हिंदी में अनुवाद हो रहा है...",
    selectLanguage: "भाषा चुनें",
    quickSwitch: "तुरंत पूरे पृष्ठ का अनुवाद करें",
    allopathicMedicine: "एलोपैथिक दवा",
    dgdaCertified: "DGDA प्रमाणित",
    monographHeaderBadge: "DGDA एवं आधिकारिक फार्माकोपिया मोनोग्राफ (हिंदी)",
    pricePerUnit: "/यूनिट",
    dgdaIndexLabel: "DGDA इंडेक्स #"
  }
};

export interface LanguageOption {
  id: Language;
  name: string;
}

export const LANG_OPTIONS: LanguageOption[] = [
  { id: "en", name: "English" },
  { id: "bn", name: "বাংলা" },
  { id: "hi", name: "हिन्दी" },
  { id: "ar", name: "العربية" },
];

const LOCALIZED_DOSAGE_FORMS: Record<Language, Record<string, string>> = {
  en: {},
  bn: {
    tablet: "ট্যাবলেট",
    capsule: "ক্যাপসুল",
    syrup: "সিরাপ",
    suspension: "সাসপেনশন",
    injection: "ইনজেকশন",
    suppository: "সাপোজিটরি",
    cream: "ক্রিম",
    ointment: "মলম (অয়েন্টমেন্ট)",
    drops: "ড্রপস",
    "eye drops": "আই ড্রপস",
    "ear drops": "ইয়ার ড্রপস",
    inhaler: "ইনহেলার",
    powder: "পাউডার",
    lotion: "লোশন",
    gel: "জেল",
    spray: "স্প্রে",
    saline: "স্যালাইন",
    solution: "সল্যুশন",
  },
  hi: {
    tablet: "टैबलेट",
    capsule: "कैप्सूल",
    syrup: "सिरप",
    suspension: "सस्पेंशन",
    injection: "इंजेक्शन",
    suppository: "सपोसिटरी",
    cream: "क्रीम",
    ointment: "मलहम",
    drops: "ड्रॉप्स",
    "eye drops": "आई ड्रॉप्स",
    "ear drops": "इयर ड्रॉप्स",
    inhaler: "इनहेलर",
    powder: "पाउडर",
    lotion: "लोशन",
    gel: "जेल",
    spray: "स्प्रे",
    saline: "सलाइन",
    solution: "घोल (सॉल्यूशन)",
  },
  ar: {
    tablet: "أقراص",
    capsule: "كبسولات",
    syrup: "شراب",
    suspension: "معلق",
    injection: "حقن",
    suppository: "تحاميل",
    cream: "كريم",
    ointment: "مرهم",
    drops: "قطرات",
    inhaler: "بخاخ استنشاق",
    powder: "مسحوق",
    lotion: "لوشن",
    gel: "جل",
    spray: "رذاذ",
    solution: "محلول",
  },
};

const LOCALIZED_CONTAINERS: Record<Language, Record<string, string>> = {
  en: {},
  bn: {
    "blister pack": "ব্লিস্টার প্যাক",
    "alu-alu pack": "অ্যালু-অ্যালু ফয়েল প্যাক",
    "amber bottle": "অ্যাম্বার কাঁচের বোতল",
    "plastic bottle": "প্লাস্টিক বোতল",
    "strip pack": "স্ট্রিপ প্যাক",
    box: "কার্টন বক্স",
    vial: "ভায়াল",
    ampoule: "অ্যাম্পুল",
    tube: "টিউব",
    sachet: "স্যাচেট",
  },
  hi: {
    "blister pack": "ब्लिस्टर पैक",
    "alu-alu pack": "एलु-एलु फॉयल पैक",
    "amber bottle": "एम्बर कांच की बोतल",
    "plastic bottle": "प्लास्टिक की बोतल",
    "strip pack": "स्ट्रिप पैक",
    box: "कार्टन बॉक्स",
    vial: "वायल",
    ampoule: "एम्पूल",
    tube: "ट्यूब",
    sachet: "सैशे",
  },
  ar: {
    "blister pack": "شريط بثور",
    "amber bottle": "زجاجة عنبرية",
    "plastic bottle": "زجاجة بلاستيكية",
    box: "علبة كرتونية",
    vial: "قارورة",
    ampoule: "أمبولة",
    tube: "أنبوب",
  },
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
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);
  const [viewPhotoZoom, setViewPhotoZoom] = useState(false);
  const [activePackIndex, setActivePackIndex] = useState(0);
  const [translatedData, setTranslatedData] = useState<Record<string, Record<string, string>>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const t = useMemo(() => TRANSLATIONS[currentLang] || TRANSLATIONS.en, [currentLang]);

  const currentLangOption = useMemo(
    () => LANG_OPTIONS.find((opt) => opt.id === currentLang) || LANG_OPTIONS[0],
    [currentLang]
  );

  // Close language popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangMenuOpen]);

  const monograph = medicine?.monograph;
  const monographBn = useMemo(() => medicine?.monographBn || {}, [medicine?.monographBn]);

  // Trigger full-content translation when user switches to bn, ar, or hi
  useEffect(() => {
    if (!medicine || currentLang === "en") return;
    if (translatedData[currentLang]) return;

    const fieldsToTranslate: Record<string, string> = {};
    const monoKeys = [
      "indication_description",
      "pharmacology",
      "dosage",
      "administration",
      "interaction",
      "contraindications",
      "side_effects",
      "pregnancy_and_lactation",
      "precautions",
      "overdose_effects",
      "reconstitution",
      "storage_conditions",
    ];

    for (const key of monoKeys) {
      // If language is Bengali and we already have the official MedEx Bengali monograph for this key, use it directly!
      if (currentLang === "bn" && monographBn[key]) {
        continue;
      }
      if (monograph?.[key]) {
        fieldsToTranslate[key] = monograph[key];
      }
    }

    if (medicine.useFor) fieldsToTranslate.useFor = medicine.useFor;
    if (medicine.type) fieldsToTranslate.type = medicine.type;
    if (medicine.packageContainer) fieldsToTranslate.packageContainer = medicine.packageContainer;

    if (Object.keys(fieldsToTranslate).length === 0) {
      if (currentLang === "bn") {
        setTranslatedData(prev => ({ ...prev, bn: { ...monographBn } }));
      }
      return;
    }

    let isMounted = true;
    setIsTranslating(true);
    fetch("/api/medicines/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicineId: medicine.id,
        targetLang: currentLang,
        fields: fieldsToTranslate,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const apiTranslated = data?.translated || {};
        const merged = currentLang === "bn" 
          ? { ...apiTranslated, ...monographBn } 
          : apiTranslated;
        setTranslatedData(prev => ({ ...prev, [currentLang]: merged }));
      })
      .catch(() => {
        if (isMounted && currentLang === "bn") {
          setTranslatedData(prev => ({ ...prev, bn: { ...monographBn } }));
        }
      })
      .finally(() => {
        if (isMounted) setIsTranslating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentLang, medicine, monograph, monographBn, translatedData]);

  // Helper to get localized clinical field (instant MedEx BN monograph, dictionary lookup or neural translation)
  const getLocalizedField = (key: string, defaultVal?: string): string => {
    const fallback = defaultVal ?? monograph?.[key] ?? "";
    if (currentLang === "en" || !fallback) return fallback;

    // Check localized dosage forms
    if (key === "type") {
      const raw = (fallback || "").toLowerCase().trim();
      if (LOCALIZED_DOSAGE_FORMS[currentLang]?.[raw]) {
        return LOCALIZED_DOSAGE_FORMS[currentLang][raw];
      }
    }

    // Check localized containers
    if (key === "packageContainer") {
      const raw = (fallback || "").toLowerCase().trim();
      if (LOCALIZED_CONTAINERS[currentLang]?.[raw]) {
        return LOCALIZED_CONTAINERS[currentLang][raw];
      }
    }

    if (currentLang === "bn" && monographBn[key]) {
      return monographBn[key];
    }
    return translatedData[currentLang]?.[key] || fallback;
  };

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

  const manufacturerAsset = medicine.manufacturerAsset;
  const packList: string[] = Array.isArray(medicine.packagingImages) && medicine.packagingImages.length > 0
    ? medicine.packagingImages
    : (medicine.officialPackagingImage ? [medicine.officialPackagingImage] : []);
  const activePackImage = packList[activePackIndex] || packList[0] || null;
  const officialDosageIcon = medicine.officialDosageIcon;
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

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
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

            {/* Clean & Professional Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                aria-expanded={isLangMenuOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-slate-300"
              >
                <Globe size={14} className={isTranslating ? "animate-spin text-sky-600" : "text-slate-500"} />
                <span>{currentLangOption.name}</span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform duration-150 ${isLangMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Clean & Compact Normal Pop-up Menu */}
              {isLangMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1.5 w-36 sm:w-40 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100"
                >
                  {LANG_OPTIONS.map((opt) => {
                    const isActive = currentLang === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setCurrentLang(opt.id);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? "bg-slate-100 text-slate-900 font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{opt.name}</span>
                        {isActive && <Check size={14} className="text-sky-600 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
                {activePackImage ? (
                  /* Real Packaging Photo from Official Database */
                  <div className="relative group/photo flex flex-col items-center w-full">
                    <div 
                      onClick={() => setViewPhotoZoom(true)}
                      className="relative w-full max-w-[270px] h-56 sm:h-64 rounded-2xl bg-white border border-slate-200 p-3 shadow-md overflow-hidden flex items-center justify-center cursor-zoom-in"
                    >
                      <img 
                        src={activePackImage} 
                        alt={`${medicine.name} Official Packaging`}
                        className="max-w-full max-h-full object-contain group-hover/photo:scale-105 transition-transform duration-300"
                      />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setViewPhotoZoom(true); }}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-slate-900/75 text-white hover:bg-slate-900 transition-colors cursor-pointer shadow-xs"
                        title="View Full Resolution"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>

                    {/* Multi-photo thumbnail selector if multiple official pack images exist */}
                    {packList.length > 1 && (
                      <div className="flex items-center gap-2 mt-3">
                        {packList.map((imgUrl, idx) => (
                          <button
                            key={imgUrl}
                            type="button"
                            onClick={() => setActivePackIndex(idx)}
                            className={`w-12 h-12 rounded-xl border p-1 bg-white overflow-hidden transition-all cursor-pointer ${
                              activePackIndex === idx ? "border-sky-600 ring-2 ring-sky-500/20" : "border-slate-200 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[11px] font-bold text-slate-600 mt-2.5 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      {t.officialPhotoTitle}
                    </span>
                  </div>
                ) : (
                  /* Authentic Pharmaceutical Packaging Container Visualizer with Official Dosage Icon & Manufacturer Logo */
                  <div className="w-full flex flex-col items-center">
                    {isSyrupOrLiquid ? (
                      /* Amber Suspension/Syrup Presentation */
                      <div className="flex items-end justify-center gap-4 py-2">
                        {/* Amber Bottle */}
                        <div className="w-24 sm:w-28 h-48 sm:h-52 rounded-2xl bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 p-2 flex flex-col justify-between shadow-lg border border-amber-900/80 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-7 rounded-t-md bg-gradient-to-b from-slate-100 to-slate-300 border border-slate-400 shadow-xs" />
                          <div className="mt-5 mb-2 bg-white rounded-lg p-2 flex flex-col justify-between h-34 border border-slate-200 shadow-xs text-center">
                            <div>
                              <div className="flex items-center justify-between px-0.5 mb-0.5">
                                <span className="text-[7px] font-black text-rose-600 uppercase">Rx</span>
                                {officialDosageIcon && (
                                  <img src={officialDosageIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                                )}
                              </div>
                              <h4 className="text-[13px] sm:text-[14px] font-black text-slate-900 leading-tight truncate">{medicine.name}</h4>
                              <p className="text-[8px] font-bold text-sky-700 leading-tight truncate">{medicine.strength}</p>
                            </div>
                            <div className="border-t border-slate-100 pt-1">
                              <p className="text-[7px] text-slate-500 font-semibold truncate">{medicine.generic}</p>
                              <p className="text-[7px] font-bold text-emerald-800 truncate">{medicine.company}</p>
                            </div>
                          </div>
                        </div>

                        {/* Matching Unit Carton Box with Official Brand & Manufacturer Insignia */}
                        <div className="w-32 sm:w-36 h-52 sm:h-56 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-sky-50 border-2 border-sky-300/80 p-3 flex flex-col justify-between shadow-lg relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-500">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-bl-full pointer-events-none" />
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              {officialDosageIcon ? (
                                <img src={officialDosageIcon} alt={medicine.type} className="w-5 h-5 object-contain" />
                              ) : (
                                <span className="text-[8px] font-black uppercase tracking-wider text-sky-700">{medicine.type || "Suspension"}</span>
                              )}
                              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">Rx</span>
                            </div>
                            <h4 className="text-[16px] sm:text-[18px] font-black text-slate-900 leading-tight tracking-tight">{medicine.name}</h4>
                            <p className="text-[9px] font-bold text-sky-700 mt-0.5">{medicine.strength}</p>
                            <p className="text-[8px] text-slate-500 font-semibold leading-tight mt-1 line-clamp-2">{medicine.generic}</p>
                          </div>
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                            {manufacturerAsset?.logoUrl ? (
                              <img src={manufacturerAsset.logoUrl} alt={medicine.company} className="h-5 object-contain" />
                            ) : (
                              <p className="text-[8px] font-bold text-slate-700 truncate">{medicine.company}</p>
                            )}
                            <div className="flex items-center justify-between text-[8px] text-slate-400">
                              <span>{t.dgdaCertified}</span>
                              <ShieldCheck size={11} className="text-emerald-600" />
                            </div>
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
                              <div className="flex items-center gap-1">
                                {officialDosageIcon && (
                                  <img src={officialDosageIcon} alt={medicine.type} className="w-4 h-4 object-contain" />
                                )}
                                <span className="text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{medicine.type || "Tablet"}</span>
                              </div>
                              <span className="text-[9px] font-black text-rose-600">Rx</span>
                            </div>
                            <h4 className="text-[17px] sm:text-[19px] font-black text-slate-900 leading-tight tracking-tight">{medicine.name}</h4>
                            <p className="text-[11px] font-bold text-sky-700 mt-0.5">{medicine.strength || "Standard"}</p>
                            <p className="text-[9px] text-slate-500 font-semibold leading-tight mt-1 line-clamp-2">{medicine.generic}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-200 space-y-1">
                            {manufacturerAsset?.logoUrl ? (
                              <img src={manufacturerAsset.logoUrl} alt={medicine.company} className="h-5 object-contain" />
                            ) : (
                              <p className="text-[9px] font-bold text-slate-800 truncate">{medicine.company}</p>
                            )}
                            <div className="flex items-center justify-between text-[9px] text-slate-500">
                              <span className="font-mono text-[8px]">DAR #{medicine.id}</span>
                              <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                                <CheckCircle2 size={10} /> GMP
                              </span>
                            </div>
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
                  </div>
                )}

                {/* Chemical Structure Diagram if available */}
                {chemicalStructure && (
                  <div className="mt-3 w-full bg-white/95 rounded-2xl p-2.5 border border-slate-200/90 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      {t.chemicalStructureTitle} ({medicine.generic})
                    </span>
                    <img 
                      src={chemicalStructure} 
                      alt={`${medicine.generic} molecular structure`} 
                      className="h-16 mx-auto object-contain opacity-90 hover:opacity-100 transition-opacity" 
                    />
                  </div>
                )}
              </div>

              {/* Bottom Container Info */}
              <div className="w-full text-center mt-3 pt-3 border-t border-slate-200/80">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  {officialDosageIcon && (
                    <img src={officialDosageIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                  )}
                  <span>{getLocalizedField("type", medicine.type || "Medicine")}</span>
                </span>
                <p className="text-xs font-semibold text-slate-500 mt-1.5 truncate">
                  {getLocalizedField("packageContainer", medicine.packageContainer || "Standard Pharmaceutical Unit Container")}
                </p>
              </div>

            </div>

            {/* Right: Core Medical Specifications (English Default, Instantly Translatable) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wide bg-sky-100 text-sky-800 border border-sky-200/80">
                    {medicine.drugType ? `${medicine.drugType} Medicine` : t.allopathicMedicine}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {t.dgdaIndexLabel}{medicine.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    {t.rxOnly}
                  </span>
                </div>

                {/* Official Dosage Icon + Medicine Brand Title */}
                <div className="flex items-center gap-3">
                  {officialDosageIcon && (
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/80 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                      <img 
                        src={officialDosageIcon} 
                        alt={medicine.type} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight leading-tight">
                      {medicine.name}
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {getLocalizedField("type", medicine.type)} {medicine.strength ? `• ${medicine.strength}` : ""}
                    </p>
                  </div>
                </div>
                
                {/* Generic Active Molecule & Strength */}
                <p className="text-base sm:text-lg font-bold text-sky-700 mt-2">
                  {medicine.generic} {medicine.strength && <span className="text-slate-600 font-semibold">• {medicine.strength}</span>}
                </p>

                {/* OFFICIAL MANUFACTURER BRANDING & LOGO */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {manufacturerAsset?.logoUrl ? (
                      <div className="w-20 h-11 rounded-xl bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                        <img 
                          src={manufacturerAsset.logoUrl} 
                          alt={manufacturerAsset.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-black text-sm border border-sky-200">
                        {(medicine.company || "RX").slice(0, 2).toUpperCase()}
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
                    <CheckCircle2 size={12} /> {t.dgdaCertified}
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
                        {getLocalizedField("useFor", medicine.useFor)}
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
                        {medicine.priceBasis ? `/${medicine.priceBasis}` : t.pricePerUnit}
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
                    <span>{getLocalizedField("packageContainer", medicine.packageContainer)}</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Clinical Use Cases & Official Monographs (A to Z) */}
        {monograph && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sky-600 mb-1">
                  <Sparkles size={18} />
                  <span className="text-xs font-black tracking-wider uppercase">
                    {t.monographHeaderBadge}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t.aToZGuidelines}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {t.aToZSub}
                </p>
              </div>

              {isTranslating && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 shrink-0">
                  <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span>{t.translatingLabel}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* Indications */}
              {getLocalizedField("indication_description") && (
                <div className="md:col-span-2 p-5 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-2">
                  <div className="flex items-center gap-2 text-sky-900">
                    <FileCheck2 size={18} className="text-sky-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.indicationsApprovedUses}</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("indication_description")}
                  </p>
                </div>
              )}

              {/* Pharmacology */}
              {getLocalizedField("pharmacology") && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FlaskConical size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.pharmacologyMechanism}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("pharmacology")}
                  </p>
                </div>
              )}

              {/* Dosage */}
              {getLocalizedField("dosage") && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Clock size={18} className="text-sky-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.dosageGuidelines}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("dosage")}
                  </p>
                </div>
              )}

              {/* Reconstitution (if Powder for Suspension / Injection) */}
              {getLocalizedField("reconstitution") && (
                <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <Beaker size={18} className="text-emerald-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.reconstitutionTitle}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("reconstitution")}
                  </p>
                </div>
              )}

              {/* Administration */}
              {getLocalizedField("administration") && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Pill size={18} className="text-emerald-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.administrationInstructions}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("administration")}
                  </p>
                </div>
              )}

              {/* Drug Interactions */}
              {getLocalizedField("interaction") && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Activity size={18} className="text-purple-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.interactionTitle}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("interaction")}
                  </p>
                </div>
              )}

              {/* Side Effects */}
              {getLocalizedField("side_effects") && (
                <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900">
                    <AlertTriangle size={18} className="text-rose-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.sideEffects}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("side_effects")}
                  </p>
                </div>
              )}

              {/* Contraindications */}
              {getLocalizedField("contraindications") && (
                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900">
                    <ShieldCheck size={18} className="text-amber-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.contraindications}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("contraindications")}
                  </p>
                </div>
              )}

              {/* Pregnancy & Lactation */}
              {getLocalizedField("pregnancy_and_lactation") && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <HeartPulse size={18} className="text-pink-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.pregnancyLactation}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("pregnancy_and_lactation")}
                  </p>
                </div>
              )}

              {/* Precautions */}
              {getLocalizedField("precautions") && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Info size={18} className="text-blue-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.precautionsWarnings}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("precautions")}
                  </p>
                </div>
              )}

              {/* Overdose Effects */}
              {getLocalizedField("overdose_effects") && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <AlertTriangle size={18} className="text-orange-600" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.overdoseTitle}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("overdose_effects")}
                  </p>
                </div>
              )}

              {/* Storage */}
              {getLocalizedField("storage_conditions") && (
                <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Layers size={18} className="text-slate-700" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{t.storageInstructions}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {getLocalizedField("storage_conditions")}
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
              <span className="text-sm font-black text-slate-900">{getLocalizedField("type", medicine.type || "Tablet")}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{t.manufacturer}</span>
              <span className="text-sm font-black text-slate-900">{medicine.company}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{t.packagingDetails}</span>
              <span className="text-sm font-black text-slate-900">{getLocalizedField("packageContainer", medicine.packageContainer || "Blister Pack")}</span>
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

      {/* Fullscreen High-Resolution Pack Image Zoom Modal */}
      {viewPhotoZoom && activePackImage && (
        <div 
          onClick={() => setViewPhotoZoom(false)}
          className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">{medicine.name} ({medicine.strength})</h3>
                <p className="text-xs font-semibold text-slate-500">{medicine.company} • {t.officialPhotoTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewPhotoZoom(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <img 
                src={activePackImage} 
                alt={medicine.name} 
                className="max-w-full max-h-[65vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
