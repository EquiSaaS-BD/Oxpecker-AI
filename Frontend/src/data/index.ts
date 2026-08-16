import {
  Doctor,
  Medicine,
  ChatSession,
  MedicineReminder,
  Appointment,
  UserProfile,
  HealthScore,
  NutritionData,
} from "@/types";

// ====== DOCTORS ======
export const doctors: Doctor[] = [
  {
    id: "dr-anisur",
    name: "ডাঃ আনিসুর রহমান",
    nameEn: "Dr. Anisur Rahman",
    specialty: "কার্ডিওলজি বিশেষজ্ঞ",
    specialtyEn: "Cardiologist",
    qualification: "MD, FCPS",
    experience: 15,
    hospital: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    hospitalEn: "Dhaka Medical College Hospital",
    location: "ঢাকা",
    locationEn: "Dhaka",
    fee: 1000,
    rating: 4.8,
    reviewCount: 120,
    satisfaction: 98,
    image: "/images/doctor-1.jpg",
    available: true,
    bio: "সিনিয়র কনসালটেন্ট, কার্ডিওলজি বিভাগ। ১৫+ বছরের অভিজ্ঞতা সহ হৃদরোগ চিকিৎসায় দক্ষ।",
    schedule: [
      {
        hospital: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
        days: "রবি - বুধ",
        hours: "সকাল ৯টা - দুপুর ২টা",
      },
      {
        hospital: "ল্যাবএইড স্পেশালাইজড হাসপাতাল",
        days: "রবি - বৃহস্পতি",
        hours: "বিকাল ৫টা - রাত ৯টা",
        closed: "শুক্র - শনি",
      },
    ],
    education: [
      {
        degree: "এমবিবিএস (MBBS)",
        institution: "ঢাকা মেডিকেল কলেজ",
        year: 2005,
      },
      {
        degree: "এফসিপিএস (FCPS)",
        institution: "বাংলাদেশ কলেজ অফ ফিজিশিয়ানস অ্যান্ড সার্জনস (BCPS)",
        year: 2012,
      },
    ],
    memberships: [
      "বাংলাদেশ কার্ডিয়াক সোসাইটি",
      "আমেরিকান কলেজ অফ কার্ডিওলজি",
    ],
  },
  {
    id: "dr-farhana",
    name: "ডাঃ ফারহানা ইসলাম",
    nameEn: "Dr. Farhana Islam",
    specialty: "গাইনোকলজি বিশেষজ্ঞ",
    specialtyEn: "Gynecologist",
    qualification: "MBBS, MS (Gynecology)",
    experience: 12,
    hospital: "স্কয়ার হাসপাতাল",
    hospitalEn: "Square Hospital",
    location: "ঢাকা",
    locationEn: "Dhaka",
    fee: 1200,
    rating: 4.9,
    reviewCount: 95,
    satisfaction: 97,
    image: "/images/doctor-2.jpg",
    available: true,
    bio: "অভিজ্ঞ গাইনোকলজিস্ট। মাতৃস্বাস্থ্য ও উচ্চ ঝুঁকির গর্ভাবস্থা ব্যবস্থাপনায় বিশেষজ্ঞ।",
    schedule: [
      {
        hospital: "স্কয়ার হাসপাতাল",
        days: "শনি - বুধ",
        hours: "সকাল ১০টা - দুপুর ১টা",
      },
    ],
    education: [
      {
        degree: "এমবিবিএস (MBBS)",
        institution: "স্যার সলিমুল্লাহ মেডিকেল কলেজ",
        year: 2008,
      },
      {
        degree: "এমএস (গাইনোকলজি)",
        institution: "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়",
        year: 2015,
      },
    ],
    memberships: ["বাংলাদেশ গাইনোকলজি সোসাইটি"],
  },
  {
    id: "dr-kamal",
    name: "ডাঃ কামাল হোসেন",
    nameEn: "Dr. Kamal Hossain",
    specialty: "নিউরোমেডিসিন বিশেষজ্ঞ",
    specialtyEn: "Neurologist",
    qualification: "MBBS, MD (Neurology)",
    experience: 18,
    hospital: "ন্যাশনাল ইনস্টিটিউট অফ নিউরোসায়েন্স",
    hospitalEn: "National Institute of Neurosciences",
    location: "ঢাকা",
    locationEn: "Dhaka",
    fee: 1500,
    rating: 4.7,
    reviewCount: 80,
    satisfaction: 96,
    image: "/images/doctor-3.jpg",
    available: true,
    bio: "নিউরোলজি বিশেষজ্ঞ। স্ট্রোক, মাইগ্রেন এবং মস্তিষ্কের রোগ চিকিৎসায় ১৮+ বছরের অভিজ্ঞতা।",
    schedule: [
      {
        hospital: "ন্যাশনাল ইনস্টিটিউট অফ নিউরোসায়েন্স",
        days: "রবি - বৃহস্পতি",
        hours: "সকাল ৮টা - দুপুর ১টা",
      },
    ],
    education: [
      { degree: "এমবিবিএস (MBBS)", institution: "ময়মনসিংহ মেডিকেল কলেজ", year: 2003 },
      { degree: "এমডি (নিউরোলজি)", institution: "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়", year: 2010 },
    ],
    memberships: ["বাংলাদেশ নিউরোলজিক্যাল সোসাইটি"],
  },
];

// ====== MEDICINES ======
export const medicines: Medicine[] = [
  {
    id: "napa-extend",
    name: "Napa Extend 665mg",
    generic: "Paracetamol",
    dosage: "665mg",
    type: "ট্যাবলেট",
    manufacturer: "Beximco Pharmaceuticals Ltd.",
    price: 1.5,
    unit: "পিস",
    image: "/images/medicine-box.png",
    description:
      "Paracetamol (Napa) সাধারণত জ্বর ও ব্যথা কমাতে ব্যবহৃত হয়। এটি একটি নিরাপদ ও কার্যকর ওষুধ।",
    sideEffects: [
      "বমি বমি ভাব (সাধারণত)",
      "ত্বকে র‌্যাশ (বিরল)",
      "লিভারের সমস্যা (অতিরিক্ত মাত্রায়)",
    ],
    dosageInfo: {
      adult:
        "প্রাপ্তবয়স্কদের জন্য: ১-২ টি ট্যাবলেট প্রতি ৬-৮ ঘণ্টা অন্তর। দিনে সর্বোচ্চ ৬টি ট্যাবলেট।",
      child:
        "শিশুদের জন্য: চিকিৎসকের পরামর্শ অনুযায়ী (সাধারণত সিরাপ প্রস্তাবিত)।",
      tip: "খাবারের পর সেবন করা উত্তম।",
    },
    alternatives: [
      { name: "Napa Extend 665mg", company: "Beximco Pharma", price: 1.5, unit: "পিস", status: "current" },
      { name: "Ace Plus", company: "Square Pharma", price: 1.5, unit: "পিস", status: "same" },
      { name: "Reset 665mg", company: "Incepta Pharma", price: 1.2, unit: "পিস", status: "cheaper" },
      { name: "Fast 665mg", company: "Acme Labs", price: 1.6, unit: "পিস", status: "expensive" },
    ],
    priceTrend: [
      { month: "জানু", price: 1.0 },
      { month: "ফেব্রু", price: 1.0 },
      { month: "মার্চ", price: 1.1 },
      { month: "এপ্রি", price: 1.2 },
      { month: "মে", price: 1.3 },
      { month: "জুন", price: 1.5 },
      { month: "জুলাই", price: 1.5 },
      { month: "আগ", price: 1.5 },
      { month: "সেপ্ট", price: 1.6 },
      { month: "অক্টো", price: 1.5 },
      { month: "নভে", price: 1.5 },
      { month: "ডিসে", price: 1.5 },
    ],
  },
];

// ====== CHAT SESSIONS ======
export const chatSessions: ChatSession[] = [
  {
    id: "chat-1",
    title: "মাথা ব্যথা ও জ্বর",
    lastMessage: "Paracetamol সেবন করুন এবং বিশ্রাম নিন।",
    timestamp: new Date("2026-07-05T10:30:00"),
    messageCount: 5,
  },
  {
    id: "chat-2",
    title: "রক্তচাপ পরীক্ষা",
    lastMessage: "আপনার রক্তচাপ স্বাভাবিক সীমার মধ্যে আছে।",
    timestamp: new Date("2026-07-04T14:00:00"),
    messageCount: 3,
  },
  {
    id: "chat-3",
    title: "ডায়াবেটিস পরামর্শ",
    lastMessage: "নিয়মিত ব্যায়াম ও সুষম খাদ্য গ্রহণ করুন।",
    timestamp: new Date("2026-07-03T09:15:00"),
    messageCount: 8,
  },
];

// ====== DASHBOARD DATA ======
export const userProfile: UserProfile = {
  name: "রহিম উদ্দিন",
  age: 45,
  bloodGroup: "O+",
  status: "stable",
  height: "৫' ৮\"",
  weight: "৭২ কেজি",
  image: "/images/user-avatar.jpg",
};

export const healthScore: HealthScore = {
  score: 85,
  label: "চমৎকার",
  trend: 2,
  trendLabel: "গত সপ্তাহের তুলনায় +২ পয়েন্ট উন্নতি হয়েছে।",
};

export const medicineReminders: MedicineReminder[] = [
  {
    id: "rem-1",
    name: "Napa Extra",
    time: "সকাল ৮:০০",
    dosage: "১টি বড়ি",
    taken: true,
    overdue: false,
  },
  {
    id: "rem-2",
    name: "Losartan 50mg",
    time: "দুপুর ২:০০",
    dosage: "বাকেয়া",
    taken: false,
    overdue: true,
  },
];

export const upcomingAppointment: Appointment = {
  id: "apt-1",
  doctorName: "ডাঃ শফিকুর রহমান",
  specialty: "কার্ডিওলজিস্ট",
  date: new Date("2026-07-12"),
  time: "বিকাল ৪:৩০",
  type: "offline",
};

export const nutritionData: NutritionData = {
  calories: { current: 1850, goal: 2200 },
  water: { current: 2.5, goal: 3, unit: "লিটার" },
  weeklyRating: "অনুকূল",
};

// ====== MOCK AI RESPONSE ======
export const mockAIAnalysis = {
  title: "Shustota AI Analysis",
  severity: "moderate" as const,
  description:
    "আপনার লক্ষণগুলো বিশ্লেষণ করে কিছু প্রাথমিক তথ্য নিচে দেওয়া হলো। বুকে ব্যথা এবং উচ্চ রক্তচাপ (Hypertension) একসাথে হওয়াটা কিছুটা ঝুঁকিপূর্ণ হতে পারে।",
  symptoms: [
    { name: "Mild Fever", duration: "2 days", status: "normal" as const },
    { name: "Chest Discomfort", status: "monitor" as const },
    { name: "Blood Pressure", value: "140/90 mmHg", status: "critical" as const },
  ],
  actionPlan: [
    { text: "Rest immediately and avoid physical exertion.", priority: "normal" as const },
    { text: "Measure BP again after 30 minutes of rest.", priority: "normal" as const },
    { text: "Consult a Cardiologist if chest pain persists or increases.", priority: "critical" as const },
  ],
  recommendedSpecialist: {
    name: "Dr. Anisur Rahman",
    specialty: "Cardiologist (MD, FCPS)",
    qualification: "MD, FCPS",
    rating: 4.9,
    reviewCount: 120,
    image: "/images/doctor-1.jpg",
  },
};
