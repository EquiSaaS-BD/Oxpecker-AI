export type PrescriptionLanguage = "en" | "bn" | "hi" | "ur";

export interface LanguageOption {
  code: PrescriptionLanguage;
  label: string;
  nativeLabel: string;
  countryHint: string;
  dir: "ltr" | "rtl";
}

export const PRESCRIPTION_LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    countryHint: "International",
    dir: "ltr",
  },
  {
    code: "bn",
    label: "Bengali",
    nativeLabel: "বাংলা",
    countryHint: "Bangladesh / India",
    dir: "ltr",
  },
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    countryHint: "India",
    dir: "ltr",
  },
  {
    code: "ur",
    label: "Urdu",
    nativeLabel: "اردو",
    countryHint: "Pakistan / South Asia",
    dir: "rtl",
  },
];

export interface PrescriptionUILabels {
  patientName: string;
  age: string;
  years: string;
  gender: string;
  male: string;
  female: string;
  date: string;
  vitals: string;
  bp: string;
  pulse: string;
  temp: string;
  weight: string;
  height: string;
  bmi: string;
  bloodSugar: string;
  spo2: string;
  chiefComplaint: string;
  physicalExam: string;
  diagnosis: string;
  investigations: string;
  advice: string;
  followUp: string;
  doctorSignature: string;
  noMedicines: string;
  mrnLabel: string;
  chamberLabel: string;
  phoneLabel: string;
  timingLabel: string;
  durationLabel: string;
  dosageLabel: string;
  pageOf: (current: number, total: number) => string;
}

const UI_LABELS: Record<PrescriptionLanguage, PrescriptionUILabels> = {
  en: {
    patientName: "Patient Name",
    age: "Age",
    years: "Yrs",
    gender: "Gender",
    male: "Male",
    female: "Female",
    date: "Date",
    vitals: "Vitals & Clinical Metrics",
    bp: "BP",
    pulse: "Pulse",
    temp: "Temp",
    weight: "Weight",
    height: "Height",
    bmi: "BMI",
    bloodSugar: "Blood Sugar",
    spo2: "SpO₂",
    chiefComplaint: "Chief Complaints (C/C)",
    physicalExam: "On Examination (O/E)",
    diagnosis: "Clinical Diagnosis (Dx)",
    investigations: "Investigations Advised",
    advice: "General & Dietary Advice",
    followUp: "Next Follow-up",
    doctorSignature: "Doctor's Signature & Stamp",
    noMedicines: "No medicines prescribed.",
    mrnLabel: "Patient ID",
    chamberLabel: "Chamber & Hospital",
    phoneLabel: "Serial / Emergency",
    timingLabel: "Instruction",
    durationLabel: "Duration",
    dosageLabel: "Dose",
    pageOf: (c, t) => `Page ${c} of ${t}`,
  },
  bn: {
    patientName: "রোগীর নাম",
    age: "বয়স",
    years: "বছর",
    gender: "লিঙ্গ",
    male: "পুরুষ",
    female: "মহিলা",
    date: "তারিখ",
    vitals: "শারীরিক পরীক্ষা (Vitals)",
    bp: "রক্তচাপ (BP)",
    pulse: "পালস",
    temp: "তাপমাত্রা",
    weight: "ওজন",
    height: "উচ্চতা",
    bmi: "বিএমআই",
    bloodSugar: "রক্তে গ্লুকোজ",
    spo2: "অক্সিজেন (SpO₂)",
    chiefComplaint: "প্রধান সমস্যাসমূহ (C/C)",
    physicalExam: "শারীরিক পর্যবেক্ষণ (O/E)",
    diagnosis: "রোগ নির্ণয় (Diagnosis)",
    investigations: "পরীক্ষা-নিরীক্ষা (Investigations)",
    advice: "পরামর্শ ও পথ্য (Advice)",
    followUp: "পরবর্তী সাক্ষাৎ (Follow-up)",
    doctorSignature: "চিকিৎসকের স্বাক্ষর ও সিল",
    noMedicines: "কোনো ওষুধ যোগ করা হয়নি।",
    mrnLabel: "রোগী আইডি",
    chamberLabel: "চেম্বার ও হাসপাতাল",
    phoneLabel: "সিরিয়াল ও যোগাযোগ",
    timingLabel: "খাওয়ার নিয়ম",
    durationLabel: "মেয়াদ",
    dosageLabel: "মাত্রা",
    pageOf: (c, t) => `পৃষ্ঠা ${toLocalizedDigits(String(c), "bn")} / ${toLocalizedDigits(String(t), "bn")}`,
  },
  hi: {
    patientName: "रोगी का नाम",
    age: "आयु",
    years: "वर्ष",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    date: "दिनांक",
    vitals: "शारीरिक मापदंड (Vitals)",
    bp: "रक्तचाप (BP)",
    pulse: "नाड़ी (Pulse)",
    temp: "तापमान",
    weight: "वज़न",
    height: "लंबाई",
    bmi: "बीएमआई",
    bloodSugar: "ब्लड शुगर",
    spo2: "ऑक्सीजन (SpO₂)",
    chiefComplaint: "मुख्य शिकायतें (C/C)",
    physicalExam: "शारीरिक परीक्षण (O/E)",
    diagnosis: "रोग निदान (Diagnosis)",
    investigations: "जांच एवं परीक्षण (Tests)",
    advice: "सलाह एवं परहेज़ (Advice)",
    followUp: "अगली मुलाकात (Follow-up)",
    doctorSignature: "चिकित्सक के हस्ताक्षर",
    noMedicines: "कोई दवा निर्धारित नहीं की गई है।",
    mrnLabel: "रोगी आईडी",
    chamberLabel: "क्लिनिक एवं अस्पताल",
    phoneLabel: "अपॉइंटमेंट / संपर्क",
    timingLabel: "सेवन विधि",
    durationLabel: "अवधि",
    dosageLabel: "खुराक",
    pageOf: (c, t) => `पृष्ठ ${toLocalizedDigits(String(c), "hi")} / ${toLocalizedDigits(String(t), "hi")}`,
  },
  ur: {
    patientName: "مریض کا نام",
    age: "عمر",
    years: "سال",
    gender: "جنس",
    male: "مرد",
    female: "خاتون",
    date: "تاریخ",
    vitals: "جسمانی معائنہ (Vitals)",
    bp: "بلڈ پریشر",
    pulse: "نبض",
    temp: "درجہ حرارت",
    weight: "وزن",
    height: "قد",
    bmi: "بی ایم آئی",
    bloodSugar: "بلڈ شوگر",
    spo2: "آکسیجن (SpO₂)",
    chiefComplaint: "بنیادی شکایات (C/C)",
    physicalExam: "طبی معائنہ (O/E)",
    diagnosis: "تشخیص (Diagnosis)",
    investigations: "تجویز کردہ ٹیسٹ (Tests)",
    advice: "ہدایات اور پرہیز (Advice)",
    followUp: "اگلا معائنہ (Follow-up)",
    doctorSignature: "ڈاکٹر کے دستخط اور مہر",
    noMedicines: "کوئی دوا تجویز نہیں کی گئی۔",
    mrnLabel: "مریض آئی ڈی",
    chamberLabel: "کلینک اور ہسپتال",
    phoneLabel: "رابطہ نمبر",
    timingLabel: "طریقہ استعمال",
    durationLabel: "مدت",
    dosageLabel: "خوراک",
    pageOf: (c, t) => `صفحہ ${toLocalizedDigits(String(c), "ur")} از ${toLocalizedDigits(String(t), "ur")}`,
  },
};

const DIGIT_MAPS: Record<PrescriptionLanguage, string[]> = {
  en: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  bn: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
  hi: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
  ur: ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
};

export function toLocalizedDigits(input: string, lang: PrescriptionLanguage): string {
  if (!input || lang === "en") return input;
  const map = DIGIT_MAPS[lang];
  return input.replace(/[0-9]/g, (d) => map[Number(d)] ?? d);
}

/**
 * Comprehensive medical phrase dictionary for instant 1-click translation
 */
const PHRASE_DICTIONARY: Array<{
  pattern: RegExp;
  bn: string;
  hi: string;
  ur: string;
}> = [
  // Meal & Dosage Instructions
  {
    pattern: /\b(take\s+)?immediately\s+after\s+meals?\b/gi,
    bn: "খাবারের পরপরই সেব্য",
    hi: "भोजन के तुरंत बाद लें",
    ur: "کھانے کے فوراً بعد لیں",
  },
  {
    pattern: /\b(take\s+)?after\s+meals?\b/gi,
    bn: "খাবারের পরে",
    hi: "खाने के बाद",
    ur: "کھانے کے بعد",
  },
  {
    pattern: /\b(take\s+)?before\s+meals?\b/gi,
    bn: "খাবারের ৩০ মিনিট আগে",
    hi: "खाने से ३० मिनट पहले",
    ur: "کھانے سے ٣٠ منٹ پہلے",
  },
  {
    pattern: /\bempty\s+stomach\b/gi,
    bn: "খালি পেটে",
    hi: "खाली पेट",
    ur: "خالی پیٹ",
  },
  {
    pattern: /\bwith\s+meals?\b/gi,
    bn: "খাবারের সাথে",
    hi: "भोजन के साथ",
    ur: "کھانے کے ساتھ",
  },
  {
    pattern: /\bafter\s+breakfast\b/gi,
    bn: "সকালের নাস্তার পরে",
    hi: "सुबह नाश्ते के बाद",
    ur: "ناشتے کے بعد",
  },
  {
    pattern: /\bbefore\s+breakfast\b/gi,
    bn: "সকালের নাস্তার আগে",
    hi: "सुबह नाश्ते से पहले",
    ur: "ناشتے سے پہلے",
  },
  {
    pattern: /\bafter\s+lunch\b/gi,
    bn: "দুপুরের খাবারের পরে",
    hi: "दोपहर के भोजन के बाद",
    ur: "دوپہر کے کھانے کے بعد",
  },
  {
    pattern: /\bafter\s+dinner\b/gi,
    bn: "রাতের খাবারের পরে",
    hi: "रात के खाने के बाद",
    ur: "رات کے کھانے کے بعد",
  },
  {
    pattern: /\bat\s+bedtime\b|\bbefore\s+sleep\b/gi,
    bn: "রাতে ঘুমানোর আগে",
    hi: "रात को सोते समय",
    ur: "رات کو سوتے وقت",
  },
  {
    pattern: /\bin\s+the\s+morning\s+with\s+water\b/gi,
    bn: "সকালে এক গ্লাস পানির সাথে",
    hi: "सुबह पानी के साथ",
    ur: "صبح پانی کے ساتھ",
  },
  {
    pattern: /\bin\s+the\s+morning\b/gi,
    bn: "সকালে",
    hi: "सुबह",
    ur: "صبح",
  },
  {
    pattern: /\bat\s+night\b/gi,
    bn: "রাতে",
    hi: "रात में",
    ur: "رات کو",
  },
  {
    pattern: /\bwhen\s+needed\b|\bas\s+needed\b|\bsos\b/gi,
    bn: "প্রয়োজন হলে (ব্যথা বা জ্বর হলে)",
    hi: "ضرورت पड़ने पर (दर्द या बुखार में)",
    ur: "ضرورت پڑنے پر",
  },
  // Durations
  {
    pattern: /\bcontinue\b|\blifelong\b/gi,
    bn: "চলবে",
    hi: "लगातार जारी रखें",
    ur: "جاری رکھیں",
  },
  {
    pattern: /\b(\d+)\s*days?\b/gi,
    bn: "$1 দিন",
    hi: "$1 दिन",
    ur: "$1 دن",
  },
  {
    pattern: /\b(\d+)\s*weeks?\b/gi,
    bn: "$1 সপ্তাহ",
    hi: "$1 सप्ताह",
    ur: "$1 ہفتے",
  },
  {
    pattern: /\b(\d+)\s*months?\b/gi,
    bn: "$1 মাস",
    hi: "$1 महीने",
    ur: "$1 ماہ",
  },
  {
    pattern: /\bafter\s+(\d+)\s*months?\b/gi,
    bn: "$1 মাস পর",
    hi: "$1 महीने बाद",
    ur: "$1 ماہ بعد",
  },
  {
    pattern: /\bafter\s+(\d+)\s*days?\b/gi,
    bn: "$1 দিন পর",
    hi: "$1 दिन बाद",
    ur: "$1 دن بعد",
  },
  {
    pattern: /\bafter\s+(\d+)\s*weeks?\b/gi,
    bn: "$1 সপ্তাহ পর",
    hi: "$1 सप्ताह बाद",
    ur: "$1 ہفتے بعد",
  },
  // Common Advice & Clinical Phrases
  {
    pattern: /\blow\s+sodium\s+dash\s+diet\b/gi,
    bn: "লবণ কম খাবেন (সুষম ডায়েট)",
    hi: "कम नमक वाला संतुलित आहार लें",
    ur: "نمک کم استعمال کریں (متوازن غذا)",
  },
  {
    pattern: /\bavoid\s+processed\s+sugar\b/gi,
    bn: "চিনি ও মিষ্টি জাতীয় খাবার পরিহার করুন",
    hi: "चीनी और मीठे खाद्य पदार्थों से बचें",
    ur: "چینی اور میٹھی چیزوں سے پرہیز کریں",
  },
  {
    pattern: /\b30\s*mins?\s+moderate\s+brisk\s+walking\s+5\s+days\s+a\s+week\b/gi,
    bn: "সপ্তাহে ৫ দিন প্রতিদিন ৩০ মিনিট দ্রুত হাঁটবেন",
    hi: "सप्ताह में ५ दिन ३० मिनट तेज़ पैदल चलें",
    ur: "ہفتے میں ٥ دن روزانہ ٣٠ منٹ تیز قدمی کریں",
  },
  {
    pattern: /\bdrink\s+plenty\s+of\s+water\b|\badequate\s+fluid\s+intake\b/gi,
    bn: "প্রচুর পরিমাণে পানি ও তরল খাবার পান করুন",
    hi: "पर्याप्त मात्रा में पानी और तरल पदार्थ पिएं",
    ur: "پانی اور مشروبات زیادہ استعمال کریں",
  },
  {
    pattern: /\bavoid\s+oily\s+and\s+spicy\s+food\b/gi,
    bn: "তৈলাক্ত ও অতিরিক্ত মসলাযুক্ত খাবার পরিহার করুন",
    hi: "तले-भुने और मसालेदार भोजन से परहेज़ करें",
    ur: "تلی ہوئی اور مصالحہ دار غذا سے پرہیز کریں",
  },
  {
    pattern: /\bcomplete\s+bed\s+rest\b/gi,
    bn: "সম্পূর্ণ বিশ্রামে থাকুন",
    hi: "पूर्ण विश्राम करें",
    ur: "مکمل آرام کریں",
  },
  {
    pattern: /\bwith\s+repeat\b/gi,
    bn: "পুনরায়",
    hi: "दोबारा",
    ur: "دوبارہ",
  },
  {
    pattern: /\breport\b/gi,
    bn: "রিপোর্টসহ",
    hi: "रिपोर्ट के साथ",
    ur: "رپورٹ کے ساتھ",
  },
  // Common Symptoms & Diagnoses
  {
    pattern: /\bfever\b/gi,
    bn: "জ্বর",
    hi: "बुखार",
    ur: "بخار",
  },
  {
    pattern: /\bcough\b/gi,
    bn: "কাশি",
    hi: "खांसी",
    ur: "کھانسی",
  },
  {
    pattern: /\bheadache\b/gi,
    bn: "মাথাব্যথা",
    hi: "सिरदर्द",
    ur: "سر درد",
  },
  {
    pattern: /\bchest\s+tightness\b/gi,
    bn: "বুকে চাপ বা অস্বস্তি",
    hi: "सीने में जकड़न",
    ur: "سینے میں گھٹن",
  },
  {
    pattern: /\bon\s+brisk\s+walking\b/gi,
    bn: "দ্রুত হাঁটার সময়",
    hi: "तेज़ चलने पर",
    ur: "تیز چلنے کے دوران",
  },
  {
    pattern: /\btype-?2\s+diabetes\s+mellitus\b/gi,
    bn: "টাইপ-২ ডায়াবেটিস (বহুমূত্র রোগ)",
    hi: "टाइप-२ मधुमेह (डायबिटीज)",
    ur: "ٹائپ ٢ ذیابیطس (شوگر)",
  },
  {
    pattern: /\bessential\s+hypertension\b|\bhypertension\b/gi,
    bn: "উচ্চ রক্তচাপ (হাইপারটেনশন)",
    hi: "उच्च रक्तचाप (हाइपरटेंशन)",
    ur: "ہائی بلڈ پریشر (بلند فشار خون)",
  },
];

export function translateClinicalText(text: string, lang: PrescriptionLanguage): string {
  if (!text || lang === "en") return text;

  let result = text;
  for (const item of PHRASE_DICTIONARY) {
    const replacement = item[lang];
    result = result.replace(item.pattern, replacement);
  }

  return toLocalizedDigits(result, lang);
}

export function translateDosageTriplet(
  dosageM: string,
  dosageN: string,
  dosageE: string,
  lang: PrescriptionLanguage
): string {
  const raw = `${dosageM || "0"} + ${dosageN || "0"} + ${dosageE || "0"}`;
  return toLocalizedDigits(raw, lang);
}

export function getPrescriptionUILabels(lang: PrescriptionLanguage): PrescriptionUILabels {
  return UI_LABELS[lang] || UI_LABELS.en;
}
