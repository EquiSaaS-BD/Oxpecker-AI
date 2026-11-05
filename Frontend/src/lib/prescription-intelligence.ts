import fs from "fs";
import path from "path";
import { getCatalogMedicines, getGenericMonograph, getMedicineSnapshotMetadata, normalizePackageSize } from "@/lib/medicine-catalog";

export type MatchStatus =
  | "EXACT_MATCH"
  | "STRONG_MATCH"
  | "POSSIBLE_MATCH"
  | "NOT_FOUND"
  | "NEEDS_MANUAL_VERIFICATION";

export type ConfidenceLevel = "clear" | "uncertain" | "illegible";

export interface ExtractedPrescriptionMedicine {
  id: string;
  brandName: string | null;
  genericName: string | null;
  strength: string | null;
  dosageForm: string | null;
  manufacturer: string | null;
  dosageInstructions: string | null;
  frequency: string | null;
  morningDose: number | null;
  afternoonDose: number | null;
  nightDose: number | null;
  dailyDoseUnits: number | null;
  duration: string | null;
  durationDays: number | null;
  quantity: number | null;
  quantityUnit: string | null;
  notes: string | null;
  ocrConfidence: number; // 0.0 to 1.0
  medicineNameConfidence: number; // 0.0 to 1.0
  strengthConfidence: number; // 0.0 to 1.0
  extractionStatus: "EXTRACTED" | "LOW_CONFIDENCE" | "MANUAL_ENTRY" | "EDITED";
  requiresManualVerification: boolean;
  selectedDatabaseMedicineId?: string | null;
}

export interface MatchedDatabaseMedicine {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  packageSize: string | null;
  packageContainer: string | null;
  unitPrice: number | null;
  packPrice: number | null;
  packUnitCount: number | null;
  effectiveUnitPrice: number | null;
  priceBasis: "unit" | "pack" | null;
  priceAvailable: boolean;
  priceSource: string;
  lastUpdated: string | null;
  category: string;
  slug: string;
}

export interface MedicinePricingCalculation {
  dailyDosageUnits: number | null;
  durationDays: number | null;
  requiredQuantity: number | null;
  quantityUnit: string;
  pricingBasisUsed: "unit" | "pack" | "none";
  unitPriceBdt: number | null;
  packPriceBdt: number | null;
  packSizeDescription: string | null;
  packsRequired: number | null;
  lineTotalPaisa: number | null;
  lineTotalBdt: number | null;
  pricingStatus: "VERIFIED_PRICED" | "PRICE_UNAVAILABLE" | "QUANTITY_REQUIRED" | "UNMATCHED_MEDICINE" | "VERIFICATION_REQUIRED";
  statusMessage: string;
}

export interface AlternativeMedicineOption {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  unitPrice: number | null;
  packPrice: number | null;
  priceBasis: "unit" | "pack" | null;
  savingsPerUnitBdt: number | null;
}

export interface PrescriptionMedicineIntelligenceItem {
  itemId: string;
  extracted: ExtractedPrescriptionMedicine;
  matchStatus: MatchStatus;
  matchConfidence: number; // 0.0 to 1.0
  matchStage: string;
  matchReason: string;
  matchedMedicine: MatchedDatabaseMedicine | null;
  candidateMatches: MatchedDatabaseMedicine[];
  genericAlternatives: AlternativeMedicineOption[];
  pricing: MedicinePricingCalculation;
}

export interface PrescriptionFinancialSummary {
  prescriptionId: string;
  analyzedAt: string;
  totalExtractedCount: number;
  matchedCount: number;
  exactMatchCount: number;
  strongMatchCount: number;
  possibleMatchCount: number;
  notFoundCount: number;
  needsVerificationCount: number;
  pricedMedicinesCount: number;
  unpricedMedicinesCount: number;
  verifiedTotalPaisa: number;
  verifiedTotalBdt: number;
  estimatedTotalPaisa: number;
  estimatedTotalBdt: number;
  isCompleteCalculation: boolean;
  currency: "BDT";
  currencySymbol: "৳";
  priceSource: string;
  catalogLastUpdated: string | null;
  unpricedItems: Array<{
    itemId: string;
    extractedName: string;
    reason: string;
    status: string;
  }>;
  summaryBannerText: string;
}

export interface PrescriptionIntelligenceResult {
  prescriptionId: string;
  createdAt: string;
  updatedAt: string;
  imageQuality: {
    status: "clear" | "partially_readable" | "unreadable";
    reasons: string[];
  };
  prescriptionMetadata: {
    patientName: string | null;
    doctorName: string | null;
    prescriptionDate: string | null;
    diagnosisOrNotes: string | null;
  };
  items: PrescriptionMedicineIntelligenceItem[];
  summary: PrescriptionFinancialSummary;
  rawOcrText: string | null;
  provider: string;
}

// ============================================================================
// BENGALI & CLINICAL NORMALIZATION HELPERS
// ============================================================================

const BENGALI_DIGITS: Record<string, string> = {
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

const BENGALI_BRAND_ALIASES: Record<string, string> = {
  "নাপা": "napa",
  "নাপা এক্সট্রা": "napa extra",
  "নাপা এক্সটেন্ড": "napa extend",
  "এইস": "ace",
  "এইস প্লাস": "ace plus",
  "সেকলো": "seclo",
  "সার্জেল": "sergel",
  "ম্যাক্সপ্রো": "maxpro",
  "প্যানটোনিক্স": "pantonix",
  "ফেক্সো": "fexo",
  "ফেনাডিন": "fenadin",
  "মোনাস": "monas",
  "মন্টিন": "montene",
  "জিমেক্স": "zimax",
  "জিম্যাক্স": "zimax",
  "এজিথ্রোমাইসিন": "azithromycin",
  "প্যারাসিটামল": "paracetamol",
  "ওমিপ্রাজল": "omeprazole",
  "ইসোমিপ্রাজল": "esomeprazole",
  "অ্যামোক্সিসিলিন": "amoxicillin",
  "সেফিক্সিম": "cefixime",
  "সেফুরক্সিম": "cefuroxime",
  "সিপ্রোফ্লক্সাসিন": "ciprofloxacin",
  "মেট্রোনিডাজল": "metronidazole",
  "ফ্লুক্লক্সাসিলিন": "flucloxacillin",
  "লোসার্টান": "losartan",
  "অ্যামলোডিপিন": "amlodipine",
  "বিসোপ্রোলল": "bisoprolol",
  "মেটফরমিন": "metformin",
  "ক্যালবো": "calbo",
  "কোরালক্যাল": "coralcal",
  "ওরস্যালাইন": "orsaline",
  "অ্যালার্ট্রল": "alatrol",
  "আলাট্রল": "alatrol",
  "টافনিল": "tufnil",
  "টাফনিল": "tufnil",
  "রিসেট": "reset",
  "ফিনিক্স": "finix",
  "নেক্সাম": "nexum",
  "লোসেকটিল": "losectil",
};

const COMMON_OCR_TYPO_ALIASES: Record<string, string> = {
  "nappa": "napa",
  "napa500": "napa",
  "secl0": "seclo",
  "sec1o": "seclo",
  "serjel": "sergel",
  "sargel": "sergel",
  "maxpr0": "maxpro",
  "fex0": "fexo",
  "m0nas": "monas",
  "z1max": "zimax",
  "pant0nix": "pantonix",
  "a1atrol": "alatrol",
  "alatr0l": "alatrol",
  "ciprocin": "ciprocin",
  "cipr0cin": "ciprocin",
};

let cachedDiskLexicon: Record<string, string> | null = null;
function getBengaliLexicon(): Record<string, string> {
  if (cachedDiskLexicon) return cachedDiskLexicon;
  const merged: Record<string, string> = { ...BENGALI_BRAND_ALIASES };
  try {
    const p = path.join(process.cwd(), "public/data/clinical_rag_corpus.json");
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
      if (parsed.bengali_medicine_lexicon) {
        Object.assign(merged, parsed.bengali_medicine_lexicon);
      }
    }
  } catch {}
  cachedDiskLexicon = merged;
  return merged;
}

export function normalizeBengaliDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => BENGALI_DIGITS[d] || d);
}

export function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  let text = normalizeBengaliDigits(value.normalize("NFKC")).trim();
  const lexicon = getBengaliLexicon();
  for (const [bn, en] of Object.entries(lexicon)) {
    if (text.includes(bn)) {
      text = text.replaceAll(bn, en);
    }
  }
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

const FORM_PREFIX_REGEX = /^(?:tab(?:let)?s?|cap(?:sule)?s?|syp|syrup|susp(?:ension)?|inj(?:ection)?|inf(?:usion)?|drp|drops?|crm|cream|oint(?:ment)?|gel|inh(?:aler)?|neb(?:uliser)?|sach(?:et)?|supp(?:ository)?|sol(?:ution)?|lot(?:ion)?|ট্যাবলেট|ক্যাপসুল|সিরাপ|সাসপেনশন|ইনজেকশন|ড্রপ|ক্রিম|মলম)\.?\s+/i;

export function stripDosageFormPrefix(rawName: string): { cleanedName: string; inferredForm: string | null } {
  const trimmed = rawName.trim();
  const match = trimmed.match(FORM_PREFIX_REGEX);
  if (!match) return { cleanedName: trimmed, inferredForm: null };
  const prefix = match[0].replace(/[.\s]+$/, "").toLowerCase();
  const cleanedName = trimmed.slice(match[0].length).trim();
  return {
    cleanedName: cleanedName || trimmed,
    inferredForm: normalizeDosageForm(prefix),
  };
}

export function extractInlineStrengthAndCleanBrand(rawName: string): {
  brandCore: string;
  inlineStrength: string | null;
  inferredForm: string | null;
} {
  const { cleanedName, inferredForm } = stripDosageFormPrefix(rawName);
  const normalizedDigits = normalizeBengaliDigits(cleanedName);
  const strengthMatch = normalizedDigits.match(/\b(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?\s*(?:mg|mcg|g|gm|ml|iu|%)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:ml|g|mg|dose|actuation))?)\b/i);
  if (strengthMatch) {
    const inlineStrength = strengthMatch[1].trim();
    const brandCore = normalizedDigits
      .replace(strengthMatch[0], " ")
      .replace(/\b(?:tablet|capsules?|tab|cap|syrup|suspension|injection|drops?|cream|ointment|gel)\b/gi, " ")
      .replace(/[-–—,()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return { brandCore: brandCore || normalizedDigits.trim(), inlineStrength, inferredForm };
  }
  const cleanBrand = normalizedDigits
    .replace(/\b(?:tablet|capsules?|tab|cap|syrup|suspension|injection|drops?|cream|ointment|gel)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { brandCore: cleanBrand || normalizedDigits.trim(), inlineStrength: null, inferredForm };
}

export function normalizeBrandKey(name: string): string {
  const norm = normalizeText(name)
    .replace(FORM_PREFIX_REGEX, "")
    .replace(/\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|gm|ml|iu|%))\b/gi, "")
    .replace(/[^a-z0-9\u0980-\u09ff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return COMMON_OCR_TYPO_ALIASES[norm] || norm;
}

export function normalizeStrength(strength: string | null | undefined): string {
  if (!strength) return "";
  return normalizeBengaliDigits(String(strength))
    .toLowerCase()
    .replace(/microgram|μg/g, "mcg")
    .replace(/gram\b|gm\b/g, "g")
    .replace(/\s+/g, "")
    .replace(/\.0+(?=[a-z]|$)/g, "")
    .trim();
}

export function normalizeDosageForm(form: string | null | undefined): string {
  if (!form) return "";
  const f = normalizeText(form);
  if (!f) return "";
  if (/(?:\b(?:tab|tablet)\b|ট্যাবলেট|বড়ি)/i.test(f)) return "tablet";
  if (/(?:\b(?:cap|capsule)\b|ক্যাপসুল)/i.test(f)) return "capsule";
  if (/(?:\b(?:syp|syrup)\b|সিরাপ)/i.test(f)) return "syrup";
  if (/(?:\b(?:susp|suspension)\b|সাসপেনশন)/i.test(f)) return "suspension";
  if (/(?:\b(?:inj|injection|iv|im|sc|infusion)\b|ইনজেকশন)/i.test(f)) return "injection";
  if (/(?:\b(?:drop|drops)\b|ড্রপ)/i.test(f)) return "drops";
  if (/(?:\b(?:crm|cream)\b|ক্রিম)/i.test(f)) return "cream";
  if (/(?:\b(?:oint|ointment)\b|মলম)/i.test(f)) return "ointment";
  if (/(?:\bgel\b|জেল)/i.test(f)) return "gel";
  if (/(?:\b(?:inh|inhaler|cozycap|rotacap)\b|ইনহেলার)/i.test(f)) return "inhaler";
  if (/\b(?:neb|nebuliser|nebulizer)\b/i.test(f)) return "nebuliser";
  if (/(?:\b(?:sach|sachet|powder)\b|পাউডার|স্যাশে)/i.test(f)) return "sachet";
  if (/(?:\b(?:supp|suppository)\b|সাপোজিটরি)/i.test(f)) return "suppository";
  if (/\b(?:sol|solution|oral solution|liquid)\b/i.test(f)) return "solution";
  if (/(?:\bspray\b|স্প্রে)/i.test(f)) return "spray";
  if (/(?:\blotion\b|লোশন)/i.test(f)) return "lotion";
  return f;
}

export function areDosageFormsCompatible(prescribedForm: string, candidateForm: string): boolean {
  if (!prescribedForm || !candidateForm) return true;
  const normP = normalizeDosageForm(prescribedForm);
  const normC = normalizeDosageForm(candidateForm);
  if (normP === normC) return true;
  if (candidateForm.toLowerCase().includes(normP) || normP.includes(normC)) return true;
  // Liquid oral equivalence when doctor writes "Syrup" for oral suspension/solution
  const liquidOral = new Set(["syrup", "suspension", "solution"]);
  if (liquidOral.has(normP) && liquidOral.has(normC)) return true;
  return false;
}

export function areStrengthsCompatible(prescribedStrength: string, candidateStrength: string): {
  exact: boolean;
  compatible: boolean;
} {
  const normP = normalizeStrength(prescribedStrength);
  const normC = normalizeStrength(candidateStrength);
  if (!normP || !normC) return { exact: false, compatible: true };
  if (normP === normC) return { exact: true, compatible: true };
  // Check primary numeric + unit prefix, e.g. "500mg" vs "500mg/5ml"
  if (normC.startsWith(normP) || normP.startsWith(normC)) {
    const numP = normP.match(/^\d+(?:\.\d+)?[a-z%]+/)?.[0];
    const numC = normC.match(/^\d+(?:\.\d+)?[a-z%]+/)?.[0];
    if (numP && numC && numP === numC) {
      return { exact: true, compatible: true };
    }
  }
  return { exact: false, compatible: false };
}

// ============================================================================
// CATALOG INDEXING & VERIFIED PRICE PARSER
// ============================================================================

interface CatalogIndex {
  generatedAt: string | null;
  all: MatchedDatabaseMedicine[];
  byId: Map<string, MatchedDatabaseMedicine>;
  byExactBrand: Map<string, MatchedDatabaseMedicine[]>;
  byBrandCore: Map<string, MatchedDatabaseMedicine[]>;
  byGeneric: Map<string, MatchedDatabaseMedicine[]>;
}

let cachedIndex: CatalogIndex | null = null;
let cachedIndexGeneratedAt: string | null = null;

function parseVerifiedPrices(packageContainer?: string, packageSize?: string): {
  unitPrice: number | null;
  packPrice: number | null;
  packUnitCount: number | null;
  effectiveUnitPrice: number | null;
  priceBasis: "unit" | "pack" | null;
  priceAvailable: boolean;
} {
  const containerStr = String(packageContainer || "");
  const sizeStr = String(packageSize || "");
  const combined = `${containerStr} ${sizeStr}`;

  // 1. Explicit Unit Price: ৳ X.XX
  const unitMatch = containerStr.match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  const unitPrice = unitMatch ? Number(unitMatch[1].replace(/,/g, "")) : null;
  const validUnitPrice = unitPrice !== null && Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : null;

  // 2. Pack / Bottle / Container Price
  let packPrice: number | null = null;
  const sizePriceMatch = sizeStr.match(/৳\s*([\d,]+(?:\.\d{1,2})?)/);
  if (sizePriceMatch) {
    const p = Number(sizePriceMatch[1].replace(/,/g, ""));
    if (Number.isFinite(p) && p > 0) packPrice = p;
  } else {
    // Check non-unit price in container string (e.g., "100 ml bottle: ৳ 65.00" or "(30's pack: ৳ 36.00)")
    const withoutUnit = containerStr.replace(/Unit\s+Price:\s*৳\s*[\d,]+(?:\.\d{1,2})?/gi, "");
    const containerPackMatch = withoutUnit.match(/৳\s*([\d,]+(?:\.\d{1,2})?)/);
    if (containerPackMatch) {
      const p = Number(containerPackMatch[1].replace(/,/g, ""));
      if (Number.isFinite(p) && p > 0) packPrice = p;
    }
  }

  // 3. Extract pack unit count (e.g. "30's pack", "10x10", "14 tablets")
  let packUnitCount: number | null = null;
  const packCountMatch = combined.match(/(\d+)\s*'s\s*pack/i) || combined.match(/(\d+)\s*(?:tablets?|capsules?|sachets?|ampoules?|vials?|strips?)/i);
  if (packCountMatch) {
    const c = Number(packCountMatch[1]);
    if (Number.isFinite(c) && c > 0) packUnitCount = c;
  }

  // Determine effective unit price
  let effectiveUnitPrice: number | null = validUnitPrice;
  let priceBasis: "unit" | "pack" | null = validUnitPrice !== null ? "unit" : null;

  if (effectiveUnitPrice === null && packPrice !== null) {
    if (packUnitCount && packUnitCount > 1) {
      effectiveUnitPrice = Number((packPrice / packUnitCount).toFixed(2));
      priceBasis = "unit";
    } else {
      effectiveUnitPrice = packPrice;
      priceBasis = "pack";
    }
  }

  const priceAvailable = validUnitPrice !== null || packPrice !== null;

  return {
    unitPrice: validUnitPrice,
    packPrice,
    packUnitCount,
    effectiveUnitPrice,
    priceBasis,
    priceAvailable,
  };
}

function determineCategory(genericName: string): string {
  const generic = (genericName || "").toLowerCase();
  if (["omeprazole", "pantoprazole", "esomeprazole", "rabeprazole", "dexlansoprazole", "famotidine", "ranitidine", "antacid", "domperidone", "ondansetron"].some((k) => generic.includes(k))) return "Gastric";
  if (["paracetamol", "ibuprofen", "diclofenac", "ketorolac", "naproxen", "tramadol", "mefenamic", "aceclofenac", "etoricoxib", "tolfenamic"].some((k) => generic.includes(k))) return "Painkiller";
  if (["amoxicillin", "azithromycin", "cefixime", "cefuroxime", "ciprofloxacin", "ceftriaxone", "levofloxacin", "metronidazole", "doxycycline", "flucloxacillin", "meropenem", "cefadroxil"].some((k) => generic.includes(k))) return "Antibiotic";
  if (["cetirizine", "fexofenadine", "loratadine", "montelukast", "rupatadine", "bilastine", "levocetirizine", "salbutamol", "budesonide", "doxofylline", "ketotifen"].some((k) => generic.includes(k))) return "Allergy";
  if (["vitamin", "calcium", "zinc", "ascorbic acid", "magnesium", "cholecalciferol", "iron", "ferrous", "folic acid", "multivitamin"].some((k) => generic.includes(k))) return "Vitamins";
  if (["metformin", "sitagliptin", "linagliptin", "glimepiride", "gliclazide", "empagliflozin", "losartan", "valsartan", "olmesartan", "amlodipine", "bisoprolol", "atorvastatin", "rosuvastatin", "clopidogrel", "insulin"].some((k) => generic.includes(k))) return "Cardiac";
  return "Therapeutic";
}

export function getCatalogIndex(): CatalogIndex {
  const rawCatalog = getCatalogMedicines();
  if (cachedIndex && cachedIndexGeneratedAt === rawCatalog.generatedAt && cachedIndex.all.length > 0) {
    return cachedIndex;
  }

  const all: MatchedDatabaseMedicine[] = [];
  const byId = new Map<string, MatchedDatabaseMedicine>();
  const byExactBrand = new Map<string, MatchedDatabaseMedicine[]>();
  const byBrandCore = new Map<string, MatchedDatabaseMedicine[]>();
  const byGeneric = new Map<string, MatchedDatabaseMedicine[]>();

  for (const raw of rawCatalog.data || []) {
    const prices = parseVerifiedPrices(raw.package_container, raw.package_size);
    const med: MatchedDatabaseMedicine = {
      id: String(raw.id),
      brandName: String(raw.brand_name || "").trim(),
      genericName: String(raw.generic_name || "").trim(),
      strength: String(raw.strength || "").trim(),
      dosageForm: String(raw.dosage_form || raw.type || "Tablet").trim(),
      manufacturer: String(raw.manufacturer || "Unknown Manufacturer").trim(),
      packageSize: normalizePackageSize(raw.package_size) || null,
      packageContainer: raw.package_container ? String(raw.package_container).trim() : null,
      unitPrice: prices.unitPrice,
      packPrice: prices.packPrice,
      packUnitCount: prices.packUnitCount,
      effectiveUnitPrice: prices.effectiveUnitPrice,
      priceBasis: prices.priceBasis,
      priceAvailable: prices.priceAvailable,
      priceSource: "DGDA / MedEx Verified National Catalog",
      lastUpdated: rawCatalog.generatedAt || null,
      category: determineCategory(raw.generic_name || ""),
      slug: String(raw.slug || ""),
    };

    all.push(med);
    byId.set(med.id, med);

    const exactKey = normalizeText(med.brandName);
    if (exactKey) {
      const list = byExactBrand.get(exactKey) || [];
      list.push(med);
      byExactBrand.set(exactKey, list);
    }

    const coreKey = normalizeBrandKey(med.brandName);
    if (coreKey) {
      const list = byBrandCore.get(coreKey) || [];
      list.push(med);
      byBrandCore.set(coreKey, list);
    }

    const genKey = normalizeText(med.genericName);
    if (genKey) {
      const list = byGeneric.get(genKey) || [];
      list.push(med);
      byGeneric.set(genKey, list);
    }
  }

  cachedIndex = {
    generatedAt: rawCatalog.generatedAt || null,
    all,
    byId,
    byExactBrand,
    byBrandCore,
    byGeneric,
  };
  cachedIndexGeneratedAt = rawCatalog.generatedAt || null;
  return cachedIndex;
}

// ============================================================================
// PHASE 3 & 5: FREQUENCY, DOSAGE & DURATION PARSER
// ============================================================================

function parseSingleDoseToken(token: string): number {
  const clean = normalizeBengaliDigits(token.trim())
    .replace(/½/g, "0.5")
    .replace(/¼/g, "0.25")
    .replace(/¾/g, "0.75");
  if (!clean) return 0;
  if (/^\d+\s*\/\s*\d+$/.test(clean)) {
    const [num, den] = clean.split("/").map((n) => Number(n.trim()));
    return den > 0 ? num / den : 0;
  }
  const num = Number(clean.replace(/[^\d.]/g, ""));
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

export function parseDosageAndFrequency(
  rawFrequency: string | null | undefined,
  rawDose: string | null | undefined,
  rawInstructions: string | null | undefined,
): {
  morningDose: number | null;
  afternoonDose: number | null;
  nightDose: number | null;
  dailyDoseUnits: number | null;
  normalizedFrequencyText: string | null;
  isPrn: boolean;
} {
  const combined = normalizeBengaliDigits(
    [rawFrequency, rawDose, rawInstructions].filter(Boolean).join(" ")
  ).trim();

  if (!combined) {
    return {
      morningDose: null,
      afternoonDose: null,
      nightDose: null,
      dailyDoseUnits: null,
      normalizedFrequencyText: null,
      isPrn: false,
    };
  }

  const isPrn = /\b(sos|prn|as\s+needed|when\s+necessary|প্রয়োজনে|প্রয়োজনে|ব্যথা\s+হলে|জ্বর\s+থাকলে)\b/i.test(combined);

  // Pattern 1: M+A+N or M-A-N (e.g. 1+1+1, 1+0+1, 0+0+1, 1/2+0+1/2, 1+1+1+1)
  const tripletMatch = combined.match(
    /\b(\d+(?:\/\d+|\.\d+)?|[½¼¾])\s*[+\-]\s*(\d+(?:\/\d+|\.\d+)?|[½¼¾])\s*[+\-]\s*(\d+(?:\/\d+|\.\d+)?|[½¼¾])(?:\s*[+\-]\s*(\d+(?:\/\d+|\.\d+)?|[½¼¾]))?\b/
  );
  if (tripletMatch) {
    const m = parseSingleDoseToken(tripletMatch[1]);
    const a = parseSingleDoseToken(tripletMatch[2]);
    const n = parseSingleDoseToken(tripletMatch[3]);
    const fourth = tripletMatch[4] ? parseSingleDoseToken(tripletMatch[4]) : 0;
    const total = Number((m + a + n + fourth).toFixed(2));
    return {
      morningDose: m,
      afternoonDose: a,
      nightDose: n,
      dailyDoseUnits: total > 0 ? total : null,
      normalizedFrequencyText: tripletMatch[4] ? `${m}+${a}+${n}+${fourth}` : `${m}+${a}+${n}`,
      isPrn,
    };
  }

  // Extract dose multiplier if stated (e.g., "2 tablets", "২টি করে")
  let dosePerIntake = 1;
  const doseMultiplierMatch = combined.match(/\b(\d+(?:\.\d+)?)\s*(?:tab(?:let)?s?|cap(?:sule)?s?|টি\s*করে|টা\s*করে|চামচ|tsf)\b/i);
  if (doseMultiplierMatch) {
    const parsedMult = Number(doseMultiplierMatch[1]);
    if (Number.isFinite(parsedMult) && parsedMult > 0 && parsedMult <= 10) {
      dosePerIntake = parsedMult;
    }
  }

  // Pattern 2: Standard clinical shorthand (OD, BD/BID, TDS/TID, QID/QDS, HS)
  if (/\b(qid|qds|4\s*times\s*(?:a\s*day|daily)|every\s*6\s*hours?|দিনে\s*৪\s*বার|চারবার)\b/i.test(combined)) {
    return {
      morningDose: dosePerIntake,
      afternoonDose: dosePerIntake,
      nightDose: dosePerIntake * 2,
      dailyDoseUnits: dosePerIntake * 4,
      normalizedFrequencyText: `${dosePerIntake}+${dosePerIntake}+${dosePerIntake}+${dosePerIntake}`,
      isPrn,
    };
  }
  if (/\b(tds|tid|3\s*times\s*(?:a\s*day|daily)|thrice\s*daily|every\s*8\s*hours?|দিনে\s*৩\s*বার|তিনবার)\b/i.test(combined)) {
    return {
      morningDose: dosePerIntake,
      afternoonDose: dosePerIntake,
      nightDose: dosePerIntake,
      dailyDoseUnits: dosePerIntake * 3,
      normalizedFrequencyText: `${dosePerIntake}+${dosePerIntake}+${dosePerIntake}`,
      isPrn,
    };
  }
  if (/\b(bd|bid|2\s*times\s*(?:a\s*day|daily)|twice\s*daily|every\s*12\s*hours?|দিনে\s*২\s*বার|দুইবার|সকালে\s*ও\s*রাতে)\b/i.test(combined)) {
    return {
      morningDose: dosePerIntake,
      afternoonDose: 0,
      nightDose: dosePerIntake,
      dailyDoseUnits: dosePerIntake * 2,
      normalizedFrequencyText: `${dosePerIntake}+0+${dosePerIntake}`,
      isPrn,
    };
  }
  if (/\b(hs|at\s*bedtime|every\s*night|রাতে\s*১\s*বার|শুধু\s*রাতে)\b/i.test(combined)) {
    return {
      morningDose: 0,
      afternoonDose: 0,
      nightDose: dosePerIntake,
      dailyDoseUnits: dosePerIntake,
      normalizedFrequencyText: `0+0+${dosePerIntake}`,
      isPrn,
    };
  }
  if (/\b(od|qd|once\s*(?:a\s*day|daily)|daily|every\s*24\s*hours?|দিনে\s*১\s*বার|একবার|প্রতিদিন\s*১টি)\b/i.test(combined)) {
    return {
      morningDose: dosePerIntake,
      afternoonDose: 0,
      nightDose: 0,
      dailyDoseUnits: dosePerIntake,
      normalizedFrequencyText: `${dosePerIntake}+0+0`,
      isPrn,
    };
  }

  return {
    morningDose: null,
    afternoonDose: null,
    nightDose: null,
    dailyDoseUnits: null,
    normalizedFrequencyText: rawFrequency ? String(rawFrequency).trim() : null,
    isPrn,
  };
}

export function parseDurationToDays(rawDuration: string | null | undefined): {
  durationDays: number | null;
  normalizedDurationText: string | null;
} {
  if (!rawDuration) return { durationDays: null, normalizedDurationText: null };
  const clean = normalizeBengaliDigits(String(rawDuration)).trim();
  if (!clean) return { durationDays: null, normalizedDurationText: null };

  // Days: "5 days", "7 d", "১০ দিন", "5দিন"
  const dayMatch = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:days?|d\b|দিন|রোজ)/i);
  if (dayMatch) {
    const days = Math.round(Number(dayMatch[1]));
    if (Number.isFinite(days) && days > 0 && days <= 3650) {
      return { durationDays: days, normalizedDurationText: `${days} days` };
    }
  }

  // Weeks: "2 weeks", "1 wk", "২ সপ্তাহ"
  const weekMatch = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:weeks?|wks?|সপ্তাহ)/i);
  if (weekMatch) {
    const weeks = Number(weekMatch[1]);
    if (Number.isFinite(weeks) && weeks > 0 && weeks <= 520) {
      const days = Math.round(weeks * 7);
      return { durationDays: days, normalizedDurationText: `${days} days (${weeks} weeks)` };
    }
  }

  // Months: "1 month", "2 mos", "১ মাস"
  const monthMatch = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:months?|mos?|মাস)/i);
  if (monthMatch) {
    const months = Number(monthMatch[1]);
    if (Number.isFinite(months) && months > 0 && months <= 120) {
      const days = Math.round(months * 30);
      return { durationDays: days, normalizedDurationText: `${days} days (${months} month${months > 1 ? "s" : ""})` };
    }
  }

  // Pure number when placed in the duration field (e.g. "5" or "7")
  if (/^\d+$/.test(clean)) {
    const days = Number(clean);
    if (days > 0 && days <= 365) {
      return { durationDays: days, normalizedDurationText: `${days} days` };
    }
  }

  // Stat / Single dose
  if (/\b(stat|single\s*dose|এক\s*ডোজ)\b/i.test(clean)) {
    return { durationDays: 1, normalizedDurationText: "1 day (single dose)" };
  }

  return { durationDays: null, normalizedDurationText: clean };
}

export function isSingleContainerDosageForm(dosageForm: string | null | undefined): boolean {
  const norm = normalizeDosageForm(dosageForm);
  return ["syrup", "suspension", "drops", "cream", "ointment", "gel", "inhaler", "solution", "spray", "lotion"].includes(norm);
}

// ============================================================================
// PHASE 4: 9-STAGE INTELLIGENT MEDICINE DATABASE MATCHING ENGINE
// ============================================================================

function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const lenA = a.length;
  const lenB = b.length;
  if (Math.abs(lenA - lenB) > Math.max(lenA, lenB) * 0.6) return 0;

  // Levenshtein distance
  const matrix: number[][] = Array.from({ length: lenA + 1 }, (_, i) => [i]);
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const distance = matrix[lenA][lenB];
  return Math.max(0, 1 - distance / Math.max(lenA, lenB));
}

export function matchMedicineAgainstDatabase(extracted: ExtractedPrescriptionMedicine): {
  matchStatus: MatchStatus;
  matchConfidence: number;
  matchStage: string;
  matchReason: string;
  matchedMedicine: MatchedDatabaseMedicine | null;
  candidateMatches: MatchedDatabaseMedicine[];
  genericAlternatives: AlternativeMedicineOption[];
} {
  const index = getCatalogIndex();

  // Manual override if user explicitly selected a database medicine ID
  if (extracted.selectedDatabaseMedicineId) {
    const manualMed = index.byId.get(String(extracted.selectedDatabaseMedicineId));
    if (manualMed) {
      return {
        matchStatus: "EXACT_MATCH",
        matchConfidence: 1.0,
        matchStage: "MANUAL_USER_SELECTION",
        matchReason: "Manually verified and selected from the Oxpecker AI database.",
        matchedMedicine: manualMed,
        candidateMatches: [manualMed],
        genericAlternatives: buildGenericAlternatives(manualMed, index),
      };
    }
  }

  const rawBrand = extracted.brandName || "";
  const rawGeneric = extracted.genericName || "";
  const { brandCore, inlineStrength, inferredForm } = extractInlineStrengthAndCleanBrand(rawBrand);

  const effectiveStrength = extracted.strength || inlineStrength || "";
  const effectiveForm = extracted.dosageForm || inferredForm || "";
  const effectiveManufacturer = extracted.manufacturer || "";

  const exactBrandKey = normalizeText(brandCore || rawBrand);
  const normBrandKey = normalizeBrandKey(brandCore || rawBrand);
  const normGenericKey = normalizeText(rawGeneric);

  if (!exactBrandKey && !normBrandKey && !normGenericKey) {
    return {
      matchStatus: "NOT_FOUND",
      matchConfidence: 0,
      matchStage: "EMPTY_EXTRACTION",
      matchReason: "Medicine not found in the Oxpecker AI database.",
      matchedMedicine: null,
      candidateMatches: [],
      genericAlternatives: [],
    };
  }

  // Gather candidate pool across stages
  const directBrandCandidates =
    index.byExactBrand.get(exactBrandKey) ||
    index.byBrandCore.get(normBrandKey) ||
    [];

  // Stage 1 & 2: Exact or Normalized Brand Name exists in catalog
  if (directBrandCandidates.length > 0) {
    // Score each candidate with strict Strength, Dosage Form, and Manufacturer gates
    const scored = directBrandCandidates.map((cand) => {
      const strengthCheck = areStrengthsCompatible(effectiveStrength, cand.strength);
      const formCompatible = areDosageFormsCompatible(effectiveForm, cand.dosageForm);
      const exactForm =
        Boolean(effectiveForm) &&
        normalizeDosageForm(effectiveForm) === normalizeDosageForm(cand.dosageForm);
      const mfgMatch =
        Boolean(effectiveManufacturer) &&
        normalizeText(cand.manufacturer).includes(normalizeText(effectiveManufacturer));

      let score = 0.70;
      if (normalizeText(cand.brandName) === exactBrandKey) score += 0.10;
      else score += 0.06;

      if (effectiveStrength) {
        if (strengthCheck.exact) score += 0.12;
        else if (!strengthCheck.compatible) score -= 0.35; // Strict penalty for mismatched strength!
      }

      if (effectiveForm) {
        if (exactForm) score += 0.06;
        else if (!formCompatible) score -= 0.30; // Strict penalty for mismatched dosage form!
      }

      if (mfgMatch) score += 0.03;
      if (cand.priceAvailable) score += 0.01;

      return { cand, score, strengthCheck, formCompatible, exactForm };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    // Check if strength or form explicitly conflicted
    if (effectiveStrength && !best.strengthCheck.compatible) {
      return {
        matchStatus: "NEEDS_MANUAL_VERIFICATION",
        matchConfidence: 0.48,
        matchStage: "STAGE_4_STRENGTH_MISMATCH",
        matchReason: `Brand "${best.cand.brandName}" exists in database, but prescribed strength "${effectiveStrength}" does not match available strength "${best.cand.strength}". Manual verification required.`,
        matchedMedicine: best.cand,
        candidateMatches: scored.slice(0, 6).map((s) => s.cand),
        genericAlternatives: buildGenericAlternatives(best.cand, index),
      };
    }

    if (effectiveForm && !best.formCompatible) {
      return {
        matchStatus: "NEEDS_MANUAL_VERIFICATION",
        matchConfidence: 0.52,
        matchStage: "STAGE_5_FORM_MISMATCH",
        matchReason: `Brand "${best.cand.brandName}" exists in database, but prescribed dosage form "${effectiveForm}" differs from database form "${best.cand.dosageForm}". Manual verification required.`,
        matchedMedicine: best.cand,
        candidateMatches: scored.slice(0, 6).map((s) => s.cand),
        genericAlternatives: buildGenericAlternatives(best.cand, index),
      };
    }

    // If no strength was provided on prescription, check if multiple strengths exist for this brand
    const uniqueStrengthsForBrand = new Set(
      directBrandCandidates
        .filter((c) => areDosageFormsCompatible(effectiveForm, c.dosageForm))
        .map((c) => normalizeStrength(c.strength))
        .filter(Boolean)
    );

    if (!effectiveStrength && uniqueStrengthsForBrand.size > 1) {
      return {
        matchStatus: "NEEDS_MANUAL_VERIFICATION",
        matchConfidence: 0.68,
        matchStage: "STAGE_4_AMBIGUOUS_STRENGTH",
        matchReason: `Brand "${best.cand.brandName}" has multiple strengths in the database (${Array.from(uniqueStrengthsForBrand).slice(0, 4).join(", ")}). Please verify strength against the prescription.`,
        matchedMedicine: best.cand,
        candidateMatches: scored.slice(0, 6).map((s) => s.cand),
        genericAlternatives: buildGenericAlternatives(best.cand, index),
      };
    }

    // If OCR confidence itself is very low, flag for manual verification
    if (extracted.requiresManualVerification || extracted.medicineNameConfidence < 0.6) {
      return {
        matchStatus: "NEEDS_MANUAL_VERIFICATION",
        matchConfidence: Math.min(0.74, Number(best.score.toFixed(2))),
        matchStage: "LOW_OCR_CONFIDENCE_GATE",
        matchReason: "Matched candidate found, but OCR handwriting confidence is low. Please verify against the prescription image.",
        matchedMedicine: best.cand,
        candidateMatches: scored.slice(0, 6).map((s) => s.cand),
        genericAlternatives: buildGenericAlternatives(best.cand, index),
      };
    }

    const finalConfidence = Math.min(0.99, Number(best.score.toFixed(2)));
    const isExact =
      normalizeText(best.cand.brandName) === exactBrandKey &&
      (best.strengthCheck.exact || !effectiveStrength || uniqueStrengthsForBrand.size <= 1) &&
      (best.exactForm || !effectiveForm);

    return {
      matchStatus: isExact ? "EXACT_MATCH" : "STRONG_MATCH",
      matchConfidence: finalConfidence,
      matchStage: isExact ? "STAGE_1_EXACT_BRAND_STRENGTH_FORM" : "STAGE_2_NORMALIZED_BRAND_MATCH",
      matchReason: isExact
        ? `Exact match on brand (${best.cand.brandName}), strength (${best.cand.strength || "standard"}), and dosage form (${best.cand.dosageForm}).`
        : `Strong match on normalized brand (${best.cand.brandName}) with compatible strength and dosage form.`,
      matchedMedicine: best.cand,
      candidateMatches: scored.slice(0, 6).map((s) => s.cand),
      genericAlternatives: buildGenericAlternatives(best.cand, index),
    };
  }

  // Stage 3: Generic-Name Prescribed Directly (when doctor writes Generic instead of Brand, or Brand == Generic)
  const genericLookupKey = normGenericKey || exactBrandKey;
  const genericCandidates = index.byGeneric.get(genericLookupKey) || [];
  if (genericCandidates.length > 0 && (!rawBrand || normalizeText(rawBrand) === genericLookupKey)) {
    const filtered = genericCandidates.filter((cand) => {
      const sCheck = areStrengthsCompatible(effectiveStrength, cand.strength);
      const fCheck = areDosageFormsCompatible(effectiveForm, cand.dosageForm);
      return sCheck.compatible && fCheck;
    });

    if (filtered.length > 0) {
      const exactStrengthFiltered = effectiveStrength
        ? filtered.filter((c) => areStrengthsCompatible(effectiveStrength, c.strength).exact)
        : filtered;
      const pool = exactStrengthFiltered.length > 0 ? exactStrengthFiltered : filtered;
      // Sort priced items first
      pool.sort((a, b) => (b.priceAvailable ? 1 : 0) - (a.priceAvailable ? 1 : 0));
      const bestGeneric = pool[0];
      return {
        matchStatus: effectiveStrength ? "STRONG_MATCH" : "NEEDS_MANUAL_VERIFICATION",
        matchConfidence: effectiveStrength ? 0.85 : 0.65,
        matchStage: "STAGE_3_GENERIC_FORMULATION_MATCH",
        matchReason: `Prescribed by generic name (${bestGeneric.genericName}). Matched verified formulation ${bestGeneric.brandName} (${bestGeneric.strength} ${bestGeneric.dosageForm}).`,
        matchedMedicine: bestGeneric,
        candidateMatches: pool.slice(0, 6),
        genericAlternatives: buildGenericAlternatives(bestGeneric, index),
      };
    }
  }

  // Stage 7 & 8: Prefix, Substring & Fuzzy Levenshtein Matching with Strict Strength + Form Verification
  if (normBrandKey.length >= 3) {
    const fuzzyScored: Array<{ cand: MatchedDatabaseMedicine; similarity: number; totalScore: number }> = [];

    for (const [brandKey, meds] of index.byBrandCore.entries()) {
      // Quick filter before Levenshtein
      let sim = 0;
      if (brandKey.startsWith(normBrandKey) || normBrandKey.startsWith(brandKey)) {
        const ratio = Math.min(brandKey.length, normBrandKey.length) / Math.max(brandKey.length, normBrandKey.length);
        sim = Math.max(0.78, ratio);
      } else if (Math.abs(brandKey.length - normBrandKey.length) <= 3 && brandKey[0] === normBrandKey[0]) {
        sim = stringSimilarity(normBrandKey, brandKey);
      }

      if (sim >= 0.72) {
        for (const cand of meds) {
          const sCheck = areStrengthsCompatible(effectiveStrength, cand.strength);
          const fCheck = areDosageFormsCompatible(effectiveForm, cand.dosageForm);

          // Rule: Never match medicines using name similarity alone when strength or form conflicts
          if (effectiveStrength && !sCheck.compatible) continue;
          if (effectiveForm && !fCheck) continue;

          let totalScore = sim * 0.75;
          if (effectiveStrength && sCheck.exact) totalScore += 0.15;
          if (effectiveForm && normalizeDosageForm(effectiveForm) === normalizeDosageForm(cand.dosageForm)) {
            totalScore += 0.08;
          }
          fuzzyScored.push({ cand, similarity: sim, totalScore });
        }
      }
    }

    if (fuzzyScored.length > 0) {
      fuzzyScored.sort((a, b) => b.totalScore - a.totalScore);
      const top = fuzzyScored[0];
      const status: MatchStatus =
        top.similarity >= 0.88 && effectiveStrength && areStrengthsCompatible(effectiveStrength, top.cand.strength).exact
          ? "STRONG_MATCH"
          : top.similarity >= 0.80
            ? "POSSIBLE_MATCH"
            : "NEEDS_MANUAL_VERIFICATION";

      return {
        matchStatus: extracted.requiresManualVerification ? "NEEDS_MANUAL_VERIFICATION" : status,
        matchConfidence: Math.min(0.86, Number(top.totalScore.toFixed(2))),
        matchStage: "STAGE_8_FUZZY_SPELLING_AND_STRENGTH_MATCH",
        matchReason: `Matched "${extracted.brandName}" to "${top.cand.brandName}" (${top.cand.strength} ${top.cand.dosageForm}) via spelling similarity (${Math.round(top.similarity * 100)}%) and compatible strength/form.`,
        matchedMedicine: top.cand,
        candidateMatches: fuzzyScored.slice(0, 6).map((f) => f.cand),
        genericAlternatives: buildGenericAlternatives(top.cand, index),
      };
    }
  }

  // Stage 9: Not Found in Database
  return {
    matchStatus: "NOT_FOUND",
    matchConfidence: 0,
    matchStage: "STAGE_9_UNMATCHED",
    matchReason: "Medicine not found in the Oxpecker AI database.",
    matchedMedicine: null,
    candidateMatches: [],
    genericAlternatives: [],
  };
}

function buildGenericAlternatives(
  matched: MatchedDatabaseMedicine,
  index: CatalogIndex,
  limit = 6
): AlternativeMedicineOption[] {
  const genKey = normalizeText(matched.genericName);
  if (!genKey) return [];
  const sameGeneric = index.byGeneric.get(genKey) || [];
  const normS = normalizeStrength(matched.strength);
  const normF = normalizeDosageForm(matched.dosageForm);
  const baselineUnit = matched.effectiveUnitPrice;

  const alts = sameGeneric
    .filter(
      (cand) =>
        cand.id !== matched.id &&
        normalizeText(cand.brandName) !== normalizeText(matched.brandName) &&
        normalizeStrength(cand.strength) === normS &&
        normalizeDosageForm(cand.dosageForm) === normF &&
        cand.priceAvailable
    )
    .map((cand) => {
      const candPrice = cand.effectiveUnitPrice ?? cand.packPrice;
      let savings: number | null = null;
      if (baselineUnit !== null && candPrice !== null && cand.priceBasis === matched.priceBasis) {
        const diffPaisa = Math.round(baselineUnit * 100) - Math.round(candPrice * 100);
        savings = Number((diffPaisa / 100).toFixed(2));
      }
      return {
        id: cand.id,
        brandName: cand.brandName,
        genericName: cand.genericName,
        strength: cand.strength,
        dosageForm: cand.dosageForm,
        manufacturer: cand.manufacturer,
        unitPrice: cand.effectiveUnitPrice,
        packPrice: cand.packPrice,
        priceBasis: cand.priceBasis,
        savingsPerUnitBdt: savings,
      };
    });

  alts.sort((a, b) => (a.unitPrice ?? 999999) - (b.unitPrice ?? 999999));
  return alts.slice(0, limit);
}

// ============================================================================
// PHASE 5: EXACT INTEGER PAISA MEDICINE PRICE CALCULATION ENGINE
// ============================================================================

export function calculateMedicinePrice(
  extracted: ExtractedPrescriptionMedicine,
  matchStatus: MatchStatus,
  matchedMedicine: MatchedDatabaseMedicine | null
): MedicinePricingCalculation {
  const parsedFreq = parseDosageAndFrequency(
    extracted.frequency,
    extracted.dosageInstructions,
    extracted.notes
  );
  const parsedDur = parseDurationToDays(extracted.duration);

  const dailyDosageUnits =
    extracted.dailyDoseUnits !== null && extracted.dailyDoseUnits !== undefined && extracted.dailyDoseUnits > 0
      ? extracted.dailyDoseUnits
      : parsedFreq.dailyDoseUnits;

  const durationDays =
    extracted.durationDays !== null && extracted.durationDays !== undefined && extracted.durationDays > 0
      ? extracted.durationDays
      : parsedDur.durationDays;

  const formToUse = matchedMedicine?.dosageForm || extracted.dosageForm || "Tablet";
  const singleContainerForm = isSingleContainerDosageForm(formToUse);
  const quantityUnit = singleContainerForm
    ? normalizeDosageForm(formToUse) || "pack"
    : `${normalizeDosageForm(formToUse) || "unit"}s`;

  // Determine required quantity
  let requiredQuantity: number | null = null;
  if (extracted.quantity !== null && extracted.quantity !== undefined && Number.isFinite(extracted.quantity) && extracted.quantity > 0) {
    requiredQuantity = Math.ceil(extracted.quantity);
  } else if (singleContainerForm) {
    // For syrups, drops, creams, ointments, inhalers: 1 container/pack unless duration/dose explicitly requires multiple
    if (dailyDosageUnits !== null || durationDays !== null || extracted.frequency || extracted.duration) {
      requiredQuantity = 1;
    }
  } else if (dailyDosageUnits !== null && durationDays !== null && dailyDosageUnits > 0 && durationDays > 0) {
    requiredQuantity = Math.ceil(dailyDosageUnits * durationDays);
  }

  // Case 1: Unmatched medicine
  if (matchStatus === "NOT_FOUND" || !matchedMedicine) {
    return {
      dailyDosageUnits,
      durationDays,
      requiredQuantity,
      quantityUnit,
      pricingBasisUsed: "none",
      unitPriceBdt: null,
      packPriceBdt: null,
      packSizeDescription: null,
      packsRequired: null,
      lineTotalPaisa: null,
      lineTotalBdt: null,
      pricingStatus: "UNMATCHED_MEDICINE",
      statusMessage: "Medicine not found in the Oxpecker AI database.",
    };
  }

  // Case 2: Matched medicine has no verified price in the catalog
  if (!matchedMedicine.priceAvailable || (matchedMedicine.effectiveUnitPrice === null && matchedMedicine.packPrice === null)) {
    return {
      dailyDosageUnits,
      durationDays,
      requiredQuantity,
      quantityUnit,
      pricingBasisUsed: "none",
      unitPriceBdt: null,
      packPriceBdt: null,
      packSizeDescription: matchedMedicine.packageContainer || matchedMedicine.packageSize || null,
      packsRequired: null,
      lineTotalPaisa: null,
      lineTotalBdt: null,
      pricingStatus: "PRICE_UNAVAILABLE",
      statusMessage: "Price unavailable — verification required.",
    };
  }

  const unitPriceBdt = matchedMedicine.effectiveUnitPrice ?? matchedMedicine.unitPrice;
  const packPriceBdt = matchedMedicine.packPrice;

  // Case 3: Quantity cannot be determined because frequency or duration is missing
  if (requiredQuantity === null || requiredQuantity <= 0) {
    return {
      dailyDosageUnits,
      durationDays,
      requiredQuantity: null,
      quantityUnit,
      pricingBasisUsed: matchedMedicine.priceBasis || "unit",
      unitPriceBdt,
      packPriceBdt,
      packSizeDescription: matchedMedicine.packageContainer || matchedMedicine.packageSize || null,
      packsRequired: null,
      lineTotalPaisa: null,
      lineTotalBdt: null,
      pricingStatus: "QUANTITY_REQUIRED",
      statusMessage: `Unit price ৳${(unitPriceBdt ?? packPriceBdt ?? 0).toFixed(2)} verified — enter quantity or duration to calculate total.`,
    };
  }

  // Case 4: Exact minor-unit (paisa) calculation
  const effectiveRateBdt = singleContainerForm
    ? (packPriceBdt ?? unitPriceBdt)!
    : (unitPriceBdt ?? packPriceBdt)!;

  const ratePaisa = Math.round(effectiveRateBdt * 100);
  const lineTotalPaisa = Math.round(ratePaisa * requiredQuantity);
  const lineTotalBdt = Number((lineTotalPaisa / 100).toFixed(2));

  const packsRequired =
    matchedMedicine.packUnitCount && matchedMedicine.packUnitCount > 0
      ? Math.ceil(requiredQuantity / matchedMedicine.packUnitCount)
      : singleContainerForm
        ? requiredQuantity
        : null;

  const needsVerification = matchStatus === "NEEDS_MANUAL_VERIFICATION" || matchStatus === "POSSIBLE_MATCH";

  return {
    dailyDosageUnits,
    durationDays,
    requiredQuantity,
    quantityUnit,
    pricingBasisUsed: singleContainerForm ? "pack" : (matchedMedicine.priceBasis || "unit"),
    unitPriceBdt: effectiveRateBdt,
    packPriceBdt,
    packSizeDescription: matchedMedicine.packageContainer || matchedMedicine.packageSize || null,
    packsRequired,
    lineTotalPaisa,
    lineTotalBdt,
    pricingStatus: needsVerification ? "VERIFICATION_REQUIRED" : "VERIFIED_PRICED",
    statusMessage: needsVerification
      ? `Estimated ৳${lineTotalBdt.toFixed(2)} (${requiredQuantity} × ৳${effectiveRateBdt.toFixed(2)}) — confirm medicine match to finalize.`
      : `Verified: ${requiredQuantity} × ৳${effectiveRateBdt.toFixed(2)} = ৳${lineTotalBdt.toFixed(2)}`,
  };
}

// ============================================================================
// END-TO-END PRESCRIPTION EVALUATION PIPELINE
// ============================================================================

function confidenceLabelToScore(label: unknown, hasValue: boolean): number {
  if (!hasValue) return 0;
  if (typeof label === "number" && Number.isFinite(label)) {
    return Math.max(0, Math.min(1, label));
  }
  if (label === "clear") return 0.94;
  if (label === "uncertain") return 0.65;
  if (label === "illegible") return 0.25;
  return 0.80;
}

export function normalizeRawExtractedMedicine(
  raw: any,
  index: number
): ExtractedPrescriptionMedicine {
  const rawName = typeof raw?.brandName === "string" ? raw.brandName.trim() : (typeof raw?.medicine === "string" ? raw.medicine.trim() : "");
  const { brandCore, inlineStrength, inferredForm } = extractInlineStrengthAndCleanBrand(rawName);

  const brandName = brandCore || rawName || null;
  const genericName = typeof raw?.genericName === "string" && raw.genericName.trim() ? raw.genericName.trim() : null;
  const strength = (typeof raw?.strength === "string" && raw.strength.trim() ? raw.strength.trim() : inlineStrength) || null;
  const dosageForm = (typeof raw?.dosageForm === "string" && raw.dosageForm.trim() ? raw.dosageForm.trim() : inferredForm) || null;
  const manufacturer = typeof raw?.manufacturer === "string" && raw.manufacturer.trim() ? raw.manufacturer.trim() : null;
  const dosageInstructions =
    (typeof raw?.dosageInstructions === "string" && raw.dosageInstructions.trim()) ||
    (typeof raw?.instructionsTranscribed === "string" && raw.instructionsTranscribed.trim()) ||
    (typeof raw?.dose === "string" && raw.dose.trim()) ||
    null;
  const rawFrequency = typeof raw?.frequency === "string" && raw.frequency.trim() ? raw.frequency.trim() : null;
  const rawDuration = typeof raw?.duration === "string" && raw.duration.trim() ? raw.duration.trim() : null;

  const parsedFreq = parseDosageAndFrequency(rawFrequency, raw?.dose, dosageInstructions);
  const parsedDur = parseDurationToDays(rawDuration || dosageInstructions);

  const explicitMorning = typeof raw?.morningDose === "number" ? raw.morningDose : parsedFreq.morningDose;
  const explicitAfternoon = typeof raw?.afternoonDose === "number" ? raw.afternoonDose : parsedFreq.afternoonDose;
  const explicitNight = typeof raw?.nightDose === "number" ? raw.nightDose : parsedFreq.nightDose;

  const dailyDoseUnits =
    typeof raw?.dailyDoseUnits === "number" && raw.dailyDoseUnits > 0
      ? raw.dailyDoseUnits
      : explicitMorning !== null || explicitAfternoon !== null || explicitNight !== null
        ? Number(((explicitMorning || 0) + (explicitAfternoon || 0) + (explicitNight || 0)).toFixed(2))
        : parsedFreq.dailyDoseUnits;

  const durationDays =
    typeof raw?.durationDays === "number" && raw.durationDays > 0
      ? raw.durationDays
      : parsedDur.durationDays;

  let quantity: number | null = null;
  if (typeof raw?.quantity === "number" && Number.isFinite(raw.quantity) && raw.quantity > 0) {
    quantity = Math.ceil(raw.quantity);
  } else if (typeof raw?.estimatedQuantity === "number" && Number.isFinite(raw.estimatedQuantity) && raw.estimatedQuantity > 0) {
    quantity = Math.ceil(raw.estimatedQuantity);
  } else if (dailyDoseUnits !== null && durationDays !== null && dailyDoseUnits > 0 && durationDays > 0 && !isSingleContainerDosageForm(dosageForm)) {
    quantity = Math.ceil(dailyDoseUnits * durationDays);
  } else if (isSingleContainerDosageForm(dosageForm) && (dailyDoseUnits !== null || durationDays !== null || rawFrequency || rawDuration)) {
    quantity = 1;
  }

  const ocrConfidence =
    typeof raw?.ocrConfidence === "number"
      ? raw.ocrConfidence
      : confidenceLabelToScore(raw?.confidence, Boolean(brandName || genericName));

  const medicineNameConfidence =
    typeof raw?.medicineNameConfidence === "number"
      ? raw.medicineNameConfidence
      : confidenceLabelToScore(raw?.fieldConfidence?.brandName ?? raw?.confidence, Boolean(brandName || genericName));

  const strengthConfidence =
    typeof raw?.strengthConfidence === "number"
      ? raw.strengthConfidence
      : confidenceLabelToScore(raw?.fieldConfidence?.strength ?? raw?.confidence, Boolean(strength));

  const requiresManualVerification =
    raw?.requiresManualVerification === true ||
    ocrConfidence < 0.65 ||
    medicineNameConfidence < 0.65 ||
    (!brandName && !genericName);

  return {
    id: typeof raw?.id === "string" && raw.id ? raw.id : `med-item-${index + 1}`,
    brandName,
    genericName,
    strength,
    dosageForm,
    manufacturer,
    dosageInstructions,
    frequency: parsedFreq.normalizedFrequencyText || rawFrequency,
    morningDose: explicitMorning,
    afternoonDose: explicitAfternoon,
    nightDose: explicitNight,
    dailyDoseUnits,
    duration: parsedDur.normalizedDurationText || rawDuration,
    durationDays,
    quantity,
    quantityUnit: isSingleContainerDosageForm(dosageForm) ? (normalizeDosageForm(dosageForm) || "pack") : "units",
    notes: typeof raw?.notes === "string" ? raw.notes : (typeof raw?.evidence === "string" ? raw.evidence : null),
    ocrConfidence: Number(ocrConfidence.toFixed(2)),
    medicineNameConfidence: Number(medicineNameConfidence.toFixed(2)),
    strengthConfidence: Number(strengthConfidence.toFixed(2)),
    extractionStatus: raw?.extractionStatus || (requiresManualVerification ? "LOW_CONFIDENCE" : "EXTRACTED"),
    requiresManualVerification,
    selectedDatabaseMedicineId: raw?.selectedDatabaseMedicineId || null,
  };
}

export function buildPrescriptionIntelligence(params: {
  prescriptionId: string;
  createdAt?: string;
  rawMedicines: any[];
  imageQuality?: { status?: "clear" | "partially_readable" | "unreadable"; reasons?: string[] };
  metadata?: {
    patientName?: string | null;
    doctorName?: string | null;
    prescriptionDate?: string | null;
    diagnosisOrNotes?: string | null;
  };
  rawOcrText?: string | null;
  provider?: string;
}): PrescriptionIntelligenceResult {
  const nowIso = new Date().toISOString();
  const snapshot = getMedicineSnapshotMetadata();

  const items: PrescriptionMedicineIntelligenceItem[] = (params.rawMedicines || []).slice(0, 40).map((rawMed, idx) => {
    const extracted = normalizeRawExtractedMedicine(rawMed, idx);
    const matchResult = matchMedicineAgainstDatabase(extracted);
    const pricing = calculateMedicinePrice(extracted, matchResult.matchStatus, matchResult.matchedMedicine);

    // Back-populate calculated quantity onto extracted if resolved
    if (pricing.requiredQuantity !== null) {
      extracted.quantity = pricing.requiredQuantity;
      extracted.quantityUnit = pricing.quantityUnit;
    }

    return {
      itemId: extracted.id,
      extracted,
      matchStatus: matchResult.matchStatus,
      matchConfidence: matchResult.matchConfidence,
      matchStage: matchResult.matchStage,
      matchReason: matchResult.matchReason,
      matchedMedicine: matchResult.matchedMedicine,
      candidateMatches: matchResult.candidateMatches,
      genericAlternatives: matchResult.genericAlternatives,
      pricing,
    };
  });

  // Compute Financial Summary using integer paisa arithmetic
  let verifiedTotalPaisa = 0;
  let estimatedTotalPaisa = 0;
  let pricedMedicinesCount = 0;
  const unpricedItems: PrescriptionFinancialSummary["unpricedItems"] = [];

  let exactMatchCount = 0;
  let strongMatchCount = 0;
  let possibleMatchCount = 0;
  let notFoundCount = 0;
  let needsVerificationCount = 0;

  for (const item of items) {
    if (item.matchStatus === "EXACT_MATCH") exactMatchCount++;
    else if (item.matchStatus === "STRONG_MATCH") strongMatchCount++;
    else if (item.matchStatus === "POSSIBLE_MATCH") possibleMatchCount++;
    else if (item.matchStatus === "NOT_FOUND") notFoundCount++;
    else if (item.matchStatus === "NEEDS_MANUAL_VERIFICATION") needsVerificationCount++;

    const displayName =
      item.extracted.brandName ||
      item.extracted.genericName ||
      item.matchedMedicine?.brandName ||
      `Medicine #${item.itemId}`;

    if (item.pricing.pricingStatus === "VERIFIED_PRICED" && item.pricing.lineTotalPaisa !== null) {
      verifiedTotalPaisa += item.pricing.lineTotalPaisa;
      estimatedTotalPaisa += item.pricing.lineTotalPaisa;
      pricedMedicinesCount++;
    } else if (item.pricing.pricingStatus === "VERIFICATION_REQUIRED" && item.pricing.lineTotalPaisa !== null) {
      estimatedTotalPaisa += item.pricing.lineTotalPaisa;
      unpricedItems.push({
        itemId: item.itemId,
        extractedName: displayName,
        reason: item.pricing.statusMessage,
        status: item.pricing.pricingStatus,
      });
    } else {
      unpricedItems.push({
        itemId: item.itemId,
        extractedName: displayName,
        reason: item.pricing.statusMessage,
        status: item.pricing.pricingStatus,
      });
    }
  }

  const matchedCount = exactMatchCount + strongMatchCount + possibleMatchCount;
  const unpricedMedicinesCount = items.length - pricedMedicinesCount;
  const isCompleteCalculation = items.length > 0 && unpricedMedicinesCount === 0;

  const verifiedTotalBdt = Number((verifiedTotalPaisa / 100).toFixed(2));
  const estimatedTotalBdt = Number((estimatedTotalPaisa / 100).toFixed(2));

  const summaryBannerText =
    items.length === 0
      ? "No medicines extracted yet. Upload a clear prescription or add medicines manually."
      : isCompleteCalculation
        ? `All ${items.length} prescribed medicine(s) matched and priced against verified DGDA catalog records. Total: ৳${verifiedTotalBdt.toFixed(2)}.`
        : `Verified total for ${pricedMedicinesCount} of ${items.length} medicine(s): ৳${verifiedTotalBdt.toFixed(2)}. ${unpricedMedicinesCount} item(s) require verification or price/quantity confirmation and are excluded from the verified total.`;

  return {
    prescriptionId: params.prescriptionId,
    createdAt: params.createdAt || nowIso,
    updatedAt: nowIso,
    imageQuality: {
      status: params.imageQuality?.status || "clear",
      reasons: params.imageQuality?.reasons || [],
    },
    prescriptionMetadata: {
      patientName: params.metadata?.patientName || null,
      doctorName: params.metadata?.doctorName || null,
      prescriptionDate: params.metadata?.prescriptionDate || null,
      diagnosisOrNotes: params.metadata?.diagnosisOrNotes || null,
    },
    items,
    summary: {
      prescriptionId: params.prescriptionId,
      analyzedAt: nowIso,
      totalExtractedCount: items.length,
      matchedCount,
      exactMatchCount,
      strongMatchCount,
      possibleMatchCount,
      notFoundCount,
      needsVerificationCount,
      pricedMedicinesCount,
      unpricedMedicinesCount,
      verifiedTotalPaisa,
      verifiedTotalBdt,
      estimatedTotalPaisa,
      estimatedTotalBdt,
      isCompleteCalculation,
      currency: "BDT",
      currencySymbol: "৳",
      priceSource: "DGDA / MedEx Verified National Catalog (21,714 records)",
      catalogLastUpdated: snapshot.generatedAt || null,
      unpricedItems,
      summaryBannerText,
    },
    rawOcrText: params.rawOcrText || null,
    provider: params.provider || "Oxpecker-Prescription-Intelligence",
  };
}

// ============================================================================
// STRUCTURED EXTRACTION FROM RAW OCR LINES (ENGLISH, BENGALI & MIXED)
// ============================================================================

export function extractStructuredMedicinesFromRawOcrText(rawOcrText: string): any[] {
  if (!rawOcrText || typeof rawOcrText !== "string") return [];
  const lines = rawOcrText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 3);

  const extracted: any[] = [];
  const rxLineIndicators = /(?:^(?:\d+[\.\)]\s*|[•\-*]\s*)?(?:(?:tab(?:let)?s?|cap(?:sule)?s?|syp|syrup|susp(?:ension)?|inj(?:ection)?|drp|drops?|crm|cream|oint(?:ment)?|gel|inh(?:aler)?|neb(?:uliser)?|sach(?:et)?|supp(?:ository)?)\b|ট্যাবলেট|ক্যাপসুল|সিরাপ|সাসপেনশন|ইনজেকশন|ড্রপ|ক্রিম|মলম))|(?:\b\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%)\b)|(?:\b[0-9০-৯]+\s*\+\s*[0-9০-৯]+\s*\+\s*[0-9০-৯]+\b)/i;

  for (const rawLine of lines) {
    // Skip obvious header/footer lines
    if (/^(?:patient\s*name|doctor|dr\.|date|age|sex|gender|bp|pulse|weight|temp|diagnosis|c\/o|o\/e|rx\s*[:]?$|advice|follow\s*up|chamber|hospital|phone|reg\s*no)/i.test(rawLine)) {
      continue;
    }
    if (!rxLineIndicators.test(rawLine)) continue;

    // Clean bullet / numbering
    const withoutBullet = rawLine.replace(/^(?:\d+[\.\)]\s*|[•\-*]\s*|rx\s*[:\-]?\s*)/i, "").trim();
    const normDigitsLine = normalizeBengaliDigits(withoutBullet);

    // Extract frequency triplet or shorthand
    const freqParsed = parseDosageAndFrequency(normDigitsLine, null, null);
    // Extract duration
    const durMatch = normDigitsLine.match(/\b(\d+(?:\.\d+)?\s*(?:(?:days?|d|weeks?|wks?|months?|mos?)\b|দিন|রোজ|সপ্তাহ|মাস))/i);
    const durParsed = parseDurationToDays(durMatch ? durMatch[1] : null);

    // Strip frequency and duration from line to isolate medicine name + strength + form
    let medSegment = withoutBullet;
    // Strip duration BEFORE frequency so "1+1+1 - 5 days" is not misread as a 4-part dose
    if (durMatch) {
      medSegment = medSegment.replace(durMatch[0], " ");
      // Also strip original Bengali digit duration if present
      medSegment = medSegment.replace(/[0-9০-৯]+(?:\.[0-9০-৯]+)?\s*(?:(?:days?|d|weeks?|wks?|months?|mos?)\b|দিন|রোজ|সপ্তাহ|মাস)/i, " ");
    }
    if (freqParsed.normalizedFrequencyText) {
      medSegment = medSegment.replace(/[0-9০-৯½¼¾\/.]+\s*[+\-]\s*[0-9০-৯½¼¾\/.]+\s*[+\-]\s*[0-9০-৯½¼¾\/.]+(?:\s*[+\-]\s*[0-9০-৯½¼¾\/.]+)?/, " ");
    }
    medSegment = medSegment
      .replace(/(?:\b(?:od|bd|bid|tds|tid|qid|qds|hs|sos|prn|before\s+meals?|after\s+meals?)\b|খাবারের\s+আগে|খাবারের\s+পরে|খাবারের\s+পর|খালি\s+পেটে|ভরা\s+পেটে)/gi, " ")
      .replace(/[—–\-|,:;]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const { brandCore, inlineStrength, inferredForm } = extractInlineStrengthAndCleanBrand(medSegment);
    if (!brandCore || brandCore.length < 2) continue;

    // Extract meal / route instructions if present
    const instructionsMatch = withoutBullet.match(/(?:\b(?:before\s+meals?|after\s+meals?|with\s+food|empty\s+stomach|at\s+bedtime)\b|খাবারের\s+আগে|খাবারের\s+পরে|খাবারের\s+পর|খালি\s+পেটে|ভরা\s+পেটে|ঘুমানোর\s+আগে)/i);

    extracted.push({
      id: `ocr-line-${extracted.length + 1}`,
      brandName: brandCore,
      genericName: null,
      strength: inlineStrength,
      dosageForm: inferredForm,
      dosageInstructions: instructionsMatch ? instructionsMatch[0] : null,
      frequency: freqParsed.normalizedFrequencyText,
      morningDose: freqParsed.morningDose,
      afternoonDose: freqParsed.afternoonDose,
      nightDose: freqParsed.nightDose,
      dailyDoseUnits: freqParsed.dailyDoseUnits,
      duration: durParsed.normalizedDurationText,
      durationDays: durParsed.durationDays,
      notes: rawLine,
      ocrConfidence: 0.85,
      medicineNameConfidence: 0.85,
      strengthConfidence: inlineStrength ? 0.88 : 0.5,
      extractionStatus: "EXTRACTED",
      requiresManualVerification: false,
    });
  }

  return extracted;
}

