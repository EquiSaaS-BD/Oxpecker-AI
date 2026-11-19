import {
  analyzeLabReport,
  analyzeRadiologyReportText,
  type AnalyzedReportRecord,
  type PatientGender,
} from "@/lib/lab-report-engine";
import {
  MANDATORY_BENGALI_DISCLAIMER,
  checkRedFlagOverride,
  validateAndSanitizeAiOutput,
} from "@/lib/ai-safety-guard";

export type DiagnosticDepartment =
  | "Hematology"
  | "Biochemistry"
  | "Pathology"
  | "Immunology"
  | "Cardiology"
  | "Radiology"
  | "Microbiology"
  | "Health Packages";

export type DiagnosticOrderStatus =
  | "Ordered"
  | "Sample Collected"
  | "In Lab"
  | "AI Analyzed"
  | "Pathologist Review"
  | "Verified & Published"
  | "Delivered";

export type DiagnosticPriority = "Routine" | "Urgent" | "STAT";
export type DiagnosticReportStatus =
  | "Draft"
  | "Processing"
  | "Pending Verification"
  | "Verified"
  | "Critical Alert";

export type ParameterFlag = "Normal" | "Low" | "High" | "Critical";

export interface DiagnosticTestItem {
  id: string;
  code: string;
  name: string;
  department: DiagnosticDepartment;
  specimen: string;
  referenceRange: string;
  unit: string;
  price: number;
  tatHours: number;
  isPackage?: boolean;
  packageItems?: string[];
  isActive: boolean;
}

export interface DiagnosticOrderTestEntry {
  code: string;
  name: string;
  department: DiagnosticDepartment;
  specimen: string;
  price: number;
}

export interface DiagnosticOrderItem {
  id: string;
  accessionId: string;
  organizationId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  smartCardUid?: string;
  referringDoctor: string;
  source: "Walk-In" | "OPD" | "IPD" | "Emergency";
  priority: DiagnosticPriority;
  status: DiagnosticOrderStatus;
  tests: DiagnosticOrderTestEntry[];
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  paymentStatus: "Unpaid" | "Partial" | "Paid";
  paymentMethod?: string;
  collectorName?: string;
  collectedAt?: string;
  billId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticReportParameter {
  name: string;
  value: string;
  unit: string;
  refRange: string;
  flag: ParameterFlag;
  explanationBn?: string;
}

export interface DiagnosticReportItem {
  id: string;
  reportCode: string;
  orderId?: string;
  accessionId?: string;
  organizationId: string;
  patient: string;
  age: number;
  gender: string;
  patientPhone?: string;
  smartCardUid?: string;
  test: string;
  dept: string;
  specimen: string;
  doctor: string;
  date: string;
  status: DiagnosticReportStatus;
  parameters: DiagnosticReportParameter[];
  keyFindings: string;
  bengaliSummary?: string;
  recommendedSpecialist?: string;
  aiAnalyzed?: boolean;
  signedBy?: string;
  signedByDegrees?: string;
  signedByBmdc?: string;
  signedAt?: string;
  publishedToHealthPass?: boolean;
  qrHash?: string;
  createdAt: string;
}

export interface HospitalInventoryItem {
  id: string;
  name: string;
  category:
    | "Gas & Life Support"
    | "Emergency Cardiac"
    | "Fluids"
    | "ICU Consumables"
    | "Surgical Supply"
    | "Lab Reagent & Kit"
    | "Pharmacy Medicine";
  stockCount: number;
  unit: string;
  capacityCount: number;
  level: number;
  status: "Normal" | "Low Stock" | "Reorder Soon";
  batchNo?: string;
  expiryDate?: string;
  updatedAt: string;
}

export interface ClinicalCareNoteItem {
  id: string;
  admissionId?: string;
  patientName: string;
  smartCardUid?: string;
  noteType: "Vitals" | "DoctorRound" | "Medication" | "DischargeSummary" | "ErTriage";
  priority: "Routine" | "Urgent" | "STAT";
  summary: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    spo2?: string;
    temp?: string;
    respRate?: string;
  };
  recordedBy: string;
  createdAt: string;
}

export interface ErTriageCaseItem {
  id: string;
  token: string;
  patientName: string;
  age: number;
  gender: string;
  smartCardUid?: string;
  phone?: string;
  chiefComplaint: string;
  triageLevel: "Red - Immediate" | "Yellow - Urgent" | "Green - Non-Urgent";
  vitalsSummary: string;
  status: "In Triage" | "STAT Lab Ordered" | "Admitted ICU/IPD" | "Discharged";
  arrivedAt: string;
}

const CATALOG_KEY = "oxpecker_diag_catalog_v1";
const ORDERS_KEY = "oxpecker_diag_orders_v1";
const REPORTS_KEY = "oxpecker_diag_reports_v1";
const INVENTORY_KEY = "oxpecker_hms_inventory_v1";
const CLINICAL_NOTES_KEY = "oxpecker_hms_clinical_notes_v1";
const ER_TRIAGE_KEY = "oxpecker_hms_er_triage_v1";

export const INITIAL_DIAGNOSTIC_CATALOG: DiagnosticTestItem[] = [
  {
    id: "cat-cbc",
    code: "TST-CBC",
    name: "Complete Blood Count (CBC with ESR)",
    department: "Hematology",
    specimen: "Whole Blood (EDTA Tube)",
    referenceRange: "Hb: 12.0-17.0 g/dL | WBC: 4.0-11.0 x10^9/L",
    unit: "g/dL",
    price: 450,
    tatHours: 4,
    isActive: true,
  },
  {
    id: "cat-hba1c",
    code: "TST-HBA1C",
    name: "HbA1c (Glycated Hemoglobin)",
    department: "Biochemistry",
    specimen: "Whole Blood (EDTA Tube)",
    referenceRange: "4.0 - 5.6",
    unit: "%",
    price: 950,
    tatHours: 6,
    isActive: true,
  },
  {
    id: "cat-fbs",
    code: "TST-FBS",
    name: "Fasting Blood Sugar (Glucose)",
    department: "Biochemistry",
    specimen: "Fluoride Oxalate Plasma",
    referenceRange: "3.9 - 5.6",
    unit: "mmol/L",
    price: 250,
    tatHours: 2,
    isActive: true,
  },
  {
    id: "cat-lipid",
    code: "TST-LIPID",
    name: "Fasting Lipid Profile (Chol, TG, HDL, LDL)",
    department: "Biochemistry",
    specimen: "Venous Serum (Plain Red)",
    referenceRange: "Total Chol < 200 | LDL < 100",
    unit: "mg/dL",
    price: 1200,
    tatHours: 6,
    isActive: true,
  },
  {
    id: "cat-rft",
    code: "TST-RFT",
    name: "Renal Function Panel (Creatinine, Urea, eGFR)",
    department: "Biochemistry",
    specimen: "Venous Serum",
    referenceRange: "Creatinine 0.7 - 1.3",
    unit: "mg/dL",
    price: 1450,
    tatHours: 6,
    isActive: true,
  },
  {
    id: "cat-lft",
    code: "TST-LFT",
    name: "Liver Function Test (SGPT, SGOT, Bilirubin)",
    department: "Biochemistry",
    specimen: "Venous Serum",
    referenceRange: "SGPT 7 - 56 | Bilirubin < 1.2",
    unit: "U/L",
    price: 1350,
    tatHours: 6,
    isActive: true,
  },
  {
    id: "cat-tsh",
    code: "TST-TSH",
    name: "Thyroid Panel (TSH, FT3, FT4)",
    department: "Immunology",
    specimen: "Venous Serum",
    referenceRange: "TSH 0.4 - 4.0",
    unit: "mIU/L",
    price: 1600,
    tatHours: 8,
    isActive: true,
  },
  {
    id: "cat-vitd",
    code: "TST-VITD",
    name: "25-OH Vitamin D (Total)",
    department: "Immunology",
    specimen: "Venous Serum (Light Protected)",
    referenceRange: "30 - 100",
    unit: "ng/mL",
    price: 2400,
    tatHours: 12,
    isActive: true,
  },
  {
    id: "cat-trop",
    code: "TST-TROP",
    name: "High-Sensitivity Cardiac Troponin-I (STAT)",
    department: "Cardiology",
    specimen: "Venous Serum / Heparin Plasma",
    referenceRange: "< 14",
    unit: "ng/L",
    price: 1800,
    tatHours: 1,
    isActive: true,
  },
  {
    id: "cat-urine",
    code: "TST-URINE",
    name: "Urine Routine & Microscopy (Urine R/E)",
    department: "Pathology",
    specimen: "Midstream Sterile Urine",
    referenceRange: "Pus cells 0-5 /HPF | Sugar Nil",
    unit: "/HPF",
    price: 300,
    tatHours: 3,
    isActive: true,
  },
  {
    id: "cat-crp",
    code: "TST-CRP",
    name: "C-Reactive Protein (hs-CRP) & D-Dimer",
    department: "Immunology",
    specimen: "Venous Serum + Citrate Plasma",
    referenceRange: "hs-CRP < 3.0",
    unit: "mg/L",
    price: 1500,
    tatHours: 4,
    isActive: true,
  },
  {
    id: "cat-echo",
    code: "TST-ECHO",
    name: "Echocardiogram (2D & Color Doppler)",
    department: "Cardiology",
    specimen: "Non-Invasive Ultrasound",
    referenceRange: "LVEF 55 - 70%",
    unit: "%",
    price: 2800,
    tatHours: 2,
    isActive: true,
  },
  {
    id: "cat-hrct",
    code: "TST-HRCT",
    name: "High-Resolution Chest CT (HRCT)",
    department: "Radiology",
    specimen: "Axial Helical CT Scan",
    referenceRange: "Radiologist Qualitative Report",
    unit: "Scan",
    price: 6500,
    tatHours: 6,
    isActive: true,
  },
  {
    id: "cat-mri",
    code: "TST-MRI-BRAIN",
    name: "Brain MRI with Contrast (1.5T)",
    department: "Radiology",
    specimen: "Gadolinium Enhanced MRI",
    referenceRange: "Neuro-Radiologist Report",
    unit: "Scan",
    price: 9500,
    tatHours: 12,
    isActive: true,
  },
  {
    id: "cat-usg",
    code: "TST-USG-ANOM",
    name: "4D Fetal Anomaly Scan",
    department: "Radiology",
    specimen: "Transabdominal Ultrasound",
    referenceRange: "Obstetric Fetal Biometry",
    unit: "Scan",
    price: 3500,
    tatHours: 2,
    isActive: true,
  },
  {
    id: "pkg-exec",
    code: "PKG-EXEC",
    name: "Executive Master Health Checkup Package",
    department: "Health Packages",
    specimen: "Blood + Urine + Cardiac Echo",
    referenceRange: "9 Comprehensive Tests",
    unit: "Package",
    price: 7500,
    tatHours: 12,
    isPackage: true,
    packageItems: ["TST-CBC", "TST-HBA1C", "TST-LIPID", "TST-RFT", "TST-LFT", "TST-TSH", "TST-URINE", "TST-ECHO"],
    isActive: true,
  },
];

export const INITIAL_DIAGNOSTIC_ORDERS: DiagnosticOrderItem[] = [
  {
    id: "ord-8401",
    accessionId: "ACC-2026-8401",
    organizationId: "org-default",
    patientName: "রহিম উদ্দিন (Rahim Uddin)",
    patientAge: 46,
    patientGender: "Male",
    patientPhone: "+880 1711-000000",
    smartCardUid: "HP-2026-8841",
    referringDoctor: "Prof. Dr. Ahmed Rahman, FCPS",
    source: "OPD",
    priority: "Routine",
    status: "Verified & Published",
    tests: [
      { code: "TST-HBA1C", name: "HbA1c (Glycated Hemoglobin)", department: "Biochemistry", specimen: "Whole Blood (EDTA)", price: 950 },
      { code: "TST-RFT", name: "Renal Function Panel", department: "Biochemistry", specimen: "Venous Serum", price: 1450 },
    ],
    totalAmount: 2400,
    discountAmount: 200,
    paidAmount: 2200,
    paymentStatus: "Paid",
    paymentMethod: "bKash",
    collectorName: "Sabbir Ahmed (Phlebotomist)",
    collectedAt: "2026-11-19T08:30:00Z",
    createdAt: "2026-11-19T08:10:00Z",
    updatedAt: "2026-11-19T11:20:00Z",
  },
  {
    id: "ord-8402",
    accessionId: "ACC-2026-8402",
    organizationId: "org-default",
    patientName: "Al Amin Sheikh",
    patientAge: 52,
    patientGender: "Male",
    patientPhone: "+880 1812-334455",
    smartCardUid: "HP-2026-4419",
    referringDoctor: "Dr. Anisur Rahman",
    source: "Emergency",
    priority: "STAT",
    status: "Pathologist Review",
    tests: [
      { code: "TST-TROP", name: "High-Sensitivity Cardiac Troponin-I (STAT)", department: "Cardiology", specimen: "Venous Serum", price: 1800 },
    ],
    totalAmount: 1800,
    discountAmount: 0,
    paidAmount: 1800,
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    collectorName: "Nurse Tania Akter (ER)",
    collectedAt: "2026-11-19T12:05:00Z",
    createdAt: "2026-11-19T12:00:00Z",
    updatedAt: "2026-11-19T12:35:00Z",
  },
  {
    id: "ord-8403",
    accessionId: "ACC-2026-8403",
    organizationId: "org-default",
    patientName: "মোঃ শহিদুল ইসলাম (Shahidul Islam)",
    patientAge: 65,
    patientGender: "Male",
    patientPhone: "+880 1711-223344",
    smartCardUid: "HP-2026-1102",
    referringDoctor: "Dr. Mahmudul Hasan",
    source: "IPD",
    priority: "Urgent",
    status: "In Lab",
    tests: [
      { code: "TST-MRI-BRAIN", name: "Brain MRI with Contrast (1.5T)", department: "Radiology", specimen: "Gadolinium Enhanced MRI", price: 9500 },
    ],
    totalAmount: 9500,
    discountAmount: 500,
    paidAmount: 5000,
    paymentStatus: "Partial",
    paymentMethod: "Card",
    collectorName: "MRI Suite #01",
    collectedAt: "2026-11-19T10:15:00Z",
    createdAt: "2026-11-19T09:50:00Z",
    updatedAt: "2026-11-19T10:45:00Z",
  },
  {
    id: "ord-8404",
    accessionId: "ACC-2026-8404",
    organizationId: "org-default",
    patientName: "ফাতেমা বেগম (Fatema Begum)",
    patientAge: 34,
    patientGender: "Female",
    patientPhone: "+880 1819-876543",
    smartCardUid: "HP-2026-3304",
    referringDoctor: "Dr. Farzana Yasmin, MBBS, MS",
    source: "Walk-In",
    priority: "Routine",
    status: "Ordered",
    tests: [
      { code: "TST-CBC", name: "Complete Blood Count (CBC with ESR)", department: "Hematology", specimen: "Whole Blood (EDTA Tube)", price: 450 },
      { code: "TST-TSH", name: "Thyroid Panel (TSH, FT3, FT4)", department: "Immunology", specimen: "Venous Serum", price: 1600 },
    ],
    totalAmount: 2050,
    discountAmount: 0,
    paidAmount: 2050,
    paymentStatus: "Paid",
    paymentMethod: "Nagad",
    createdAt: "2026-11-19T13:00:00Z",
    updatedAt: "2026-11-19T13:00:00Z",
  },
];

export const INITIAL_DIAGNOSTIC_REPORTS: DiagnosticReportItem[] = [
  {
    id: "RPT-4401",
    reportCode: "RPT-4401",
    accessionId: "ACC-2026-8401",
    organizationId: "org-default",
    patient: "রহিম উদ্দিন (Rahim Uddin)",
    age: 46,
    gender: "Male",
    patientPhone: "+880 1711-000000",
    smartCardUid: "HP-2026-8841",
    test: "Glycemic & Renal Follow-Up Panel (HbA1c + Creatinine)",
    dept: "Biochemistry",
    specimen: "Venous Blood (EDTA & Serum)",
    doctor: "Prof. Dr. Ahmed Rahman",
    date: "19 Nov 2026",
    status: "Verified",
    parameters: [
      { name: "HbA1c", value: "7.8", unit: "%", refRange: "4.0 - 5.6", flag: "High", explanationBn: "গত ৩ মাসের গড় রক্তের শর্করা নির্ধারিত মাত্রার চেয়ে বেশি" },
      { name: "Fasting Glucose", value: "7.4", unit: "mmol/L", refRange: "3.9 - 5.6", flag: "High", explanationBn: "খালি পেটে রক্তের শর্করা কিছুটা বেশি" },
      { name: "Serum Creatinine", value: "1.1", unit: "mg/dL", refRange: "0.7 - 1.3", flag: "Normal", explanationBn: "কিডনির কার্যকারিতা স্বাভাবিক রেঞ্জের মধ্যে আছে" },
    ],
    keyFindings: "HbA1c elevated at 7.8% (suboptimal glycemic control). Serum Creatinine normal at 1.1 mg/dL (CKD-EPI eGFR > 80 mL/min/1.73m2).",
    bengaliSummary: `মোট ৩টি পরীক্ষা বিশ্লেষণ করা হয়েছে; এর মধ্যে ২টি মান স্বাভাবিকের চেয়ে বেশি (HbA1c 7.8%, Fasting Glucose 7.4 mmol/L) এবং কিডনি সূচক স্বাভাবিক রয়েছে। ডাক্তারের সাথে মিলিয়ে ডায়াবেটিস ওষুধ ও খাদ্যতালিকা সমন্বয় করুন।\n\n${MANDATORY_BENGALI_DISCLAIMER}`,
    recommendedSpecialist: "Endocrinology",
    aiAnalyzed: true,
    signedBy: "Prof. Dr. Selina Akter, MD (Clinical Pathology)",
    signedByDegrees: "MBBS, FCPS (Hematology), MCPS",
    signedByBmdc: "BMDC-A-21904",
    signedAt: "2026-11-19T11:20:00Z",
    publishedToHealthPass: true,
    qrHash: "OX-SHA256-98F41C2B",
    createdAt: "2026-11-19T11:20:00Z",
  },
  {
    id: "RPT-4402",
    reportCode: "RPT-4402",
    orderId: "ord-8402",
    accessionId: "ACC-2026-8402",
    organizationId: "org-default",
    patient: "Al Amin Sheikh",
    age: 52,
    gender: "Male",
    patientPhone: "+880 1812-334455",
    smartCardUid: "HP-2026-4419",
    test: "Cardiac Troponin I (High Sensitive - STAT)",
    dept: "Cardiology",
    specimen: "Venous Blood (Serum)",
    doctor: "Dr. Anisur Rahman",
    date: "19 Nov 2026",
    status: "Critical Alert",
    parameters: [
      { name: "hs-Cardiac Troponin I", value: "142", unit: "ng/L", refRange: "< 14", flag: "Critical", explanationBn: "রক্তে ট্রপোনিন-আই মারাত্মকভাবে বেশি — জরুরি কার্ডিয়াক মূল্যায়ন প্রয়োজন" },
      { name: "D-Dimer", value: "0.42", unit: "mg/L", refRange: "< 0.50", flag: "Normal" },
    ],
    keyFindings: "CRITICAL ALERT: hs-cTnI level 142 ng/L (Reference < 14 ng/L). Urgent acute coronary syndrome protocol & CCU cardiology consultation initiated.",
    bengaliSummary: `🚨 জরুরি সতর্কতা: হৃদপেশির এনজাইম (Troponin-I 142 ng/L) স্বাভাবিকের চেয়ে অনেক বেশি। অনুগ্রহ করে অবিলম্বে জরুরি বিভাগ (ER) / হৃদরোগ বিশেষজ্ঞের তত্ত্বাবধানে নিন।\n\n${MANDATORY_BENGALI_DISCLAIMER}`,
    recommendedSpecialist: "Cardiology",
    aiAnalyzed: true,
    publishedToHealthPass: false,
    qrHash: "OX-SHA256-77C12A04",
    createdAt: "2026-11-19T12:35:00Z",
  },
  {
    id: "RPT-4403",
    reportCode: "RPT-4403",
    organizationId: "org-default",
    patient: "Nasreen Akter",
    age: 32,
    gender: "Female",
    test: "Anomaly Scan (4D Ultrasound)",
    dept: "Radiology",
    specimen: "Transabdominal Imaging",
    doctor: "Dr. Farzana Yasmin",
    date: "18 Nov 2026",
    status: "Verified",
    parameters: [
      { name: "Fetal Heart Rate", value: "144", unit: "bpm", refRange: "120 - 160", flag: "Normal" },
      { name: "Amniotic Fluid Index (AFI)", value: "13.8", unit: "cm", refRange: "8.0 - 20.0", flag: "Normal" },
    ],
    keyFindings: "Single active fetus, cephalic presentation. Estimated fetal weight 1.85 kg. Amniotic fluid index normal. No structural anomalies detected.",
    bengaliSummary: `স্পষ্ট সতর্কবার্তা: এটি লিখিত আল্ট্রাসাউন্ড রিপোর্টের সহজ বাংলা সারসংক্ষেপ। শিশুর হৃৎস্পন্দন ও অ্যামনিওটিক ফ্লুইড স্বাভাবিক পরিসীমার ভেতরে রয়েছে।\n\n${MANDATORY_BENGALI_DISCLAIMER}`,
    recommendedSpecialist: "Gynecology",
    aiAnalyzed: true,
    signedBy: "Dr. Tahmina Sultana, FCPS (Radiology)",
    signedByDegrees: "MBBS, FCPS, MD (Radiology)",
    signedByBmdc: "BMDC-A-33412",
    signedAt: "2026-11-18T15:00:00Z",
    publishedToHealthPass: true,
    qrHash: "OX-SHA256-41E09D88",
    createdAt: "2026-11-18T15:00:00Z",
  },
  {
    id: "RPT-4404",
    reportCode: "RPT-4404",
    orderId: "ord-8403",
    accessionId: "ACC-2026-8403",
    organizationId: "org-default",
    patient: "মোঃ শহিদুল ইসলাম (Shahidul Islam)",
    age: 65,
    gender: "Male",
    smartCardUid: "HP-2026-1102",
    test: "Brain MRI with Contrast (1.5T)",
    dept: "Radiology",
    specimen: "Gadolinium Enhanced Imaging",
    doctor: "Dr. Mahmudul Hasan",
    date: "19 Nov 2026",
    status: "Processing",
    parameters: [],
    keyFindings: "MRI volumetric acquisition completed. Radiologist multi-planar reconstruction awaiting verification.",
    publishedToHealthPass: false,
    qrHash: "OX-SHA256-PENDING",
    createdAt: "2026-11-19T10:50:00Z",
  },
  {
    id: "RPT-4405",
    reportCode: "RPT-4405",
    organizationId: "org-default",
    patient: "Sultana Begum",
    age: 29,
    gender: "Female",
    test: "Complete Blood Count (CBC & ESR)",
    dept: "Hematology",
    specimen: "Whole Blood (EDTA)",
    doctor: "Dr. Nusrat Jahan",
    date: "19 Nov 2026",
    status: "Verified",
    parameters: [
      { name: "Hemoglobin (Hb)", value: "10.8", unit: "g/dL", refRange: "12.0 - 15.5", flag: "Low", explanationBn: "হিমোগ্লোবিন কিছুটা কম — মৃদু রক্তস্বল্পতা নির্দেশ করে" },
      { name: "Total WBC Count", value: "7.4", unit: "x10^9/L", refRange: "4.0 - 11.0", flag: "Normal" },
      { name: "Platelet Count", value: "245", unit: "x10^9/L", refRange: "150 - 450", flag: "Normal" },
      { name: "ESR (Westergren)", value: "18", unit: "mm/1st hr", refRange: "0 - 20", flag: "Normal" },
    ],
    keyFindings: "Mild microcytic anemia (Hb 10.8 g/dL). White cell and platelet counts within normal limits.",
    bengaliSummary: `হিমোগ্লোবিন (10.8 g/dL) স্বাভাবিকের চেয়ে কিছুটা কম, যা মৃদু রক্তস্বল্পতা নির্দেশ করতে পারে। শ্বেত রক্তকণিকা ও প্ল্যাটিলেট স্বাভাবিক রয়েছে।\n\n${MANDATORY_BENGALI_DISCLAIMER}`,
    recommendedSpecialist: "Medicine",
    aiAnalyzed: true,
    signedBy: "Prof. Dr. Selina Akter, MD (Clinical Pathology)",
    signedByDegrees: "MBBS, FCPS (Hematology)",
    signedByBmdc: "BMDC-A-21904",
    signedAt: "2026-11-19T09:30:00Z",
    publishedToHealthPass: true,
    qrHash: "OX-SHA256-12BC8940",
    createdAt: "2026-11-19T09:30:00Z",
  },
];

export const INITIAL_HOSPITAL_INVENTORY: HospitalInventoryItem[] = [
  {
    id: "MED-01",
    name: "Liquid Medical Oxygen (Central Tank)",
    category: "Gas & Life Support",
    stockCount: 8500,
    unit: "Liters",
    capacityCount: 10000,
    level: 85,
    status: "Normal",
    batchNo: "LOX-2026-11",
    expiryDate: "2027-06-30",
    updatedAt: "2026-11-19T08:00:00Z",
  },
  {
    id: "REG-01",
    name: "hs-Troponin I Reagent Cartridges (Architect STAT)",
    category: "Lab Reagent & Kit",
    stockCount: 22,
    unit: "Tests",
    capacityCount: 100,
    level: 22,
    status: "Low Stock",
    batchNo: "ABT-TROP-492",
    expiryDate: "2027-03-15",
    updatedAt: "2026-11-19T09:00:00Z",
  },
  {
    id: "REG-02",
    name: "EDTA Purple-Top Vacutainer Tubes (3mL)",
    category: "Lab Reagent & Kit",
    stockCount: 1400,
    unit: "Tubes",
    capacityCount: 2000,
    level: 70,
    status: "Normal",
    batchNo: "BD-VAC-991",
    expiryDate: "2028-01-20",
    updatedAt: "2026-11-19T09:15:00Z",
  },
  {
    id: "MED-02",
    name: "Inj. Streptokinase 1,500,000 IU",
    category: "Emergency Cardiac",
    stockCount: 14,
    unit: "Vials",
    capacityCount: 50,
    level: 28,
    status: "Low Stock",
    batchNo: "SK-2026-08",
    expiryDate: "2027-05-01",
    updatedAt: "2026-11-18T14:00:00Z",
  },
  {
    id: "MED-03",
    name: "IV Normal Saline 1000mL",
    category: "Fluids",
    stockCount: 450,
    unit: "Bags",
    capacityCount: 600,
    level: 75,
    status: "Normal",
    batchNo: "NS-8820",
    expiryDate: "2028-02-10",
    updatedAt: "2026-11-19T07:30:00Z",
  },
  {
    id: "MED-04",
    name: "Ventilator Breathing Circuits (Adult)",
    category: "ICU Consumables",
    stockCount: 12,
    unit: "Sets",
    capacityCount: 40,
    level: 30,
    status: "Reorder Soon",
    batchNo: "DRG-221",
    expiryDate: "2027-11-01",
    updatedAt: "2026-11-18T11:00:00Z",
  },
];

export const INITIAL_ER_TRIAGE_CASES: ErTriageCaseItem[] = [
  {
    id: "er-101",
    token: "ER-01",
    patientName: "Al Amin Sheikh",
    age: 52,
    gender: "Male",
    smartCardUid: "HP-2026-4419",
    phone: "+880 1812-334455",
    chiefComplaint: "Acute retrosternal chest pain with diaphoresis (45 mins)",
    triageLevel: "Red - Immediate",
    vitalsSummary: "BP 165/98 | HR 112 | SpO2 93%",
    status: "STAT Lab Ordered",
    arrivedAt: "11:55 AM",
  },
  {
    id: "er-102",
    token: "ER-02",
    patientName: "Jannatul Ferdous",
    age: 26,
    gender: "Female",
    phone: "+880 1755-889900",
    chiefComplaint: "High-grade fever (103.4°F) with persistent vomiting",
    triageLevel: "Yellow - Urgent",
    vitalsSummary: "BP 102/68 | HR 104 | SpO2 98% | Temp 103.4°F",
    status: "In Triage",
    arrivedAt: "12:20 PM",
  },
];

export const INITIAL_CLINICAL_NOTES: ClinicalCareNoteItem[] = [
  {
    id: "note-1",
    admissionId: "ADM-1031",
    patientName: "Shahidul Islam",
    smartCardUid: "HP-2026-1102",
    noteType: "Vitals",
    priority: "Urgent",
    summary: "Morning ICU neuro-check completed. Patient responsive to verbal stimuli. IV mannitol infusion continued.",
    vitals: { bp: "148/90", pulse: "88 bpm", spo2: "97%", temp: "98.6°F", respRate: "18/min" },
    recordedBy: "RN Sharmin Akter (ICU Shift A)",
    createdAt: "2026-11-19T08:45:00Z",
  },
];

const g = globalThis as typeof globalThis & {
  __oxpeckerDiagCatalog?: DiagnosticTestItem[];
  __oxpeckerDiagOrders?: DiagnosticOrderItem[];
  __oxpeckerDiagReports?: DiagnosticReportItem[];
  __oxpeckerInventory?: HospitalInventoryItem[];
  __oxpeckerClinicalNotes?: ClinicalCareNoteItem[];
  __oxpeckerErTriage?: ErTriageCaseItem[];
};

function loadWithStorage<T>(storageKey: string, globalProp: keyof typeof g, seed: T[]): T[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(storageKey, JSON.stringify(seed));
    } catch {}
    return [...seed];
  }
  const existing = g[globalProp] as T[] | undefined;
  if (!existing) {
    (g[globalProp] as T[]) = [...seed];
  }
  return g[globalProp] as T[];
}

function saveWithStorage<T>(storageKey: string, globalProp: keyof typeof g, list: T[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {}
  } else {
    (g[globalProp] as T[]) = list;
  }
}

export function getDiagnosticCatalog(): DiagnosticTestItem[] {
  return loadWithStorage(CATALOG_KEY, "__oxpeckerDiagCatalog", INITIAL_DIAGNOSTIC_CATALOG);
}

export function saveDiagnosticCatalogItem(item: DiagnosticTestItem): DiagnosticTestItem[] {
  const list = getDiagnosticCatalog();
  const idx = list.findIndex((t) => t.id === item.id || t.code === item.code);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  saveWithStorage(CATALOG_KEY, "__oxpeckerDiagCatalog", list);
  return list;
}

export function getDiagnosticOrders(): DiagnosticOrderItem[] {
  return loadWithStorage(ORDERS_KEY, "__oxpeckerDiagOrders", INITIAL_DIAGNOSTIC_ORDERS);
}

export function createDiagnosticOrder(input: {
  organizationId?: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  smartCardUid?: string;
  referringDoctor?: string;
  source?: DiagnosticOrderItem["source"];
  priority?: DiagnosticPriority;
  tests: DiagnosticOrderTestEntry[];
  discountAmount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  billId?: string;
}): DiagnosticOrderItem {
  const list = getDiagnosticOrders();
  const subtotal = input.tests.reduce((acc, t) => acc + Number(t.price || 0), 0);
  const discount = Math.max(0, Number(input.discountAmount || 0));
  const net = Math.max(0, subtotal - discount);
  const paid = Math.max(0, Number(input.paidAmount || 0));
  const paymentStatus: DiagnosticOrderItem["paymentStatus"] =
    paid >= net && net > 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";

  const now = new Date().toISOString();
  const seq = 8405 + list.length;
  const accessionId = `ACC-${new Date().getFullYear()}-${seq}`;

  const order: DiagnosticOrderItem = {
    id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    accessionId,
    organizationId: input.organizationId || "org-default",
    patientName: input.patientName,
    patientAge: Number(input.patientAge || 35),
    patientGender: input.patientGender || "Male",
    patientPhone: input.patientPhone || "",
    smartCardUid: input.smartCardUid || undefined,
    referringDoctor: input.referringDoctor || "Self / Walk-In",
    source: input.source || "Walk-In",
    priority: input.priority || "Routine",
    status: "Ordered",
    tests: input.tests,
    totalAmount: subtotal,
    discountAmount: discount,
    paidAmount: paid,
    paymentStatus,
    paymentMethod: input.paymentMethod || "Cash",
    billId: input.billId,
    createdAt: now,
    updatedAt: now,
  };

  list.unshift(order);
  saveWithStorage(ORDERS_KEY, "__oxpeckerDiagOrders", list);
  return order;
}

export function updateDiagnosticOrderStatus(
  orderId: string,
  status: DiagnosticOrderStatus,
  extra?: { collectorName?: string; paidAmount?: number; paymentMethod?: string }
): DiagnosticOrderItem | null {
  const list = getDiagnosticOrders();
  const idx = list.findIndex((o) => o.id === orderId || o.accessionId === orderId);
  if (idx < 0) return null;

  const current = { ...list[idx], status, updatedAt: new Date().toISOString() };
  if (status === "Sample Collected" && !current.collectedAt) {
    current.collectedAt = new Date().toISOString();
    current.collectorName = extra?.collectorName || current.collectorName || "Lab Phlebotomist";
  }
  if (extra?.paidAmount !== undefined) {
    current.paidAmount = Number(extra.paidAmount);
    const net = Math.max(0, current.totalAmount - current.discountAmount);
    current.paymentStatus =
      current.paidAmount >= net && net > 0 ? "Paid" : current.paidAmount > 0 ? "Partial" : "Unpaid";
  }
  if (extra?.paymentMethod) current.paymentMethod = extra.paymentMethod;

  list[idx] = current;
  saveWithStorage(ORDERS_KEY, "__oxpeckerDiagOrders", list);
  return current;
}

export function getDiagnosticReports(): DiagnosticReportItem[] {
  return loadWithStorage(REPORTS_KEY, "__oxpeckerDiagReports", INITIAL_DIAGNOSTIC_REPORTS);
}

export function saveDiagnosticReport(report: DiagnosticReportItem): DiagnosticReportItem[] {
  const list = getDiagnosticReports();
  const idx = list.findIndex((r) => r.id === report.id || r.reportCode === report.reportCode);
  if (idx >= 0) list[idx] = report;
  else list.unshift(report);
  saveWithStorage(REPORTS_KEY, "__oxpeckerDiagReports", list);
  return list;
}

export function verifyAndSignDiagnosticReport(
  reportId: string,
  signatory: { name: string; degrees?: string; bmdc?: string },
  publishToHealthPass = true
): DiagnosticReportItem | null {
  const list = getDiagnosticReports();
  const idx = list.findIndex((r) => r.id === reportId || r.reportCode === reportId);
  if (idx < 0) return null;

  const rpt = { ...list[idx] };
  const hasCritical = rpt.parameters?.some((p) => p.flag === "Critical");
  rpt.status = hasCritical ? "Critical Alert" : "Verified";
  rpt.signedBy = signatory.name || "Prof. Dr. Selina Akter";
  rpt.signedByDegrees = signatory.degrees || "MBBS, FCPS, MD (Pathology)";
  rpt.signedByBmdc = signatory.bmdc || "BMDC-A-21904";
  rpt.signedAt = new Date().toISOString();
  rpt.publishedToHealthPass = publishToHealthPass;
  rpt.qrHash = `OX-SHA256-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

  list[idx] = rpt;
  saveWithStorage(REPORTS_KEY, "__oxpeckerDiagReports", list);
  return rpt;
}

export function getHospitalInventoryItems(): HospitalInventoryItem[] {
  return loadWithStorage(INVENTORY_KEY, "__oxpeckerInventory", INITIAL_HOSPITAL_INVENTORY);
}

export function addOrRestockInventoryItem(item: Partial<HospitalInventoryItem> & { name: string }): HospitalInventoryItem[] {
  const list = getHospitalInventoryItems();
  const existingIdx = list.findIndex((i) => i.id === item.id || i.name.toLowerCase() === item.name.toLowerCase());
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const existing = { ...list[existingIdx] };
    existing.stockCount = Number(item.stockCount ?? existing.stockCount);
    existing.capacityCount = Math.max(existing.stockCount, Number(item.capacityCount ?? existing.capacityCount));
    existing.level = Math.min(100, Math.round((existing.stockCount / Math.max(1, existing.capacityCount)) * 100));
    existing.status = existing.level <= 25 ? "Low Stock" : existing.level <= 40 ? "Reorder Soon" : "Normal";
    existing.batchNo = item.batchNo || existing.batchNo;
    existing.expiryDate = item.expiryDate || existing.expiryDate;
    existing.updatedAt = now;
    list[existingIdx] = existing;
  } else {
    const stock = Number(item.stockCount || 50);
    const cap = Math.max(stock, Number(item.capacityCount || 100));
    const level = Math.min(100, Math.round((stock / Math.max(1, cap)) * 100));
    list.unshift({
      id: item.id || `SKU-${Date.now().toString().slice(-4)}`,
      name: item.name,
      category: item.category || "Lab Reagent & Kit",
      stockCount: stock,
      unit: item.unit || "Units",
      capacityCount: cap,
      level,
      status: level <= 25 ? "Low Stock" : level <= 40 ? "Reorder Soon" : "Normal",
      batchNo: item.batchNo || `BTH-${Date.now().toString().slice(-4)}`,
      expiryDate: item.expiryDate || "2027-12-31",
      updatedAt: now,
    });
  }

  saveWithStorage(INVENTORY_KEY, "__oxpeckerInventory", list);
  return list;
}

export function getClinicalCareNotes(admissionId?: string): ClinicalCareNoteItem[] {
  const notes = loadWithStorage(CLINICAL_NOTES_KEY, "__oxpeckerClinicalNotes", INITIAL_CLINICAL_NOTES);
  if (admissionId) {
    return notes.filter((n) => n.admissionId === admissionId);
  }
  return notes;
}

export function addClinicalCareNote(
  note: Omit<ClinicalCareNoteItem, "id" | "createdAt">
): ClinicalCareNoteItem[] {
  const notes = loadWithStorage(CLINICAL_NOTES_KEY, "__oxpeckerClinicalNotes", INITIAL_CLINICAL_NOTES);
  notes.unshift({
    ...note,
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    createdAt: new Date().toISOString(),
  });
  saveWithStorage(CLINICAL_NOTES_KEY, "__oxpeckerClinicalNotes", notes);
  return notes;
}

export function getErTriageCases(): ErTriageCaseItem[] {
  return loadWithStorage(ER_TRIAGE_KEY, "__oxpeckerErTriage", INITIAL_ER_TRIAGE_CASES);
}

export function saveErTriageCase(item: ErTriageCaseItem): ErTriageCaseItem[] {
  const list = getErTriageCases();
  const idx = list.findIndex((c) => c.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  saveWithStorage(ER_TRIAGE_KEY, "__oxpeckerErTriage", list);
  return list;
}

/**
 * Deterministic Hospital AI Report Scanner Bridge.
 * Connects Hospital LIS upload/text scanning to lab-report-engine + ai-safety-guard.
 */
export function runHospitalAiReportScan(input: {
  mode?: "lab" | "radiology";
  rawText?: string;
  structuredParameters?: Array<{ name: string; value: number | string; unit?: string; refRange?: string }>;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  smartCardUid?: string;
  testTitle: string;
  department: string;
  specimen?: string;
  referringDoctor?: string;
  orderId?: string;
  accessionId?: string;
  organizationId?: string;
}): {
  report: DiagnosticReportItem;
  engineAnalysis: AnalyzedReportRecord;
  isCritical: boolean;
} {
  const genderLower = (input.patientGender || "male").toLowerCase();
  const gender: PatientGender =
    genderLower === "female" ? "female" : genderLower === "other" ? "other" : "male";

  const isRadiology =
    input.mode === "radiology" ||
    /radiology|ct|mri|x-ray|xray|ultrasound|usg|echo/i.test(input.department + " " + input.testTitle);

  let engineAnalysis: AnalyzedReportRecord;
  let mappedParameters: DiagnosticReportParameter[] = [];

  if (isRadiology && input.rawText && (!input.structuredParameters || input.structuredParameters.length === 0)) {
    engineAnalysis = analyzeRadiologyReportText({
      reportText: input.rawText,
      title: input.testTitle,
      organizationId: input.organizationId || "org-default",
      consentRecorded: true,
    });
  } else {
    engineAnalysis = analyzeLabReport({
      rawText: input.rawText,
      parameters: input.structuredParameters?.map((p) => ({
        name: p.name,
        value: p.value,
        unit: p.unit,
        printedRange: p.refRange,
      })),
      patientAge: input.patientAge ?? 38,
      patientGender: gender,
      laboratory: "Oxpecker Verified Hospital LIS",
      title: input.testTitle,
      healthCardNumber: input.smartCardUid,
      organizationId: input.organizationId || "org-default",
      consentRecorded: true,
    });

    mappedParameters = engineAnalysis.parameters.map((ep) => {
      let flag: ParameterFlag = "Normal";
      if (ep.flag === "কম") {
        flag = ep.badgeColor === "red" ? "Critical" : "Low";
      } else if (ep.flag === "বেশি") {
        flag = ep.badgeColor === "red" ? "Critical" : "High";
      }
      return {
        name: ep.displayName || ep.rawName || ep.code,
        value: String(ep.value),
        unit: ep.unit,
        refRange: ep.activeRangeLabel || ep.printedReferenceRange || "Ref Lab Specific",
        flag,
        explanationBn: ep.whyThisFlagBn,
      };
    });

    // Preserve manual rows that weren't in built-in catalog so no custom hospital analytes disappear
    if (input.structuredParameters) {
      for (const sp of input.structuredParameters) {
        const alreadyMapped = mappedParameters.some(
          (mp) => mp.name.toLowerCase() === sp.name.toLowerCase()
        );
        if (!alreadyMapped) {
          const num = parseFloat(String(sp.value));
          let customFlag: ParameterFlag = "Normal";
          if (!Number.isNaN(num) && /troponin/i.test(sp.name) && num >= 50) {
            customFlag = "Critical";
          } else if (!Number.isNaN(num) && sp.refRange) {
            const ltMatch = sp.refRange.match(/<\s*(\d+(?:\.\d+)?)/);
            const rangeMatch = sp.refRange.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
            if (ltMatch && num >= parseFloat(ltMatch[1])) {
              customFlag = num >= parseFloat(ltMatch[1]) * 3 ? "Critical" : "High";
            } else if (rangeMatch) {
              const lo = parseFloat(rangeMatch[1]);
              const hi = parseFloat(rangeMatch[2]);
              if (num < lo) customFlag = num < lo * 0.65 ? "Critical" : "Low";
              else if (num > hi) customFlag = num > hi * 2 ? "Critical" : "High";
            }
          }
          mappedParameters.push({
            name: sp.name,
            value: String(sp.value),
            unit: sp.unit || "",
            refRange: sp.refRange || "Ref Lab Specific",
            flag: customFlag,
          });
        }
      }
    }
  }

  // Red flag & critical threshold check (Troponin, raw emergency text, severe labs)
  const extraRedFlag = checkRedFlagOverride({
    text: `${input.rawText || ""} ${input.structuredParameters?.map((p) => `${p.name} ${p.value}`).join(" ") || ""}`,
    parameters: mappedParameters.map((p) => ({
      code: p.name.toLowerCase(),
      value: parseFloat(p.value) || 0,
      unit: p.unit,
    })),
  });

  const hasCriticalParam = mappedParameters.some((p) => p.flag === "Critical");
  const isCritical = engineAnalysis.redFlag.isEmergency || extraRedFlag.isEmergency || hasCriticalParam;

  const rawSummary = engineAnalysis.onePageSummaryBn || input.rawText || "";
  const safety = validateAndSanitizeAiOutput(rawSummary, "hospital_lis_scanner", input.organizationId || "org-default");

  const codeSeq = 4500 + Math.floor(Math.random() * 5000);
  const reportCode = `RPT-${codeSeq}`;
  const findingsText =
    mappedParameters.length > 0
      ? mappedParameters
          .map((p) => `${p.name}: ${p.value} ${p.unit} (${p.flag}${p.refRange ? `, Ref: ${p.refRange}` : ""})`)
          .join(" • ")
      : (input.rawText || "").trim() || "Diagnostic findings recorded.";

  const report: DiagnosticReportItem = {
    id: reportCode,
    reportCode,
    orderId: input.orderId,
    accessionId: input.accessionId,
    organizationId: input.organizationId || "org-default",
    patient: input.patientName,
    age: Number(input.patientAge || 38),
    gender: input.patientGender || "Male",
    patientPhone: input.patientPhone,
    smartCardUid: input.smartCardUid,
    test: input.testTitle,
    dept: input.department || "Pathology",
    specimen: input.specimen || "Laboratory Specimen",
    doctor: input.referringDoctor || "Attending Physician",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status: isCritical ? "Critical Alert" : "Pending Verification",
    parameters: mappedParameters,
    keyFindings: findingsText,
    bengaliSummary: safety.sanitizedText,
    recommendedSpecialist: engineAnalysis.primarySpecialty,
    aiAnalyzed: true,
    publishedToHealthPass: false,
    qrHash: `OX-SHA256-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  return { report, engineAnalysis, isCritical };
}
