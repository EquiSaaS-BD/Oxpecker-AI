import { NextResponse } from 'next/server';
import { getCatalogMedicines, getGenericMonograph, getMedicineSnapshotMetadata, normalizePackageSize } from '@/lib/medicine-catalog';
import { getOfficialDosageIcon, getMedicinePackaging, getManufacturerAsset } from '@/lib/medicine-brand-assets';

// Memory cache for the large database to avoid reading from disk on every request
let cachedMedicines: any[] = [];
let lastGeneratedAt: string | null = null;

function determineCategory(genericName: string, therapeuticClass?: string): string {
  const generic = `${genericName || ''} ${therapeuticClass || ''}`.toLowerCase();
  
  if (['omeprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole', 'dexlansoprazole', 'famotidine', 'ranitidine', 'antacid', 'alginate', 'simethicone', 'sucralfate', 'proton pump', 'ulcer', 'domperidone', 'ondansetron'].some(k => generic.includes(k))) return 'Gastric';
  
  if (['paracetamol', 'ibuprofen', 'diclofenac', 'ketorolac', 'naproxen', 'tramadol', 'mefenamic', 'aceclofenac', 'etoricoxib', 'celecoxib', 'indomethacin', 'aspirin', 'meloxicam', 'analgesic', 'nsaid', 'antipyretic', 'tolfenamic'].some(k => generic.includes(k))) return 'Painkiller';
  
  if (['amoxicillin', 'azithromycin', 'cefixime', 'cefuroxime', 'ciprofloxacin', 'ceftriaxone', 'levofloxacin', 'metronidazole', 'doxycycline', 'flucloxacillin', 'meropenem', 'cefadroxil', 'ceftibuten', 'cefpodoxime', 'cefdinir', 'cephradine', 'cefaclor', 'ceftazidime', 'cefepime', 'clarithromycin', 'erythromycin', 'clindamycin', 'linezolid', 'vancomycin', 'gentamicin', 'amikacin', 'nitrofurantoin', 'cotrimoxazole', 'penicillin', 'ampicillin', 'cephalosporin', 'antibiotic', 'macrolide', 'quinolone', 'tetracycline'].some(k => generic.includes(k))) return 'Antibiotic';
  
  if (['cetirizine', 'fexofenadine', 'loratadine', 'montelukast', 'rupatadine', 'bilastine', 'levocetirizine', 'desloratadine', 'salbutamol', 'budesonide', 'fluticasone', 'doxofylline', 'theophylline', 'aminophylline', 'antihistamine', 'bronchodilator', 'asthma', 'ketotifen', 'ebastine'].some(k => generic.includes(k))) return 'Allergy';
  
  if (['vitamin', 'calcium', 'zinc', 'ascorbic acid', 'magnesium', 'cholecalciferol', 'iron', 'ferrous', 'folic acid', 'multivitamin', 'cyanocobalamin', 'mecobalamin', 'thiamine', 'riboflavin', 'pyridoxine', 'tocopherol', 'calcitriol', 'mineral', 'amino acid'].some(k => generic.includes(k))) return 'Vitamins';
  
  if (['metformin', 'sitagliptin', 'linagliptin', 'glimepiride', 'gliclazide', 'empagliflozin', 'dapagliflozin', 'vildagliptin', 'losartan', 'valsartan', 'olmesartan', 'telmisartan', 'amlodipine', 'cilnidipine', 'bisoprolol', 'atorvastatin', 'rosuvastatin', 'clopidogrel', 'insulin', 'atenolol', 'nebivolol', 'carvedilol', 'ramipril', 'enalapril', 'nitroglycerin', 'trimetazidine', 'statin', 'beta-blocker', 'hypertension'].some(k => generic.includes(k))) return 'Cardiac';
  
  return 'Other';
}

function getUseFor(category: string, generic: string, monographIndication?: string, therapeuticClass?: string): string {
  if (monographIndication && monographIndication.trim()) {
    const cleanInd = monographIndication.trim();
    if (cleanInd.toLowerCase() === 'urethritis' && category === 'Antibiotic') {
      return 'Bacterial Infections';
    }
    if (cleanInd.toLowerCase() !== (generic || '').toLowerCase()) {
      return cleanInd;
    }
  }
  switch(category) {
    case 'Gastric': return 'Acidity & Ulcer';
    case 'Painkiller': return 'Fever & Pain Relief';
    case 'Antibiotic': return 'Bacterial Infections';
    case 'Allergy': return 'Asthma & Allergies';
    case 'Vitamins': return 'Nutritional Deficiencies';
    case 'Cardiac': return 'Heart & Blood Pressure';
    default: return therapeuticClass?.trim() || 'Clinical Prescription Care';
  }
}

function loadDatabase() {
  try {
    const catalog = getCatalogMedicines();
    if (cachedMedicines.length > 0 && catalog.generatedAt === lastGeneratedAt) {
      return cachedMedicines;
    }
    
    // Map raw data to the format frontend expects
    cachedMedicines = (catalog.data || []).map((med: any) => {
      const monograph = getGenericMonograph(med.generic_name || '');
      const category = determineCategory(med.generic_name, monograph?.therapeutic_class || monograph?.drug_class);
      const unitPriceMatch = String(med.package_container || '').match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
      const unitPrice = unitPriceMatch ? Number(unitPriceMatch[1].replace(/,/g, '')) : null;
      const packagePriceMatch = String(med.package_size || '').match(/৳\s*([\d,]+(?:\.\d{1,2})?)/)
        || String(med.package_container || '').match(/(?:pack|bottle|box|strip)[^৳]*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
      const packagePrice = packagePriceMatch ? Number(packagePriceMatch[1].replace(/,/g, '')) : null;
      return {
        id: med.id.toString(),
        name: med.brand_name || 'Unknown',
        generic: med.generic_name || 'Unknown Generic',
        company: med.manufacturer || 'Unknown Manufacturer',
        strength: med.strength || '',
        price: Number.isFinite(unitPrice) && unitPrice! > 0 ? unitPrice : (Number.isFinite(packagePrice) && packagePrice! > 0 ? packagePrice : null),
        priceBasis: Number.isFinite(unitPrice) && unitPrice! > 0 ? 'unit' : (Number.isFinite(packagePrice) && packagePrice! > 0 ? 'package' : null),
        unitPrice: Number.isFinite(unitPrice) && unitPrice! > 0 ? unitPrice : null,
        packagePrice: Number.isFinite(packagePrice) && packagePrice! > 0 ? packagePrice : null,
        packageSize: normalizePackageSize(med.package_size) || null,
        packageContainer: med.package_container || '',
        type: med.dosage_form || 'Tablet',
        drugType: med.type || 'allopathic',
        slug: med.slug || '',
        category: category,
        useFor: getUseFor(category, med.generic_name, monograph?.indication, monograph?.therapeutic_class || monograph?.drug_class),
        indication: monograph?.indication || null,
        indicationDescription: monograph?.indication_description || null,
        drugClass: monograph?.drug_class || monograph?.therapeutic_class || null,
        image: getMedicinePackaging(med.id, med.brand_name) || null,
        dosageIcon: getOfficialDosageIcon(med.dosage_form || med.type || ''),
        manufacturerLogoUrl: getManufacturerAsset(med.manufacturer || '')?.logoUrl || null,
      };
    });
    
    lastGeneratedAt = catalog.generatedAt;
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
        med.company.toLowerCase().includes(q) ||
        (med.useFor && med.useFor.toLowerCase().includes(q))
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
      priceSnapshot: getMedicineSnapshotMetadata(),
      data: paginatedResults
    });
    
  } catch (error) {
    console.error('[Medicine API] Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
