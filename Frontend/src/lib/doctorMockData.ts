import { DoctorDashboardStats, DoctorPatient, DoctorAppointment } from "@/types";

export const doctorStats: DoctorDashboardStats = {
  totalPatients: 1247,
  totalPatientsChange: 12.5,
  todayAppointments: 18,
  todayAppointmentsChange: 8.3,
  pendingPrescriptions: 7,
  pendingPrescriptionsChange: -14.2,
  upcomingConsultations: 4,
  upcomingConsultationsChange: 25.0,
};

export const recentPatients: DoctorPatient[] = [
  {
    id: "p001",
    name: "Rahim Uddin",
    age: 45,
    gender: "Male",
    lastVisit: "2026-07-10",
    condition: "Hypertension",
    status: "Stable",
    avatar: "https://i.pravatar.cc/150?u=rahim",
    phone: "+880 1711-XXXXXX",
  },
  {
    id: "p002",
    name: "Fatema Akter",
    age: 32,
    gender: "Female",
    lastVisit: "2026-07-09",
    condition: "Gestational Diabetes",
    status: "Follow-up",
    avatar: "https://i.pravatar.cc/150?u=fatema",
    phone: "+880 1812-XXXXXX",
  },
  {
    id: "p003",
    name: "Kamal Hossain",
    age: 58,
    gender: "Male",
    lastVisit: "2026-07-10",
    condition: "Acute Chest Pain",
    status: "Critical",
    avatar: "https://i.pravatar.cc/150?u=kamal",
    phone: "+880 1913-XXXXXX",
  },
  {
    id: "p004",
    name: "Nasreen Sultana",
    age: 28,
    gender: "Female",
    lastVisit: "2026-07-08",
    condition: "Migraine",
    status: "Stable",
    avatar: "https://i.pravatar.cc/150?u=nasreen",
    phone: "+880 1614-XXXXXX",
  },
  {
    id: "p005",
    name: "Abdul Matin",
    age: 67,
    gender: "Male",
    lastVisit: "2026-07-10",
    condition: "Type 2 Diabetes",
    status: "Follow-up",
    avatar: "https://i.pravatar.cc/150?u=matin",
    phone: "+880 1515-XXXXXX",
  },
  {
    id: "p006",
    name: "Tahmina Rahman",
    age: 22,
    gender: "Female",
    lastVisit: "2026-07-10",
    condition: "Seasonal Allergies",
    status: "New",
    avatar: "https://i.pravatar.cc/150?u=tahmina",
    phone: "+880 1716-XXXXXX",
  },
];

export const todayAppointments: DoctorAppointment[] = [
  {
    id: "a001",
    patientName: "Rahim Uddin",
    patientAvatar: "https://i.pravatar.cc/150?u=rahim",
    time: "09:00 AM",
    date: "2026-07-10",
    type: "Offline",
    status: "Completed",
    condition: "Blood Pressure Check",
  },
  {
    id: "a002",
    patientName: "Fatema Akter",
    patientAvatar: "https://i.pravatar.cc/150?u=fatema",
    time: "10:30 AM",
    date: "2026-07-10",
    type: "Online",
    status: "Completed",
    condition: "Diabetes Follow-up",
  },
  {
    id: "a003",
    patientName: "Kamal Hossain",
    patientAvatar: "https://i.pravatar.cc/150?u=kamal",
    time: "11:45 AM",
    date: "2026-07-10",
    type: "Offline",
    status: "Confirmed",
    condition: "Chest Pain Evaluation",
  },
  {
    id: "a004",
    patientName: "Nasreen Sultana",
    patientAvatar: "https://i.pravatar.cc/150?u=nasreen",
    time: "02:00 PM",
    date: "2026-07-10",
    type: "Online",
    status: "Confirmed",
    condition: "Migraine Consultation",
  },
  {
    id: "a005",
    patientName: "Abdul Matin",
    patientAvatar: "https://i.pravatar.cc/150?u=matin",
    time: "03:30 PM",
    date: "2026-07-10",
    type: "Offline",
    status: "Pending",
    condition: "Routine Check-up",
  },
];

export const upcomingAppointments: DoctorAppointment[] = [
  {
    id: "a006",
    patientName: "Tahmina Rahman",
    patientAvatar: "https://i.pravatar.cc/150?u=tahmina",
    time: "09:30 AM",
    date: "2026-07-11",
    type: "Offline",
    status: "Confirmed",
    condition: "Allergy Assessment",
  },
  {
    id: "a007",
    patientName: "Jahangir Alam",
    patientAvatar: "https://i.pravatar.cc/150?u=jahangir",
    time: "11:00 AM",
    date: "2026-07-11",
    type: "Online",
    status: "Pending",
    condition: "Post-operative Review",
  },
  {
    id: "a008",
    patientName: "Sumaiya Khatun",
    patientAvatar: "https://i.pravatar.cc/150?u=sumaiya",
    time: "04:00 PM",
    date: "2026-07-12",
    type: "Offline",
    status: "Confirmed",
    condition: "Prenatal Check-up",
  },
];

// ====== Settings Mock Data ======

export const mockDoctorProfile = {
  name: "Dr. A.K.M. Fazlul Haque",
  title: "Senior Consultant",
  specialization: "Cardiology",
  languages: ["English", "Bengali"],
  consultationFee: "1200",
  bio: "Dedicated and experienced cardiologist with over 15 years of practice. Specializing in advanced heart failure management, echocardiography, and preventive cardiology. Passionate about delivering patient-centric care and promoting cardiovascular health.",
  yearsExperience: "15+ Years",
  totalPatients: "1,247",
  rating: "4.9",
  reviewCount: 342,
  avatar: "https://i.pravatar.cc/150?u=fazlul"
};

export const mockChambers = [
  {
    id: "c1",
    name: "National Heart Foundation",
    address: "Plot-7, Section-2, Mirpur, Dhaka-1216",
    time: "09:00 AM - 01:00 PM",
    days: ["Sat", "Sun", "Mon", "Wed"]
  },
  {
    id: "c2",
    name: "Square Hospitals Ltd.",
    address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka",
    time: "04:00 PM - 09:00 PM",
    days: ["Tue", "Thu"]
  }
];

export const mockEducation = [
  {
    id: "e1",
    degree: "FRCP (Cardiology)",
    institution: "Royal College of Physicians, London",
    year: "2015",
    status: "Verified"
  },
  {
    id: "e2",
    degree: "MD (Cardiology)",
    institution: "Bangabandhu Sheikh Mujib Medical University (BSMMU)",
    year: "2010",
    status: "Verified"
  },
  {
    id: "e3",
    degree: "MBBS",
    institution: "Dhaka Medical College",
    year: "2005",
    status: "Verified"
  }
];

export const mockPracticeLocations = [
  {
    id: "pl1",
    name: "Labaid Cardiac Hospital",
    address: "House 1, Road 4, Dhanmondi, Dhaka"
  }
];
