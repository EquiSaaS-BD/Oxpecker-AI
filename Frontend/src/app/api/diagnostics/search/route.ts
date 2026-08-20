import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Types
// ============================================

interface DiagnosticPackage {
  name: string;
  price: number;
  discount: number;
}

interface DiagnosticCentre {
  id: string;
  name: string;
  address: string;
  packages: DiagnosticPackage[];
  homeCollection: boolean;
  rating: number;
  phone: string;
}

// ============================================
// Mock Data - Realistic Bangladeshi Diagnostic Centres
// ============================================

const diagnosticCentres: DiagnosticCentre[] = [
  {
    id: 'diag-001',
    name: 'Popular Diagnostic Centre',
    address: 'House 16, Road 2, Dhanmondi, Dhaka-1205',
    packages: [
      { name: 'Comprehensive Health Checkup', price: 5500, discount: 10 },
      { name: 'Cardiac Profile', price: 3800, discount: 5 },
      { name: 'Diabetes Screening', price: 1500, discount: 0 },
      { name: 'Thyroid Panel (T3, T4, TSH)', price: 2200, discount: 10 },
      { name: 'Complete Blood Count (CBC)', price: 600, discount: 0 },
      { name: 'Liver Function Test (LFT)', price: 2000, discount: 5 },
    ],
    homeCollection: true,
    rating: 4.5,
    phone: '+880-2-9613222',
  },
  {
    id: 'diag-002',
    name: 'Ibn Sina Diagnostic & Imaging Centre',
    address: 'House 48, Road 9/A, Dhanmondi R/A, Dhaka-1209',
    packages: [
      { name: 'Executive Health Screening', price: 8000, discount: 15 },
      { name: 'Renal Function Panel', price: 2500, discount: 5 },
      { name: 'Lipid Profile', price: 1200, discount: 0 },
      { name: 'HbA1c (Glycated Haemoglobin)', price: 900, discount: 0 },
      { name: 'Chest X-Ray (Digital)', price: 800, discount: 0 },
      { name: 'Ultrasonography (Whole Abdomen)', price: 2500, discount: 10 },
    ],
    homeCollection: true,
    rating: 4.4,
    phone: '+880-2-9144001',
  },
  {
    id: 'diag-003',
    name: 'Medinova Medical Services',
    address: 'House 71/A, Road 5/A, Dhanmondi R/A, Dhaka-1209',
    packages: [
      { name: 'Basic Health Checkup', price: 3000, discount: 5 },
      { name: 'Women\'s Health Package', price: 4500, discount: 10 },
      { name: 'Vitamin D Test', price: 2200, discount: 0 },
      { name: 'ECG (Electrocardiogram)', price: 500, discount: 0 },
      { name: 'Urine Routine Examination', price: 300, discount: 0 },
      { name: 'MRI Brain (Without Contrast)', price: 12000, discount: 5 },
    ],
    homeCollection: false,
    rating: 4.3,
    phone: '+880-2-8610792',
  },
  {
    id: 'diag-004',
    name: 'Lab Aid Diagnostic',
    address: 'House 1, Road 4, Dhanmondi, Dhaka-1205',
    packages: [
      { name: 'Fever Profile', price: 2800, discount: 10 },
      { name: 'Dengue NS1 Antigen + IgM/IgG', price: 2000, discount: 5 },
      { name: 'COVID-19 RT-PCR', price: 3500, discount: 0 },
      { name: 'Allergy Panel (30 Allergens)', price: 6000, discount: 15 },
      { name: 'Serum Electrolytes', price: 1000, discount: 0 },
      { name: 'CT Scan (Chest)', price: 8000, discount: 5 },
    ],
    homeCollection: true,
    rating: 4.2,
    phone: '+880-2-9116551',
  },
];

// ============================================
// GET /api/diagnostics/search
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name')?.toLowerCase();
  const q = searchParams.get('q')?.toLowerCase();

  let results = [...diagnosticCentres];

  // Filter by centre name
  if (name) {
    results = results.filter((centre) =>
      centre.name.toLowerCase().includes(name)
    );
  }

  // General search - matches name, address, or package names
  if (q) {
    results = results.filter((centre) => {
      const searchable = [
        centre.name,
        centre.address,
        ...centre.packages.map((pkg) => pkg.name),
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }

  return NextResponse.json(results, { status: 200 });
}
