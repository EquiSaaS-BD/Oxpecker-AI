import type {
  BedGig,
  InpatientAdmission,
  HospitalBill,
  BillItem,
  HospitalDoctor,
  BedBooking,
  BookingStatus,
  BookingPaymentStatus,
  PaymentMethod,
} from "@/types/hospital-hms";
import { INITIAL_HEALTH_CARDS, calculateAge, formatDate } from "@/lib/healthpass";

const BEDS_STORAGE_KEY = "oxpecker_hms_beds";
const ADMISSIONS_STORAGE_KEY = "oxpecker_hms_admissions";
const BILLS_STORAGE_KEY = "oxpecker_hms_bills";
const BOOKINGS_STORAGE_KEY = "oxpecker_hms_bookings";
const DOCTORS_STORAGE_KEY = "oxpecker_hms_doctors";

// Initial Singapore-Grade Bed Gigs with multi-image gallery & clinical specifications
export const INITIAL_BED_GIGS: BedGig[] = [
  {
    id: "ICU-01",
    title: "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    category: "ICU",
    ward: "Level 3 - Critical Care Tower",
    floor: "Level 3",
    roomNumber: "Suite 301-A",
    price: 18500,
    priceDisplay: "৳ 18,500 / day",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop"
    ],
    description: "Equipped with advanced mechanical ventilation, invasive arterial line monitoring, 24/7 dedicated critical care nursing, and negative pressure filtration.",
    features: [
      "Mechanical Ventilator",
      "Dedicated ICU Nurse 1:1",
      "Central Oxygen Support",
      "Cardiac Telemetry 12-Lead",
      "Defibrillator Ready",
      "Negative Pressure Filtration"
    ],
    bathroomType: "attached",
    bedCount: 1,
    maxOccupants: 1,
    status: "Occupied",
    currentPatientId: "ADM-1031",
    currentPatientName: "Shahidul Islam",
    created_at: "2026-10-01",
  },
  {
    id: "VIP-402",
    title: "Mount Elizabeth Royal VIP Suite 402",
    category: "VIP Suite",
    ward: "Level 4 - Royal Executive Wing",
    floor: "Level 4",
    roomNumber: "Room 402",
    price: 25000,
    priceDisplay: "৳ 25,000 / day",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop"
    ],
    description: "Ultra-luxury inpatient suite featuring an electrically adjustable ergonomic hospital bed, private attendant bedroom, en-suite marble bath, smart nurse call, and living room.",
    features: [
      "Private Attendant Room",
      "Smart Electric Bed",
      "Central Medical Oxygen",
      "Private En-Suite Bath",
      "Smart Nurse Intercom",
      "High-Speed WiFi",
      "Smart LED TV"
    ],
    bathroomType: "attached",
    bedCount: 1,
    maxOccupants: 2,
    status: "Vacant",
    created_at: "2026-10-05",
  },
  {
    id: "CCU-02",
    title: "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    category: "CCU",
    ward: "Level 3 - Heart Centre",
    floor: "Level 3",
    roomNumber: "Pod 02",
    price: 15000,
    priceDisplay: "৳ 15,000 / day",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=500&fit=crop"
    ],
    description: "Designed for acute coronary syndrome, post-angioplasty recovery, and arrhythmia management with real-time continuous hemodynamic monitoring.",
    features: [
      "Hemodynamic Monitor",
      "24/7 Cardiologist On-Floor",
      "Continuous ECG Monitoring",
      "Oxygen Inhaler",
      "Nurse Station Sync"
    ],
    bathroomType: "attached",
    bedCount: 1,
    maxOccupants: 1,
    status: "Vacant",
    created_at: "2026-10-08",
  },
  {
    id: "CAB-304",
    title: "Executive Single Deluxe Cabin 304",
    category: "Deluxe Cabin",
    ward: "Level 3 - Inpatient Deluxe Wing",
    floor: "Level 3",
    roomNumber: "Cabin 304",
    price: 7500,
    priceDisplay: "৳ 7,500 / day",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop"
    ],
    description: "Spacious private air-conditioned cabin with natural sunlight, ergonomic attendant recliner couch, private washroom, LED TV, and medication dispenser.",
    features: [
      "Single Private Room",
      "Attendant Sofa-Bed",
      "Central Oxygen Pipeline",
      "Private Restroom",
      "Nurse Call Pendant"
    ],
    bathroomType: "attached",
    bedCount: 1,
    maxOccupants: 2,
    status: "Occupied",
    currentPatientId: "ADM-1029",
    currentPatientName: "Al Amin Sheikh",
    created_at: "2026-10-10",
  },
  {
    id: "NICU-08",
    title: "Neonatal Intensive Care Incubator (NICU Unit 08)",
    category: "NICU",
    ward: "Level 2 - Maternal & Child Health",
    floor: "Level 2",
    roomNumber: "Incubator Unit 08",
    price: 12000,
    priceDisplay: "৳ 12,000 / day",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop"
    ],
    description: "Specialized closed radiant warmer incubator for premature neonates with micro-infusion pumps, phototherapy lamps, and neonatal vitals sensors.",
    features: [
      "Radiant Warmer Incubator",
      "Phototherapy Ready",
      "Neonatal Micro-Vitals",
      "Sterile ISO-5 Air Filter",
      "Specialist Pediatrician"
    ],
    bathroomType: "none",
    bedCount: 1,
    maxOccupants: 1,
    status: "Occupied",
    currentPatientId: "ADM-1032",
    currentPatientName: "Baby of Nusrat",
    created_at: "2026-10-12",
  },
  {
    id: "GW-14",
    title: "Post-Operative General Ward Bed 14",
    category: "General Ward",
    ward: "Level 2 - Surgical Ward B",
    floor: "Level 2",
    roomNumber: "Ward B - Bed 14",
    price: 2500,
    priceDisplay: "৳ 2,500 / day",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&h=500&fit=crop"
    ],
    description: "Semi-private partition general recovery bed with wall-mounted oxygen supply, suction apparatus, privacy curtains, and nurse call button.",
    features: [
      "Bedside Privacy Curtain",
      "Wall Oxygen & Suction",
      "Nurse Call Button",
      "Daily Doctor Rounds",
      "Dietary Meal Plan"
    ],
    bathroomType: "shared",
    bedCount: 1,
    maxOccupants: 1,
    status: "Occupied",
    currentPatientId: "ADM-1030",
    currentPatientName: "Mst. Rehana Parvin",
    created_at: "2026-10-14",
  },
];

// Initial Inpatient Admissions
export const INITIAL_ADMISSIONS: InpatientAdmission[] = [
  {
    id: "ADM-1029",
    patient_id: "user-001",
    patient_name: "Al Amin Sheikh",
    english_name: "Al Amin Sheikh",
    nid_number: "1972 5590 1234 9876",
    smart_card_uid: "8472-1094-8832-5501",
    personal_phone: "+880 1712-345678",
    date_of_birth: "1972-06-15",
    age: 52,
    gender: "Male",
    blood_group: "O+",
    address: "House 12, Road 4, Dhanmondi, Dhaka",
    allergies: ["Penicillin", "Sulfa Drugs"],
    has_pacemaker: false,
    emergency_contact_name: "Fatema Begum",
    emergency_contact_phone: "+880 1819-876543",
    emergency_contact_relation: "Wife",
    bed_id: "CAB-304",
    bed_name: "Executive Single Deluxe Cabin 304",
    bed_type: "Deluxe Cabin",
    bed_daily_rate: 7500,
    admission_date: "2026-10-18",
    admission_time: "10:30 AM",
    attending_doctor: "Prof. Dr. Anisur Rahman",
    primary_diagnosis: "Acute Coronary Syndrome & Uncontrolled Hypertension",
    condition: "Stable",
    initial_deposit: 20000,
    status: "Admitted",
    healthPassVerified: true,
  },
  {
    id: "ADM-1030",
    patient_id: "user-002",
    patient_name: "Mst. Rehana Parvin",
    english_name: "Mst. Rehana Parvin",
    nid_number: "1985 4401 9283 1102",
    smart_card_uid: "HP-2026-11840",
    personal_phone: "+880 1819-001122",
    date_of_birth: "1985-09-20",
    age: 39,
    gender: "Female",
    blood_group: "B+",
    address: "Block C, Bashundhara R/A, Dhaka",
    allergies: ["Latex", "Ibuprofen"],
    has_pacemaker: false,
    emergency_contact_name: "Tariqul Islam",
    emergency_contact_phone: "+880 1912-887766",
    emergency_contact_relation: "Husband",
    bed_id: "GW-14",
    bed_name: "Post-Operative General Ward Bed 14",
    bed_type: "General Ward",
    bed_daily_rate: 2500,
    admission_date: "2026-10-19",
    admission_time: "02:15 PM",
    attending_doctor: "Dr. Farzana Yasmin",
    primary_diagnosis: "Elective Laparoscopic Cholecystectomy Post-Op",
    condition: "Observation",
    initial_deposit: 15000,
    status: "Admitted",
    healthPassVerified: true,
  },
  {
    id: "ADM-1031",
    patient_id: "user-003",
    patient_name: "Shahidul Islam",
    english_name: "Shahidul Islam",
    nid_number: "1957 8899 0011 2233",
    smart_card_uid: "HP-2026-55418",
    personal_phone: "+880 1711-223344",
    date_of_birth: "1957-03-10",
    age: 67,
    gender: "Male",
    blood_group: "A+",
    address: "Sector 7, Uttara, Dhaka",
    allergies: ["Aspirin", "Iodinated Radiocontrast Media"],
    has_pacemaker: true,
    emergency_contact_name: "Nazrul Islam",
    emergency_contact_phone: "+880 1611-998877",
    emergency_contact_relation: "Son",
    bed_id: "ICU-01",
    bed_name: "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    bed_type: "ICU",
    bed_daily_rate: 18500,
    admission_date: "2026-10-20",
    admission_time: "04:45 AM",
    attending_doctor: "Dr. Mahmudul Hasan",
    primary_diagnosis: "Acute Respiratory Distress Syndrome (ARDS) on Mechanical Ventilation",
    condition: "Critical",
    initial_deposit: 50000,
    status: "Admitted",
    healthPassVerified: true,
  },
  {
    id: "ADM-1032",
    patient_id: "user-004",
    patient_name: "Baby of Nusrat",
    english_name: "Baby of Nusrat",
    nid_number: "Birth Cert: 20262698440123901",
    smart_card_uid: "HP-2026-99014",
    personal_phone: "+880 1914-556677",
    date_of_birth: "2026-09-15",
    age: 1,
    gender: "Female",
    blood_group: "B+",
    address: "Mirpur 10, Dhaka",
    allergies: [],
    has_pacemaker: false,
    emergency_contact_name: "Nusrat Jahan",
    emergency_contact_phone: "+880 1914-556677",
    emergency_contact_relation: "Mother",
    bed_id: "NICU-08",
    bed_name: "Neonatal Intensive Care Incubator (NICU Unit 08)",
    bed_type: "NICU",
    bed_daily_rate: 12000,
    admission_date: "2026-10-20",
    admission_time: "09:00 AM",
    attending_doctor: "Dr. Nusrat Jahan",
    primary_diagnosis: "Pre-term Neonatal Jaundice & Respiratory Distress",
    condition: "Observation",
    initial_deposit: 25000,
    status: "Admitted",
    healthPassVerified: false,
  },
];

// Initial Invoices & Settlements
export const INITIAL_BILLS: HospitalBill[] = [
  {
    id: "INV-2026-9901",
    admission_id: "ADM-1029",
    patient_name: "Al Amin Sheikh",
    patient_nid: "1972 5590 1234 9876",
    patient_phone: "+880 1712-345678",
    bed_name: "Executive Single Deluxe Cabin 304",
    admission_date: "2026-10-18",
    discharge_date: "2026-10-22",
    days_admitted: 4,
    items: [
      { id: "item-1", description: "Deluxe Cabin Stay (4 Days @ ৳7,500/day)", category: "Bed Charges", quantity: 4, unitPrice: 7500, total: 30000 },
      { id: "item-2", description: "Cardiologist Consultation & Rounds", category: "Physician Fee", quantity: 4, unitPrice: 2000, total: 8000 },
      { id: "item-3", description: "12-Lead ECG & Echocardiogram (Color Doppler)", category: "Diagnostics", quantity: 1, unitPrice: 5500, total: 5500 },
      { id: "item-4", description: "Cardiac Emergency IV Infusions & Statins", category: "Medications", quantity: 1, unitPrice: 4200, total: 4200 },
      { id: "item-5", description: "Specialized 24-hr Nursing Care", category: "Nursing & Service", quantity: 4, unitPrice: 1000, total: 4000 },
    ],
    bed_total: 30000,
    doctor_fee: 8000,
    pharmacy_total: 4200,
    diagnostics_total: 5500,
    nursing_fee: 4000,
    gross_total: 51700,
    deposit_paid: 20000,
    discount: 2500,
    net_payable: 29200,
    payment_status: "Paid",
    payment_method: "bKash Merchant",
    created_at: "2026-10-22 04:30 PM",
  },
  {
    id: "INV-2026-9902",
    admission_id: "ADM-1030",
    patient_name: "Mst. Rehana Parvin",
    patient_nid: "1985 4401 9283 1102",
    patient_phone: "+880 1819-001122",
    bed_name: "Post-Operative General Ward Bed 14",
    admission_date: "2026-10-19",
    discharge_date: "2026-10-21",
    days_admitted: 2,
    items: [
      { id: "item-1", description: "General Ward Stay (2 Days @ ৳2,500/day)", category: "Bed Charges", quantity: 2, unitPrice: 2500, total: 5000 },
      { id: "item-2", description: "General Surgeon Post-Op Rounds", category: "Physician Fee", quantity: 2, unitPrice: 1500, total: 3000 },
      { id: "item-3", description: "IV Antibiotics & Post-Surgical Analgesics", category: "Medications", quantity: 1, unitPrice: 3800, total: 3800 },
      { id: "item-4", description: "Post-Op Wound Dressing & Nursing", category: "Nursing & Service", quantity: 2, unitPrice: 800, total: 1600 },
    ],
    bed_total: 5000,
    doctor_fee: 3000,
    pharmacy_total: 3800,
    diagnostics_total: 0,
    nursing_fee: 1600,
    gross_total: 13400,
    deposit_paid: 15000,
    discount: 0,
    net_payable: 0,
    payment_status: "Paid",
    payment_method: "City Bank POS",
    created_at: "2026-10-21 01:15 PM",
  },
  {
    id: "INV-2026-9903",
    admission_id: "ADM-1031",
    patient_name: "Shahidul Islam",
    patient_nid: "1957 8899 0011 2233",
    patient_phone: "+880 1711-223344",
    bed_name: "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    admission_date: "2026-10-20",
    days_admitted: 4,
    items: [
      { id: "item-1", description: "ICU Pod Stay (4 Days @ ৳18,500/day)", category: "Bed Charges", quantity: 4, unitPrice: 18500, total: 74000 },
      { id: "item-2", description: "Mechanical Ventilator Support (96 Hours)", category: "Bed Charges", quantity: 4, unitPrice: 5000, total: 20000 },
      { id: "item-3", description: "Intensivist & Pulmonologist Multi-Specialty Rounds", category: "Physician Fee", quantity: 4, unitPrice: 3500, total: 14000 },
      { id: "item-4", description: "Arterial Blood Gas (ABG) & Daily Electrolytes", category: "Diagnostics", quantity: 4, unitPrice: 2200, total: 8800 },
      { id: "item-5", description: "Emergency ICU Sedation, Vasopressors & Inotropes", category: "Medications", quantity: 1, unitPrice: 16500, total: 16500 },
    ],
    bed_total: 94000,
    doctor_fee: 14000,
    pharmacy_total: 16500,
    diagnostics_total: 8800,
    nursing_fee: 6000,
    gross_total: 139300,
    deposit_paid: 50000,
    discount: 0,
    net_payable: 89300,
    payment_status: "Pending",
    created_at: "2026-10-24 11:00 AM",
  },
];

// Initial Realistic Bed Bookings
export const INITIAL_BOOKINGS: BedBooking[] = [
  {
    id: "BK-2026-081",
    bed_id: "VIP-402",
    bed_name: "Mount Elizabeth Royal VIP Suite 402",
    bed_category: "VIP Suite",
    bed_daily_rate: 25000,
    patient_name: "Syed Golam Kibria",
    patient_phone: "+880 1711-998877",
    patient_nid: "1968 1122 3344 5566",
    patient_age: 58,
    patient_gender: "Male",
    patient_blood_group: "O+",
    check_in_date: "2026-10-26",
    check_out_date: "2026-10-29",
    duration_days: 3,
    booking_status: "Confirmed",
    payment_status: "Deposit Paid",
    payment_method: "bKash",
    total_amount: 75000,
    deposit_amount: 25000,
    paid_amount: 25000,
    transaction_ref: "TRX-BK7889211",
    attending_doctor: "Prof. Dr. Anisur Rahman",
    diagnosis: "Elective Cardiac Catheterization & Post-Procedure Recovery",
    notes: "Patient requested oxygen backup and attendant bedroom prepared.",
    created_at: "2026-10-24 09:30 AM",
  },
  {
    id: "BK-2026-082",
    bed_id: "CCU-02",
    bed_name: "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    bed_category: "CCU",
    bed_daily_rate: 15000,
    patient_name: "Nasima Akhter",
    patient_phone: "+880 1819-223344",
    patient_nid: "1975 6677 8899 0011",
    patient_age: 49,
    patient_gender: "Female",
    patient_blood_group: "A+",
    check_in_date: "2026-10-25",
    check_out_date: "2026-10-27",
    duration_days: 2,
    booking_status: "Pending",
    payment_status: "Unpaid",
    payment_method: "Cash",
    total_amount: 30000,
    deposit_amount: 10000,
    paid_amount: 0,
    attending_doctor: "Dr. Farzana Yasmin",
    diagnosis: "Unstable Angina & Telemetry Monitoring",
    notes: "Awaiting cardiology clearance and initial advance receipt.",
    created_at: "2026-10-24 02:15 PM",
  },
  {
    id: "BK-2026-083",
    bed_id: "CAB-304",
    bed_name: "Executive Single Deluxe Cabin 304",
    bed_category: "Deluxe Cabin",
    bed_daily_rate: 7500,
    patient_name: "Al Amin Sheikh",
    patient_phone: "+880 1712-345678",
    patient_nid: "1972 5590 1234 9876",
    patient_age: 52,
    patient_gender: "Male",
    patient_blood_group: "O+",
    check_in_date: "2026-10-18",
    check_out_date: "2026-10-22",
    duration_days: 4,
    booking_status: "Checked-In",
    payment_status: "Deposit Paid",
    payment_method: "Card",
    total_amount: 30000,
    deposit_amount: 20000,
    paid_amount: 20000,
    transaction_ref: "POS-VISA-99120",
    attending_doctor: "Prof. Dr. Anisur Rahman",
    diagnosis: "Acute Coronary Syndrome & Hypertension",
    notes: "Admitted via emergency referral. Inpatient active.",
    created_at: "2026-10-18 10:00 AM",
  },
  {
    id: "BK-2026-084",
    bed_id: "ICU-01",
    bed_name: "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    bed_category: "ICU",
    bed_daily_rate: 18500,
    patient_name: "Shahidul Islam",
    patient_phone: "+880 1711-223344",
    patient_nid: "1957 8899 0011 2233",
    patient_age: 67,
    patient_gender: "Male",
    patient_blood_group: "A+",
    check_in_date: "2026-10-20",
    duration_days: 5,
    booking_status: "Checked-In",
    payment_status: "Deposit Paid",
    payment_method: "Bank Transfer",
    total_amount: 92500,
    deposit_amount: 50000,
    paid_amount: 50000,
    transaction_ref: "EBL-EFT-441098",
    attending_doctor: "Dr. Mahmudul Hasan",
    diagnosis: "ARDS on Mechanical Ventilation",
    notes: "Emergency priority critical booking.",
    created_at: "2026-10-20 04:30 AM",
  },
  {
    id: "BK-2026-080",
    bed_id: "GW-14",
    bed_name: "Post-Operative General Ward Bed 14",
    bed_category: "General Ward",
    bed_daily_rate: 2500,
    patient_name: "Mst. Rehana Parvin",
    patient_phone: "+880 1819-001122",
    patient_nid: "1985 4401 9283 1102",
    patient_age: 39,
    patient_gender: "Female",
    patient_blood_group: "B+",
    check_in_date: "2026-10-19",
    check_out_date: "2026-10-21",
    duration_days: 2,
    booking_status: "Completed",
    payment_status: "Fully Paid",
    payment_method: "Card",
    total_amount: 5000,
    deposit_amount: 15000,
    paid_amount: 13400,
    transaction_ref: "POS-MC-55102",
    attending_doctor: "Dr. Farzana Yasmin",
    diagnosis: "Post-Op Cholecystectomy Recovery",
    notes: "Discharged with clean postoperative clearance.",
    created_at: "2026-10-19 01:30 PM",
  },
];

// ====== Persistence Helpers (LocalStorage with Server Database Synchronization) ======

function syncHmsToServer(action: string, payload: any) {
  if (typeof window === "undefined") return;
  fetch("/api/hospital/hms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  }).catch((err) => {
    console.warn(`[HMS Sync] Server database sync note for ${action}:`, err);
  });
}

export function getHospitalBeds(): BedGig[] {
  if (typeof window === "undefined") return INITIAL_BED_GIGS;
  try {
    const raw = localStorage.getItem(BEDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure backwards compatibility with images array
        return parsed.map((b: BedGig) => ({
          ...b,
          images: Array.isArray(b.images) && b.images.length > 0 ? b.images : (b.image ? [b.image] : []),
        }));
      }
    }
  } catch (err) {
    console.warn("Failed to load hospital beds from localStorage:", err);
  }
  // Initialize default
  try {
    localStorage.setItem(BEDS_STORAGE_KEY, JSON.stringify(INITIAL_BED_GIGS));
  } catch {}
  return INITIAL_BED_GIGS;
}

export function getBedById(id: string): BedGig | undefined {
  const beds = getHospitalBeds();
  return beds.find((b) => b.id.toLowerCase() === id.toLowerCase());
}

export function saveHospitalBed(bed: BedGig): BedGig[] {
  const current = getHospitalBeds();
  // Ensure image and images are in sync
  const sanitizedBed: BedGig = {
    ...bed,
    image: bed.image || (bed.images && bed.images.length > 0 ? bed.images[0] : "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop"),
    images: Array.isArray(bed.images) && bed.images.length > 0 ? bed.images : (bed.image ? [bed.image] : []),
  };

  const existingIndex = current.findIndex((b) => b.id.toLowerCase() === bed.id.toLowerCase());
  let updated: BedGig[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = sanitizedBed;
  } else {
    updated = [sanitizedBed, ...current];
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BEDS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  syncHmsToServer("save_bed", sanitizedBed);
  return updated;
}

export function deleteHospitalBed(id: string): BedGig[] {
  const current = getHospitalBeds();
  const updated = current.filter((b) => b.id.toLowerCase() !== id.toLowerCase());
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BEDS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  syncHmsToServer("delete_bed", { id });
  return updated;
}

export function updateBedStatus(
  bedId: string,
  status: BedGig["status"],
  patientName?: string,
  patientId?: string
): BedGig[] {
  const current = getHospitalBeds();
  const updated = current.map((b) => {
    if (b.id.toLowerCase() === bedId.toLowerCase()) {
      return {
        ...b,
        status,
        currentPatientName: status === "Occupied" ? (patientName || b.currentPatientName) : undefined,
        currentPatientId: status === "Occupied" ? (patientId || b.currentPatientId) : undefined,
      };
    }
    return b;
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BEDS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  syncHmsToServer("update_bed_status", { bedId, status, patientName, patientId });
  return updated;
}

// ====== Bookings Persistence & Synchronization ======

export function getHospitalBookings(): BedBooking[] {
  if (typeof window === "undefined") return INITIAL_BOOKINGS;
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load bookings from localStorage:", err);
  }
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
  } catch {}
  return INITIAL_BOOKINGS;
}

export function getBookingById(id: string): BedBooking | undefined {
  const current = getHospitalBookings();
  const normalized = id.trim().toLowerCase();
  return current.find((b) => b.id.toLowerCase() === normalized);
}

export function saveHospitalBooking(booking: BedBooking): BedBooking[] {
  const current = getHospitalBookings();
  const existingIndex = current.findIndex((b) => b.id === booking.id);
  let updated: BedBooking[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = booking;
  } else {
    updated = [booking, ...current];
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  // Automatic Bed Status Synchronization:
  if (booking.booking_status === "Checked-In") {
    updateBedStatus(booking.bed_id, "Occupied", booking.patient_name, booking.id);
  }

  syncHmsToServer("save_booking", booking);
  return updated;
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  paymentStatus?: BookingPaymentStatus,
  paidAmount?: number
): BedBooking[] {
  const current = getHospitalBookings();
  let targetBooking: BedBooking | undefined;
  const updated = current.map((b) => {
    if (b.id === bookingId) {
      targetBooking = {
        ...b,
        booking_status: status,
        ...(paymentStatus ? { payment_status: paymentStatus } : {}),
        ...(paidAmount !== undefined ? { paid_amount: paidAmount } : {}),
      };
      return targetBooking;
    }
    return b;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  syncHmsToServer("update_booking_status", { id: bookingId, status, paymentStatus, paidAmount });

  // Automatic Bed Status Synchronization
  if (targetBooking) {
    if (status === "Checked-In") {
      updateBedStatus(targetBooking.bed_id, "Occupied", targetBooking.patient_name, targetBooking.id);
    } else if (status === "Completed") {
      updateBedStatus(targetBooking.bed_id, "Cleaning");
    } else if (status === "Cancelled") {
      updateBedStatus(targetBooking.bed_id, "Vacant");
    }
  }

  return updated;
}

export function cancelHospitalBooking(bookingId: string): BedBooking[] {
  return updateBookingStatus(bookingId, "Cancelled");
}

// Inpatient Admissions
export function getHospitalAdmissions(): InpatientAdmission[] {
  if (typeof window === "undefined") return INITIAL_ADMISSIONS;
  try {
    const raw = localStorage.getItem(ADMISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((a: InpatientAdmission) => ({
          ...a,
          patient_name: a.english_name || (a.patient_name && !/[\u0980-\u09FF]/.test(a.patient_name) ? a.patient_name : "Patient " + a.id),
        }));
      }
    }
  } catch (err) {
    console.warn("Failed to load admissions from localStorage:", err);
  }
  try {
    localStorage.setItem(ADMISSIONS_STORAGE_KEY, JSON.stringify(INITIAL_ADMISSIONS));
  } catch {}
  return INITIAL_ADMISSIONS;
}

export function saveHospitalAdmission(admission: InpatientAdmission): InpatientAdmission[] {
  const current = getHospitalAdmissions();
  const existingIndex = current.findIndex((a) => a.id === admission.id);
  let updated: InpatientAdmission[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = admission;
  } else {
    updated = [admission, ...current];
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ADMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  // Automatically update bed status to Occupied
  updateBedStatus(admission.bed_id, "Occupied", admission.english_name || admission.patient_name, admission.id);
  syncHmsToServer("save_admission", admission);
  return updated;
}

export function dischargeHospitalPatient(admissionId: string): { admissions: InpatientAdmission[]; releasedBedId?: string } {
  const current = getHospitalAdmissions();
  let releasedBedId: string | undefined;
  const updated = current.map((a) => {
    if (a.id === admissionId) {
      releasedBedId = a.bed_id;
      return { ...a, status: "Discharged" as const };
    }
    return a;
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ADMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  if (releasedBedId) {
    // Bed moves to cleaning/sanitization cycle
    updateBedStatus(releasedBedId, "Cleaning");
  }
  return { admissions: updated, releasedBedId };
}

// Hospital Invoices & Billing
export function getHospitalBills(): HospitalBill[] {
  if (typeof window === "undefined") return INITIAL_BILLS;
  try {
    const raw = localStorage.getItem(BILLS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load bills from localStorage:", err);
  }
  try {
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(INITIAL_BILLS));
  } catch {}
  return INITIAL_BILLS;
}

export function saveHospitalBill(bill: HospitalBill): HospitalBill[] {
  const current = getHospitalBills();
  const existingIndex = current.findIndex((b) => b.id === bill.id);
  let updated: HospitalBill[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = bill;
  } else {
    updated = [bill, ...current];
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  syncHmsToServer("save_bill", bill);
  return updated;
}

// ====== 1-Click National HealthPass Registry Search & Auto-Import ======

export interface RegistrySearchMatch {
  id: string;
  patient_name: string;
  english_name?: string;
  nid_number?: string;
  smart_card_uid: string;
  date_of_birth: string;
  age: number;
  gender: string;
  blood_group: string;
  personal_phone?: string;
  address?: string;
  allergies?: string[];
  has_pacemaker?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  patient_image?: string;
}

export function searchNationalPatientRegistry(query: string): RegistrySearchMatch[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  // Search across INITIAL_HEALTH_CARDS
  const results: RegistrySearchMatch[] = [];

  for (const card of INITIAL_HEALTH_CARDS) {
    const nameMatch = (card.patient_name || "").toLowerCase().includes(q) || (card.english_name || "").toLowerCase().includes(q);
    const nidMatch = (card.nid_number || "").replace(/\s+/g, "").includes(q.replace(/\s+/g, ""));
    const phoneMatch = (card.personal_phone || "").replace(/[^0-9]/g, "").includes(q.replace(/[^0-9]/g, ""));
    const uidMatch = (card.smart_card_uid || "").toLowerCase().includes(q) || (card.card_number || "").toLowerCase().includes(q);

    if (nameMatch || nidMatch || phoneMatch || uidMatch) {
      results.push({
        id: card.id,
        patient_name: card.patient_name,
        english_name: card.english_name || card.patient_name,
        nid_number: card.nid_number || undefined,
        smart_card_uid: card.smart_card_uid || card.card_number || "HP-DEFAULT",
        date_of_birth: card.date_of_birth,
        age: calculateAge(card.date_of_birth),
        gender: card.gender,
        blood_group: card.blood_group,
        personal_phone: card.personal_phone || undefined,
        address: card.address || `${card.upazila || "Dhanmondi"}, ${card.zila || "Dhaka"}`,
        allergies: card.allergies || [],
        has_pacemaker: card.has_pacemaker || false,
        emergency_contact_name: card.emergency_contact_name || "Emergency Contact",
        emergency_contact_phone: card.emergency_contact_phone || "+880 1819-876543",
        emergency_contact_relation: card.emergency_contact_relation || "Family",
        patient_image: card.patient_image || card.photo_url || undefined,
      });
    }
  }

  return results.slice(0, 8);
}

// ====== Hospital Doctors & Consultants Persistence ======

export const INITIAL_DOCTORS: HospitalDoctor[] = [
  {
    id: "DOC-101",
    name: "Prof. Dr. Anisur Rahman",
    specialty: "Cardiology",
    department: "Cardiology & Interventional Heart Center",
    degrees: "MBBS, FCPS (Cardiology), FRCP (Glasgow)",
    bmdc_reg: "BMDC A-28491",
    phone: "+880 1711-223344",
    email: "anisur@oxpecker.ai",
    room: "Chamber 402, Level 4 Heart Center",
    visiting_hours: "Sat - Wed (5:00 PM - 9:00 PM)",
    consultation_fee: 1800,
    patientsToday: 18,
    status: "Active",
    created_at: "2026-10-01",
  },
  {
    id: "DOC-102",
    name: "Dr. Farzana Yasmin",
    specialty: "Gynecology & Obstetrics",
    department: "Maternal, Fetal & Women's Health",
    degrees: "MBBS, MS (Gynae), DGO, Fellow Laparoscopy",
    bmdc_reg: "BMDC A-34902",
    phone: "+880 1722-334455",
    email: "farzana@oxpecker.ai",
    room: "Chamber 205, Level 2 Maternal Wing",
    visiting_hours: "Sat - Thu (4:00 PM - 8:30 PM)",
    consultation_fee: 1500,
    patientsToday: 24,
    status: "Active",
    created_at: "2026-10-02",
  },
  {
    id: "DOC-103",
    name: "Dr. Mahmudul Hasan",
    specialty: "Neurology",
    department: "Neurology & Stroke Unit",
    degrees: "MBBS, MD (Neurology), MACP (USA)",
    bmdc_reg: "BMDC A-41208",
    phone: "+880 1733-445566",
    email: "mahmud@oxpecker.ai",
    room: "Chamber 310, Level 3 Neurosciences",
    visiting_hours: "Sun - Thu (6:00 PM - 10:00 PM)",
    consultation_fee: 1600,
    patientsToday: 12,
    status: "On-Duty",
    created_at: "2026-10-03",
  },
  {
    id: "DOC-104",
    name: "Dr. Tanvir Ahmed",
    specialty: "General & Laparoscopic Surgery",
    department: "Department of Surgery & OT Complex",
    degrees: "MBBS, FCPS (Surgery), MRCS (Edin)",
    bmdc_reg: "BMDC A-39045",
    phone: "+880 1744-556677",
    email: "tanvir@oxpecker.ai",
    room: "OT Complex Wing B & Chamber 112",
    visiting_hours: "Mon - Fri (3:00 PM - 7:00 PM)",
    consultation_fee: 1500,
    patientsToday: 8,
    status: "In Surgery",
    created_at: "2026-10-04",
  },
  {
    id: "DOC-105",
    name: "Dr. Nusrat Jahan",
    specialty: "Pediatrics & Neonatology",
    department: "Pediatrics & Child Care",
    degrees: "MBBS, DCH, MD (Child Health), Fellow Neonatology",
    bmdc_reg: "BMDC A-45812",
    phone: "+880 1755-667788",
    email: "nusrat@oxpecker.ai",
    room: "Chamber 108, Level 1 Child Clinic",
    visiting_hours: "Sat - Wed (4:30 PM - 8:30 PM)",
    consultation_fee: 1400,
    patientsToday: 22,
    status: "Active",
    created_at: "2026-10-05",
  },
  {
    id: "DOC-106",
    name: "Prof. Dr. AKM Fazlul Hoque",
    specialty: "Orthopedics & Trauma Surgery",
    department: "Orthopedics, Spine & Joint Replacement",
    degrees: "MBBS, MS (Ortho), Fellow Arthroplasty (Singapore)",
    bmdc_reg: "BMDC A-19543",
    phone: "+880 1766-990011",
    email: "fazlul@oxpecker.ai",
    room: "Chamber 501, Level 5 Specialist Suites",
    visiting_hours: "Sat, Mon, Wed (5:00 PM - 9:00 PM)",
    consultation_fee: 2000,
    patientsToday: 15,
    status: "Active",
    created_at: "2026-10-06",
  },
];

export function getHospitalDoctors(): HospitalDoctor[] {
  if (typeof window === "undefined") return INITIAL_DOCTORS;
  try {
    const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load hospital doctors from localStorage:", err);
  }
  try {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(INITIAL_DOCTORS));
  } catch {}
  return INITIAL_DOCTORS;
}

export function saveHospitalDoctor(doctor: HospitalDoctor): HospitalDoctor[] {
  const current = getHospitalDoctors();
  const existingIndex = current.findIndex((d) => d.id === doctor.id);
  let updated: HospitalDoctor[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = doctor;
  } else {
    updated = [doctor, ...current];
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return updated;
}

export function deleteHospitalDoctor(id: string): HospitalDoctor[] {
  const current = getHospitalDoctors();
  const updated = current.filter((d) => d.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return updated;
}
