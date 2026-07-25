import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Types
// ============================================

interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  strength: string;
  price: number;
  availability: 'In Stock' | 'Limited' | 'Out of Stock';
  category: string;
  dosageForm: string;
  warnings: string[];
  alternatives: string[];
}

// ============================================
// Mock Data — Common Bangladeshi Medicines
// ============================================

const medicines: Medicine[] = [
  {
    id: 'med-001',
    brandName: 'Napa',
    genericName: 'Paracetamol',
    manufacturer: 'Beximco Pharmaceuticals',
    strength: '500mg',
    price: 1.2,
    availability: 'In Stock',
    category: 'Analgesic & Antipyretic',
    dosageForm: 'Tablet',
    warnings: [
      'Do not exceed 4g (8 tablets) in 24 hours',
      'Avoid with liver disease',
      'Consult a doctor if symptoms persist for more than 3 days',
    ],
    alternatives: ['Ace', 'Parol', 'Renova'],
  },
  {
    id: 'med-002',
    brandName: 'Napa Extra',
    genericName: 'Paracetamol + Caffeine',
    manufacturer: 'Beximco Pharmaceuticals',
    strength: '500mg + 65mg',
    price: 2.5,
    availability: 'In Stock',
    category: 'Analgesic & Antipyretic',
    dosageForm: 'Tablet',
    warnings: [
      'Do not exceed 8 tablets in 24 hours',
      'Contains caffeine — avoid excessive tea/coffee',
      'Not recommended during pregnancy without medical advice',
    ],
    alternatives: ['Ace Plus', 'Fast Plus'],
  },
  {
    id: 'med-003',
    brandName: 'Seclo',
    genericName: 'Omeprazole',
    manufacturer: 'Square Pharmaceuticals',
    strength: '20mg',
    price: 6.0,
    availability: 'In Stock',
    category: 'Proton Pump Inhibitor (PPI)',
    dosageForm: 'Capsule',
    warnings: [
      'Take 30 minutes before meals',
      'Long-term use may reduce magnesium levels',
      'Not recommended for more than 8 weeks without doctor supervision',
    ],
    alternatives: ['Losectil', 'Maxpro', 'Sergel'],
  },
  {
    id: 'med-004',
    brandName: 'Omidon',
    genericName: 'Domperidone',
    manufacturer: 'Incepta Pharmaceuticals',
    strength: '10mg',
    price: 3.0,
    availability: 'In Stock',
    category: 'Antiemetic / Prokinetic',
    dosageForm: 'Tablet',
    warnings: [
      'Take 15–30 minutes before meals',
      'Avoid in patients with cardiac conduction disorders',
      'Not recommended for prolonged use',
    ],
    alternatives: ['Motigut', 'Domerin', 'Peridon'],
  },
  {
    id: 'med-005',
    brandName: 'Losectil',
    genericName: 'Omeprazole',
    manufacturer: 'Eskayef Pharmaceuticals',
    strength: '20mg',
    price: 5.5,
    availability: 'In Stock',
    category: 'Proton Pump Inhibitor (PPI)',
    dosageForm: 'Capsule',
    warnings: [
      'Take 30 minutes before meals on an empty stomach',
      'Prolonged use may affect calcium absorption',
      'Report any unusual bleeding or black stools',
    ],
    alternatives: ['Seclo', 'Maxpro', 'Sergel'],
  },
  {
    id: 'med-006',
    brandName: 'Tycil',
    genericName: 'Amoxicillin',
    manufacturer: 'Beximco Pharmaceuticals',
    strength: '500mg',
    price: 6.5,
    availability: 'In Stock',
    category: 'Antibiotic (Penicillin)',
    dosageForm: 'Capsule',
    warnings: [
      'Complete the full course even if symptoms improve',
      'Do not use if allergic to penicillin',
      'May cause diarrhoea — consult doctor if severe',
    ],
    alternatives: ['Moxacil', 'Amoxil', 'Fimoxyl'],
  },
  {
    id: 'med-007',
    brandName: 'Flagyl',
    genericName: 'Metronidazole',
    manufacturer: 'Sanofi Bangladesh',
    strength: '400mg',
    price: 3.5,
    availability: 'In Stock',
    category: 'Antiprotozoal / Antibiotic',
    dosageForm: 'Tablet',
    warnings: [
      'Strictly avoid alcohol during and 48 hours after treatment',
      'May cause metallic taste in mouth',
      'Complete the full prescribed course',
    ],
    alternatives: ['Filmet', 'Amodis', 'Metron'],
  },
  {
    id: 'med-008',
    brandName: 'Maxpro',
    genericName: 'Esomeprazole',
    manufacturer: 'Renata Limited',
    strength: '20mg',
    price: 7.0,
    availability: 'In Stock',
    category: 'Proton Pump Inhibitor (PPI)',
    dosageForm: 'Capsule',
    warnings: [
      'Take at least 1 hour before meals',
      'Not for immediate relief of heartburn',
      'Long-term use requires periodic medical review',
    ],
    alternatives: ['Sergel', 'Seclo', 'Losectil'],
  },
  {
    id: 'med-009',
    brandName: 'Sergel',
    genericName: 'Esomeprazole',
    manufacturer: 'Healthcare Pharmaceuticals',
    strength: '20mg',
    price: 7.5,
    availability: 'In Stock',
    category: 'Proton Pump Inhibitor (PPI)',
    dosageForm: 'Capsule',
    warnings: [
      'Swallow whole — do not crush or chew',
      'Take on an empty stomach',
      'May interact with clopidogrel — inform your doctor',
    ],
    alternatives: ['Maxpro', 'Seclo', 'Losectil'],
  },
  {
    id: 'med-010',
    brandName: 'Ace',
    genericName: 'Paracetamol',
    manufacturer: 'Square Pharmaceuticals',
    strength: '500mg',
    price: 1.0,
    availability: 'In Stock',
    category: 'Analgesic & Antipyretic',
    dosageForm: 'Tablet',
    warnings: [
      'Do not exceed 4g (8 tablets) in 24 hours',
      'Avoid alcohol while taking this medication',
      'Consult a doctor for children under 12',
    ],
    alternatives: ['Napa', 'Parol', 'Renova'],
  },
  {
    id: 'med-011',
    brandName: 'Montelukast',
    genericName: 'Montelukast Sodium',
    manufacturer: 'Incepta Pharmaceuticals',
    strength: '10mg',
    price: 12.0,
    availability: 'In Stock',
    category: 'Leukotriene Receptor Antagonist',
    dosageForm: 'Tablet',
    warnings: [
      'Take in the evening for best results',
      'Not for acute asthma attacks — use rescue inhaler',
      'Report mood changes or unusual behaviour to doctor',
    ],
    alternatives: ['Montair', 'Arokast', 'Lukasm'],
  },
  {
    id: 'med-012',
    brandName: 'Fexo',
    genericName: 'Fexofenadine Hydrochloride',
    manufacturer: 'Square Pharmaceuticals',
    strength: '120mg',
    price: 8.0,
    availability: 'In Stock',
    category: 'Antihistamine',
    dosageForm: 'Tablet',
    warnings: [
      'Does not usually cause drowsiness',
      'Avoid fruit juices (orange, grapefruit) within 2 hours of dose',
      'Safe for long-term seasonal allergy use under medical advice',
    ],
    alternatives: ['Fexofast', 'Telfast', 'Allegra'],
  },
];

// ============================================
// GET /api/medicines/search
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name')?.toLowerCase();
  const generic = searchParams.get('generic')?.toLowerCase();
  const q = searchParams.get('q')?.toLowerCase();

  let results = [...medicines];

  // Filter by brand name
  if (name) {
    results = results.filter((med) =>
      med.brandName.toLowerCase().includes(name)
    );
  }

  // Filter by generic name
  if (generic) {
    results = results.filter((med) =>
      med.genericName.toLowerCase().includes(generic)
    );
  }

  // General search — matches brand name, generic name, manufacturer, or category
  if (q) {
    results = results.filter((med) => {
      const searchable = [
        med.brandName,
        med.genericName,
        med.manufacturer,
        med.category,
        med.dosageForm,
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }

  return NextResponse.json(results, { status: 200 });
}
