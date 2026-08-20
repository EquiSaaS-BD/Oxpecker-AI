import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Types
// ============================================

interface Doctor {
  id: string;
  name: string;
  degree: string;
  speciality: string;
  experience: number;
  hospital: string;
  consultationFee: number;
  languages: string[];
  location: string;
  rating: number;
  reviewCount: number;
  photoUrl: string;
  videoConsult: boolean;
}

// ============================================
// Mock Data - Realistic Bangladeshi Doctors
// ============================================

const doctors: Doctor[] = [
  {
    id: 'doc-001',
    name: 'Prof. Dr. Md. Rafiqul Islam',
    degree: 'MBBS, FCPS (Medicine), MD (Cardiology)',
    speciality: 'Cardiology',
    experience: 22,
    hospital: 'National Heart Foundation Hospital & Research Institute',
    consultationFee: 1500,
    languages: ['Bangla', 'English'],
    location: 'Mirpur, Dhaka',
    rating: 4.8,
    reviewCount: 342,
    photoUrl: '/placeholders/doctor-male-1.jpg',
    videoConsult: true,
  },
  {
    id: 'doc-002',
    name: 'Dr. Farzana Akter',
    degree: 'MBBS, BCS (Health), FCPS (Gynaecology & Obstetrics)',
    speciality: 'Gynaecology & Obstetrics',
    experience: 14,
    hospital: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    consultationFee: 1200,
    languages: ['Bangla', 'English'],
    location: 'Shahbag, Dhaka',
    rating: 4.7,
    reviewCount: 287,
    photoUrl: '/placeholders/doctor-female-1.jpg',
    videoConsult: true,
  },
  {
    id: 'doc-003',
    name: 'Dr. Tanvir Hossain',
    degree: 'MBBS, MS (Orthopaedics)',
    speciality: 'Orthopaedics',
    experience: 10,
    hospital: 'National Institute of Traumatology & Orthopaedic Rehabilitation (NITOR)',
    consultationFee: 1000,
    languages: ['Bangla', 'English', 'Hindi'],
    location: 'Sher-e-Bangla Nagar, Dhaka',
    rating: 4.5,
    reviewCount: 198,
    photoUrl: '/placeholders/doctor-male-2.jpg',
    videoConsult: false,
  },
  {
    id: 'doc-004',
    name: 'Prof. Dr. Salma Begum',
    degree: 'MBBS, FCPS (Paediatrics), FRCP (Edinburgh)',
    speciality: 'Paediatrics',
    experience: 25,
    hospital: 'Dhaka Shishu (Children) Hospital',
    consultationFee: 1500,
    languages: ['Bangla', 'English'],
    location: 'Sher-e-Bangla Nagar, Dhaka',
    rating: 4.9,
    reviewCount: 510,
    photoUrl: '/placeholders/doctor-female-2.jpg',
    videoConsult: true,
  },
  {
    id: 'doc-005',
    name: 'Dr. Abul Kalam Azad',
    degree: 'MBBS, FCPS (Dermatology & Venereology)',
    speciality: 'Dermatology',
    experience: 12,
    hospital: 'Square Hospital',
    consultationFee: 1200,
    languages: ['Bangla', 'English'],
    location: 'Panthapath, Dhaka',
    rating: 4.6,
    reviewCount: 215,
    photoUrl: '/placeholders/doctor-male-3.jpg',
    videoConsult: true,
  },
  {
    id: 'doc-006',
    name: 'Dr. Nazmul Haque',
    degree: 'MBBS, MD (Neurology)',
    speciality: 'Neurology',
    experience: 16,
    hospital: 'National Institute of Neurosciences & Hospital',
    consultationFee: 1300,
    languages: ['Bangla', 'English'],
    location: 'Agargaon, Dhaka',
    rating: 4.7,
    reviewCount: 178,
    photoUrl: '/placeholders/doctor-male-4.jpg',
    videoConsult: false,
  },
  {
    id: 'doc-007',
    name: 'Dr. Hasina Akhter',
    degree: 'MBBS, BCS (Health), FCPS (Medicine), MD (Gastroenterology)',
    speciality: 'Gastroenterology',
    experience: 18,
    hospital: 'United Hospital',
    consultationFee: 1500,
    languages: ['Bangla', 'English'],
    location: 'Gulshan, Dhaka',
    rating: 4.8,
    reviewCount: 264,
    photoUrl: '/placeholders/doctor-female-3.jpg',
    videoConsult: true,
  },
  {
    id: 'doc-008',
    name: 'Dr. Shahriar Kabir',
    degree: 'MBBS, FCPS (ENT)',
    speciality: 'ENT (Ear, Nose & Throat)',
    experience: 9,
    hospital: 'Labaid Specialized Hospital',
    consultationFee: 800,
    languages: ['Bangla', 'English', 'Urdu'],
    location: 'Dhanmondi, Dhaka',
    rating: 4.4,
    reviewCount: 132,
    photoUrl: '/placeholders/doctor-male-5.jpg',
    videoConsult: true,
  },
];

// ============================================
// GET /api/doctors/search
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const speciality = searchParams.get('speciality')?.toLowerCase();
  const name = searchParams.get('name')?.toLowerCase();
  const location = searchParams.get('location')?.toLowerCase();
  const q = searchParams.get('q')?.toLowerCase();

  let results = [...doctors];

  // Filter by speciality
  if (speciality) {
    results = results.filter((doc) =>
      doc.speciality.toLowerCase().includes(speciality)
    );
  }

  // Filter by name
  if (name) {
    results = results.filter((doc) =>
      doc.name.toLowerCase().includes(name)
    );
  }

  // Filter by location
  if (location) {
    results = results.filter((doc) =>
      doc.location.toLowerCase().includes(location)
    );
  }

  // General search - matches name, speciality, hospital, or location
  if (q) {
    results = results.filter((doc) => {
      const searchable = [
        doc.name,
        doc.speciality,
        doc.hospital,
        doc.location,
        doc.degree,
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }

  return NextResponse.json(results, { status: 200 });
}
