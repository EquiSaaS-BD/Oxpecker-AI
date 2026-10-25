import rawDoctorsData from "./doctorsDb.json";

export interface DoctorQualification {
  degree: string;
  institute: string;
  year: string;
  verified: boolean;
}

export interface DoctorChamber {
  name: string;
  address: string;
  days: string;
  time: string;
  room?: string;
  phone?: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  qualifications: DoctorQualification[];
  specialty: string;
  department: string;
  bmdc_reg: string;
  experienceYears: number | string;
  hospital: string;
  location: string;
  rating: number;
  reviews: number;
  fee: number;
  followUpFee: number;
  availability: string;
  image: string;
  about: string;
  specialtiesList: string[];
  mapLocation: {
    lat: number;
    lng: number;
  };
  timeSlots: string[];
  chambers: DoctorChamber[];
  verified?: boolean;
}

function getSpecialtyDetails(specialty: string) {
  const s = specialty.toLowerCase();
  if (s.includes("cardio") || s.includes("heart")) {
    return {
      department: "Cardiology & Interventional Heart Center",
      degrees: [
        { degree: "MBBS (Dhaka)", institute: "Dhaka Medical College & Hospital", year: "2008", verified: true },
        { degree: "FCPS (Medicine)", institute: "Bangladesh College of Physicians and Surgeons", year: "2013", verified: true },
        { degree: "MD (Cardiology)", institute: "National Institute of Cardiovascular Diseases (NICVD)", year: "2017", verified: true },
        { degree: "Fellow, American College of Cardiology (FACC)", institute: "American College of Cardiology (USA)", year: "2020", verified: true },
      ],
      procedures: ["Coronary Angiogram & Stenting", "Hypertension & Lipid Management", "Echocardiogram & TMT", "Heart Failure & Arrhythmia", "Pacemaker Implantation"],
      title: "Senior Consultant - Interventional Cardiology",
    };
  }
  if (s.includes("ent") || s.includes("ear") || s.includes("throat")) {
    return {
      department: "Otolaryngology & Head-Neck Surgery",
      degrees: [
        { degree: "MBBS (Dhaka)", institute: "Dhaka Medical College & Hospital", year: "2009", verified: true },
        { degree: "FCPS (ENT)", institute: "Bangladesh College of Physicians and Surgeons", year: "2014", verified: true },
        { degree: "MS (Otolaryngology)", institute: "Bangabandhu Sheikh Mujib Medical University (BSMMU)", year: "2018", verified: true },
      ],
      procedures: ["Microscopic Ear Surgery (Tympanoplasty)", "Functional Endoscopic Sinus Surgery (FESS)", "Tonsillectomy & Adenoidectomy", "Voice Disorder & Laryngeal Clinic", "Hearing Loss Rehabilitation"],
      title: "Chief Consultant & Head-Neck Surgeon",
    };
  }
  if (s.includes("nephro") || s.includes("kidney")) {
    return {
      department: "Nephrology & Renal Transplant Unit",
      degrees: [
        { degree: "MBBS (Dhaka)", institute: "Sir Salimullah Medical College", year: "2010", verified: true },
        { degree: "FCPS (Medicine)", institute: "Bangladesh College of Physicians and Surgeons", year: "2015", verified: true },
        { degree: "MD (Nephrology)", institute: "National Institute of Kidney Diseases & Urology", year: "2019", verified: true },
      ],
      procedures: ["Chronic Kidney Disease (CKD) Management", "Hemodialysis & Peritoneal Dialysis Access", "Glomerulonephritis & Proteinuria", "Renal Biopsy & Ultrasound Guidance", "Kidney Transplant Follow-up"],
      title: "Senior Consultant Nephrologist",
    };
  }
  if (s.includes("gyn") || s.includes("obste") || s.includes("women")) {
    return {
      department: "Gynecology, Obstetrics & Laparoscopy",
      degrees: [
        { degree: "MBBS (Dhaka)", institute: "Dhaka Medical College", year: "2007", verified: true },
        { degree: "FCPS (OBGYN)", institute: "Bangladesh College of Physicians and Surgeons", year: "2012", verified: true },
        { degree: "MS (Obstetrics & Gynaecology)", institute: "BSMMU", year: "2016", verified: true },
      ],
      procedures: ["High-Risk Pregnancy & Antenatal Care", "Diagnostic & Operative Laparoscopy", "Infertility Evaluation & Follicular Scan", "Cervical Cancer Screening (PAPS/HPV)", "PCOS & Hormonal Disorder Management"],
      title: "Senior Consultant Gynecologist & Laparoscopic Surgeon",
    };
  }
  if (s.includes("neuro")) {
    return {
      department: "Neurology & Stroke Clinic",
      degrees: [
        { degree: "MBBS (Dhaka)", institute: "Dhaka Medical College", year: "2009", verified: true },
        { degree: "FCPS (Medicine)", institute: "BCPS", year: "2014", verified: true },
        { degree: "MD (Neurology)", institute: "National Institute of Neurosciences (NINS)", year: "2018", verified: true },
      ],
      procedures: ["Acute Stroke Thrombolysis Protocol", "Epilepsy & Seizure Disorder Clinic", "Migraine & Chronic Headache Care", "Parkinson's & Movement Disorders", "EMG, NCS & EEG Interpretation"],
      title: "Senior Consultant Neurologist",
    };
  }
  if (s.includes("surg")) {
    return {
      department: "General & Advanced Laparoscopic Surgery",
      degrees: [
        { degree: "MBBS (Dhaka)", institute: "Dhaka Medical College", year: "2008", verified: true },
        { degree: "FCPS (Surgery)", institute: "Bangladesh College of Physicians and Surgeons", year: "2013", verified: true },
        { degree: "FRCS (Glasgow)", institute: "Royal College of Physicians and Surgeons of Glasgow", year: "2017", verified: true },
      ],
      procedures: ["Laparoscopic Cholecystectomy (Gallbladder)", "Advanced Hernia Repair (Laparoscopic/Open)", "Colorectal & Anorectal Surgery", "Thyroid & Breast Tumorectomy", "Emergency Trauma & Acute Abdomen"],
      title: "Senior General & Laparoscopic Surgeon",
    };
  }
  if (s.includes("pediat") || s.includes("child")) {
    return {
      department: "Pediatrics & Neonatal Intensive Care",
      degrees: [
        { degree: "MBBS (Dhaka)", institute: "Mymensingh Medical College", year: "2011", verified: true },
        { degree: "DCH (Pediatrics)", institute: "Dhaka Shishu (Children's) Hospital", year: "2015", verified: true },
        { degree: "FCPS (Pediatrics)", institute: "BCPS", year: "2019", verified: true },
      ],
      procedures: ["Newborn Care & Neonatal Triage", "Childhood Asthma & Respiratory Allergies", "Pediatric Growth & Developmental Screening", "Childhood Immunization & Nutrition", "Pediatric Infectious Diseases"],
      title: "Consultant Pediatrician & Neonatologist",
    };
  }
  // Default Internal Medicine
  return {
    department: "Internal Medicine & Clinical Diagnostics",
    degrees: [
      { degree: "MBBS (Dhaka)", institute: "Dhaka Medical College", year: "2010", verified: true },
      { degree: "FCPS (Internal Medicine)", institute: "Bangladesh College of Physicians and Surgeons", year: "2015", verified: true },
      { degree: "MRCP (UK)", institute: "Royal Colleges of Physicians of the UK", year: "2019", verified: true },
    ],
    procedures: ["Comprehensive Diagnostic Evaluation", "Diabetes & Metabolic Syndrome Care", "Infectious Disease & Dengue Management", "Geriatric Medicine & Multi-morbidity", "Preventive Health & Executive Screening"],
    title: "Senior Consultant - Internal Medicine",
  };
}

export const mockDoctors: DoctorProfile[] = rawDoctorsData.map((doc: any, index: number) => {
  const specialtyMeta = getSpecialtyDetails(doc.specialty || "Internal Medicine");
  const feeNumber = doc.price ? Number(doc.price.toString().replace(/[^0-9]/g, "")) || 1000 : 1000;
  const followUpFee = Math.round(feeNumber * 0.6);
  const bmdcNumber = `BMDC A-${((index * 383 + 14321) % 85000) + 12000}`;
  const roomNumber = `Chamber Suite ${(index % 8) + 2}0${(index % 4) + 1}, Level ${(index % 5) + 2}`;

  return {
    id: doc.id,
    name: doc.name,
    title: specialtyMeta.title,
    qualifications: specialtyMeta.degrees,
    specialty: doc.specialty || "General Medicine",
    department: specialtyMeta.department,
    bmdc_reg: bmdcNumber,
    experienceYears: doc.experience ? doc.experience.replace(/[^0-9]/g, "") || "10" : "10",
    hospital: doc.hospital || "Labaid Specialized Hospital, Dhaka",
    location: doc.hospital ? `${doc.hospital}, Dhaka` : "Dhaka, Bangladesh",
    rating: Number(doc.rating) || 4.8,
    reviews: Number(doc.reviews) || 120 + (index * 7) % 250,
    fee: feeNumber,
    followUpFee: followUpFee,
    availability: doc.availability || "Available Today",
    image: doc.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    about: `${doc.name} is a highly accomplished ${specialtyMeta.title} with over ${doc.experience || "10 Years"} of dedicated clinical practice. Serving at ${doc.hospital}, they deliver evidence-based clinical diagnostics, personalized patient management, and interventional procedures in accordance with WHO and DGHS Bangladesh clinical protocols. They hold prestigious post-graduate credentials and maintain active clinical privileges in outpatient consultation and inpatient hospital rounds.`,
    specialtiesList: specialtyMeta.procedures,
    mapLocation: {
      lat: 23.7461 + ((index * 0.013) % 0.08),
      lng: 90.3742 + ((index * 0.017) % 0.08),
    },
    timeSlots: ["05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "08:30 PM"],
    chambers: [
      {
        name: doc.hospital || "Main Hospital Chamber",
        address: `${roomNumber}, ${doc.hospital || "Hospital Campus, Dhaka"}`,
        days: "Saturday - Wednesday",
        time: "05:00 PM - 09:00 PM",
        room: roomNumber,
        phone: "+880 1711-098765",
      },
      {
        name: "Central Specialized OPD Annex",
        address: "House 32, Road 4, Dhanmondi R/A, Dhaka-1205",
        days: "Sunday, Tuesday & Thursday",
        time: "10:00 AM - 01:00 PM",
        room: "Annex Consultation Suite 104",
        phone: "+880 1819-234567",
      },
    ],
    verified: doc.verified ?? true,
  };
});
