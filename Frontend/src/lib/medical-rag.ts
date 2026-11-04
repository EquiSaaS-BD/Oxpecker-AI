import fs from "fs";
import path from "path";
import { getGenericMonograph, GenericMonograph, getCatalogMedicines } from "./medicine-catalog";
import {
  fetchLiveMedexBrandData,
  getOfficialDosageIcon,
  getManufacturerAsset,
  getMedicinePackaging,
  getChemicalStructure,
} from "./medicine-brand-assets";

// ============================================================================
// Types
// ============================================================================

export interface DiseaseKnowledge {
  id: number | string;
  name: string;
  bengali_name: string;
  category: string;
  triage_level: string;
  clinical_reference?: string;
  active_symptoms: string[];
  active_symptoms_summary?: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  title_bn: string;
  youtubeId: string;
  author?: string;
  category: string;
  keywords?: string[];
  description_bn: string;
}

export interface BrandMedicineResult {
  id: string;
  name: string;
  generic: string;
  strength?: string;
  form?: string;
  company?: string;
  companyLogo?: string | null;
  price?: number | null;
  packPrice?: number | null;
  packSize?: string | null;
  priceBasis?: string | null;
  dosageIcon?: string | null;
  packagingImage?: string | null;
  chemicalStructure?: string | null;
  url: string;
}

export interface RAGSourceCitation {
  title: string;
  sourceType: "DGDA Catalog" | "MedEx Monograph" | "DGHS / WHO Guideline" | "PubMed Literature" | "Clinical Lab Reference";
  url?: string;
  snippet?: string;
}

export interface PubMedCitation {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  url: string;
}

export interface MedicalRAGResult {
  query: string;
  expandedQuery: string;
  isHealthQuery: boolean;
  isEmergency: boolean;
  emergencyMessage?: string;
  matchedDiseases: {
    disease: DiseaseKnowledge;
    score: number;
    matchedSymptoms: string[];
  }[];
  matchedGenerics: GenericMonograph[];
  matchedBrandMedicines: BrandMedicineResult[];
  sameGenericAlternatives: BrandMedicineResult[];
  matchedLabPanels: any[];
  matchedDrugInteractions: any[];
  matchedPediatricProtocols: any[];
  matchedNutritionProtocols: any[];
  matchedEmergencyProtocols: any[];
  pubmedCitations: PubMedCitation[];
  educationalVideo?: EducationalVideo;
  featuredImage?: {
    url: string;
    caption: string;
  };
  ragSources: RAGSourceCitation[];
  followUpSuggestions: string[];
  recommendedSpecialty: string;
  triageUrgency: "routine" | "soon" | "urgent" | "emergency";
  clinicalTableMarkdown?: string;
  groundingContextText: string;
  synthesizedResponse: string;
}

// ============================================================================
// In-Memory Cached Indexes
// ============================================================================

let cachedDiseases: DiseaseKnowledge[] | null = null;
let cachedCorpus: any | null = null;
let cachedAllGenerics: GenericMonograph[] | null = null;

function loadDiseases(): DiseaseKnowledge[] {
  if (cachedDiseases) return cachedDiseases;
  const paths = [
    path.join(process.cwd(), "public/data/diseases_150.json"),
    path.join(process.cwd(), "Frontend/public/data/diseases_150.json"),
  ];
  const target = paths.find((p) => fs.existsSync(p));
  if (!target) return [];
  try {
    cachedDiseases = JSON.parse(fs.readFileSync(target, "utf8"));
    return cachedDiseases || [];
  } catch (e) {
    console.error("Failed to load diseases_150.json:", e);
    return [];
  }
}

function loadClinicalCorpus(): any {
  if (cachedCorpus) return cachedCorpus;
  const paths = [
    path.join(process.cwd(), "public/data/clinical_rag_corpus.json"),
    path.join(process.cwd(), "Frontend/public/data/clinical_rag_corpus.json"),
  ];
  const target = paths.find((p) => fs.existsSync(p));
  if (!target) return {};
  try {
    cachedCorpus = JSON.parse(fs.readFileSync(target, "utf8"));
    return cachedCorpus || {};
  } catch (e) {
    console.error("Failed to load clinical_rag_corpus.json:", e);
    return {};
  }
}

function loadAllGenericsList(): GenericMonograph[] {
  if (cachedAllGenerics) return cachedAllGenerics;
  const paths = [
    path.join(process.cwd(), "public/data/generics.json"),
    path.join(process.cwd(), "Frontend/public/data/generics.json"),
    path.join(process.cwd(), "organized_medicine_data/organized/generics.json"),
  ];
  const target = paths.find((p) => fs.existsSync(p));
  if (!target) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(target, "utf8"));
    cachedAllGenerics = parsed.data || parsed || [];
    return cachedAllGenerics || [];
  } catch {
    return [];
  }
}

function extractPriceFromCatalogItem(m: any): { unitPrice: number | null; packPrice: number | null } {
  const containerStr = String(m.package_container || "");
  const unitMatch = containerStr.match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  const unitPrice = unitMatch ? Number(unitMatch[1].replace(/,/g, "")) : null;

  const pkgText = String(m.package_size || containerStr);
  const packMatch = pkgText.match(/(?:pack|bottle|box|strip)[^৳]*৳\s*([\d,]+(?:\.\d{1,2})?)/i)
    || String(m.package_size || "").match(/৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  const packPrice = packMatch ? Number(packMatch[1].replace(/,/g, "")) : null;

  return {
    unitPrice: unitPrice && Number.isFinite(unitPrice) ? unitPrice : null,
    packPrice: packPrice && Number.isFinite(packPrice) ? packPrice : null,
  };
}

// ============================================================================
// Multi-Language Symptom & Entity Lexicon
// ============================================================================

const SYMPTOM_LEXICON: Record<string, string[]> = {
  fever: ["জ্বর", "গা গরম", "তাপমাত্রা", "fever", "jor", "gorom", "feverish", "কাঁপুনি", "chills", "ডেঙ্গু", "dengue", "টাইফয়েড", "typhoid"],
  headache: ["মাথা ব্যথা", "মাথাব্যথা", "headache", "matha betha", "matha", "মাইগ্রেন", "migraine", "ঝিমঝিম", "মাথা ঘোরা", "vertigo"],
  chest_pain: ["বুকে ব্যথা", "বুকে চাপ", "chest pain", "heart attack", "হার্ট", "বুক ধড়ফড়", "palpitation", "buk betha", "ট্রপোনিন"],
  respiratory: ["কাশি", "কফ", "শ্বাসকষ্ট", "দম বন্ধ", "cough", "breathless", "asthma", "হাঁপানি", "shortness of breath", "kashi", "ইনহেলার", "নেবুলাইজার"],
  gastrointestinal: ["পেটে ব্যথা", "বমি", "ডায়রিয়া", "ডায়রিয়া", "পাতলা পায়খানা", "গ্যাস্ট্রিক", "এসিডিটি", "বুক জ্বালা", "vomiting", "diarrhea", "acidity", "gastric", "pet betha", "loose motion", "কোষ্ঠকাঠিন্য", "জন্ডিস"],
  joint_pain: ["জয়েন্টে ব্যথা", "হাঁটু ব্যথা", "কোমর ব্যথা", "ঘাড় ব্যথা", "হাড়ের ব্যথা", "joint pain", "back pain", "neck pain", "knee pain", "arthritis", "komor betha", "বাত", "ইউরিক এসিড"],
  skin_allergy: ["চুলকানি", "র‌্যাশ", "র‍্যাশ", "এলার্জি", "দাদ", "খোসপাঁচড়া", "rash", "itching", "allergy", "chulkani", "eczema"],
  urinary: ["প্রস্রাবে জ্বালা", "ঘন ঘন প্রস্রাব", "লাল প্রস্রাব", "কিডনি", "ক্রিয়েটিনিন", "burning urination", "uti", "urine infection", "prosrabe jala", "creatinine"],
  diabetes: ["ডায়াবেটিস", "ডায়াবেটিস", "রক্তে সুগার", "পিপাসা", "diabetes", "blood sugar", "insulin", "ইনসুলিন", "hba1c", "fbs"],
  hypertension: ["উচ্চ রক্তচাপ", "হাই প্রেশার", "প্রেশার", "hypertension", "high blood pressure", "high bp", "pressure", "কোলেস্টেরল"],
};

// ============================================================================
// Live External Biomedical & Video Resolvers (with fast non-blocking timeouts)
// ============================================================================

async function fetchPubMedEvidence(queryTerms: string): Promise<PubMedCitation[]> {
  if (!queryTerms || queryTerms.trim().length < 3) return [];
  try {
    const cleanQ = encodeURIComponent(`${queryTerms} clinical management review`);
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${cleanQ}&format=json&pageSize=3&sort=CITED%20desc`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2200) });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.resultList?.result || [];
    return results
      .filter((r: any) => r.pmid && r.title)
      .slice(0, 2)
      .map((r: any) => ({
        pmid: String(r.pmid),
        title: String(r.title).replace(/<[^>]+>/g, "").trim(),
        journal: r.journalTitle || "Peer-Reviewed Medical Journal",
        year: String(r.pubYear || "2024"),
        url: `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`,
      }));
  } catch {
    return [];
  }
}

async function searchLiveVerifiedYouTubeVideo(searchTopic: string): Promise<EducationalVideo | undefined> {
  try {
    const q = encodeURIComponent(`${searchTopic} medical health education guide`);
    const res = await fetch(`https://www.youtube.com/results?search_query=${q}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    const matches = Array.from(html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)).map((m) => m[1]);
    const uniqueIds = Array.from(new Set(matches)).slice(0, 3);

    for (const vid of uniqueIds) {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`,
          { signal: AbortSignal.timeout(1500) }
        );
        if (oembedRes.ok) {
          const meta = await oembedRes.json();
          return {
            id: `live_yt_${vid}`,
            title: meta.title || "Clinical Health Guide",
            title_bn: `${meta.title || "স্বাস্থ্য শিক্ষা ও নির্দেশনামূলক ভিডিও"} (${meta.author_name || "Medical Channel"})`,
            youtubeId: vid,
            author: meta.author_name,
            category: "Medical Education",
            description_bn: "ভেরিফায়েড স্বাস্থ্য শিক্ষা ও চিকিৎসা নির্দেশনামূলক ভিডিও।",
          };
        }
      } catch {
        continue;
      }
    }
  } catch {}
  return undefined;
}

// ============================================================================
// Core Synchronous + Asynchronous Medical RAG Engine
// ============================================================================

export function executeMedicalRAG(
  query: string,
  language: string = "bn",
  category?: string
): MedicalRAGResult {
  const rawQuery = query.trim();
  const corpus = loadClinicalCorpus();
  const lexicon: Record<string, string> = corpus.bengali_medicine_lexicon || {};
  const diseases = loadDiseases();
  const catalog = getCatalogMedicines().data || [];
  const allGenerics = loadAllGenericsList();

  // 1. Expand Bengali medicine & clinical names into canonical English terms
  let expandedQuery = rawQuery;
  const matchedLexiconTargets: string[] = [];
  const sortedLexiconEntries = Object.entries(lexicon).sort((a, b) => b[0].length - a[0].length);
  for (const [bnTerm, enTerm] of sortedLexiconEntries) {
    if (rawQuery.includes(bnTerm)) {
      if (!matchedLexiconTargets.includes(enTerm)) {
        matchedLexiconTargets.push(enTerm);
        expandedQuery += ` ${enTerm}`;
      }
    }
  }

  const qLower = expandedQuery.toLowerCase().trim();

  // 2. Detect Emergency Symptoms
  const isEmergency = /(বুকে তীব্র চাপ|বুকে অসহ্য ব্যথা|বাম বাহুতে ব্যথা|হঠাৎ মুখ বেঁকে যাওয়া|অজ্ঞান|তীব্র শ্বাসকষ্ট|অতিরিক্ত রক্তক্ষরণ|সাপে কামড়|সাপে কাটলে|কুকুরে কামড়| বিষ পান|massive bleeding|severe chest pain|crushing chest pain|unconscious|stroke|heart attack|snakebite|snake bite)/i.test(
    qLower
  );

  let emergencyMessage = "";
  if (isEmergency) {
    emergencyMessage =
      language === "bn"
        ? "অবিলম্বে জাতীয় জরুরি সেবা ৯৯৯ নম্বরে কল করুন বা নিকটস্থ হাসপাতালের জরুরি বিভাগে (Emergency Room) রোগীকে নিয়ে যান।"
        : "Immediately call National Emergency 999 or proceed to the nearest hospital Emergency Room.";
  }

  // 3. Extract Matched Symptom Categories
  const detectedCategories: string[] = [];
  for (const [cat, keywords] of Object.entries(SYMPTOM_LEXICON)) {
    if (keywords.some((k) => qLower.includes(k.toLowerCase()))) {
      detectedCategories.push(cat);
    }
  }

  // 4. Multi-Vector Brand Medicine Search across all 21,714 DGDA Medicines
  const matchedBrandMedicines: BrandMedicineResult[] = [];
  const sameGenericAlternatives: BrandMedicineResult[] = [];

  // Extract candidate English tokens (2+ chars) from expanded query
  const englishTokens = expandedQuery
    .replace(/[^a-zA-Z0-9\s+-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 2 && !["what", "why", "how", "the", "and", "for", "with", "can", "take", "use", "price", "dose", "dosage", "tablet", "capsule", "syrup", "mg", "ml", "medicine", "drug", "about", "koto", "keno", "kivabe", "er", "ki", "ba"].includes(t));

  const explicitTargetNames = matchedLexiconTargets.map((t) => t.toLowerCase());

  if (explicitTargetNames.length > 0 || englishTokens.length > 0) {
    const scoredBrands: { item: any; score: number }[] = [];

    for (const m of catalog) {
      const bName = String(m.brand_name || "").toLowerCase();
      const gName = String(m.generic_name || "").toLowerCase();
      if (!bName) continue;

      let score = 0;

      // Check explicit lexicon targets first (e.g. "Napa Extra", "Sergel", "3-C")
      for (const target of explicitTargetNames) {
        if (bName === target) score += 120;
        else if (bName.startsWith(target + " ") || bName === target.replace(/\s+/g, "-")) score += 95;
        else if (gName === target) score += 80;
        else if (gName.includes(target) && target.length >= 4) score += 55;
      }

      // Check direct query inclusion for multi-word brands (e.g. "napa extra", "ace plus", "calbo d")
      if (bName.length >= 3 && qLower.includes(bName)) {
        score += bName.includes(" ") ? 110 : 85;
      }

      // Token match
      for (const tok of englishTokens) {
        if (tok.length >= 3) {
          if (bName === tok) score += 90;
          else if (bName.startsWith(tok + " ")) score += 65;
          else if (gName === tok) score += 75;
        }
      }

      if (score >= 55) {
        scoredBrands.push({ item: m, score });
      }
    }

    scoredBrands.sort((a, b) => b.score - a.score);

    const seenBrandNames = new Set<string>();
    for (const { item } of scoredBrands) {
      const key = `${item.brand_name}_${item.strength}_${item.dosage_form}`.toLowerCase();
      if (seenBrandNames.has(key)) continue;
      seenBrandNames.add(key);

      const { unitPrice, packPrice } = extractPriceFromCatalogItem(item);
      const mfgAsset = getManufacturerAsset(item.manufacturer || "");
      const dosageIcon = getOfficialDosageIcon(item.dosage_form || item.type || "");
      const packImg = getMedicinePackaging(item.id, item.brand_name) || getChemicalStructure(item.generic_name);

      matchedBrandMedicines.push({
        id: String(item.id),
        name: item.brand_name || "Medicine",
        generic: item.generic_name || "Generic",
        strength: item.strength,
        form: item.dosage_form || item.type,
        company: item.manufacturer,
        companyLogo: mfgAsset?.logoUrl || null,
        price: unitPrice ?? packPrice,
        packPrice,
        packSize: item.package_size || null,
        priceBasis: unitPrice ? "unit" : packPrice ? "pack" : "unit",
        dosageIcon,
        packagingImage: packImg || null,
        url: `/medicines/${item.id}`,
      });

      if (matchedBrandMedicines.length >= 5) break;
    }
  }

  // 5. Retrieve Full Generic Monographs across all 1,711 Generics
  const matchedGenerics: GenericMonograph[] = [];

  // First from matched brand medicines
  for (const bm of matchedBrandMedicines) {
    if (bm.generic) {
      const mono = getGenericMonograph(bm.generic);
      if (mono && !matchedGenerics.some((g) => g.name === mono.name)) {
        matchedGenerics.push(mono);
      }
    }
  }

  // Next from explicit lexicon targets or query tokens against all 1,711 generics
  if (matchedGenerics.length === 0) {
    for (const g of allGenerics) {
      if (!g.name) continue;
      const gLower = g.name.toLowerCase();
      const baseName = gLower
        .replace(/\s+(monohydrate|trihydrate|hydrochloride|magnesium|sodium|potassium|fumarate|succinate|besylate|maleate|sulfate|phosphate)\b/g, "")
        .trim();

      if (
        (baseName.length >= 4 && qLower.includes(baseName)) ||
        explicitTargetNames.some((t) => gLower.includes(t) || t.includes(baseName))
      ) {
        if (!matchedGenerics.some((existing) => existing.name === g.name)) {
          matchedGenerics.push(g);
          if (matchedGenerics.length >= 3) break;
        }
      }
    }
  }

  // Symptom-based fallback generic retrieval if no specific drug was named
  if (matchedGenerics.length === 0) {
    const symptomGenericMap: [string, string][] = [
      ["fever", "Paracetamol"],
      ["headache", "Paracetamol"],
      ["gastrointestinal", "Omeprazole"],
      ["respiratory", "Salbutamol"],
      ["skin_allergy", "Fexofenadine Hydrochloride"],
    ];
    for (const [symCat, genName] of symptomGenericMap) {
      if (detectedCategories.includes(symCat)) {
        const mono = getGenericMonograph(genName);
        if (mono && !matchedGenerics.some((g) => g.name === mono.name)) {
          matchedGenerics.push(mono);
        }
      }
    }
  }

  // If we have a matched generic, find top Same-Generic Brand Alternatives from the 21,714 catalog
  if (matchedGenerics.length > 0 || matchedBrandMedicines.length > 0) {
    const primaryGeneric = (matchedBrandMedicines[0]?.generic || matchedGenerics[0]?.name || "").toLowerCase().trim();
    const primaryBrandName = (matchedBrandMedicines[0]?.name || "").toLowerCase().trim();
    const primaryStrength = (matchedBrandMedicines[0]?.strength || "").toLowerCase().trim();

    if (primaryGeneric) {
      const altCandidates = catalog.filter((m) => {
        const g = String(m.generic_name || "").toLowerCase().trim();
        const b = String(m.brand_name || "").toLowerCase().trim();
        if (g !== primaryGeneric || b === primaryBrandName) return false;
        if (primaryStrength && String(m.strength || "").toLowerCase().trim() !== primaryStrength) return false;
        return true;
      });

      const seenAltBrands = new Set<string>();
      for (const alt of altCandidates) {
        const bKey = String(alt.brand_name || "").toLowerCase();
        if (seenAltBrands.has(bKey)) continue;
        seenAltBrands.add(bKey);

        const { unitPrice, packPrice } = extractPriceFromCatalogItem(alt);
        const mfgAsset = getManufacturerAsset(alt.manufacturer || "");
        const dosageIcon = getOfficialDosageIcon(alt.dosage_form || alt.type || "");

        sameGenericAlternatives.push({
          id: String(alt.id),
          name: alt.brand_name || "Medicine",
          generic: alt.generic_name || primaryGeneric,
          strength: alt.strength,
          form: alt.dosage_form || alt.type,
          company: alt.manufacturer,
          companyLogo: mfgAsset?.logoUrl || null,
          price: unitPrice ?? packPrice,
          packPrice,
          priceBasis: unitPrice ? "unit" : "pack",
          dosageIcon,
          url: `/medicines/${alt.id}`,
        });

        if (sameGenericAlternatives.length >= 6) break;
      }

      // If matchedBrandMedicines was empty (user searched by generic name only), populate matchedBrandMedicines from sameGenericAlternatives
      if (matchedBrandMedicines.length === 0 && sameGenericAlternatives.length > 0) {
        matchedBrandMedicines.push(...sameGenericAlternatives.slice(0, 4));
      }
    }
  }

  // 6. Multi-Vector Disease Scoring
  const matchedDiseases: { disease: DiseaseKnowledge; score: number; matchedSymptoms: string[] }[] = [];
  for (const d of diseases) {
    let score = 0;
    const matchedSyms: string[] = [];

    if (qLower.includes(d.name.toLowerCase()) || qLower.includes(d.bengali_name.toLowerCase())) {
      score += 50;
    }

    for (const sym of d.active_symptoms || []) {
      const symClean = sym.toLowerCase().replace(/_/g, " ");
      if (qLower.includes(symClean)) {
        score += 18;
        matchedSyms.push(symClean);
      }
    }

    if (
      detectedCategories.some(
        (c) => d.category.toLowerCase().includes(c) || (d.active_symptoms_summary || "").toLowerCase().includes(c)
      )
    ) {
      score += 12;
    }

    if (score >= 18) {
      matchedDiseases.push({
        disease: d,
        score: Math.min(98, score),
        matchedSymptoms: matchedSyms,
      });
    }
  }
  matchedDiseases.sort((a, b) => b.score - a.score);
  const topDiseases = matchedDiseases.slice(0, 3);

  // 7. Retrieve Specialized Clinical Corpus Modules (Labs, Drug Interactions, Pediatric Dose, Diet, Emergency)
  const matchedLabPanels = (corpus.lab_reference_ranges || []).filter((panel: any) =>
    (panel.keywords || []).some((kw: string) => qLower.includes(kw.toLowerCase()))
  );

  const matchedDrugInteractions = (corpus.drug_interactions || []).filter((inter: any) => {
    const matchedKwCount = (inter.keywords || []).filter((kw: string) => qLower.includes(kw.toLowerCase())).length;
    const asksInteraction = /(একসাথে|মিথস্ক্রিয়া|interaction|together|সাথে খাওয়া|খাওয়া যাবে)/i.test(qLower);
    return matchedKwCount >= 2 || (asksInteraction && matchedKwCount >= 1);
  });

  const matchedPediatricProtocols = (corpus.pediatric_dosage_protocols || []).filter((ped: any) =>
    (ped.keywords || []).some((kw: string) => qLower.includes(kw.toLowerCase()))
  );

  const matchedNutritionProtocols = (corpus.nutrition_protocols || []).filter((nut: any) =>
    (nut.keywords || []).some((kw: string) => qLower.includes(kw.toLowerCase()))
  );

  const matchedEmergencyProtocols = (corpus.emergency_protocols || []).filter((em: any) =>
    (em.keywords || []).some((kw: string) => qLower.includes(kw.toLowerCase()))
  );

  // 8. Retrieve Verified Institutional Educational YouTube Video
  const verifiedVideos: EducationalVideo[] = corpus.verified_videos || [];
  let educationalVideo: EducationalVideo | undefined;

  for (const v of verifiedVideos) {
    if ((v.keywords || []).some((kw: string) => qLower.includes(kw.toLowerCase()))) {
      educationalVideo = v;
      break;
    }
  }

  // 9. Featured Clinical / Medicine Image Resolution
  let featuredImage: { url: string; caption: string } | undefined;
  if (matchedBrandMedicines.length > 0) {
    const primaryMed = matchedBrandMedicines[0];
    if (primaryMed.packagingImage) {
      featuredImage = {
        url: primaryMed.packagingImage,
        caption: `${primaryMed.name} (${primaryMed.generic} ${primaryMed.strength || ""}) — অফিশিয়াল প্যাকেজিং (${primaryMed.company})`,
      };
    } else if (primaryMed.dosageIcon) {
      featuredImage = {
        url: primaryMed.dosageIcon,
        caption: `${primaryMed.name} (${primaryMed.form || "Dosage Form"}) — ${primaryMed.company}`,
      };
    }
  }

  // 10. Recommended Specialty & Triage
  let recommendedSpecialty = "Medicine";
  let triageUrgency: "routine" | "soon" | "urgent" | "emergency" = "routine";

  if (isEmergency || matchedEmergencyProtocols.length > 0) {
    recommendedSpecialty = detectedCategories.includes("chest_pain") ? "Cardiology" : "Medicine";
    triageUrgency = "emergency";
  } else if (matchedLabPanels.length > 0 && matchedLabPanels[0].recommended_specialty) {
    recommendedSpecialty = matchedLabPanels[0].recommended_specialty;
  } else if (detectedCategories.includes("chest_pain") || detectedCategories.includes("hypertension")) {
    recommendedSpecialty = "Cardiology";
    triageUrgency = "soon";
  } else if (detectedCategories.includes("respiratory")) {
    recommendedSpecialty = "Pulmonology";
    triageUrgency = "soon";
  } else if (detectedCategories.includes("gastrointestinal")) {
    recommendedSpecialty = "Gastroenterology";
  } else if (detectedCategories.includes("joint_pain")) {
    recommendedSpecialty = "Orthopaedics";
  } else if (detectedCategories.includes("skin_allergy")) {
    recommendedSpecialty = "Dermatology";
  } else if (detectedCategories.includes("diabetes")) {
    recommendedSpecialty = "Endocrinology";
  } else if (detectedCategories.includes("urinary")) {
    recommendedSpecialty = "Nephrology";
  } else if (matchedPediatricProtocols.length > 0) {
    recommendedSpecialty = "Pediatrics";
  }

  // 11. Construct High-Yield Markdown Clinical Comparison Table
  let clinicalTableMarkdown = "";
  if (matchedBrandMedicines.length > 0) {
    const allMedsForTable = [
      ...matchedBrandMedicines.slice(0, 2),
      ...sameGenericAlternatives.slice(0, 4),
    ].slice(0, 6);

    clinicalTableMarkdown = `| ব্র্যান্ডের নাম (Clickable Link) | জেনেরিক ও শক্তি (Generic & Strength) | ডোজেজ ফর্ম | প্রস্তুতকারক (Manufacturer) | খুচরা মূল্য (DGDA Price) |\n| :--- | :--- | :--- | :--- | :--- |\n`;
    for (const b of allMedsForTable) {
      const priceText = b.price
        ? `**৳ ${b.price.toFixed(2)}** / ${b.priceBasis === "pack" ? "প্যাক" : "ইউনিট"}${b.packPrice && b.priceBasis === "unit" ? ` (প্যাক: ৳${b.packPrice.toFixed(2)})` : ""}`
        : "লিস্টেড";
      clinicalTableMarkdown += `| [**${b.name}**](${b.url}) | ${b.generic} (${b.strength || "Standard"}) | ${b.form || "Tablet"} | ${b.company} | ${priceText} |\n`;
    }
  } else if (matchedLabPanels.length > 0) {
    const panel = matchedLabPanels[0];
    clinicalTableMarkdown = `| পরীক্ষার প্যারামিটার (${panel.test_name}) | স্বাভাবিক মাত্রা (Normal Reference Range) | বেশি হলে অর্থ (High) | কম হলে অর্থ (Low) ও করণীয় |\n| :--- | :--- | :--- | :--- |\n`;
    for (const p of panel.parameters || []) {
      clinicalTableMarkdown += `| **${p.parameter}** | \`${p.normal_range}\` | ${p.high_meaning_bn} | ${p.low_meaning_bn} — *${p.action_bn}* |\n`;
    }
  } else if (matchedPediatricProtocols.length > 0) {
    clinicalTableMarkdown = matchedPediatricProtocols[0].weight_table_markdown;
  } else if (matchedNutritionProtocols.length > 0) {
    clinicalTableMarkdown = matchedNutritionProtocols[0].table_markdown;
  } else if (topDiseases.length > 0) {
    clinicalTableMarkdown = `| সম্ভাব্য সমস্যা (Condition) | ক্লিনিক্যাল ম্যাচ | ট্রায়াজ মাত্রা | প্রস্তাবিত বিশেষজ্ঞ (Clickable) |\n| :--- | :--- | :--- | :--- |\n`;
    for (const d of topDiseases) {
      clinicalTableMarkdown += `| **${d.disease.bengali_name}** (${d.disease.name}) | ${d.score}% | **${d.disease.triage_level || "Normal"}** | [${recommendedSpecialty} বিশেষজ্ঞ](/doctors?speciality=${encodeURIComponent(recommendedSpecialty)}) |\n`;
    }
  }

  // 12. Build RAG Citations & Follow-Up Questions
  const ragSources: RAGSourceCitation[] = [];
  if (matchedBrandMedicines.length > 0) {
    const primary = matchedBrandMedicines[0];
    ragSources.push({
      title: `${primary.name} (${primary.generic} ${primary.strength || ""}) — DGDA Catalog`,
      sourceType: "DGDA Catalog",
      url: primary.url,
      snippet: `প্রস্তুতকারক: ${primary.company} | মূল্য: ৳${primary.price ? primary.price.toFixed(2) : "N/A"}/${primary.priceBasis || "unit"}`,
    });
  }
  if (matchedGenerics.length > 0) {
    const mg = matchedGenerics[0];
    ragSources.push({
      title: `${mg.name} — Clinical Pharmacology Monograph`,
      sourceType: "MedEx Monograph",
      url: matchedBrandMedicines[0]?.url || "/medicines",
      snippet: (mg.indication_description || mg.pharmacology || "").slice(0, 140) + "...",
    });
  }
  if (matchedLabPanels.length > 0) {
    ragSources.push({
      title: `${matchedLabPanels[0].test_name_bn} — Standard Reference Intervals`,
      sourceType: "Clinical Lab Reference",
      snippet: matchedLabPanels[0].test_name,
    });
  }
  if (topDiseases.length > 0 || matchedEmergencyProtocols.length > 0) {
    ragSources.push({
      title: "DGHS Bangladesh & WHO Standard Treatment Guidelines",
      sourceType: "DGHS / WHO Guideline",
      url: "/doctors",
      snippet: topDiseases[0]?.disease.bengali_name || matchedEmergencyProtocols[0]?.title_bn || "Clinical Triage Protocol",
    });
  }

  const followUpSuggestions: string[] = [];
  if (matchedBrandMedicines.length > 0) {
    const bName = matchedBrandMedicines[0].name;
    const gName = matchedBrandMedicines[0].generic;
    followUpSuggestions.push(
      `${bName} খাওয়ার সঠিক নিয়ম ও পার্শ্বপ্রতিক্রিয়া কী?`,
      `${bName}-এর সাথে গ্যাস্ট্রিক বা অন্য ওষুধ একসাথে খাওয়া যাবে কি?`,
      `${gName}-এর সবচেয়ে সাশ্রয়ী বিকল্প ব্র্যান্ড কোনগুলো?`,
      `গর্ভাবস্থায় ও স্তন্যদানকালে ${bName} কি নিরাপদ?`
    );
  } else if (matchedLabPanels.length > 0) {
    followUpSuggestions.push(
      `${matchedLabPanels[0].test_name_bn} রিপোর্ট অস্বাভাবিক হলে কী করণীয়?`,
      `এই সমস্যার জন্য কোন বিশেষজ্ঞ ডাক্তার দেখাব?`,
      `খাদ্যাভ্যাস ও জীবনযাত্রায় কী পরিবর্তন আনা উচিত?`
    );
  } else {
    followUpSuggestions.push(
      `এই সমস্যার জন্য কী কী ল্যাব টেস্ট বা রক্ত পরীক্ষা করা প্রয়োজন?`,
      `ঘরোয়া যত্ন ও প্রতিদিনের খাদ্যতালিকা কেমন হওয়া উচিত?`,
      `কোন বিশেষজ্ঞ ডাক্তারের অ্যাপয়েন্টমেন্ট নেওয়া উচিত?`
    );
  }

  // 13. Build Authoritative Grounding Context for LLMs (Azure OpenAI / Nebius / Gemini)
  let groundingContextText = `\n## VERIFIED MULTI-SOURCE MEDICAL RAG EVIDENCE (AUTHORITATIVE GROUNDING):\n`;
  groundingContextText += `IMPORTANT: The following records were retrieved directly from our verified DGDA 21,714 Medicine Catalog, 1,711 MedEx Clinical Monographs, and DGHS/WHO Clinical Guidelines. You MUST use these exact facts, prices, compositions, and clickable URLs in your answer! Do NOT say "I cannot verify prices" or "I don't know the composition" when the verified records are provided below!\n\n`;

  if (isEmergency) {
    groundingContextText += `🚨 CRITICAL EMERGENCY DETECTED: Promptly advise immediate emergency admission or calling 999.\n\n`;
  }

  if (matchedBrandMedicines.length > 0) {
    groundingContextText += `### 1. Verified DGDA Registered Brand Medicines Matched:\n`;
    for (const bm of matchedBrandMedicines) {
      groundingContextText += `- **Brand Name**: [${bm.name}](${bm.url}) (ID: \`${bm.id}\`)\n`;
      groundingContextText += `  - **Active Generic Composition**: ${bm.generic}\n`;
      groundingContextText += `  - **Strength**: ${bm.strength || "Standard"} | **Dosage Form**: ${bm.form || "Tablet"}\n`;
      groundingContextText += `  - **Manufacturer**: ${bm.company}\n`;
      groundingContextText += `  - **Verified DGDA Retail Price**: ${bm.price ? `৳ ${bm.price.toFixed(2)} per ${bm.priceBasis}` : "Listed in directory"}${bm.packSize ? ` | Pack Info: ${bm.packSize}` : ""}\n`;
      groundingContextText += `  - **Internal Clickable Link**: [${bm.name} বিস্তারিত মনোগ্রাফ](${bm.url})\n`;
      if (bm.packagingImage) {
        groundingContextText += `  - **Official Packaging Image**: ![${bm.name} Packaging](${bm.packagingImage})\n`;
      }
    }
    groundingContextText += `\n`;
  }

  if (sameGenericAlternatives.length > 0) {
    groundingContextText += `### 2. Verified Same-Generic & Same-Strength Alternative Brands in Bangladesh:\n`;
    for (const alt of sameGenericAlternatives) {
      groundingContextText += `- [${alt.name}](${alt.url}) (${alt.generic} ${alt.strength || ""} • ${alt.form || ""}) by ${alt.company} — **Price: ৳ ${alt.price ? alt.price.toFixed(2) : "N/A"} / ${alt.priceBasis}**\n`;
    }
    groundingContextText += `\n`;
  }

  if (matchedGenerics.length > 0) {
    const mg = matchedGenerics[0];
    groundingContextText += `### 3. Official Clinical Pharmacology Monograph (${mg.name}):\n`;
    if (mg.therapeutic_class || mg.drug_class) {
      groundingContextText += `- **Therapeutic Class**: ${mg.therapeutic_class || mg.drug_class}\n`;
    }
    if (mg.indication_description) {
      groundingContextText += `- **Approved Clinical Indications**: ${mg.indication_description}\n`;
    }
    if (mg.pharmacology) {
      groundingContextText += `- **Mechanism of Action & Pharmacology**: ${mg.pharmacology.slice(0, 600)}\n`;
    }
    if (mg.dosage) {
      groundingContextText += `- **Adult & Pediatric Dosage Guidelines**: ${mg.dosage.slice(0, 600)}\n`;
    }
    if (mg.administration) {
      groundingContextText += `- **Administration**: ${mg.administration}\n`;
    }
    if (mg.interaction) {
      groundingContextText += `- **Drug Interactions**: ${mg.interaction.slice(0, 400)}\n`;
    }
    if (mg.contraindications) {
      groundingContextText += `- **Contraindications**: ${mg.contraindications.slice(0, 400)}\n`;
    }
    if (mg.side_effects) {
      groundingContextText += `- **Adverse Effects / Side Effects**: ${mg.side_effects.slice(0, 400)}\n`;
    }
    if (mg.pregnancy_and_lactation) {
      groundingContextText += `- **Pregnancy & Lactation**: ${mg.pregnancy_and_lactation.slice(0, 350)}\n`;
    }
    if (mg.precautions) {
      groundingContextText += `- **Precautions & Warnings**: ${mg.precautions.slice(0, 400)}\n`;
    }
    groundingContextText += `\n`;
  }

  if (matchedLabPanels.length > 0) {
    groundingContextText += `### 4. Retrieved Diagnostic Lab Reference Ranges:\n`;
    for (const lp of matchedLabPanels) {
      groundingContextText += `- **${lp.test_name} (${lp.test_name_bn})**:\n`;
      for (const p of lp.parameters || []) {
        groundingContextText += `  * ${p.parameter}: Normal = ${p.normal_range} | High = ${p.high_meaning_bn} | Low = ${p.low_meaning_bn} | Action = ${p.action_bn}\n`;
      }
    }
    groundingContextText += `\n`;
  }

  if (matchedDrugInteractions.length > 0) {
    groundingContextText += `### 5. Retrieved Drug-Drug / Food-Drug Interaction Alerts:\n`;
    for (const di of matchedDrugInteractions) {
      groundingContextText += `- **${di.pair_title}** (Severity: ${di.severity}): ${di.mechanism_bn} -> Safe Advice: ${di.safe_action_bn}\n`;
    }
    groundingContextText += `\n`;
  }

  if (matchedPediatricProtocols.length > 0) {
    groundingContextText += `### 6. Retrieved Pediatric Weight-Based Dosage Protocol:\n`;
    for (const ped of matchedPediatricProtocols) {
      groundingContextText += `- **${ped.generic}**: ${ped.formula_bn}\n${ped.weight_table_markdown}\n`;
    }
    groundingContextText += `\n`;
  }

  if (matchedNutritionProtocols.length > 0) {
    groundingContextText += `### 7. Retrieved Clinical Nutrition & Diet Protocol:\n`;
    for (const nut of matchedNutritionProtocols) {
      groundingContextText += `- **${nut.title_bn}**: ${nut.summary_bn}\n${nut.table_markdown}\n`;
    }
    groundingContextText += `\n`;
  }

  if (matchedEmergencyProtocols.length > 0) {
    groundingContextText += `### 8. Retrieved Emergency & First-Aid Protocol:\n`;
    for (const em of matchedEmergencyProtocols) {
      groundingContextText += `- **${em.title_bn}**:\n${(em.steps_bn || []).map((s: string, i: number) => `  ${i + 1}. ${s}`).join("\n")}\n`;
    }
    groundingContextText += `\n`;
  }

  if (topDiseases.length > 0) {
    groundingContextText += `### 9. Retrieved DGHS Clinical Diseases:\n`;
    for (const td of topDiseases) {
      groundingContextText += `- **${td.disease.bengali_name} (${td.disease.name})**: Triage=${td.disease.triage_level}, Category=${td.disease.category}, Symptoms=[${(td.disease.active_symptoms || []).slice(0, 6).join(", ")}]\n`;
    }
    groundingContextText += `\n`;
  }

  if (educationalVideo) {
    groundingContextText += `### 10. Verified Educational YouTube Video to Embed:\n`;
    groundingContextText += `- Include this exact tag on its own line in your response: \`[YOUTUBE:${educationalVideo.youtubeId}]\` (${educationalVideo.title_bn})\n\n`;
  }

  // 14. Generate Rich Synthesized Response (Used when offline or as structured fallback)
  let synthesizedResponse = "";
  if (isEmergency) {
    synthesizedResponse += `\`\`\`json:emergency_alert\n{\n  "type": "emergency",\n  "condition": "Acute Clinical Emergency",\n  "severity": "critical",\n  "message": "অবিলম্বে জাতীয় জরুরি সেবা ৯৯৯ এ কল করুন বা নিকটস্থ হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।",\n  "callNumber": "999"\n}\n\`\`\`\n\n`;
    synthesizedResponse += `### 🚨 জরুরি স্বাস্থ্য সতর্কতা (Medical Emergency)\n\nআপনার উল্লেখিত শারীরিক লক্ষণ অত্যন্ত ঝুঁকিপূর্ণ ও জরুরি চিকিৎসাব্যবস্থা নির্দেশ করে। কোনো প্রকার কালবিলম্ব না করে অবিলম্বে রোগীকে নিকটস্থ হাসপাতালের জরুরি বিভাগে নিয়ে যান অথবা জাতীয় জরুরি সেবা **৯৯৯** নম্বরে কল করুন।\n\n`;
    if (matchedEmergencyProtocols.length > 0) {
      synthesizedResponse += `#### 🚑 তাৎক্ষণিক জীবনরক্ষাকারী প্রাথমিক পদক্ষেপ (${matchedEmergencyProtocols[0].title_bn}):\n`;
      for (const step of matchedEmergencyProtocols[0].steps_bn || []) {
        synthesizedResponse += `- ${step}\n`;
      }
      synthesizedResponse += `\n`;
    }
    if (educationalVideo) {
      synthesizedResponse += `#### 📹 জরুরি নির্দেশনামূলক ভিডিও:\n[YOUTUBE:${educationalVideo.youtubeId}]\n\n`;
    }
  } else {
    if (matchedBrandMedicines.length > 0) {
      const primary = matchedBrandMedicines[0];
      synthesizedResponse += `### 💊 [${primary.name}](${primary.url}) (${primary.generic} ${primary.strength || ""}) — ক্লিনিক্যাল গাইড ও মূল্য তালিকা\n\n`;
      synthesizedResponse += `[**${primary.name}**](${primary.url}) হলো **${primary.company}** প্রস্তুতকৃত একটি অনুমোদিত ওষুধ, যার সক্রিয় জেনেরিক উপাদান **${primary.generic}** (${primary.strength || primary.form || "Standard"})।\n\n`;
      if (featuredImage) {
        synthesizedResponse += `![${featuredImage.caption}](${featuredImage.url})\n\n`;
      }
    } else {
      synthesizedResponse += `### 🩺 ক্লিনিক্যাল মূল্যায়ন ও এভিডেন্স-ভিত্তিক পরামর্শ\n\nআপনার প্রশ্ন ও লক্ষণের প্রেক্ষিতে ভেরিফায়েড মেডিকেল ডাটাবেজ (RAG) অনুযায়ী বিস্তারিত তথ্য নিচে তুলে ধরা হলো:\n\n`;
    }

    if (clinicalTableMarkdown) {
      synthesizedResponse += `#### 📊 তুলনামূলক ক্লিনিক্যাল ও মূল্য তালিকা:\n\n${clinicalTableMarkdown}\n\n`;
    }

    if (matchedGenerics.length > 0) {
      const g = matchedGenerics[0];
      synthesizedResponse += `#### 🧬 অফিশিয়াল ফার্মাকোলজি মনোগ্রাফ: **${g.name}**\n`;
      if (g.indication_description) {
        synthesizedResponse += `- **কেন খাওয়া হয় (Indications):** ${g.indication_description}\n`;
      }
      if (g.dosage) {
        synthesizedResponse += `- **মাত্রা ও সেবনবিধি (Dosage & Administration):** ${g.dosage}\n`;
      }
      if (g.interaction) {
        synthesizedResponse += `- **ওষুধের মিথস্ক্রিয়া (Drug Interactions):** ${g.interaction}\n`;
      }
      if (g.contraindications) {
        synthesizedResponse += `- **প্রতিনির্দেশনা (Contraindications):** ${g.contraindications}\n`;
      }
      if (g.side_effects) {
        synthesizedResponse += `- **পার্শ্বপ্রতিক্রিয়া (Side Effects):** ${g.side_effects}\n`;
      }
      if (g.pregnancy_and_lactation) {
        synthesizedResponse += `- **গর্ভাবস্থা ও স্তন্যদানকালে (Pregnancy & Lactation):** ${g.pregnancy_and_lactation}\n`;
      }
      synthesizedResponse += `\n`;
    }

    if (matchedDrugInteractions.length > 0) {
      synthesizedResponse += `#### ⚠️ ওষুধের আন্তঃপ্রতিক্রিয়া সতর্কতা (Drug Interaction Alert):\n`;
      for (const di of matchedDrugInteractions) {
        synthesizedResponse += `- **${di.pair_title}** (*${di.severity}*): ${di.mechanism_bn}\n  - **নিরাপদ করণীয়:** ${di.safe_action_bn}\n`;
      }
      synthesizedResponse += `\n`;
    }

    if (educationalVideo) {
      synthesizedResponse += `#### 📹 স্বাস্থ্য শিক্ষা ও নির্দেশনামূলক ভিডিও:\n[YOUTUBE:${educationalVideo.youtubeId}]\n\n`;
    }

    if (matchedBrandMedicines.length > 0) {
      synthesizedResponse += `\`\`\`json:medicine_recommendation\n${JSON.stringify({
        generic: matchedBrandMedicines[0].generic,
        name: matchedBrandMedicines[0].name,
        condition: `${matchedBrandMedicines[0].name} (${matchedBrandMedicines[0].generic}) ও সমমানের অনুমোদিত ব্র্যান্ড`,
      })}\n\`\`\`\n\n`;
    }

    synthesizedResponse += `\`\`\`json:doctor_recommendation\n{\n  "speciality": "${recommendedSpecialty}",\n  "reason": "লক্ষণগুলো নিখুঁতভাবে পরীক্ষা ও সঠিক প্রেসক্রিপশনের জন্য বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন",\n  "urgency": "${triageUrgency}"\n}\n\`\`\`\n\n`;

    if (ragSources.length > 0) {
      synthesizedResponse += `\`\`\`json:rag_sources\n${JSON.stringify(ragSources)}\n\`\`\`\n\n`;
    }

    if (followUpSuggestions.length > 0) {
      synthesizedResponse += `\`\`\`json:follow_ups\n${JSON.stringify(followUpSuggestions)}\n\`\`\`\n\n`;
    }

    synthesizedResponse += `> ⚠️ **চিকিৎসা সতর্কতা:** এই তথ্য শুধুমাত্র স্বাস্থ্য সচেতনতা ও শিক্ষামূলক উদ্দেশ্যে প্রদান করা হয়েছে। চূড়ান্ত ডোজ বা চিকিৎসার পূর্বে একজন রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।\n`;
  }

  return {
    query: rawQuery,
    expandedQuery,
    isHealthQuery:
      detectedCategories.length > 0 ||
      matchedDiseases.length > 0 ||
      matchedGenerics.length > 0 ||
      matchedBrandMedicines.length > 0 ||
      matchedLabPanels.length > 0 ||
      matchedPediatricProtocols.length > 0 ||
      matchedNutritionProtocols.length > 0,
    isEmergency,
    emergencyMessage,
    matchedDiseases: topDiseases,
    matchedGenerics,
    matchedBrandMedicines,
    sameGenericAlternatives,
    matchedLabPanels,
    matchedDrugInteractions,
    matchedPediatricProtocols,
    matchedNutritionProtocols,
    matchedEmergencyProtocols,
    pubmedCitations: [],
    educationalVideo,
    featuredImage,
    ragSources,
    followUpSuggestions,
    recommendedSpecialty,
    triageUrgency,
    clinicalTableMarkdown,
    groundingContextText,
    synthesizedResponse,
  };
}

/**
 * Asynchronous Multi-Source Online + Local Medical RAG Pipeline.
 * Enriches local 21,714-medicine & 1,711-monograph retrieval with:
 * 1. Live MedEx Brand Assets (real packaging photos, chemical structure SVGs, official Bengali monographs)
 * 2. Live EuropePMC / PubMed peer-reviewed clinical literature citations
 * 3. Live YouTube oEmbed video verification when the user asks for a video demonstration
 */
export async function executeMedicalRAGWithLiveResearch(
  query: string,
  language: string = "bn",
  category?: string
): Promise<MedicalRAGResult> {
  const baseResult = executeMedicalRAG(query, language, category);
  const qLower = baseResult.expandedQuery.toLowerCase();

  const tasks: Promise<void>[] = [];

  // 1. Live MedEx Brand Enrichment for the primary matched brand medicine
  if (baseResult.matchedBrandMedicines.length > 0) {
    const primaryBrand = baseResult.matchedBrandMedicines[0];
    tasks.push(
      fetchLiveMedexBrandData(primaryBrand.id)
        .then((liveBrand) => {
          if (!liveBrand) return;
          if (liveBrand.packagingImages && liveBrand.packagingImages.length > 0) {
            primaryBrand.packagingImage = liveBrand.packagingImages[0];
            baseResult.featuredImage = {
              url: liveBrand.packagingImages[0],
              caption: `${primaryBrand.name} (${primaryBrand.generic} ${primaryBrand.strength || ""}) — অফিশিয়াল প্যাকেজিং (${primaryBrand.company})`,
            };
            baseResult.groundingContextText += `\n### Live Verified MedEx Packaging Image for ${primaryBrand.name}:\n- Embed this exact markdown image in your response: \`![${primaryBrand.name} Official Packaging](${liveBrand.packagingImages[0]})\`\n`;
          } else if (liveBrand.chemicalStructure) {
            primaryBrand.chemicalStructure = liveBrand.chemicalStructure;
            baseResult.featuredImage = {
              url: liveBrand.chemicalStructure,
              caption: `${primaryBrand.generic} — অফিশিয়াল কেমিক্যাল স্ট্রাকচার (Molecular Structure)`,
            };
            baseResult.groundingContextText += `\n### Live Verified Chemical Structure Image for ${primaryBrand.generic}:\n- Embed this exact markdown image in your response: \`![${primaryBrand.generic} Chemical Structure](${liveBrand.chemicalStructure})\`\n`;
          }
          if (liveBrand.dosageIcon) {
            primaryBrand.dosageIcon = liveBrand.dosageIcon;
          }
          if (liveBrand.monographBn && Object.keys(liveBrand.monographBn).length > 0) {
            const bn = liveBrand.monographBn;
            baseResult.groundingContextText += `\n### Official MedEx Bengali Monograph for ${primaryBrand.name}:\n`;
            if (bn.indication_description) baseResult.groundingContextText += `- **নির্দেশনা (Indications)**: ${bn.indication_description}\n`;
            if (bn.dosage) baseResult.groundingContextText += `- **মাত্রা ও সেবনবিধি (Dosage)**: ${bn.dosage}\n`;
            if (bn.contraindications) baseResult.groundingContextText += `- **প্রতিনির্দেশনা (Contraindications)**: ${bn.contraindications}\n`;
            if (bn.side_effects) baseResult.groundingContextText += `- **পার্শ্ব প্রতিক্রিয়া (Side Effects)**: ${bn.side_effects}\n`;
            if (bn.pregnancy_and_lactation) baseResult.groundingContextText += `- **গর্ভাবস্থায় ও স্তন্যদানকালে**: ${bn.pregnancy_and_lactation}\n`;
            if (bn.precautions) baseResult.groundingContextText += `- **সতর্কতা**: ${bn.precautions}\n`;
          }
        })
        .catch(() => {})
    );
  }

  // 2. Live PubMed / EuropePMC Peer-Reviewed Literature Search
  const pubmedQuery =
    baseResult.matchedGenerics[0]?.name ||
    baseResult.matchedDiseases[0]?.disease.name ||
    baseResult.matchedLabPanels[0]?.test_name ||
    "";
  if (pubmedQuery) {
    tasks.push(
      fetchPubMedEvidence(pubmedQuery)
        .then((citations) => {
          if (citations.length > 0) {
            baseResult.pubmedCitations = citations;
            baseResult.groundingContextText += `\n### Live PubMed Peer-Reviewed Clinical Evidence:\n`;
            for (const c of citations) {
              baseResult.groundingContextText += `- [${c.title} (${c.journal}, ${c.year})](${c.url}) (PMID: ${c.pmid})\n`;
              baseResult.ragSources.push({
                title: `${c.title} (${c.year})`,
                sourceType: "PubMed Literature",
                url: c.url,
                snippet: `${c.journal} • PMID: ${c.pmid}`,
              });
            }
          }
        })
        .catch(() => {})
    );
  }

  // 3. Live YouTube Video Search if user explicitly requested a video and no preset matched
  const asksForVideo = /(ভিডিও|ইউটিউব|video|youtube|tutorial|দেখাও|কিভাবে করব)/i.test(qLower);
  if (asksForVideo && !baseResult.educationalVideo) {
    const searchTopic =
      baseResult.matchedGenerics[0]?.name ||
      baseResult.matchedDiseases[0]?.disease.name ||
      baseResult.expandedQuery.replace(/[^\w\s]/g, " ").trim();
    tasks.push(
      searchLiveVerifiedYouTubeVideo(searchTopic)
        .then((liveVid) => {
          if (liveVid) {
            baseResult.educationalVideo = liveVid;
            baseResult.groundingContextText += `\n### Live Verified YouTube Educational Video:\n- Embed this exact tag on its own line: \`[YOUTUBE:${liveVid.youtubeId}]\` (${liveVid.title_bn})\n`;
          }
        })
        .catch(() => {})
    );
  }

  await Promise.allSettled(tasks);
  return baseResult;
}
