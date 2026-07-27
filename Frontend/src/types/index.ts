// ====== Doctor Types ======
export interface Doctor {
  id: string;
  name: string;
  nameEn: string;
  specialty: string;
  specialtyEn: string;
  qualification: string;
  experience: number;
  hospital: string;
  hospitalEn: string;
  location: string;
  locationEn: string;
  fee: number;
  rating: number;
  reviewCount: number;
  satisfaction: number;
  image: string;
  available: boolean;
  schedule: ClinicSchedule[];
  education: Education[];
  memberships: string[];
  bio: string;
}

export interface ClinicSchedule {
  hospital: string;
  days: string;
  hours: string;
  closed?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

// ====== Medicine Types ======
export interface Medicine {
  id: string;
  name: string;
  generic: string;
  dosage: string;
  type: string;
  manufacturer: string;
  price: number;
  unit: string;
  image?: string;
  description: string;
  sideEffects: string[];
  dosageInfo: DosageInfo;
  alternatives: MedicineAlternative[];
  priceTrend: PriceTrendPoint[];
}

export interface DosageInfo {
  adult: string;
  child: string;
  tip: string;
}

export interface MedicineAlternative {
  name: string;
  company: string;
  price: number;
  unit: string;
  status: "current" | "same" | "cheaper" | "expensive";
}

export interface PriceTrendPoint {
  month: string;
  price: number;
}

// ====== Chat Types ======
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  analysis?: AIAnalysis;
}

export interface AIAnalysis {
  title: string;
  severity: "low" | "moderate" | "high" | "critical";
  description: string;
  symptoms: DetectedSymptom[];
  actionPlan: ActionItem[];
  recommendedSpecialist?: RecommendedDoctor;
}

export interface DetectedSymptom {
  name: string;
  duration?: string;
  status?: "monitor" | "normal" | "critical";
  value?: string;
}

export interface ActionItem {
  text: string;
  priority: "normal" | "important" | "critical";
}

export interface RecommendedDoctor {
  name: string;
  specialty: string;
  qualification: string;
  rating: number;
  reviewCount: number;
  image: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

// ====== Dashboard Types ======
export interface HealthScore {
  score: number;
  label: string;
  trend: number;
  trendLabel: string;
}

export interface UserProfile {
  name: string;
  age: number;
  bloodGroup: string;
  status: "stable" | "moderate" | "critical";
  height: string;
  weight: string;
  image: string;
}

export interface MedicineReminder {
  id: string;
  name: string;
  time: string;
  dosage: string;
  taken: boolean;
  overdue: boolean;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: Date;
  time: string;
  type: "online" | "offline";
}

// ====== Nutrition Types ======
export interface NutritionData {
  calories: { current: number; goal: number };
  water: { current: number; goal: number; unit: string };
  weeklyRating: string;
}

// ====== Doctor Dashboard Types ======
export interface DoctorDashboardStats {
  totalPatients: number;
  totalPatientsChange: number;
  todayAppointments: number;
  todayAppointmentsChange: number;
  pendingPrescriptions: number;
  pendingPrescriptionsChange: number;
  upcomingConsultations: number;
  upcomingConsultationsChange: number;
}

export interface DoctorPatient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  lastVisit: string;
  condition: string;
  status: "Stable" | "Follow-up" | "Critical" | "New";
  avatar: string;
  phone: string;
}

export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientAvatar: string;
  time: string;
  date: string;
  type: "Online" | "Offline";
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
  condition: string;
}
