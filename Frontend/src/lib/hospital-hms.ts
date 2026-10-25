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
  HospitalThemeConfig,
  HospitalTransactionRecord,
  HospitalBankAccount,
  ConcessionPolicyReason,
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
    "id": "BK-2026-081",
    "bed_id": "VIP-402",
    "bed_name": "Mount Elizabeth Royal VIP Suite 402",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 25000,
    "patient_name": "Syed Golam Kibria",
    "patient_phone": "+880 1711-998800",
    "patient_nid": "1968 1122 3344 5566",
    "patient_age": 58,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-15",
    "duration_days": 2,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 50000,
    "deposit_amount": 20000,
    "paid_amount": 20000,
    "transaction_ref": "TRX-BKA-99000",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-15 09:30 AM"
  },
  {
    "id": "BK-2026-082",
    "bed_id": "ICU-01",
    "bed_name": "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    "bed_category": "ICU",
    "bed_daily_rate": 18500,
    "patient_name": "Nasima Akhter",
    "patient_phone": "+880 1819-223301",
    "patient_nid": "1975 6677 8899 0011",
    "patient_age": 49,
    "patient_gender": "Female",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-16",
    "duration_days": 3,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 55500,
    "deposit_amount": 22000,
    "paid_amount": 22000,
    "transaction_ref": "TRX-NAG-99001",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-16 09:30 AM"
  },
  {
    "id": "BK-2026-083",
    "bed_id": "CCU-02",
    "bed_name": "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    "bed_category": "CCU",
    "bed_daily_rate": 15000,
    "patient_name": "Al Amin Sheikh",
    "patient_phone": "+880 1712-345602",
    "patient_nid": "1972 5590 1234 9876",
    "patient_age": 52,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-17",
    "duration_days": 4,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 60000,
    "deposit_amount": 24000,
    "paid_amount": 24000,
    "transaction_ref": "TRX-CAR-99002",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-17 09:30 AM"
  },
  {
    "id": "BK-2026-084",
    "bed_id": "CAB-304",
    "bed_name": "Executive Single Deluxe Cabin 304",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 7500,
    "patient_name": "Shahidul Islam",
    "patient_phone": "+880 1711-223303",
    "patient_nid": "1957 8899 0011 2233",
    "patient_age": 67,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-18",
    "duration_days": 5,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 37500,
    "deposit_amount": 15000,
    "paid_amount": 15000,
    "transaction_ref": "TRX-BAN-99003",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-18 09:30 AM"
  },
  {
    "id": "BK-2026-085",
    "bed_id": "GW-14",
    "bed_name": "Post-Operative General Ward Bed 14",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Mst. Rehana Parvin",
    "patient_phone": "+880 1819-001104",
    "patient_nid": "1985 4401 9283 1102",
    "patient_age": 39,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-19",
    "duration_days": 6,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99004",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-19 09:30 AM"
  },
  {
    "id": "BK-2026-086",
    "bed_id": "HDU-03",
    "bed_name": "High Dependency Step-Down Pod 03",
    "bed_category": "HDU",
    "bed_daily_rate": 12000,
    "patient_name": "Kamrul Hasan",
    "patient_phone": "+880 1713-112205",
    "patient_nid": "1980 2345 6789 0123",
    "patient_age": 46,
    "patient_gender": "Male",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-20",
    "duration_days": 2,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 24000,
    "deposit_amount": 10000,
    "paid_amount": 10000,
    "transaction_ref": "TRX-BKA-99005",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-20 09:30 AM"
  },
  {
    "id": "BK-2026-087",
    "bed_id": "NICU-01",
    "bed_name": "Neonatal Critical Care Isolette 01",
    "bed_category": "NICU",
    "bed_daily_rate": 16000,
    "patient_name": "Sultana Begum",
    "patient_phone": "+880 1914-445506",
    "patient_nid": "1994 3456 7890 1234",
    "patient_age": 32,
    "patient_gender": "Female",
    "patient_blood_group": "AB+",
    "check_in_date": "2026-10-21",
    "duration_days": 3,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 48000,
    "deposit_amount": 19000,
    "paid_amount": 19000,
    "transaction_ref": "TRX-NAG-99006",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-21 09:30 AM"
  },
  {
    "id": "BK-2026-088",
    "bed_id": "VIP-401",
    "bed_name": "Raffles Executive Deluxe VIP Suite 401",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 24000,
    "patient_name": "Farhana Yasmin",
    "patient_phone": "+880 1615-556607",
    "patient_nid": "1988 4567 8901 2345",
    "patient_age": 38,
    "patient_gender": "Female",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-22",
    "duration_days": 4,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 96000,
    "deposit_amount": 38000,
    "paid_amount": 38000,
    "transaction_ref": "TRX-CAR-99007",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-22 09:30 AM"
  },
  {
    "id": "BK-2026-089",
    "bed_id": "CAB-205",
    "bed_name": "Special Deluxe Cabin 205",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 8000,
    "patient_name": "Mahmudur Rahman",
    "patient_phone": "+880 1516-667708",
    "patient_nid": "1970 5678 9012 3456",
    "patient_age": 56,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-23",
    "duration_days": 5,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 40000,
    "deposit_amount": 16000,
    "paid_amount": 16000,
    "transaction_ref": "TRX-BAN-99008",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-23 09:30 AM"
  },
  {
    "id": "BK-2026-090",
    "bed_id": "GW-08",
    "bed_name": "Male Surgical General Ward Bed 08",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Zubair Ahmed",
    "patient_phone": "+880 1717-778809",
    "patient_nid": "1982 6789 0123 4567",
    "patient_age": 44,
    "patient_gender": "Male",
    "patient_blood_group": "O-",
    "check_in_date": "2026-10-24",
    "duration_days": 6,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99009",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-24 09:30 AM"
  },
  {
    "id": "BK-2026-091",
    "bed_id": "VIP-402",
    "bed_name": "Mount Elizabeth Royal VIP Suite 402",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 25000,
    "patient_name": "Rasheda Khatun",
    "patient_phone": "+880 1818-889910",
    "patient_nid": "1965 7890 1234 5678",
    "patient_age": 61,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-25",
    "duration_days": 2,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 50000,
    "deposit_amount": 20000,
    "paid_amount": 20000,
    "transaction_ref": "TRX-BKA-99010",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-25 09:30 AM"
  },
  {
    "id": "BK-2026-092",
    "bed_id": "ICU-01",
    "bed_name": "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    "bed_category": "ICU",
    "bed_daily_rate": 18500,
    "patient_name": "Moniruzzaman Chowdhury",
    "patient_phone": "+880 1919-990011",
    "patient_nid": "1978 8901 2345 6789",
    "patient_age": 48,
    "patient_gender": "Male",
    "patient_blood_group": "A-",
    "check_in_date": "2026-10-26",
    "duration_days": 3,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 55500,
    "deposit_amount": 22000,
    "paid_amount": 22000,
    "transaction_ref": "TRX-NAG-99011",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-26 09:30 AM"
  },
  {
    "id": "BK-2026-093",
    "bed_id": "CCU-02",
    "bed_name": "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    "bed_category": "CCU",
    "bed_daily_rate": 15000,
    "patient_name": "Shahin Alam",
    "patient_phone": "+880 1720-001112",
    "patient_nid": "1990 9012 3456 7890",
    "patient_age": 36,
    "patient_gender": "Male",
    "patient_blood_group": "AB-",
    "check_in_date": "2026-10-15",
    "duration_days": 4,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 60000,
    "deposit_amount": 24000,
    "paid_amount": 24000,
    "transaction_ref": "TRX-CAR-99012",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-15 09:30 AM"
  },
  {
    "id": "BK-2026-094",
    "bed_id": "CAB-304",
    "bed_name": "Executive Single Deluxe Cabin 304",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 7500,
    "patient_name": "Shamim Reza",
    "patient_phone": "+880 1821-112213",
    "patient_nid": "1984 0123 4567 8901",
    "patient_age": 42,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-16",
    "duration_days": 5,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 37500,
    "deposit_amount": 15000,
    "paid_amount": 15000,
    "transaction_ref": "TRX-BAN-99013",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-16 09:30 AM"
  },
  {
    "id": "BK-2026-095",
    "bed_id": "GW-14",
    "bed_name": "Post-Operative General Ward Bed 14",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Nusrat Jahan",
    "patient_phone": "+880 1622-223314",
    "patient_nid": "1996 1234 5678 9012",
    "patient_age": 30,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-17",
    "duration_days": 6,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99014",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-17 09:30 AM"
  },
  {
    "id": "BK-2026-096",
    "bed_id": "HDU-03",
    "bed_name": "High Dependency Step-Down Pod 03",
    "bed_category": "HDU",
    "bed_daily_rate": 12000,
    "patient_name": "Shirin Akter",
    "patient_phone": "+880 1523-334415",
    "patient_nid": "1986 2345 6789 0123",
    "patient_age": 40,
    "patient_gender": "Female",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-18",
    "duration_days": 2,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 24000,
    "deposit_amount": 10000,
    "paid_amount": 10000,
    "transaction_ref": "TRX-BKA-99015",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-18 09:30 AM"
  },
  {
    "id": "BK-2026-097",
    "bed_id": "NICU-01",
    "bed_name": "Neonatal Critical Care Isolette 01",
    "bed_category": "NICU",
    "bed_daily_rate": 16000,
    "patient_name": "Tariqul Islam",
    "patient_phone": "+880 1724-445516",
    "patient_nid": "1979 3456 7890 1234",
    "patient_age": 47,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-19",
    "duration_days": 3,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 48000,
    "deposit_amount": 19000,
    "paid_amount": 19000,
    "transaction_ref": "TRX-NAG-99016",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-19 09:30 AM"
  },
  {
    "id": "BK-2026-098",
    "bed_id": "VIP-401",
    "bed_name": "Raffles Executive Deluxe VIP Suite 401",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 24000,
    "patient_name": "Ashraful Haque",
    "patient_phone": "+880 1825-556617",
    "patient_nid": "1973 4567 8901 2345",
    "patient_age": 53,
    "patient_gender": "Male",
    "patient_blood_group": "B-",
    "check_in_date": "2026-10-20",
    "duration_days": 4,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 96000,
    "deposit_amount": 38000,
    "paid_amount": 38000,
    "transaction_ref": "TRX-CAR-99017",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-20 09:30 AM"
  },
  {
    "id": "BK-2026-099",
    "bed_id": "CAB-205",
    "bed_name": "Special Deluxe Cabin 205",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 8000,
    "patient_name": "Mofizul Islam",
    "patient_phone": "+880 1926-667718",
    "patient_nid": "1962 5678 9012 3456",
    "patient_age": 64,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-21",
    "duration_days": 5,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 40000,
    "deposit_amount": 16000,
    "paid_amount": 16000,
    "transaction_ref": "TRX-BAN-99018",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-21 09:30 AM"
  },
  {
    "id": "BK-2026-100",
    "bed_id": "GW-08",
    "bed_name": "Male Surgical General Ward Bed 08",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Rokeya Sultana",
    "patient_phone": "+880 1727-778819",
    "patient_nid": "1983 6789 0123 4567",
    "patient_age": 43,
    "patient_gender": "Female",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-22",
    "duration_days": 6,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99019",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-22 09:30 AM"
  },
  {
    "id": "BK-2026-101",
    "bed_id": "VIP-402",
    "bed_name": "Mount Elizabeth Royal VIP Suite 402",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 25000,
    "patient_name": "Syed Golam Kibria (2)",
    "patient_phone": "+880 1711-998820",
    "patient_nid": "1968 1122 3344 5566",
    "patient_age": 58,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-23",
    "duration_days": 2,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 50000,
    "deposit_amount": 20000,
    "paid_amount": 20000,
    "transaction_ref": "TRX-BKA-99020",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-23 09:30 AM"
  },
  {
    "id": "BK-2026-102",
    "bed_id": "ICU-01",
    "bed_name": "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    "bed_category": "ICU",
    "bed_daily_rate": 18500,
    "patient_name": "Nasima Akhter (2)",
    "patient_phone": "+880 1819-223321",
    "patient_nid": "1975 6677 8899 0011",
    "patient_age": 49,
    "patient_gender": "Female",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-24",
    "duration_days": 3,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 55500,
    "deposit_amount": 22000,
    "paid_amount": 22000,
    "transaction_ref": "TRX-NAG-99021",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-24 09:30 AM"
  },
  {
    "id": "BK-2026-103",
    "bed_id": "CCU-02",
    "bed_name": "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    "bed_category": "CCU",
    "bed_daily_rate": 15000,
    "patient_name": "Al Amin Sheikh (2)",
    "patient_phone": "+880 1712-345622",
    "patient_nid": "1972 5590 1234 9876",
    "patient_age": 52,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-25",
    "duration_days": 4,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 60000,
    "deposit_amount": 24000,
    "paid_amount": 24000,
    "transaction_ref": "TRX-CAR-99022",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-25 09:30 AM"
  },
  {
    "id": "BK-2026-104",
    "bed_id": "CAB-304",
    "bed_name": "Executive Single Deluxe Cabin 304",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 7500,
    "patient_name": "Shahidul Islam (2)",
    "patient_phone": "+880 1711-223323",
    "patient_nid": "1957 8899 0011 2233",
    "patient_age": 67,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-26",
    "duration_days": 5,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 37500,
    "deposit_amount": 15000,
    "paid_amount": 15000,
    "transaction_ref": "TRX-BAN-99023",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-26 09:30 AM"
  },
  {
    "id": "BK-2026-105",
    "bed_id": "GW-14",
    "bed_name": "Post-Operative General Ward Bed 14",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Mst. Rehana Parvin (2)",
    "patient_phone": "+880 1819-001124",
    "patient_nid": "1985 4401 9283 1102",
    "patient_age": 39,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-15",
    "duration_days": 6,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99024",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-15 09:30 AM"
  },
  {
    "id": "BK-2026-106",
    "bed_id": "HDU-03",
    "bed_name": "High Dependency Step-Down Pod 03",
    "bed_category": "HDU",
    "bed_daily_rate": 12000,
    "patient_name": "Kamrul Hasan (2)",
    "patient_phone": "+880 1713-112225",
    "patient_nid": "1980 2345 6789 0123",
    "patient_age": 46,
    "patient_gender": "Male",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-16",
    "duration_days": 2,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 24000,
    "deposit_amount": 10000,
    "paid_amount": 10000,
    "transaction_ref": "TRX-BKA-99025",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-16 09:30 AM"
  },
  {
    "id": "BK-2026-107",
    "bed_id": "NICU-01",
    "bed_name": "Neonatal Critical Care Isolette 01",
    "bed_category": "NICU",
    "bed_daily_rate": 16000,
    "patient_name": "Sultana Begum (2)",
    "patient_phone": "+880 1914-445526",
    "patient_nid": "1994 3456 7890 1234",
    "patient_age": 32,
    "patient_gender": "Female",
    "patient_blood_group": "AB+",
    "check_in_date": "2026-10-17",
    "duration_days": 3,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 48000,
    "deposit_amount": 19000,
    "paid_amount": 19000,
    "transaction_ref": "TRX-NAG-99026",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-17 09:30 AM"
  },
  {
    "id": "BK-2026-108",
    "bed_id": "VIP-401",
    "bed_name": "Raffles Executive Deluxe VIP Suite 401",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 24000,
    "patient_name": "Farhana Yasmin (2)",
    "patient_phone": "+880 1615-556627",
    "patient_nid": "1988 4567 8901 2345",
    "patient_age": 38,
    "patient_gender": "Female",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-18",
    "duration_days": 4,
    "booking_status": "Checked-In",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 96000,
    "deposit_amount": 38000,
    "paid_amount": 38000,
    "transaction_ref": "TRX-CAR-99027",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-18 09:30 AM"
  },
  {
    "id": "BK-2026-109",
    "bed_id": "CAB-205",
    "bed_name": "Special Deluxe Cabin 205",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 8000,
    "patient_name": "Mahmudur Rahman (2)",
    "patient_phone": "+880 1516-667728",
    "patient_nid": "1970 5678 9012 3456",
    "patient_age": 56,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-19",
    "duration_days": 5,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Bank Transfer",
    "total_amount": 40000,
    "deposit_amount": 12000,
    "paid_amount": 0,
    "transaction_ref": "TRX-BAN-99028",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-19 09:30 AM"
  },
  {
    "id": "BK-2026-110",
    "bed_id": "GW-08",
    "bed_name": "Male Surgical General Ward Bed 08",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Zubair Ahmed (2)",
    "patient_phone": "+880 1717-778829",
    "patient_nid": "1982 6789 0123 4567",
    "patient_age": 44,
    "patient_gender": "Male",
    "patient_blood_group": "O-",
    "check_in_date": "2026-10-20",
    "duration_days": 6,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 5000,
    "paid_amount": 0,
    "transaction_ref": "TRX-CAS-99029",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-20 09:30 AM"
  },
  {
    "id": "BK-2026-111",
    "bed_id": "VIP-402",
    "bed_name": "Mount Elizabeth Royal VIP Suite 402",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 25000,
    "patient_name": "Rasheda Khatun (2)",
    "patient_phone": "+880 1818-889930",
    "patient_nid": "1965 7890 1234 5678",
    "patient_age": 61,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-21",
    "duration_days": 2,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "bKash",
    "total_amount": 50000,
    "deposit_amount": 15000,
    "paid_amount": 0,
    "transaction_ref": "TRX-BKA-99030",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-21 09:30 AM"
  },
  {
    "id": "BK-2026-112",
    "bed_id": "ICU-01",
    "bed_name": "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    "bed_category": "ICU",
    "bed_daily_rate": 18500,
    "patient_name": "Moniruzzaman Chowdhury (2)",
    "patient_phone": "+880 1919-990031",
    "patient_nid": "1978 8901 2345 6789",
    "patient_age": 48,
    "patient_gender": "Male",
    "patient_blood_group": "A-",
    "check_in_date": "2026-10-22",
    "duration_days": 3,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Nagad",
    "total_amount": 55500,
    "deposit_amount": 17000,
    "paid_amount": 0,
    "transaction_ref": "TRX-NAG-99031",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-22 09:30 AM"
  },
  {
    "id": "BK-2026-113",
    "bed_id": "CCU-02",
    "bed_name": "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    "bed_category": "CCU",
    "bed_daily_rate": 15000,
    "patient_name": "Shahin Alam (2)",
    "patient_phone": "+880 1720-001132",
    "patient_nid": "1990 9012 3456 7890",
    "patient_age": 36,
    "patient_gender": "Male",
    "patient_blood_group": "AB-",
    "check_in_date": "2026-10-23",
    "duration_days": 4,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Card",
    "total_amount": 60000,
    "deposit_amount": 18000,
    "paid_amount": 0,
    "transaction_ref": "TRX-CAR-99032",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-23 09:30 AM"
  },
  {
    "id": "BK-2026-114",
    "bed_id": "CAB-304",
    "bed_name": "Executive Single Deluxe Cabin 304",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 7500,
    "patient_name": "Shamim Reza (2)",
    "patient_phone": "+880 1821-112233",
    "patient_nid": "1984 0123 4567 8901",
    "patient_age": 42,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-24",
    "duration_days": 5,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Bank Transfer",
    "total_amount": 37500,
    "deposit_amount": 11000,
    "paid_amount": 0,
    "transaction_ref": "TRX-BAN-99033",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-24 09:30 AM"
  },
  {
    "id": "BK-2026-115",
    "bed_id": "GW-14",
    "bed_name": "Post-Operative General Ward Bed 14",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Nusrat Jahan (2)",
    "patient_phone": "+880 1622-223334",
    "patient_nid": "1996 1234 5678 9012",
    "patient_age": 30,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-25",
    "duration_days": 6,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 5000,
    "paid_amount": 0,
    "transaction_ref": "TRX-CAS-99034",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-25 09:30 AM"
  },
  {
    "id": "BK-2026-116",
    "bed_id": "HDU-03",
    "bed_name": "High Dependency Step-Down Pod 03",
    "bed_category": "HDU",
    "bed_daily_rate": 12000,
    "patient_name": "Shirin Akter (2)",
    "patient_phone": "+880 1523-334435",
    "patient_nid": "1986 2345 6789 0123",
    "patient_age": 40,
    "patient_gender": "Female",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-26",
    "duration_days": 2,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "bKash",
    "total_amount": 24000,
    "deposit_amount": 7000,
    "paid_amount": 0,
    "transaction_ref": "TRX-BKA-99035",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-26 09:30 AM"
  },
  {
    "id": "BK-2026-117",
    "bed_id": "NICU-01",
    "bed_name": "Neonatal Critical Care Isolette 01",
    "bed_category": "NICU",
    "bed_daily_rate": 16000,
    "patient_name": "Tariqul Islam (2)",
    "patient_phone": "+880 1724-445536",
    "patient_nid": "1979 3456 7890 1234",
    "patient_age": 47,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-15",
    "duration_days": 3,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Nagad",
    "total_amount": 48000,
    "deposit_amount": 14000,
    "paid_amount": 0,
    "transaction_ref": "TRX-NAG-99036",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-15 09:30 AM"
  },
  {
    "id": "BK-2026-118",
    "bed_id": "VIP-401",
    "bed_name": "Raffles Executive Deluxe VIP Suite 401",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 24000,
    "patient_name": "Ashraful Haque (2)",
    "patient_phone": "+880 1825-556637",
    "patient_nid": "1973 4567 8901 2345",
    "patient_age": 53,
    "patient_gender": "Male",
    "patient_blood_group": "B-",
    "check_in_date": "2026-10-16",
    "duration_days": 4,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Card",
    "total_amount": 96000,
    "deposit_amount": 29000,
    "paid_amount": 0,
    "transaction_ref": "TRX-CAR-99037",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-16 09:30 AM"
  },
  {
    "id": "BK-2026-119",
    "bed_id": "CAB-205",
    "bed_name": "Special Deluxe Cabin 205",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 8000,
    "patient_name": "Mofizul Islam (2)",
    "patient_phone": "+880 1926-667738",
    "patient_nid": "1962 5678 9012 3456",
    "patient_age": 64,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-17",
    "duration_days": 5,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Bank Transfer",
    "total_amount": 40000,
    "deposit_amount": 12000,
    "paid_amount": 0,
    "transaction_ref": "TRX-BAN-99038",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-17 09:30 AM"
  },
  {
    "id": "BK-2026-120",
    "bed_id": "GW-08",
    "bed_name": "Male Surgical General Ward Bed 08",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Rokeya Sultana (2)",
    "patient_phone": "+880 1727-778839",
    "patient_nid": "1983 6789 0123 4567",
    "patient_age": 43,
    "patient_gender": "Female",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-18",
    "duration_days": 6,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 5000,
    "paid_amount": 0,
    "transaction_ref": "TRX-CAS-99039",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-18 09:30 AM"
  },
  {
    "id": "BK-2026-121",
    "bed_id": "VIP-402",
    "bed_name": "Mount Elizabeth Royal VIP Suite 402",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 25000,
    "patient_name": "Syed Golam Kibria (3)",
    "patient_phone": "+880 1711-998840",
    "patient_nid": "1968 1122 3344 5566",
    "patient_age": 58,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-19",
    "duration_days": 2,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "bKash",
    "total_amount": 50000,
    "deposit_amount": 15000,
    "paid_amount": 0,
    "transaction_ref": "TRX-BKA-99040",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-19 09:30 AM"
  },
  {
    "id": "BK-2026-122",
    "bed_id": "ICU-01",
    "bed_name": "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    "bed_category": "ICU",
    "bed_daily_rate": 18500,
    "patient_name": "Nasima Akhter (3)",
    "patient_phone": "+880 1819-223341",
    "patient_nid": "1975 6677 8899 0011",
    "patient_age": 49,
    "patient_gender": "Female",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-20",
    "duration_days": 3,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Nagad",
    "total_amount": 55500,
    "deposit_amount": 17000,
    "paid_amount": 0,
    "transaction_ref": "TRX-NAG-99041",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-20 09:30 AM"
  },
  {
    "id": "BK-2026-123",
    "bed_id": "CCU-02",
    "bed_name": "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    "bed_category": "CCU",
    "bed_daily_rate": 15000,
    "patient_name": "Al Amin Sheikh (3)",
    "patient_phone": "+880 1712-345642",
    "patient_nid": "1972 5590 1234 9876",
    "patient_age": 52,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-21",
    "duration_days": 4,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Card",
    "total_amount": 60000,
    "deposit_amount": 18000,
    "paid_amount": 0,
    "transaction_ref": "TRX-CAR-99042",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-21 09:30 AM"
  },
  {
    "id": "BK-2026-124",
    "bed_id": "CAB-304",
    "bed_name": "Executive Single Deluxe Cabin 304",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 7500,
    "patient_name": "Shahidul Islam (3)",
    "patient_phone": "+880 1711-223343",
    "patient_nid": "1957 8899 0011 2233",
    "patient_age": 67,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-22",
    "duration_days": 5,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Bank Transfer",
    "total_amount": 37500,
    "deposit_amount": 11000,
    "paid_amount": 0,
    "transaction_ref": "TRX-BAN-99043",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-22 09:30 AM"
  },
  {
    "id": "BK-2026-125",
    "bed_id": "GW-14",
    "bed_name": "Post-Operative General Ward Bed 14",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Mst. Rehana Parvin (3)",
    "patient_phone": "+880 1819-001144",
    "patient_nid": "1985 4401 9283 1102",
    "patient_age": 39,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-23",
    "duration_days": 6,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 5000,
    "paid_amount": 0,
    "transaction_ref": "TRX-CAS-99044",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-23 09:30 AM"
  },
  {
    "id": "BK-2026-126",
    "bed_id": "HDU-03",
    "bed_name": "High Dependency Step-Down Pod 03",
    "bed_category": "HDU",
    "bed_daily_rate": 12000,
    "patient_name": "Kamrul Hasan (3)",
    "patient_phone": "+880 1713-112245",
    "patient_nid": "1980 2345 6789 0123",
    "patient_age": 46,
    "patient_gender": "Male",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-24",
    "duration_days": 2,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "bKash",
    "total_amount": 24000,
    "deposit_amount": 7000,
    "paid_amount": 0,
    "transaction_ref": "TRX-BKA-99045",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-24 09:30 AM"
  },
  {
    "id": "BK-2026-127",
    "bed_id": "NICU-01",
    "bed_name": "Neonatal Critical Care Isolette 01",
    "bed_category": "NICU",
    "bed_daily_rate": 16000,
    "patient_name": "Sultana Begum (3)",
    "patient_phone": "+880 1914-445546",
    "patient_nid": "1994 3456 7890 1234",
    "patient_age": 32,
    "patient_gender": "Female",
    "patient_blood_group": "AB+",
    "check_in_date": "2026-10-25",
    "duration_days": 3,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Nagad",
    "total_amount": 48000,
    "deposit_amount": 14000,
    "paid_amount": 0,
    "transaction_ref": "TRX-NAG-99046",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-25 09:30 AM"
  },
  {
    "id": "BK-2026-128",
    "bed_id": "VIP-401",
    "bed_name": "Raffles Executive Deluxe VIP Suite 401",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 24000,
    "patient_name": "Farhana Yasmin (3)",
    "patient_phone": "+880 1615-556647",
    "patient_nid": "1988 4567 8901 2345",
    "patient_age": 38,
    "patient_gender": "Female",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-26",
    "duration_days": 4,
    "booking_status": "Pending",
    "payment_status": "Unpaid",
    "payment_method": "Card",
    "total_amount": 96000,
    "deposit_amount": 29000,
    "paid_amount": 0,
    "transaction_ref": "TRX-CAR-99047",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-26 09:30 AM"
  },
  {
    "id": "BK-2026-129",
    "bed_id": "CAB-205",
    "bed_name": "Special Deluxe Cabin 205",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 8000,
    "patient_name": "Mahmudur Rahman (3)",
    "patient_phone": "+880 1516-667748",
    "patient_nid": "1970 5678 9012 3456",
    "patient_age": 56,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-15",
    "duration_days": 5,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 40000,
    "deposit_amount": 16000,
    "paid_amount": 16000,
    "transaction_ref": "TRX-BAN-99048",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-15 09:30 AM"
  },
  {
    "id": "BK-2026-130",
    "bed_id": "GW-08",
    "bed_name": "Male Surgical General Ward Bed 08",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Zubair Ahmed (3)",
    "patient_phone": "+880 1717-778849",
    "patient_nid": "1982 6789 0123 4567",
    "patient_age": 44,
    "patient_gender": "Male",
    "patient_blood_group": "O-",
    "check_in_date": "2026-10-16",
    "duration_days": 6,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99049",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-16 09:30 AM"
  },
  {
    "id": "BK-2026-131",
    "bed_id": "VIP-402",
    "bed_name": "Mount Elizabeth Royal VIP Suite 402",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 25000,
    "patient_name": "Rasheda Khatun (3)",
    "patient_phone": "+880 1818-889950",
    "patient_nid": "1965 7890 1234 5678",
    "patient_age": 61,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-17",
    "duration_days": 2,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 50000,
    "deposit_amount": 20000,
    "paid_amount": 20000,
    "transaction_ref": "TRX-BKA-99050",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-17 09:30 AM"
  },
  {
    "id": "BK-2026-132",
    "bed_id": "ICU-01",
    "bed_name": "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    "bed_category": "ICU",
    "bed_daily_rate": 18500,
    "patient_name": "Moniruzzaman Chowdhury (3)",
    "patient_phone": "+880 1919-990051",
    "patient_nid": "1978 8901 2345 6789",
    "patient_age": 48,
    "patient_gender": "Male",
    "patient_blood_group": "A-",
    "check_in_date": "2026-10-18",
    "duration_days": 3,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 55500,
    "deposit_amount": 22000,
    "paid_amount": 22000,
    "transaction_ref": "TRX-NAG-99051",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-18 09:30 AM"
  },
  {
    "id": "BK-2026-133",
    "bed_id": "CCU-02",
    "bed_name": "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    "bed_category": "CCU",
    "bed_daily_rate": 15000,
    "patient_name": "Shahin Alam (3)",
    "patient_phone": "+880 1720-001152",
    "patient_nid": "1990 9012 3456 7890",
    "patient_age": 36,
    "patient_gender": "Male",
    "patient_blood_group": "AB-",
    "check_in_date": "2026-10-19",
    "duration_days": 4,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 60000,
    "deposit_amount": 24000,
    "paid_amount": 24000,
    "transaction_ref": "TRX-CAR-99052",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-19 09:30 AM"
  },
  {
    "id": "BK-2026-134",
    "bed_id": "CAB-304",
    "bed_name": "Executive Single Deluxe Cabin 304",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 7500,
    "patient_name": "Shamim Reza (3)",
    "patient_phone": "+880 1821-112253",
    "patient_nid": "1984 0123 4567 8901",
    "patient_age": 42,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-20",
    "duration_days": 5,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 37500,
    "deposit_amount": 15000,
    "paid_amount": 15000,
    "transaction_ref": "TRX-BAN-99053",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-20 09:30 AM"
  },
  {
    "id": "BK-2026-135",
    "bed_id": "GW-14",
    "bed_name": "Post-Operative General Ward Bed 14",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Nusrat Jahan (3)",
    "patient_phone": "+880 1622-223354",
    "patient_nid": "1996 1234 5678 9012",
    "patient_age": 30,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-21",
    "duration_days": 6,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99054",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-21 09:30 AM"
  },
  {
    "id": "BK-2026-136",
    "bed_id": "HDU-03",
    "bed_name": "High Dependency Step-Down Pod 03",
    "bed_category": "HDU",
    "bed_daily_rate": 12000,
    "patient_name": "Shirin Akter (3)",
    "patient_phone": "+880 1523-334455",
    "patient_nid": "1986 2345 6789 0123",
    "patient_age": 40,
    "patient_gender": "Female",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-22",
    "duration_days": 2,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 24000,
    "deposit_amount": 10000,
    "paid_amount": 10000,
    "transaction_ref": "TRX-BKA-99055",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-22 09:30 AM"
  },
  {
    "id": "BK-2026-137",
    "bed_id": "NICU-01",
    "bed_name": "Neonatal Critical Care Isolette 01",
    "bed_category": "NICU",
    "bed_daily_rate": 16000,
    "patient_name": "Tariqul Islam (3)",
    "patient_phone": "+880 1724-445556",
    "patient_nid": "1979 3456 7890 1234",
    "patient_age": 47,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-23",
    "duration_days": 3,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 48000,
    "deposit_amount": 19000,
    "paid_amount": 19000,
    "transaction_ref": "TRX-NAG-99056",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-23 09:30 AM"
  },
  {
    "id": "BK-2026-138",
    "bed_id": "VIP-401",
    "bed_name": "Raffles Executive Deluxe VIP Suite 401",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 24000,
    "patient_name": "Ashraful Haque (3)",
    "patient_phone": "+880 1825-556657",
    "patient_nid": "1973 4567 8901 2345",
    "patient_age": 53,
    "patient_gender": "Male",
    "patient_blood_group": "B-",
    "check_in_date": "2026-10-24",
    "duration_days": 4,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 96000,
    "deposit_amount": 38000,
    "paid_amount": 38000,
    "transaction_ref": "TRX-CAR-99057",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-24 09:30 AM"
  },
  {
    "id": "BK-2026-139",
    "bed_id": "CAB-205",
    "bed_name": "Special Deluxe Cabin 205",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 8000,
    "patient_name": "Mofizul Islam (3)",
    "patient_phone": "+880 1926-667758",
    "patient_nid": "1962 5678 9012 3456",
    "patient_age": 64,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-25",
    "duration_days": 5,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 40000,
    "deposit_amount": 16000,
    "paid_amount": 16000,
    "transaction_ref": "TRX-BAN-99058",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-25 09:30 AM"
  },
  {
    "id": "BK-2026-140",
    "bed_id": "GW-08",
    "bed_name": "Male Surgical General Ward Bed 08",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Rokeya Sultana (3)",
    "patient_phone": "+880 1727-778859",
    "patient_nid": "1983 6789 0123 4567",
    "patient_age": 43,
    "patient_gender": "Female",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-26",
    "duration_days": 6,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99059",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-26 09:30 AM"
  },
  {
    "id": "BK-2026-141",
    "bed_id": "VIP-402",
    "bed_name": "Mount Elizabeth Royal VIP Suite 402",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 25000,
    "patient_name": "Syed Golam Kibria (4)",
    "patient_phone": "+880 1711-998860",
    "patient_nid": "1968 1122 3344 5566",
    "patient_age": 58,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-15",
    "duration_days": 2,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 50000,
    "deposit_amount": 20000,
    "paid_amount": 20000,
    "transaction_ref": "TRX-BKA-99060",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-15 09:30 AM"
  },
  {
    "id": "BK-2026-142",
    "bed_id": "ICU-01",
    "bed_name": "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    "bed_category": "ICU",
    "bed_daily_rate": 18500,
    "patient_name": "Nasima Akhter (4)",
    "patient_phone": "+880 1819-223361",
    "patient_nid": "1975 6677 8899 0011",
    "patient_age": 49,
    "patient_gender": "Female",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-16",
    "duration_days": 3,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 55500,
    "deposit_amount": 22000,
    "paid_amount": 22000,
    "transaction_ref": "TRX-NAG-99061",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-16 09:30 AM"
  },
  {
    "id": "BK-2026-143",
    "bed_id": "CCU-02",
    "bed_name": "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    "bed_category": "CCU",
    "bed_daily_rate": 15000,
    "patient_name": "Al Amin Sheikh (4)",
    "patient_phone": "+880 1712-345662",
    "patient_nid": "1972 5590 1234 9876",
    "patient_age": 52,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-17",
    "duration_days": 4,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 60000,
    "deposit_amount": 24000,
    "paid_amount": 24000,
    "transaction_ref": "TRX-CAR-99062",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-17 09:30 AM"
  },
  {
    "id": "BK-2026-144",
    "bed_id": "CAB-304",
    "bed_name": "Executive Single Deluxe Cabin 304",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 7500,
    "patient_name": "Shahidul Islam (4)",
    "patient_phone": "+880 1711-223363",
    "patient_nid": "1957 8899 0011 2233",
    "patient_age": 67,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-18",
    "duration_days": 5,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 37500,
    "deposit_amount": 15000,
    "paid_amount": 15000,
    "transaction_ref": "TRX-BAN-99063",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-18 09:30 AM"
  },
  {
    "id": "BK-2026-145",
    "bed_id": "GW-14",
    "bed_name": "Post-Operative General Ward Bed 14",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Mst. Rehana Parvin (4)",
    "patient_phone": "+880 1819-001164",
    "patient_nid": "1985 4401 9283 1102",
    "patient_age": 39,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-19",
    "duration_days": 6,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 6000,
    "transaction_ref": "TRX-CAS-99064",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-19 09:30 AM"
  },
  {
    "id": "BK-2026-146",
    "bed_id": "HDU-03",
    "bed_name": "High Dependency Step-Down Pod 03",
    "bed_category": "HDU",
    "bed_daily_rate": 12000,
    "patient_name": "Kamrul Hasan (4)",
    "patient_phone": "+880 1713-112265",
    "patient_nid": "1980 2345 6789 0123",
    "patient_age": 46,
    "patient_gender": "Male",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-20",
    "duration_days": 2,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "bKash",
    "total_amount": 24000,
    "deposit_amount": 10000,
    "paid_amount": 10000,
    "transaction_ref": "TRX-BKA-99065",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-20 09:30 AM"
  },
  {
    "id": "BK-2026-147",
    "bed_id": "NICU-01",
    "bed_name": "Neonatal Critical Care Isolette 01",
    "bed_category": "NICU",
    "bed_daily_rate": 16000,
    "patient_name": "Sultana Begum (4)",
    "patient_phone": "+880 1914-445566",
    "patient_nid": "1994 3456 7890 1234",
    "patient_age": 32,
    "patient_gender": "Female",
    "patient_blood_group": "AB+",
    "check_in_date": "2026-10-21",
    "duration_days": 3,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Nagad",
    "total_amount": 48000,
    "deposit_amount": 19000,
    "paid_amount": 19000,
    "transaction_ref": "TRX-NAG-99066",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-21 09:30 AM"
  },
  {
    "id": "BK-2026-148",
    "bed_id": "VIP-401",
    "bed_name": "Raffles Executive Deluxe VIP Suite 401",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 24000,
    "patient_name": "Farhana Yasmin (4)",
    "patient_phone": "+880 1615-556667",
    "patient_nid": "1988 4567 8901 2345",
    "patient_age": 38,
    "patient_gender": "Female",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-22",
    "duration_days": 4,
    "booking_status": "Confirmed",
    "payment_status": "Deposit Paid",
    "payment_method": "Card",
    "total_amount": 96000,
    "deposit_amount": 38000,
    "paid_amount": 38000,
    "transaction_ref": "TRX-CAR-99067",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-22 09:30 AM"
  },
  {
    "id": "BK-2026-149",
    "bed_id": "CAB-205",
    "bed_name": "Special Deluxe Cabin 205",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 8000,
    "patient_name": "Mahmudur Rahman (4)",
    "patient_phone": "+880 1516-667768",
    "patient_nid": "1970 5678 9012 3456",
    "patient_age": 56,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-23",
    "duration_days": 5,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 40000,
    "deposit_amount": 16000,
    "paid_amount": 40000,
    "transaction_ref": "TRX-BAN-99068",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-23 09:30 AM"
  },
  {
    "id": "BK-2026-150",
    "bed_id": "GW-08",
    "bed_name": "Male Surgical General Ward Bed 08",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Zubair Ahmed (4)",
    "patient_phone": "+880 1717-778869",
    "patient_nid": "1982 6789 0123 4567",
    "patient_age": 44,
    "patient_gender": "Male",
    "patient_blood_group": "O-",
    "check_in_date": "2026-10-24",
    "duration_days": 6,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 15000,
    "transaction_ref": "TRX-CAS-99069",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-24 09:30 AM"
  },
  {
    "id": "BK-2026-151",
    "bed_id": "VIP-402",
    "bed_name": "Mount Elizabeth Royal VIP Suite 402",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 25000,
    "patient_name": "Rasheda Khatun (4)",
    "patient_phone": "+880 1818-889970",
    "patient_nid": "1965 7890 1234 5678",
    "patient_age": 61,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-25",
    "duration_days": 2,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "bKash",
    "total_amount": 50000,
    "deposit_amount": 20000,
    "paid_amount": 50000,
    "transaction_ref": "TRX-BKA-99070",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-25 09:30 AM"
  },
  {
    "id": "BK-2026-152",
    "bed_id": "ICU-01",
    "bed_name": "Cardiothoracic Intensive Care Suite (ICU Pod 01)",
    "bed_category": "ICU",
    "bed_daily_rate": 18500,
    "patient_name": "Moniruzzaman Chowdhury (4)",
    "patient_phone": "+880 1919-990071",
    "patient_nid": "1978 8901 2345 6789",
    "patient_age": 48,
    "patient_gender": "Male",
    "patient_blood_group": "A-",
    "check_in_date": "2026-10-26",
    "duration_days": 3,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Nagad",
    "total_amount": 55500,
    "deposit_amount": 22000,
    "paid_amount": 55500,
    "transaction_ref": "TRX-NAG-99071",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-26 09:30 AM"
  },
  {
    "id": "BK-2026-153",
    "bed_id": "CCU-02",
    "bed_name": "Coronary Care Unit Telemetry Bed (CCU Pod 02)",
    "bed_category": "CCU",
    "bed_daily_rate": 15000,
    "patient_name": "Shahin Alam (4)",
    "patient_phone": "+880 1720-001172",
    "patient_nid": "1990 9012 3456 7890",
    "patient_age": 36,
    "patient_gender": "Male",
    "patient_blood_group": "AB-",
    "check_in_date": "2026-10-15",
    "duration_days": 4,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Card",
    "total_amount": 60000,
    "deposit_amount": 24000,
    "paid_amount": 60000,
    "transaction_ref": "TRX-CAR-99072",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Acute Coronary Syndrome & Telemetry",
    "created_at": "2026-10-15 09:30 AM"
  },
  {
    "id": "BK-2026-154",
    "bed_id": "CAB-304",
    "bed_name": "Executive Single Deluxe Cabin 304",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 7500,
    "patient_name": "Shamim Reza (4)",
    "patient_phone": "+880 1821-112273",
    "patient_nid": "1984 0123 4567 8901",
    "patient_age": 42,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-16",
    "duration_days": 5,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 37500,
    "deposit_amount": 15000,
    "paid_amount": 37500,
    "transaction_ref": "TRX-BAN-99073",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Post-Op Laparoscopic Recovery",
    "created_at": "2026-10-16 09:30 AM"
  },
  {
    "id": "BK-2026-155",
    "bed_id": "GW-14",
    "bed_name": "Post-Operative General Ward Bed 14",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Nusrat Jahan (4)",
    "patient_phone": "+880 1622-223374",
    "patient_nid": "1996 1234 5678 9012",
    "patient_age": 30,
    "patient_gender": "Female",
    "patient_blood_group": "B+",
    "check_in_date": "2026-10-17",
    "duration_days": 6,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 15000,
    "transaction_ref": "TRX-CAS-99074",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Severe Community Acquired Pneumonia",
    "created_at": "2026-10-17 09:30 AM"
  },
  {
    "id": "BK-2026-156",
    "bed_id": "HDU-03",
    "bed_name": "High Dependency Step-Down Pod 03",
    "bed_category": "HDU",
    "bed_daily_rate": 12000,
    "patient_name": "Shirin Akter (4)",
    "patient_phone": "+880 1523-334475",
    "patient_nid": "1986 2345 6789 0123",
    "patient_age": 40,
    "patient_gender": "Female",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-18",
    "duration_days": 2,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "bKash",
    "total_amount": 24000,
    "deposit_amount": 10000,
    "paid_amount": 24000,
    "transaction_ref": "TRX-BKA-99075",
    "attending_doctor": "Prof. Dr. Anisur Rahman",
    "diagnosis": "Hypertensive Crisis with Encephalopathy",
    "created_at": "2026-10-18 09:30 AM"
  },
  {
    "id": "BK-2026-157",
    "bed_id": "NICU-01",
    "bed_name": "Neonatal Critical Care Isolette 01",
    "bed_category": "NICU",
    "bed_daily_rate": 16000,
    "patient_name": "Tariqul Islam (4)",
    "patient_phone": "+880 1724-445576",
    "patient_nid": "1979 3456 7890 1234",
    "patient_age": 47,
    "patient_gender": "Male",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-19",
    "duration_days": 3,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Nagad",
    "total_amount": 48000,
    "deposit_amount": 19000,
    "paid_amount": 48000,
    "transaction_ref": "TRX-NAG-99076",
    "attending_doctor": "Dr. Farzana Yasmin",
    "diagnosis": "Elective Orthopedic Joint Replacement",
    "created_at": "2026-10-19 09:30 AM"
  },
  {
    "id": "BK-2026-158",
    "bed_id": "VIP-401",
    "bed_name": "Raffles Executive Deluxe VIP Suite 401",
    "bed_category": "VIP Suite",
    "bed_daily_rate": 24000,
    "patient_name": "Ashraful Haque (4)",
    "patient_phone": "+880 1825-556677",
    "patient_nid": "1973 4567 8901 2345",
    "patient_age": 53,
    "patient_gender": "Male",
    "patient_blood_group": "B-",
    "check_in_date": "2026-10-20",
    "duration_days": 4,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Card",
    "total_amount": 96000,
    "deposit_amount": 38000,
    "paid_amount": 96000,
    "transaction_ref": "TRX-CAR-99077",
    "attending_doctor": "Dr. Mahmudul Hasan",
    "diagnosis": "Diabetic Ketoacidosis Stabilisation",
    "created_at": "2026-10-20 09:30 AM"
  },
  {
    "id": "BK-2026-159",
    "bed_id": "CAB-205",
    "bed_name": "Special Deluxe Cabin 205",
    "bed_category": "Deluxe Cabin",
    "bed_daily_rate": 8000,
    "patient_name": "Mofizul Islam (4)",
    "patient_phone": "+880 1926-667778",
    "patient_nid": "1962 5678 9012 3456",
    "patient_age": 64,
    "patient_gender": "Male",
    "patient_blood_group": "A+",
    "check_in_date": "2026-10-21",
    "duration_days": 5,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Bank Transfer",
    "total_amount": 40000,
    "deposit_amount": 16000,
    "paid_amount": 40000,
    "transaction_ref": "TRX-BAN-99078",
    "attending_doctor": "Dr. Nusrat Jahan",
    "diagnosis": "Acute Decompensated Heart Failure",
    "created_at": "2026-10-21 09:30 AM"
  },
  {
    "id": "BK-2026-160",
    "bed_id": "GW-08",
    "bed_name": "Male Surgical General Ward Bed 08",
    "bed_category": "General Ward",
    "bed_daily_rate": 2500,
    "patient_name": "Rokeya Sultana (4)",
    "patient_phone": "+880 1727-778879",
    "patient_nid": "1983 6789 0123 4567",
    "patient_age": 43,
    "patient_gender": "Female",
    "patient_blood_group": "O+",
    "check_in_date": "2026-10-22",
    "duration_days": 6,
    "booking_status": "Completed",
    "payment_status": "Fully Paid",
    "payment_method": "Cash",
    "total_amount": 15000,
    "deposit_amount": 6000,
    "paid_amount": 15000,
    "transaction_ref": "TRX-CAS-99079",
    "attending_doctor": "Dr. Tanvir Ahmed",
    "diagnosis": "Post-Operative CABG Monitoring",
    "created_at": "2026-10-22 09:30 AM"
  }
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
      if (Array.isArray(parsed) && parsed.length >= 50) return parsed;
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

// ====== Inpatient Discharge & HealthPass Direct Real-Time Synchronization ======

export interface HealthPassDischargeRecord {
  patient_phone: string;
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  patient_blood_group?: string;
  patient_nid?: string;
  smart_card_uid?: string;
  booking_id: string;
  admission_id: string;
  invoice_id: string;
  bed_id: string;
  bed_name: string;
  bed_category?: string;
  admission_date: string;
  discharge_date: string;
  stay_days: number;
  primary_diagnosis: string;
  attending_doctor: string;
  gross_total: number;
  discount_amount: number;
  discount_reason?: string;
  advance_deposit: number;
  net_paid: number;
  payment_method: string;
  transaction_ref: string;
  discharge_condition: string;
  clinical_advice?: string;
  medications?: { name: string; dosage: string; frequency: string; duration: string }[];
  follow_up_date?: string;
  cleared_at: string;
}

export function syncDischargeToHealthPass(record: HealthPassDischargeRecord): boolean {
  if (typeof window === "undefined") return false;
  try {
    const STORAGE_KEY = "oxpecker_healthpass_discharges";
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: HealthPassDischargeRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((item) => item.booking_id !== record.booking_id);
    filtered.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Update admissions status to Discharged
    const admissions = getHospitalAdmissions();
    const updatedAdmissions = admissions.map((adm) => {
      if (adm.id === record.admission_id || (record.patient_phone && adm.personal_phone === record.patient_phone)) {
        return {
          ...adm,
          status: "Discharged" as const,
        };
      }
      return adm;
    });
    localStorage.setItem(ADMISSIONS_STORAGE_KEY, JSON.stringify(updatedAdmissions));

    // Also record into patient medical visits history
    try {
      const VISITS_KEY = "oxpecker_patient_medical_visits";
      const rawVisits = localStorage.getItem(VISITS_KEY);
      const visits = rawVisits ? JSON.parse(rawVisits) : [];
      visits.unshift({
        id: `v-dis-${Date.now()}`,
        patient_phone: record.patient_phone,
        smart_card_uid: record.smart_card_uid || "HP-2026-DISCHARGE",
        patient_name: record.patient_name,
        doctor_name: record.attending_doctor,
        department: "Inpatient Ward & Clinical Pavilion",
        hospital_name: "Oxpecker Specialized Medical Center",
        location: "Dhaka • Singapore International Protocol",
        visit_date: record.discharge_date,
        diagnosis: `${record.primary_diagnosis} (Condition: ${record.discharge_condition})`,
        prescription_summary: record.clinical_advice || "Discharged with post-operative regimen and clinical follow-up.",
        invoice_ref: record.invoice_id,
        is_inpatient_discharge: true,
      });
      localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    } catch {}

    // Dispatch global reactive events
    window.dispatchEvent(new Event("healthpass_status_changed"));
    window.dispatchEvent(new CustomEvent("healthpass_discharge_synced", { detail: record }));
    return true;
  } catch (err) {
    console.warn("Failed to sync discharge to HealthPass:", err);
    return false;
  }
}

export function getHealthPassDischarges(query?: string): HealthPassDischargeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("oxpecker_healthpass_discharges");
    if (!raw) return [];
    const list: HealthPassDischargeRecord[] = JSON.parse(raw);
    if (!query) return list;
    const q = query.toLowerCase().trim();
    return list.filter(
      (d) =>
        (d.patient_phone && d.patient_phone.includes(q)) ||
        (d.smart_card_uid && d.smart_card_uid.toLowerCase().includes(q)) ||
        (d.patient_name && d.patient_name.toLowerCase().includes(q)) ||
        (d.invoice_id && d.invoice_id.toLowerCase().includes(q)) ||
        (d.booking_id && d.booking_id.toLowerCase().includes(q))
    );
  } catch {
    return [];
  }
}



// ====== Custom Hospital Billing Theme, Watermark & Letterhead Configuration ======

export const THEME_STORAGE_KEY = "oxpecker_hospital_branding_theme";
export const TRANSACTIONS_STORAGE_KEY = "oxpecker_hospital_transactions";

export const DEFAULT_HOSPITAL_THEME: HospitalThemeConfig = {
  hospital_name: "Mount Elizabeth Novena International Hospital",
  hospital_tagline: "Centre of Excellence in Tertiary Healthcare & Interventional Medicine",
  hospital_address: "Plot 38, Road 11, Block C, Banani Diplomatic Enclave, Dhaka 1213",
  hospital_hotline: "10678 / +880 9610-000000",
  hospital_phone: "+880 1712-345678",
  hospital_email: "billing@mountelizabeth-dhaka.com",
  license_no: "DGHS-REG-2024/99120",
  tax_bin: "BIN-003849129-0101",
  theme_style: "singapore",
  watermark_text: "PAID & DISCHARGED",
  watermark_opacity: 0.08,
  watermark_enabled: true,
  stamp_text: "ACCOUNTS & AUDIT VERIFIED - OFFICIAL RECEIPT",
  stamp_color: "#059669",
  stamp_enabled: true,
};

export function getHospitalThemeConfig(): HospitalThemeConfig {
  if (typeof window === "undefined") return DEFAULT_HOSPITAL_THEME;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_HOSPITAL_THEME, ...parsed };
    }
  } catch (err) {
    console.warn("Failed to load hospital theme config:", err);
  }
  return DEFAULT_HOSPITAL_THEME;
}

export function saveHospitalThemeConfig(config: HospitalThemeConfig): HospitalThemeConfig {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent("hospital_theme_changed", { detail: config }));
    } catch (err) {
      console.warn("Failed to save hospital theme config:", err);
    }
  }
  return config;
}

// ====== Hospital Financial Transactions Ledger ======

export const INITIAL_TRANSACTIONS: HospitalTransactionRecord[] = [
  {
    id: "TXN-2026-10491",
    invoice_id: "INV-2026-9901",
    patient_name: "Al Amin Sheikh",
    patient_phone: "+880 1712-345678",
    smart_card_uid: "HP-8801712345678",
    amount: 37700,
    gross_amount: 47700,
    discount_amount: 0,
    payment_method: "bKash Merchant Pay",
    transaction_type: "Discharge Clearance",
    status: "Settled",
    reference_no: "BK-9938210382",
    cashier_name: "Farhan Tanvir (Desk #02)",
    created_at: "2026-10-22T16:30:00.000Z",
    notes: "Full discharge clearance settled with admission advance deducted.",
  },
  {
    id: "TXN-2026-10488",
    invoice_id: "INV-2026-9901",
    patient_name: "Al Amin Sheikh",
    patient_phone: "+880 1712-345678",
    smart_card_uid: "HP-8801712345678",
    amount: 10000,
    gross_amount: 10000,
    discount_amount: 0,
    payment_method: "Cash Counter",
    transaction_type: "Admission Deposit",
    status: "Settled",
    reference_no: "RCP-ADM-8821",
    cashier_name: "Rebeka Sultana (Desk #01)",
    created_at: "2026-10-18T10:15:00.000Z",
    notes: "Emergency admission security deposit.",
  },
  {
    id: "TXN-2026-10482",
    invoice_id: "INV-2026-9902",
    patient_name: "Begum Rowshan Ara",
    patient_phone: "+880 1819-223344",
    smart_card_uid: "HP-8801819223344",
    amount: 27500,
    gross_amount: 32500,
    discount_amount: 0,
    payment_method: "Nagad Corporate",
    transaction_type: "Discharge Clearance",
    status: "Settled",
    reference_no: "NG-7740192841",
    cashier_name: "Farhan Tanvir (Desk #02)",
    created_at: "2026-10-24T12:00:00.000Z",
    notes: "Laparoscopic cholecystectomy clearance.",
  },
  {
    id: "TXN-2026-10475",
    invoice_id: "INV-2026-9902",
    patient_name: "Begum Rowshan Ara",
    patient_phone: "+880 1819-223344",
    smart_card_uid: "HP-8801819223344",
    amount: 5000,
    gross_amount: 5000,
    discount_amount: 0,
    payment_method: "City Bank Visa Card",
    transaction_type: "Admission Deposit",
    status: "Settled",
    reference_no: "POS-7829-0192",
    cashier_name: "Sadia Afrin (Desk #03)",
    created_at: "2026-10-21T09:30:00.000Z",
    notes: "Bed admission initial advance.",
  },
  {
    id: "TXN-2026-10469",
    invoice_id: "INV-2026-9903",
    patient_name: "Tanvir Hasan Chowdhury",
    patient_phone: "+880 1911-556677",
    smart_card_uid: "HP-8801911556677",
    amount: 70000,
    gross_amount: 85000,
    discount_amount: 0,
    payment_method: "Bank Wire Transfer",
    transaction_type: "Discharge Clearance",
    status: "Settled",
    reference_no: "RTGS-IBBL-20261025",
    cashier_name: "Farhan Tanvir (Desk #02)",
    created_at: "2026-10-25T11:45:00.000Z",
    notes: "ICU step-down critical care clearance.",
  },
  {
    id: "TXN-2026-10460",
    invoice_id: "INV-2026-9903",
    patient_name: "Tanvir Hasan Chowdhury",
    patient_phone: "+880 1911-556677",
    smart_card_uid: "HP-8801911556677",
    amount: 15000,
    gross_amount: 15000,
    discount_amount: 0,
    payment_method: "Cash Counter",
    transaction_type: "Admission Deposit",
    status: "Settled",
    reference_no: "RCP-ADM-8805",
    cashier_name: "Rebeka Sultana (Desk #01)",
    created_at: "2026-10-20T18:00:00.000Z",
    notes: "Emergency ICU triage deposit.",
  },
];

export function getHospitalTransactions(): HospitalTransactionRecord[] {
  if (typeof window === "undefined") return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load transactions:", err);
  }
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  } catch {}
  return INITIAL_TRANSACTIONS;
}

export function recordHospitalTransaction(txn: HospitalTransactionRecord): HospitalTransactionRecord[] {
  const current = getHospitalTransactions();
  const updated = [txn, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("hospital_transaction_recorded", { detail: txn }));
    } catch (err) {
      console.warn("Failed to record transaction:", err);
    }
  }
  return updated;
}

export interface BillingSyncPayload {
  bill: HospitalBill;
  cashier_name?: string;
  notes?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_trx_id?: string;
  concession_reason?: string;
  dischargeInfo?: {
    diagnosis?: string;
    condition?: "Cured / Stable" | "Improved" | "Referred" | "DOR (Discharged on Request)";
    doctor?: string;
    clinical_advice?: string;
  };
}

export function syncBillingAndTransaction(payload: BillingSyncPayload): {
  bill: HospitalBill;
  transaction: HospitalTransactionRecord;
  syncedToHealthPass: boolean;
} {
  const { bill, cashier_name = "Farhan Tanvir (Desk #02)", notes, dischargeInfo } = payload;

  // 1. Save Hospital Bill
  saveHospitalBill(bill);

  // 2. Record Financial Transaction in Ledger
  const txnRecord: HospitalTransactionRecord = {
    id: "TXN-" + Date.now().toString().slice(-6),
    invoice_id: bill.id,
    patient_name: bill.patient_name,
    patient_phone: bill.patient_phone || "",
    amount: bill.net_payable,
    gross_amount: bill.gross_total,
    discount_amount: bill.discount || 0,
    payment_method: bill.payment_method || "Cash Counter",
    transaction_type: "Discharge Clearance",
    status: "Settled",
    reference_no: bill.transaction_ref || ("REF-" + Math.floor(100000 + Math.random() * 900000)),
    cashier_name,
    bank_name: payload.bank_name || bill.bank_name,
    bank_trx_id: payload.bank_trx_id || bill.bank_trx_id,
    created_at: new Date().toISOString(),
    notes: notes || ("Hospital discharge clearance settled via " + bill.payment_method + "."),
  };
  recordHospitalTransaction(txnRecord);

  // 3. Sync to Patient HealthPass History
  let syncedToHealthPass = false;
  if (typeof window !== "undefined" && bill.patient_phone) {
    try {
      const dischargeRecord: HealthPassDischargeRecord = {
        patient_phone: bill.patient_phone,
        patient_name: bill.patient_name,
        patient_nid: bill.patient_nid,
        booking_id: bill.booking_id || bill.admission_id || bill.id,
        admission_id: bill.admission_id || bill.id,
        invoice_id: bill.id,
        bed_id: "BED-ALLOCATED",
        bed_name: bill.bed_name,
        admission_date: bill.admission_date,
        discharge_date: bill.discharge_date || new Date().toISOString().split("T")[0],
        stay_days: bill.days_admitted,
        primary_diagnosis: dischargeInfo?.diagnosis || "Inpatient Clinical Management & Recovery",
        attending_doctor: dischargeInfo?.doctor || "Chief Medical Consultant",
        gross_total: bill.gross_total,
        discount_amount: bill.discount || 0,
        advance_deposit: bill.deposit_paid || 0,
        net_paid: bill.net_payable,
        payment_method: bill.payment_method || "Cash Counter",
        transaction_ref: bill.transaction_ref || ("REF-" + Math.floor(100000 + Math.random() * 900000)),
        discharge_condition: dischargeInfo?.condition || "Cured / Stable",
        clinical_advice: dischargeInfo?.clinical_advice || "Continue prescribed oral medications. Review at OPD in 7 days.",
        follow_up_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        cleared_at: new Date().toISOString(),
      };

      syncDischargeToHealthPass(dischargeRecord);
      syncedToHealthPass = true;
    } catch (e) {
      console.warn("Could not sync to HealthPass:", e);
    }
  }

  // 4. Update Admission if linked
  if (bill.admission_id) {
    dischargeHospitalPatient(bill.admission_id);
  }

  return { bill, transaction: txnRecord, syncedToHealthPass };
}


// ====== Hospital Multi-Bank Accounts Directory & Bengali Numerals ======

export function toBengaliNumerals(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return val.toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

export const BANK_ACCOUNTS_STORAGE_KEY = "oxpecker_hospital_bank_accounts";

export const DEFAULT_HOSPITAL_BANKS: HospitalBankAccount[] = [
  {
    id: "BANK-CITY-01",
    bank_name: "The City Bank Limited",
    account_name: "Oxpecker Healthcare Systems International Ltd",
    account_number: "110-2918-00129",
    branch_name: "Gulshan-2 Executive Corporate Branch",
    routing_number: "225261890",
    category: "Commercial Bank",
    badge_color: "#2563eb",
  },
  {
    id: "BANK-DBBL-02",
    bank_name: "Dutch-Bangla Bank PLC",
    account_name: "Oxpecker Medical Inpatient Operations",
    account_number: "104-1200-98314",
    branch_name: "Banani Diplomatic Zone Branch",
    routing_number: "090261334",
    category: "Commercial Bank",
    badge_color: "#059669",
  },
  {
    id: "BANK-BRAC-03",
    bank_name: "BRAC Bank PLC",
    account_name: "Oxpecker Clinical Hospital Collections",
    account_number: "150-1203-99482",
    branch_name: "Corporate Head Office Branch",
    routing_number: "060261492",
    category: "Commercial Bank",
    badge_color: "#0284c7",
  },
  {
    id: "BANK-EBL-04",
    bank_name: "Eastern Bank PLC (EBL)",
    account_name: "Oxpecker Tertiary Medical Center",
    account_number: "106-9021-33290",
    branch_name: "Principal Corporate Branch, Dilkusha",
    routing_number: "095260124",
    category: "Commercial Bank",
    badge_color: "#7c3aed",
  },
  {
    id: "BANK-IBBL-05",
    bank_name: "Islami Bank Bangladesh PLC",
    account_name: "Oxpecker Healthcare Islamic Banking Account",
    account_number: "205-0104-55102",
    branch_name: "Foreign Exchange Branch, Motijheel",
    routing_number: "125271881",
    category: "Commercial Bank",
    badge_color: "#16a34a",
  },
  {
    id: "BANK-SCB-06",
    bank_name: "Standard Chartered Bank (SCB)",
    account_name: "Oxpecker International Patient Wire Services",
    account_number: "01-189201-01",
    branch_name: "Gulshan North Branch",
    routing_number: "215261902",
    category: "Commercial Bank",
    badge_color: "#0d9488",
  },
  {
    id: "MFS-BKASH-01",
    bank_name: "bKash Merchant Pay",
    account_name: "Oxpecker Hospital Central Merchant",
    account_number: "01712-345678 (Merchant Code: 99420)",
    branch_name: "bKash Direct Commercial API",
    category: "MFS",
    badge_color: "#e11d48",
  },
  {
    id: "MFS-NAGAD-02",
    bank_name: "Nagad Corporate Gateway",
    account_name: "Oxpecker Medical Hospital Merchant",
    account_number: "01819-223344 (Corporate Code: 88201)",
    branch_name: "Nagad Enterprise Portal",
    category: "MFS",
    badge_color: "#ea580c",
  },
  {
    id: "MFS-UPAY-03",
    bank_name: "Upay Enterprise Wallet",
    account_name: "Oxpecker Healthcare Digital Collection",
    account_number: "01911-556677",
    branch_name: "UCB FinTech Gateway",
    category: "MFS",
    badge_color: "#0284c7",
  },
  {
    id: "POS-VISA-01",
    bank_name: "City Bank POS Terminal (Visa / MasterCard)",
    account_name: "Inpatient Billing Desk #01 POS",
    account_number: "Terminal ID: TID-889210",
    branch_name: "Cashier Counter Ground Floor",
    category: "Card POS",
    badge_color: "#2563eb",
  },
  {
    id: "CASH-COUNTER-01",
    bank_name: "Hospital Central Cash Counter",
    account_name: "Accounts & Cash Custody Department",
    account_number: "Safe Vault Drawer #02",
    branch_name: "Cashier Desk Ground Floor",
    category: "Cash Counter",
    badge_color: "#475569",
  },
];

export function getHospitalBankAccounts(): HospitalBankAccount[] {
  if (typeof window === "undefined") return DEFAULT_HOSPITAL_BANKS;
  try {
    const raw = localStorage.getItem(BANK_ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load hospital bank accounts:", err);
  }
  try {
    localStorage.setItem(BANK_ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_HOSPITAL_BANKS));
  } catch {}
  return DEFAULT_HOSPITAL_BANKS;
}

export function saveHospitalBankAccounts(banks: HospitalBankAccount[]): HospitalBankAccount[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BANK_ACCOUNTS_STORAGE_KEY, JSON.stringify(banks));
      window.dispatchEvent(new CustomEvent("hospital_banks_changed", { detail: banks }));
    } catch (err) {
      console.warn("Failed to save hospital bank accounts:", err);
    }
  }
  return banks;
}
