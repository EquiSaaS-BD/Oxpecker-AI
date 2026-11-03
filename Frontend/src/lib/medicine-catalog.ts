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
  const packageText = medicine.package_size || "";
  const packageMatch = packageText.match(/৳\s*([\d,]+(?:\.\d{1,2})?)/)
    || (medicine.package_container || "").match(/(?:pack|bottle|box|strip)[^৳]*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (packageMatch) {
    const amount = Number(packageMatch[1].replace(/,/g, ""));
    if (Number.isFinite(amount) && amount > 0) return { amount, basis: "package" };
  }

  const unitMatch = (medicine.package_container || "").match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!unitMatch) return null;
  const amount = Number(unitMatch[1].replace(/,/g, ""));
  return Number.isFinite(amount) && amount > 0 ? { amount, basis: "unit" } : null;
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
    const generic = normalized(item?.genericName || item?.generic);
    const strength = normalized(item?.strength);
    const form = normalized(item?.dosageForm);
    const packageSize = normalizePackageSize(item?.packageSize);
    const brand = normalized(item?.brandName || item?.name);
    if (!generic || !strength || !form || !packageSize) {
      return {
        prescribed: item,
        baselinePrice: null,
        comparablePrices: [],
        status: "insufficient-extracted-details",
      };
    }

    const comparable = catalog.data.filter((candidate) =>
      normalized(candidate.generic_name) === generic
      && normalized(candidate.strength) === strength
      && normalized(candidate.dosage_form) === form
      && normalizePackageSize(candidate.package_size) === packageSize
      && priceDetails(candidate) !== null
    );
    const baseline = comparable.find((candidate) => normalized(candidate.brand_name) === brand);
    const baselineDetails = baseline ? priceDetails(baseline) : null;
    const baselinePrice = baselineDetails?.amount ?? null;
    const alternatives = comparable
      .filter((candidate) => normalized(candidate.brand_name) !== brand)
      .map((candidate) => {
        const details = priceDetails(candidate)!;
        return {
          brandName: candidate.brand_name || "Unknown",
          manufacturer: candidate.manufacturer || "Unknown",
          price: details.amount,
          priceBasis: details.basis,
          savings: baselinePrice === null || baselineDetails?.basis !== details.basis
            ? null
            : Number((baselinePrice - details.amount).toFixed(2)),
          generic: candidate.generic_name,
          strength: candidate.strength,
          dosageForm: candidate.dosage_form,
          packageSize: candidate.package_size,
        };
      })
      .filter((candidate) => candidate.savings === null || candidate.savings > 0)
      .sort((a, b) => a.price - b.price);

    return {
      prescribed: item,
      baselinePrice,
      baselinePriceBasis: baselineDetails?.basis ?? null,
      comparablePrices: alternatives,
      status: metadata.freshness === "recent"
        ? alternatives.length ? "matched" : "no-exact-package-match"
        : alternatives.length ? "historical-snapshot-match" : "no-exact-package-match",
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
  return catalog.data.find(m => String(m.id).toLowerCase() === idStr || String(m.slug || '').toLowerCase() === idStr) || null;
}

export function getGenericAlternatives(genericName: string, excludeId: string | number, limit: number = 6) {
  const catalog = loadCatalog();
  const normalizedGen = normalized(genericName);
  if (!normalizedGen) return [];
  const idStr = String(excludeId);
  return catalog.data
    .filter(m => String(m.id) !== idStr && normalized(m.generic_name) === normalizedGen)
    .slice(0, limit);
}
