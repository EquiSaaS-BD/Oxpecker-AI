import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface FormattedMedicine {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  price: number;
  packageContainer: string;
  formattedName: string;
  category: string;
}

let cachedMedicines: FormattedMedicine[] = [];
let lastModifiedTime: number = 0;

function determineCategory(genericName: string): string {
  const generic = (genericName || '').toLowerCase();
  if (['omeprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole', 'dexlansoprazole', 'famotidine', 'ranitidine', 'antacid'].some(k => generic.includes(k))) return 'Gastric';
  if (['paracetamol', 'ibuprofen', 'diclofenac', 'ketorolac', 'naproxen', 'tramadol', 'mefenamic', 'aceclofenac'].some(k => generic.includes(k))) return 'Painkiller';
  if (['amoxicillin', 'azithromycin', 'cefixime', 'cefuroxime', 'ciprofloxacin', 'ceftriaxone', 'levofloxacin', 'metronidazole', 'doxycycline', 'flucloxacillin', 'meropenem'].some(k => generic.includes(k))) return 'Antibiotic';
  if (['cetirizine', 'fexofenadine', 'loratadine', 'montelukast', 'rupatadine', 'bilastine', 'levocetirizine', 'desloratadine'].some(k => generic.includes(k))) return 'Allergy';
  if (['vitamin', 'calcium', 'zinc', 'ascorbic acid', 'magnesium', 'cholecalciferol', 'iron', 'ferrous', 'folic acid', 'multivitamin', 'cyanocobalamin'].some(k => generic.includes(k))) return 'Vitamins';
  if (['metformin', 'sitagliptin', 'linagliptin', 'glimepiride', 'gliclazide', 'empagliflozin', 'losartan', 'valsartan', 'olmesartan', 'amlodipine', 'bisoprolol', 'atorvastatin', 'rosuvastatin', 'clopidogrel', 'insulin', 'atenolol', 'nebivolol'].some(k => generic.includes(k))) return 'Cardiac';
  return 'General';
}

function extractPrice(packageContainer: string): number {
  if (!packageContainer) return 0;
  const match = packageContainer.match(/৳\s*([\d,\.]+)/);
  if (match && match[1]) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
}

function getDosagePrefix(dosageForm: string): string {
  const df = (dosageForm || '').toLowerCase();
  if (df.includes('tablet')) return 'Tab.';
  if (df.includes('capsule')) return 'Cap.';
  if (df.includes('syrup')) return 'Syr.';
  if (df.includes('suspension')) return 'Susp.';
  if (df.includes('injection') || df.includes('infusion')) return 'Inj.';
  if (df.includes('drop') || df.includes('ophthalmic') || df.includes('eye')) return 'Drop';
  if (df.includes('cream') || df.includes('ointment')) return 'Oint.';
  if (df.includes('inhaler')) return 'Inh.';
  if (df.includes('suppository')) return 'Supp.';
  return dosageForm || 'Med.';
}

function getDatabasePath(): string {
  const candidates = [
    path.join(process.cwd(), '../organized_medicine_data/organized/medicines.json'),
    path.join(process.cwd(), 'organized_medicine_data/organized/medicines.json'),
    path.join(process.cwd(), '../../organized_medicine_data/organized/medicines.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

function loadDatabase(): FormattedMedicine[] {
  const filePath = getDatabasePath();
  try {
    if (!fs.existsSync(filePath)) {
      console.warn('[Medicine Search API] Database file not found at:', filePath);
      return [];
    }
    const stats = fs.statSync(filePath);
    if (cachedMedicines.length > 0 && stats.mtimeMs === lastModifiedTime) {
      return cachedMedicines;
    }
    
    console.log('[Medicine Search API] Loading full database of 21,700+ medicines...');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    cachedMedicines = (data.data || []).map((med: any) => {
      const brand = med.brand_name || 'Unknown';
      const generic = med.generic_name || 'Unknown Generic';
      const strength = (med.strength || '').trim();
      const dosageForm = med.dosage_form || 'Tablet';
      const prefix = getDosagePrefix(dosageForm);
      const formattedName = strength ? `${prefix} ${brand} ${strength}` : `${prefix} ${brand}`;
      
      return {
        id: med.id?.toString() || Math.random().toString(),
        brandName: brand,
        genericName: generic,
        manufacturer: med.manufacturer || 'Unknown',
        dosageForm: dosageForm,
        strength: strength,
        price: extractPrice(med.package_container || ''),
        packageContainer: med.package_container || '',
        formattedName: formattedName,
        category: determineCategory(generic),
      };
    });
    
    lastModifiedTime = stats.mtimeMs;
    console.log(`[Medicine Search API] Successfully loaded ${cachedMedicines.length} medicines.`);
    return cachedMedicines;
  } catch (error) {
    console.error('[Medicine Search API] Error loading database:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || searchParams.get('name') || searchParams.get('generic') || '';
    const q = rawQuery.trim().toLowerCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 50);

    const all = loadDatabase();
    if (!all || all.length === 0) {
      return NextResponse.json({ total: 0, results: [] });
    }

    if (!q) {
      // Return top 15 popular sample medicines
      return NextResponse.json({
        total: all.length,
        results: all.slice(0, limit),
      });
    }

    // Smart scored search
    const scoredResults: { item: FormattedMedicine; score: number }[] = [];

    for (let i = 0; i < all.length; i++) {
      const med = all[i];
      const brandLower = med.brandName.toLowerCase();
      const genericLower = med.genericName.toLowerCase();
      const formattedLower = med.formattedName.toLowerCase();
      const companyLower = med.manufacturer.toLowerCase();

      let score = 0;

      // 1. Exact or prefix match on brand name (Highest Priority)
      if (brandLower === q) {
        score += 2000;
      } else if (brandLower.startsWith(q)) {
        score += 1500 - (brandLower.length - q.length) * 5;
      } else if (formattedLower.startsWith(q)) {
        score += 1300;
      } else if (brandLower.split(/[\s\-+]+/).some(w => w.startsWith(q))) {
        score += 1100;
      } else if (brandLower.includes(q)) {
        score += 800;
      }

      // 2. Generic Name Matches
      if (genericLower === q) {
        score += 1000;
      } else if (genericLower.startsWith(q)) {
        score += 700 - (genericLower.length - q.length) * 3;
      } else if (genericLower.split(/[\s\-+]+/).some(w => w.startsWith(q))) {
        score += 500;
      } else if (genericLower.includes(q)) {
        score += 300;
      }

      // 3. Company Match
      if (companyLower.startsWith(q)) {
        score += 150;
      } else if (companyLower.includes(q)) {
        score += 80;
      }

      if (score > 0) {
        scoredResults.push({ item: med, score });
      }
    }

    // Sort by relevance score descending
    scoredResults.sort((a, b) => b.score - a.score);

    const topResults = scoredResults.slice(0, limit).map(r => r.item);

    return NextResponse.json({
      query: rawQuery,
      total: scoredResults.length,
      results: topResults,
    });

  } catch (error) {
    console.error('[Medicine Search API] Request error:', error);
    return NextResponse.json({ error: 'Failed to search medicines' }, { status: 500 });
  }
}
