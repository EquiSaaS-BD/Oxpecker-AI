import type {
  HealthPassCard,
  MedicalVisit,
  HealthPassScanData,
  ScoredHealthPassCard,
  SearchMatchReason,
} from "@/types/healthpass";

// ====== Bangladesh Geo Districts (Zilas) & Post Codes ======
export const BANGLADESH_ZILAS = [
  { name: "Dhaka", division: "Dhaka", postCode: "1205", defaultUpazila: "Dhanmondi" },
  { name: "Chittagong", division: "Chittagong", postCode: "4000", defaultUpazila: "Kotwali" },
  { name: "Sylhet", division: "Sylhet", postCode: "3100", defaultUpazila: "Amberkhana" },
  { name: "Rajshahi", division: "Rajshahi", postCode: "6000", defaultUpazila: "Boalia" },
  { name: "Khulna", division: "Khulna", postCode: "9000", defaultUpazila: "Sonadanga" },
  { name: "Barishal", division: "Barishal", postCode: "8200", defaultUpazila: "Sadarkot" },
  { name: "Rangpur", division: "Rangpur", postCode: "5400", defaultUpazila: "Kotwali" },
  { name: "Mymensingh", division: "Mymensingh", postCode: "2200", defaultUpazila: "Kotwali" },
  { name: "Comilla", division: "Chittagong", postCode: "3500", defaultUpazila: "Adarsha Sadar" },
  { name: "Gazipur", division: "Dhaka", postCode: "1700", defaultUpazila: "Joydebpur" },
  { name: "Narayanganj", division: "Dhaka", postCode: "1400", defaultUpazila: "Sadar" },
  { name: "Bogra", division: "Rajshahi", postCode: "5800", defaultUpazila: "Sadar" },
  { name: "Cox's Bazar", division: "Chittagong", postCode: "4700", defaultUpazila: "Sadar" },
  { name: "Jessore", division: "Khulna", postCode: "7400", defaultUpazila: "Kotwali" },
  { name: "Faridpur", division: "Dhaka", postCode: "7800", defaultUpazila: "Kotwali" },
  { name: "Dinajpur", division: "Rangpur", postCode: "5200", defaultUpazila: "Kotwali" },
];

// ====== Mock HealthPass Database ======

export const INITIAL_HEALTH_CARDS: HealthPassCard[] = [
  {
    id: "hp-001",
    patient_id: "user-001",
    card_number: "HP-2026-94821",
    smart_card_uid: "8472-1094-8832-5501",
    patient_name: "রহিম উদ্দিন",
    english_name: "RAHIM UDDIN",
    patient_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    date_of_birth: "1974-04-12",
    gender: "Male",
    blood_group: "A+",
    nid_number: "1974 2698 4401 2390",
    birth_cert_number: "19742698440123901",
    verification_status: "verified",
    verified_at: "2026-10-18T10:00:00Z",
    is_activated: true,
    activated_at: "2026-10-18T10:00:00Z",
    division: "Dhaka",
    zila: "Dhaka",
    upazila: "Dhanmondi",
    post_code: "1205",
    address: "House 42, Road 9/A, Dhanmondi, Dhaka",
    last_location_sync: "18 Oct 2026, 04:00 AM",
    personal_phone: "+880 1711-000000",
    personal_has_whatsapp: true,
    emergency_contact_name: "Fatema Begum",
    emergency_contact_phone: "+880 1819-876543",
    emergency_contact_relation: "Wife",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "18 Oct 2026",
    organ_donor: true,
    diabetic_status: "Type-2",
    has_pacemaker: false,
    hypertension: true,
    allergies: ["Penicillin", "Sulfa Drugs", "Aspirin"],
    chronic_conditions: [
      { name: "Type-2 Diabetes Mellitus", since: "2020", status: "controlled", severity: "moderate" },
      { name: "Essential Hypertension", since: "2022", status: "controlled", severity: "mild" },
    ],
    current_medications: [
      { name: "Metformin HCl", dosage: "500mg", frequency: "2x daily (After meals)", duration: "Continuous", instructions: "Take with or immediately after main meals", prescribed_by: "Prof. Dr. Aminul Rahman" },
      { name: "Amlodipine Besylate", dosage: "5mg", frequency: "1x daily (Morning)", duration: "Continuous", instructions: "Take once daily in the morning with water", prescribed_by: "Dr. Kamrul Hasan" },
      { name: "Vitamin D3", dosage: "2000 IU", frequency: "1x daily", duration: "90 days", instructions: "Take with breakfast", prescribed_by: "Dr. Nusrat Jahan" },
    ],
    vitals: {
      blood_pressure: "130/85 mmHg",
      heart_rate: "76 bpm",
      spo2: "98%",
      blood_glucose: "115 mg/dL",
      temperature: "98.6°F",
      bmi: "24.2 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-001",
        title: "Complete Blood Count (CBC) with Automated Differential",
        category: "Pathology",
        date: "2026-10-15",
        hospital: "Square Hospital Ltd., Emergency Lab",
        lab_ref: "LAB-SQ-2026-8812",
        status: "Normal",
        summary: "Normal red and white cell morphology. Platelet count adequate. No evidence of acute infection.",
        parameters: [
          { name: "Hemoglobin (Hb)", value: "14.2", unit: "g/dL", reference_range: "13.5 - 17.5", flag: "NORMAL" },
          { name: "Total WBC Count", value: "7,400", unit: "/µL", reference_range: "4,000 - 11,000", flag: "NORMAL" },
          { name: "Platelet Count", value: "245,000", unit: "/µL", reference_range: "150,000 - 450,000", flag: "NORMAL" },
          { name: "Neutrophils", value: "62", unit: "%", reference_range: "40 - 75", flag: "NORMAL" },
          { name: "Lymphocytes", value: "30", unit: "%", reference_range: "20 - 45", flag: "NORMAL" },
          { name: "ESR (1st Hour)", value: "12", unit: "mm/hr", reference_range: "0 - 15", flag: "NORMAL" },
        ],
        verified_by: "Dr. Rehana Sultana, MBBS, MD (Pathology)"
      },
      {
        id: "rep-002",
        title: "12-Lead Diagnostic Electrocardiogram (ECG)",
        category: "Cardiology",
        date: "2026-10-14",
        hospital: "National Heart Foundation & Research Institute",
        lab_ref: "ECG-NHF-9941",
        status: "Normal",
        summary: "Normal Sinus Rhythm. Heart rate 74 bpm. Normal PR (152 ms) and QTc (418 ms) intervals. No acute ST-T wave changes.",
        parameters: [
          { name: "Rhythm", value: "Normal Sinus", unit: "-", reference_range: "Sinus Rhythm", flag: "NORMAL" },
          { name: "Heart Rate", value: "74", unit: "bpm", reference_range: "60 - 100", flag: "NORMAL" },
          { name: "PR Interval", value: "152", unit: "ms", reference_range: "120 - 200", flag: "NORMAL" },
          { name: "QRS Duration", value: "88", unit: "ms", reference_range: "80 - 120", flag: "NORMAL" },
          { name: "QTc Interval", value: "418", unit: "ms", reference_range: "< 440", flag: "NORMAL" },
        ],
        doctor_notes: "Cardioprotective therapy ongoing. Patient stable.",
        verified_by: "Prof. Dr. M. A. Jalil, FCPS (Cardiology)"
      },
      {
        id: "rep-003",
        title: "Digital Chest Radiograph (Chest X-Ray PA View)",
        category: "Radiology",
        date: "2026-09-20",
        hospital: "Popular Diagnostic Centre Ltd., Dhanmondi",
        lab_ref: "RAD-POP-4102",
        status: "Normal",
        summary: "Lungs are clear with no focal consolidation, pneumothorax, or pleural effusion. Cardiothoracic ratio is within normal limits (<0.50).",
        verified_by: "Dr. Tanvir Ahmed, MBBS, DMRD"
      },
      {
        id: "rep-004",
        title: "Fasting Blood Sugar (FBS) & HbA1c Glycated Hemoglobin",
        category: "Biochemistry",
        date: "2026-10-14",
        hospital: "BIRDEM General Hospital Laboratory",
        lab_ref: "BIO-BIR-7731",
        status: "Normal",
        summary: "Glycemic control is satisfactory under current Metformin 500mg BID regimen.",
        parameters: [
          { name: "Fasting Plasma Glucose", value: "6.1", unit: "mmol/L", reference_range: "4.0 - 5.5", flag: "HIGH" },
          { name: "HbA1c", value: "6.8", unit: "%", reference_range: "< 7.0 (Target)", flag: "NORMAL" },
          { name: "Serum Creatinine", value: "0.92", unit: "mg/dL", reference_range: "0.7 - 1.3", flag: "NORMAL" },
        ],
        verified_by: "Dr. Kazi Shahidul Islam, M.Phil (Biochem)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-10-18T10:00:00Z",
    expires_at: "2031-10-18T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-002",
    patient_id: "user-002",
    card_number: "HP-2026-11840",
    smart_card_uid: "9102-4411-7820-3391",
    patient_name: "ফাতেমা বেগম",
    english_name: "FATEMA BEGUM",
    patient_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    date_of_birth: "1978-08-15",
    gender: "Female",
    blood_group: "O+",
    nid_number: "1978 4401 9283 1102",
    birth_cert_number: "19784401928311021",
    verification_status: "verified",
    verified_at: "2026-09-12T09:00:00Z",
    is_activated: true,
    activated_at: "2026-09-12T09:00:00Z",
    division: "Dhaka",
    zila: "Dhaka",
    upazila: "Mirpur",
    post_code: "1216",
    address: "Block C, Road 4, Mirpur-2, Dhaka",
    last_location_sync: "17 Oct 2026, 08:30 PM",
    personal_phone: "+880 1811-000000",
    personal_has_whatsapp: true,
    emergency_contact_name: "Rahim Uddin",
    emergency_contact_phone: "+880 1711-000000",
    emergency_contact_relation: "Husband",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "28 Sep 2026",
    organ_donor: false,
    diabetic_status: "None",
    has_pacemaker: false,
    hypertension: false,
    allergies: ["Latex", "Ibuprofen", "NSAIDs"],
    chronic_conditions: [
      { name: "Severe Migraine", since: "2019", status: "active", severity: "moderate" },
      { name: "Bronchial Asthma", since: "2021", status: "controlled", severity: "mild" },
    ],
    current_medications: [
      { name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "SOS (As needed)", duration: "PRN", instructions: "Inhale 2 puffs during acute wheezing", prescribed_by: "Dr. Farhana Yasmin" },
      { name: "Propranolol HCl", dosage: "20mg", frequency: "1x daily (Morning)", duration: "60 days", instructions: "Take for migraine prophylaxis", prescribed_by: "Dr. Farhana Yasmin" },
      { name: "Montelukast", dosage: "10mg", frequency: "1x daily (Night)", duration: "30 days", instructions: "Take at bedtime", prescribed_by: "Dr. Farhana Yasmin" },
    ],
    vitals: {
      blood_pressure: "118/78 mmHg",
      heart_rate: "72 bpm",
      spo2: "99%",
      blood_glucose: "95 mg/dL",
      temperature: "98.4°F",
      bmi: "22.8 kg/m²",
      respiratory_rate: "15 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-005",
        title: "Magnetic Resonance Imaging (MRI Brain Screening)",
        category: "Radiology",
        date: "2026-08-19",
        hospital: "National Institute of Neurosciences & Hospital",
        lab_ref: "MRI-NINS-3391",
        status: "Normal",
        summary: "Normal brain parenchyma. No acute infarct, hemorrhage, mass effect, or midline shift. Ventricles and sulci normal.",
        verified_by: "Prof. Dr. Quazi Deen Mohammad, FCPS, MD"
      },
      {
        id: "rep-006",
        title: "Pulmonary Function Test (Computerized Spirometry)",
        category: "Pathology",
        date: "2026-07-22",
        hospital: "National Institute of Diseases of the Chest and Hospital (NIDCH)",
        lab_ref: "PFT-NID-1102",
        status: "Normal",
        summary: "FEV1/FVC ratio is 82%. Reversibility testing positive (14% post-bronchodilator improvement). Consistent with mild controlled asthma.",
        verified_by: "Dr. Asifuzzaman, MD (Pulmonology)"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-09-12T09:00:00Z",
    expires_at: "2031-09-12T09:00:00Z",
    is_active: true,
  },
  {
    id: "hp-003",
    patient_id: "user-003",
    card_number: "HP-2026-77319",
    smart_card_uid: "5109-8812-4409-1290",
    patient_name: "কামাল হোসেন",
    english_name: "KAMAL HOSSAIN",
    patient_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    date_of_birth: "1981-11-04",
    gender: "Male",
    blood_group: "B+",
    nid_number: "1981 1104 5592 8810",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-08-01T11:00:00Z",
    is_activated: true,
    activated_at: "2026-08-01T11:00:00Z",
    division: "Dhaka",
    zila: "Dhaka",
    upazila: "Gulshan",
    post_code: "1212",
    address: "Road 103, Gulshan-2, Dhaka",
    last_location_sync: "16 Oct 2026, 02:15 PM",
    personal_phone: "+880 1711-223344",
    personal_has_whatsapp: true,
    emergency_contact_name: "Rehana Hossain",
    emergency_contact_phone: "+880 1711-889900",
    emergency_contact_relation: "Wife",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "05 Oct 2026",
    organ_donor: true,
    diabetic_status: "None",
    has_pacemaker: false,
    hypertension: true,
    allergies: ["Aspirin", "Sulfa Drugs"],
    chronic_conditions: [
      { name: "Essential Hypertension Stage 1", since: "2022", status: "controlled", severity: "mild" },
      { name: "Hyperlipidemia", since: "2023", status: "controlled", severity: "moderate" }
    ],
    current_medications: [
      { name: "Telmisartan", dosage: "40mg", frequency: "1x daily (Morning)", duration: "Continuous", instructions: "Take before breakfast", prescribed_by: "Dr. Kamrul Hasan" },
      { name: "Rosuvastatin", dosage: "10mg", frequency: "1x daily (Night)", duration: "Continuous", instructions: "Take after dinner", prescribed_by: "Dr. Kamrul Hasan" }
    ],
    vitals: {
      blood_pressure: "138/88 mmHg",
      heart_rate: "80 bpm",
      spo2: "98%",
      blood_glucose: "102 mg/dL",
      temperature: "98.6°F",
      bmi: "26.1 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-007",
        title: "Fast-Automated Serum Lipid Profile",
        category: "Biochemistry",
        date: "2026-10-02",
        hospital: "Evercare Hospital Dhaka",
        lab_ref: "LIP-EVR-8810",
        status: "Elevated",
        summary: "Total cholesterol and LDL elevated above optimal adult reference ranges. Statins started.",
        parameters: [
          { name: "Total Cholesterol", value: "228", unit: "mg/dL", reference_range: "< 200", flag: "HIGH" },
          { name: "LDL Cholesterol", value: "148", unit: "mg/dL", reference_range: "< 100", flag: "HIGH" },
          { name: "HDL Cholesterol", value: "46", unit: "mg/dL", reference_range: "> 40", flag: "NORMAL" },
          { name: "Serum Triglycerides", value: "180", unit: "mg/dL", reference_range: "< 150", flag: "HIGH" },
        ],
        verified_by: "Dr. Shahnoor Alam, MBBS, FCPS"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-08-01T11:00:00Z",
    expires_at: "2031-08-01T11:00:00Z",
    is_active: true,
  },
  {
    id: "hp-004",
    patient_id: "user-004",
    card_number: "HP-2026-55901",
    smart_card_uid: "2001-5590-1234-9876",
    patient_name: "আয়েশা সিদ্দিকা",
    english_name: "AYESHA SIDDIQUA",
    patient_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    date_of_birth: "1998-09-18",
    gender: "Female",
    blood_group: "AB+",
    nid_number: "1998 5590 1234 9876",
    birth_cert_number: "19985590123498760",
    verification_status: "verified",
    verified_at: "2026-07-15T10:00:00Z",
    is_activated: true,
    activated_at: "2026-07-15T10:00:00Z",
    division: "Dhaka",
    zila: "Dhaka",
    upazila: "Uttara",
    post_code: "1230",
    address: "Sector 4, Road 7, Uttara, Dhaka",
    last_location_sync: "19 Oct 2026, 11:00 AM",
    personal_phone: "+880 1912-987654",
    personal_has_whatsapp: true,
    emergency_contact_name: "Dr. Rafiqul Islam",
    emergency_contact_phone: "+880 1912-112233",
    emergency_contact_relation: "Father",
    emergency_has_whatsapp: true,
    marital_status: "Single",
    last_doctor_visit: "10 Oct 2026",
    organ_donor: true,
    diabetic_status: "None",
    has_pacemaker: false,
    hypertension: false,
    allergies: ["Dust", "Pollen", "Ciprofloxacin"],
    chronic_conditions: [
      { name: "Allergic Rhinitis", since: "2021", status: "active", severity: "mild" }
    ],
    current_medications: [
      { name: "Fexofenadine", dosage: "120mg", frequency: "1x daily (Night)", duration: "14 days", instructions: "Take after dinner", prescribed_by: "Dr. Nusrat Jahan" },
      { name: "Fluticasone Nasal Spray", dosage: "50mcg", frequency: "2 sprays daily", duration: "30 days", instructions: "1 spray each nostril morning and night", prescribed_by: "Dr. Nusrat Jahan" }
    ],
    vitals: {
      blood_pressure: "110/70 mmHg",
      heart_rate: "68 bpm",
      spo2: "99%",
      blood_glucose: "88 mg/dL",
      temperature: "98.2°F",
      bmi: "21.4 kg/m²",
      respiratory_rate: "14 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-008",
        title: "Serum Total Immunoglobulin E (IgE)",
        category: "Pathology",
        date: "2026-09-08",
        hospital: "United Hospital Limited, Dhaka",
        lab_ref: "IGE-UNT-1294",
        status: "Elevated",
        summary: "Serum IgE level elevated. Consistent with hypersensitivity / atopic diathesis.",
        parameters: [
          { name: "Total IgE Serum", value: "285", unit: "IU/mL", reference_range: "< 100", flag: "HIGH" },
          { name: "Absolute Eosinophil Count", value: "540", unit: "/µL", reference_range: "20 - 500", flag: "HIGH" }
        ],
        verified_by: "Dr. Shireen Parveen, FCPS"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-07-15T10:00:00Z",
    expires_at: "2031-07-15T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-005",
    patient_id: "user-005",
    card_number: "HP-2026-88192",
    smart_card_uid: "1958-8819-2201-4455",
    patient_name: "আব্দুল করিম",
    english_name: "ABDUL KARIM",
    patient_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
    date_of_birth: "1958-05-12",
    gender: "Male",
    blood_group: "B+",
    nid_number: "1958 3302 7711 4455",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-08-01T11:00:00Z",
    is_activated: true,
    activated_at: "2026-08-01T11:00:00Z",
    division: "Sylhet",
    zila: "Sylhet",
    upazila: "Amberkhana",
    post_code: "3100",
    address: "Amberkhana Point, Sylhet",
    last_location_sync: "16 Oct 2026, 02:15 PM",
    personal_phone: "+880 1711-223344",
    personal_has_whatsapp: true,
    emergency_contact_name: "Md. Nayem",
    emergency_contact_phone: "+880 1711-889900",
    emergency_contact_relation: "Son",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "05 Oct 2026",
    organ_donor: true,
    diabetic_status: "Type-2",
    has_pacemaker: true,
    hypertension: true,
    allergies: ["Cephalosporins", "Radiocontrast Media", "Penicillin"],
    chronic_conditions: [
      { name: "Coronary Artery Disease (CAD)", since: "2018", status: "controlled", severity: "severe" },
      { name: "Permanent Cardiac Pacemaker Implant (Dual Chamber)", since: "2021", status: "controlled", severity: "severe" },
      { name: "Type-2 Diabetes Mellitus", since: "2015", status: "controlled", severity: "moderate" }
    ],
    current_medications: [
      { name: "Clopidogrel", dosage: "75mg", frequency: "1x daily", duration: "Continuous", instructions: "Cardioprotection after lunch", prescribed_by: "National Heart Foundation" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "1x daily (Night)", duration: "Continuous", instructions: "Take after dinner", prescribed_by: "National Heart Foundation" },
      { name: "Insulin Glargine", dosage: "14 Units", frequency: "1x daily (Night)", duration: "Continuous", instructions: "Subcutaneous at 10 PM", prescribed_by: "BIRDEM" }
    ],
    vitals: {
      blood_pressure: "125/80 mmHg",
      heart_rate: "70 bpm",
      spo2: "97%",
      blood_glucose: "135 mg/dL",
      temperature: "98.6°F",
      bmi: "25.0 kg/m²",
      respiratory_rate: "17 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-009",
        title: "Cardiac Pacemaker Digital Interrogation & Safety Check",
        category: "Cardiology",
        date: "2026-09-18",
        hospital: "National Heart Foundation Hospital & Research Institute",
        lab_ref: "PPM-NHF-8819",
        status: "Normal",
        summary: "Medtronic Dual-Chamber Pacemaker functioning normally in DDDR mode. Lead impedances normal. Estimated remaining battery life: 7.8 years. WARNING: MRI CONTRAINDICATION.",
        parameters: [
          { name: "Pacing Mode", value: "DDDR", unit: "-", reference_range: "Programmed", flag: "NORMAL" },
          { name: "Battery Voltage", value: "2.82", unit: "V", reference_range: "> 2.50", flag: "NORMAL" },
          { name: "Atrial Sensing", value: "3.4", unit: "mV", reference_range: "> 2.0", flag: "NORMAL" },
          { name: "Ventricular Sensing", value: "11.2", unit: "mV", reference_range: "> 5.0", flag: "NORMAL" },
        ],
        doctor_notes: "STRICT WARNING: Do not perform MRI scan under any circumstances.",
        verified_by: "Prof. Dr. M. A. Baqui, MD, FACC"
      },
      {
        id: "rep-010",
        title: "Transthoracic 2D Color Doppler Echocardiogram",
        category: "Cardiology",
        date: "2026-08-10",
        hospital: "National Heart Foundation",
        lab_ref: "ECHO-NHF-4412",
        status: "Normal",
        summary: "Left ventricular ejection fraction (LVEF) 54%. Mild concentric LV hypertrophy. No resting regional wall motion abnormality.",
        verified_by: "Dr. Nazmun Nahar, FCPS"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-08-01T11:00:00Z",
    expires_at: "2031-08-01T11:00:00Z",
    is_active: true,
  },
  {
    id: "hp-006",
    patient_id: "user-006",
    card_number: "HP-2026-33027",
    smart_card_uid: "1985-3302-7711-4455",
    patient_name: "মো. জসিম উদ্দিন",
    english_name: "MD. JASIM UDDIN",
    patient_image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
    date_of_birth: "1985-05-12",
    gender: "Male",
    blood_group: "O-",
    nid_number: "1985 3302 7711 4455",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-06-20T08:30:00Z",
    is_activated: true,
    activated_at: "2026-06-20T08:30:00Z",
    division: "Rajshahi",
    zila: "Rajshahi",
    upazila: "Boalia",
    post_code: "6000",
    address: "Shaheb Bazar, Boalia, Rajshahi",
    last_location_sync: "18 Oct 2026, 05:40 PM",
    personal_phone: "+880 1611-554433",
    personal_has_whatsapp: true,
    emergency_contact_name: "Nasima Jasim",
    emergency_contact_phone: "+880 1611-998877",
    emergency_contact_relation: "Wife",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "02 Oct 2026",
    organ_donor: true,
    diabetic_status: "None",
    has_pacemaker: false,
    hypertension: false,
    allergies: [],
    chronic_conditions: [
      { name: "Mild Gastritis", since: "2024", status: "controlled", severity: "mild" }
    ],
    current_medications: [
      { name: "Esomeprazole", dosage: "20mg", frequency: "1x daily (Morning)", duration: "14 days", instructions: "Take before breakfast", prescribed_by: "Dr. Mahmud" }
    ],
    vitals: {
      blood_pressure: "120/80 mmHg",
      heart_rate: "72 bpm",
      spo2: "99%",
      blood_glucose: "92 mg/dL",
      temperature: "98.4°F",
      bmi: "23.5 kg/m²",
      respiratory_rate: "15 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-011",
        title: "Blood Grouping & Crossmatch Rh-Phenotyping",
        category: "Pathology",
        date: "2026-06-15",
        hospital: "Rajshahi Medical College Hospital Blood Bank",
        lab_ref: "BB-RMCH-3302",
        status: "Normal",
        summary: "Universal Blood Donor Verified: Group O, Rh(D) Negative. Kell Antigen negative. Validated for emergency red cell transfusion.",
        parameters: [
          { name: "ABO Group", value: "O", unit: "-", reference_range: "Confirmed", flag: "NORMAL" },
          { name: "Rh(D) Typing", value: "NEGATIVE", unit: "-", reference_range: "Confirmed", flag: "NORMAL" },
          { name: "Antibody Screen", value: "NEGATIVE", unit: "-", reference_range: "Negative", flag: "NORMAL" },
        ],
        verified_by: "Dr. Asaduzzaman, In-charge Blood Transfusion"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-06-20T08:30:00Z",
    expires_at: "2031-06-20T08:30:00Z",
    is_active: true,
  },
  {
    id: "hp-007",
    patient_id: "user-007",
    card_number: "HP-2026-44012",
    smart_card_uid: "2002-4401-9988-1122",
    patient_name: "ফারহানা চৌধুরী",
    english_name: "FARHANA CHOWDHURY",
    patient_image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    date_of_birth: "2002-03-24",
    gender: "Female",
    blood_group: "AB+",
    nid_number: "2002 4401 9988 1122",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-05-10T10:00:00Z",
    is_activated: true,
    activated_at: "2026-05-10T10:00:00Z",
    division: "Dhaka",
    zila: "Dhaka",
    upazila: "Dhanmondi",
    post_code: "1205",
    address: "Road 27, Dhanmondi, Dhaka",
    last_location_sync: "19 Oct 2026, 03:00 PM",
    personal_phone: "+880 1712-445566",
    personal_has_whatsapp: true,
    emergency_contact_name: "Tariq Chowdhury",
    emergency_contact_phone: "+880 1712-990011",
    emergency_contact_relation: "Brother",
    emergency_has_whatsapp: true,
    marital_status: "Single",
    last_doctor_visit: "12 Oct 2026",
    organ_donor: true,
    diabetic_status: "None",
    has_pacemaker: false,
    hypertension: false,
    allergies: ["Peanuts", "Shellfish"],
    chronic_conditions: [],
    current_medications: [],
    vitals: {
      blood_pressure: "115/75 mmHg",
      heart_rate: "74 bpm",
      spo2: "99%",
      blood_glucose: "90 mg/dL",
      temperature: "98.6°F",
      bmi: "21.0 kg/m²",
      respiratory_rate: "14 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-012",
        title: "Food Allergy Panel (Specific IgE for Nut & Shellfish)",
        category: "Pathology",
        date: "2026-04-18",
        hospital: "Square Hospital Ltd., Allergy Immunology Lab",
        lab_ref: "ALG-SQ-4401",
        status: "Elevated",
        summary: "High positive specific IgE for Peanut (Class 4) and Shrimp/Crab. Epinephrine auto-injector prescribed for anaphylaxis risk.",
        verified_by: "Dr. Nargis Sultana, Consultant Immunologist"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-05-10T10:00:00Z",
    expires_at: "2031-05-10T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-008",
    patient_id: "user-008",
    card_number: "HP-2026-99231",
    smart_card_uid: "1999-9923-1144-7788",
    patient_name: "তানজিলা আক্তার",
    english_name: "TANZILA AKTER",
    patient_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    date_of_birth: "1999-07-22",
    gender: "Female",
    blood_group: "O+",
    nid_number: "1999 4401 9283 1102",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-09-12T09:00:00Z",
    is_activated: true,
    activated_at: "2026-09-12T09:00:00Z",
    division: "Chittagong",
    zila: "Chittagong",
    upazila: "Kotwali",
    post_code: "4000",
    address: "Amanat Road, Kotwali, Chittagong",
    last_location_sync: "17 Oct 2026, 08:30 PM",
    personal_phone: "+880 1819-001122",
    personal_has_whatsapp: true,
    emergency_contact_name: "Abu Taher",
    emergency_contact_phone: "+880 1819-876543",
    emergency_contact_relation: "Husband",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "28 Sep 2026",
    organ_donor: false,
    diabetic_status: "None",
    has_pacemaker: false,
    hypertension: false,
    allergies: ["Ibuprofen", "Diclofenac"],
    chronic_conditions: [],
    current_medications: [
      { name: "Paracetamol", dosage: "500mg", frequency: "3x daily PRN", duration: "5 days", instructions: "Take for postoperative pain", prescribed_by: "Dr. Farhana" }
    ],
    vitals: {
      blood_pressure: "118/76 mmHg",
      heart_rate: "78 bpm",
      spo2: "98%",
      blood_glucose: "94 mg/dL",
      temperature: "98.5°F",
      bmi: "22.1 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-013",
        title: "Post-Reduction Orthopedic Radiograph (Right Forearm AP/Lat)",
        category: "Radiology",
        date: "2026-09-28",
        hospital: "Chittagong Medical College Hospital Orthopedic Trauma",
        lab_ref: "RAD-CMCH-9923",
        status: "Normal",
        summary: "Right distal radial fracture in anatomic alignment. Cast intact. Good bony apposition with early periosteal callus formation.",
        verified_by: "Prof. Dr. M. Harun-ur-Rashid, MS (Ortho)"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-09-12T09:00:00Z",
    expires_at: "2031-09-12T09:00:00Z",
    is_active: true,
  },
  {
    id: "hp-009",
    patient_id: "user-009",
    card_number: "HP-2026-88102",
    smart_card_uid: "1996-8810-2233-4455",
    patient_name: "তানিয়া সুলতানা",
    english_name: "TANIA SULTANA",
    patient_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    date_of_birth: "1996-03-14",
    gender: "Female",
    blood_group: "AB-",
    nid_number: "1996 2618 9021 3412",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-08-10T10:00:00Z",
    is_activated: true,
    activated_at: "2026-08-10T10:00:00Z",
    division: "Dhaka",
    zila: "Dhaka",
    upazila: "Dhanmondi",
    post_code: "1209",
    address: "Road 9/A, Dhanmondi R/A, Dhaka",
    last_location_sync: "19 Oct 2026, 04:15 PM",
    personal_phone: "+880 1711-445566",
    personal_has_whatsapp: true,
    emergency_contact_name: "Tariqul Islam",
    emergency_contact_phone: "+880 1819-223344",
    emergency_contact_relation: "Husband",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "15 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "Gestational",
    allergies: ["Erythromycin", "Cephalosporins"],
    chronic_conditions: [
      { name: "Gestational Diabetes (32 Weeks)", since: "Aug 2026", status: "monitored" },
      { name: "Mild Gestational Hypertension", since: "Sep 2026", status: "controlled" }
    ],
    current_medications: [
      { name: "Insulin Regular (Human)", dosage: "8 IU Before Breakfast", frequency: "Subcutaneous OD", duration: "Until Delivery" },
      { name: "Labetalol HCl", dosage: "100 mg", frequency: "1 + 0 + 1 (BID)", duration: "Until Delivery" },
      { name: "Prenatal Multivitamin & Iron", dosage: "1 Tablet", frequency: "0 + 1 + 0 (OD)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "132/84 mmHg",
      heart_rate: "82 bpm",
      spo2: "99%",
      blood_glucose: "112 mg/dL",
      temperature: "98.6°F",
      bmi: "25.8 kg/m²",
      respiratory_rate: "18 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-014",
        title: "Obstetric Anomaly & Growth Ultrasound (32 Weeks Gestation)",
        category: "Ultrasound",
        date: "2026-10-12",
        hospital: "Square Hospitals Ltd. Maternal-Fetal Unit",
        lab_ref: "USG-SQ-8810",
        status: "Normal",
        summary: "Single live intrauterine fetus in cephalic presentation. Estimated fetal weight 1850g (50th percentile). Amniotic fluid volume AFI 14.2cm normal.",
        verified_by: "Prof. Dr. Nargis Akhter, FCPS (Obs/Gyn)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-08-10T10:00:00Z",
    expires_at: "2031-08-10T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-010",
    patient_id: "user-010",
    card_number: "HP-2026-77341",
    smart_card_uid: "1960-7734-1188-9900",
    patient_name: "আনিসুর রহমান",
    english_name: "ANISUR RAHMAN",
    patient_image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
    date_of_birth: "1960-11-05",
    gender: "Male",
    blood_group: "O+",
    nid_number: "1960 1928 3847 5510",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-07-15T09:30:00Z",
    is_activated: true,
    activated_at: "2026-07-15T09:30:00Z",
    division: "Chittagong",
    zila: "Chittagong",
    upazila: "Panchlaish",
    post_code: "4203",
    address: "Catalganj Residential Area, Panchlaish, Chittagong",
    last_location_sync: "18 Oct 2026, 07:45 PM",
    personal_phone: "+880 1819-334455",
    personal_has_whatsapp: true,
    emergency_contact_name: "Farhana Rahman",
    emergency_contact_phone: "+880 1819-876543",
    emergency_contact_relation: "Daughter",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "10 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "Type-2",
    allergies: ["Morphine", "Codeine"],
    chronic_conditions: [
      { name: "Coronary Artery Disease (Post-CABG 2024)", since: "2023", status: "monitored" },
      { name: "Type-2 Diabetes Mellitus", since: "2012", status: "controlled" }
    ],
    current_medications: [
      { name: "Aspirin (Cardioprotective)", dosage: "75 mg", frequency: "0 + 1 + 0 (OD)", duration: "Life-long" },
      { name: "Atorvastatin Calcium", dosage: "20 mg", frequency: "0 + 0 + 1 (Night)", duration: "Life-long" },
      { name: "Bisoprolol Fumarate", dosage: "2.5 mg", frequency: "1 + 0 + 0 (Morning)", duration: "Life-long" }
    ],
    vitals: {
      blood_pressure: "124/78 mmHg",
      heart_rate: "66 bpm",
      spo2: "97%",
      blood_glucose: "118 mg/dL",
      temperature: "98.4°F",
      bmi: "26.1 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-015",
        title: "Transthoracic 2D Doppler Echocardiography",
        category: "Cardiology",
        date: "2026-09-18",
        hospital: "National Heart Foundation Hospital & Research Institute",
        lab_ref: "ECHO-NHF-7734",
        status: "Normal",
        summary: "Normal LV cavity dimensions. Mild apical hypokinesia. Overall LVEF 55%. No significant valvular regurgitation or pericardial effusion.",
        verified_by: "Prof. Dr. Fazila-Tun-Nesa Malik, FCPS"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-07-15T09:30:00Z",
    expires_at: "2031-07-15T09:30:00Z",
    is_active: true,
  },
  {
    id: "hp-011",
    patient_id: "user-011",
    card_number: "HP-2026-66290",
    smart_card_uid: "1990-6629-0011-2233",
    patient_name: "রিনা আক্তার",
    english_name: "RINA AKTER",
    patient_image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    date_of_birth: "1990-08-19",
    gender: "Female",
    blood_group: "A-",
    nid_number: "1990 9182 7364 5501",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-06-20T11:00:00Z",
    is_activated: true,
    activated_at: "2026-06-20T11:00:00Z",
    division: "Sylhet",
    zila: "Sylhet",
    upazila: "Sylhet Sadar",
    post_code: "3100",
    address: "Zindabazar Point, Sylhet",
    last_location_sync: "19 Oct 2026, 02:00 PM",
    personal_phone: "+880 1712-889900",
    personal_has_whatsapp: true,
    emergency_contact_name: "Mizanur Rahman",
    emergency_contact_phone: "+880 1712-778899",
    emergency_contact_relation: "Brother",
    emergency_has_whatsapp: true,
    marital_status: "Single",
    last_doctor_visit: "05 Oct 2026",
    organ_donor: true,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["Peanuts (Severe Anaphylaxis)", "Tree Nuts", "Latex"],
    chronic_conditions: [
      { name: "Severe Food Allergies with Anaphylaxis History", since: "Childhood", status: "critical" }
    ],
    current_medications: [
      { name: "EpiPen Auto-Injector (Epinephrine)", dosage: "0.3 mg IM", frequency: "Emergency PRN", duration: "Carry always" },
      { name: "Levocetirizine Dihydrochloride", dosage: "5 mg", frequency: "0 + 0 + 1 (PRN)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "116/74 mmHg",
      heart_rate: "72 bpm",
      spo2: "99%",
      blood_glucose: "92 mg/dL",
      temperature: "98.2°F",
      bmi: "21.4 kg/m²",
      respiratory_rate: "15 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-016",
        title: "Serum Specific IgE Food Allergy ImmunoCAP Panel",
        category: "Immunology",
        date: "2026-08-14",
        hospital: "OASIS Hospital Sylhet Diagnostic Wing",
        lab_ref: "IMM-OAS-6629",
        status: "Abnormal",
        summary: "Peanut specific IgE >100 kU/L (Class 6 - Extremely High Anaphylaxis Risk). Strict allergen avoidance mandatory.",
        verified_by: "Dr. Syed Mahmud Ali, MD (Allergy/Immunology)"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-06-20T11:00:00Z",
    expires_at: "2031-06-20T11:00:00Z",
    is_active: true,
  },
  {
    id: "hp-012",
    patient_id: "user-012",
    card_number: "HP-2026-55418",
    smart_card_uid: "1957-5541-8899-0011",
    patient_name: "প্রফেসর ডা. শামসুল হুদা",
    english_name: "PROF. DR. SHAMSUL HUDA",
    patient_image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300",
    photo_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300",
    date_of_birth: "1957-04-10",
    gender: "Male",
    blood_group: "B+",
    nid_number: "1957 8899 0011 2233",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-05-18T14:00:00Z",
    is_activated: true,
    activated_at: "2026-05-18T14:00:00Z",
    division: "Rajshahi",
    zila: "Rajshahi",
    upazila: "Boalia",
    post_code: "6000",
    address: "Medical College Gate Road, Boalia, Rajshahi",
    last_location_sync: "19 Oct 2026, 06:10 PM",
    personal_phone: "+880 1711-998877",
    personal_has_whatsapp: true,
    emergency_contact_name: "Dr. Nasrin Huda",
    emergency_contact_phone: "+880 1711-665544",
    emergency_contact_relation: "Wife",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "12 Oct 2026",
    organ_donor: true,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["None Known"],
    chronic_conditions: [
      { name: "Essential Hypertension", since: "2015", status: "controlled" },
      { name: "Mild Benign Prostatic Hyperplasia (BPH)", since: "2022", status: "stable" }
    ],
    current_medications: [
      { name: "Telmisartan", dosage: "40 mg", frequency: "1 + 0 + 0 (OD Morning)", duration: "Ongoing" },
      { name: "Tamsulosin HCl", dosage: "0.4 mg", frequency: "0 + 0 + 1 (Night)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "122/80 mmHg",
      heart_rate: "70 bpm",
      spo2: "98%",
      blood_glucose: "98 mg/dL",
      temperature: "98.4°F",
      bmi: "24.5 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-017",
        title: "Renal Function Panel & Serum Electrolytes",
        category: "Biochemistry",
        date: "2026-09-30",
        hospital: "Rajshahi Medical College Hospital Central Lab",
        lab_ref: "BIO-RMCH-5541",
        status: "Normal",
        summary: "Serum Creatinine 1.05 mg/dL. eGFR 78 mL/min/1.73m². Serum Potassium 4.4 mmol/L. Normal kidney function.",
        verified_by: "Dr. Mostafizur Rahman, M.Phil (Biochem)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-05-18T14:00:00Z",
    expires_at: "2031-05-18T14:00:00Z",
    is_active: true,
  },
  {
    id: "hp-013",
    patient_id: "user-013",
    card_number: "HP-2026-44319",
    smart_card_uid: "1993-4431-9988-7766",
    patient_name: "ফারহানা ইয়াসমিন",
    english_name: "FARHANA YASMIN",
    patient_image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
    date_of_birth: "1993-12-04",
    gender: "Female",
    blood_group: "O-",
    nid_number: "1993 4455 6677 8899",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-04-12T10:00:00Z",
    is_activated: true,
    activated_at: "2026-04-12T10:00:00Z",
    division: "Barisal",
    zila: "Barisal",
    upazila: "Kotwali",
    post_code: "8200",
    address: "Band Road, Barisal",
    last_location_sync: "19 Oct 2026, 01:25 PM",
    personal_phone: "+880 1713-112233",
    personal_has_whatsapp: true,
    emergency_contact_name: "Selim Reza",
    emergency_contact_phone: "+880 1713-998800",
    emergency_contact_relation: "Husband",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "25 Sep 2026",
    organ_donor: true,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["None Recorded"],
    chronic_conditions: [],
    current_medications: [],
    vitals: {
      blood_pressure: "115/75 mmHg",
      heart_rate: "74 bpm",
      spo2: "99%",
      blood_glucose: "90 mg/dL",
      temperature: "98.5°F",
      bmi: "22.0 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-018",
        title: "Complete Blood Count & ABO Blood Group Confirmation",
        category: "Hematology",
        date: "2026-09-15",
        hospital: "Sher-e-Bangla Medical College Hospital Blood Bank",
        lab_ref: "HEM-SBMCH-4431",
        status: "Normal",
        summary: "ABO Group 'O' Negative confirmed by forward and reverse grouping. Antibody screen negative. Eligible for whole blood donor registry.",
        verified_by: "Dr. A. K. Azad, MD (Transfusion Med)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-04-12T10:00:00Z",
    expires_at: "2031-04-12T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-014",
    patient_id: "user-014",
    card_number: "HP-2026-33215",
    smart_card_uid: "1965-3321-5566-7788",
    patient_name: "মো. মনিরুল ইসলাম",
    english_name: "MD. MONIRUL ISLAM",
    patient_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    date_of_birth: "1965-06-25",
    gender: "Male",
    blood_group: "A+",
    nid_number: "1965 3344 5566 7788",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-03-10T12:00:00Z",
    is_activated: true,
    activated_at: "2026-03-10T12:00:00Z",
    division: "Rangpur",
    zila: "Rangpur",
    upazila: "Rangpur Sadar",
    post_code: "5400",
    address: "Dhap Medical Mor, Rangpur",
    last_location_sync: "19 Oct 2026, 05:40 PM",
    personal_phone: "+880 1714-556677",
    personal_has_whatsapp: true,
    emergency_contact_name: "Shamim Islam",
    emergency_contact_phone: "+880 1714-889900",
    emergency_contact_relation: "Son",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "08 Oct 2026",
    organ_donor: false,
    has_pacemaker: true,
    diabetic_status: "Type-2",
    allergies: ["Iodinated Radiocontrast Media"],
    chronic_conditions: [
      { name: "Ventricular Tachycardia (ICD Implanted)", since: "2022", status: "critical" },
      { name: "Ischemic Cardiomyopathy", since: "2021", status: "monitored" }
    ],
    current_medications: [
      { name: "Amiodarone HCl", dosage: "200 mg", frequency: "1 + 0 + 0 (OD)", duration: "Ongoing" },
      { name: "Sacubitril / Valsartan", dosage: "24/26 mg", frequency: "1 + 0 + 1 (BID)", duration: "Ongoing" },
      { name: "Empagliflozin", dosage: "10 mg", frequency: "1 + 0 + 0 (OD)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "118/76 mmHg",
      heart_rate: "68 bpm",
      spo2: "97%",
      blood_glucose: "125 mg/dL",
      temperature: "98.4°F",
      bmi: "25.2 kg/m²",
      respiratory_rate: "17 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-019",
        title: "Medtronic Dual-Chamber ICD Telemetry Interrogation",
        category: "Cardiology",
        date: "2026-10-02",
        hospital: "Rangpur Medical College Hospital Cardiac Cath Lab",
        lab_ref: "ICD-RMCH-3321",
        status: "Normal",
        summary: "Device battery status OK (estimated 6.2 years remaining). Pacing threshold 0.75V @ 0.4ms. Zero shock deliveries over last 90 days.",
        verified_by: "Prof. Dr. Shakil Gafur, MD (Cardiology)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-03-10T12:00:00Z",
    expires_at: "2031-03-10T12:00:00Z",
    is_active: true,
  },
  {
    id: "hp-015",
    patient_id: "user-015",
    card_number: "HP-2026-22104",
    smart_card_uid: "1976-2210-4455-6677",
    patient_name: "নাসিমা খাতুন",
    english_name: "NASIMA KHATUN",
    patient_image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300",
    photo_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300",
    date_of_birth: "1976-09-18",
    gender: "Female",
    blood_group: "B-",
    nid_number: "1976 1122 3344 5566",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-02-14T11:00:00Z",
    is_activated: true,
    activated_at: "2026-02-14T11:00:00Z",
    division: "Chittagong",
    zila: "Comilla",
    upazila: "Comilla Adarsha Sadar",
    post_code: "3500",
    address: "Kandirpar, Comilla",
    last_location_sync: "19 Oct 2026, 03:50 PM",
    personal_phone: "+880 1715-667788",
    personal_has_whatsapp: true,
    emergency_contact_name: "Kabir Hossain",
    emergency_contact_phone: "+880 1715-990011",
    emergency_contact_relation: "Husband",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "01 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "Type-2",
    allergies: ["NSAIDs (Ibuprofen, Diclofenac - Renal Contraindication)"],
    chronic_conditions: [
      { name: "Chronic Kidney Disease (Stage 3b)", since: "2021", status: "monitored" },
      { name: "Renal Anemia", since: "2023", status: "controlled" }
    ],
    current_medications: [
      { name: "Torsemide", dosage: "10 mg", frequency: "1 + 0 + 0 (Morning)", duration: "Ongoing" },
      { name: "Erythropoietin (EPO)", dosage: "4000 IU", frequency: "Subcutaneous Once Weekly", duration: "Ongoing" },
      { name: "Calcium Acetate", dosage: "667 mg", frequency: "1 + 1 + 1 (With Meals)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "138/86 mmHg",
      heart_rate: "76 bpm",
      spo2: "98%",
      blood_glucose: "115 mg/dL",
      temperature: "98.3°F",
      bmi: "23.8 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-020",
        title: "Comprehensive Renal Function & 24h Urine Protein",
        category: "Nephrology",
        date: "2026-09-22",
        hospital: "Comilla Medical College Hospital Nephrology Wing",
        lab_ref: "NEP-COM-2210",
        status: "Abnormal",
        summary: "Serum Creatinine 2.1 mg/dL. eGFR 38 mL/min/1.73m² (CKD Stage 3b). 24h urinary protein excretion 850mg/day.",
        verified_by: "Prof. Dr. Md. Rafiqul Alam, MD (Nephrology)"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-02-14T11:00:00Z",
    expires_at: "2031-02-14T11:00:00Z",
    is_active: true,
  },
  {
    id: "hp-016",
    patient_id: "user-016",
    card_number: "HP-2026-11093",
    smart_card_uid: "1982-1109-3344-5566",
    patient_name: "মাহফুজুর রহমান",
    english_name: "MAHFUZUR RAHMAN",
    patient_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    date_of_birth: "1982-01-30",
    gender: "Male",
    blood_group: "AB+",
    nid_number: "1982 7788 9900 1122",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-01-20T10:00:00Z",
    is_activated: true,
    activated_at: "2026-01-20T10:00:00Z",
    division: "Dhaka",
    zila: "Gazipur",
    upazila: "Joydebpur",
    post_code: "1700",
    address: "Chowrasta, Joydebpur, Gazipur",
    last_location_sync: "19 Oct 2026, 04:30 PM",
    personal_phone: "+880 1716-112244",
    personal_has_whatsapp: true,
    emergency_contact_name: "Salma Begum",
    emergency_contact_phone: "+880 1716-445566",
    emergency_contact_relation: "Wife",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "28 Sep 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["Aspirin"],
    chronic_conditions: [
      { name: "Peptic Ulcer Disease (H. Pylori Positive)", since: "2024", status: "controlled" }
    ],
    current_medications: [
      { name: "Esomeprazole Magnesium", dosage: "40 mg", frequency: "1 + 0 + 0 (Before Breakfast)", duration: "60 Days" },
      { name: "Sucralfate Suspension", dosage: "10 ml", frequency: "1 + 1 + 1 (Before Meals)", duration: "30 Days" }
    ],
    vitals: {
      blood_pressure: "120/78 mmHg",
      heart_rate: "74 bpm",
      spo2: "99%",
      blood_glucose: "95 mg/dL",
      temperature: "98.4°F",
      bmi: "24.0 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-021",
        title: "Upper GI Video Endoscopy Report",
        category: "Gastroenterology",
        date: "2026-09-08",
        hospital: "Shaheed Tajuddin Ahmad Medical College Hospital",
        lab_ref: "END-STA-1109",
        status: "Normal",
        summary: "Healing duodenal ulcer (Forrest III). Rapid urease test for H. Pylori negative following eradication therapy.",
        verified_by: "Dr. K. M. Saiful Islam, FCPS (Gastro)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-01-20T10:00:00Z",
    expires_at: "2031-01-20T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-017",
    patient_id: "user-017",
    card_number: "HP-2026-00982",
    smart_card_uid: "1987-0098-2211-3344",
    patient_name: "শিরিন সুলতানা",
    english_name: "SHIRIN SULTANA",
    patient_image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=300",
    photo_url: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=300",
    date_of_birth: "1987-05-12",
    gender: "Female",
    blood_group: "O+",
    nid_number: "1987 5566 7788 9900",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-02-05T09:00:00Z",
    is_activated: true,
    activated_at: "2026-02-05T09:00:00Z",
    division: "Mymensingh",
    zila: "Mymensingh",
    upazila: "Mymensingh Sadar",
    post_code: "2200",
    address: "Chorpara Medical Road, Mymensingh",
    last_location_sync: "19 Oct 2026, 02:45 PM",
    personal_phone: "+880 1717-223344",
    personal_has_whatsapp: true,
    emergency_contact_name: "Rafiqul Alam",
    emergency_contact_phone: "+880 1717-556677",
    emergency_contact_relation: "Husband",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "04 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["Dust Mites", "Pollen", "Sulfa Drugs"],
    chronic_conditions: [
      { name: "Extrinsic Bronchial Asthma", since: "2010", status: "controlled" }
    ],
    current_medications: [
      { name: "Salmeterol + Fluticasone Inhaler (25/250)", dosage: "2 Puffs", frequency: "1 + 0 + 1 (BID)", duration: "Ongoing" },
      { name: "Montelukast Sodium", dosage: "10 mg", frequency: "0 + 0 + 1 (Night)", duration: "Ongoing" },
      { name: "Salbutamol Inhaler (100 mcg)", dosage: "2 Puffs", frequency: "PRN (Emergency Spasm)", duration: "Carry always" }
    ],
    vitals: {
      blood_pressure: "118/76 mmHg",
      heart_rate: "80 bpm",
      spo2: "98%",
      blood_glucose: "92 mg/dL",
      temperature: "98.4°F",
      bmi: "22.6 kg/m²",
      respiratory_rate: "18 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-022",
        title: "Digital Spirometry & Pre/Post Bronchodilator PFT",
        category: "Pulmonology",
        date: "2026-08-20",
        hospital: "Mymensingh Medical College Hospital Respiratory Medicine",
        lab_ref: "PFT-MMCH-0098",
        status: "Normal",
        summary: "FEV1/FVC ratio 78%. FEV1 improved by 14% post-salbutamol inhalation confirming reversible airway obstruction under good controller coverage.",
        verified_by: "Prof. Dr. Md. Zakir Hossain, MD (Chest)"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-02-05T09:00:00Z",
    expires_at: "2031-02-05T09:00:00Z",
    is_active: true,
  },
  {
    id: "hp-018",
    patient_id: "user-018",
    card_number: "HP-2026-99120",
    smart_card_uid: "1968-9912-0044-6688",
    patient_name: "জহিরুল হক",
    english_name: "ZAHIRUL HAQUE",
    patient_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
    photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
    date_of_birth: "1968-10-08",
    gender: "Male",
    blood_group: "A+",
    nid_number: "1968 1133 5577 9922",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-01-15T11:00:00Z",
    is_activated: true,
    activated_at: "2026-01-15T11:00:00Z",
    division: "Dhaka",
    zila: "Narayanganj",
    upazila: "Narayanganj Sadar",
    post_code: "1400",
    address: "Chashara Mor, Narayanganj",
    last_location_sync: "19 Oct 2026, 03:10 PM",
    personal_phone: "+880 1718-334455",
    personal_has_whatsapp: true,
    emergency_contact_name: "Rubel Haque",
    emergency_contact_phone: "+880 1718-667788",
    emergency_contact_relation: "Son",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "06 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "Type-2",
    allergies: ["Penicillin"],
    chronic_conditions: [
      { name: "Type-2 Diabetes with Diabetic Peripheral Neuropathy", since: "2014", status: "monitored" }
    ],
    current_medications: [
      { name: "Vildagliptin + Metformin (50/500)", dosage: "1 Tablet", frequency: "1 + 0 + 1 (BID)", duration: "Ongoing" },
      { name: "Pregabalin", dosage: "50 mg", frequency: "0 + 0 + 1 (Night)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "128/82 mmHg",
      heart_rate: "76 bpm",
      spo2: "98%",
      blood_glucose: "135 mg/dL",
      temperature: "98.4°F",
      bmi: "26.4 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-023",
        title: "Lower Limb Nerve Conduction Velocity (NCV) Study",
        category: "Neurology",
        date: "2026-07-19",
        hospital: "National Institute of Neurosciences & Hospital (NINS)",
        lab_ref: "NCV-NIN-9912",
        status: "Normal",
        summary: "Symmetrical sensory-motor axonal neuropathy in bilateral lower extremities consistent with diabetic polyneuropathy.",
        verified_by: "Prof. Dr. Quazi Deen Mohammad, FCPS (Neuro)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-01-15T11:00:00Z",
    expires_at: "2031-01-15T11:00:00Z",
    is_active: true,
  },
  {
    id: "hp-019",
    patient_id: "user-019",
    card_number: "HP-2026-88019",
    smart_card_uid: "2000-8801-9922-3344",
    patient_name: "সাবিনা চৌধুরী",
    english_name: "SABINA CHOWDHURY",
    patient_image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    date_of_birth: "2000-02-14",
    gender: "Female",
    blood_group: "B+",
    nid_number: "2000 2244 6688 0011",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-03-01T10:00:00Z",
    is_activated: true,
    activated_at: "2026-03-01T10:00:00Z",
    division: "Sylhet",
    zila: "Sylhet",
    upazila: "Amberkhana",
    post_code: "3100",
    address: "Amberkhana Point, Sylhet",
    last_location_sync: "19 Oct 2026, 01:10 PM",
    personal_phone: "+880 1719-445566",
    personal_has_whatsapp: true,
    emergency_contact_name: "Enamul Chowdhury",
    emergency_contact_phone: "+880 1719-778899",
    emergency_contact_relation: "Father",
    emergency_has_whatsapp: true,
    marital_status: "Single",
    last_doctor_visit: "11 Oct 2026",
    organ_donor: true,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["None Known"],
    chronic_conditions: [],
    current_medications: [],
    vitals: {
      blood_pressure: "112/72 mmHg",
      heart_rate: "70 bpm",
      spo2: "99%",
      blood_glucose: "88 mg/dL",
      temperature: "98.6°F",
      bmi: "20.8 kg/m²",
      respiratory_rate: "15 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-024",
        title: "Abdominal & Pelvic Ultrasound Post-Appendectomy",
        category: "Ultrasound",
        date: "2026-09-02",
        hospital: "Sylhet MAG Osmani Medical College Hospital",
        lab_ref: "USG-SOMC-8801",
        status: "Normal",
        summary: "Normal postoperative appearance of right iliac fossa. No free fluid, collection, or hematoma identified.",
        verified_by: "Dr. Farhana Begum, MBBS, DMRD"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-03-01T10:00:00Z",
    expires_at: "2031-03-01T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-020",
    patient_id: "user-020",
    card_number: "HP-2026-77810",
    smart_card_uid: "1954-7781-0022-4466",
    patient_name: "গোলাম সারোয়ার",
    english_name: "GOLAM SARWAR",
    patient_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    date_of_birth: "1954-08-11",
    gender: "Male",
    blood_group: "O-",
    nid_number: "1954 9900 1122 3344",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-02-18T10:00:00Z",
    is_activated: true,
    activated_at: "2026-02-18T10:00:00Z",
    division: "Rajshahi",
    zila: "Bogura",
    upazila: "Bogura Sadar",
    post_code: "5800",
    address: "Shatmatha, Bogura",
    last_location_sync: "19 Oct 2026, 04:00 PM",
    personal_phone: "+880 1720-112233",
    personal_has_whatsapp: true,
    emergency_contact_name: "Mahmud Sarwar",
    emergency_contact_phone: "+880 1720-445566",
    emergency_contact_relation: "Son",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "14 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["Ciprofloxacin"],
    chronic_conditions: [
      { name: "Chronic Obstructive Pulmonary Disease (COPD GOLD II)", since: "2018", status: "monitored" }
    ],
    current_medications: [
      { name: "Tiotropium Bromide Inhalation Capsule (18 mcg)", dosage: "1 Inhalation", frequency: "1 + 0 + 0 (Morning)", duration: "Life-long" },
      { name: "Acebrophylline", dosage: "100 mg", frequency: "1 + 0 + 1 (BID)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "130/84 mmHg",
      heart_rate: "78 bpm",
      spo2: "95%",
      blood_glucose: "102 mg/dL",
      temperature: "98.5°F",
      bmi: "23.4 kg/m²",
      respiratory_rate: "20 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-025",
        title: "Arterial Blood Gas (ABG) Analysis on Room Air",
        category: "Pulmonology",
        date: "2026-09-14",
        hospital: "Shaheed Ziaur Rahman Medical College Hospital",
        lab_ref: "ABG-SZM-7781",
        status: "Normal",
        summary: "pH 7.39, PaO2 78 mmHg, PaCO2 42 mmHg, HCO3 25 mEq/L, SaO2 95%. Compensated respiratory status.",
        verified_by: "Dr. M. A. Kashem, FCPS (Chest)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-02-18T10:00:00Z",
    expires_at: "2031-02-18T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-021",
    patient_id: "user-021",
    card_number: "HP-2026-66721",
    smart_card_uid: "1971-6672-1133-5577",
    patient_name: "আফরোজা বানু",
    english_name: "AFROZA BANU",
    patient_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    date_of_birth: "1971-03-22",
    gender: "Female",
    blood_group: "A-",
    nid_number: "1971 3355 7799 1100",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-01-10T10:00:00Z",
    is_activated: true,
    activated_at: "2026-01-10T10:00:00Z",
    division: "Khulna",
    zila: "Khulna",
    upazila: "Khulna Sadar",
    post_code: "9100",
    address: "KDA Avenue, Khulna",
    last_location_sync: "19 Oct 2026, 03:00 PM",
    personal_phone: "+880 1721-223344",
    personal_has_whatsapp: true,
    emergency_contact_name: "Mostafa Kamal",
    emergency_contact_phone: "+880 1721-556677",
    emergency_contact_relation: "Husband",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "03 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["None Recorded"],
    chronic_conditions: [
      { name: "Primary Hypothyroidism", since: "2016", status: "controlled" }
    ],
    current_medications: [
      { name: "Levothyroxine Sodium", dosage: "50 mcg", frequency: "1 + 0 + 0 (Empty Stomach)", duration: "Life-long" }
    ],
    vitals: {
      blood_pressure: "124/80 mmHg",
      heart_rate: "68 bpm",
      spo2: "98%",
      blood_glucose: "96 mg/dL",
      temperature: "98.1°F",
      bmi: "25.0 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-026",
        title: "Serum Thyroid Function Profile (TSH, FT4, FT3)",
        category: "Endocrinology",
        date: "2026-09-10",
        hospital: "Khulna Medical College Hospital Endocrinology Wing",
        lab_ref: "THY-KMC-6672",
        status: "Normal",
        summary: "TSH 2.15 mIU/L (Euthyroid target). FT4 14.8 pmol/L. Optimal replacement dosage on Levothyroxine 50 mcg.",
        verified_by: "Prof. Dr. M. R. Faruqui, MD (Endo)"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-01-10T10:00:00Z",
    expires_at: "2031-01-10T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-022",
    patient_id: "user-022",
    card_number: "HP-2026-55632",
    smart_card_uid: "1995-5563-2244-6688",
    patient_name: "তারিক হাসান",
    english_name: "TARIQ HASAN",
    patient_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    date_of_birth: "1995-11-20",
    gender: "Male",
    blood_group: "B+",
    nid_number: "1995 8800 2244 6688",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-02-28T10:00:00Z",
    is_activated: true,
    activated_at: "2026-02-28T10:00:00Z",
    division: "Dhaka",
    zila: "Dhaka",
    upazila: "Gulshan",
    post_code: "1212",
    address: "Gulshan-2, Dhaka",
    last_location_sync: "19 Oct 2026, 05:00 PM",
    personal_phone: "+880 1722-334455",
    personal_has_whatsapp: true,
    emergency_contact_name: "Nurul Hasan",
    emergency_contact_phone: "+880 1722-667788",
    emergency_contact_relation: "Father",
    emergency_has_whatsapp: true,
    marital_status: "Single",
    last_doctor_visit: "12 Oct 2026",
    organ_donor: true,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["None Known"],
    chronic_conditions: [
      { name: "Post-Arthroscopic ACL Reconstruction (Right Knee)", since: "Jul 2026", status: "rehabilitating" }
    ],
    current_medications: [
      { name: "Glucosamine + Chondroitin", dosage: "1 Tablet", frequency: "1 + 0 + 1 (BID)", duration: "90 Days" }
    ],
    vitals: {
      blood_pressure: "118/76 mmHg",
      heart_rate: "68 bpm",
      spo2: "99%",
      blood_glucose: "90 mg/dL",
      temperature: "98.5°F",
      bmi: "22.8 kg/m²",
      respiratory_rate: "15 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-027",
        title: "Postoperative Right Knee High-Resolution MRI",
        category: "Radiology",
        date: "2026-09-18",
        hospital: "Evercare Hospital Dhaka Department of Radiology",
        lab_ref: "MRI-EVE-5563",
        status: "Normal",
        summary: "Intact bioabsorbable interference screw fixation of ACL graft. Graft signal is normal. Full joint stability restored.",
        verified_by: "Dr. Ziaul Haque, MBBS, MD (Radio)"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-02-28T10:00:00Z",
    expires_at: "2031-02-28T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-023",
    patient_id: "user-023",
    card_number: "HP-2026-44541",
    smart_card_uid: "1978-4454-1133-5577",
    patient_name: "শাহিদা পারভীন",
    english_name: "SHAHIDA PARVIN",
    patient_image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    date_of_birth: "1978-07-09",
    gender: "Female",
    blood_group: "AB-",
    nid_number: "1978 4466 8800 2244",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-03-12T10:00:00Z",
    is_activated: true,
    activated_at: "2026-03-12T10:00:00Z",
    division: "Dhaka",
    zila: "Tangail",
    upazila: "Tangail Sadar",
    post_code: "1900",
    address: "Boro Kalibari Road, Tangail",
    last_location_sync: "19 Oct 2026, 01:40 PM",
    personal_phone: "+880 1723-445566",
    personal_has_whatsapp: true,
    emergency_contact_name: "Anwar Hossain",
    emergency_contact_phone: "+880 1723-778899",
    emergency_contact_relation: "Husband",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "09 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["Doxycycline"],
    chronic_conditions: [
      { name: "Beta Thalassemia Minor (Trait)", since: "Congenital", status: "stable" }
    ],
    current_medications: [
      { name: "Folic Acid", dosage: "5 mg", frequency: "1 + 0 + 0 (OD)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "116/74 mmHg",
      heart_rate: "74 bpm",
      spo2: "98%",
      blood_glucose: "91 mg/dL",
      temperature: "98.4°F",
      bmi: "22.2 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-028",
        title: "Hemoglobin Electrophoresis (HPLC Method)",
        category: "Hematology",
        date: "2026-08-05",
        hospital: "Tangail General Hospital Pathology Laboratory",
        lab_ref: "HPLC-TAN-4454",
        status: "Normal",
        summary: "HbA2 level 5.2% (elevated >3.5%), consistent with Beta Thalassemia Trait. HbF 1.1%. Iron deficiency ruled out.",
        verified_by: "Dr. Nazmul Huda, MD (Pathology)"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-03-12T10:00:00Z",
    expires_at: "2031-03-12T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-024",
    patient_id: "user-024",
    card_number: "HP-2026-33452",
    smart_card_uid: "1962-3345-2244-6688",
    patient_name: "কাজী নজরুল ইসলাম",
    english_name: "KAZI NAZRUL ISLAM",
    patient_image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
    date_of_birth: "1962-05-24",
    gender: "Male",
    blood_group: "O+",
    nid_number: "1962 5577 9911 3355",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-01-25T10:00:00Z",
    is_activated: true,
    activated_at: "2026-01-25T10:00:00Z",
    division: "Khulna",
    zila: "Jessore",
    upazila: "Jessore Sadar",
    post_code: "7400",
    address: "Mujib Sarak, Jessore",
    last_location_sync: "19 Oct 2026, 04:10 PM",
    personal_phone: "+880 1724-556677",
    personal_has_whatsapp: true,
    emergency_contact_name: "Nahid Islam",
    emergency_contact_phone: "+880 1724-889900",
    emergency_contact_relation: "Son",
    emergency_has_whatsapp: true,
    marital_status: "Married",
    last_doctor_visit: "10 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["None Recorded"],
    chronic_conditions: [
      { name: "Non-Alcoholic Fatty Liver Disease (Grade 1)", since: "2023", status: "monitored" },
      { name: "Dyslipidemia", since: "2020", status: "controlled" }
    ],
    current_medications: [
      { name: "Rosuvastatin Calcium", dosage: "10 mg", frequency: "0 + 0 + 1 (Night)", duration: "Ongoing" },
      { name: "Ursodeoxycholic Acid", dosage: "300 mg", frequency: "1 + 0 + 1 (BID)", duration: "60 Days" }
    ],
    vitals: {
      blood_pressure: "126/80 mmHg",
      heart_rate: "72 bpm",
      spo2: "98%",
      blood_glucose: "105 mg/dL",
      temperature: "98.4°F",
      bmi: "26.8 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-029",
        title: "Lipid Profile & Liver Enzymes (SGPT/SGOT)",
        category: "Biochemistry",
        date: "2026-09-25",
        hospital: "Jessore 250 Bed General Hospital Diagnostic Center",
        lab_ref: "LIP-JES-3345",
        status: "Normal",
        summary: "Total Cholesterol 182 mg/dL, Triglycerides 155 mg/dL, LDL 108 mg/dL. SGPT (ALT) 38 U/L within normal range.",
        verified_by: "Dr. A. H. M. Rezaul Karim, MD"
      }
    ],
    face_verified: true,
    fingerprint_registered: true,
    issued_at: "2026-01-25T10:00:00Z",
    expires_at: "2031-01-25T10:00:00Z",
    is_active: true,
  },
  {
    id: "hp-025",
    patient_id: "user-025",
    card_number: "HP-2026-22341",
    smart_card_uid: "1956-2234-1133-5577",
    patient_name: "মেহেরুন নেসা",
    english_name: "MEHERUN NESA",
    patient_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    date_of_birth: "1956-04-18",
    gender: "Female",
    blood_group: "A+",
    nid_number: "1956 2244 6688 1133",
    birth_cert_number: null,
    verification_status: "verified",
    verified_at: "2026-01-18T10:00:00Z",
    is_activated: true,
    activated_at: "2026-01-18T10:00:00Z",
    division: "Rangpur",
    zila: "Dinajpur",
    upazila: "Dinajpur Sadar",
    post_code: "5200",
    address: "Hospital Road, Dinajpur",
    last_location_sync: "19 Oct 2026, 02:20 PM",
    personal_phone: "+880 1725-667788",
    personal_has_whatsapp: true,
    emergency_contact_name: "Asaduzzaman",
    emergency_contact_phone: "+880 1725-990011",
    emergency_contact_relation: "Son",
    emergency_has_whatsapp: true,
    marital_status: "Widowed",
    last_doctor_visit: "07 Oct 2026",
    organ_donor: false,
    has_pacemaker: false,
    diabetic_status: "None",
    allergies: ["Sulfa Drugs", "Ciprofloxacin"],
    chronic_conditions: [
      { name: "Bilateral Knee Osteoarthritis (Grade 2)", since: "2019", status: "monitored" },
      { name: "Essential Hypertension", since: "2011", status: "controlled" }
    ],
    current_medications: [
      { name: "Amlodipine Besylate", dosage: "5 mg", frequency: "1 + 0 + 0 (OD)", duration: "Ongoing" },
      { name: "Paracetamol (Extended Release)", dosage: "665 mg", frequency: "1 + 0 + 1 (PRN Pain)", duration: "PRN" },
      { name: "Calcium Carbonate + Vit D3", dosage: "500 mg / 200 IU", frequency: "0 + 1 + 0 (After Lunch)", duration: "Ongoing" }
    ],
    vitals: {
      blood_pressure: "128/82 mmHg",
      heart_rate: "72 bpm",
      spo2: "97%",
      blood_glucose: "100 mg/dL",
      temperature: "98.4°F",
      bmi: "25.6 kg/m²",
      respiratory_rate: "16 bpm"
    },
    diagnostic_reports: [
      {
        id: "rep-030",
        title: "Bilateral Knee Standing Weight-Bearing Radiographs",
        category: "Orthopedics",
        date: "2026-09-04",
        hospital: "M. Abdur Rahim Medical College Hospital Dinajpur",
        lab_ref: "XRY-DIN-2234",
        status: "Normal",
        summary: "Moderate medial compartment joint space narrowing in both knees with marginal osteophytes. No acute bony injury or joint effusion.",
        verified_by: "Prof. Dr. M. A. Wahab, MS (Ortho)"
      }
    ],
    face_verified: true,
    fingerprint_registered: false,
    issued_at: "2026-01-18T10:00:00Z",
    expires_at: "2031-01-18T10:00:00Z",
    is_active: true,
  }
];

export const MOCK_MEDICAL_VISITS: MedicalVisit[] = [
  {
    id: "v-001",
    patient_id: "user-001",
    doctor_name: "Prof. Dr. Aminul Rahman, MBBS, FCPS",
    department: "Department of Endocrinology & Metabolism",
    hospital_name: "Square Hospital Ltd.",
    location: "18/F Bir Uttam Qazi Nuruzzaman Sarak, Dhanmondi, Dhaka 1205",
    visit_date: "2026-10-14",
    diagnosis: "Type-2 Diabetes Mellitus (Controlled) with Essential Hypertension",
    prescription_summary: "Metformin 500mg BID + Amlodipine 5mg OD. Glycemic target within normal range.",
    notes: "Patient is compliant with medication. No signs of peripheral neuropathy or diabetic retinopathy.",
    vitals: {
      bp: "120/80 mmHg",
      pulse: "74 bpm",
      temp: "98.4°F",
      weight: "68.5 kg",
    },
    medications: [
      {
        name: "Metformin HCl",
        dosage: "500 mg",
        frequency: "1 + 0 + 1 (Twice Daily)",
        duration: "90 Days",
        instructions: "Take with or immediately after meals",
      },
      {
        name: "Amlodipine Besylate",
        dosage: "5 mg",
        frequency: "1 + 0 + 0 (Once Daily Morning)",
        duration: "90 Days",
        instructions: "Take after breakfast with a glass of water",
      },
      {
        name: "Cholecalciferol (Vitamin D3)",
        dosage: "2000 IU",
        frequency: "0 + 1 + 0 (Once Daily)",
        duration: "60 Days",
        instructions: "Take after lunch",
      },
    ],
    tests: [
      "Fasting Blood Glucose (FBG) - Target: 5.5 - 6.5 mmol/L",
      "Glycated Hemoglobin (HbA1c) - Target: < 7.0%",
      "Serum Creatinine & eGFR",
      "Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)",
    ],
    advice: "Low-sodium diet (< 2g/day). 30 minutes daily moderate aerobic brisk walking. Avoid processed sugar and carbonated beverages.",
    follow_up: "14 January 2027 (After 3 months) with fresh HbA1c & Creatinine reports",
  },
  {
    id: "v-002",
    patient_id: "user-001",
    doctor_name: "Dr. Kamrul Hasan, MD, FACC",
    department: "Department of Clinical Cardiology",
    hospital_name: "National Heart Foundation Hospital & Research Institute",
    location: "Plot-4, Section-2, Mirpur, Dhaka 1216",
    visit_date: "2026-09-05",
    diagnosis: "Stage-1 Primary Essential Hypertension - Well Controlled",
    prescription_summary: "Continue Amlodipine 5mg. 12-lead ECG confirmed normal sinus rhythm.",
    notes: "Cardiac auscultation normal S1/S2, no murmurs. Pulse regular and symmetric.",
    vitals: {
      bp: "122/82 mmHg",
      pulse: "72 bpm",
      temp: "98.6°F",
      weight: "69.0 kg",
    },
    medications: [
      {
        name: "Amlodipine",
        dosage: "5 mg",
        frequency: "1 + 0 + 0 (Daily Morning)",
        duration: "90 Days",
        instructions: "Take regular morning dose without skipping",
      },
    ],
    tests: [
      "12-Lead Rest Electrocardiogram (ECG)",
      "2D Echocardiography & Color Doppler (Scheduled for next year)",
      "Serum Electrolytes (Na+, K+, Cl-)",
    ],
    advice: "Maintain low-salt DASH diet. Keep home BP logbook twice weekly.",
    follow_up: "05 December 2026 for routine blood pressure surveillance",
  },
  {
    id: "v-003",
    patient_id: "user-001",
    doctor_name: "Dr. Nusrat Jahan, MBBS, MPhil",
    department: "Department of Internal Medicine",
    hospital_name: "Dhaka Medical College Hospital (DMCH)",
    location: "Secretariat Road, Ramna, Dhaka 1000",
    visit_date: "2026-07-20",
    diagnosis: "Hypovitaminosis D (Serum 25-OH Vitamin D: 18.2 ng/mL)",
    prescription_summary: "Vitamin D3 2000 IU daily oral supplementation. Increase safe sunlight exposure.",
    notes: "Mild bone aches reported in winter. Neurological examination intact.",
    vitals: {
      bp: "118/78 mmHg",
      pulse: "76 bpm",
      temp: "98.2°F",
      weight: "68.0 kg",
    },
    medications: [
      {
        name: "Vitamin D3 (Cholecalciferol)",
        dosage: "2000 IU",
        frequency: "0 + 1 + 0 (After Lunch)",
        duration: "90 Days",
        instructions: "Take with fat-containing meal for better absorption",
      },
    ],
    tests: ["Serum 25-Hydroxy Vitamin D Repeat (after 3 months)"],
    advice: "15-20 minutes mid-day sunlight exposure. Include eggs, fortified milk, and fatty fish in diet.",
    follow_up: "20 October 2026 for Vitamin D repeat evaluation",
  },
];

// Helper: Calculate Age from DOB
export function calculateAge(dobStr?: string): number {
  if (!dobStr) return 0;
  try {
    const dob = new Date(dobStr);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  } catch {
    return 0;
  }
}

// ====== Card Number Generation ======
export function generateCardNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `HP-${year}-${random}`;
}

// ====== Activation State in LocalStorage ======
const ACTIVATION_STORAGE_KEY = "oxpecker_healthpass_active";

export function isHealthPassActivated(patientId?: string): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(`${ACTIVATION_STORAGE_KEY}_${patientId || "current"}`);
  if (stored !== null) {
    return stored === "true";
  }
  // Default to true for demo if not explicitly set to false
  return true;
}

export function setHealthPassActivated(patientId: string, activated: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${ACTIVATION_STORAGE_KEY}_${patientId}`, activated ? "true" : "false");
  localStorage.setItem(ACTIVATION_STORAGE_KEY, activated ? "true" : "false");
  window.dispatchEvent(new Event("healthpass_status_changed"));
}

// ====== API & Search Functions ======

export async function getHealthCard(patientId: string): Promise<HealthPassScanData | null> {
  await new Promise((r) => setTimeout(r, 250));
  const card = INITIAL_HEALTH_CARDS.find((c) => c.patient_id === patientId) || INITIAL_HEALTH_CARDS[0];
  const isAct = isHealthPassActivated(patientId);
  return {
    card: { ...card, is_activated: isAct },
    visits: MOCK_MEDICAL_VISITS,
  };
}

export async function getHealthCardByNumber(cardNumber: string): Promise<HealthPassScanData | null> {
  await new Promise((r) => setTimeout(r, 350));
  const normalized = cardNumber?.trim().toUpperCase();
  const card = INITIAL_HEALTH_CARDS.find((c) => c.card_number.toUpperCase() === normalized) || INITIAL_HEALTH_CARDS[0];
  return {
    card,
    visits: MOCK_MEDICAL_VISITS,
  };
}

// ====== Google-Style Bengali-English Transliteration & Synonym Lexicon ======
export const BENGALI_ENGLISH_SYNONYMS: Record<string, string[]> = {
  // Common patient names
  "রহিম": ["rahim", "rohim"],
  "ফাতেমা": ["fatema", "fatima"],
  "করিম": ["karim", "korim", "abdul karim"],
  "কামাল": ["kamal", "kamal hossain"],
  "জসিম": ["jasim", "jashim", "jasim uddin"],
  "ফারহানা": ["farhana", "farhana chowdhury"],
  "নুসরাত": ["nusrat", "nousrat"],
  "চৌধুরী": ["chowdhury", "choudhury"],
  "উদ্দিন": ["uddin", "uddin"],
  "আহমেদ": ["ahmed", "ahmad"],
  "হোসেন": ["hossain", "hussain", "hasan"],
  "খান": ["khan"],
  "বেগম": ["begum"],

  // Critical Medical Implants & Chronic Conditions
  "পেসমেকার": ["pacemaker", "cardiac pacemaker"],
  "ডায়াবেটিস": ["diabetes", "diabetic", "type-2", "type-1"],
  "প্রেসার": ["pressure", "hypertension", "high bp", "bp"],
  "উচ্চ রক্তচাপ": ["hypertension", "high blood pressure"],
  "অ্যাজমা": ["asthma", "respiratory"],
  "হাঁপানি": ["asthma"],
  "গ্যাস্ট্রিক": ["gastritis", "mild gastritis", "gerd"],
  "হার্ট": ["heart", "cardio", "pacemaker", "cardiac"],
  "অঙ্গদাতা": ["organ donor", "donor"],

  // Severe Drug Allergies (Anaphylaxis Risk)
  "এলার্জি": ["allergy", "allergies", "anaphylaxis"],
  "পেনিসিলিন": ["penicillin"],
  "সালফা": ["sulfa", "sulfonamides"],
  "এসপিরিন": ["aspirin", "nsaid"],
  "বাদাম": ["peanuts", "peanut"],
  "চিংড়ি": ["shrimp", "shellfish"],

  // Geographic Locations
  "ঢাকা": ["dhaka"],
  "ধানমন্ডি": ["dhanmondi"],
  "সিলেট": ["sylhet"],
  "চট্টগ্রাম": ["chattogram", "chittagong"],
  "রাজশাহী": ["rajshahi"],
  "মিরপুর": ["mirpur"],
  "গুলশান": ["gulshan"],
  "উত্তরা": ["uttara"],
};

/**
 * Intelligent Google-Style Multi-Entity Elastic Search Engine
 * Evaluates records across 12 clinical and personal dimensions with relevance scoring.
 */
export function searchHealthCardsGoogleStyle(
  query: string,
  searchType?: string
): ScoredHealthPassCard[] {
  try {
    const rawQ = (query || "").trim().toLowerCase();
    
    // Load dynamically stored cards from localStorage
    let allCards = INITIAL_HEALTH_CARDS;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("oxpecker_healthpass_cards");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allCards = [
              ...parsed,
              ...INITIAL_HEALTH_CARDS.filter((c) => !parsed.some((p: any) => p && p.id === c.id)),
            ];
          }
        }
      } catch {}
    }

    if (!Array.isArray(allCards) || allCards.length === 0) {
      allCards = INITIAL_HEALTH_CARDS;
    }

    // If query is empty, return initial order with baseline score
    if (!rawQ) {
      return allCards.map((card, idx) => ({
        card,
        score: 100 - idx,
        matchReasons: [],
      }));
    }

    // Tokenize query into search terms
    const tokens = rawQ
      .split(/[\s,+/]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    // Expand tokens with transliterations & synonyms
    const expandedTokens = new Set<string>();
    for (const t of tokens) {
      expandedTokens.add(t);
      const cleanT = t.replace(/[- ]/g, "");
      if (cleanT) expandedTokens.add(cleanT);

      // Check Bengali -> English synonyms
      if (BENGALI_ENGLISH_SYNONYMS[t]) {
        for (const syn of BENGALI_ENGLISH_SYNONYMS[t]) {
          expandedTokens.add(syn);
        }
      }

      // Check reverse English -> Bengali synonyms
      for (const [bnKey, enList] of Object.entries(BENGALI_ENGLISH_SYNONYMS)) {
        if (enList.some((en) => en.includes(t) || t.includes(en))) {
          expandedTokens.add(bnKey);
        }
      }
    }

    const tokenList = Array.from(expandedTokens);

    const scoredResults: ScoredHealthPassCard[] = [];

    for (const card of allCards) {
      if (!card) continue;

      let score = 0;
      const reasons: SearchMatchReason[] = [];

      const cleanNid = (card.nid_number || "").replace(/[- ]/g, "").toLowerCase();
      const cleanBirthCert = (card.birth_cert_number || "").replace(/[- ]/g, "").toLowerCase();
      const cleanCardNo = (card.card_number || "").replace(/[- ]/g, "").toLowerCase();
      const cleanUid = (card.smart_card_uid || "").replace(/[- ]/g, "").toLowerCase();
      const cleanPersonalPhone = (card.personal_phone || "").replace(/[- ]/g, "").toLowerCase();
      const cleanEmergencyPhone = (card.emergency_contact_phone || "").replace(/[- ]/g, "").toLowerCase();

      const nameBn = (card.patient_name || "").toLowerCase();
      const nameEn = (card.english_name || "").toLowerCase();
      const blood = (card.blood_group || "").toLowerCase();
      const zila = (card.zila || "").toLowerCase();
      const upazila = (card.upazila || "").toLowerCase();
      const address = (card.address || "").toLowerCase();
      const guardianName = (card.emergency_contact_name || "").toLowerCase();
      const guardianRel = (card.emergency_contact_relation || "").toLowerCase();

      const cleanRawQ = rawQ.replace(/[- ]/g, "");

      // 1. Exact Unique Identifier Matches (Top Priority: 1000 pts)
      if (cleanNid && (cleanNid === cleanRawQ || cleanNid.includes(cleanRawQ))) {
        score += 1000;
        reasons.push({ field: "nid", label: `NID: ${card.nid_number}`, score: 1000 });
      } else if (cleanCardNo && (cleanCardNo === cleanRawQ || cleanCardNo.includes(cleanRawQ))) {
        score += 900;
        reasons.push({ field: "card_no", label: `Card: ${card.card_number}`, score: 900 });
      } else if (cleanUid && (cleanUid === cleanRawQ || cleanUid.includes(cleanRawQ))) {
        score += 900;
        reasons.push({ field: "card_no", label: `EMV UID: ${card.smart_card_uid}`, score: 900 });
      }

      // 2. Exact Phone / Parent Number Match (800 pts)
      if (cleanPersonalPhone && cleanPersonalPhone.includes(cleanRawQ)) {
        score += 800;
        reasons.push({ field: "phone", label: `Phone: ${card.personal_phone}`, score: 800 });
      }
      if (cleanEmergencyPhone && cleanEmergencyPhone.includes(cleanRawQ)) {
        score += 850;
        reasons.push({
          field: "guardian",
          label: `Parent: ${card.emergency_contact_phone} (${card.emergency_contact_name})`,
          score: 850,
        });
      }

      // 3. Name Match (Exact: 500 pts, Substring/Token: 250 pts)
      if (nameEn === rawQ || nameBn === rawQ) {
        score += 500;
        reasons.push({ field: "name", label: `Exact Name Match: ${card.english_name || card.patient_name}`, score: 500 });
      } else if (nameEn.includes(rawQ) || nameBn.includes(rawQ)) {
        score += 260;
        reasons.push({ field: "name", label: `Name: ${card.english_name || card.patient_name}`, score: 260 });
      } else {
        // Multi-token name check
        for (const t of tokenList) {
          if (t.length >= 2 && (nameEn.includes(t) || nameBn.includes(t))) {
            score += 180;
            reasons.push({ field: "name", label: `Name match: ${t}`, score: 180 });
            break;
          }
        }
      }

      // 4. Critical Medical Device: Pacemaker / Organ Donor (220 pts)
      if (card.has_pacemaker) {
        const pacemakerTerms = ["pacemaker", "cardiac", "heart", "মেশিন", "পেসমেকার"];
        if (pacemakerTerms.some((term) => rawQ.includes(term) || tokenList.includes(term))) {
          score += 280;
          reasons.push({ field: "condition", label: "Pacemaker Active (No MRI)", score: 280 });
        }
      }
      if (card.organ_donor) {
        if (rawQ.includes("donor") || rawQ.includes("organ") || rawQ.includes("অঙ্গ")) {
          score += 200;
          reasons.push({ field: "condition", label: "Registered Organ Donor", score: 200 });
        }
      }

      // 5. Severe Allergies Match (240 pts)
      if (Array.isArray(card.allergies)) {
        for (const allergy of card.allergies) {
          const lowerAllergy = allergy.toLowerCase();
          if (
            rawQ.includes(lowerAllergy) ||
            tokenList.some((t) => t.length >= 3 && lowerAllergy.includes(t)) ||
            (lowerAllergy.includes("penicillin") && (rawQ.includes("penicillin") || rawQ.includes("পেনিসিলিন")))
          ) {
            score += 240;
            reasons.push({ field: "allergy", label: `Severe Allergy: ${allergy}`, score: 240 });
            break;
          }
        }
      }

      // 6. Blood Group Match (Exact match: 180 pts)
      const cleanBloodQ = rawQ.replace(/\s+/g, "").toLowerCase();
      if (blood && (blood === cleanBloodQ || tokenList.includes(blood))) {
        score += 180;
        const donorStatus = blood === "o-" ? "Universal Donor" : blood === "ab+" ? "Universal Recipient" : "Rh Positive";
        reasons.push({ field: "blood_group", label: `Blood Group ${card.blood_group} (${donorStatus})`, score: 180 });
      }

      // 7. Chronic Conditions & Diseases (150 pts)
      if (Array.isArray(card.chronic_conditions)) {
        for (const cond of card.chronic_conditions) {
          const condLower = cond.name.toLowerCase();
          if (tokenList.some((t) => t.length >= 3 && (condLower.includes(t) || t.includes(condLower)))) {
            score += 150;
            reasons.push({ field: "condition", label: `Condition: ${cond.name}`, score: 150 });
            break;
          }
        }
      }

      // 8. Ongoing Medications (130 pts)
      if (Array.isArray(card.current_medications)) {
        for (const med of card.current_medications) {
          const medLower = med.name.toLowerCase();
          if (tokenList.some((t) => t.length >= 3 && medLower.includes(t))) {
            score += 130;
            reasons.push({ field: "medication", label: `Medication: ${med.name} (${med.dosage})`, score: 130 });
            break;
          }
        }
      }

      // 9. Location & Address Match (100 pts)
      for (const t of tokenList) {
        if (t.length >= 3 && (zila.includes(t) || upazila.includes(t) || address.includes(t))) {
          score += 100;
          reasons.push({ field: "location", label: `Location: ${card.zila || card.address}`, score: 100 });
          break;
        }
      }

      // 10. Guardian Contact Name & Relation (95 pts)
      for (const t of tokenList) {
        if (t.length >= 3 && (guardianName.includes(t) || guardianRel.includes(t))) {
          score += 95;
          reasons.push({
            field: "guardian",
            label: `Parent: ${card.emergency_contact_name} (${card.emergency_contact_relation})`,
            score: 95,
          });
          break;
        }
      }

      // Specific filter type constraint check if user chose a specific filter
      if (searchType && searchType !== "all") {
        if (searchType === "nid" && !cleanNid.includes(cleanRawQ)) score = 0;
        if (searchType === "phone" && !cleanPersonalPhone.includes(cleanRawQ) && !cleanEmergencyPhone.includes(cleanRawQ)) score = 0;
        if (searchType === "name" && !nameEn.includes(rawQ) && !nameBn.includes(rawQ)) score = 0;
        if (searchType === "blood_group" && blood !== cleanBloodQ) score = 0;
        if ((searchType === "card" || searchType === "card_no") && !cleanCardNo.includes(cleanRawQ) && !cleanUid.includes(cleanRawQ)) score = 0;
        if (searchType === "dob" && !(card.date_of_birth || "").includes(rawQ)) score = 0;
      }

      if (score > 0) {
        scoredResults.push({
          card,
          score,
          matchReasons: reasons,
        });
      }
    }

    // Sort descending by score (Highest relevance at the top)
    scoredResults.sort((a, b) => b.score - a.score);

    // If query was non-empty but produced 0 matches, return empty array so UI can show no results
    return scoredResults;
  } catch (err) {
    console.warn("searchHealthCardsGoogleStyle error:", err);
    return INITIAL_HEALTH_CARDS.map((card) => ({ card, score: 50, matchReasons: [] }));
  }
}

/**
 * Standard search wrapper: returns HealthPassCard[] with attached matchReasons
 */
export function searchHealthCards(
  query: string,
  searchType?: string
): (HealthPassCard & { _matchReasons?: SearchMatchReason[]; _searchScore?: number })[] {
  const scored = searchHealthCardsGoogleStyle(query, searchType);
  return scored.map((item) => {
    return {
      ...item.card,
      _matchReasons: item.matchReasons,
      _searchScore: item.score,
    };
  });
}

export async function searchHealthCardsAsync(
  query: string, 
  searchType?: "all" | "nid" | "dob" | "phone" | "card" | "card_no" | "name"
): Promise<HealthPassScanData[]> {
  await new Promise((r) => setTimeout(r, 200));
  const cards = searchHealthCards(query, searchType);
  return cards.map((c) => ({ card: c, visits: MOCK_MEDICAL_VISITS }));
}

export async function createHealthCard(data: {
  patientId: string;
  patientName: string;
  bloodGroup: string;
  dob: string;
  gender: string;
  nidNumber?: string;
  birthCertNumber?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  zila?: string;
  postCode?: string;
  allergies?: string[];
  chronicConditions?: { name: string; since: string }[];
}): Promise<HealthPassCard> {
  await new Promise((r) => setTimeout(r, 600));

  const zilaInfo = BANGLADESH_ZILAS.find((z) => z.name === data.zila) || BANGLADESH_ZILAS[0];

  const card: HealthPassCard = {
    ...INITIAL_HEALTH_CARDS[0],
    id: `hp-${Date.now()}`,
    patient_id: data.patientId,
    card_number: generateCardNumber(),
    smart_card_uid: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    patient_name: data.patientName,
    english_name: data.patientName.toUpperCase(),
    date_of_birth: data.dob,
    gender: data.gender,
    blood_group: data.bloodGroup,
    nid_number: data.nidNumber || null,
    birth_cert_number: data.birthCertNumber || null,
    emergency_contact_name: data.emergencyContactName,
    emergency_contact_phone: data.emergencyContactPhone,
    emergency_contact_relation: data.emergencyContactRelation,
    zila: zilaInfo.name,
    division: zilaInfo.division,
    upazila: zilaInfo.defaultUpazila,
    post_code: data.postCode || zilaInfo.postCode,
    last_location_sync: `${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    verification_status: "verified",
    verified_at: new Date().toISOString(),
    is_activated: true,
    activated_at: new Date().toISOString(),
    issued_at: new Date().toISOString(),
    is_active: true,
  };

  setHealthPassActivated(data.patientId, true);
  return card;
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
