import fs from "fs";
import path from "path";
import { getGenericMonograph, GenericMonograph, getMedicineById } from "./medicine-catalog";

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
  category: string;
  description_bn: string;
}

export interface BrandMedicineResult {
  id: string;
  name: string;
  generic: string;
  strength?: string;
  form?: string;
  company?: string;
  price?: number | null;
  priceBasis?: string | null;
  url: string;
}

export interface MedicalRAGResult {
  query: string;
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
  educationalVideo?: EducationalVideo;
  recommendedSpecialty: string;
  triageUrgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  clinicalTableMarkdown?: string;
  groundingContextText: string;
  synthesizedResponse: string;
}

// ============================================================================
// In-Memory Cached Indexes
// ============================================================================

let cachedDiseases: DiseaseKnowledge[] | null = null;
let cachedCatalogData: any[] | null = null;

function loadDiseases(): DiseaseKnowledge[] {
  if (cachedDiseases) return cachedDiseases;
  const paths = [
    path.join(process.cwd(), "public/data/diseases_150.json"),
    path.join(process.cwd(), "Frontend/public/data/diseases_150.json"),
  ];
  const target = paths.find(p => fs.existsSync(p));
  if (!target) return [];
  try {
    const raw = fs.readFileSync(target, "utf8");
    cachedDiseases = JSON.parse(raw);
    return cachedDiseases || [];
  } catch (e) {
    console.error("Failed to load diseases_150.json:", e);
    return [];
  }
}

function loadMedicines(): any[] {
  if (cachedCatalogData) return cachedCatalogData;
  const paths = [
    path.join(process.cwd(), "public/data/medicines.json"),
    path.join(process.cwd(), "Frontend/public/data/medicines.json"),
  ];
  const target = paths.find(p => fs.existsSync(p));
  if (!target) return [];
  try {
    const raw = fs.readFileSync(target, "utf8");
    const parsed = JSON.parse(raw);
    cachedCatalogData = parsed.data || [];
    return cachedCatalogData || [];
  } catch (e) {
    console.error("Failed to load medicines.json:", e);
    return [];
  }
}

// ============================================================================
// Verified Clinical Video Library (High-Yield Health Tutorials)
// ============================================================================

const VERIFIED_VIDEOS: EducationalVideo[] = [
  {
    id: "inhaler_technique",
    title: "How to Use an Inhaler Correctly",
    title_bn: "ইনহেলার ব্যবহারের সঠিক নিয়ম ও কার্যপদ্ধতি",
    youtubeId: "fQc3_R22xbg",
    category: "Asthma & Respiratory",
    description_bn: "অ্যাজমা বা শ্বাসকষ্টে ইনহেলার বা রোটাপ্যাক গ্রহণের সঠিক ধাপসমূহ।"
  },
  {
    id: "ors_prep",
    title: "How to Prepare Oral Rehydration Salt (ORS)",
    title_bn: "মুখে খাবার স্যালাইন (ORS) তৈরির সঠিক নিয়ম",
    youtubeId: "N7J6dFk1-7U",
    category: "Diarrhea & Dehydration",
    description_bn: "ডায়রিয়া, বমি বা অতিরিক্ত গরমে পানিশূন্যতা রোধে আধা লিটার পানিতে স্যালাইন তৈরির নিয়ম।"
  },
  {
    id: "hands_only_cpr",
    title: "Hands-Only CPR for Sudden Cardiac Arrest",
    title_bn: "জরুরি কার্ডিয়াক অ্যারেস্টে হাতের সাহায্যে সিপিআর (CPR) দেওয়ার নিয়ম",
    youtubeId: "M4ACYp75maU",
    category: "Cardiovascular Emergency",
    description_bn: "হঠাৎ বুকে ব্যথা ও অজ্ঞান হয়ে গেলে জরুরি বিভাগের সাহায্য না আসা পর্যন্ত সিপিআর দেওয়ার পদ্ধতি।"
  },
  {
    id: "insulin_pen",
    title: "How to Inject Insulin with an Insulin Pen",
    title_bn: "ইনসুলিন পেন দিয়ে সঠিকভাবে ইনসুলিন নেওয়ার নিয়ম",
    youtubeId: "hXF67fKkWbE",
    category: "Diabetes Care",
    description_bn: "ডায়াবেটিস রোগীদের পেটে বা উরুতে ব্যথাহীনভাবে ইনসুলিন ইনজেকশন দেওয়ার নিয়ম।"
  },
  {
    id: "blood_pressure",
    title: "How to Measure Blood Pressure at Home",
    title_bn: "ঘরে বসে ডিজিটাল মেশিনে সঠিক রক্তচাপ মাপার নিয়ম",
    youtubeId: "2P2pW9qVw0A",
    category: "Hypertension",
    description_bn: "সঠিক রিডিং পেতে বসার ভঙ্গিমা, কাফ বাঁধার নিয়ম ও সতর্কতা।"
  },
  {
    id: "back_pain_physio",
    title: "Physiotherapy Exercises for Low Back Pain",
    title_bn: "কোমর ও পিঠের ব্যথা উপশমে কার্যকর ফিজিওথেরাপি ব্যায়াম",
    youtubeId: "4BOTvaIZ36k",
    category: "Orthopedics",
    description_bn: "দীর্ঘক্ষণ বসে কাজ করার কারণে কোমর ও স্পাইনাল ব্যথার সহজ ঘরোয়া ব্যায়াম।"
  },
  {
    id: "dengue_care",
    title: "Dengue Fever Warning Signs & Fluid Management",
    title_bn: "ডেঙ্গু জ্বরের বিপদচিহ্ন ও পানিশূন্যতা প্রতিরোধের নিয়ম",
    youtubeId: "3k9f0mPqR7Y",
    category: "Infectious Disease",
    description_bn: "প্লাটিলেট কমে যাওয়া ও রক্তক্ষরণের লক্ষণ এবং দ্রুত ডাক্তারের শরণাপন্ন হওয়ার পরামর্শ।"
  },
  {
    id: "acid_reflux",
    title: "Lifestyle Changes for Acidity & GERD",
    title_bn: "গ্যাস্ট্রিক ও বুক জ্বালাপোড়া চিরতরে নিয়ন্ত্রণের উপায়",
    youtubeId: "V_e_eQ722pU",
    category: "Gastroenterology",
    description_bn: "খাবারের সঠিক সময়সূচি ও বদহজম রোধের বৈজ্ঞানিক টিপস।"
  }
];

// ============================================================================
// Multi-Language Symptom & Entity Lexicon
// ============================================================================

const SYMPTOM_LEXICON: Record<string, string[]> = {
  fever: ["জ্বর", "গা গরম", "তাপমাত্রা", "fever", "jor", "gorom", "feverish", "কাঁপুন", "chills"],
  headache: ["মাথা ব্যথা", "মাথাব্যথা", "headache", "matha betha", "matha", "মাইগ্রেন", "migraine", "ঝিমঝিম"],
  chest_pain: ["বুকে ব্যথা", "বুকে চাপ", "chest pain", "heart attack", "হার্ট", "বুক ধড়ফড়", "palpitation", "buk betha"],
  respiratory: ["কাশি", "কফ", "শ্বাসকষ্ট", "দম বন্ধ", "cough", "breathless", "asthma", "হাঁপানি", "shortness of breath", "kashi"],
  gastrointestinal: ["পেটে ব্যথা", "বমি", "ডায়রিয়া", "পাতলা পায়খানা", "গ্যাস্ট্রিক", "এসিডিটি", "বুক জ্বালা", "vomiting", "diarrhea", "acidity", "gastric", "pet betha", "loose motion"],
  joint_pain: ["জয়েন্টে ব্যথা", "হাঁটু ব্যথা", "কোমর ব্যথা", "হাড়ের ব্যথা", "joint pain", "back pain", "arthritis", "komor betha"],
  skin_allergy: ["চুলকানি", "র‌্যাশ", "এলার্জি", "দাদ", "rash", "itching", "allergy", "chulkani"],
  urinary: ["প্রস্রাবে জ্বালা", "ঘন ঘন প্রস্রাব", "লাল প্রস্রাব", "burning urination", "uti", "urine infection", "prosrabe jala"],
  diabetes: ["ডায়াবেটিস", "রক্তে সুগার", "পিপাসা", "diabetes", "blood sugar", "insulin", "ইনসুলিন"],
  hypertension: ["উচ্চ রক্তচাপ", "হাই প্রেশার", "প্রেশার", "hypertension", "high blood pressure", "high bp", "pressure"]
};

// ============================================================================
// Core Medical RAG Engine
// ============================================================================

export function executeMedicalRAG(
  query: string,
  language: string = 'bn',
  category?: string
): MedicalRAGResult {
  const qLower = query.toLowerCase().trim();
  const diseases = loadDiseases();
  const catalog = loadMedicines();

  // 1. Detect Emergency Symptoms
  const isEmergency = /(বুকে তীব্র চাপ|বুকে অসহ্য ব্যথা|বাম বাহুতে ব্যথা|হঠাৎ মুখ বেঁকে যাওয়া|অজ্ঞান|তীব্র শ্বাসকষ্ট|অতিরিক্ত রক্তক্ষরণ|massive bleeding|severe chest pain|crushing chest pain|unconscious|stroke|heart attack)/i.test(qLower);
  
  let emergencyMessage = "";
  if (isEmergency) {
    emergencyMessage = language === 'bn'
      ? "অবিলম্বে জাতীয় জরুরি সেবা ৯৯৯ নম্বরে কল করুন বা নিকটস্থ কার্ডিয়াক / ট্রমা হাসপাতালে রোগীকে নিয়ে যান।"
      : "Immediately call National Emergency 999 or proceed to the nearest hospital Emergency Room.";
  }

  // 2. Extract Matched Symptoms
  const detectedCategories: string[] = [];
  for (const [cat, keywords] of Object.entries(SYMPTOM_LEXICON)) {
    if (keywords.some(k => qLower.includes(k.toLowerCase()))) {
      detectedCategories.push(cat);
    }
  }

  // 3. Multi-Vector Disease Scoring
  const matchedDiseases: { disease: DiseaseKnowledge; score: number; matchedSymptoms: string[] }[] = [];
  
  for (const d of diseases) {
    let score = 0;
    const matchedSyms: string[] = [];

    // Name match
    if (qLower.includes(d.name.toLowerCase()) || qLower.includes(d.bengali_name.toLowerCase())) {
      score += 45;
    }

    // Symptom match
    for (const sym of d.active_symptoms || []) {
      const symClean = sym.toLowerCase().replace(/_/g, " ");
      if (qLower.includes(symClean)) {
        score += 15;
        matchedSyms.push(symClean);
      }
    }

    // Category match
    if (detectedCategories.some(c => d.category.toLowerCase().includes(c) || (d.active_symptoms_summary || '').toLowerCase().includes(c))) {
      score += 10;
    }

    if (score > 15) {
      matchedDiseases.push({
        disease: d,
        score: Math.min(98, score),
        matchedSymptoms: matchedSyms
      });
    }
  }

  matchedDiseases.sort((a, b) => b.score - a.score);
  const topDiseases = matchedDiseases.slice(0, 3);

  // 4. Retrieve Generic Monographs
  const matchedGenerics: GenericMonograph[] = [];
  const commonGenerics = [
    "Paracetamol", "Cefixime Trihydrate", "Omeprazole", "Esomeprazole", 
    "Fexofenadine Hydrochloride", "Azithromycin", "Ciprofloxacin", 
    "Metformin Hydrochloride", "Losartan Potassium", "Amlodipine", 
    "Montelukast", "Oral Rehydration Salt", "Salbutamol", "Pantoprazole",
    "Cetirizine Hydrochloride", "Diclofenac Sodium", "Calcium Carbonate"
  ];

  for (const genName of commonGenerics) {
    if (qLower.includes(genName.toLowerCase()) || 
        (genName === "Paracetamol" && (detectedCategories.includes("fever") || detectedCategories.includes("headache"))) ||
        (genName === "Omeprazole" && detectedCategories.includes("gastrointestinal")) ||
        (genName === "Salbutamol" && detectedCategories.includes("respiratory")) ||
        (genName === "Oral Rehydration Salt" && detectedCategories.includes("gastrointestinal"))
    ) {
      const mono = getGenericMonograph(genName);
      if (mono && !matchedGenerics.some(g => g.name === mono.name)) {
        matchedGenerics.push(mono);
      }
    }
  }

  // 5. Retrieve Matching Registered Brand Medicines
  const matchedBrandMedicines: BrandMedicineResult[] = [];
  if (matchedGenerics.length > 0) {
    const targetGen = matchedGenerics[0].name.toLowerCase();
    const candidateMeds = catalog.filter(m => (m.generic_name || '').toLowerCase().includes(targetGen)).slice(0, 4);

    for (const m of candidateMeds) {
      const unitMatch = String(m.package_container || '').match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
      const unitPrice = unitMatch ? Number(unitMatch[1].replace(/,/g, '')) : null;

      matchedBrandMedicines.push({
        id: String(m.id),
        name: m.brand_name || 'Medicine',
        generic: m.generic_name || 'Generic',
        strength: m.strength,
        form: m.dosage_form,
        company: m.manufacturer,
        price: unitPrice,
        priceBasis: 'unit',
        url: `/medicines/${m.id}`
      });
    }
  }

  // 6. Retrieve Relevant Educational Video
  let educationalVideo: EducationalVideo | undefined;
  if (detectedCategories.includes("respiratory") || qLower.includes("ইনহেলার") || qLower.includes("inhaler") || qLower.includes("হাঁপানি")) {
    educationalVideo = VERIFIED_VIDEOS.find(v => v.id === "inhaler_technique");
  } else if (detectedCategories.includes("gastrointestinal") || qLower.includes("স্যালাইন") || qLower.includes("ডায়রিয়া") || qLower.includes("ors")) {
    educationalVideo = VERIFIED_VIDEOS.find(v => v.id === "ors_prep");
  } else if (isEmergency || detectedCategories.includes("chest_pain") || qLower.includes("হার্ট") || qLower.includes("cpr")) {
    educationalVideo = VERIFIED_VIDEOS.find(v => v.id === "hands_only_cpr");
  } else if (detectedCategories.includes("diabetes") || qLower.includes("ইনসুলিন") || qLower.includes("insulin")) {
    educationalVideo = VERIFIED_VIDEOS.find(v => v.id === "insulin_pen");
  } else if (detectedCategories.includes("hypertension") || qLower.includes("প্রেশার") || qLower.includes("bp")) {
    educationalVideo = VERIFIED_VIDEOS.find(v => v.id === "blood_pressure");
  } else if (detectedCategories.includes("joint_pain") || qLower.includes("কোমর") || qLower.includes("ব্যায়াম")) {
    educationalVideo = VERIFIED_VIDEOS.find(v => v.id === "back_pain_physio");
  } else if (qLower.includes("ডেঙ্গু") || qLower.includes("dengue")) {
    educationalVideo = VERIFIED_VIDEOS.find(v => v.id === "dengue_care");
  }

  // 7. Recommended Specialty & Triage
  let recommendedSpecialty = "Medicine";
  let triageUrgency: 'routine' | 'soon' | 'urgent' | 'emergency' = 'routine';

  if (isEmergency) {
    recommendedSpecialty = "Cardiology";
    triageUrgency = 'emergency';
  } else if (detectedCategories.includes("respiratory")) {
    recommendedSpecialty = "Pulmonology";
    triageUrgency = 'soon';
  } else if (detectedCategories.includes("gastrointestinal")) {
    recommendedSpecialty = "Gastroenterology";
    triageUrgency = 'soon';
  } else if (detectedCategories.includes("joint_pain")) {
    recommendedSpecialty = "Orthopaedics";
  } else if (detectedCategories.includes("skin_allergy")) {
    recommendedSpecialty = "Dermatology";
  }

  // 8. Construct High-Yield Markdown Clinical Table
  let clinicalTableMarkdown = "";
  if (topDiseases.length > 0) {
    clinicalTableMarkdown = `| সম্ভাব্য সমস্যা (Condition) | ম্যাচ স্কোর | ট্রায়াজ মাত্রা | প্রস্তাবিত বিশেষজ্ঞ |\n| :--- | :--- | :--- | :--- |\n`;
    for (const d of topDiseases) {
      clinicalTableMarkdown += `| **${d.disease.bengali_name}** (${d.disease.name}) | ${d.score}% | **${d.disease.triage_level || 'Normal'}** | [${d.disease.category} বিশেষজ্ঞ](/doctors?specialty=${encodeURIComponent(recommendedSpecialty)}) |\n`;
    }
  } else if (matchedBrandMedicines.length > 0) {
    clinicalTableMarkdown = `| ব্র্যান্ডের নাম (Brand) | জেনেরিক ও শক্তি | প্রস্তুতকারক | আনুমানিক মূল্য (DGDA) |\n| :--- | :--- | :--- | :--- |\n`;
    for (const b of matchedBrandMedicines) {
      clinicalTableMarkdown += `| [**${b.name}**](${b.url}) | ${b.generic} (${b.strength || b.form}) | ${b.company} | ${b.price ? `৳ ${b.price.toFixed(2)}` : 'লিস্টেড'} |\n`;
    }
  }

  // 9. Build Comprehensive Grounding Context for LLMs
  let groundingContextText = `\n## VERIFIED MEDICAL RAG CONTEXT (EVIDENCE BASE):\n`;
  if (isEmergency) {
    groundingContextText += `🚨 CRITICAL EMERGENCY DETECTED: Promptly advise immediate emergency admission or calling 999.\n`;
  }

  if (topDiseases.length > 0) {
    groundingContextText += `### Retreived DGHS Clinical Diseases:\n`;
    for (const td of topDiseases) {
      groundingContextText += `- **${td.disease.bengali_name} (${td.disease.name})**: Triage=${td.disease.triage_level}, Category=${td.disease.category}, Symptoms=[${(td.disease.active_symptoms || []).slice(0, 5).join(', ')}]\n`;
    }
  }

  if (matchedGenerics.length > 0) {
    const mg = matchedGenerics[0];
    groundingContextText += `### Retreived Official Generic Monograph (${mg.name}):\n`;
    if (mg.indication_description) groundingContextText += `- Approved Indications: ${mg.indication_description.slice(0, 300)}...\n`;
    if (mg.dosage) groundingContextText += `- Dosage Guidelines: ${mg.dosage.slice(0, 200)}...\n`;
    if (mg.administration) groundingContextText += `- Administration Instructions: ${mg.administration.slice(0, 150)}...\n`;
    if (mg.side_effects) groundingContextText += `- Documented Side Effects: ${mg.side_effects.slice(0, 150)}...\n`;
    if (mg.precautions) groundingContextText += `- Precautions: ${mg.precautions.slice(0, 150)}...\n`;
  }

  if (matchedBrandMedicines.length > 0) {
    groundingContextText += `### Verified Bangladesh Brand Medicines:\n`;
    for (const bm of matchedBrandMedicines) {
      groundingContextText += `- [${bm.name}](${bm.url}) (${bm.generic} ${bm.strength || ''}) by ${bm.company} - Retail Price: ৳${bm.price || 'N/A'}\n`;
    }
  }

  if (educationalVideo) {
    groundingContextText += `### Educational Patient Video:\n- Embed Tag: [YOUTUBE:${educationalVideo.youtubeId}] (${educationalVideo.title_bn})\n`;
  }

  // 10. Generate Synthesized Offline Fallback Response with Tables, Links, and Media
  let synthesizedResponse = "";
  if (isEmergency) {
    synthesizedResponse = `\`\`\`json:emergency_alert\n{\n  "type": "emergency",\n  "condition": "Acute Clinical Emergency",\n  "severity": "critical",\n  "message": "অবিলম্বে জাতীয় জরুরি সেবা ৯৯৯ এ কল করুন বা নিকটস্থ হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।",\n  "callNumber": "999"\n}\n\`\`\`\n\n`;
    synthesizedResponse += `### 🚨 জরুরি স্বাস্থ্য সতর্কতা (Medical Emergency)\n\nআপনার উল্লেখিত শারীরিক লক্ষণ অত্যন্ত ঝুঁকিপূর্ণ ও জরুরি চিকিৎসাব্যবস্থা নির্দেশ করে। কোনো প্রকার কালবিলম্ব না করে অবিলম্বে রোগীকে নিকটস্থ হাসপাতালের জরুরি বিভাগে নিয়ে যান অথবা জাতীয় জরুরি সেবা **৯৯৯** নম্বরে কল করুন।\n\n`;
    if (educationalVideo) {
      synthesizedResponse += `#### 📹 জরুরি নির্দেশনামূলক ভিডিও:\n[YOUTUBE:${educationalVideo.youtubeId}]\n*${educationalVideo.title_bn}*\n\n`;
    }
  } else {
    synthesizedResponse += `### 🩺 ক্লিনিক্যাল মূল্যায়ন ও স্বাস্থ্য পরামর্শ\n\nআপনার প্রশ্ন ও লক্ষণের প্রেক্ষিতে চিকিৎসা প্রোটোকল অনুযায়ী নির্ভরযোগ্য তথ্য নিচে তুলে ধরা হলো:\n\n`;

    if (clinicalTableMarkdown) {
      synthesizedResponse += `${clinicalTableMarkdown}\n\n`;
    }

    if (matchedGenerics.length > 0) {
      const g = matchedGenerics[0];
      synthesizedResponse += `#### 💊 সংশ্লিষ্ট জেনেরিক তথ্য: **${g.name}**\n`;
      if (g.indication_description) {
        synthesizedResponse += `- **ব্যবহার ও নির্দেশনা:** ${g.indication_description.slice(0, 250)}...\n`;
      }
      if (g.dosage) {
        synthesizedResponse += `- **ডোজ ও সেবনবিধি:** ${g.dosage.slice(0, 200)}...\n`;
      }
      if (g.administration) {
        synthesizedResponse += `- **খাওয়ার নিয়ম:** ${g.administration.slice(0, 150)}...\n`;
      }
      if (g.side_effects) {
        synthesizedResponse += `- **সম্ভাব্য পার্শ্বপ্রতিক্রিয়া:** ${g.side_effects.slice(0, 150)}...\n`;
      }
      synthesizedResponse += `\n`;
    }

    if (matchedBrandMedicines.length > 0) {
      synthesizedResponse += `#### 🔍 অনুমোদিত বাংলাদেশি ব্র্যান্ডসমূহ:\n`;
      for (const bm of matchedBrandMedicines) {
        synthesizedResponse += `- [**${bm.name}**](${bm.url}) (${bm.generic} • ${bm.form || 'ট্যাবলেট'}) — প্রস্তুতকারক: ${bm.company} ${bm.price ? `(মূল্য: ৳ ${bm.price.toFixed(2)})` : ''}\n`;
      }
      synthesizedResponse += `\n`;
    }

    if (educationalVideo) {
      synthesizedResponse += `#### 📹 স্বাস্থ্য শিক্ষা ও নির্দেশনামূলক ভিডিও:\n[YOUTUBE:${educationalVideo.youtubeId}]\n*${educationalVideo.title_bn}*\n\n`;
    }

    synthesizedResponse += `\`\`\`json:doctor_recommendation\n{\n  "speciality": "${recommendedSpecialty}",\n  "reason": "লক্ষণগুলো নিখুঁতভাবে পরীক্ষা ও প্রেসক্রিপশনের জন্য বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন",\n  "urgency": "${triageUrgency}"\n}\n\`\`\`\n\n`;
    synthesizedResponse += `> ⚠️ **সতর্কতা:** এই পরামর্শটি শুধুমাত্র প্রাথমিক স্বাস্থ্য তথ্যের জন্য। যেকোনো ওষুধ বা চিকিৎসার চূড়ান্ত সিদ্ধান্তের পূর্বে একজন রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।\n`;
  }

  return {
    query,
    isHealthQuery: detectedCategories.length > 0 || matchedDiseases.length > 0 || matchedGenerics.length > 0,
    isEmergency,
    emergencyMessage,
    matchedDiseases: topDiseases,
    matchedGenerics,
    matchedBrandMedicines,
    educationalVideo,
    recommendedSpecialty,
    triageUrgency,
    clinicalTableMarkdown,
    groundingContextText,
    synthesizedResponse
  };
}
