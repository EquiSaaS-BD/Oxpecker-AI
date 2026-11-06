/**
 * Clinical Safety, Drug-Drug Interaction (DDI) & Duplicate Therapy Engine
 * Directorate General of Health Services (DGHS) & BMDC Prescribing Safety Guidelines
 */

export type InteractionSeverity = 
  | "CONTRAINDICATED"    // High mortality/toxicity risk: Avoid combination strictly
  | "MAJOR"              // Severe adverse event potential: Close monitoring or alternative required
  | "MODERATE"           // Reduced efficacy or increased side effects: Dose timing/adjustment needed
  | "DUPLICATE_THERAPY"  // Multiple brands of identical generic: Overdose hazard
  | "ALLERGY_WARNING";   // Patient known allergy cross-reactivity

export interface ClinicalAlert {
  id: string;
  severity: InteractionSeverity;
  headlineEn: string;
  headlineBn: string;
  drugA: { name: string; brand?: string };
  drugB?: { name: string; brand?: string };
  mechanism: string;
  clinicalRisk: string;
  managementAdviceEn: string;
  managementAdviceBn: string;
}

export interface ClinicalSafetyReport {
  overallRisk: "SAFE" | "CAUTION" | "HIGH_RISK" | "CRITICAL";
  hasCriticalAlerts: boolean;
  alerts: ClinicalAlert[];
  duplicateCount: number;
  totalInteractionsCount: number;
  checkedItemCount: number;
}

interface DDIRule {
  id: string;
  severity: InteractionSeverity;
  classA: string[]; // Generic keywords
  classB: string[];
  headlineEn: string;
  headlineBn: string;
  mechanism: string;
  clinicalRisk: string;
  adviceEn: string;
  adviceBn: string;
}

// Bangladesh High-Frequency Prescription Interaction Rules
const CLINICAL_DDI_RULES: DDIRule[] = [
  {
    id: "ddi-fluoroquinolone-multivalent-cations",
    severity: "MAJOR",
    classA: ["ciprofloxacin", "levofloxacin", "moxifloxacin", "ofloxacin"],
    classB: ["antacid", "calcium", "iron", "ferrous", "zinc", "magnesium", "sucralfate"],
    headlineEn: "Antibiotic Chelation Hazard (Severe Absorption Loss)",
    headlineBn: "অ্যান্টিবায়োটিক চিলেশন ঝুঁকি (ওষুধের কার্যকারিতা লোপ)",
    mechanism: "Multivalent metal cations (Al, Mg, Fe, Ca, Zn) form insoluble chelates with fluoroquinolones in the GI tract.",
    clinicalRisk: "Reduces antibiotic bioavailability by up to 70-85%, leading to clinical treatment failure and antimicrobial resistance.",
    adviceEn: "Administer the fluoroquinolone at least 2 hours before or 4-6 hours after antacids, iron, or calcium supplements.",
    adviceBn: "অ্যান্টিবায়োটিক সেবনের অন্তত ২ ঘণ্টা আগে অথবা ৪-৬ ঘণ্টা পরে অ্যান্টাসিড বা ক্যালসিয়াম/আয়রন সেবন করতে হবে।"
  },
  {
    id: "ddi-nsaid-anticoagulant-antiplatelet",
    severity: "CONTRAINDICATED",
    classA: ["ketorolac", "diclofenac", "naproxen", "ibuprofen", "aceclofenac", "indomethacin", "piroxicam"],
    classB: ["aspirin", "clopidogrel", "warfarin", "rivaroxaban", "apixaban", "heparin"],
    headlineEn: "Severe Gastrointestinal Hemorrhage & Bleeding Risk",
    headlineBn: "মারাত্মক গ্যাস্ট্রোইন্টেস্টাইনাল রক্তক্ষরণের ঝুঁকি",
    mechanism: "Synergistic inhibition of platelet aggregation combined with NSAID-induced gastric mucosal erosion.",
    clinicalRisk: "3x to 6x increased risk of acute upper GI bleeding, peptic ulcer perforation, and hematoma.",
    adviceEn: "Avoid co-administration. If analgesia is mandatory, substitute with Paracetamol or use a selective COX-2 inhibitor with aggressive PPI co-prescription.",
    adviceBn: "এই কম্বিনেশন পরিহার করুন। ব্যথানাশক প্রয়োজন হলে প্যারাসিটামল ব্যবহার করুন এবং চিকিৎসকের পরামর্শ নিন।"
  },
  {
    id: "ddi-ace-arb-potassium-sparing",
    severity: "MAJOR",
    classA: ["losartan", "valsartan", "olmesartan", "telmisartan", "enalapril", "ramipril", "captopril"],
    classB: ["spironolactone", "eplerenone", "potassium chloride"],
    headlineEn: "Life-Threatening Hyperkalemia Risk",
    headlineBn: "জীবনঘাতী হাইপারক্যালেমিয়া (অতিরিক্ত পটাশিয়াম) ঝুঁকি",
    mechanism: "Additive suppression of aldosterone synthesis causing impaired renal potassium excretion.",
    clinicalRisk: "Cardiac arrhythmias, muscle weakness, and cardiac arrest secondary to severe elevated serum potassium (> 5.5 mEq/L).",
    adviceEn: "Monitor serum potassium and creatinine within 1-2 weeks of initiation. Advise patient against salt substitutes containing potassium.",
    adviceBn: "নিয়মিত রক্তে পটাশিয়াম ও সিরাম ক্রিয়েটিনিন পরীক্ষা করুন এবং চিকিৎসকের সার্বক্ষণিক তত্ত্বাবধানে থাকুন।"
  },
  {
    id: "ddi-macrolide-statin",
    severity: "MAJOR",
    classA: ["clarithromycin", "erythromycin", "azithromycin"],
    classB: ["atorvastatin", "simvastatin", "lovastatin"],
    headlineEn: "Statin Toxicity & Rhabdomyolysis Risk",
    headlineBn: "স্ট্যাটিন টক্সিসিটি ও পেশী ক্ষয়ের (র‍্যাবডোমায়োলাইসিস) ঝুঁকি",
    mechanism: "Potent CYP3A4 inhibition by macrolide antibiotics significantly elevates systemic statin plasma concentrations.",
    clinicalRisk: "Severe myopathy, muscle pain, and potentially fatal acute renal failure from rhabdomyolysis.",
    adviceEn: "Temporarily suspend the statin during the antibiotic course, or consider Rosuvastatin which is less CYP3A4-dependent.",
    adviceBn: "অ্যান্টিবায়োটিক চলাকালীন সাময়িকভাবে স্ট্যাটিন বন্ধ রাখুন অথবা চিকিৎসকের পরামর্শে বিকল্প গ্রহণ করুন।"
  },
  {
    id: "ddi-ssri-tramadol",
    severity: "MAJOR",
    classA: ["tramadol"],
    classB: ["fluoxetine", "sertraline", "escitalopram", "paroxetine", "duloxetine", "venlafaxine"],
    headlineEn: "Serotonin Syndrome & Seizure Hazard",
    headlineBn: "সেরোটোনিন সিনড্রোম ও খিঁচুনির তীব্র ঝুঁকি",
    mechanism: "Additive serotonergic neurotransmission and inhibition of tramadol metabolism via CYP2D6.",
    clinicalRisk: "Hyperthermia, autonomic instability, neuromuscular rigidity, agitation, and seizures.",
    adviceEn: "Monitor closely for CNS toxicity or substitute Tramadol with non-serotonergic analgesics.",
    adviceBn: "অতিরিক্ত কাঁপুনি, অস্থিরতা বা জ্বর দেখা দিলে সাথে সাথে ওষুধ বন্ধ করে জরুরি হাসপাতালে যোগাযোগ করুন।"
  },
  {
    id: "ddi-metformin-contrast-renal",
    severity: "MODERATE",
    classA: ["metformin", "metformin hydrochloride"],
    classB: ["contrast media", "ibuprofen", "diclofenac", "naproxen"],
    headlineEn: "Renal Impairment & Lactic Acidosis Caution",
    headlineBn: "কিডনি চাপ ও ল্যাকটিক অ্যাসিডোসিস সতর্কতা",
    mechanism: "High NSAID or radiocontrast exposure can precipitate acute kidney injury, leading to Metformin accumulation.",
    clinicalRisk: "Rare but life-threatening metabolic lactic acidosis in dehydrated or elderly diabetic patients.",
    adviceEn: "Ensure adequate hydration. Withhold Metformin 48h prior to iodinated radiocontrast procedures.",
    adviceBn: "রোগীকে পর্যাপ্ত পানি পান করান এবং ক্রিয়েটিনিন মাত্রা নজরদারিতে রাখুন।"
  }
];

// High-risk allergy triggers
const ALLERGY_CROSS_REACTIVITY: Record<string, { triggers: string[]; nameBn: string }> = {
  "penicillin": {
    triggers: ["amoxicillin", "ampicillin", "flucloxacillin", "co-amoxiclav", "cloxacillin", "piperacillin"],
    nameBn: "পেনিসিলিন অ্যান্টিবায়োটিক অ্যালার্জি"
  },
  "cephalosporin": {
    triggers: ["cefixime", "cefuroxime", "ceftriaxone", "cefadroxil", "cephradine"],
    nameBn: "সেফালোস্পোরিন অ্যান্টিবায়োটিক অ্যালার্জি"
  },
  "sulfa": {
    triggers: ["cotrimoxazole", "sulfamethoxazole", "sulfasalazine"],
    nameBn: "সালফা ড্রাগ অ্যালার্জি"
  },
  "aspirin": {
    triggers: ["aspirin", "ibuprofen", "naproxen", "diclofenac", "ketorolac"],
    nameBn: "অ্যাসপিরিন ও এনএসএআইডি অ্যালার্জি"
  }
};

export interface PrescriptionMedicineInput {
  id: string | number;
  generic_name: string;
  brand_name: string;
  dosage_form?: string;
  strength?: string;
}

/**
 * Perform comprehensive clinical safety verification for a prescription.
 */
export function checkPrescriptionSafety(
  medicines: PrescriptionMedicineInput[],
  knownAllergies: string[] = [],
  chronicConditions: string[] = []
): ClinicalSafetyReport {
  const alerts: ClinicalAlert[] = [];
  let duplicateCount = 0;

  if (!medicines || medicines.length === 0) {
    return {
      overallRisk: "SAFE",
      hasCriticalAlerts: false,
      alerts: [],
      duplicateCount: 0,
      totalInteractionsCount: 0,
      checkedItemCount: 0,
    };
  }

  // 1. Check for Duplicate Therapy (Same generic prescribed under different brand names)
  const genericToBrands: Record<string, PrescriptionMedicineInput[]> = {};
  for (const m of medicines) {
    const gen = (m.generic_name || "").toLowerCase().trim();
    if (!gen) continue;
    if (!genericToBrands[gen]) genericToBrands[gen] = [];
    genericToBrands[gen].push(m);
  }

  for (const [gen, brandList] of Object.entries(genericToBrands)) {
    if (brandList.length > 1) {
      duplicateCount += brandList.length - 1;
      const brandNames = brandList.map(b => b.brand_name).join(", ");
      alerts.push({
        id: `dup-${gen}`,
        severity: "DUPLICATE_THERAPY",
        headlineEn: `Duplicate Therapy Detected: ${gen.toUpperCase()}`,
        headlineBn: `একই ওষুধের একাধিক ব্রান্ড প্রেসক্রাইব করা হয়েছে (${gen.toUpperCase()})`,
        drugA: { name: brandList[0].generic_name, brand: brandList[0].brand_name },
        drugB: { name: brandList[1].generic_name, brand: brandList[1].brand_name },
        mechanism: `Both '${brandList[0].brand_name}' and '${brandList[1].brand_name}' contain the active generic '${gen}'.`,
        clinicalRisk: `Accidental cumulative overdosing hazard, particularly dangerous for hepatotoxic drugs like Paracetamol or NSAIDs.`,
        managementAdviceEn: `Select only one brand for therapy: ${brandNames}. Discontinue redundant formulations.`,
        managementAdviceBn: `একই সাথে একাধিক ব্রান্ড (${brandNames}) সেবন করলে ওভারডোজ ও লিভারের ক্ষতি হতে পারে। যেকোনো একটি বেছে নিন।`
      });
    }
  }

  // 2. Check for Drug-Drug Interactions (Pairwise comparison)
  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const medA = medicines[i];
      const medB = medicines[j];
      const genA = (medA.generic_name || "").toLowerCase();
      const genB = (medB.generic_name || "").toLowerCase();

      for (const rule of CLINICAL_DDI_RULES) {
        const matchForward = rule.classA.some(k => genA.includes(k)) && rule.classB.some(k => genB.includes(k));
        const matchReverse = rule.classA.some(k => genB.includes(k)) && rule.classB.some(k => genA.includes(k));

        if (matchForward || matchReverse) {
          alerts.push({
            id: `${rule.id}-${medA.id}-${medB.id}`,
            severity: rule.severity,
            headlineEn: rule.headlineEn,
            headlineBn: rule.headlineBn,
            drugA: { name: medA.generic_name, brand: medA.brand_name },
            drugB: { name: medB.generic_name, brand: medB.brand_name },
            mechanism: rule.mechanism,
            clinicalRisk: rule.clinicalRisk,
            managementAdviceEn: rule.adviceEn,
            managementAdviceBn: rule.adviceBn
          });
        }
      }
    }
  }

  // 3. Check for Known Allergy Cross-reactivity
  const normalizedAllergies = knownAllergies.map(a => a.toLowerCase().trim());
  for (const med of medicines) {
    const gen = (med.generic_name || "").toLowerCase();
    for (const [allergyKey, data] of Object.entries(ALLERGY_CROSS_REACTIVITY)) {
      if (normalizedAllergies.some(a => a.includes(allergyKey) || allergyKey.includes(a))) {
        if (data.triggers.some(t => gen.includes(t))) {
          alerts.push({
            id: `allergy-${allergyKey}-${med.id}`,
            severity: "ALLERGY_WARNING",
            headlineEn: `Severe Patient Allergy Alert: ${data.nameBn}`,
            headlineBn: `রোগীর অ্যালার্জি সতর্কতা: ${med.brand_name} (${med.generic_name})`,
            drugA: { name: med.generic_name, brand: med.brand_name },
            mechanism: `Patient has a documented hypersensitivity to ${allergyKey}.`,
            clinicalRisk: "Risk of anaphylaxis, severe bronchospasm, angioedema, or cutaneous drug eruptions.",
            managementAdviceEn: `Do NOT administer ${med.brand_name}. Substitute with a structurally unrelated drug class.`,
            managementAdviceBn: `রোগীর এই ওষুধের প্রতি অ্যালার্জি আছে। বিকল্প গ্রুপের ওষুধ ব্যবহার করুন।`
          });
        }
      }
    }
  }

  // Determine overall risk
  const hasContraindicated = alerts.some(a => a.severity === "CONTRAINDICATED" || a.severity === "ALLERGY_WARNING");
  const hasMajor = alerts.some(a => a.severity === "MAJOR" || a.severity === "DUPLICATE_THERAPY");
  const hasModerate = alerts.some(a => a.severity === "MODERATE");

  let overallRisk: ClinicalSafetyReport["overallRisk"] = "SAFE";
  if (hasContraindicated) overallRisk = "CRITICAL";
  else if (hasMajor) overallRisk = "HIGH_RISK";
  else if (hasModerate) overallRisk = "CAUTION";

  return {
    overallRisk,
    hasCriticalAlerts: hasContraindicated || hasMajor,
    alerts,
    duplicateCount,
    totalInteractionsCount: alerts.length,
    checkedItemCount: medicines.length
  };
}
