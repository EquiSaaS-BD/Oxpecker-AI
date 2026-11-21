import {
  getCatalogMedicines,
  getGenericMonograph,
  normalizePackageSize,
} from "@/lib/medicine-catalog";
import {
  getOfficialDosageIcon,
  getMedicinePackaging,
  getManufacturerAsset,
} from "@/lib/medicine-brand-assets";

export interface IndexedMedicine {
  item: any;
  nameLower: string;
  genericLower: string;
  companyLower: string;
  useForLower: string;
}

const g = globalThis as typeof globalThis & {
  __oxpeckerIndexedMedicines?: IndexedMedicine[];
  __oxpeckerIndexedGeneratedAt?: string | null;
};

function determineCategory(genericName: string, therapeuticClass?: string): string {
  const generic = `${genericName || ""} ${therapeuticClass || ""}`.toLowerCase();

  if (
    [
      "omeprazole",
      "pantoprazole",
      "esomeprazole",
      "rabeprazole",
      "dexlansoprazole",
      "famotidine",
      "ranitidine",
      "antacid",
      "alginate",
      "simethicone",
      "sucralfate",
      "proton pump",
      "ulcer",
      "domperidone",
      "ondansetron",
    ].some((k) => generic.includes(k))
  ) {
    return "Gastric";
  }

  if (
    [
      "paracetamol",
      "ibuprofen",
      "diclofenac",
      "ketorolac",
      "naproxen",
      "tramadol",
      "mefenamic",
      "aceclofenac",
      "etoricoxib",
      "celecoxib",
      "indomethacin",
      "aspirin",
      "meloxicam",
      "analgesic",
      "nsaid",
      "antipyretic",
      "tolfenamic",
    ].some((k) => generic.includes(k))
  ) {
    return "Painkiller";
  }

  if (
    [
      "amoxicillin",
      "azithromycin",
      "cefixime",
      "cefuroxime",
      "ciprofloxacin",
      "ceftriaxone",
      "levofloxacin",
      "metronidazole",
      "doxycycline",
      "flucloxacillin",
      "meropenem",
      "cefadroxil",
      "ceftibuten",
      "cefpodoxime",
      "cefdinir",
      "cephradine",
      "cefaclor",
      "ceftazidime",
      "cefepime",
      "clarithromycin",
      "erythromycin",
      "clindamycin",
      "linezolid",
      "vancomycin",
      "gentamicin",
      "amikacin",
      "nitrofurantoin",
      "cotrimoxazole",
      "penicillin",
      "ampicillin",
      "cephalosporin",
      "antibiotic",
      "macrolide",
      "quinolone",
      "tetracycline",
    ].some((k) => generic.includes(k))
  ) {
    return "Antibiotic";
  }

  if (
    [
      "cetirizine",
      "fexofenadine",
      "loratadine",
      "montelukast",
      "rupatadine",
      "bilastine",
      "levocetirizine",
      "desloratadine",
      "salbutamol",
      "budesonide",
      "fluticasone",
      "doxofylline",
      "theophylline",
      "aminophylline",
      "antihistamine",
      "bronchodilator",
      "asthma",
      "ketotifen",
      "ebastine",
    ].some((k) => generic.includes(k))
  ) {
    return "Allergy";
  }

  if (
    [
      "vitamin",
      "calcium",
      "zinc",
      "ascorbic acid",
      "magnesium",
      "cholecalciferol",
      "iron",
      "ferrous",
      "folic acid",
      "multivitamin",
      "cyanocobalamin",
      "mecobalamin",
      "thiamine",
      "riboflavin",
      "pyridoxine",
      "tocopherol",
      "calcitriol",
      "mineral",
      "amino acid",
    ].some((k) => generic.includes(k))
  ) {
    return "Vitamins";
  }

  if (
    [
      "metformin",
      "sitagliptin",
      "linagliptin",
      "glimepiride",
      "gliclazide",
      "empagliflozin",
      "dapagliflozin",
      "vildagliptin",
      "losartan",
      "valsartan",
      "olmesartan",
      "telmisartan",
      "amlodipine",
      "cilnidipine",
      "bisoprolol",
      "atorvastatin",
      "rosuvastatin",
      "clopidogrel",
      "insulin",
      "atenolol",
      "nebivolol",
      "carvedilol",
      "ramipril",
      "enalapril",
      "nitroglycerin",
      "trimetazidine",
      "statin",
      "beta-blocker",
      "hypertension",
    ].some((k) => generic.includes(k))
  ) {
    return "Cardiac";
  }

  return "Other";
}

function getUseFor(
  category: string,
  generic: string,
  monographIndication?: string,
  therapeuticClass?: string
): string {
  if (monographIndication && monographIndication.trim()) {
    const cleanInd = monographIndication.trim();
    if (cleanInd.toLowerCase() === "urethritis" && category === "Antibiotic") {
      return "Bacterial Infections";
    }
    if (cleanInd.toLowerCase() !== (generic || "").toLowerCase()) {
      return cleanInd;
    }
  }
  switch (category) {
    case "Gastric":
      return "Acidity & Ulcer";
    case "Painkiller":
      return "Fever & Pain Relief";
    case "Antibiotic":
      return "Bacterial Infections";
    case "Allergy":
      return "Asthma & Allergies";
    case "Vitamins":
      return "Nutritional Deficiencies";
    case "Cardiac":
      return "Heart & Blood Pressure";
    default:
      return therapeuticClass?.trim() || "Clinical Prescription Care";
  }
}

export function loadIndexedMedicines(): IndexedMedicine[] {
  try {
    const catalog = getCatalogMedicines();
    if (
      g.__oxpeckerIndexedMedicines &&
      g.__oxpeckerIndexedMedicines.length > 0 &&
      catalog.generatedAt === g.__oxpeckerIndexedGeneratedAt
    ) {
      return g.__oxpeckerIndexedMedicines;
    }

    const genericMetaCache = new Map<
      string,
      {
        monograph: ReturnType<typeof getGenericMonograph>;
        category: string;
        useFor: string;
        indicationShort: string | null;
      }
    >();
    const assetCache = new Map<string, string | null>();
    const iconCache = new Map<string, string>();
    const pkgCache = new Map<string, string>();

    const indexed = (catalog.data || []).map((med: any) => {
      const genericName = med.generic_name || "";
      let genMeta = genericMetaCache.get(genericName);
      if (!genMeta) {
        const monograph = getGenericMonograph(genericName);
        const category = determineCategory(
          genericName,
          monograph?.therapeutic_class || monograph?.drug_class
        );
        const useFor = getUseFor(
          category,
          genericName,
          monograph?.indication,
          monograph?.therapeutic_class || monograph?.drug_class
        );
        const rawDesc = monograph?.indication_description || null;
        const indicationShort = rawDesc
          ? rawDesc.length > 360
            ? `${rawDesc.slice(0, 357)}...`
            : rawDesc
          : null;
        genMeta = { monograph, category, useFor, indicationShort };
        genericMetaCache.set(genericName, genMeta);
      }

      const manufacturerKey = med.manufacturer || "";
      let manufacturerLogoUrl = assetCache.get(manufacturerKey);
      if (manufacturerLogoUrl === undefined) {
        manufacturerLogoUrl = manufacturerKey
          ? getManufacturerAsset(manufacturerKey)?.logoUrl || null
          : null;
        assetCache.set(manufacturerKey, manufacturerLogoUrl);
      }

      const dosageKey = med.dosage_form || med.type || "";
      let dosageIcon = iconCache.get(dosageKey);
      if (dosageIcon === undefined) {
        dosageIcon = getOfficialDosageIcon(dosageKey);
        iconCache.set(dosageKey, dosageIcon);
      }

      const rawPkg = String(med.package_size || "");
      let packageSize = pkgCache.get(rawPkg);
      if (packageSize === undefined) {
        packageSize = normalizePackageSize(rawPkg) || "";
        pkgCache.set(rawPkg, packageSize);
      }

      const unitPriceMatch = String(med.package_container || "").match(
        /Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i
      );
      const unitPrice = unitPriceMatch
        ? Number(unitPriceMatch[1].replace(/,/g, ""))
        : null;
      const packagePriceMatch =
        rawPkg.match(/৳\s*([\d,]+(?:\.\d{1,2})?)/) ||
        String(med.package_container || "").match(
          /(?:pack|bottle|box|strip)[^৳]*৳\s*([\d,]+(?:\.\d{1,2})?)/i
        );
      const packagePrice = packagePriceMatch
        ? Number(packagePriceMatch[1].replace(/,/g, ""))
        : null;

      const name = med.brand_name || "Unknown";
      const generic = genericName || "Unknown Generic";
      const company = manufacturerKey || "Unknown Manufacturer";
      const { monograph, category, useFor, indicationShort } = genMeta;

      const resolvedPrice =
        Number.isFinite(unitPrice) && unitPrice! > 0
          ? unitPrice
          : Number.isFinite(packagePrice) && packagePrice! > 0
          ? packagePrice
          : null;
      const resolvedBasis =
        Number.isFinite(unitPrice) && unitPrice! > 0
          ? "unit"
          : Number.isFinite(packagePrice) && packagePrice! > 0
          ? "package"
          : null;

      const item = {
        id: med.id.toString(),
        name,
        generic,
        company,
        strength: med.strength || "",
        price: resolvedPrice,
        priceBasis: resolvedBasis,
        unitPrice:
          Number.isFinite(unitPrice) && unitPrice! > 0 ? unitPrice : null,
        packagePrice:
          Number.isFinite(packagePrice) && packagePrice! > 0
            ? packagePrice
            : null,
        packageSize: packageSize || null,
        packageContainer: med.package_container || "",
        type: med.dosage_form || "Tablet",
        drugType: med.type || "allopathic",
        slug: med.slug || "",
        category,
        useFor,
        indication: monograph?.indication || null,
        indicationDescription: indicationShort,
        fullIndicationDescription: monograph?.indication_description || null,
        drugClass: monograph?.drug_class || monograph?.therapeutic_class || null,
        image: getMedicinePackaging(med.id, med.brand_name) || null,
        dosageIcon,
        manufacturerLogoUrl,
      };

      return {
        item,
        nameLower: name.toLowerCase(),
        genericLower: generic.toLowerCase(),
        companyLower: company.toLowerCase(),
        useForLower: useFor ? useFor.toLowerCase() : "",
      };
    });

    g.__oxpeckerIndexedMedicines = indexed;
    g.__oxpeckerIndexedGeneratedAt = catalog.generatedAt;
    return indexed;
  } catch (error) {
    console.error("[Medicine Index] Error loading medicines:", error);
    return [];
  }
}

export function warmMedicinesDatabase(): number {
  return loadIndexedMedicines().length;
}
