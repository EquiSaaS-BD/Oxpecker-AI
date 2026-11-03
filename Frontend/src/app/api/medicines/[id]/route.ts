import { NextResponse } from 'next/server';
import { getMedicineById, getGenericAlternatives, getGenericMonograph, normalizePackageSize } from '@/lib/medicine-catalog';
import { 
  getManufacturerAsset, 
  getMedicinePackaging, 
  getChemicalStructure, 
  getOfficialDosageIcon, 
  fetchLiveMedexBrandData 
} from '@/lib/medicine-brand-assets';

function determineCategory(genericName: string): string {
  const generic = (genericName || '').toLowerCase();
  if (['omeprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole', 'dexlansoprazole', 'famotidine', 'ranitidine', 'antacid'].some(k => generic.includes(k))) return 'Gastric';
  if (['paracetamol', 'ibuprofen', 'diclofenac', 'ketorolac', 'naproxen', 'tramadol', 'mefenamic', 'aceclofenac'].some(k => generic.includes(k))) return 'Painkiller';
  if (['amoxicillin', 'azithromycin', 'cefixime', 'cefuroxime', 'ciprofloxacin', 'ceftriaxone', 'levofloxacin', 'metronidazole', 'doxycycline', 'flucloxacillin', 'meropenem', 'cefadroxil', 'ceftibuten', 'cefpodoxime', 'cefdinir', 'cephradine', 'cefaclor', 'clarithromycin', 'erythromycin', 'clindamycin', 'linezolid', 'vancomycin', 'gentamicin', 'amikacin', 'nitrofurantoin'].some(k => generic.includes(k))) return 'Antibiotic';
  if (['cetirizine', 'fexofenadine', 'loratadine', 'montelukast', 'rupatadine', 'bilastine', 'levocetirizine', 'desloratadine'].some(k => generic.includes(k))) return 'Allergy';
  if (['vitamin', 'calcium', 'zinc', 'ascorbic acid', 'magnesium', 'cholecalciferol', 'iron', 'ferrous', 'folic acid', 'multivitamin', 'cyanocobalamin'].some(k => generic.includes(k))) return 'Vitamins';
  if (['metformin', 'sitagliptin', 'linagliptin', 'glimepiride', 'gliclazide', 'empagliflozin', 'losartan', 'valsartan', 'olmesartan', 'amlodipine', 'bisoprolol', 'atorvastatin', 'rosuvastatin', 'clopidogrel', 'insulin', 'atenolol', 'nebivolol'].some(k => generic.includes(k))) return 'Cardiac';
  return 'Other';
}

function getUseFor(category: string, generic: string, monographIndication?: string): string {
  if (monographIndication && monographIndication.trim() && monographIndication.trim().toLowerCase() !== 'urethritis') {
    return monographIndication.trim();
  }
  switch(category) {
    case 'Gastric': return 'Acidity, Peptic Ulcer & GERD Treatment';
    case 'Painkiller': return 'Fever, Headache & Acute Pain Relief';
    case 'Antibiotic': return 'Bacterial Infections (Respiratory, UTI, Ear, Throat & Typhoid)';
    case 'Allergy': return 'Asthma, Allergic Rhinitis & Urticaria';
    case 'Vitamins': return 'Nutritional & Vitamin Deficiencies';
    case 'Cardiac': return 'Heart Disease, Hypertension & Diabetes Management';
    default: return monographIndication?.trim() || generic || 'General Clinical Treatment';
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

    const monograph = getGenericMonograph(med.generic_name || '');
    const liveBrand = await fetchLiveMedexBrandData(med.id);

    const category = determineCategory(med.generic_name || '');
    const price = Number.isFinite(unitPrice) && unitPrice! > 0 ? unitPrice : (Number.isFinite(packagePrice) && packagePrice! > 0 ? packagePrice : null);
    const priceBasis = Number.isFinite(unitPrice) && unitPrice! > 0 ? 'unit' : (Number.isFinite(packagePrice) && packagePrice! > 0 ? 'package' : null);

    const manufacturerAsset = getManufacturerAsset(med.manufacturer);
    const officialImage = liveBrand.packagingImages[0] || getMedicinePackaging(med.id, med.brand_name);
    const chemicalStructure = liveBrand.chemicalStructure || getChemicalStructure(med.generic_name);
    const officialDosageIcon = liveBrand.dosageIcon || getOfficialDosageIcon(med.dosage_form);

    const mergedMonograph = (monograph || Object.keys(liveBrand.monographEn).length > 0) ? {
      id: monograph?.id || med.id,
      name: monograph?.name || med.generic_name || '',
      slug: monograph?.slug || '',
      monograph_link: monograph?.monograph_link || `https://medex.com.bd/brands/${med.id}`,
      drug_class: liveBrand.monographEn.therapeutic_class || monograph?.drug_class || '',
      therapeutic_class: liveBrand.monographEn.therapeutic_class || monograph?.therapeutic_class || '',
      indication: monograph?.indication || '',
      indication_description: liveBrand.monographEn.indication_description || monograph?.indication_description || '',
      pharmacology: liveBrand.monographEn.pharmacology || monograph?.pharmacology || '',
      dosage: liveBrand.monographEn.dosage || monograph?.dosage || '',
      administration: liveBrand.monographEn.administration || monograph?.administration || '',
      interaction: liveBrand.monographEn.interaction || monograph?.interaction || '',
      contraindications: liveBrand.monographEn.contraindications || monograph?.contraindications || '',
      side_effects: liveBrand.monographEn.side_effects || monograph?.side_effects || '',
      pregnancy_and_lactation: liveBrand.monographEn.pregnancy_and_lactation || monograph?.pregnancy_and_lactation || '',
      precautions: liveBrand.monographEn.precautions || monograph?.precautions || '',
      pediatric_usage: monograph?.pediatric_usage || '',
      overdose_effects: liveBrand.monographEn.overdose_effects || monograph?.overdose_effects || '',
      reconstitution: liveBrand.monographEn.reconstitution || monograph?.reconstitution || '',
      storage_conditions: liveBrand.monographEn.storage_conditions || monograph?.storage_conditions || '',
    } : null;

    const formattedMedicine = {
      id: med.id.toString(),
      name: med.brand_name || 'Unknown',
      brand_name: med.brand_name || 'Unknown',
      generic: med.generic_name || 'Unknown Generic',
      generic_name: med.generic_name || 'Unknown Generic',
      company: med.manufacturer || 'Unknown Manufacturer',
      manufacturer: med.manufacturer || 'Unknown Manufacturer',
      manufacturerAsset,
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
      useFor: getUseFor(category, med.generic_name || '', monograph?.indication),
      image: officialImage,
      officialPackagingImage: officialImage,
      packagingImages: liveBrand.packagingImages,
      officialDosageIcon,
      chemicalStructure,
      monograph: mergedMonograph,
      monographBn: liveBrand.monographBn,
    };

    const rawAlternatives = getGenericAlternatives(med.generic_name || '', med.id, 8);
    const alternatives = rawAlternatives.map(alt => {
      const altUnitMatch = String(alt.package_container || '').match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
      const altUnitPrice = altUnitMatch ? Number(altUnitMatch[1].replace(/,/g, '')) : null;
      const altPkgMatch = String(alt.package_size || '').match(/৳\s*([\d,]+(?:\.\d{1,2})?)/)
        || String(alt.package_container || '').match(/(?:pack|bottle|box|strip)[^৳]*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
      const altPkgPrice = altPkgMatch ? Number(altPkgMatch[1].replace(/,/g, '')) : null;
      return {
        id: alt.id.toString(),
        name: alt.brand_name,
        company: alt.manufacturer,
        strength: alt.strength,
        type: alt.dosage_form,
        price: altUnitPrice || altPkgPrice,
        slug: alt.slug,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedMedicine,
      alternatives,
    });
  } catch (error) {
    console.error('Error fetching medicine details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
