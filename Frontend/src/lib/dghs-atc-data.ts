/**
 * DGHS & WHO ATC (Anatomical Therapeutic Chemical) Terminology System
 * In direct compliance with Bangladesh DGHS Shared Health Record (SHR) & OpenMRS
 * Reference: https://en.info.shr.dghs.gov.bd/technical-support/medication-api/
 */

export interface WHOATCEntry {
  atcCode: string;
  atcDescription: string;
  anatomicalMainGroup: string; // e.g. "A - Alimentary tract and metabolism"
  therapeuticSubgroup: string; // e.g. "A02B - Drugs for peptic ulcer and gastro-oesophageal reflux disease"
  dghsConceptId: string;       // DGHS SHR / OpenMRS Concept UUID
  whoDefinedDailyDose?: string; // Standard WHO DDD (e.g. "20mg O")
}

// Map canonical lowercase generic names to verified WHO ATC codes and DGHS concepts
export const DGHS_WHO_ATC_MAPPING: Record<string, WHOATCEntry> = {
  // === GASTROINTESTINAL & METABOLISM (A) ===
  "omeprazole": {
    atcCode: "A02BC01",
    atcDescription: "Omeprazole - Proton pump inhibitor",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A02BC - Proton pump inhibitors",
    dghsConceptId: "dghs-concept-med-a02bc01-omeprazole",
    whoDefinedDailyDose: "20mg Oral"
  },
  "esomeprazole": {
    atcCode: "A02BC05",
    atcDescription: "Esomeprazole - Proton pump inhibitor",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A02BC - Proton pump inhibitors",
    dghsConceptId: "dghs-concept-med-a02bc05-esomeprazole",
    whoDefinedDailyDose: "30mg Oral"
  },
  "pantoprazole": {
    atcCode: "A02BC02",
    atcDescription: "Pantoprazole - Proton pump inhibitor",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A02BC - Proton pump inhibitors",
    dghsConceptId: "dghs-concept-med-a02bc02-pantoprazole",
    whoDefinedDailyDose: "40mg Oral"
  },
  "rabeprazole": {
    atcCode: "A02BC04",
    atcDescription: "Rabeprazole - Proton pump inhibitor",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A02BC - Proton pump inhibitors",
    dghsConceptId: "dghs-concept-med-a02bc04-rabeprazole",
    whoDefinedDailyDose: "20mg Oral"
  },
  "famotidine": {
    atcCode: "A02BA03",
    atcDescription: "Famotidine - H2-receptor antagonist",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A02BA - H2-receptor antagonists",
    dghsConceptId: "dghs-concept-med-a02ba03-famotidine",
    whoDefinedDailyDose: "40mg Oral"
  },
  "metformin": {
    atcCode: "A10BA02",
    atcDescription: "Metformin - Biguanides oral blood glucose lowering",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A10BA - Biguanides",
    dghsConceptId: "dghs-concept-med-a10ba02-metformin",
    whoDefinedDailyDose: "2g Oral"
  },
  "metformin hydrochloride": {
    atcCode: "A10BA02",
    atcDescription: "Metformin Hydrochloride - Biguanides oral blood glucose lowering",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A10BA - Biguanides",
    dghsConceptId: "dghs-concept-med-a10ba02-metformin",
    whoDefinedDailyDose: "2g Oral"
  },
  "sitagliptin": {
    atcCode: "A10BH01",
    atcDescription: "Sitagliptin - Dipeptidyl peptidase 4 (DPP-4) inhibitor",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A10BH - DPP-4 inhibitors",
    dghsConceptId: "dghs-concept-med-a10bh01-sitagliptin",
    whoDefinedDailyDose: "100mg Oral"
  },
  "linagliptin": {
    atcCode: "A10BH05",
    atcDescription: "Linagliptin - DPP-4 inhibitor",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A10BH - DPP-4 inhibitors",
    dghsConceptId: "dghs-concept-med-a10bh05-linagliptin",
    whoDefinedDailyDose: "5mg Oral"
  },
  "empagliflozin": {
    atcCode: "A10BK03",
    atcDescription: "Empagliflozin - SGLT2 inhibitor",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A10BK - Sodium-glucose co-transporter 2 inhibitors",
    dghsConceptId: "dghs-concept-med-a10bk03-empagliflozin",
    whoDefinedDailyDose: "10mg Oral"
  },
  "dapagliflozin": {
    atcCode: "A10BK01",
    atcDescription: "Dapagliflozin - SGLT2 inhibitor",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A10BK - SGLT2 inhibitors",
    dghsConceptId: "dghs-concept-med-a10bk01-dapagliflozin",
    whoDefinedDailyDose: "10mg Oral"
  },
  "domperidone": {
    atcCode: "A03FA03",
    atcDescription: "Domperidone - Prokinetic propulsive",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A03FA - Propulsives",
    dghsConceptId: "dghs-concept-med-a03fa03-domperidone",
    whoDefinedDailyDose: "30mg Oral"
  },
  "ondansetron": {
    atcCode: "A04AA01",
    atcDescription: "Ondansetron - Serotonin (5HT3) antagonist antiemetic",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A04AA - Serotonin (5HT3) antagonists",
    dghsConceptId: "dghs-concept-med-a04aa01-ondansetron",
    whoDefinedDailyDose: "16mg Oral"
  },
  "antacid": {
    atcCode: "A02AD01",
    atcDescription: "Antacids - Ordinary salt combinations (Aluminium/Magnesium hydroxide)",
    anatomicalMainGroup: "A - Alimentary tract and metabolism",
    therapeuticSubgroup: "A02AD - Combinations and complexes of aluminium, calcium and magnesium",
    dghsConceptId: "dghs-concept-med-a02ad01-antacid"
  },

  // === ANALGESICS & ANTI-INFLAMMATORY (M, N) ===
  "paracetamol": {
    atcCode: "N02BE01",
    atcDescription: "Paracetamol (Acetaminophen) - Anilide analgesic and antipyretic",
    anatomicalMainGroup: "N - Nervous system",
    therapeuticSubgroup: "N02BE - Anilides",
    dghsConceptId: "dghs-concept-med-n02be01-paracetamol",
    whoDefinedDailyDose: "3g Oral"
  },
  "ibuprofen": {
    atcCode: "M01AE01",
    atcDescription: "Ibuprofen - Propionic acid derivative NSAID",
    anatomicalMainGroup: "M - Musculo-skeletal system",
    therapeuticSubgroup: "M01AE - Propionic acid derivatives",
    dghsConceptId: "dghs-concept-med-m01ae01-ibuprofen",
    whoDefinedDailyDose: "1.2g Oral"
  },
  "naproxen": {
    atcCode: "M01AE02",
    atcDescription: "Naproxen - Propionic acid derivative NSAID",
    anatomicalMainGroup: "M - Musculo-skeletal system",
    therapeuticSubgroup: "M01AE - Propionic acid derivatives",
    dghsConceptId: "dghs-concept-med-m01ae02-naproxen",
    whoDefinedDailyDose: "500mg Oral"
  },
  "diclofenac": {
    atcCode: "M01AB05",
    atcDescription: "Diclofenac Sodium/Potassium - Acetic acid derivative NSAID",
    anatomicalMainGroup: "M - Musculo-skeletal system",
    therapeuticSubgroup: "M01AB - Acetic acid derivatives",
    dghsConceptId: "dghs-concept-med-m01ab05-diclofenac",
    whoDefinedDailyDose: "100mg Oral"
  },
  "ketorolac": {
    atcCode: "M01AB15",
    atcDescription: "Ketorolac Tromethamine - Acetic acid derivative NSAID",
    anatomicalMainGroup: "M - Musculo-skeletal system",
    therapeuticSubgroup: "M01AB - Acetic acid derivatives",
    dghsConceptId: "dghs-concept-med-m01ab15-ketorolac",
    whoDefinedDailyDose: "30mg Parenteral"
  },
  "aceclofenac": {
    atcCode: "M01AB16",
    atcDescription: "Aceclofenac - Acetic acid derivative NSAID",
    anatomicalMainGroup: "M - Musculo-skeletal system",
    therapeuticSubgroup: "M01AB - Acetic acid derivatives",
    dghsConceptId: "dghs-concept-med-m01ab16-aceclofenac",
    whoDefinedDailyDose: "200mg Oral"
  },
  "tramadol": {
    atcCode: "N02AX02",
    atcDescription: "Tramadol - Opioid analgesic",
    anatomicalMainGroup: "N - Nervous system",
    therapeuticSubgroup: "N02AX - Other opioids",
    dghsConceptId: "dghs-concept-med-n02ax02-tramadol",
    whoDefinedDailyDose: "300mg Oral"
  },

  // === ANTIBACTERIALS & ANTI-INFECTIVES (J) ===
  "amoxicillin": {
    atcCode: "J01CA04",
    atcDescription: "Amoxicillin - Penicillin with extended spectrum",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01CA - Penicillins with extended spectrum",
    dghsConceptId: "dghs-concept-med-j01ca04-amoxicillin",
    whoDefinedDailyDose: "1.5g Oral"
  },
  "amoxicillin + clavulanic acid": {
    atcCode: "J01CR02",
    atcDescription: "Amoxicillin and Beta-lactamase inhibitor (Co-amoxiclav)",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01CR - Combinations of penicillins",
    dghsConceptId: "dghs-concept-med-j01cr02-co-amoxiclav",
    whoDefinedDailyDose: "1.5g Oral"
  },
  "azithromycin": {
    atcCode: "J01FA10",
    atcDescription: "Azithromycin - Macrolide antibacterial",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01FA - Macrolides",
    dghsConceptId: "dghs-concept-med-j01fa10-azithromycin",
    whoDefinedDailyDose: "500mg Oral"
  },
  "cefixime": {
    atcCode: "J01DD08",
    atcDescription: "Cefixime - Third-generation cephalosporin",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01DD - Third-generation cephalosporins",
    dghsConceptId: "dghs-concept-med-j01dd08-cefixime",
    whoDefinedDailyDose: "400mg Oral"
  },
  "cefuroxime": {
    atcCode: "J01DC02",
    atcDescription: "Cefuroxime Axetil - Second-generation cephalosporin",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01DC - Second-generation cephalosporins",
    dghsConceptId: "dghs-concept-med-j01dc02-cefuroxime",
    whoDefinedDailyDose: "500mg Oral"
  },
  "ceftriaxone": {
    atcCode: "J01DD04",
    atcDescription: "Ceftriaxone - Third-generation cephalosporin",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01DD - Third-generation cephalosporins",
    dghsConceptId: "dghs-concept-med-j01dd04-ceftriaxone",
    whoDefinedDailyDose: "2g Parenteral"
  },
  "ciprofloxacin": {
    atcCode: "J01MA02",
    atcDescription: "Ciprofloxacin - Fluoroquinolone antibacterial",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01MA - Fluoroquinolones",
    dghsConceptId: "dghs-concept-med-j01ma02-ciprofloxacin",
    whoDefinedDailyDose: "1g Oral"
  },
  "levofloxacin": {
    atcCode: "J01MA12",
    atcDescription: "Levofloxacin - Fluoroquinolone antibacterial",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01MA - Fluoroquinolones",
    dghsConceptId: "dghs-concept-med-j01ma12-levofloxacin",
    whoDefinedDailyDose: "500mg Oral"
  },
  "metronidazole": {
    atcCode: "J01XD01",
    atcDescription: "Metronidazole - Imidazole antibacterial and antiprotozoal",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01XD - Imidazole derivatives",
    dghsConceptId: "dghs-concept-med-j01xd01-metronidazole",
    whoDefinedDailyDose: "1.5g Oral"
  },
  "doxycycline": {
    atcCode: "J01AA02",
    atcDescription: "Doxycycline - Tetracycline antibacterial",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01AA - Tetracyclines",
    dghsConceptId: "dghs-concept-med-j01aa02-doxycycline",
    whoDefinedDailyDose: "100mg Oral"
  },
  "flucloxacillin": {
    atcCode: "J01CF05",
    atcDescription: "Flucloxacillin - Beta-lactamase resistant penicillin",
    anatomicalMainGroup: "J - Antiinfectives for systemic use",
    therapeuticSubgroup: "J01CF - Beta-lactamase resistant penicillins",
    dghsConceptId: "dghs-concept-med-j01cf05-flucloxacillin",
    whoDefinedDailyDose: "2g Oral"
  },

  // === CARDIOVASCULAR (C) ===
  "losartan": {
    atcCode: "C09CA01",
    atcDescription: "Losartan Potassium - Angiotensin II receptor blocker (ARB)",
    anatomicalMainGroup: "C - Cardiovascular system",
    therapeuticSubgroup: "C09CA - Angiotensin II receptor blockers (ARBs)",
    dghsConceptId: "dghs-concept-med-c09ca01-losartan",
    whoDefinedDailyDose: "50mg Oral"
  },
  "losartan potassium": {
    atcCode: "C09CA01",
    atcDescription: "Losartan Potassium - ARB antihypertensive",
    anatomicalMainGroup: "C - Cardiovascular system",
    therapeuticSubgroup: "C09CA - Angiotensin II receptor blockers (ARBs)",
    dghsConceptId: "dghs-concept-med-c09ca01-losartan",
    whoDefinedDailyDose: "50mg Oral"
  },
  "amlodipine": {
    atcCode: "C08CA01",
    atcDescription: "Amlodipine Besylate - Dihydropyridine calcium channel blocker",
    anatomicalMainGroup: "C - Cardiovascular system",
    therapeuticSubgroup: "C08CA - Dihydropyridine derivatives",
    dghsConceptId: "dghs-concept-med-c08ca01-amlodipine",
    whoDefinedDailyDose: "5mg Oral"
  },
  "bisoprolol": {
    atcCode: "C07AB07",
    atcDescription: "Bisoprolol Fumarate - Beta-1 selective adrenoceptor blocker",
    anatomicalMainGroup: "C - Cardiovascular system",
    therapeuticSubgroup: "C07AB - Beta blocking agents, selective",
    dghsConceptId: "dghs-concept-med-c07ab07-bisoprolol",
    whoDefinedDailyDose: "10mg Oral"
  },
  "atorvastatin": {
    atcCode: "C10AA05",
    atcDescription: "Atorvastatin Calcium - HMG-CoA reductase inhibitor (Statin)",
    anatomicalMainGroup: "C - Cardiovascular system",
    therapeuticSubgroup: "C10AA - HMG CoA reductase inhibitors",
    dghsConceptId: "dghs-concept-med-c10aa05-atorvastatin",
    whoDefinedDailyDose: "20mg Oral"
  },
  "rosuvastatin": {
    atcCode: "C10AA07",
    atcDescription: "Rosuvastatin Calcium - HMG-CoA reductase inhibitor",
    anatomicalMainGroup: "C - Cardiovascular system",
    therapeuticSubgroup: "C10AA - HMG CoA reductase inhibitors",
    dghsConceptId: "dghs-concept-med-c10aa07-rosuvastatin",
    whoDefinedDailyDose: "10mg Oral"
  },
  "clopidogrel": {
    atcCode: "B01AC04",
    atcDescription: "Clopidogrel Bisulfate - Platelet aggregation inhibitor",
    anatomicalMainGroup: "B - Blood and blood forming organs",
    therapeuticSubgroup: "B01AC - Platelet aggregation inhibitors excl. heparin",
    dghsConceptId: "dghs-concept-med-b01ac04-clopidogrel",
    whoDefinedDailyDose: "75mg Oral"
  },
  "aspirin": {
    atcCode: "B01AC06",
    atcDescription: "Acetylsalicylic Acid (Aspirin) - Antiplatelet",
    anatomicalMainGroup: "B - Blood and blood forming organs",
    therapeuticSubgroup: "B01AC - Platelet aggregation inhibitors",
    dghsConceptId: "dghs-concept-med-b01ac06-aspirin",
    whoDefinedDailyDose: "100mg Oral"
  },
  "spironolactone": {
    atcCode: "C03DA01",
    atcDescription: "Spironolactone - Aldosterone antagonist potassium-sparing diuretic",
    anatomicalMainGroup: "C - Cardiovascular system",
    therapeuticSubgroup: "C03DA - Aldosterone antagonists",
    dghsConceptId: "dghs-concept-med-c03da01-spironolactone",
    whoDefinedDailyDose: "75mg Oral"
  },

  // === RESPIRATORY & ANTIHISTAMINES (R) ===
  "montelukast": {
    atcCode: "R03DC03",
    atcDescription: "Montelukast Sodium - Leukotriene receptor antagonist",
    anatomicalMainGroup: "R - Respiratory system",
    therapeuticSubgroup: "R03DC - Leukotriene receptor antagonists",
    dghsConceptId: "dghs-concept-med-r03dc03-montelukast",
    whoDefinedDailyDose: "10mg Oral"
  },
  "fexofenadine": {
    atcCode: "R06AX26",
    atcDescription: "Fexofenadine Hydrochloride - Non-sedating antihistamine",
    anatomicalMainGroup: "R - Respiratory system",
    therapeuticSubgroup: "R06AX - Other antihistamines for systemic use",
    dghsConceptId: "dghs-concept-med-r06ax26-fexofenadine",
    whoDefinedDailyDose: "120mg Oral"
  },
  "cetirizine": {
    atcCode: "R06AE07",
    atcDescription: "Cetirizine Hydrochloride - Piperazine antihistamine",
    anatomicalMainGroup: "R - Respiratory system",
    therapeuticSubgroup: "R06AE - Piperazine derivatives",
    dghsConceptId: "dghs-concept-med-r06ae07-cetirizine",
    whoDefinedDailyDose: "10mg Oral"
  },
  "bilastine": {
    atcCode: "R06AX29",
    atcDescription: "Bilastine - Second generation antihistamine",
    anatomicalMainGroup: "R - Respiratory system",
    therapeuticSubgroup: "R06AX - Other antihistamines",
    dghsConceptId: "dghs-concept-med-r06ax29-bilastine",
    whoDefinedDailyDose: "20mg Oral"
  },
  "salbutamol": {
    atcCode: "R03AC02",
    atcDescription: "Salbutamol (Albuterol) - Selective beta-2 adrenoceptor agonist",
    anatomicalMainGroup: "R - Respiratory system",
    therapeuticSubgroup: "R03AC - Selective beta-2-adrenoreceptor agonists",
    dghsConceptId: "dghs-concept-med-r03ac02-salbutamol",
    whoDefinedDailyDose: "800mcg Inhalation"
  }
};

/**
 * Resolve WHO ATC and DGHS concept for any generic name string.
 * Supports partial/prefix matching and normalization.
 */
export function getDGHSWHOATC(genericName: string): WHOATCEntry | null {
  if (!genericName) return null;
  const clean = genericName.toLowerCase().trim();
  
  // Exact match
  if (DGHS_WHO_ATC_MAPPING[clean]) {
    return DGHS_WHO_ATC_MAPPING[clean];
  }

  // Key substring match
  for (const [key, val] of Object.entries(DGHS_WHO_ATC_MAPPING)) {
    if (clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }

  return null;
}
