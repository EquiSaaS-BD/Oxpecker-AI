import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Memory cache for the large database to avoid reading from disk on every request
let cachedMedicines: any[] = [];
let lastModifiedTime: number = 0;

function determineCategory(genericName: string): string {
  const generic = (genericName || '').toLowerCase();
  
  if (['omeprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole', 'dexlansoprazole', 'famotidine', 'ranitidine', 'antacid'].some(k => generic.includes(k))) return 'Gastric';
  
  if (['paracetamol', 'ibuprofen', 'diclofenac', 'ketorolac', 'naproxen', 'tramadol', 'mefenamic', 'aceclofenac'].some(k => generic.includes(k))) return 'Painkiller';
  
  if (['amoxicillin', 'azithromycin', 'cefixime', 'cefuroxime', 'ciprofloxacin', 'ceftriaxone', 'levofloxacin', 'metronidazole', 'doxycycline', 'flucloxacillin', 'meropenem'].some(k => generic.includes(k))) return 'Antibiotic';
  
  if (['cetirizine', 'fexofenadine', 'loratadine', 'montelukast', 'rupatadine', 'bilastine', 'levocetirizine', 'desloratadine'].some(k => generic.includes(k))) return 'Allergy';
  
  if (['vitamin', 'calcium', 'zinc', 'ascorbic acid', 'magnesium', 'cholecalciferol', 'iron', 'ferrous', 'folic acid', 'multivitamin', 'cyanocobalamin'].some(k => generic.includes(k))) return 'Vitamins';
  
  if (['metformin', 'sitagliptin', 'linagliptin', 'glimepiride', 'gliclazide', 'empagliflozin', 'losartan', 'valsartan', 'olmesartan', 'amlodipine', 'bisoprolol', 'atorvastatin', 'rosuvastatin', 'clopidogrel', 'insulin', 'atenolol', 'nebivolol'].some(k => generic.includes(k))) return 'Cardiac';
  
  return 'Other';
}

function extractPrice(packageContainer: string): number {
  if (!packageContainer) return 0;
  const match = packageContainer.match(/৳\s*([\d,\.]+)/);
  if (match && match[1]) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
}

function getUseFor(category: string, generic: string): string {
  switch(category) {
    case 'Gastric': return 'Acidity & Ulcer';
    case 'Painkiller': return 'Fever & Pain Relief';
    case 'Antibiotic': return 'Bacterial Infections';
    case 'Allergy': return 'Asthma & Allergies';
    case 'Vitamins': return 'Nutritional Deficiencies';
    case 'Cardiac': return 'Heart & Pressure';
    default: return generic || 'General Treatment';
  }
}

function loadDatabase() {
  const possiblePaths = [
    path.join(process.cwd(), 'public/data/medicines.json'),
    path.join(process.cwd(), '../organized_medicine_data/organized/medicines.json'),
  ];

  const filePath = possiblePaths.find(p => fs.existsSync(p));
  if (!filePath) {
    console.warn('[Medicine API] No medicines.json found on disk.');
    return cachedMedicines;
  }
  
  try {
    const stats = fs.statSync(filePath);
    // If the file hasn't changed, return cached data
    if (cachedMedicines.length > 0 && stats.mtimeMs === lastModifiedTime) {
      return cachedMedicines;
    }
    
    console.log('[Medicine API] Loading full database into memory...');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Map raw data to the format frontend expects
    cachedMedicines = (data.data || []).map((med: any) => {
      const category = determineCategory(med.generic_name);
      return {
        id: med.id.toString(),
        name: med.brand_name || 'Unknown',
        generic: med.generic_name || 'Unknown Generic',
        company: med.manufacturer || 'Unknown Manufacturer',
        price: extractPrice(med.package_container),
        type: med.dosage_form || 'Tablet',
        category: category,
        useFor: getUseFor(category, med.generic_name),
      };
    });
    
    lastModifiedTime = stats.mtimeMs;
    console.log(`[Medicine API] Loaded ${cachedMedicines.length} medicines successfully.`);
    return cachedMedicines;
  } catch (error) {
    console.error('[Medicine API] Error loading medicines:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'All';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const allMedicines = loadDatabase();
    
    if (allMedicines.length === 0) {
      return NextResponse.json({ error: 'Database not found or empty.' }, { status: 500 });
    }

    // Apply Filters
    let filtered = allMedicines;
    
    if (category !== 'All') {
      filtered = filtered.filter(med => med.category === category);
    }
    
    if (q) {
      filtered = filtered.filter(med => 
        med.name.toLowerCase().includes(q) || 
        med.generic.toLowerCase().includes(q) ||
        med.company.toLowerCase().includes(q)
      );
      
      // Sort by relevance so exact matches (like "Napa") appear before random generic substring matches
      filtered.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aGen = a.generic.toLowerCase();
        const bGen = b.generic.toLowerCase();

        const getScore = (name: string, gen: string) => {
          if (name === q) return 100;
          if (gen === q) return 90;
          if (name.startsWith(q)) return 80;
          if (gen.startsWith(q)) return 70;
          if (name.includes(` ${q}`) || name.includes(`${q} `)) return 60;
          if (gen.includes(` ${q}`) || gen.includes(`${q} `)) return 50;
          return 10;
        };

        const scoreA = getScore(aName, aGen);
        const scoreB = getScore(bName, bGen);

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        
        // Secondary sort by name
        return aName.localeCompare(bName);
      });
    }
    
    // Pagination
    const totalCount = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filtered.slice(startIndex, endIndex);
    
    const hasMore = endIndex < totalCount;

    return NextResponse.json({
      totalCount,
      page,
      limit,
      hasMore,
      data: paginatedResults
    });

  } catch (error) {
    console.error('[Medicine API] Request error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
