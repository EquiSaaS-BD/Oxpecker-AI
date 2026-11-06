/**
 * Prescription Cost Savings & Generic Substitution Engine
 * Designed for YuNet Social Business & Universal Healthcare Access in Bangladesh
 */

export interface PrescribedMedicineForSavings {
  id: string | number;
  brand_name: string;
  generic_name: string;
  dosage_form?: string;
  strength?: string;
  manufacturer?: string;
  unit_price_bdt?: number | null;
  package_size?: string;
  package_container?: string;
  quantity?: number; // Number of units or days (defaults to 10 if not provided)
}

export interface GenericAlternativeOption {
  id: string | number;
  brand_name: string;
  manufacturer: string;
  unit_price_bdt: number;
  savingsPerUnitBdt: number;
  savingsTotalBdt: number;
  isTopTierManufacturer: boolean;
}

export interface MedicineSavingsDetail {
  prescribedMedicine: PrescribedMedicineForSavings;
  currentUnitPrice: number | null;
  currentTotalCost: number;
  bestAlternative: GenericAlternativeOption | null;
  potentialSavingsBdt: number;
  hasCheaperAlternative: boolean;
}

export interface PrescriptionSavingsReport {
  currentTotalCostBdt: number;
  optimizedTotalCostBdt: number;
  totalSavingsBdt: number;
  savingsPercentage: number;
  items: MedicineSavingsDetail[];
  highSavingsFound: boolean;
  currencySymbol: string;
}

// Trusted high-GMP manufacturers in Bangladesh
export const TOP_BANGLADESH_MANUFACTURERS = [
  "square pharmaceuticals plc",
  "beximco pharmaceuticals ltd.",
  "incepta pharmaceuticals ltd.",
  "renata limited",
  "opsonin pharma limited",
  "eskayef pharmaceuticals ltd.",
  "acme laboratories ltd.",
  "aristopharma ltd.",
  "healthcare pharmaceuticals ltd.",
  "radiant pharmaceuticals ltd.",
  "popular pharmaceuticals ltd.",
  "ibn sina pharmaceutical ind. ltd.",
  "drug international ltd.",
  "edruc limited"
];

function parseUnitPrice(med: PrescribedMedicineForSavings): number | null {
  if (med.unit_price_bdt && Number.isFinite(med.unit_price_bdt) && med.unit_price_bdt > 0) {
    return med.unit_price_bdt;
  }
  const match = (med.package_container || "").match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (match) {
    const val = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(val) && val > 0) return val;
  }
  const packMatch = (med.package_size || "").match(/৳\s*([\d,]+(?:\.\d{1,2})?)/);
  if (packMatch) {
    const val = Number(packMatch[1].replace(/,/g, ""));
    if (Number.isFinite(val) && val > 0) return val;
  }
  return null;
}

/**
 * Calculate comprehensive prescription savings given a list of medicines and the catalog of available alternatives.
 */
export function calculatePrescriptionSavings(
  prescribedMedicines: PrescribedMedicineForSavings[],
  allCatalogMedicines: any[] = []
): PrescriptionSavingsReport {
  let currentTotal = 0;
  let optimizedTotal = 0;
  const items: MedicineSavingsDetail[] = [];

  for (const med of prescribedMedicines) {
    const unitPrice = parseUnitPrice(med);
    const qty = med.quantity && med.quantity > 0 ? med.quantity : 14; // Default standard 2-week course (14 units)
    const currentItemTotal = unitPrice ? unitPrice * qty : 0;
    currentTotal += currentItemTotal;

    const targetGeneric = (med.generic_name || "").toLowerCase().trim();
    const targetForm = (med.dosage_form || "").toLowerCase().trim();
    const targetStrength = (med.strength || "").toLowerCase().trim();

    let bestAlt: GenericAlternativeOption | null = null;

    if (targetGeneric && allCatalogMedicines && allCatalogMedicines.length > 0) {
      // Find all matching medicines with same generic and strength
      const candidates = allCatalogMedicines.filter(c => {
        if (!c.brand_name || String(c.id) === String(med.id)) return false;
        const cGen = (c.generic_name || "").toLowerCase().trim();
        if (cGen !== targetGeneric) return false;
        
        // Optional strength match
        if (targetStrength && c.strength) {
          const cStr = c.strength.toLowerCase().trim();
          if (cStr !== targetStrength) return false;
        }

        // Dosage form match (e.g. tablet with tablet, capsule with capsule)
        if (targetForm && c.dosage_form) {
          const cForm = c.dosage_form.toLowerCase().trim();
          if (targetForm.includes("tab") && !cForm.includes("tab")) return false;
          if (targetForm.includes("cap") && !cForm.includes("cap")) return false;
        }

        return true;
      });

      // Find candidates with verified unit price
      const validCandidates: Array<{ med: any; price: number; isTop: boolean }> = [];
      for (const cand of candidates) {
        const cPrice = parseUnitPrice(cand);
        if (cPrice && cPrice > 0) {
          const mfg = (cand.manufacturer || "").toLowerCase().trim();
          const isTop = TOP_BANGLADESH_MANUFACTURERS.some(t => mfg.includes(t) || t.includes(mfg));
          validCandidates.push({ med: cand, price: cPrice, isTop });
        }
      }

      // Sort by price ascending, prioritizing top tier manufacturers
      validCandidates.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        return a.price - b.price;
      });

      // If the cheapest valid alternative is cheaper than current unit price
      if (unitPrice && validCandidates.length > 0 && validCandidates[0].price < unitPrice) {
        const cheapest = validCandidates[0];
        const diff = unitPrice - cheapest.price;
        bestAlt = {
          id: cheapest.med.id,
          brand_name: cheapest.med.brand_name,
          manufacturer: cheapest.med.manufacturer || "Certified DGDA Manufacturer",
          unit_price_bdt: cheapest.price,
          savingsPerUnitBdt: Number(diff.toFixed(2)),
          savingsTotalBdt: Number((diff * qty).toFixed(2)),
          isTopTierManufacturer: cheapest.isTop
        };
      }
    }

    if (bestAlt) {
      optimizedTotal += bestAlt.unit_price_bdt * qty;
    } else {
      optimizedTotal += currentItemTotal;
    }

    const itemSavings = bestAlt ? bestAlt.savingsTotalBdt : 0;
    items.push({
      prescribedMedicine: med,
      currentUnitPrice: unitPrice,
      currentTotalCost: Number(currentItemTotal.toFixed(2)),
      bestAlternative: bestAlt,
      potentialSavingsBdt: itemSavings,
      hasCheaperAlternative: bestAlt !== null && itemSavings > 0
    });
  }

  const totalSavings = Math.max(0, currentTotal - optimizedTotal);
  const savingsPct = currentTotal > 0 ? (totalSavings / currentTotal) * 100 : 0;

  return {
    currentTotalCostBdt: Number(currentTotal.toFixed(2)),
    optimizedTotalCostBdt: Number(optimizedTotal.toFixed(2)),
    totalSavingsBdt: Number(totalSavings.toFixed(2)),
    savingsPercentage: Number(savingsPct.toFixed(1)),
    items,
    highSavingsFound: totalSavings >= 50,
    currencySymbol: "৳"
  };
}
