export type BedCategory =
  | "General Ward"
  | "Deluxe Cabin"
  | "VIP Suite"
  | "ICU"
  | "CCU"
  | "HDU"
  | "NICU"
  | "Isolation";

export type BedStatus = "Vacant" | "Occupied" | "Cleaning" | "Maintenance";

export interface BedGig {
  id: string;
  title: string;
  category: BedCategory;
  ward: string;
  floor?: string;
  roomNumber?: string;
  price: number;
  priceDisplay: string;
  image: string;
  images?: string[];
  description: string;
  features: string[];
  bathroomType?: "attached" | "shared" | "none";
  bedCount?: number;
  maxOccupants?: number;
  status: BedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  created_at?: string;
}

export type PatientCondition = "Stable" | "Observation" | "Critical" | "Recovering";

export type BookingStatus = "Pending" | "Confirmed" | "Checked-In" | "Completed" | "Cancelled";
export type BookingPaymentStatus = "Unpaid" | "Deposit Paid" | "Fully Paid" | "Refunded";
export type PaymentMethod = "bKash" | "Nagad" | "Card" | "Bank Transfer" | "Cash";

export interface BedBooking {
  id: string;
  bed_id: string;
  bed_name: string;
  bed_category: string;
  bed_daily_rate: number;
  patient_name: string;
  patient_phone: string;
  patient_nid?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_blood_group?: string;
  check_in_date: string;
  check_out_date?: string;
  duration_days: number;
  booking_status: BookingStatus;
  payment_status: BookingPaymentStatus;
  payment_method?: PaymentMethod;
  total_amount: number;
  deposit_amount: number;
  paid_amount: number;
  transaction_ref?: string;
  attending_doctor: string;
  diagnosis?: string;
  notes?: string;
  created_at: string;
}

export interface InpatientAdmission {
  id: string;
  patient_id?: string;
  patient_name: string;
  english_name?: string;
  nid_number?: string;
  smart_card_uid?: string;
  personal_phone: string;
  date_of_birth: string;
  age: number;
  gender: string;
  blood_group: string;
  address: string;
  allergies: string[];
  has_pacemaker: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  bed_id: string;
  bed_name: string;
  bed_type: string;
  bed_daily_rate: number;
  admission_date: string;
  admission_time?: string;
  attending_doctor: string;
  primary_diagnosis: string;
  condition: PatientCondition;
  initial_deposit: number;
  status: "Admitted" | "Discharged" | "Transferred";
  healthPassVerified?: boolean;
}

export interface BillItem {
  id: string;
  description: string;
  category: "Bed Charges" | "Physician Fee" | "Medications" | "Diagnostics" | "Nursing & Service" | string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface HospitalBill {
  id: string;
  admission_id: string;
  booking_id?: string;
  patient_name: string;
  patient_nid?: string;
  patient_phone?: string;
  bed_name: string;
  admission_date: string;
  discharge_date?: string;
  days_admitted: number;
  items: BillItem[];
  bed_total: number;
  doctor_fee: number;
  pharmacy_total: number;
  diagnostics_total: number;
  nursing_fee: number;
  gross_total: number;
  deposit_paid: number;
  discount: number;
  net_payable: number;
  payment_status: "Paid" | "Pending" | "Partial";
  payment_method?: string;
  transaction_ref?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_trx_id?: string;
  concession_reason?: string;
  created_at: string;
}

export interface HospitalDoctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  degrees: string;
  bmdc_reg: string;
  phone: string;
  email: string;
  room: string;
  visiting_hours: string;
  consultation_fee: number;
  patientsToday: number;
  status: "Active" | "On-Duty" | "In Surgery" | "On Leave";
  created_at?: string;
}

// ====== Custom Hospital Billing Theme, Watermark & Letterhead Configuration ======

export type HospitalThemeStyle = "singapore" | "apollo" | "royal" | "minimal";

export interface HospitalThemeConfig {
  hospital_name: string;
  hospital_tagline: string;
  hospital_address: string;
  hospital_hotline: string;
  hospital_phone: string;
  hospital_email: string;
  license_no: string;
  tax_bin: string;
  logo_url?: string;
  theme_style: HospitalThemeStyle;
  watermark_text: string;
  watermark_opacity: number;
  watermark_enabled: boolean;
  stamp_text: string;
  stamp_color: string;
  stamp_enabled: boolean;
}

// ====== Hospital Financial Transactions Ledger ======

export interface HospitalTransactionRecord {
  id: string;
  invoice_id: string;
  patient_name: string;
  patient_phone: string;
  smart_card_uid?: string;
  amount: number;
  gross_amount?: number;
  discount_amount?: number;
  payment_method: string;
  transaction_type: "Admission Deposit" | "Discharge Clearance" | "Diagnostic Lab" | "OPD Consultation" | "Emergency Triage";
  status: "Settled" | "Pending" | "Refunded";
  reference_no: string;
  bank_name?: string;
  bank_trx_id?: string;
  cashier_name: string;
  created_at: string;
  notes?: string;
}



// ====== Hospital Multi-Bank Accounts Directory ======

export interface HospitalBankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name: string;
  routing_number?: string;
  category: "MFS" | "Commercial Bank" | "Card POS" | "Cash Counter";
  badge_color?: string;
}

export type ConcessionPolicyReason =
  | "Standard Clinical Concession"
  | "Hospital Authority Discretionary Waiver"
  | "Corporate / TPA Insurance Co-Pay Waiver"
  | "Zakat / Social Welfare Fund Subsidy"
  | "Freedom Fighter / Healthcare Worker Benefit"
  | "None / Full Tariff Applicable";
