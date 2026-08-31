import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Types
// ============================================

interface Hospital {
  id: string;
  name: string;
  address: string;
  specialities: string[];
  hasEmergency: boolean;
  hasICU: boolean;
  hasNICU: boolean;
  bedAvailability: number;
  consultationFee: number;
  rating: number;
  website: string;
  phone: string;
  photoUrl: string;
}

// ============================================
// Mock Data - Realistic Bangladeshi Hospitals
// ============================================

const hospitals: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'Square Hospital',
    address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka-1205',
    specialities: [
      'Cardiology',
      'Neurology',
      'Oncology',
      'Orthopaedics',
      'Gastroenterology',
      'Nephrology',
      'Urology',
      'Gynaecology & Obstetrics',
    ],
    hasEmergency: true,
    hasICU: true,
    hasNICU: true,
    bedAvailability: 42,
    consultationFee: 1500,
    rating: 4.7,
    website: 'https://www.squarehospital.com',
    phone: '+880-2-8159457',
    photoUrl: '/placeholders/hospital-1.jpg',
  },
  {
    id: 'hosp-002',
    name: 'United Hospital',
    address: 'Plot 15, Road 71, Gulshan, Dhaka-1212',
    specialities: [
      'Cardiology',
      'Cardiac Surgery',
      'Neurosurgery',
      'Oncology',
      'Paediatrics',
      'Dermatology',
      'ENT',
      'Ophthalmology',
    ],
    hasEmergency: true,
    hasICU: true,
    hasNICU: true,
    bedAvailability: 35,
    consultationFee: 1500,
    rating: 4.6,
    website: 'https://www.uhlbd.com',
    phone: '+880-2-8836000',
    photoUrl: '/placeholders/hospital-2.jpg',
  },
  {
    id: 'hosp-003',
    name: 'Labaid Specialized Hospital',
    address: 'House 1, Road 4, Dhanmondi, Dhaka-1205',
    specialities: [
      'Medicine',
      'Surgery',
      'Gynaecology & Obstetrics',
      'Paediatrics',
      'Orthopaedics',
      'Cardiology',
      'Gastroenterology',
    ],
    hasEmergency: true,
    hasICU: true,
    hasNICU: false,
    bedAvailability: 18,
    consultationFee: 1000,
    rating: 4.3,
    website: 'https://www.labaidgroup.com',
    phone: '+880-2-9116551',
    photoUrl: '/placeholders/hospital-3.jpg',
  },
  {
    id: 'hosp-004',
    name: 'National Heart Foundation Hospital & Research Institute',
    address: 'Plot 7/2, Section 2, Mirpur, Dhaka-1216',
    specialities: [
      'Cardiology',
      'Cardiac Surgery',
      'Vascular Surgery',
      'Cardiac Rehabilitation',
    ],
    hasEmergency: true,
    hasICU: true,
    hasNICU: false,
    bedAvailability: 12,
    consultationFee: 1000,
    rating: 4.8,
    website: 'https://www.nhf.org.bd',
    phone: '+880-2-9006903',
    photoUrl: '/placeholders/hospital-4.jpg',
  },
  {
    id: 'hosp-005',
    name: 'Evercare Hospital Dhaka',
    address: 'Plot 81, Block E, Bashundhara R/A, Dhaka-1229',
    specialities: [
      'Oncology',
      'Haematology',
      'Nephrology',
      'Liver Transplant',
      'Orthopaedics',
      'Neurology',
      'Cardiology',
      'Urology',
    ],
    hasEmergency: true,
    hasICU: true,
    hasNICU: true,
    bedAvailability: 55,
    consultationFee: 2000,
    rating: 4.5,
    website: 'https://www.evercarebd.com',
    phone: '+880-2-8431661',
    photoUrl: '/placeholders/hospital-5.jpg',
  },
  {
    id: 'hosp-006',
    name: 'Ibn Sina Hospital (Dhanmondi)',
    address: 'House 48, Road 9/A, Dhanmondi R/A, Dhaka-1209',
    specialities: [
      'Medicine',
      'Surgery',
      'Gynaecology & Obstetrics',
      'Paediatrics',
      'Dermatology',
      'ENT',
      'Ophthalmology',
      'Psychiatry',
    ],
    hasEmergency: true,
    hasICU: true,
    hasNICU: false,
    bedAvailability: 8,
    consultationFee: 800,
    rating: 4.2,
    website: 'https://www.ibnsinatrust.com',
    phone: '+880-2-9144001',
    photoUrl: '/placeholders/hospital-6.jpg',
  },
];

// ============================================
// GET /api/hospitals/search
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const speciality = searchParams.get('speciality')?.toLowerCase();
  const name = searchParams.get('name')?.toLowerCase();
  const q = searchParams.get('q')?.toLowerCase();
  const emergency = searchParams.get('emergency');
  const icu = searchParams.get('icu');

  let results = [...hospitals];

  // Filter by speciality
  if (speciality) {
    results = results.filter((hosp) =>
      hosp.specialities.some((s) => s.toLowerCase().includes(speciality))
    );
  }

  // Filter by name
  if (name) {
    results = results.filter((hosp) =>
      hosp.name.toLowerCase().includes(name)
    );
  }

  // Filter by emergency availability
  if (emergency === 'true') {
    results = results.filter((hosp) => hosp.hasEmergency);
  }

  // Filter by ICU availability
  if (icu === 'true') {
    results = results.filter((hosp) => hosp.hasICU);
  }

  // General search - matches name, address, or specialities
  if (q) {
    results = results.filter((hosp) => {
      const searchable = [
        hosp.name,
        hosp.address,
        ...hosp.specialities,
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }

  return NextResponse.json(results, { status: 200 });
}
