// ====== HealthPass Types ======

export interface HealthPassCard {
  id: string;
  patient_id: string;
  card_number: string; // e.g. HP-2026-00001
  smart_card_uid?: string; // 16-digit RFID/EMV UID

  // Identity
  patient_name: string;
  english_name?: string;
  patient_image: string | null;
  date_of_birth: string;
  gender: string;
  blood_group: string; // e.g. A+, O+, B-, etc.

  // Verification & Legal
  nid_number: string | null;
  birth_cert_number: string | null;
  verification_status: "pending" | "verified" | "rejected";
  verified_at: string | null;
  is_activated: boolean;
  activated_at?: string | null;

  // Location Details (Bangladesh Geo)
  division?: string;
  zila?: string;
  upazila?: string;
  post_code?: string;
  address?: string;
  last_location_sync?: string;

  // Emergency & Clinical Vitals
  personal_phone?: string;
  personal_has_whatsapp?: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  emergency_has_whatsapp?: boolean;
  marital_status?: "Single" | "Married" | "Divorced" | "Widowed";
  last_doctor_visit?: string;
  organ_donor?: boolean;
  diabetic_status?: "None" | "Type-1" | "Type-2" | "Pre-diabetic";
  has_pacemaker?: boolean;
  hypertension?: boolean;

  // Medical Data
  allergies: string[];
  chronic_conditions: ChronicCondition[];
  current_medications: Medication[];

  // Biometric
  face_verified: boolean;
  fingerprint_registered: boolean;

  // Card metadata
  issued_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface ChronicCondition {
  name: string;
  since: string; // Year or date string
  status: "active" | "controlled" | "resolved";
  severity?: "mild" | "moderate" | "severe";
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string; // e.g. "2x daily"
  duration?: string;
  instructions?: string;
  prescribed_by?: string;
}

export interface MedicalVisit {
  id: string;
  patient_id: string;
  doctor_name: string;
  department?: string;
  hospital_name: string;
  location?: string;
  visit_date: string;
  diagnosis: string;
  prescription_summary: string;
  notes?: string;
  vitals?: {
    bp: string;
    pulse: string;
    temp: string;
    weight: string;
  };
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  tests?: string[];
  advice?: string;
  follow_up?: string;
}

export interface HealthPassScanData {
  card: HealthPassCard;
  visits: MedicalVisit[];
}

// Verification flow step type
export type VerificationStep = "identity" | "photo" | "face" | "review";
