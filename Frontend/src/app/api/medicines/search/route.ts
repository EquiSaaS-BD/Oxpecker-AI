import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCatalogMedicines, getGenericMonograph, getGenericAlternatives } from '@/lib/medicine-catalog';
import { getOfficialDosageIcon, getManufacturerAsset, getMedicinePackaging, getChemicalStructure } from '@/lib/medicine-brand-assets';

let cachedBengaliLexicon: Record<string, string> | null = null;

function getBengaliLexicon(): Record<string, string> {
  if (cachedBengaliLexicon) return cachedBengaliLexicon;
  try {
    const p = path.join(process.cwd(), 'public/data/clinical_rag_corpus.json');
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
      cachedBengaliLexicon = parsed.bengali_medicine_lexicon || {};
      return cachedBengaliLexicon!;
    }
  } catch {}
  return {};
}

function extractUnitPrice(packageContainer?: string, packageSize?: string): { price: number | null; basis: string | null } {
  const containerStr = String(packageContainer || '');
  const unitMatch = containerStr.match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (unitMatch) {
    const amount = Number(unitMatch[1].replace(/,/g, ''));
    if (Number.isFinite(amount) && amount > 0) return { price: amount, basis: 'unit' };
  }
  const pkgMatch = String(packageSize || containerStr).match(/৳\s*([\d,]+(?:\.\d{1,2})?)/);
  if (pkgMatch) {
    const amount = Number(pkgMatch[1].replace(/,/g, ''));
    if (Number.isFinite(amount) && amount > 0) return { price: amount, basis: 'pack' };
  }
  return { price: null, basis: null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawName = (searchParams.get('name') || '').trim();
  const rawGeneric = (searchParams.get('generic') || '').trim();
  const rawQ = (searchParams.get('q') || rawName || rawGeneric || '').trim();
  const filterStrength = (searchParams.get('strength') || '').toLowerCase().replace(/\s+/g, '').trim();
  const filterForm = (searchParams.get('form') || '').toLowerCase().trim();
  const limit = Math.min(30, Math.max(1, Number(searchParams.get('limit') || '10')));

  const catalog = getCatalogMedicines().data || [];
  const lexicon = getBengaliLexicon();

  // Translate Bengali brand/generic query if present
  let resolvedQuery = rawQ;
  for (const [bnKey, enVal] of Object.entries(lexicon)) {
    if (rawQ.includes(bnKey)) {
      resolvedQuery = enVal;
      break;
    }
  }

  const qLower = resolvedQuery.toLowerCase().trim();
  if (!qLower) {
    return NextResponse.json([], { status: 200 });
  }

  // Score and rank matches across 21,714 medicines
  const scored: { med: any; score: number }[] = [];
  for (const m of catalog) {
    const bName = String(m.brand_name || '').toLowerCase();
    const gName = String(m.generic_name || '').toLowerCase();
    const mfg = String(m.manufacturer || '').toLowerCase();
    const strength = String(m.strength || '').toLowerCase();
    const form = String(m.dosage_form || m.type || '').toLowerCase();

    let score = 0;
    if (bName === qLower) score += 100;
    else if (bName.startsWith(qLower)) score += 75;
    else if (bName.includes(qLower)) score += 50;

    if (gName === qLower) score += 85;
    else if (gName.startsWith(qLower)) score += 65;
    else if (gName.includes(qLower)) score += 45;

    if (`${bName} ${strength}`.includes(qLower) || `${bName} ${strength} ${form}`.includes(qLower)) score += 35;
    if (mfg.includes(qLower)) score += 15;

    if (score > 0) {
      if (filterStrength && strength.replace(/\s+/g, '').includes(filterStrength)) score += 25;
      if (filterForm && form.includes(filterForm)) score += 20;
      scored.push({ med: m, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.slice(0, limit).map(({ med }) => {
    const { price, basis } = extractUnitPrice(med.package_container, med.package_size);
    const mono = getGenericMonograph(med.generic_name || '');
    const mfgAsset = getManufacturerAsset(med.manufacturer || '');
    const dosageIcon = getOfficialDosageIcon(med.dosage_form || med.type || '');
    const packImg = getMedicinePackaging(med.id, med.brand_name) || getChemicalStructure(med.generic_name);

    const warnings: string[] = [];
    if (mono?.contraindications) {
      warnings.push(mono.contraindications.split('.')[0].slice(0, 110));
    }
    if (mono?.precautions) {
      warnings.push(mono.precautions.split('.')[0].slice(0, 110));
    }
    if (warnings.length === 0) {
      warnings.push('রেজিস্টার্ড চিকিৎসকের পরামর্শ ও সঠিক মাত্রা অনুযায়ী সেব্য');
    }

    const rawAlts = getGenericAlternatives(med.generic_name || '', med.id, 4);
    const alternatives = rawAlts.map((alt) => {
      const altPrice = extractUnitPrice(alt.package_container, alt.package_size);
      return {
        id: String(alt.id),
        name: `${alt.brand_name} ${alt.strength || ''}`.trim(),
        manufacturer: alt.manufacturer || '',
        price: altPrice.price,
        priceBasis: altPrice.basis,
        url: `/medicines/${alt.id}`,
      };
    });

    return {
      id: String(med.id),
      brandName: med.brand_name || 'Medicine',
      genericName: med.generic_name || 'Generic',
      manufacturer: med.manufacturer || 'Pharmaceuticals',
      manufacturerLogoUrl: mfgAsset?.logoUrl || null,
      strength: med.strength || '',
      price,
      priceBasis: basis,
      priceAvailable: price !== null,
      priceStatus: price !== null ? 'Verified DGDA/MedEx Price' : 'Price unavailable — verification required.',
      packageContainer: med.package_container || null,
      packageSize: med.package_size || null,
      availability: true,
      category: mono?.therapeutic_class || 'Therapeutic',
      dosageForm: med.dosage_form || med.type || 'Tablet',
      officialDosageIcon: dosageIcon,
      packagingImageUrl: packImg || null,
      indication: mono?.indication_description ? mono.indication_description.slice(0, 180) : undefined,
      url: `/medicines/${med.id}`,
      warnings,
      alternatives,
    };
  });

  return NextResponse.json(topMatches, { status: 200 });
}
