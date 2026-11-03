import { NextResponse } from 'next/server';
import { getMedicineById, getGenericAlternatives, normalizePackageSize } from '@/lib/medicine-catalog';

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

function getUseFor(category: string, generic: string): string {
  switch(category) {
    case 'Gastric': return 'Acidity & Ulcer Treatment';
    case 'Painkiller': return 'Fever & Pain Relief';
    case 'Antibiotic': return 'Bacterial Infections';
    case 'Allergy': return 'Asthma & Allergies';
    case 'Vitamins': return 'Nutritional Deficiencies';
    case 'Cardiac': return 'Heart & Blood Pressure Management';
    default: return generic || 'General Clinical Treatment';
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const med = getMedicineById(id);

    if (!med) {
      return NextResponse.json({ error: 'Medicine not found in national database' }, { status: 404 });
    }

    const unitPriceMatch = String(med.package_container || '').match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
    const unitPrice = unitPriceMatch ? Number(unitPriceMatch[1].replace(/,/g, '')) : null;
    const packagePriceMatch = String(med.package_size || '').match(/৳\s*([\d,]+(?:\.\d{1,2})?)/)
      || String(med.package_container || '').match(/(?:pack|bottle|box|strip)[^৳]*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
    const packagePrice = packagePriceMatch ? Number(packagePriceMatch[1].replace(/,/g, '')) : null;

    const category = determineCategory(med.generic_name || '');
    const price = Number.isFinite(unitPrice) && unitPrice! > 0 ? unitPrice : (Number.isFinite(packagePrice) && packagePrice! > 0 ? packagePrice : null);
    const priceBasis = Number.isFinite(unitPrice) && unitPrice! > 0 ? 'unit' : (Number.isFinite(packagePrice) && packagePrice! > 0 ? 'package' : null);

    const formattedMedicine = {
      id: med.id.toString(),
      name: med.brand_name || 'Unknown',
      brand_name: med.brand_name || 'Unknown',
      generic: med.generic_name || 'Unknown Generic',
      generic_name: med.generic_name || 'Unknown Generic',
      company: med.manufacturer || 'Unknown Manufacturer',
      manufacturer: med.manufacturer || 'Unknown Manufacturer',
      strength: med.strength || '',
      price,
      priceBasis,
      unitPrice,
      packagePrice,
      packageSize: normalizePackageSize(med.package_size) || null,
      packageContainer: med.package_container || '',
      type: med.dosage_form || 'Tablet',
      dosage_form: med.dosage_form || 'Tablet',
      drugType: med.type || 'allopathic',
      slug: med.slug || '',
      category,
      useFor: getUseFor(category, med.generic_name || ''),
    };

    // Find authentic generic alternatives from the same database
    const rawAlternatives = getGenericAlternatives(med.generic_name || '', med.id, 6);
    const alternatives = rawAlternatives.map(alt => {
      const altUnitMatch = String(alt.package_container || '').match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
      const altUnitPrice = altUnitMatch ? Number(altUnitMatch[1].replace(/,/g, '')) : null;
      return {
        id: alt.id.toString(),
        name: alt.brand_name,
        company: alt.manufacturer,
        strength: alt.strength,
        type: alt.dosage_form,
        price: altUnitPrice,
        slug: alt.slug,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedMedicine,
      alternatives
    });

  } catch (error) {
    console.error('[Medicine Detail API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
