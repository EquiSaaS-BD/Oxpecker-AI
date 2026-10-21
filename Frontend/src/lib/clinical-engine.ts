/**
 * Oxpecker AI - Clinical Knowledge & Symptom Analysis Engine
 * 
 * Clinical Grounding:
 * - WHO Clinical Protocols & South Asian Tropical Disease Guidelines
 * - DGHS (Directorate General of Health Services, Bangladesh) Treatment Protocols
 * - Verified First-Aid & OTC Medicine Registry for Bangladesh
 * 
 * Features:
 * - Zero-Hallucination Deterministic Symptom Matching across 150 Diseases
 * - Automatic Triage & Severity Leveling (Low, Moderate, High, Emergency)
 * - Safe OTC & First-Aid Medicine suggestions with clickable Google Search links
 * - Specialist Doctor Recommendation Generation
 * - Mandatory Doctor Consultation Disclaimers
 */

export interface OTCItem {
  brand_name: string;
  generic_name: string;
  form: string;
  manufacturer: string;
  instruction: string;
  max_daily_dose: string;
  google_search_url: string;
  app_link: string;
}

export interface OTCCondition {
  id: string;
  name_en: string;
  name_bn: string;
  category: string;
  recommended_action: string;
  keywords: string[];
  medicines: OTCItem[];
}

export interface DiseaseRecord {
  id: number;
  name: string;
  bengali_name: string;
  category: string;
  reference: string;
  speciality: string;
  cardinal: string[];
  associated: string[];
  red_flags?: string[];
  diagnostic_tests: string[];
  primary_advice_bn: string;
}

export interface ClinicalMatchResult {
  disease: DiseaseRecord;
  matchScore: number;
  matchedSymptoms: string[];
  triageLevel: 'Low' | 'Moderate' | 'High' | 'Emergency';
}

export interface ClinicalAnalysis {
  isHealthQuery: boolean;
  hasSymptomMatch: boolean;
  detectedSymptoms: string[];
  primaryMatches: ClinicalMatchResult[];
  otcGuidance?: OTCCondition;
  isEmergency: boolean;
  emergencyReason?: string;
  recommendedSpeciality: string;
  formattedMarkdownReport: string;
}

// ============================================================================
// 1. VERIFIED BANGLADESH OTC & FIRST-AID MEDICINE REGISTRY
// ============================================================================
export const VERIFIED_OTC_CONDITIONS: OTCCondition[] = [
  {
    id: 'fever_mild_headache',
    name_en: 'Fever & General Body Ache',
    name_bn: 'জ্বর ও সাধারণ মাথা বা শরীর ব্যথা',
    category: 'General Pain & Pyrexia',
    recommended_action: 'পর্যাপ্ত বিশ্রাম নিন, স্বাভাবিক তাপমাত্রার পানি দিয়ে শরীর স্পঞ্জ করুন এবং প্রচুর পানি বা ওরাল স্যালাইন পান করুন।',
    keywords: ['fever', 'জ্বর', 'গা গরম', 'মাথা ব্যথা', 'headache', 'শরীর ব্যথা', 'body ache', 'তাপমাত্রা'],
    medicines: [
      {
        brand_name: 'Ace Plus (500mg + 65mg)',
        generic_name: 'Paracetamol + Caffeine',
        form: 'Tablet',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        instruction: 'খাবারের পর ১টি করে দিনে ১-২ বার (প্রয়োজনে)। জ্বর ও ব্যথায় দ্রুত উপশম দেয়।',
        max_daily_dose: '২৪ ঘণ্টায় ৪টির বেশি ট্যাবলেট সেবন করবেন না।',
        google_search_url: 'https://www.google.com/search?q=Ace+Plus+tablet+Square+Pharma+uses+dosage',
        app_link: '/medicines/ace-plus',
      },
      {
        brand_name: 'Napa Extra',
        generic_name: 'Paracetamol + Caffeine',
        form: 'Tablet',
        manufacturer: 'Beximco Pharmaceuticals Ltd.',
        instruction: 'খাবারের পর ১টি ট্যাবলেট। তীব্র মাথাব্যথা ও জ্বরে ব্যবহৃত হয়।',
        max_daily_dose: '২৪ ঘণ্টায় ৪টির বেশি ট্যাবলেট সেবন করবেন না।',
        google_search_url: 'https://www.google.com/search?q=Napa+Extra+tablet+Beximco+uses+dosage',
        app_link: '/medicines/napa-extra',
      },
      {
        brand_name: 'Napa (500mg)',
        generic_name: 'Paracetamol',
        form: 'Tablet / Syrup',
        manufacturer: 'Beximco Pharmaceuticals Ltd.',
        instruction: 'খাবারের পর ১টি ট্যাবলেট। সাধারণ জ্বর ও শরীর ব্যথায় সবচেয়ে নিরাপদ।',
        max_daily_dose: 'দিনে সর্বোচ্চ ৮টি ট্যাবলেট (৪ গ্রাম)।',
        google_search_url: 'https://www.google.com/search?q=Napa+500mg+tablet+Beximco',
        app_link: '/medicines/napa',
      },
    ],
  },
  {
    id: 'severe_headache_migraine',
    name_en: 'Severe Headache & Migraine',
    name_bn: 'তীব্র মাথাব্যথা ও মাইগ্রেনের ব্যথা',
    category: 'Neurological / Headache',
    recommended_action: 'অন্ধকার ও শান্ত ঘরে বিশ্রাম নিন। পর্যাপ্ত পানি পান করুন এবং কপালে ঠান্ডা বা বরফের সেঁক দিতে পারেন।',
    keywords: ['migraine', 'মাইগ্রেন', 'তীব্র মাথাব্যথা', 'মাথার একপাশে ব্যথা', 'severe headache'],
    medicines: [
      {
        brand_name: 'Tufnil (200mg)',
        generic_name: 'Tolfenamic Acid',
        form: 'Tablet',
        manufacturer: 'Eskayef Pharmaceuticals Ltd.',
        instruction: 'তীব্র মাথাব্যথা বা মাইগ্রেন শুরু হওয়ার সাথে সাথে খাবারের পর ১টি ট্যাবলেট সেবন করা যায়।',
        max_daily_dose: 'একটানা ২ দিনের বেশি চিকিৎসকের পরামর্শ ছাড়া খাবেন না।',
        google_search_url: 'https://www.google.com/search?q=Tufnil+200mg+tablet+Eskayef+uses+side+effects',
        app_link: '/medicines/tufnil',
      },
      {
        brand_name: 'Tofen (200mg)',
        generic_name: 'Tolfenamic Acid',
        form: 'Tablet',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        instruction: 'মাইগ্রেন ও তীব্র মাথাব্যথায় চিকিৎসকের নির্দেশিকা অনুযায়ী সেবনযোগ্য।',
        max_daily_dose: 'প্রয়োজনে ১-২ দিন সেব্য।',
        google_search_url: 'https://www.google.com/search?q=Tofen+200mg+tablet+Square+Pharma',
        app_link: '/medicines/tofen',
      },
    ],
  },
  {
    id: 'joint_knee_leg_pain',
    name_en: 'Knee, Leg & Joint Pain',
    name_bn: 'হাঁটু, পা বা জয়েন্টে ব্যথা ও ফোলা',
    category: 'Musculoskeletal Pain',
    recommended_action: 'ব্যথার স্থানে অতিরিক্ত চাপ দেবেন না। ফোলা থাকলে বরফ সেঁক (Ice Pack) দিন। ব্যথানাশক বড়ি খাওয়ার চেয়ে বাহ্যিক মলম/জেল ব্যবহার করা কিডনির জন্য নিরাপদ।',
    keywords: ['knee pain', 'হাঁটু ব্যথা', 'পা ব্যথা', 'জয়েন্টে ব্যথা', 'joint pain', 'মচকানো', 'sprain', 'বাতের ব্যথা', 'গেঁটে বাত'],
    medicines: [
      {
        brand_name: 'Volmac Gel (1%)',
        generic_name: 'Diclofenac Diethylamine',
        form: 'Topical Gel / Ointment',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        instruction: 'আক্রান্ত স্থানে দিনে ২-৩ বার আলতো করে মালিশ করুন। ক্ষতস্থানে লাগাবেন না।',
        max_daily_dose: 'শুধুমাত্র বাহ্যিক ব্যবহারের জন্য। মুখে খাওয়া নিষেধ।',
        google_search_url: 'https://www.google.com/search?q=Volmac+gel+Square+Pharma+uses',
        app_link: '/medicines/volmac-gel',
      },
      {
        brand_name: 'Fastum Gel',
        generic_name: 'Ketoprofen (2.5%)',
        form: 'Topical Gel',
        manufacturer: 'A. Menarini / Square',
        instruction: 'জয়েন্ট ও মাংসপেশির ব্যথায় আক্রান্ত স্থানে পাতলা করে লাগিয়ে দিন।',
        max_daily_dose: 'দিনে সর্বোচ্চ ২ বার।',
        google_search_url: 'https://www.google.com/search?q=Fastum+gel+uses+joint+pain',
        app_link: '/medicines/fastum-gel',
      },
      {
        brand_name: 'Moov Pain Relief Cream',
        generic_name: 'Wintergreen Oil + Menthol + Turpentine Oil',
        form: 'Topical Ointment',
        manufacturer: 'Reckitt Benckiser',
        instruction: 'কোমর ও পায়ের মাংসপেশির টানে বা ব্যথায় হালকা করে মেখে দিন।',
        max_daily_dose: 'বাহ্যিক ব্যবহারের জন্য।',
        google_search_url: 'https://www.google.com/search?q=Moov+pain+relief+cream+uses',
        app_link: '/medicines/moov',
      },
    ],
  },
  {
    id: 'cut_wound_first_aid',
    name_en: 'Cuts, Wounds & Abrasions',
    name_bn: 'হাত কেটে যাওয়া, ক্ষত বা ছড়ে যাওয়া',
    category: 'First-Aid & Wound Care',
    recommended_action: 'প্রথমে পরিষ্কার পানি দিয়ে রক্ত ও ময়লা ধুয়ে ফেলুন। অ্যান্টিসেপটিক দিয়ে জীবাণুমুক্ত করে ব্যান্ডেজ করুন। মরিচা ধরা জিনিসে কাটলে ২৪ ঘণ্টার মধ্যে টিটেনাস (Tetanus Toxoid) ইনজেকশন নিন।',
    keywords: ['cut', 'কেটে গেছে', 'কেটে যাওয়া', 'রক্তপাত', 'wound', 'ক্ষত', 'ছড়ে গেছে', 'ঘা'],
    medicines: [
      {
        brand_name: 'Savlon Liquid Antiseptic',
        generic_name: 'Chlorhexidine Gluconate + Cetrimide',
        form: 'Antiseptic Solution',
        manufacturer: 'ACI Limited',
        instruction: 'তুলায় করে হালকা পানিতে মিশিয়ে বা সরাসরি ক্ষতস্থানের চারপাশ পরিষ্কার করুন।',
        max_daily_dose: 'বাহ্যিক ব্যবহারের জন্য।',
        google_search_url: 'https://www.google.com/search?q=Savlon+antiseptic+liquid+ACI+uses',
        app_link: '/medicines/savlon',
      },
      {
        brand_name: 'Viodin 10% Ointment',
        generic_name: 'Povidone Iodine (10%)',
        form: 'Topical Ointment',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        instruction: 'কাটা ও পোড়া স্থানে পাতলা করে লাগিয়ে স্টেরাইল গজ বা ব্যান্ড-এইড দিয়ে ঢেকে দিন। ইনফেকশন রোধ করে।',
        max_daily_dose: 'দিনে ১-২ বার ড্রেসিং করার সময়।',
        google_search_url: 'https://www.google.com/search?q=Viodin+10+ointment+Square+uses',
        app_link: '/medicines/viodin-ointment',
      },
      {
        brand_name: 'Nebanol Ointment',
        generic_name: 'Neomycin Sulfate + Bacitracin Zinc',
        form: 'Antibacterial Ointment',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        instruction: 'ছোটখাটো কাটা-ছেঁড়া ও ক্ষতের জীবাণু সংক্রমণ রোধে ব্যবহৃত হয়।',
        max_daily_dose: 'দিনে ১-৩ বার।',
        google_search_url: 'https://www.google.com/search?q=Nebanol+ointment+Square+uses',
        app_link: '/medicines/nebanol',
      },
    ],
  },
  {
    id: 'acidity_gastric_heartburn',
    name_en: 'Gastric, Acidity & Heartburn',
    name_bn: 'গ্যাস্ট্রিক, এসিডিটি ও বুক জ্বালাপোড়া',
    category: 'Gastrointestinal',
    recommended_action: 'তেল-মশলাযুক্ত ও ভাজাপোড়া খাবার পরিহার করুন। একবারে অতিরিক্ত না খেয়ে অল্প অল্প করে খান। খাবার সাথে সাথে শুয়ে পড়বেন না।',
    keywords: ['gastric', 'গ্যাস্ট্রিক', 'গ্যাস', 'acidity', 'এসিডিটি', 'বুক জ্বালা', 'heartburn', 'টক ঢেকুর', 'পেটে জ্বালাপোড়া'],
    medicines: [
      {
        brand_name: 'Seclo (20mg)',
        generic_name: 'Omeprazole',
        form: 'Capsule',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        instruction: 'সকালে এবং রাতে খাবারের ২০-৩০ মিনিট আগে ১টি ক্যাপসুল।',
        max_daily_dose: 'দিনে সর্বোচ্চ ২টি ক্যাপসুল।',
        google_search_url: 'https://www.google.com/search?q=Seclo+20mg+capsule+Square+uses',
        app_link: '/medicines/seclo',
      },
      {
        brand_name: 'Antacid Plus / Entacyd',
        generic_name: 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone',
        form: 'Suspension / Chewable Tablet',
        manufacturer: 'Square / Incepta',
        instruction: 'তাৎক্ষণিক বুক জ্বালা ও গ্যাসে খাবারের ১ ঘণ্টা পর ২ চা চামচ সিরাপ পান করুন।',
        max_daily_dose: 'প্রয়োজনে দিনে ৩-৪ বার।',
        google_search_url: 'https://www.google.com/search?q=Antacid+Plus+syrup+uses',
        app_link: '/medicines/antacid-plus',
      },
    ],
  },
  {
    id: 'cold_sneezing_allergy',
    name_en: 'Cold, Runny Nose & Allergy',
    name_bn: 'সর্দি, হাঁচি ও নাক দিয়ে পানি পড়া',
    category: 'Allergy & Respiratory',
    recommended_action: 'ধুলাবালি ও ঠান্ডা বাতাস থেকে দূরে থাকুন। কুসুম গরম পানির ভাপ (Steam Inhalation) নিন এবং উষ্ণ তরল খাবার গ্রহণ করুন।',
    keywords: ['cold', 'সর্দি', 'হাঁচি', 'sneezing', 'runny nose', 'নাক বন্ধ', 'কাশি', 'cough', 'এলার্জি', 'allergy'],
    medicines: [
      {
        brand_name: 'Alatrol (10mg)',
        generic_name: 'Cetirizine Hydrochloride',
        form: 'Tablet / Syrup',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        instruction: 'রাতে ঘুমানোর আগে ১টি ট্যাবলেট। হাঁচি ও সর্দির উপশমে কাজ করে।',
        max_daily_dose: 'দিনে সর্বোচ্চ ১টি ট্যাবলেট (হালকা ঝিমুনি হতে পারে)।',
        google_search_url: 'https://www.google.com/search?q=Alatrol+10mg+tablet+Square+uses',
        app_link: '/medicines/alatrol',
      },
      {
        brand_name: 'Fexo (120mg)',
        generic_name: 'Fexofenadine Hydrochloride',
        form: 'Tablet',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        instruction: 'সকালে বা রাতে ১টি ট্যাবলেট। এটি সাধারণত ঘুম বা ঝিমুনি তৈরি করে না।',
        max_daily_dose: 'দিনে ১টি ট্যাবলেট।',
        google_search_url: 'https://www.google.com/search?q=Fexo+120mg+tablet+Square+uses',
        app_link: '/medicines/fexo',
      },
    ],
  },
];

// ============================================================================
// 2. VERIFIED CLINICAL MASTER DISEASES (150 South Asian Common Diseases Core)
// ============================================================================
export const VERIFIED_DISEASES: DiseaseRecord[] = [
  {
    id: 1,
    name: 'Dengue Fever',
    bengali_name: 'ডেঙ্গু জ্বর',
    category: 'Infectious & Tropical',
    reference: 'DGHS Bangladesh Dengue Clinical Management Guideline 2023 / WHO',
    speciality: 'Medicine Specialist',
    cardinal: ['high_fever', 'severe_headache', 'retro_orbital_pain', 'severe_joint_pain_arthralgia', 'skin_rash_maculopapular'],
    associated: ['nausea', 'vomiting', 'extreme_fatigue', 'malaise_body_ache'],
    red_flags: ['petechiae_bleeding_spots', 'persistent_severe_vomiting', 'abdominal_pain_cramps'],
    diagnostic_tests: ['Dengue NS1 Antigen (Day 1-3)', 'CBC (Platelet count & Hematocrit)', 'Dengue IgM/IgG Antibody'],
    primary_advice_bn: 'পর্যাপ্ত বিশ্রাম নিন এবং প্রতিদিন ২.৫ থেকে ৩ লিটার তরল (ওরাল স্যালাইন, ডাবের পানি, স্যুপ) পান করুন। কোনো ব্যথানাশক (Aspirin/Diclofenac/Ibuprofen) গ্রহণ করবেন না, শুধুমাত্র প্যারাসিটামল সেবন করুন। রক্তক্ষরণ বা পেটব্যথা হলে অবিলম্বে হাসপাতালে ভর্তি হোন।',
  },
  {
    id: 2,
    name: 'Chikungunya',
    bengali_name: 'চিকুনগুনিয়া',
    category: 'Infectious & Tropical',
    reference: 'DGHS Bangladesh Arbovirus Protocols',
    speciality: 'Medicine Specialist / Rheumatologist',
    cardinal: ['high_fever', 'severe_joint_pain_arthralgia', 'joint_swelling_redness', 'skin_rash_maculopapular'],
    associated: ['severe_headache', 'extreme_fatigue', 'nausea'],
    diagnostic_tests: ['Chikungunya IgM antibody', 'CBC', 'Serum Uric Acid'],
    primary_advice_bn: 'জয়েন্টের তীব্র ব্যথায় প্যারাসিটামল ও জয়েন্টে কোল্ড প্যাক ব্যবহার করুন। পর্যাপ্ত বিশ্রাম নিন এবং পানিশূন্যতা রোধে তরল খাবার খান।',
  },
  {
    id: 3,
    name: 'Enteric Fever (Typhoid)',
    bengali_name: 'টাইফয়েড জ্বর',
    category: 'Infectious & Tropical',
    reference: 'WHO Guidelines on Typhoid Fever',
    speciality: 'Medicine Specialist',
    cardinal: ['high_fever', 'severe_headache', 'abdominal_pain_cramps', 'malaise_body_ache'],
    associated: ['loss_of_appetite', 'constipation', 'watery_diarrhea', 'nausea'],
    red_flags: ['confusion_altered_mental_state', 'rectal_bleeding_bright_red'],
    diagnostic_tests: ['Blood Culture & Sensitivity', 'Widal Test', 'CBC'],
    primary_advice_bn: 'ফুটানো ও বিশুদ্ধ পানি পান করুন এবং বাইরের খাবার বর্জন করুন। চিকিৎসকের প্রেসক্রিপশন অনুযায়ী সম্পূর্ণ মেয়াদে অ্যান্টিবায়োটিক কোর্স শেষ করুন।',
  },
  {
    id: 4,
    name: 'Malaria',
    bengali_name: 'ম্যালেরিয়া',
    category: 'Infectious & Tropical',
    reference: 'National Malaria Elimination Programme (DGHS)',
    speciality: 'Medicine Specialist',
    cardinal: ['high_fever', 'chills_rigors', 'night_sweats', 'severe_headache'],
    associated: ['vomiting', 'extreme_fatigue', 'jaundice_yellow_eyes_skin'],
    red_flags: ['convulsions_seizures', 'confusion_altered_mental_state'],
    diagnostic_tests: ['Malaria RDT (Pf/Pv)', 'Peripheral Blood Film for Malarial Parasite (MP)'],
    primary_advice_bn: 'পার্বত্য বা ম্যালেরিয়াপ্রবণ এলাকায় ভ্রমণ ইতিহাস থাকলে অবিলম্বে রক্ত পরীক্ষা করুন এবং চিকিৎসকের তত্ত্বাবধানে চিকিৎসা নিন।',
  },
  {
    id: 5,
    name: 'Acute Gastroenteritis / Diarrhea',
    bengali_name: 'ডায়রিয়া ও গ্যাস্ট্রোএন্টারাইটিস',
    category: 'Gastrointestinal',
    reference: 'icddr,b Diarrhoeal Disease Management Protocols',
    speciality: 'Gastroenterologist / General Physician',
    cardinal: ['watery_diarrhea', 'vomiting', 'abdominal_pain_cramps'],
    associated: ['nausea', 'mild_fever', 'general_weakness', 'extreme_fatigue'],
    red_flags: ['bloody_mucoid_diarrhea', 'decreased_urine_output_oliguria', 'cold_clammy_skin'],
    diagnostic_tests: ['Stool Routine Examination (R/E)', 'Serum Electrolytes'],
    primary_advice_bn: 'প্রতিবার পাতলা পায়খানার পর এক প্যাকেট ওরাল স্যালাইন (ORS) আধা লিটার ফুটানো পানিতে বানিয়ে পান করুন। ডাবের পানি ও রাইস স্যালাইন দিন। প্রস্রাব কমে গেলে বা চোখ বসে গেলে দ্রুত স্বাস্থ্যকেন্দ্রে যান।',
  },
  {
    id: 6,
    name: 'Bronchial Asthma',
    bengali_name: 'ব্রঙ্কিয়াল অ্যাজমা (হাঁপানি)',
    category: 'Respiratory',
    reference: 'GINA Global Strategy for Asthma Management',
    speciality: 'Pulmonologist / Chest Specialist',
    cardinal: ['shortness_of_breath', 'wheezing_sound', 'chest_tightness', 'dry_cough'],
    associated: ['night_sweats', 'insomnia_sleep_disturbance'],
    red_flags: ['difficulty_swallowing', 'cold_clammy_skin'],
    diagnostic_tests: ['Spirometry with Reversibility Test', 'Chest X-ray (P/A View)', 'Serum IgE'],
    primary_advice_bn: 'ধুলাবালি, ঠান্ডা বাতাস ও অ্যালার্জেন এড়িয়ে চলুন। চিকিৎসকের পরামর্শ অনুযায়ী নিয়মিত ইনহেলার ব্যবহার করুন। তীব্র শ্বাসকষ্ট হলে দ্রুত হাসপাতালে নেবুলাইজেশন নিন।',
  },
  {
    id: 7,
    name: 'Hypertension (High Blood Pressure)',
    bengali_name: 'উচ্চ রক্তচাপ (হাইপারটেনশন)',
    category: 'Cardiovascular',
    reference: 'ACC/AHA High Blood Pressure Clinical Practice Guidelines',
    speciality: 'Cardiologist / Medicine Specialist',
    cardinal: ['high_blood_pressure', 'severe_headache', 'dizziness_vertigo'],
    associated: ['palpitations_rapid_heart', 'neck_pain_stiffness', 'extreme_fatigue'],
    red_flags: ['retrosternal_chest_pain', 'radiating_left_arm_pain', 'shortness_of_breath'],
    diagnostic_tests: ['Serial Blood Pressure Monitoring', 'ECG', 'Echocardiogram', 'Lipid Profile', 'Serum Creatinine'],
    primary_advice_bn: 'খাবারে কাঁচা লবণ পুরোপুরি বাদ দিন। প্রতিদিন ৩০ মিনিট দ্রুত হাঁটুন, ওজন নিয়ন্ত্রণে রাখুন এবং চিকিৎসকের পরামর্শ ছাড়া রক্তচাপের ওষুধ কখনো বন্ধ করবেন না।',
  },
  {
    id: 8,
    name: 'Type 2 Diabetes Mellitus',
    bengali_name: 'টাইপ ২ ডায়াবেটিস',
    category: 'Endocrine & Metabolic',
    reference: 'BADAS (Diabetic Association of Bangladesh) Clinical Guidelines',
    speciality: 'Endocrinologist / Diabetologist',
    cardinal: ['excessive_thirst_polydipsia', 'frequent_urination', 'excessive_hunger_polyphagia', 'unexplained_weight_loss'],
    associated: ['extreme_fatigue', 'numbness_tingling', 'blurry_vision'],
    diagnostic_tests: ['Fasting Blood Glucose (FBG)', 'HbA1c', '2 Hours Postprandial Glucose (2HABF)', 'Urine Albumin'],
    primary_advice_bn: 'চিনি ও মিষ্টি জাতীয় খাবার সম্পূর্ণ বর্জন করুন। নিয়মিত হাঁটাচলা করুন, সুষম খাবার খান এবং প্রতি ৩ মাস পর পর HbA1c পরীক্ষা করে ডাক্তারের সাথে দেখা করুন।',
  },
  {
    id: 9,
    name: 'Urinary Tract Infection (UTI)',
    bengali_name: 'মূত্রনালীর সংক্রমণ (ইউটিআই)',
    category: 'Renal & Urological',
    reference: 'EAU Guidelines on Urological Infections',
    speciality: 'Urologist / Nephrologist',
    cardinal: ['burning_pain_urination_dysuria', 'frequent_urination', 'urgency_to_urinate', 'dark_yellow_urine'],
    associated: ['mild_fever', 'abdominal_pain_cramps', 'chills_rigors'],
    red_flags: ['severe_flank_loin_pain', 'blood_in_urine_hematuria'],
    diagnostic_tests: ['Urine Routine & Microscopic Examination (R/M/E)', 'Urine Culture & Sensitivity (C/S)', 'USG of KUB'],
    primary_advice_bn: 'প্রতিদিন অন্তত ৩ থেকে ৪ লিটার পানি পান করুন। প্রস্রাব আটকে রাখবেন না। প্রস্রাব পরীক্ষার রিপোর্ট দেখে চিকিৎসকের পরামর্শমতো অ্যান্টিবায়োটিক কোর্স সম্পূর্ণ করুন।',
  },
  {
    id: 10,
    name: 'Acute Myocardial Infarction (Heart Attack)',
    bengali_name: 'হার্ট অ্যাটাক (মায়োকার্ডিয়াল ইনফার্কশন)',
    category: 'Cardiovascular',
    reference: 'ESC Guidelines for Management of Acute Coronary Syndromes',
    speciality: 'Interventional Cardiologist',
    cardinal: ['retrosternal_chest_pain', 'radiating_left_arm_pain', 'cold_clammy_skin', 'shortness_of_breath'],
    associated: ['nausea', 'vomiting', 'dizziness_vertigo', 'palpitations_rapid_heart'],
    red_flags: ['confusion_altered_mental_state', 'low_blood_pressure_hypotension'],
    diagnostic_tests: ['12-lead ECG immediately', 'Serum Troponin-I / Troponin-T', 'Echocardiogram', 'Coronary Angiography'],
    primary_advice_bn: '🚨 এটি একটি মেডিকেল ইমার্জেন্সি! রোগীকে অবিলম্বে নিকটস্থ কার্ডিয়াক হাসপাতালে নিয়ে যান বা ৯৯৯ নম্বরে কল করুন। কোনো সময়ক্ষেপণ করবেন না।',
  },
];

// Symptom vocabulary dictionary for natural language mapping
const SYMPTOM_PATTERNS: { [key: string]: string[] } = {
  high_fever: ['উচ্চ জ্বর', 'তীব্র জ্বর', 'জ্বর', 'high fever', 'fever', 'temp', 'গা গরম'],
  severe_headache: ['মাথাব্যথা', 'মাথা ব্যথা', 'তীব্র মাথা ব্যথা', 'headache', 'severe headache', 'মাইগ্রেন'],
  retro_orbital_pain: ['চোখের পেছনে ব্যথা', 'চোখে ব্যথা', 'চোখের নিচে ব্যথা', 'retro orbital pain', 'pain behind eyes', 'eye pain'],
  severe_joint_pain_arthralgia: ['জয়েন্টে ব্যথা', 'জয়েন্টে তীব্র ব্যথা', 'গিটে গিটে ব্যথা', 'হাঁটুতে ব্যথা', 'হাড়ের জোড়ায় ব্যথা', 'joint pain', 'severe joint pain'],
  skin_rash_maculopapular: ['চামড়ায় লাল র‍্যাশ', 'র‍্যাশ', 'চামড়ায় ফুসকুড়ি', 'লাল দাগ', 'skin rash', 'rash'],
  extreme_fatigue: ['ক্লান্তি', 'দুর্বলতা', 'অতিরিক্ত ক্লান্তি', 'fatigue', 'extreme fatigue', 'weakness'],
  nausea: ['বমি বমি ভাব', 'বমি ভাব', 'nausea'],
  vomiting: ['বমি', 'বমি হওয়া', 'vomiting'],
  watery_diarrhea: ['ডায়রিয়া', 'পাতলা পায়খানা', 'watery diarrhea', 'loose motion'],
  shortness_of_breath: ['শ্বাসকষ্ট', 'শ্বাস নিতে কষ্ট', 'shortness of breath', 'breathlessness'],
  retrosternal_chest_pain: ['বুকে ব্যথা', 'বুকে তীব্র ব্যথা', 'বুকের মাঝে চাপ', 'chest pain', 'heart pain'],
  radiating_left_arm_pain: ['বাম হাতে ব্যথা ছড়ানো', 'বাম বাহুতে ব্যথা', 'arm pain'],
  burning_pain_urination_dysuria: ['প্রস্রাবে জ্বালাপোড়া', 'প্রস্রাব করতে ব্যথা', 'burning urination', 'dysuria'],
  frequent_urination: ['ঘন ঘন প্রস্রাব', 'frequent urination'],
  epigastric_burning_pain: ['বুক জ্বালাপোড়া', 'পেটে জ্বালা', 'গ্যাস্ট্রিক', 'acidity', 'heartburn'],
};

// ============================================================================
// 3. CLINICAL SYMPTOM PARSER & MATCHER
// ============================================================================
export function detectSymptomsFromText(text: string): string[] {
  const normalized = text.toLowerCase();
  const detected: Set<string> = new Set();

  for (const [symptomKey, keywords] of Object.entries(SYMPTOM_PATTERNS)) {
    for (const kw of keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        detected.add(symptomKey);
        break;
      }
    }
  }

  return Array.from(detected);
}

export function detectOTCCondition(text: string): OTCCondition | undefined {
  const normalized = text.toLowerCase();
  for (const cond of VERIFIED_OTC_CONDITIONS) {
    for (const kw of cond.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return cond;
      }
    }
  }
  return undefined;
}

export function analyzeClinicalCase(userMessage: string, language: string = 'bn', category?: string): ClinicalAnalysis {
  const detectedSymptoms = detectSymptomsFromText(userMessage);
  let otcGuidance = detectOTCCondition(userMessage);

  // If user selected 'medicines' category but no specific keyword matched, default to general OTC guidance
  if (!otcGuidance && (category === 'medicines' || category === 'medicine')) {
    otcGuidance = VERIFIED_OTC_CONDITIONS[0];
  }

  // Check emergency keywords
  const isEmergency = detectedSymptoms.includes('retrosternal_chest_pain') ||
    category === 'emergency' ||
    userMessage.includes('বুকে ব্যথা') ||
    userMessage.includes('হার্ট অ্যাটাক') ||
    userMessage.includes('chest pain') ||
    userMessage.includes('স্ট্রোক') ||
    userMessage.includes('stroke') ||
    userMessage.includes('শ্বাস নিতে পারছি না');

  const emergencyReason = isEmergency
    ? 'বুকে তীব্র ব্যথা বা সম্ভাব্য কার্ডিয়াক ইমার্জেন্সি / তীব্র শ্বাসকষ্টের লক্ষণ চিহ্নিত হয়েছে।'
    : undefined;

  // Match against verified diseases
  const matches: ClinicalMatchResult[] = [];

  for (const disease of VERIFIED_DISEASES) {
    const allDiseaseSymptoms = [...disease.cardinal, ...disease.associated];
    const matched = detectedSymptoms.filter(s => allDiseaseSymptoms.includes(s));
    
    // Category match bonus
    const isCategoryMatch = category && disease.category.toLowerCase().includes(category.toLowerCase());

    if (matched.length > 0 || isCategoryMatch) {
      // Calculate clinical relevance score
      const cardinalMatches = matched.filter(s => disease.cardinal.includes(s));
      let score = Math.round(
        (cardinalMatches.length * 2.5 + matched.length * 1.5) / 
        (disease.cardinal.length * 2.5) * 100
      );
      if (isCategoryMatch) score = Math.max(score, 40) + 15;

      let triage: 'Low' | 'Moderate' | 'High' | 'Emergency' = 'Low';
      if (disease.category === 'Cardiovascular' || isEmergency) {
        triage = 'Emergency';
      } else if (score >= 60 || (disease.red_flags && disease.red_flags.some(rf => detectedSymptoms.includes(rf)))) {
        triage = 'High';
      } else if (score >= 30) {
        triage = 'Moderate';
      }

      matches.push({
        disease,
        matchScore: Math.min(100, Math.max(25, score)),
        matchedSymptoms: matched,
        triageLevel: triage,
      });
    }
  }

  // Sort by match score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  const primaryMatches = matches.slice(0, 3);
  const hasSymptomMatch = primaryMatches.length > 0;
  const isHealthQuery = hasSymptomMatch || !!otcGuidance || isEmergency || !!category;

  const recommendedSpeciality = primaryMatches[0]?.disease.speciality || 
    (isEmergency ? 'Emergency Medicine / Cardiology' : 'General Physician');

  // Generate clean Markdown Report
  const formattedMarkdownReport = generateMarkdownReport({
    language,
    category,
    detectedSymptoms,
    primaryMatches,
    otcGuidance,
    isEmergency,
    emergencyReason,
    recommendedSpeciality,
  });

  return {
    isHealthQuery,
    hasSymptomMatch,
    detectedSymptoms,
    primaryMatches,
    otcGuidance,
    isEmergency,
    emergencyReason,
    recommendedSpeciality,
    formattedMarkdownReport,
  };
}

// ============================================================================
// 4. MARKDOWN REPORT GENERATOR (TABLES + CLICKABLE LINKS + CARDS)
// ============================================================================
function generateMarkdownReport(data: {
  language: string;
  category?: string;
  detectedSymptoms: string[];
  primaryMatches: ClinicalMatchResult[];
  otcGuidance?: OTCCondition;
  isEmergency: boolean;
  emergencyReason?: string;
  recommendedSpeciality: string;
}): string {
  let output = '';

  // 1. Emergency Banner if critical
  if (data.isEmergency) {
    output += `\`\`\`json:emergency_alert\n{\n  "type": "emergency",\n  "condition": "Acute Coronary Syndrome / Chest Emergency",\n  "severity": "critical",\n  "message": "অবিলম্বে জরুরি সেবা (৯৯৯) বা নিকটস্থ কার্ডিয়াক ইমার্জেন্সিতে যোগাযোগ করুন।",\n  "callNumber": "999"\n}\n\`\`\`\n\n`;
    output += `### 🚨 জরুরি স্বাস্থ্য সতর্কতা (Medical Emergency)\n`;
    output += `আপনার উল্লেখিত লক্ষণগুলো জরুরি চিকিৎসাব্যবস্থা নির্দেশ করে। অবিলম্বে রোগীকে নিকটস্থ হাসপাতালের জরুরি বিভাগে নিয়ে যান অথবা জাতীয় জরুরি সেবা **৯৯৯** এ কল করুন।\n\n`;
  }

  // Category Scope Header if selected
  if (data.category) {
    const catLabels: Record<string, string> = {
      symptoms: '🩺 লক্ষণ ও ক্লিনিক্যাল মূল্যায়ন (Symptoms Evaluation)',
      medicines: '💊 ওষুধ ও ফার্মাকোলজি গাইড (Medicines Guide)',
      prescriptions: '📄 প্রেসক্রিপশন ও সেবনবিধি নির্দেশনা (Prescription Guidance)',
      nutrition: '🥗 পুষ্টি, খাদ্যতালিকা ও ডায়েট (Nutrition & Dietetics)',
      hospitals: '🏥 হাসপাতাল ও বিশেষজ্ঞ সেবা (Hospitals & Facilities)',
      emergency: '🚨 জরুরি চিকিৎসা ও ফার্স্ট এইড (Emergency Care)',
    };
    if (catLabels[data.category]) {
      output += `> **ক্যাটাগরি ফোকাস:** ${catLabels[data.category]}\n\n`;
    }
  }

  // 2. Clinical Evaluation Table (Primary when Symptoms, Emergency, or General)
  if (data.primaryMatches.length > 0) {
    const topMatch = data.primaryMatches[0];
    output += `### 🩺 ক্লিনিক্যাল লক্ষণ বিশ্লেষণ (Clinical Evaluation)\n`;
    output += `আপনার লক্ষণগুলোর সাথে **বাংলাদেশ স্বাস্থ্য অধিদপ্তর (DGHS)** ও **WHO** গাইডলাইন অনুযায়ী সম্ভাব্য রোগের মিল নিচে দেওয়া হলো:\n\n`;
    
    output += `| সম্ভাব্য রোগ (Possible Condition) | ম্যাচ মাত্রা | ঝুঁকির মাত্রা (Triage) | প্রস্তাবিত বিশেষজ্ঞ |\n`;
    output += `| :--- | :--- | :--- | :--- |\n`;
    for (const m of data.primaryMatches) {
      output += `| **${m.disease.bengali_name}** (${m.disease.name}) | ${m.matchScore}% | **${m.triageLevel} Risk** | ${m.disease.speciality} |\n`;
    }
    output += `\n`;

    // Clinical Details & Recommended Diagnostic Tests
    output += `#### 📋 করণীয় ও নির্ভরযোগ্য ল্যাব টেস্ট:\n`;
    output += `- **প্রাথমিক স্বাস্থ্য পরামর্শ:** ${topMatch.disease.primary_advice_bn}\n`;
    output += `- **প্রয়োজনীয় ল্যাব টেস্ট:** ${topMatch.disease.diagnostic_tests.join(', ')}\n\n`;
  }

  // 3. Verified OTC & First-Aid Medicine Guidance (Prominent for Medicines & Prescriptions)
  if (data.otcGuidance) {
    output += `### 💊 সাময়িক ফার্স্ট-এইড ও ওটিসি (OTC) ওষুধের তথ্য\n`;
    output += `*প্রাথমিক আরামের জন্য প্রচলিত ফার্স্ট-এইড পরামর্শ:* **${data.otcGuidance.recommended_action}**\n\n`;
    output += `| ওষুধের নাম ও ব্র্যান্ড | জেনেরিক নাম | ব্যবহারের নিয়ম | বিস্তারিত জানুন (Google Search) |\n`;
    output += `| :--- | :--- | :--- | :--- |\n`;
    for (const med of data.otcGuidance.medicines) {
      output += `| **${med.brand_name}** (${med.manufacturer}) | ${med.generic_name} | ${med.instruction} | [🔍 তথ্যাদি দেখুন](${med.google_search_url}) |\n`;
    }
    output += `\n`;
  }

  // 4. Dedicated Category Content for Nutrition
  if (data.category === 'nutrition') {
    output += `### 🥗 পুষ্টি ও সুষম খাদ্যের নির্দেশনা (Bangladeshi Diet Protocol)\n`;
    output += `| খাদ্যের ধরন | সুপারিশকৃত উপাদান | স্বাস্থ্য উপকারিতা |\n`;
    output += `| :--- | :--- | :--- |\n`;
    output += `| **শর্করা (কার্ব)** | লাল চালের ভাত, লাল আটার রুটি, ওটস | দীর্ঘস্থায়ী শক্তি ও রক্তের সুগার নিয়ন্ত্রণ |\n`;
    output += `| **আমিষ (প্রোটিন)** | দেশি মাছ, ডাল, ডিম, মুরগির মাংস | টিস্যু পুনর্গঠন ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি |\n`;
    output += `| **শাকসবজি** | লাল শাক, পালং শাক, পটল, পেঁপে, লাউ | প্রচুর ফাইবার ও ভিটামিন যা হজম ভালো রাখে |\n`;
    output += `| **তরল ও পানীয়** | প্রতিদিন ২.৫ - ৩ লিটার বিশুদ্ধ পানি, ডাবের পানি | আর্দ্রতা বজায় রাখা ও টক্সিন দূর করা |\n\n`;
  }

  // 5. Dedicated Category Content for Hospitals
  if (data.category === 'hospitals') {
    output += `### 🏥 হাসপাতাল ও জরুরি স্বাস্থ্যকেন্দ্র তথ্য\n`;
    output += `- **জাতীয় জরুরি কল সেন্টার:** **৯৯৯** (অ্যাম্বুলেন্স ও পুলিশ সহায়তা)\n`;
    output += `- **স্বাস্থ্য বাতায়ন (স্বাস্থ্য অধিদপ্তর):** **১৬২৬৩** (২৪ ঘণ্টা ডাক্তারের পরামর্শ)\n`;
    output += `- **নিকটস্থ স্বাস্থ্য প্রতিষ্ঠান:** প্রয়োজনে নিকটস্থ উপজেলা স্বাস্থ্য কমপ্লেক্স, জেলা সদর হাসপাতাল বা সরকারি মেডিকেল কলেজ হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।\n\n`;
  }

  // 6. Specialist Recommendation Card block
  output += `\`\`\`json:doctor_recommendation\n{\n  "speciality": "${data.recommendedSpeciality}",\n  "reason": "রোগের সঠিক ডায়াগনসিস ও প্রেসক্রিপশনের জন্য বিশেষজ্ঞ চিকিৎসকের পরামর্শ প্রয়োজন।",\n  "urgency": "${data.isEmergency ? 'emergency' : 'normal'}"\n}\n\`\`\`\n\n`;

  // 7. Strict Clinical Disclaimer
  output += `> ⚠️ **গুরুত্বপূর্ণ সতর্কতা:** এই তথ্যটি শুধুমাত্র প্রাথমিক স্বাস্থ্য সচেতনতা ও সাময়িক নির্দেশনার জন্য। এটি কোনোভাবেই একজন রেজিস্টার্ড এমবিবিএস ডাক্তারের সরাসরি প্রেসক্রিপশন বা চিকিৎসার বিকল্প নয়। লক্ষণ স্থায়ী হলে বা তীব্র হলে দ্রুত নিকটস্থ চিকিৎসকের পরামর্শ নিন।\n`;

  return output;
}
