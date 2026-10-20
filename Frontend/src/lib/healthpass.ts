import type {
  HealthPassCard,
  MedicalVisit,
  HealthPassScanData,
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

/**
 * Universal Multi-Criteria Search Engine for Doctors, Hospitals, and Admins
 * Searches by NID, DOB, Phone, Card Number, or Patient Name
 */
export function searchHealthCards(
  query: string, 
  searchType?: "all" | "nid" | "dob" | "phone" | "card" | "card_no" | "name"
): HealthPassCard[] {
  try {
    const q = (query || "").trim().toLowerCase().replace(/[- ]/g, "");

    // Load any dynamically created cards from localStorage if in browser
    let allCards = INITIAL_HEALTH_CARDS;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("oxpecker_healthpass_cards");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allCards = [...parsed, ...INITIAL_HEALTH_CARDS.filter(c => !parsed.some((p: any) => p && p.id === c.id))];
          }
        }
      } catch {}
    }

    if (!Array.isArray(allCards) || allCards.length === 0) {
      allCards = INITIAL_HEALTH_CARDS;
    }

    if (!q) {
      return allCards;
    }

    const filtered = allCards.filter((card) => {
      if (!card) return false;
      const cleanNid = (card.nid_number || "").replace(/[- ]/g, "").toLowerCase();
      const cleanBirthCert = (card.birth_cert_number || "").replace(/[- ]/g, "").toLowerCase();
      const cleanPhone = (card.personal_phone || card.emergency_contact_phone || "").replace(/[- ]/g, "").toLowerCase();
      const cleanCardNo = (card.card_number || "").replace(/[- ]/g, "").toLowerCase();
      const cleanDob = (card.date_of_birth || "").toLowerCase();
      const cleanName = (card.patient_name || "").toLowerCase();
      const cleanEngName = (card.english_name || "").toLowerCase();

      const cleanBlood = (card.blood_group || "").toLowerCase();

      if (searchType === "nid") {
        return cleanNid.includes(q) || cleanBirthCert.includes(q);
      }
      if (searchType === "phone") {
        return cleanPhone.includes(q);
      }
      if (searchType === "dob") {
        return cleanDob.includes(q);
      }
      if (searchType === "card" || searchType === "card_no") {
        return cleanCardNo.includes(q);
      }
      if (searchType === "name") {
        return cleanName.includes(q) || cleanEngName.includes(q);
      }
      if (searchType === "blood_group") {
        return cleanBlood === q || cleanBlood.includes(q);
      }

      // Default "all" search:
      return (
        cleanNid.includes(q) ||
        cleanBirthCert.includes(q) ||
        cleanPhone.includes(q) ||
        cleanCardNo.includes(q) ||
        cleanDob.includes(q) ||
        cleanName.includes(q) ||
        cleanEngName.includes(q) ||
        cleanBlood === q ||
        cleanBlood.includes(q)
      );
    });

    return Array.isArray(filtered) ? filtered : allCards;
  } catch (err) {
    console.warn("searchHealthCards error:", err);
    return INITIAL_HEALTH_CARDS;
  }
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
