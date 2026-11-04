import fs from "fs";
import path from "path";

type CatalogMedicine = {
  id: number | string;
  brand_name?: string;
  generic_name?: string;
  strength?: string;
  dosage_form?: string;
  manufacturer?: string;
  package_container?: string;
  package_size?: string;
  type?: string;
  slug?: string;
};

export type GenericMonograph = {
  id: number | string;
  name: string;
  slug?: string;
  monograph_link?: string;
  drug_class?: string;
  indication?: string;
  indication_description?: string;
  therapeutic_class?: string;
  pharmacology?: string;
  dosage?: string;
  administration?: string;
  interaction?: string;
  contraindications?: string;
  side_effects?: string;
  pregnancy_and_lactation?: string;
  precautions?: string;
  pediatric_usage?: string;
  overdose_effects?: string;
  duration_of_treatment?: string;
  reconstitution?: string;
  storage_conditions?: string;
};

let cachedCatalog: { generatedAt: string | null; data: CatalogMedicine[] } | null = null;
let cachedCatalogMtime = 0;

function loadCatalog(): { generatedAt: string | null; data: CatalogMedicine[] } {
  const paths = [
    path.join(process.cwd(), "public/data/medicines.json"),
    path.join(process.cwd(), "organized_medicine_data/organized/medicines.json"),
    path.join(process.cwd(), "../organized_medicine_data/organized/medicines.json"),
  ];
  const file = paths.find((candidate) => fs.existsSync(candidate));
  if (!file) return { generatedAt: null, data: [] };
  const mtime = fs.statSync(file).mtimeMs;
  if (cachedCatalog && cachedCatalogMtime === mtime) return cachedCatalog;
  const contents = JSON.parse(fs.readFileSync(file, "utf8"));
  cachedCatalog = { generatedAt: contents.generated_at || null, data: contents.data || [] };
  cachedCatalogMtime = mtime;
  return cachedCatalog;
}

let cachedGenericsMap: Map<string, GenericMonograph> | null = null;
let cachedGenericsMtime = 0;

function loadGenerics(): Map<string, GenericMonograph> {
  const paths = [
    path.join(process.cwd(), "public/data/generics.json"),
    path.join(process.cwd(), "organized_medicine_data/organized/generics.json"),
    path.join(process.cwd(), "../organized_medicine_data/organized/generics.json"),
  ];
  const file = paths.find((candidate) => fs.existsSync(candidate));
  if (!file) return new Map();
  const mtime = fs.statSync(file).mtimeMs;
  if (cachedGenericsMap && cachedGenericsMtime === mtime) return cachedGenericsMap;

  try {
    const raw = fs.readFileSync(file, "utf8");
    const contents = JSON.parse(raw);
    const list: GenericMonograph[] = contents.data || contents || [];
    const map = new Map<string, GenericMonograph>();

    for (const g of list) {
      if (g.name) {
        const norm = normalized(g.name);
        map.set(norm, g);

        // Strip common salt suffixes for relaxed lookup
        const baseName = norm
          .replace(/\s+(monohydrate|trihydrate|hydrochloride|magnesium|sodium|potassium|fumarate|succinate|besylate|maleate|sulfate|phosphate)\b/g, "")
          .trim();
        if (baseName && !map.has(baseName)) {
          map.set(baseName, g);
        }
      }
    }
    cachedGenericsMap = map;
    cachedGenericsMtime = mtime;
    return cachedGenericsMap;
  } catch (err) {
    console.error("Failed to load generics catalog:", err);
    return new Map();
  }
}

function normalized(value: unknown): string {
  return String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePackageSize(value: unknown): string {
  return normalized(value)
    .replace(/\(?\s*৳\s*[\d,]+(?:\.\d{1,2})?\)?/g, "")
    .replace(/[():]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function priceDetails(medicine: CatalogMedicine): { amount: number; basis: "unit" | "package" } | null {
  const unitMatch = (medicine.package_container || "").match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (unitMatch) {
    const amount = Number(unitMatch[1].replace(/,/g, ""));
    if (Number.isFinite(amount) && amount > 0) return { amount, basis: "unit" };
  }

  const packageText = medicine.package_size || "";
  const packageMatch =
    packageText.match(/৳\s*([\d,]+(?:\.\d{1,2})?)/) ||
    (medicine.package_container || "").match(/(?:pack|bottle|box|strip)[^৳]*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (packageMatch) {
    const amount = Number(packageMatch[1].replace(/,/g, ""));
    if (Number.isFinite(amount) && amount > 0) return { amount, basis: "package" };
  }

  return null;
}

export function getMedicineSnapshotMetadata() {
  const catalog = loadCatalog();
  const generatedMs = catalog.generatedAt ? Date.parse(catalog.generatedAt) : Number.NaN;
  const ageDays = Number.isFinite(generatedMs)
    ? Math.max(0, Math.floor((Date.now() - generatedMs) / 86_400_000))
    : null;
  return {
    source: "MedEx Bangladesh catalog snapshot",
    generatedAt: catalog.generatedAt,
    ageDays,
    freshness: ageDays === null ? "unknown" : ageDays > 30 ? "stale" : "recent",
  };
}

export function comparePrescriptionPrices(parsed: unknown) {
  const catalog = loadCatalog();
  const metadata = getMedicineSnapshotMetadata();
  const medicines = (parsed as { medicines?: unknown } | null)?.medicines;
  if (!Array.isArray(medicines)) return { snapshot: metadata, matches: [] };

  const matches = medicines.map((item: any) => {
    const rawBrand = normalized(item?.brandName || item?.name)
      .replace(/^(?:tab(?:let)?s?|cap(?:sule)?s?|syp|syrup|susp(?:ension)?|inj(?:ection)?)\.?\s+/i, "")
      .trim();
    let generic = normalized(item?.genericName || item?.generic);
    let strength = normalized(item?.strength);
    let form = normalized(item?.dosageForm);
    const packageSize = normalizePackageSize(item?.packageSize);

    // Resolve baseline record by brand if generic/strength/form were not explicitly written on prescription
    let baseline = catalog.data.find((candidate) => {
      if (normalized(candidate.brand_name) !== rawBrand) return false;
      if (strength && normalized(candidate.strength).replace(/\s+/g, "") !== strength.replace(/\s+/g, "")) return false;
      if (form && !normalized(candidate.dosage_form).includes(form) && !form.includes(normalized(candidate.dosage_form))) return false;
      return true;
    });

    if (!baseline && rawBrand) {
      baseline = catalog.data.find((candidate) => normalized(candidate.brand_name) === rawBrand);
    }

    if (baseline) {
      if (!generic) generic = normalized(baseline.generic_name);
      if (!strength) strength = normalized(baseline.strength);
      if (!form) form = normalized(baseline.dosage_form);
    }

    if (!generic || !strength) {
      return {
        prescribed: item,
        baselinePrice: null,
        comparablePrices: [],
        status: "insufficient-extracted-details",
      };
    }

    const normStrengthCompact = strength.replace(/\s+/g, "");
    const comparable = catalog.data.filter((candidate) => {
      if (normalized(candidate.generic_name) !== generic) return false;
      if (normalized(candidate.strength).replace(/\s+/g, "") !== normStrengthCompact) return false;
      if (form && normalized(candidate.dosage_form) !== form && !normalized(candidate.dosage_form).includes(form)) return false;
      if (packageSize && normalizePackageSize(candidate.package_size) !== packageSize) return false;
      return priceDetails(candidate) !== null;
    });

    if (!baseline) {
      baseline = comparable.find((candidate) => normalized(candidate.brand_name) === rawBrand);
    }
    const baselineDetails = baseline ? priceDetails(baseline) : null;
    const baselinePrice = baselineDetails?.amount ?? null;

    const alternatives = comparable
      .filter((candidate) => normalized(candidate.brand_name) !== rawBrand)
      .map((candidate) => {
        const details = priceDetails(candidate)!;
        return {
          id: String(candidate.id),
          brandName: candidate.brand_name || "Unknown",
          manufacturer: candidate.manufacturer || "Unknown",
          price: details.amount,
          priceBasis: details.basis,
          savings:
            baselinePrice === null || baselineDetails?.basis !== details.basis
              ? null
              : Number((baselinePrice - details.amount).toFixed(2)),
          generic: candidate.generic_name,
          strength: candidate.strength,
          dosageForm: candidate.dosage_form,
          packageSize: candidate.package_size,
        };
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 8);

    return {
      prescribed: item,
      baselinePrice,
      baselinePriceBasis: baselineDetails?.basis ?? null,
      comparablePrices: alternatives,
      status:
        metadata.freshness === "recent"
          ? alternatives.length
            ? "matched"
            : "no-exact-package-match"
          : alternatives.length
            ? "historical-snapshot-match"
            : "no-exact-package-match",
    };
  });

  return { snapshot: metadata, matches };
}

export function getGenericMonograph(genericName: string): GenericMonograph | null {
  if (!genericName) return null;
  const map = loadGenerics();
  const norm = normalized(genericName);
  if (map.has(norm)) return map.get(norm)!;

  const baseName = norm
    .replace(/\s+(monohydrate|trihydrate|hydrochloride|magnesium|sodium|potassium|fumarate|succinate|besylate|maleate|sulfate|phosphate)\b/g, "")
    .trim();
  if (map.has(baseName)) return map.get(baseName)!;

  for (const [key, value] of map.entries()) {
    if (key.length > 4 && (key.includes(norm) || norm.includes(key))) {
      return value;
    }
  }

  return null;
}

export function getCatalogMedicines() {
  return loadCatalog();
}

export function getMedicineById(id: string | number) {
  const catalog = loadCatalog();
  const idStr = String(id).trim().toLowerCase();
  return (
    catalog.data.find(
      (m) => String(m.id).toLowerCase() === idStr || String(m.slug || "").toLowerCase() === idStr
    ) || null
  );
}

export function getGenericAlternatives(genericName: string, excludeId: string | number, limit: number = 6) {
  const catalog = loadCatalog();
  const normalizedGen = normalized(genericName);
  if (!normalizedGen) return [];
  const idStr = String(excludeId);
  return catalog.data
    .filter((m) => String(m.id) !== idStr && normalized(m.generic_name) === normalizedGen)
    .slice(0, limit);
}

export type IndicationItem = {
  id: number | string;
  name: string;
  slug?: string;
  generics_count?: number;
};

export type DrugClassItem = {
  id: number | string;
  name: string;
  slug?: string;
  generics_count?: number;
};

export type DosageFormItem = {
  id: number | string;
  name: string;
  slug?: string;
  brand_names_count?: number;
};

export type ManufacturerItem = {
  id: number | string;
  name: string;
  slug?: string;
  generics_count?: number;
  brand_names_count?: number;
};

let cachedIndications: IndicationItem[] | null = null;
export function getIndicationsCatalog(): IndicationItem[] {
  if (cachedIndications) return cachedIndications;
  try {
    const p = path.join(process.cwd(), "public/data/indications.json");
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      cachedIndications = d.data || d || [];
      return cachedIndications!;
    }
  } catch {}
  return [];
}

let cachedDrugClasses: DrugClassItem[] | null = null;
export function getDrugClassesCatalog(): DrugClassItem[] {
  if (cachedDrugClasses) return cachedDrugClasses;
  try {
    const p = path.join(process.cwd(), "public/data/drug_classes.json");
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      cachedDrugClasses = d.data || d || [];
      return cachedDrugClasses!;
    }
  } catch {}
  return [];
}

let cachedDosageForms: DosageFormItem[] | null = null;
export function getDosageFormsCatalog(): DosageFormItem[] {
  if (cachedDosageForms) return cachedDosageForms;
  try {
    const p = path.join(process.cwd(), "public/data/dosage_forms.json");
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      cachedDosageForms = d.data || d || [];
      return cachedDosageForms!;
    }
  } catch {}
  return [];
}

let cachedManufacturers: ManufacturerItem[] | null = null;
export function getManufacturersCatalog(): ManufacturerItem[] {
  if (cachedManufacturers) return cachedManufacturers;
  try {
    const p = path.join(process.cwd(), "public/data/manufacturers.json");
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      cachedManufacturers = d.data || d || [];
      return cachedManufacturers!;
    }
  } catch {}
  return [];
}

export function findIndicationByName(query: string): IndicationItem | null {
  if (!query) return null;
  const list = getIndicationsCatalog();
  const qNorm = normalized(query);
  return list.find((item) => normalized(item.name) === qNorm || normalized(item.name).includes(qNorm)) || null;
}

