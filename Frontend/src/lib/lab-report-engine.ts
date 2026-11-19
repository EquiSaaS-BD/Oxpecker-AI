import {
  checkRedFlagOverride,
  MANDATORY_BENGALI_DISCLAIMER,
  validateAndSanitizeAiOutput,
  type RedFlagResult,
} from "@/lib/ai-safety-guard";

export type LabFlagLabelBn = "স্বাভাবিক" | "কম" | "বেশি";
export type LabFlagColor = "green" | "amber" | "red";
export type ReportUrgencyBn = "স্বাভাবিক" | "ডাক্তার দেখান" | "দ্রুত ডাক্তার দেখান";
export type PatientGender = "male" | "female" | "other";

export interface RawExtractedParameter {
  name: string;
  value: number | string;
  unit?: string | null;
  printedReferenceRange?: string | null;
  confidence?: "high" | "medium" | "low";
}

export interface RangeBound {
  min: number;
  max: number;
  unit: string;
  label: string;
}

export interface LabCatalogEntry {
  code: string;
  displayName: string;
  displayNameBn: string;
  aliases: string[];
  defaultUnit: string;
  specialtyQuery: string;
  specialistBn: string;
  whatItIsBn: string;
  lowMeaningBn: string;
  highMeaningBn: string;
  ranges: {
    male: RangeBound;
    female: RangeBound;
    pediatric?: RangeBound; // age < 15
    mmolVariant?: RangeBound;
  };
}

export interface EvaluatedParameter {
  code: string;
  displayName: string;
  displayNameBn: string;
  rawName: string;
  value: number;
  unit: string;
  printedReferenceRange: string | null;
  activeRangeLabel: string;
  rangeMin: number;
  rangeMax: number;
  rangeSource: "lab_printed" | "builtin_standard";
  flag: LabFlagLabelBn;
  badgeColor: LabFlagColor;
  whyThisFlagBn: string;
  whatItIsBn: string;
  possibleMeaningBn: string;
  specialistBn: string;
  specialtyQuery: string;
  clinicalNoteBn?: string;
}

export interface DoctorEditHistoryEntry {
  doctorName: string;
  bmdcRegNo?: string | null;
  editedAt: string;
  noteBn: string;
  correctedSummaryBn?: string;
}

export interface AnalyzedReportRecord {
  id: string;
  patientId?: string;
  healthCardNumber?: string;
  organizationId: string;
  mode: "lab" | "radiology" | "skin";
  title: string;
  laboratory: string;
  reportDate: string;
  patientAge: number | null;
  patientGender: PatientGender;
  urgency: ReportUrgencyBn;
  redFlag: RedFlagResult;
  parameters: EvaluatedParameter[];
  egfrNoteBn: string | null;
  recommendedSpecialties: Array<{
    specialtyQuery: string;
    labelBn: string;
    reasonBn: string;
  }>;
  primarySpecialty: string;
  onePageSummaryBn: string;
  originalAiSummaryBn: string;
  whySummaryBn: string[];
  safetyViolationsLogged: string[];
  disclaimerFooterBn: string;
  doctorVerified: boolean;
  verifiedByDoctorName?: string | null;
  verifiedByBmdc?: string | null;
  verifiedAt?: string | null;
  doctorNoteBn?: string | null;
  editHistory: DoctorEditHistoryEntry[];
  consentRecorded: boolean;
  createdAt: string;
}

// ============================================================================
// 1. DETERMINISTIC REFERENCE RANGE CATALOG (JSON CONFIG)
// ============================================================================
export const REFERENCE_RANGE_CATALOG: Record<string, LabCatalogEntry> = {
  hb: {
    code: "hb",
    displayName: "Hemoglobin (Hb)",
    displayNameBn: "হিমোগ্লোবিন (Hb)",
    aliases: ["hemoglobin", "haemoglobin", "hb", "hgb", "hb%", "hb level"],
    defaultUnit: "g/dL",
    specialtyQuery: "Medicine",
    specialistBn: "মেডিসিন / হেমাটোলজি বিশেষজ্ঞ",
    whatItIsBn: "হিমোগ্লোবিন হলো লোহিত রক্তকণিকার প্রোটিন যা শরীরে অক্সিজেন পরিবহন করে।",
    lowMeaningBn: "হিমোগ্লোবিন কম থাকলে সম্ভাব্য রক্তশূন্যতা (Anemia), আয়রন বা ভিটামিন ঘাটতি হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "হিমোগ্লোবিন বেশি হলে সম্ভাব্য পানিশূন্যতা বা লোহিত রক্তকণিকা বৃদ্ধির লক্ষণ হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 13.5, max: 17.5, unit: "g/dL", label: "13.5 - 17.5 g/dL (Adult Male)" },
      female: { min: 12.0, max: 15.5, unit: "g/dL", label: "12.0 - 15.5 g/dL (Adult Female)" },
      pediatric: { min: 11.5, max: 14.5, unit: "g/dL", label: "11.5 - 14.5 g/dL (Pediatric)" },
    },
  },
  wbc: {
    code: "wbc",
    displayName: "Total WBC Count",
    displayNameBn: "শ্বেত রক্তকণিকা (WBC)",
    aliases: ["wbc", "total wbc", "white blood cell", "tlc", "tc of wbc", "tc"],
    defaultUnit: "/µL",
    specialtyQuery: "Medicine",
    specialistBn: "মেডিসিন বিশেষজ্ঞ",
    whatItIsBn: "শ্বেত রক্তকণিকা (WBC) শরীরের রোগ প্রতিরোধ ব্যবস্থার মূল কোষ।",
    lowMeaningBn: "WBC কম থাকলে সম্ভাব্য ভাইরাস সংক্রমণ বা রোগ প্রতিরোধ ক্ষমতা কমে যাওয়ার ইঙ্গিত হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "WBC বেশি হলে সম্ভাব্য ব্যাকটেরিয়াল ইনফেকশন বা প্রদাহজনিত প্রতিক্রিয়া থাকতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 4000, max: 11000, unit: "/µL", label: "4,000 - 11,000 /µL" },
      female: { min: 4000, max: 11000, unit: "/µL", label: "4,000 - 11,000 /µL" },
      pediatric: { min: 5000, max: 13500, unit: "/µL", label: "5,000 - 13,500 /µL (Pediatric)" },
    },
  },
  platelets: {
    code: "platelets",
    displayName: "Platelet Count",
    displayNameBn: "প্লাটিলেট (Platelets)",
    aliases: ["platelet", "platelets", "plt", "platelet count"],
    defaultUnit: "/µL",
    specialtyQuery: "Medicine",
    specialistBn: "মেডিসিন বিশেষজ্ঞ",
    whatItIsBn: "প্লাটিলেট রক্ত জমাট বাঁধতে ও রক্তক্ষরণ বন্ধ করতে সাহায্য করে।",
    lowMeaningBn: "প্লাটিলেট কম হলে সম্ভাব্য ডেঙ্গু বা ভাইরাসজনিত জ্বর কিংবা রক্তকণিকার পরিবর্তন হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "প্লাটিলেট বেশি হলে সম্ভাব্য প্রদাহ বা অস্থিমজ্জার প্রতিক্রিয়া হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 150000, max: 450000, unit: "/µL", label: "150,000 - 450,000 /µL" },
      female: { min: 150000, max: 450000, unit: "/µL", label: "150,000 - 450,000 /µL" },
    },
  },
  esr: {
    code: "esr",
    displayName: "ESR (Westergren)",
    displayNameBn: "ইএসআর (ESR)",
    aliases: ["esr", "erythrocyte sedimentation rate"],
    defaultUnit: "mm/hr",
    specialtyQuery: "Medicine",
    specialistBn: "মেডিসিন বিশেষজ্ঞ",
    whatItIsBn: "ESR শরীরে কোনো প্রদাহ বা ইনফেকশনের সাধারণ সূচক হিসেবে দেখা হয়।",
    lowMeaningBn: "ESR কম থাকা সাধারণত গুরুতর নয়, তবে রক্তের ঘনত্বের সাথে সম্পর্কিত হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "ESR বেশি হলে সম্ভাব্য দীর্ঘমেয়াদি প্রদাহ বা সংক্রমণের ইঙ্গিত থাকতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 0, max: 15, unit: "mm/hr", label: "0 - 15 mm/hr (Adult Male)" },
      female: { min: 0, max: 20, unit: "mm/hr", label: "0 - 20 mm/hr (Adult Female)" },
    },
  },
  hba1c: {
    code: "hba1c",
    displayName: "HbA1c",
    displayNameBn: "এইচবিএ১সি (HbA1c)",
    aliases: ["hba1c", "a1c", "glycated hemoglobin", "glycosylated hemoglobin"],
    defaultUnit: "%",
    specialtyQuery: "Endocrinology",
    specialistBn: "হরমোন ও ডায়াবেটিস (Endocrinology) বিশেষজ্ঞ",
    whatItIsBn: "HbA1c গত ২–৩ মাসের গড় রক্তের শর্করার মাত্রা নির্দেশ করে।",
    lowMeaningBn: "HbA1c তুলনামূলক কম হলে ওষুধের মাত্রা বা লো-সুগারের ঝুঁকি সম্পর্কে ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "HbA1c বেশি হলে (৫.৭–৬.৪% সম্ভাব্য প্রি-ডায়াবেটিস রেঞ্জ, ≥৬.৫% সম্ভাব্য অনিয়ন্ত্রিত গ্লাইসেমিক মাত্রা) বিশেষজ্ঞ ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 4.0, max: 5.6, unit: "%", label: "4.0 - 5.6 %" },
      female: { min: 4.0, max: 5.6, unit: "%", label: "4.0 - 5.6 %" },
    },
  },
  fbs: {
    code: "fbs",
    displayName: "Fasting Blood Glucose (FBS)",
    displayNameBn: "খালি পেটে রক্তের সুগার (FBS)",
    aliases: ["fbs", "fasting blood sugar", "fasting glucose", "fasting plasma glucose", "fpg", "blood sugar fasting"],
    defaultUnit: "mg/dL",
    specialtyQuery: "Endocrinology",
    specialistBn: "ডায়াবেটিস ও এন্ডোক্রাইন বিশেষজ্ঞ",
    whatItIsBn: "৮–১২ ঘণ্টা না খেয়ে থাকার পর রক্তে শর্করার পরিমাণ পরিমাপ।",
    lowMeaningBn: "সুগার কম থাকলে সম্ভাব্য হাইপোগ্লাইসেমিয়ার ঝুঁকি থাকতে পারে। লক্ষণ থাকলে দ্রুত ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "খালি পেটে সুগার বেশি থাকলে সম্ভাব্য ইনসুলিন রেজিস্ট্যান্স বা গ্লাইসেমিক ভারসাম্যহীনতা থাকতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 70, max: 99, unit: "mg/dL", label: "70 - 99 mg/dL" },
      female: { min: 70, max: 99, unit: "mg/dL", label: "70 - 99 mg/dL" },
      mmolVariant: { min: 3.9, max: 5.5, unit: "mmol/L", label: "3.9 - 5.5 mmol/L" },
    },
  },
  rbs: {
    code: "rbs",
    displayName: "Random / Post-Meal Glucose (RBS)",
    displayNameBn: "যেকোনো সময় / খাবারের পর সুগার (RBS)",
    aliases: ["rbs", "random blood sugar", "random glucose", "ppbs", "2habf", "blood glucose"],
    defaultUnit: "mg/dL",
    specialtyQuery: "Endocrinology",
    specialistBn: "ডায়াবেটিস ও এন্ডোক্রাইন বিশেষজ্ঞ",
    whatItIsBn: "দিনের যেকোনো সময় বা খাবারের পর রক্তে গ্লুকোজের মাত্রা।",
    lowMeaningBn: "সুগার কম হলে দুর্বলতা বা মাথা ঘোরার ঝুঁকি থাকতে পারে; ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "রক্তের সুগার স্বাভাবিকের চেয়ে বেশি হলে সম্ভাব্য গ্লাইসেমিক নিয়ন্ত্রণ পরীক্ষার প্রয়োজন হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 70, max: 140, unit: "mg/dL", label: "70 - 140 mg/dL" },
      female: { min: 70, max: 140, unit: "mg/dL", label: "70 - 140 mg/dL" },
      mmolVariant: { min: 3.9, max: 7.8, unit: "mmol/L", label: "3.9 - 7.8 mmol/L" },
    },
  },
  total_cholesterol: {
    code: "total_cholesterol",
    displayName: "Total Cholesterol",
    displayNameBn: "মোট কোলেস্টেরল",
    aliases: ["total cholesterol", "cholesterol total", "serum cholesterol", "cholesterol"],
    defaultUnit: "mg/dL",
    specialtyQuery: "Cardiology",
    specialistBn: "হৃদরোগ (Cardiology) বিশেষজ্ঞ",
    whatItIsBn: "রক্তে উপস্থিত মোট চর্বির (কোলেস্টেরল) পরিমাণ।",
    lowMeaningBn: "কোলেস্টেরল খুব কম হলে সম্ভাব্য পুষ্টি বা লিভারের অবস্থার সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "মোট কোলেস্টেরল বেশি হলে সম্ভাব্য হৃদরোগ ও রক্তনালীর ঝুঁকি বাড়তে পারে। কার্ডিওলজি ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 125, max: 200, unit: "mg/dL", label: "125 - 200 mg/dL" },
      female: { min: 125, max: 200, unit: "mg/dL", label: "125 - 200 mg/dL" },
      mmolVariant: { min: 3.2, max: 5.2, unit: "mmol/L", label: "3.2 - 5.2 mmol/L" },
    },
  },
  triglycerides: {
    code: "triglycerides",
    displayName: "Triglycerides (TG)",
    displayNameBn: "ট্রাইগ্লিসারাইড (TG)",
    aliases: ["triglyceride", "triglycerides", "tg", "serum tg"],
    defaultUnit: "mg/dL",
    specialtyQuery: "Cardiology",
    specialistBn: "হৃদরোগ (Cardiology) বিশেষজ্ঞ",
    whatItIsBn: "রক্তে ভাসমান এক ধরনের চর্বি যা খাবারের ক্যালরি ও শর্করার সাথে যুক্ত।",
    lowMeaningBn: "ট্রাইগ্লিসারাইড কম থাকা সাধারণত উদ্বেগের বিষয় নয়; পুষ্টি পরিস্থিতির সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "ট্রাইগ্লিসারাইড বেশি থাকলে সম্ভাব্য হৃদরোগ ও ফ্যাটি লিভারের ঝুঁকি বাড়তে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 40, max: 150, unit: "mg/dL", label: "40 - 150 mg/dL" },
      female: { min: 40, max: 150, unit: "mg/dL", label: "40 - 150 mg/dL" },
    },
  },
  hdl: {
    code: "hdl",
    displayName: "HDL Cholesterol",
    displayNameBn: "এইচডিএল কোলেস্টেরল (ভালো চর্বি)",
    aliases: ["hdl", "hdl cholesterol", "hdl-c"],
    defaultUnit: "mg/dL",
    specialtyQuery: "Cardiology",
    specialistBn: "হৃদরোগ (Cardiology) বিশেষজ্ঞ",
    whatItIsBn: "HDL হলো উপকারী কোলেস্টেরল যা রক্তনালী পরিষ্কার রাখতে সাহায্য করে।",
    lowMeaningBn: "HDL কম হলে সম্ভাব্য হৃদরোগ ঝুঁকি কিছুটা বাড়তে পারে; জীবনযাত্রা ও খাদ্যাভ্যাস ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "HDL সাধারণত হৃদযন্ত্রের জন্য সুরক্ষামূলক, তবে অতিরিক্ত মাত্রা ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 40, max: 80, unit: "mg/dL", label: "40 - 80 mg/dL (Male)" },
      female: { min: 50, max: 80, unit: "mg/dL", label: "50 - 80 mg/dL (Female)" },
    },
  },
  ldl: {
    code: "ldl",
    displayName: "LDL Cholesterol",
    displayNameBn: "এলডিএল কোলেস্টেরল (ক্ষতিকর চর্বি)",
    aliases: ["ldl", "ldl cholesterol", "ldl-c"],
    defaultUnit: "mg/dL",
    specialtyQuery: "Cardiology",
    specialistBn: "হৃদরোগ (Cardiology) বিশেষজ্ঞ",
    whatItIsBn: "LDL অতিরিক্ত হলে রক্তনালীর দেয়ালে চর্বি জমতে পারে।",
    lowMeaningBn: "LDL কম থাকা সাধারণত নিরাপদ; ওষুধ চললে ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "LDL বেশি থাকলে সম্ভাব্য ধমনিতে চর্বি জমার ঝুঁকি তৈরি হতে পারে। কার্ডিওলজিস্টের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 50, max: 100, unit: "mg/dL", label: "50 - 100 mg/dL" },
      female: { min: 50, max: 100, unit: "mg/dL", label: "50 - 100 mg/dL" },
    },
  },
  creatinine: {
    code: "creatinine",
    displayName: "Serum Creatinine",
    displayNameBn: "সিরাম ক্রিয়েটিনিন",
    aliases: ["creatinine", "s. creatinine", "serum creatinine", "creat"],
    defaultUnit: "mg/dL",
    specialtyQuery: "Nephrology",
    specialistBn: "কিডনি (Nephrology) বিশেষজ্ঞ",
    whatItIsBn: "ক্রিয়েটিনিন কিডনির ছাঁকনি ক্ষমতা (Renal function) মূল্যায়নের প্রধান পরীক্ষা।",
    lowMeaningBn: "ক্রিয়েটিনিন সামান্য কম থাকলে সম্ভাব্য কম পেশি ভর বা পানির মাত্রার সাথে যুক্ত হতে পারে। মিলিয়ে দেখুন।",
    highMeaningBn: "ক্রিয়েটিনিন বেশি হলে সম্ভাব্য কিডনির ছাঁকনি ক্ষমতা কমে যাওয়া বা পানিশূন্যতা হতে পারে। নেফ্রোলজিস্টের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 0.7, max: 1.3, unit: "mg/dL", label: "0.7 - 1.3 mg/dL (Adult Male)" },
      female: { min: 0.6, max: 1.1, unit: "mg/dL", label: "0.6 - 1.1 mg/dL (Adult Female)" },
    },
  },
  sgpt: {
    code: "sgpt",
    displayName: "SGPT (ALT)",
    displayNameBn: "এসজিপিটি (SGPT / ALT)",
    aliases: ["sgpt", "alt", "alanine aminotransferase", "s.g.p.t"],
    defaultUnit: "U/L",
    specialtyQuery: "Hepatology",
    specialistBn: "লিভার ও পরিপাকতন্ত্র (Hepatology) বিশেষজ্ঞ",
    whatItIsBn: "SGPT (ALT) মূলত লিভার বা যকৃতের কোষের স্বাস্থ্য নির্দেশ করে।",
    lowMeaningBn: "SGPT কম থাকা সাধারণত স্বাভাবিক হিসেবেই গণ্য হয়।",
    highMeaningBn: "SGPT বেশি থাকলে সম্ভাব্য ফ্যাটি লিভার, ওষুধের প্রতিক্রিয়া বা লিভার প্রদাহ হতে পারে। হেপাটোলজিস্টের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 7, max: 45, unit: "U/L", label: "7 - 45 U/L" },
      female: { min: 7, max: 35, unit: "U/L", label: "7 - 35 U/L" },
    },
  },
  sgot: {
    code: "sgot",
    displayName: "SGOT (AST)",
    displayNameBn: "এসজিওটি (SGOT / AST)",
    aliases: ["sgot", "ast", "aspartate aminotransferase", "s.g.o.t"],
    defaultUnit: "U/L",
    specialtyQuery: "Hepatology",
    specialistBn: "লিভার ও পরিপাকতন্ত্র (Hepatology) বিশেষজ্ঞ",
    whatItIsBn: "SGOT (AST) লিভার ও পেশিতে থাকা একটি এনজাইম।",
    lowMeaningBn: "SGOT কম থাকা সাধারণত স্বাভাবিক।",
    highMeaningBn: "SGOT বেশি থাকলে সম্ভাব্য লিভার বা পেশির চাপ/প্রদাহ হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 8, max: 40, unit: "U/L", label: "8 - 40 U/L" },
      female: { min: 8, max: 35, unit: "U/L", label: "8 - 35 U/L" },
    },
  },
  bilirubin: {
    code: "bilirubin",
    displayName: "Serum Bilirubin (Total)",
    displayNameBn: "বিলিরুবিন (Total Bilirubin)",
    aliases: ["bilirubin", "total bilirubin", "serum bilirubin", "s. bilirubin"],
    defaultUnit: "mg/dL",
    specialtyQuery: "Hepatology",
    specialistBn: "লিভার ও পরিপাকতন্ত্র (Hepatology) বিশেষজ্ঞ",
    whatItIsBn: "বিলিরুবিন পিত্তরস ও লিভারের কার্যকারিতা যাচাই করতে দেখা হয়।",
    lowMeaningBn: "বিলিরুবিন কম থাকা সাধারণত কোনো সমস্যা নির্দেশ করে না।",
    highMeaningBn: "বিলিরুবিন বেশি হলে সম্ভাব্য জন্ডিস বা লিভার/পিত্তনালীর সমস্যা থাকতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 0.2, max: 1.2, unit: "mg/dL", label: "0.2 - 1.2 mg/dL" },
      female: { min: 0.2, max: 1.2, unit: "mg/dL", label: "0.2 - 1.2 mg/dL" },
    },
  },
  tsh: {
    code: "tsh",
    displayName: "TSH (Thyroid Stimulating Hormone)",
    displayNameBn: "টিএসএইচ (TSH — থাইরয়েড)",
    aliases: ["tsh", "thyroid stimulating hormone", "serum tsh", "s. tsh"],
    defaultUnit: "mIU/L",
    specialtyQuery: "Endocrinology",
    specialistBn: "হরমোন ও থাইরয়েড (Endocrinology) বিশেষজ্ঞ",
    whatItIsBn: "TSH থাইরয়েড গ্রন্থির হরমোন ভারসাম্য নিয়ন্ত্রণ করে।",
    lowMeaningBn: "TSH কম হলে সম্ভাব্য থাইরয়েড অতিরিক্ত সক্রিয় (Hyperthyroid প্রবণতা) হতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "TSH বেশি হলে সম্ভাব্য থাইরয়েড কম সক্রিয় (Hypothyroid প্রবণতা) হতে পারে। এন্ডোক্রাইনোলজিস্টের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 0.4, max: 4.5, unit: "mIU/L", label: "0.4 - 4.5 mIU/L" },
      female: { min: 0.4, max: 4.5, unit: "mIU/L", label: "0.4 - 4.5 mIU/L" },
    },
  },
  vitamin_d: {
    code: "vitamin_d",
    displayName: "Vitamin D (25-OH)",
    displayNameBn: "ভিটামিন ডি (25-OH Vitamin D)",
    aliases: ["vitamin d", "vit d", "25-oh vitamin d", "25(oh)d", "vitamin d3"],
    defaultUnit: "ng/mL",
    specialtyQuery: "Medicine",
    specialistBn: "মেডিসিন / এন্ডোক্রাইন বিশেষজ্ঞ",
    whatItIsBn: "ভিটামিন ডি হাড়ের শক্তি, ক্যালসিয়াম শোষণ ও রোগ প্রতিরোধ ক্ষমতার জন্য জরুরি।",
    lowMeaningBn: "ভিটামিন ডি কম থাকলে সম্ভাব্য হাড় দুর্বলতা, ক্লান্তি বা ঘাটতি থাকতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    highMeaningBn: "ভিটামিন ডি খুব বেশি হলে সাপ্লিমেন্টের মাত্রা ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 30, max: 100, unit: "ng/mL", label: "30 - 100 ng/mL" },
      female: { min: 30, max: 100, unit: "ng/mL", label: "30 - 100 ng/mL" },
    },
  },
  urine_pus_cells: {
    code: "urine_pus_cells",
    displayName: "Urine R/E — Pus Cells",
    displayNameBn: "প্রস্রাব পরীক্ষা — পুঁজ কোষ (Pus Cells)",
    aliases: ["pus cells", "urine pus cells", "pus cell", "urine wbc"],
    defaultUnit: "/HPF",
    specialtyQuery: "Urology",
    specialistBn: "ইউরোলজি / মেডিসিন বিশেষজ্ঞ",
    whatItIsBn: "প্রস্রাবের নমুনায় সংক্রমণ বা প্রদাহ বোঝার জন্য পুঁজ কোষ দেখা হয়।",
    lowMeaningBn: "মান সীমার মধ্যে আছে।",
    highMeaningBn: "প্রস্রাবে পুঁজ কোষ বেশি থাকলে সম্ভাব্য মূত্রনালীর সংক্রমণ (UTI) থাকতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 0, max: 5, unit: "/HPF", label: "0 - 5 /HPF" },
      female: { min: 0, max: 5, unit: "/HPF", label: "0 - 5 /HPF" },
    },
  },
  urine_albumin: {
    code: "urine_albumin",
    displayName: "Urine R/E — Albumin/Protein",
    displayNameBn: "প্রস্রাব পরীক্ষা — অ্যালবুমিন (Protein)",
    aliases: ["urine albumin", "albumin", "urine protein"],
    defaultUnit: "grade",
    specialtyQuery: "Nephrology",
    specialistBn: "কিডনি (Nephrology) / ইউরোলজি বিশেষজ্ঞ",
    whatItIsBn: "স্বাভাবিক অবস্থায় প্রস্রাবে অ্যালবুমিন (প্রোটিন) অনুপস্থিত (Nil) থাকে।",
    lowMeaningBn: "স্বাভাবিক (Nil)।",
    highMeaningBn: "প্রস্রাবে অ্যালবুমিন পাওয়া গেলে সম্ভাব্য কিডনির ছাঁকনি বা সংক্রমণজনিত পরিবর্তন থাকতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 0, max: 0, unit: "grade", label: "0 (Nil / Absent)" },
      female: { min: 0, max: 0, unit: "grade", label: "0 (Nil / Absent)" },
    },
  },
  urine_sugar: {
    code: "urine_sugar",
    displayName: "Urine R/E — Sugar/Glucose",
    displayNameBn: "প্রস্রাব পরীক্ষা — সুগার (Urine Sugar)",
    aliases: ["urine sugar", "urine glucose", "glycosuria"],
    defaultUnit: "grade",
    specialtyQuery: "Endocrinology",
    specialistBn: "ডায়াবেটিস ও এন্ডোক্রাইন বিশেষজ্ঞ",
    whatItIsBn: "স্বাভাবিক প্রস্রাবে সুগার অনুপস্থিত (Nil) থাকার কথা।",
    lowMeaningBn: "স্বাভাবিক (Nil)।",
    highMeaningBn: "প্রস্রাবে সুগার উপস্থিত থাকলে সম্ভাব্য রক্তে সুগারের মাত্রা বেড়ে যাওয়ার সাথে সম্পর্ক থাকতে পারে। ডাক্তারের সাথে মিলিয়ে দেখুন।",
    ranges: {
      male: { min: 0, max: 0, unit: "grade", label: "0 (Nil / Absent)" },
      female: { min: 0, max: 0, unit: "grade", label: "0 (Nil / Absent)" },
    },
  },
};

// ============================================================================
// 2. DIGIT, OCR & UNIT NORMALIZERS
// ============================================================================
const BN_DIGITS: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

export function normalizeBengaliDigits(input: string): string {
  return String(input || "").replace(/[০-৯]/g, (ch) => BN_DIGITS[ch] ?? ch);
}

export function normalizeUnitString(unit?: string | null): string {
  const u = normalizeBengaliDigits(String(unit || "")).trim();
  if (!u) return "";
  const lower = u.toLowerCase().replace(/\s+/g, "");
  if (lower === "gm/dl" || lower === "g/dl" || lower === "gm%") return "g/dL";
  if (lower === "mg/dl" || lower === "mg%") return "mg/dL";
  if (lower === "mmol/l" || lower === "mmol") return "mmol/L";
  if (lower === "u/l" || lower === "iu/l") return "U/L";
  if (lower === "uiu/ml" || lower === "µiu/ml" || lower === "miu/l" || lower === "uiU/ml") return "mIU/L";
  if (lower === "ng/ml") return "ng/mL";
  if (lower === "/hpf" || lower === "hpf") return "/HPF";
  if (lower === "mm/hr" || lower === "mm/1sthr" || lower === "mm/h") return "mm/hr";
  if (lower === "/cumm" || lower === "/cmm" || lower === "cmm" || lower === "/ul" || lower === "cells/ul") return "/µL";
  return u;
}

export function parseNumericValue(raw: number | string): { num: number | null; multiplierApplied: number } {
  if (typeof raw === "number") {
    return { num: Number.isFinite(raw) ? raw : null, multiplierApplied: 1 };
  }
  const normalized = normalizeBengaliDigits(String(raw || "")).trim();
  if (!normalized) return { num: null, multiplierApplied: 1 };

  const lower = normalized.toLowerCase();
  if (/^(nil|absent|negative|neg|trace)$/i.test(lower)) {
    return { num: lower === "trace" ? 0.5 : 0, multiplierApplied: 1 };
  }
  if (/^\+{1,4}$/.test(lower)) {
    return { num: lower.length, multiplierApplied: 1 };
  }
  const plusPrefix = lower.match(/^([1-4])\s*\+$/);
  if (plusPrefix) {
    return { num: parseInt(plusPrefix[1], 10), multiplierApplied: 1 };
  }

  // Handle "2.1 lac" / "1,50,000"
  const lacMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lac|lakh)/i);
  if (lacMatch) {
    return { num: parseFloat(lacMatch[1]) * 100000, multiplierApplied: 100000 };
  }

  const stripped = normalized.replace(/,/g, "");
  const match = stripped.match(/-?\d+(?:\.\d+)?/);
  if (!match) return { num: null, multiplierApplied: 1 };
  const val = parseFloat(match[0]);
  return { num: Number.isFinite(val) ? val : null, multiplierApplied: 1 };
}

export function parsePrintedRange(raw?: string | null): { min: number; max: number; label: string } | null {
  if (!raw) return null;
  const cleaned = normalizeBengaliDigits(String(raw)).replace(/,/g, "").trim();
  if (!cleaned) return null;

  if (/^(nil|negative|absent)$/i.test(cleaned)) {
    return { min: 0, max: 0, label: cleaned };
  }

  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max) && max >= min) {
      return { min, max, label: `${min} - ${max} (Lab Printed)` };
    }
  }

  const ltMatch = cleaned.match(/^(?:<|<=|upto|up\s*to)\s*(\d+(?:\.\d+)?)/i);
  if (ltMatch) {
    const max = parseFloat(ltMatch[1]);
    if (Number.isFinite(max)) {
      return { min: 0, max, label: `0 - ${max} (Lab Printed)` };
    }
  }

  const gtMatch = cleaned.match(/^(?:>|>=)\s*(\d+(?:\.\d+)?)/i);
  if (gtMatch) {
    const min = parseFloat(gtMatch[1]);
    if (Number.isFinite(min)) {
      return { min, max: 999999, label: `>= ${min} (Lab Printed)` };
    }
  }

  return null;
}

export function resolveCatalogEntry(rawName: string): LabCatalogEntry | null {
  const lower = normalizeBengaliDigits(rawName).toLowerCase().trim();
  if (!lower) return null;

  if (REFERENCE_RANGE_CATALOG[lower]) return REFERENCE_RANGE_CATALOG[lower];

  for (const entry of Object.values(REFERENCE_RANGE_CATALOG)) {
    if (
      entry.displayName.toLowerCase() === lower ||
      entry.aliases.some((alias) => lower === alias || lower.includes(alias))
    ) {
      return entry;
    }
  }
  return null;
}

// ============================================================================
// 3. eGFR ESTIMATOR & DETERMINISTIC PARAMETER EVALUATOR
// ============================================================================
export function estimateEgfrNote(
  creatinineMgDl: number,
  age: number | null,
  gender: PatientGender
): { egfr: number; noteBn: string } | null {
  if (!Number.isFinite(creatinineMgDl) || creatinineMgDl <= 0) return null;
  const ageYears = age && age >= 18 && age <= 105 ? age : 40;
  // CKD-EPI 2021 (race-free) approximation
  const isFemale = gender === "female";
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const sexFactor = isFemale ? 1.012 : 1.0;
  const ratio = creatinineMgDl / kappa;
  const minPart = Math.min(ratio, 1) ** alpha;
  const maxPart = Math.max(ratio, 1) ** -1.2;
  const egfr = Math.round(142 * minPart * maxPart * 0.9938 ** ageYears * sexFactor);

  const stageNote =
    egfr >= 90
      ? "স্বাভাবিক ছাঁকনি ক্ষমতা (eGFR ≥90)"
      : egfr >= 60
        ? "সামান্য হ্রাস হতে পারে — ডাক্তারের সাথে মিলিয়ে দেখুন"
        : "সম্ভাব্য কিডনি ছাঁকনি ক্ষমতা কমেছে — দ্রুত Nephrology বিশেষজ্ঞের পরামর্শ নিন";

  return {
    egfr,
    noteBn: `আনুমানিক eGFR (CKD-EPI ২০২১, বয়স ${ageYears} বছর ধরে): ~${egfr} mL/min/1.73m² — ${stageNote}।`,
  };
}

export function evaluateLabParameter(
  raw: RawExtractedParameter,
  options: { age?: number | null; gender?: PatientGender } = {}
): EvaluatedParameter | null {
  const gender: PatientGender = options.gender || "male";
  const age = options.age ?? null;

  const parsedVal = parseNumericValue(raw.value);
  if (parsedVal.num === null) return null;

  let value = parsedVal.num;
  const entry = resolveCatalogEntry(raw.name);
  let unit = normalizeUnitString(raw.unit) || entry?.defaultUnit || "";

  // Scale x10^9/L or K/µL for WBC & Platelets if raw unit indicates thousands
  const rawUnitLower = String(raw.unit || "").toLowerCase();
  if (entry && (entry.code === "wbc" || entry.code === "platelets")) {
    if ((rawUnitLower.includes("10^9") || rawUnitLower.includes("10^3") || rawUnitLower.includes("k/")) && value < 1000) {
      value = Math.round(value * 1000);
      unit = "/µL";
    }
  }

  // Choose default bound (pediatric / female / male / mmol variant)
  let bound: RangeBound = entry
    ? age !== null && age < 15 && entry.ranges.pediatric
      ? entry.ranges.pediatric
      : gender === "female"
        ? entry.ranges.female
        : entry.ranges.male
    : { min: 0, max: 999999, unit, label: "Standard Reference" };

  if (entry?.ranges.mmolVariant && unit.toLowerCase().includes("mmol")) {
    bound = entry.ranges.mmolVariant;
  }

  // Strictly prefer lab's printed reference range when present and parseable
  const printedRange = parsePrintedRange(raw.printedReferenceRange);
  const rangeSource: "lab_printed" | "builtin_standard" = printedRange ? "lab_printed" : "builtin_standard";
  const rangeMin = printedRange ? printedRange.min : bound.min;
  const rangeMax = printedRange ? printedRange.max : bound.max;
  const activeRangeLabel = printedRange ? printedRange.label : bound.label;

  let flag: LabFlagLabelBn = "স্বাভাবিক";
  let badgeColor: LabFlagColor = "green";

  if (value < rangeMin) {
    flag = "কম";
    const ratioDiff = rangeMin > 0 ? (rangeMin - value) / rangeMin : 0.25;
    badgeColor = ratioDiff >= 0.2 ? "red" : "amber";
  } else if (value > rangeMax) {
    flag = "বেশি";
    const ratioDiff = rangeMax > 0 ? (value - rangeMax) / rangeMax : 0.5;
    badgeColor = ratioDiff >= 0.25 ? "red" : "amber";
  }

  const displayName = entry?.displayName || raw.name;
  const displayNameBn = entry?.displayNameBn || raw.name;
  const sourceLabelBn = rangeSource === "lab_printed" ? "ল্যাবের প্রিন্টেড রেঞ্জ" : "স্ট্যান্ডার্ড রেফারেন্স রেঞ্জ";

  const whyThisFlagBn =
    flag === "স্বাভাবিক"
      ? `${displayNameBn}-এর মান (${value} ${unit}) ${sourceLabelBn} (${activeRangeLabel})-এর ভেতরে থাকায় এটি স্বাভাবিক।`
      : flag === "কম"
        ? `${displayNameBn}-এর মান (${value} ${unit}) ${sourceLabelBn} (${rangeMin}–${rangeMax} ${unit})-এর নিচে থাকায় এটি 'কম' হিসেবে চিহ্নিত হয়েছে।`
        : `${displayNameBn}-এর মান (${value} ${unit}) ${sourceLabelBn} (${rangeMin}–${rangeMax} ${unit})-এর চেয়ে বেশি হওয়ায় এটি 'বেশি' হিসেবে চিহ্নিত হয়েছে।`;

  let clinicalNoteBn: string | undefined;
  if (entry?.code === "creatinine") {
    const egfrInfo = estimateEgfrNote(value, age, gender);
    if (egfrInfo) clinicalNoteBn = egfrInfo.noteBn;
  }

  const rawMeaning =
    flag === "স্বাভাবিক"
      ? "পরীক্ষার মান স্বাভাবিক সীমার মধ্যে রয়েছে। নিয়মিত সুস্থ জীবনযাপন ও ডাক্তারের পরামর্শ অনুসরণ করুন।"
      : flag === "কম"
        ? entry?.lowMeaningBn || "মান স্বাভাবিকের চেয়ে কম; সম্ভাব্য ঘাটতি বা শারীরিক পরিবর্তনের জন্য ডাক্তারের সাথে মিলিয়ে দেখুন।"
        : entry?.highMeaningBn || "মান স্বাভাবিকের চেয়ে বেশি; সম্ভাব্য ঝুঁকি মূল্যায়নের জন্য ডাক্তারের সাথে মিলিয়ে দেখুন।";

  const safeMeaning = validateAndSanitizeAiOutput(rawMeaning, "lab_parameter_explanation");

  return {
    code: entry?.code || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    displayName,
    displayNameBn,
    rawName: raw.name,
    value,
    unit,
    printedReferenceRange: raw.printedReferenceRange || null,
    activeRangeLabel,
    rangeMin,
    rangeMax,
    rangeSource,
    flag,
    badgeColor,
    whyThisFlagBn,
    whatItIsBn: entry?.whatItIsBn || `${displayNameBn} একটি ডায়াগনস্টিক ল্যাব পরিমাপক।`,
    possibleMeaningBn: safeMeaning.sanitizedText.replace(MANDATORY_BENGALI_DISCLAIMER, "").trim(),
    specialistBn: entry?.specialistBn || "মেডিসিন বিশেষজ্ঞ",
    specialtyQuery: entry?.specialtyQuery || "Medicine",
    clinicalNoteBn,
  };
}

// ============================================================================
// 4. OCR TEXT EXTRACTION PARSER (MESSY BANGLA + ENGLISH LAB TEXT)
// ============================================================================
export function extractLabParametersFromText(rawText: string): RawExtractedParameter[] {
  const text = normalizeBengaliDigits(String(rawText || ""));
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: RawExtractedParameter[] = [];
  const seenCodes = new Set<string>();

  for (const line of lines) {
    // Pattern: Name [separator] Value [Unit] [(Range)]
    const match = line.match(
      /^([A-Za-z0-9\s/().%\-]{2,48}?)[:\-\t|]+\s*(Nil|Absent|Negative|Trace|\+{1,4}|[0-9][0-9.,]*(?:\s*(?:lac|lakh))?)\s*([A-Za-z/%µμ^0-9]+)?(?:\s*[\(\[]?\s*(?:Ref(?:erence)?|Normal|Range)?\s*[:\-]?\s*([0-9.<>=–\-\stoNil]+)\s*[\)\]]?)?$/i
    );
    if (!match) continue;

    const rawName = match[1].trim();
    const entry = resolveCatalogEntry(rawName);
    if (!entry) continue;
    if (seenCodes.has(entry.code)) continue;
    seenCodes.add(entry.code);

    results.push({
      name: rawName,
      value: match[2].trim(),
      unit: match[3]?.trim() || entry.defaultUnit,
      printedReferenceRange: match[4]?.trim() || null,
      confidence: "high",
    });
  }

  return results;
}

// ============================================================================
// 5. SPECIALTY MAPPER & WHOLE-REPORT ANALYZER
// ============================================================================
export function mapReportToSpecialties(parameters: EvaluatedParameter[]): {
  primarySpecialty: string;
  recommendedSpecialties: Array<{ specialtyQuery: string; labelBn: string; reasonBn: string }>;
} {
  const abnormal = parameters.filter((p) => p.flag !== "স্বাভাবিক");
  if (abnormal.length === 0) {
    return {
      primarySpecialty: "General Medicine",
      recommendedSpecialties: [
        {
          specialtyQuery: "General Medicine",
          labelBn: "জেনারেল মেডিসিন (নিয়মিত চেকআপ)",
          reasonBn: "সব সূচক স্বাভাবিক রেঞ্জের মধ্যে রয়েছে; রুটিন ফলোআপের জন্য।",
        },
      ],
    };
  }

  // Prioritize high-severity/red parameters first
  const sorted = [...abnormal].sort((a, b) => {
    const weight = (c: LabFlagColor) => (c === "red" ? 2 : 1);
    return weight(b.badgeColor) - weight(a.badgeColor);
  });

  const grouped = new Map<string, { labelBn: string; items: string[] }>();
  for (const p of sorted) {
    const existing = grouped.get(p.specialtyQuery);
    if (existing) {
      existing.items.push(`${p.displayNameBn} (${p.flag})`);
    } else {
      grouped.set(p.specialtyQuery, {
        labelBn: p.specialistBn,
        items: [`${p.displayNameBn} (${p.flag})`],
      });
    }
  }

  const recommendedSpecialties = Array.from(grouped.entries()).map(([specialtyQuery, meta]) => ({
    specialtyQuery,
    labelBn: meta.labelBn,
    reasonBn: `অস্বাভাবিক সূচক: ${meta.items.join(", ")}`,
  }));

  return {
    primarySpecialty: recommendedSpecialties[0]?.specialtyQuery || "Medicine",
    recommendedSpecialties,
  };
}

export function analyzeLabReport(input: {
  rawText?: string;
  parameters?: RawExtractedParameter[];
  patientAge?: number | null;
  patientGender?: PatientGender;
  symptoms?: string[];
  laboratory?: string;
  reportDate?: string;
  title?: string;
  patientId?: string;
  healthCardNumber?: string;
  organizationId?: string;
  consentRecorded?: boolean;
}): AnalyzedReportRecord {
  const age = input.patientAge ?? 38;
  const gender: PatientGender = input.patientGender || "male";
  const rawParams =
    Array.isArray(input.parameters) && input.parameters.length > 0
      ? input.parameters
      : extractLabParametersFromText(input.rawText || "");

  const evaluated = rawParams
    .map((p) => evaluateLabParameter(p, { age, gender }))
    .filter((p): p is EvaluatedParameter => p !== null);

  const redFlag = checkRedFlagOverride({
    text: input.rawText,
    symptoms: input.symptoms,
    parameters: evaluated.map((p) => ({ code: p.code, value: p.value, unit: p.unit })),
  });

  const abnormalCount = evaluated.filter((p) => p.flag !== "স্বাভাবিক").length;
  const redCount = evaluated.filter((p) => p.badgeColor === "red").length;

  let urgency: ReportUrgencyBn = "স্বাভাবিক";
  if (redFlag.isEmergency || redCount > 0) {
    urgency = "দ্রুত ডাক্তার দেখান";
  } else if (abnormalCount > 0) {
    urgency = "ডাক্তার দেখান";
  }

  const creatParam = evaluated.find((p) => p.code === "creatinine");
  const egfrNoteBn = creatParam?.clinicalNoteBn || null;

  const { primarySpecialty, recommendedSpecialties } = mapReportToSpecialties(evaluated);
  const whySummaryBn = evaluated.map((p) => p.whyThisFlagBn);

  const summaryHeader = redFlag.isEmergency
    ? `🚨 ${redFlag.bannerTitleBn}\n\n`
    : "";

  const abnormalListBn = evaluated
    .filter((p) => p.flag !== "স্বাভাবিক")
    .map((p) => `• ${p.displayNameBn}: ${p.value} ${p.unit} [${p.flag}] — ${p.possibleMeaningBn}`)
    .join("\n");

  const draftSummary =
    evaluated.length === 0
      ? "রিপোর্ট থেকে স্বয়ংক্রিয়ভাবে কোনো সংখ্যা শনাক্ত করা যায়নি। অনুগ্রহ করে স্পষ্ট ছবি দিন অথবা রেজিস্টার্ড ডাক্তারের সাথে মিলিয়ে দেখুন।"
      : `${summaryHeader}মোট ${evaluated.length}টি পরীক্ষা বিশ্লেষণ করা হয়েছে; এর মধ্যে ${abnormalCount}টি মান রেঞ্জের বাইরে পাওয়া গেছে।${
          abnormalListBn ? `\n\nলক্ষণীয় ফলাফল:\n${abnormalListBn}` : "\n\nসব পরীক্ষিত মান নির্ধারিত রেফারেন্স রেঞ্জের ভেতরে রয়েছে।"
        }${egfrNoteBn ? `\n\nকিডনি নোট: ${egfrNoteBn}` : ""}\n\nপ্রস্তাবিত বিশেষজ্ঞ: ${recommendedSpecialties[0]?.labelBn || primarySpecialty} (সম্ভাব্য করণীয় হিসেবে ডাক্তারের সাথে মিলিয়ে দেখুন)।`;

  const safetyCheck = validateAndSanitizeAiOutput(
    draftSummary,
    "lab_report_analyzer",
    input.organizationId || "org-default"
  );

  const id = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    patientId: input.patientId,
    healthCardNumber: input.healthCardNumber,
    organizationId: input.organizationId || "org-default",
    mode: "lab",
    title: input.title || "Lab Report Analysis (CBC / Metabolic / Organ Panel)",
    laboratory: input.laboratory || "Diagnostic Laboratory Report",
    reportDate: input.reportDate || new Date().toISOString().slice(0, 10),
    patientAge: age,
    patientGender: gender,
    urgency,
    redFlag,
    parameters: evaluated,
    egfrNoteBn,
    recommendedSpecialties,
    primarySpecialty,
    onePageSummaryBn: safetyCheck.sanitizedText,
    originalAiSummaryBn: safetyCheck.sanitizedText,
    whySummaryBn,
    safetyViolationsLogged: safetyCheck.violations,
    disclaimerFooterBn: MANDATORY_BENGALI_DISCLAIMER,
    doctorVerified: false,
    editHistory: [],
    consentRecorded: Boolean(input.consentRecorded),
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// 6. RADIOLOGY TEXT & SKIN PHOTO GUIDANCE (MILESTONE 2)
// ============================================================================
export function analyzeRadiologyReportText(input: {
  reportText: string;
  title?: string;
  organizationId?: string;
  consentRecorded?: boolean;
}): AnalyzedReportRecord {
  const text = String(input.reportText || "").trim();
  const lower = text.toLowerCase();
  const redFlag = checkRedFlagOverride({ text });

  let specialtyQuery = "Medicine";
  let labelBn = "মেডিসিন বিশেষজ্ঞ";
  const matchedFindings: string[] = [];

  if (/(consolidation|infiltrate|pleural effusion|pneumonia|bronch|nodule|lung|chest)/i.test(lower)) {
    specialtyQuery = "Pulmonology";
    labelBn = "বক্ষব্যাধি ও মেডিসিন বিশেষজ্ঞ";
    matchedFindings.push("ফুসফুস বা বক্ষ সম্পর্কিত বর্ণনা পাওয়া গেছে");
  }
  if (/(infarct|ischemi|hemorrhage|ventricle|sinusitis|brain|mri brain|ct head)/i.test(lower)) {
    specialtyQuery = "Neurology";
    labelBn = "নিউরোলজি (স্নায়ুরোগ) বিশেষজ্ঞ";
    matchedFindings.push("মস্তিষ্ক বা স্নায়ুতন্ত্র সম্পর্কিত বর্ণনা পাওয়া গেছে");
  }
  if (/(fracture|disc bulge|spondylosis|osteoarth|tear|meniscus|spine)/i.test(lower)) {
    specialtyQuery = "Surgery";
    labelBn = "অর্থোপেডিক / সার্জারি বিশেষজ্ঞ";
    matchedFindings.push("হাড় বা জয়েন্ট সম্পর্কিত বর্ণনা পাওয়া গেছে");
  }
  if (/(fatty liver|hepatomegaly|gallstone|cholelithiasis|renal calculus|hydronephrosis)/i.test(lower)) {
    specialtyQuery = lower.includes("renal") || lower.includes("kidney") ? "Nephrology" : "Hepatology";
    labelBn =
      specialtyQuery === "Nephrology"
        ? "কিডনি (Nephrology) বিশেষজ্ঞ"
        : "লিভার ও পরিপাকতন্ত্র (Hepatology) বিশেষজ্ঞ";
    matchedFindings.push("অভ্যন্তরীণ অঙ্গের আল্ট্রাসাউন্ড/সিটি পর্যবেক্ষণ পাওয়া গেছে");
  }

  const urgency: ReportUrgencyBn = redFlag.isEmergency
    ? "দ্রুত ডাক্তার দেখান"
    : matchedFindings.length > 0
      ? "ডাক্তার দেখান"
      : "স্বাভাবিক";

  const explicitNotice =
    "স্পষ্ট সতর্কবার্তা: এটি শুধুমাত্র লিখিত রেডিওলজি রিপোর্ট টেক্সটের সহজ বাংলা ব্যাখ্যা — সরাসরি এক্স-রে বা এমআরআই ছবির ডায়াগনসিস নয়।";

  const rawBody = `${explicitNotice}\n\n${
    redFlag.isEmergency ? `🚨 ${redFlag.bannerTitleBn}\n\n` : ""
  }রিপোর্ট টেক্সটের সম্ভাব্য সারসংক্ষেপ:\n• ${
    matchedFindings.length > 0 ? matchedFindings.join("\n• ") : "লিখিত বিবরণে তাৎক্ষণিক কোনো সংকটপূর্ণ শব্দ শনাক্ত হয়নি।"
  }\n\nসম্ভাব্য করণীয়: আপনার পূর্ববর্তী উপসর্গের সাথে মিলিয়ে দেখতে ${labelBn}-এর পরামর্শ নিন।`;

  const safe = validateAndSanitizeAiOutput(rawBody, "radiology_text_explainer", input.organizationId || "org-default");

  return {
    id: `rad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    organizationId: input.organizationId || "org-default",
    mode: "radiology",
    title: input.title || "Radiology / Imaging Report Text Explanation",
    laboratory: "Radiology Text Explainer (Non-Image Diagnosis)",
    reportDate: new Date().toISOString().slice(0, 10),
    patientAge: null,
    patientGender: "other",
    urgency,
    redFlag,
    parameters: [],
    egfrNoteBn: null,
    recommendedSpecialties: [
      {
        specialtyQuery,
        labelBn,
        reasonBn: matchedFindings[0] || "লিখিত রেডিওলজি রিপোর্ট মূল্যায়নের জন্য",
      },
    ],
    primarySpecialty: specialtyQuery,
    onePageSummaryBn: safe.sanitizedText,
    originalAiSummaryBn: safe.sanitizedText,
    whySummaryBn: matchedFindings.length > 0 ? matchedFindings : ["রিপোর্ট টেক্সটের শব্দগুচ্ছ বিশ্লেষণ করা হয়েছে"],
    safetyViolationsLogged: safe.violations,
    disclaimerFooterBn: MANDATORY_BENGALI_DISCLAIMER,
    doctorVerified: false,
    editHistory: [],
    consentRecorded: Boolean(input.consentRecorded),
    createdAt: new Date().toISOString(),
  };
}

export function formatSkinGuidanceResult(input: {
  visionAnalysisText: string;
  confidence?: "high" | "medium" | "low";
  organizationId?: string;
  consentRecorded?: boolean;
}): AnalyzedReportRecord {
  const confidence = input.confidence || "low";
  const redFlag = checkRedFlagOverride({ text: input.visionAnalysisText });
  const lowConfidenceBanner =
    confidence === "low"
      ? "⚠️ ছবির আলো বা কোণের কারণে প্রাথমিক আত্মবিশ্বাস কম — অনুগ্রহ করে সরাসরি চর্মরোগ বিশেষজ্ঞ (Dermatology) দেখান।\n\n"
      : "ℹ️ ত্বকের ছবির ওপর ভিত্তি করে সম্ভাব্য প্রাথমিক দিকনির্দেশনা (চূড়ান্ত রোগ নির্ণয় নয়):\n\n";

  const safe = validateAndSanitizeAiOutput(
    `${lowConfidenceBanner}${input.visionAnalysisText}`,
    "skin_photo_guidance",
    input.organizationId || "org-default"
  );

  return {
    id: `skin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    organizationId: input.organizationId || "org-default",
    mode: "skin",
    title: "Skin Photo Preliminary Guidance",
    laboratory: "Dermatology Triage Guidance",
    reportDate: new Date().toISOString().slice(0, 10),
    patientAge: null,
    patientGender: "other",
    urgency: redFlag.isEmergency ? "দ্রুত ডাক্তার দেখান" : "ডাক্তার দেখান",
    redFlag,
    parameters: [],
    egfrNoteBn: null,
    recommendedSpecialties: [
      {
        specialtyQuery: "Dermatology",
        labelBn: "চর্ম ও যৌনরোগ বিশেষজ্ঞ (Dermatologist)",
        reasonBn: "ত্বকের যেকোনো দৃশ্যমান পরিবর্তনের নির্ভরযোগ্য মূল্যায়নের জন্য",
      },
    ],
    primarySpecialty: "Dermatology",
    onePageSummaryBn: safe.sanitizedText,
    originalAiSummaryBn: safe.sanitizedText,
    whySummaryBn: ["ত্বকের ছবি দৃশ্যমান পর্যবেক্ষণ ও নিরাপত্তা ফিল্টার প্রয়োগ করা হয়েছে"],
    safetyViolationsLogged: safe.violations,
    disclaimerFooterBn: MANDATORY_BENGALI_DISCLAIMER,
    doctorVerified: false,
    editHistory: [],
    consentRecorded: Boolean(input.consentRecorded),
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// 7. SAMPLE DEMO DATA, TREND CHART, DOCTOR REVIEW LOOP & SHARE LINKS
// ============================================================================
export const BUILT_IN_SAMPLE_LAB_REPORT_TEXT = `Diagnostic Center Sample Report (Synthesized Demo — Not Real Patient Data)
Patient Age: 38 | Sex: Male
Hemoglobin (Hb): 11.4 g/dL (13.5 - 17.5)
Total WBC Count: 9400 /µL (4000 - 11000)
Platelet Count: 235000 /µL (150000 - 450000)
ESR: 24 mm/hr (0 - 15)
HbA1c: 7.4 % (4.0 - 5.6)
Fasting Blood Glucose (FBS): 148 mg/dL (70 - 99)
Total Cholesterol: 224 mg/dL (125 - 200)
LDL Cholesterol: 138 mg/dL (50 - 100)
Triglycerides (TG): 185 mg/dL (40 - 150)
Serum Creatinine: 1.15 mg/dL (0.7 - 1.3)
SGPT (ALT): 54 U/L (7 - 45)
TSH: 5.2 mIU/L (0.4 - 4.5)
Vitamin D: 19 ng/mL (30 - 100)
Urine Pus Cells: 3 /HPF (0 - 5)`;

function buildSeededDemoReports(): AnalyzedReportRecord[] {
  const r1 = analyzeLabReport({
    title: "Baseline Metabolic & CBC Panel (6 Months Ago)",
    laboratory: "Popular Diagnostic Demo Center",
    reportDate: "2026-05-15",
    patientAge: 38,
    patientGender: "male",
    healthCardNumber: "HP-2026-8841",
    consentRecorded: true,
    rawText: `Hemoglobin (Hb): 12.1 g/dL (13.5 - 17.5)\nHbA1c: 8.1 % (4.0 - 5.6)\nFasting Blood Glucose (FBS): 168 mg/dL (70 - 99)\nLDL Cholesterol: 152 mg/dL (50 - 100)`,
  });
  const r2 = analyzeLabReport({
    title: "Follow-up Glycemic & Lipid Panel (3 Months Ago)",
    laboratory: "Ibn Sina Demo Lab",
    reportDate: "2026-08-20",
    patientAge: 38,
    patientGender: "male",
    healthCardNumber: "HP-2026-8841",
    consentRecorded: true,
    rawText: `Hemoglobin (Hb): 11.8 g/dL (13.5 - 17.5)\nHbA1c: 7.7 % (4.0 - 5.6)\nFasting Blood Glucose (FBS): 154 mg/dL (70 - 99)\nLDL Cholesterol: 142 mg/dL (50 - 100)`,
  });
  const r3 = analyzeLabReport({
    title: "Current Comprehensive Checkup (CBC, HbA1c, Lipid, Renal, LFT, Thyroid)",
    laboratory: "Oxpecker Demo Reference Lab",
    reportDate: "2026-11-12",
    patientAge: 38,
    patientGender: "male",
    healthCardNumber: "HP-2026-8841",
    consentRecorded: true,
    rawText: BUILT_IN_SAMPLE_LAB_REPORT_TEXT,
  });
  r1.id = "rep-demo-001";
  r2.id = "rep-demo-002";
  r3.id = "rep-demo-003";
  return [r3, r2, r1];
}

export interface TrendSeriesPoint {
  date: string;
  value: number;
  unit: string;
  flag: LabFlagLabelBn;
  reportTitle: string;
}

export interface ParameterTrendSeries {
  code: string;
  displayName: string;
  displayNameBn: string;
  unit: string;
  rangeMin: number;
  rangeMax: number;
  points: TrendSeriesPoint[];
}

export function computeParameterTrends(reports: AnalyzedReportRecord[]): ParameterTrendSeries[] {
  const byCode = new Map<string, ParameterTrendSeries>();
  const chronological = [...reports].sort((a, b) => a.reportDate.localeCompare(b.reportDate));

  for (const rep of chronological) {
    for (const p of rep.parameters) {
      let series = byCode.get(p.code);
      if (!series) {
        series = {
          code: p.code,
          displayName: p.displayName,
          displayNameBn: p.displayNameBn,
          unit: p.unit,
          rangeMin: p.rangeMin,
          rangeMax: p.rangeMax,
          points: [],
        };
        byCode.set(p.code, series);
      }
      series.points.push({
        date: rep.reportDate,
        value: p.value,
        unit: p.unit,
        flag: p.flag,
        reportTitle: rep.title,
      });
    }
  }

  return Array.from(byCode.values()).filter((s) => s.points.length >= 2);
}

const g = globalThis as typeof globalThis & {
  __oxpeckerAnalyzedReports?: AnalyzedReportRecord[];
  __oxpeckerReportShareLinks?: Record<string, { reportId: string; expiresAt: number }>;
};

export function getAnalyzedReportsStore(): AnalyzedReportRecord[] {
  if (!g.__oxpeckerAnalyzedReports) {
    g.__oxpeckerAnalyzedReports = buildSeededDemoReports();
  }
  return g.__oxpeckerAnalyzedReports;
}

export function saveAnalyzedReport(record: AnalyzedReportRecord): AnalyzedReportRecord {
  const store = getAnalyzedReportsStore();
  store.unshift(record);
  if (store.length > 200) store.pop();
  return record;
}

export function listAnalyzedReports(filter: { organizationId?: string; healthCardNumber?: string } = {}): AnalyzedReportRecord[] {
  const store = getAnalyzedReportsStore();
  return store.filter((r) => {
    if (filter.organizationId && filter.organizationId !== "ALL" && r.organizationId !== filter.organizationId) {
      return false;
    }
    if (filter.healthCardNumber && r.healthCardNumber !== filter.healthCardNumber) {
      return false;
    }
    return true;
  });
}

export function verifyReportByDoctor(
  reportId: string,
  doctorInput: {
    doctorName: string;
    bmdcRegNo?: string | null;
    noteBn: string;
    correctedSummaryBn?: string;
  }
): AnalyzedReportRecord | null {
  const store = getAnalyzedReportsStore();
  const idx = store.findIndex((r) => r.id === reportId);
  if (idx < 0) return null;

  const existing = store[idx];
  const nowIso = new Date().toISOString();
  const editEntry: DoctorEditHistoryEntry = {
    doctorName: doctorInput.doctorName,
    bmdcRegNo: doctorInput.bmdcRegNo || null,
    editedAt: nowIso,
    noteBn: doctorInput.noteBn,
    correctedSummaryBn: doctorInput.correctedSummaryBn,
  };

  let updatedSummary = existing.onePageSummaryBn;
  if (doctorInput.correctedSummaryBn?.trim()) {
    const safe = validateAndSanitizeAiOutput(
      doctorInput.correctedSummaryBn,
      "doctor_verified_summary",
      existing.organizationId
    );
    updatedSummary = safe.sanitizedText;
  }

  const updated: AnalyzedReportRecord = {
    ...existing,
    doctorVerified: true,
    verifiedByDoctorName: doctorInput.doctorName,
    verifiedByBmdc: doctorInput.bmdcRegNo || "BMDC-Verified",
    verifiedAt: nowIso,
    doctorNoteBn: doctorInput.noteBn,
    onePageSummaryBn: updatedSummary,
    originalAiSummaryBn: existing.originalAiSummaryBn || existing.onePageSummaryBn,
    editHistory: [editEntry, ...(existing.editHistory || [])],
  };

  store[idx] = updated;
  return updated;
}

export function deleteAnalyzedReport(reportId: string): boolean {
  const store = getAnalyzedReportsStore();
  const idx = store.findIndex((r) => r.id === reportId);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function createExpiringShareLink(reportId: string, ttlHours = 24): { token: string; expiresAt: string } | null {
  const store = getAnalyzedReportsStore();
  if (!store.some((r) => r.id === reportId)) return null;
  if (!g.__oxpeckerReportShareLinks) g.__oxpeckerReportShareLinks = {};

  const token = `shr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const expiresAtMs = Date.now() + ttlHours * 3600_000;
  g.__oxpeckerReportShareLinks[token] = { reportId, expiresAt: expiresAtMs };

  return { token, expiresAt: new Date(expiresAtMs).toISOString() };
}

export function resolveExpiringShareLink(token: string): { report: AnalyzedReportRecord; expiresAt: string } | null {
  const links = g.__oxpeckerReportShareLinks || {};
  const entry = links[token];
  if (!entry || Date.now() > entry.expiresAt) return null;
  const report = getAnalyzedReportsStore().find((r) => r.id === entry.reportId);
  if (!report) return null;
  return { report, expiresAt: new Date(entry.expiresAt).toISOString() };
}
